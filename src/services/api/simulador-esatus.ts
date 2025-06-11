enum MotorState {
    Inicio = 'A',
    InicializarParametros = 'B',
    AguardarComando = 'C',
    IniciarMotor = 'D',
    PararMotor = 'E',
    AtualizarConfiguracoes = 'F',
    CalcularCorrentePartida = 'G',
    AtualizarRPM = 'H',
    CalcularParametros = 'I',
    RegimePermanente = 'K',
    MonitorarParametros = 'L',
    DesacelerarMotor = 'N',
    ZerarParametros = 'O',
    ValidarParametros = 'P',
    AtualizarSimulacao = 'R',
    MostrarErro = 'S',
  }
  
  interface MotorParameters {
    nominalPower: number;
    nominalVoltage: number;
    nominalCurrent: number;
    nominalRPM: number;
  }
  
  export interface SimulationState {
    currentState: MotorState;
    parameters: MotorParameters;
    currentRPM: number;
    currentCurrent: number;
  }