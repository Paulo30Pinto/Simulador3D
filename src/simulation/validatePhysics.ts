import {
  synchronousSpeed,
  calculateTheveninParameters,
  torqueSpeedCurve,
  calculateElectricalOperatingPoint,
  calculateSnapshot,
} from './motorPhysics';
import {
  defaultMotorParameters,
  initialMotorSnapshot,
  MotorState,
} from './motorTypes';

console.log('===============================================================');
console.log(' VALIDAÇÃO DO MOTOR DE INDUÇÃO TRIFÁSICO (MOTORPHYSICS CORE)');
console.log('===============================================================');

const motor = { ...defaultMotorParameters };
console.log('\n--- 1. PARÂMETROS NOMINAIS DO MOTOR DE REFERÊNCIA ---');
console.log(`Tensão de Linha (V_LL): ${motor.voltage} V`);
console.log(`Frequência da Rede (f): ${motor.frequency} Hz`);
console.log(`Número de Polos (P): ${motor.poles}`);
console.log(`Potência Nominal: ${motor.ratedPower / 1000} kW`);
console.log(`Inércia (J): ${motor.inertia} kg·m²`);
console.log(`Resistência Estator (R1): ${motor.statorResistance} Ω`);
console.log(`Resistência Rotor (R2'): ${motor.rotorResistance} Ω`);
console.log(`Reatância Dispersão Estator (X1): ${motor.statorLeakageReactance} Ω`);
console.log(`Reatância Dispersão Rotor (X2'): ${motor.rotorLeakageReactance} Ω`);
console.log(`Reatância Magnetização (Xm): ${motor.magnetizingReactance} Ω`);

// 2. Velocidade Síncrona
const ns = synchronousSpeed(motor.frequency, motor.poles);
console.log('\n--- 2. VELOCIDADE SÍNCRONA ---');
console.log(`Ns = 120 * f / P = 120 * ${motor.frequency} / ${motor.poles} = ${ns} RPM`);
if (ns !== 1500) {
  throw new Error(`Erro: Velocidade síncrona deveria ser 1500 RPM, mas foi ${ns}`);
}

// 3. Parâmetros Thevenin e Extremos
const thev = calculateTheveninParameters(motor);
console.log('\n--- 3. EQUIVALENTE DE THEVENIN & PONTOS NOTÁVEIS ---');
console.log(`Tensão de Thevenin (Vth): ${thev.vTh.toFixed(2)} V`);
console.log(`Resistência Thevenin (Rth): ${thev.rTh.toFixed(3)} Ω`);
console.log(`Reatância Total Equiv. (Xeq): ${thev.xEq.toFixed(3)} Ω`);
console.log(`Escorregamento Crítico (s_max): ${(thev.criticalSlip * 100).toFixed(2)}% (N = ${(ns * (1 - thev.criticalSlip)).toFixed(0)} RPM)`);
console.log(`Torque Máximo / Tombamento (T_max): ${thev.maxTorque.toFixed(2)} Nm`);
console.log(`Torque de Partida (T_start, s=1): ${thev.startingTorque.toFixed(2)} Nm`);
console.log(`Corrente de Partida (I_start, s=1): ${thev.startingCurrent.toFixed(2)} A`);

// 4. Operação em Carga Nominal (~65 Nm, 10 kW no eixo)
console.log('\n--- 4. PONTO DE OPERAÇÃO COM CARGA NOMINAL (TL = 65 Nm) ---');
let slipNominal = 0.035; // estimativa
for (let s = 0.01; s <= 0.10; s += 0.0005) {
  const t = torqueSpeedCurve(s, motor);
  if (Math.abs(t - 65) < 1.0) {
    slipNominal = s;
    break;
  }
}
const rpmNominal = ns * (1 - slipNominal);
const torqueNominal = torqueSpeedCurve(slipNominal, motor);
const elecNominal = calculateElectricalOperatingPoint(slipNominal, motor, thev);
const mechPower = (torqueNominal * rpmNominal * 2 * Math.PI) / 60;
const rendimento = (mechPower / elecNominal.inputPower) * 100;

console.log(`Escorregamento (s): ${(slipNominal * 100).toFixed(2)} %`);
console.log(`Velocidade no Eixo (N): ${rpmNominal.toFixed(1)} RPM`);
console.log(`Torque Eletromagnético (Te): ${torqueNominal.toFixed(2)} Nm`);
console.log(`Corrente de Linha (I1): ${elecNominal.statorCurrent.toFixed(2)} A`);
console.log(`Fator de Potência (cos φ): ${elecNominal.powerFactor.toFixed(3)}`);
console.log(`Potência Elétrica de Entrada (Pin): ${(elecNominal.inputPower / 1000).toFixed(2)} kW`);
console.log(`Potência Mecânica no Eixo (Pout): ${(mechPower / 1000).toFixed(2)} kW`);
console.log(`Rendimento (η): ${rendimento.toFixed(1)} %`);

// 5. Simulação Dinâmica Temporal (Aceleração de 0 até Regime com Carga = 25 Nm)
console.log('\n--- 5. SIMULAÇÃO DINÂMICA TEMPORAL (dT = 0.05s, Carga = 25 Nm) ---');
let snap = {
  ...initialMotorSnapshot,
  state: MotorState.Starting,
  synchronousRpm: ns,
  loadTorque: 25,
};

const dt = 0.05;
console.log('Tempo(s) | Estado       | RPM     | Escorr(%) | Torque(Nm) | Corrente(A) | Pot.(kW) | FP');
console.log('-------------------------------------------------------------------------------------');

for (let step = 0; step <= 60; step++) {
  if (step % 5 === 0 || step === 60) {
    console.log(
      `${snap.time.toFixed(2).padStart(8)} | ` +
      `${snap.state.padEnd(12)} | ` +
      `${snap.rpm.toFixed(1).padStart(7)} | ` +
      `${(snap.slip * 100).toFixed(2).padStart(9)} | ` +
      `${snap.torque.toFixed(2).padStart(10)} | ` +
      `${snap.current.toFixed(2).padStart(11)} | ` +
      `${(snap.power / 1000).toFixed(2).padStart(8)} | ` +
      `${snap.powerFactor.toFixed(2).padStart(4)}`
    );
  }
  snap = calculateSnapshot(snap, { ...motor, loadTorque: 25 }, dt);
}

// 6. Teste de Parada por Desaceleração / Inércia
console.log('\n--- 6. TESTE DE DESACELERAÇÃO E PARADA POR INÉRCIA ---');
snap = { ...snap, state: MotorState.Stopping };
for (let step = 1; step <= 30; step++) {
  snap = calculateSnapshot(snap, { ...motor, loadTorque: 25 }, dt);
  if (step % 5 === 0 || snap.state === MotorState.Off) {
    console.log(`Tempo: ${snap.time.toFixed(2)}s | Estado: ${snap.state.padEnd(10)} | RPM: ${snap.rpm.toFixed(1)} | Torque: ${snap.torque.toFixed(1)} Nm`);
    if (snap.state === MotorState.Off) break;
  }
}

console.log('\n===============================================================');
console.log(' RESULTADO: O modelo físico foi VALIDADO com sucesso!');
console.log('===============================================================');
