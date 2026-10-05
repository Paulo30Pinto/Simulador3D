export type PartStatus = 'mounted' | 'tray' | 'faulty'

export type MotorPart = {
  id: string
  name: string
  short: string
  model: string
  order: number
  icon: string
  diagnosticTool?: ToolId
  faulty?: boolean
}

export const MOTOR_PARTS: MotorPart[] = [
  { id: 'cover', name: 'Tampa frontal', short: 'Tampa', model: '/assets/elementos3d/tampa_traseira.glb', order: 0, icon: '◉' },
  { id: 'fan', name: 'Ventoinha', short: 'Ventoinha', model: '/assets/elementos3d/ventilador1.glb', order: 1, icon: '✣' },
  { id: 'rotor', name: 'Rotor', short: 'Rotor', model: '/assets/elementos3d/motor (1).zip', order: 2, icon: '⊙', diagnosticTool: 'stethoscope' },
  { id: 'stator', name: 'Estator', short: 'Estator', model: '/assets/elementos3d/estator.glb', order: 3, icon: '◎', diagnosticTool: 'multimeter' },
  { id: 'coil', name: 'Bobinas', short: 'Bobinas', model: '/assets/elementos3d/bobina_estator.glb', order: 4, icon: '≋', diagnosticTool: 'thermometer' },
  { id: 'bearing', name: 'Rolamentos', short: 'Rolamentos', model: '/assets/elementos3d/ball_bearing.glb', order: 5, icon: '◌', diagnosticTool: 'stethoscope' },
  { id: 'housing', name: 'Carcaça', short: 'Carcaça', model: '/assets/elementos3d/motor_eletrico_minimalista.glb', order: 6, icon: '▣' },
]

export const PHASES = [
  { id: 'explore', label: 'Explorar', icon: '◉', hint: 'Observe o motor' },
  { id: 'disassemble', label: 'Desmontar', icon: '⌁', hint: 'Remova a peça' },
  { id: 'diagnose', label: 'Diagnosticar', icon: '⌖', hint: 'Encontre a falha' },
  { id: 'repair', label: 'Remontar', icon: '⚒', hint: 'Monte o motor' },
] as const

export type PhaseId = typeof PHASES[number]['id']
export type ToolId = 'multimeter' | 'thermometer' | 'stethoscope'

export const TOOLS: { id: ToolId; label: string; icon: string }[] = [
  { id: 'multimeter', label: 'Multímetro', icon: '⌁' },
  { id: 'thermometer', label: 'Termômetro', icon: '♨' },
  { id: 'stethoscope', label: 'Estetoscópio', icon: '◉' },
]

export const FAULTS = [
  { part: 'coil', label: 'Bobina queimada', symptom: 'Superaquecimento', tool: 'thermometer' as ToolId },
  { part: 'bearing', label: 'Rolamento gasto', symptom: 'Vibração', tool: 'stethoscope' as ToolId },
  { part: 'stator', label: 'Curto no estator', symptom: 'Faísca', tool: 'multimeter' as ToolId },
] as const
