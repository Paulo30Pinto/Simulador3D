import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import { motorDesligar, motorLigar, sfx } from '../audio/gameAudio';
import { PART_IDS, getPart, type Fase, type ToolId } from '../parts/partsData';
import {
  completa,
  entrarFase,
  estadoInicial,
  proximaDesmontar,
  proximaMontar,
  reducer,
  type EstadoJogo,
} from './gameRules';

const CHAVE = 'motor-game-v1';

interface Guardado {
  fase: EstadoJogo['fase'];
  montadas?: string[];
  diagnosticos?: number;
}

function iniciar(): EstadoJogo {
  const base = estadoInicial();
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return base;
    const g = JSON.parse(bruto) as Guardado;
    if (!g?.fase) return base;
    const salvo: EstadoJogo = { ...base, diagnosticos: g.diagnosticos ?? 0 };
    const fase = entrarFase(salvo, g.fase);
    if ((g.fase === 'explorar' || g.fase === 'desmontar') && Array.isArray(g.montadas)) {
      const montadas = g.montadas.filter((id) => getPart(id));
      return { ...fase, montadas, bandeja: PART_IDS.filter((id) => !montadas.includes(id)) };
    }
    return fase;
  } catch {
    return base;
  }
}

export interface JogoApi {
  estado: EstadoJogo;
  selecionar: (id: string | null) => void;
  remover: (id: string) => void;
  montar: (id: string) => void;
  escolherFerramenta: (id: ToolId | null) => void;
  alternarMotor: () => void;
  lerPeca: (id: string) => void;
  apontar: (id: string) => void;
  avancar: () => void;
  irParaFase: (fase: Fase) => void;
  reiniciar: () => void;
}

const JogoCtx = createContext<JogoApi | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(reducer, undefined, iniciar);

  useEffect(() => {
    localStorage.setItem(
      CHAVE,
      JSON.stringify({ fase: estado.fase, montadas: estado.montadas, diagnosticos: estado.diagnosticos }),
    );
  }, [estado.fase, estado.montadas, estado.diagnosticos]);

  useEffect(() => {
    if (estado.motorLigado) motorLigar();
    else motorDesligar();
  }, [estado.motorLigado]);

  useEffect(() => () => motorDesligar(), []);

  const api = useMemo<JogoApi>(
    () => ({
      estado,
      selecionar: (id) => {
        sfx.select();
        dispatch({ tipo: 'selecionar', id });
      },
      remover: (id) => {
        if (estado.fase === 'desmontar' && id !== proximaDesmontar(estado)) {
          sfx.buzz();
          dispatch({ tipo: 'erro', id });
          return;
        }
        if (id === 'parafusos') sfx.parafuso();
        else sfx.snap();
        dispatch({ tipo: 'remover', id });
      },
      montar: (id) => {
        if (estado.fase === 'reparar' && id !== proximaMontar(estado)) {
          sfx.buzz();
          dispatch({ tipo: 'erro', id });
          return;
        }
        sfx.snap();
        dispatch({ tipo: 'montar', id });
      },
      escolherFerramenta: (id) => {
        sfx.click();
        dispatch({ tipo: 'ferramenta', id });
      },
      alternarMotor: () => {
        const ligado = !estado.motorLigado;
        dispatch({ tipo: 'motor', ligado });
        if (ligado && estado.fase === 'reparar' && completa(estado)) sfx.sucesso();
      },
      lerPeca: (id) => {
        if (!estado.ferramenta) {
          sfx.select();
          dispatch({ tipo: 'selecionar', id });
          return;
        }
        const ok =
          estado.ferramenta === getPart(id)?.ferramenta && id === estado.defeito;
        if (ok) sfx.ding();
        else sfx.buzz();
        dispatch({ tipo: 'ler', id, ok });
      },
      apontar: (id) => {
        if (id !== estado.defeito) {
          sfx.buzz();
          dispatch({ tipo: 'erro', id });
          return;
        }
        sfx.sucesso();
        dispatch({ tipo: 'apontar', id });
      },
      avancar: () => {
        sfx.click();
        dispatch({ tipo: 'avancar' });
      },
      irParaFase: (fase) => {
        sfx.click();
        dispatch({ tipo: 'fase', fase });
      },
      reiniciar: () => {
        sfx.click();
        dispatch({ tipo: 'reiniciar' });
      },
    }),
    [estado],
  );

  return <JogoCtx.Provider value={api}>{children}</JogoCtx.Provider>;
}

export function useGame(): JogoApi {
  const ctx = useContext(JogoCtx);
  if (!ctx) throw new Error('useGame precisa do GameProvider');
  return ctx;
}
