/**
 * Catálogo das peças do motor e regras de montagem.
 * Cada peça aponta para um modelo 3D local em /public/assets/elementos3d.
 */

export type ToolId = 'multimetro' | 'termometro' | 'estetoscopio';
export type Sintoma = 'fumaca' | 'vibracao' | 'faisca' | 'folga' | 'torto';

export interface MotorPart {
  id: string;
  /** Etiqueta curta (2–4 palavras) */
  nome: string;
  /** Modelo 3D da peça; ausente = peça ilustrada por ícone */
  modelo?: string;
  /** 1 = primeira peça a sair na desmontagem */
  ordem: number;
  podeDoente: boolean;
  sintoma?: Sintoma;
  ferramenta?: ToolId;
  /** Posição do ponto interactivo sobre a bancada (percentagem) */
  pos: { x: number; y: number };
}

export const PARTS: MotorPart[] = [
  { id: 'tampa', nome: 'Tampa Traseira', modelo: '/assets/elementos3d/tampa_traseira.glb', ordem: 1, podeDoente: false, pos: { x: 50, y: 20 } },
  { id: 'parafusos', nome: 'Parafusos', ordem: 2, podeDoente: true, sintoma: 'folga', ferramenta: 'estetoscopio', pos: { x: 31, y: 29 } },
  { id: 'ventoinha', nome: 'Ventoinha', modelo: '/assets/elementos3d/ventilador1.glb', ordem: 3, podeDoente: false, pos: { x: 69, y: 32 } },
  { id: 'rotor', nome: 'Rotor', modelo: '/assets/elementos3d/ac_induction_motor.glb', ordem: 4, podeDoente: true, sintoma: 'torto', ferramenta: 'estetoscopio', pos: { x: 50, y: 48 } },
  { id: 'estator', nome: 'Estator', modelo: '/assets/elementos3d/estator2.glb', ordem: 5, podeDoente: true, sintoma: 'faisca', ferramenta: 'multimetro', pos: { x: 39, y: 60 } },
  { id: 'bobinas', nome: 'Bobinas', modelo: '/assets/elementos3d/bobina_estator.glb', ordem: 6, podeDoente: true, sintoma: 'fumaca', ferramenta: 'termometro', pos: { x: 62, y: 62 } },
  { id: 'rolamentos', nome: 'Rolamentos', modelo: '/assets/elementos3d/ball_bearing.glb', ordem: 7, podeDoente: true, sintoma: 'vibracao', ferramenta: 'estetoscopio', pos: { x: 50, y: 74 } },
  { id: 'carcaca', nome: 'Carcaça', modelo: '/assets/elementos3d/motor_aberto1.glb', ordem: 8, podeDoente: false, pos: { x: 27, y: 58 } },
  { id: 'caixa', nome: 'Caixa de Ligação', ordem: 9, podeDoente: false, pos: { x: 74, y: 50 } },
];

export const PART_IDS = PARTS.map((p) => p.id);
export const getPart = (id: string | null) => PARTS.find((p) => p.id === id);

/** Motor completo → aberto → núcleo, conforme as peças saem (ilusão de desmontagem). */
const VISTAS = [
  { removidas: 0, modelo: '/assets/elementos3d/motor.glb' },
  { removidas: 3, modelo: '/assets/elementos3d/motor_aberto1.glb' },
  { removidas: 6, modelo: '/assets/elementos3d/estator2.glb' },
];

export const vistaDoConjunto = (removidas: number) =>
  [...VISTAS].reverse().find((v) => removidas >= v.removidas)?.modelo ?? VISTAS[0].modelo;

export const FERRAMENTAS: Record<ToolId, { nome: string; alvo: string }> = {
  multimetro: { nome: 'Multímetro', alvo: 'Elétrico' },
  termometro: { nome: 'Termómetro', alvo: 'Calor' },
  estetoscopio: { nome: 'Estetoscópio', alvo: 'Ruído' },
};

export const SINTS: Record<Sintoma, { nome: string; ferramenta: ToolId }> = {
  fumaca: { nome: 'Queimado', ferramenta: 'termometro' },
  vibracao: { nome: 'Vibração', ferramenta: 'estetoscopio' },
  faisca: { nome: 'Curto', ferramenta: 'multimetro' },
  folga: { nome: 'Folga', ferramenta: 'estetoscopio' },
  torto: { nome: 'Desalinhado', ferramenta: 'estetoscopio' },
};

export const FASES = ['explorar', 'desmontar', 'diagnosticar', 'reparar'] as const;
export type Fase = (typeof FASES)[number] | 'concluido';

export const NOME_FASE: Record<Fase, string> = {
  explorar: 'Explorar',
  desmontar: 'Desmontar',
  diagnosticar: 'Diagnosticar',
  reparar: 'Reparar',
  concluido: 'Concluído',
};
