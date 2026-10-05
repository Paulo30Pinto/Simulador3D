import { useMemo, useState } from 'react'
import '@google/model-viewer'
import { MOTOR_PARTS, PHASES, TOOLS, FAULTS, type PhaseId, type ToolId } from './parts/partsData'

const phaseIndex = (phase: PhaseId) => PHASES.findIndex((item) => item.id === phase)

export default function WorkshopGame() {
  const [phase, setPhase] = useState<PhaseId>('explore')
  const [selected, setSelected] = useState('rotor')
  const [powered, setPowered] = useState(false)
  const [tool, setTool] = useState<ToolId>('multimeter')
  const [removed, setRemoved] = useState<string[]>([])
  const [scanned, setScanned] = useState<string[]>([])
  const [message, setMessage] = useState('Selecione uma peça para começar')
  const [fault] = useState(() => FAULTS[Math.floor(Math.random() * FAULTS.length)])
  const [inspectionPulse, setInspectionPulse] = useState<string | null>(null)

  const missionComplete = phase === 'repair' && removed.length === 0
  const symptom = fault.symptom

  const currentOrder = removed.length
  const activePart = useMemo(() => MOTOR_PARTS.find((part) => part.id === selected), [selected])
  const isFaultTarget = phase === 'diagnose' && selected === fault.part

  function selectPart(id: string) {
    setSelected(id)
    setInspectionPulse(id)
    const part = MOTOR_PARTS.find((item) => item.id === id)
    if (!part) return
    if (phase === 'disassemble') {
      if (part.order === currentOrder) {
        setRemoved((items) => [...items, id])
        setMessage('Peça removida')
      } else {
        setMessage('Sequência incorreta')
      }
    } else if (phase === 'diagnose') {
      if (part.id === fault.part && part.diagnosticTool === tool) {
        setScanned((items) => items.includes(id) ? items : [...items, id])
        setMessage('Falha encontrada')
      } else {
        setMessage('Ferramenta incorreta')
      }
    } else if (phase === 'repair') {
      if (removed.length && id === removed[removed.length - 1]) {
        setRemoved((items) => items.slice(0, -1))
        setMessage('Peça encaixada')
      } else setMessage('Siga a sequência')
    } else setMessage(part.name)
  }

  function changePhase(next: PhaseId) {
    setPhase(next)
    setMessage(PHASES.find((item) => item.id === next)?.hint ?? '')
    setInspectionPulse(null)
    if (next === 'explore') setPowered(false)
  }

  function togglePower() {
    if (!powered && !missionComplete && phase === 'repair') {
      setMessage('Finalize a montagem antes do teste')
      return
    }
    setPowered((value) => !value)
    setMessage(powered ? 'Motor desligado' : 'Motor em teste')
  }

  return (
    <main className="workshop-app">
      <header className="topbar">
        <div className="brand-mark"><span>⚡</span><div><strong>WORKSHOP</strong><small>LAB // MOTOR ELÉTRICO</small></div></div>
        <div className="session-status"><i /> SESSÃO AO VIVO <span>•</span> BANCADA 01</div>
        <button className={`power-button ${powered ? 'is-on' : ''}`} onClick={togglePower} aria-label={powered ? 'Desligar motor' : 'Ligar motor'}><span>⏻</span><b>{powered ? 'DESLIGAR' : 'LIGAR'}</b></button>
      </header>

      <div className="game-layout">
        <aside className="phase-rail" aria-label="Fases do jogo">
          <div className="rail-label">PROTOCOLO<br /><strong>04 FASES</strong></div>
          <nav>{PHASES.map((item, index) => <button key={item.id} className={phase === item.id ? 'active' : ''} onClick={() => changePhase(item.id)}><span className="phase-icon">{item.icon}</span><span><small>0{index + 1}</small>{item.label}</span>{index < PHASES.length - 1 && <em />}</button>)}</nav>
          <div className="rail-bottom"><span className="online-dot" /> SISTEMA ONLINE</div>
        </aside>

        <section className="scene-column">
          <div className="scene-header"><div><span className="eyebrow">FASE 0{phaseIndex(phase) + 1} / {PHASES.length}</span><h1>{PHASES.find((item) => item.id === phase)?.label}</h1></div><div className="scene-hint"><span>↗</span>{phase === 'diagnose' ? `SINTOMA: ${symptom}` : message}</div></div>
          <div className={`scene ${powered ? 'running' : ''} ${isFaultTarget ? 'fault-active' : ''}`}>
            <div className="ambient ambient-one" /><div className="ambient ambient-two" />
            <div className="workbench-grid" />
            <div className="scene-tag"><span className="pulse-dot" /> MOTOR ASSÍNCRONO <b>•</b> 3D VIEW</div>
            <model-viewer className="motor-model" src="/assets/elementos3d/motor_eletrico_aberto.glb" alt="Motor elétrico 3D" camera-controls shadow-intensity="1.4" shadow-softness="0.8" exposure="1.1" environment-image="neutral" camera-orbit="25deg 72deg 105%" min-camera-orbit="auto 50deg 75%" max-camera-orbit="auto 90deg 130%" interaction-prompt="none" {...(powered ? { 'auto-rotate': true, 'rotation-per-second': '90deg' } : {})} />
            <div className="model-glow" />
            <div className={`part-hotspot hotspot-cover ${inspectionPulse === 'cover' ? 'is-inspected' : ''}`} onClick={() => selectPart('cover')}><span>◉</span></div><div className={`part-hotspot hotspot-rotor ${inspectionPulse === 'rotor' ? 'is-inspected' : ''}`} onClick={() => selectPart('rotor')}><span>⊙</span></div><div className={`part-hotspot hotspot-coil ${inspectionPulse === 'coil' ? 'is-inspected' : ''}`} onClick={() => selectPart('coil')}><span>≋</span></div>
            {activePart && <div className="floating-label"><span>{activePart.icon}</span><div><b>{activePart.name}</b><small>PEÇA SELECIONADA</small></div></div>}
            {powered && <div className="running-badge"><span>◉</span> MOTOR EM FUNCIONAMENTO</div>}
            {phase === 'diagnose' && <div className={`symptom-badge ${scanned.includes(fault.part) ? 'found' : ''}`}><span>{scanned.includes(fault.part) ? '✓' : '!'}</span> {scanned.includes(fault.part) ? 'FALHA IDENTIFICADA' : 'SINTOMA DETECTADO'}</div>}
          </div>
          <div className="scene-footer"><span>◉ ARRRASTE PARA ORBITAR</span><span>⌕ CLIQUE NAS PEÇAS</span><span>⌗ SCROLL PARA ZOOM</span></div>
        </section>

        <aside className="control-panel">
          <div className="panel-heading"><span>PAINEL DE CONTROLE</span><b>●</b></div>
          <div className="progress-card"><div className="progress-title"><span>PROGRESSO DA FASE</span><strong>{phase === 'disassemble' ? removed.length : phase === 'diagnose' ? scanned.length : phase === 'repair' ? MOTOR_PARTS.length - removed.length : 1}<small> / {MOTOR_PARTS.length}</small></strong></div><div className="progress-bar"><i style={{ width: `${phase === 'disassemble' ? (removed.length / MOTOR_PARTS.length) * 100 : phase === 'diagnose' ? (scanned.length / 1) * 100 : phase === 'repair' ? ((MOTOR_PARTS.length - removed.length) / MOTOR_PARTS.length) * 100 : 18}%` }} /></div></div>
          <div className="panel-section"><div className="section-title">FERRAMENTAS <span>⌄</span></div><div className="tool-grid">{TOOLS.map((item) => <button key={item.id} className={tool === item.id ? 'selected' : ''} onClick={() => { setTool(item.id); setMessage(item.label) }}><span>{item.icon}</span><small>{item.label}</small></button>)}</div></div>
          <div className="panel-section parts-section"><div className="section-title">PEÇAS DO MOTOR <span>{MOTOR_PARTS.length}</span></div><div className="parts-list">{MOTOR_PARTS.map((part) => <button key={part.id} className={`${selected === part.id ? 'selected' : ''} ${removed.includes(part.id) ? 'in-tray' : ''}`} onClick={() => selectPart(part.id)}><span className="part-symbol">{part.icon}</span><span>{part.short}</span><i>{removed.includes(part.id) ? 'TRAY' : selected === part.id ? 'ATIVO' : 'OK'}</i></button>)}</div></div>
          <button className="next-button" onClick={() => changePhase(PHASES[Math.min(phaseIndex(phase) + 1, PHASES.length - 1)].id)}>{phase === 'repair' ? 'FINALIZAR MONTAGEM' : 'AVANÇAR FASE'} <span>→</span></button>
        </aside>
      </div>
    </main>
  )
}
