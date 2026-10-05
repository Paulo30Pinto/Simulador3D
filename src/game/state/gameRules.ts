import { FASES, PART_IDS, PARTS, getPart, type Fase, type ToolId } from '../parts/partsData';

export interface EstadoJogo {
  fase: Fase;
  /** Peças montadas no motor */
  montadas: string[];
  /** Peças na bandeja (ordem de saída) */
  bandeja: string[];
  selecionada: string | null;
  /** Peça avariada sorteada na fase de diagnóstico */
  defeito: string | null;
  /** Já houve leitura correcta com a ferramenta certa */
  defeitoEncontrado: boolean;
  ferramenta: ToolId | null;
  motorLigado: boolean;
  /** Última leitura de ferramenta: verde/vermelho */
  feedback: { id: string; ok: boolean } | null;
  /** Peça que provocou erro (vibração vermelha) */
  erro: string | null;
  /** Peça substituída, à espera de encaixe */
  nova: string | null;
  /** Record de diagnósticos certos (localStorage) */
  diagnosticos: number;
}

export type Acao =
  | { tipo: 'selecionar'; id: string | null }
  | { tipo: 'remover'; id: string }
  | { tipo: 'montar'; id: string }
  | { tipo: 'ferramenta'; id: ToolId | null }
  | { tipo: 'motor'; ligado: boolean }
  | { tipo: 'ler'; id: string; ok: boolean }
  | { tipo: 'apontar'; id: string }
  | { tipo: 'erro'; id: string }
  | { tipo: 'avancar' }
  | { tipo: 'fase'; fase: Fase }
  | { tipo: 'reiniciar' };

export const estadoInicial = (): EstadoJogo => ({
  fase: 'explorar',
  montadas: [...PART_IDS],
  bandeja: [],
  selecionada: null,
  defeito: null,
  defeitoEncontrado: false,
  ferramenta: null,
  motorLigado: false,
  feedback: null,
  erro: null,
  nova: null,
  diagnosticos: 0,
});

export const completa = (estado: EstadoJogo) => estado.montadas.length === PARTS.length;

const sortearDefeito = () => {
  const candidatas = PARTS.filter((p) => p.podeDoente);
  return candidatas[Math.floor(Math.random() * candidatas.length)].id;
};

/** Prepara o estado de entrada de cada fase. */
export function entrarFase(estado: EstadoJogo, fase: Fase): EstadoJogo {
  const base: EstadoJogo = {
    ...estado,
    fase,
    selecionada: null,
    erro: null,
    feedback: null,
    ferramenta: null,
    motorLigado: false,
  };
  switch (fase) {
    case 'explorar':
    case 'desmontar':
      return { ...base, montadas: [...PART_IDS], bandeja: [], defeito: null, nova: null };
    case 'diagnosticar':
      return {
        ...base,
        montadas: [...PART_IDS],
        bandeja: [],
        defeito: sortearDefeito(),
        defeitoEncontrado: false,
        nova: null,
      };
    case 'reparar':
      return {
        ...base,
        montadas: [],
        bandeja: [...PART_IDS].reverse(),
        defeito: estado.defeito ?? sortearDefeito(),
        nova: estado.defeito ?? sortearDefeito(),
      };
    default:
      return base;
  }
}

export const proximaFase = (fase: Fase): Fase => {
  const i = FASES.indexOf(fase as (typeof FASES)[number]);
  return i < 0 || i === FASES.length - 1 ? 'concluido' : FASES[i + 1];
};

/** Próxima peça a sair na desmontagem guiada. */
export const proximaDesmontar = (estado: EstadoJogo): string | null => {
  const pecas = estado.montadas.map(getPart).filter(Boolean);
  if (pecas.length === 0) return null;
  return pecas.reduce((a, b) => ((a!.ordem <= b!.ordem) ? a : b))!.id;
};

/** Próxima peça a encaixar na remontagem (ordem inversa da desmontagem). */
export const proximaMontar = (estado: EstadoJogo): string | null => {
  const pecas = estado.bandeja.map(getPart).filter(Boolean);
  if (pecas.length === 0) return null;
  return pecas.reduce((a, b) => ((a!.ordem >= b!.ordem) ? a : b))!.id;
};

/** Sintoma visível na peça avariada. */
export const sintomaDe = (estado: EstadoJogo, id: string) =>
  estado.defeito === id ? getPart(id)?.sintoma ?? null : null;

/** O motor mostra o sintoma (peça montada + avaria presente). */
export const sintomaVisivel = (estado: EstadoJogo, id: string) =>
  !!sintomaDe(estado, id) && estado.montadas.includes(id) && estado.fase !== 'concluido';

export function reducer(estado: EstadoJogo, acao: Acao): EstadoJogo {
  switch (acao.tipo) {
    case 'selecionar':
      return { ...estado, selecionada: acao.id, erro: null };
    case 'remover':
      return {
        ...estado,
        montadas: estado.montadas.filter((p) => p !== acao.id),
        bandeja: estado.bandeja.includes(acao.id) ? estado.bandeja : [...estado.bandeja, acao.id],
        selecionada: null,
        erro: null,
      };
    case 'montar':
      return {
        ...estado,
        bandeja: estado.bandeja.filter((p) => p !== acao.id),
        montadas: estado.montadas.includes(acao.id) ? estado.montadas : [...estado.montadas, acao.id],
        selecionada: null,
        erro: null,
        nova: estado.nova === acao.id ? null : estado.nova,
      };
    case 'ferramenta':
      return { ...estado, ferramenta: acao.id, feedback: null, erro: null };
    case 'motor':
      return {
        ...estado,
        motorLigado: acao.ligado,
        fase: acao.ligado && estado.fase === 'reparar' && completa(estado) ? 'concluido' : estado.fase,
      };
    case 'ler':
      return {
        ...estado,
        feedback: { id: acao.id, ok: acao.ok },
        defeitoEncontrado: estado.defeitoEncontrado || acao.ok,
        erro: acao.ok ? null : estado.erro,
      };
    case 'apontar':
      if (acao.id !== estado.defeito) return { ...estado, erro: acao.id };
      return { ...entrarFase(estado, 'reparar'), diagnosticos: estado.diagnosticos + 1 };
    case 'erro':
      return { ...estado, erro: acao.id };
    case 'avancar':
      return entrarFase(estado, proximaFase(estado.fase));
    case 'fase':
      return entrarFase(estado, acao.fase);
    case 'reiniciar':
      return { ...estadoInicial(), diagnosticos: estado.diagnosticos };
    default:
      return estado;
  }
}
