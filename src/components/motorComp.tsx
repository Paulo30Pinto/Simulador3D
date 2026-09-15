import { useState } from "react";
import { Box, Card, CardContent, Grid, Stack, Typography, Chip, Tabs, Tab, Divider } from "@mui/material";
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import SettingsInputComponentIcon from '@mui/icons-material/SettingsInputComponent';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import DonutSmallIcon from '@mui/icons-material/DonutSmall';
import MemoryIcon from '@mui/icons-material/Memory';
import { Base3DViewer } from "./model-viewer";

interface ComponentInfo {
  id: string;
  name: string;
  category: string;
  src: string;
  poster?: string;
  autoRotate?: boolean;
  autoplay?: boolean;
  functionDesc: string;
  material: string;
  specs: { label: string; value: string }[];
  maintenanceTip: string;
}

const MOTOR_COMPONENTS: ComponentInfo[] = [
  {
    id: "motor_conjunto",
    name: "Motor Completo",
    category: "Conjunto Montado",
    src: "/assets/elementos3d/motor.glb",
    poster: "/img/motorAssincono.png",
    autoRotate: true,
    functionDesc: "Conversão de energia elétrica trifásica em energia mecânica rotativa por indução eletromagnética.",
    material: "Carcaça de ferro fundido cinzento FC-200 com aletas de dissipação térmica.",
    specs: [
      { label: "Potência Nominal", value: "10 kW (13.6 cv)" },
      { label: "Tensão / Freq.", value: "380 V / 50 Hz" },
      { label: "Velocidade Nominal", value: "1440 RPM (4 polos)" },
      { label: "Grau de Proteção", value: "IP55 / NBR IEC 60034-5" },
    ],
    maintenanceTip: "Verificar vibração RMS (máx 1.8 mm/s) e isolamento dos enrolamentos com megômetro periodicamente.",
  },
  {
    id: "estator",
    name: "Estator Ranhurado",
    category: "Parte Fixa Eletromagnética",
    src: "/assets/elementos3d/estator2.glb",
    poster: "/img/Estator.png",
    autoRotate: true,
    functionDesc: "Núcleo magnético estático que abriga o enrolamento trifásico e canaliza o campo magnético girante (FMG).",
    material: "Lâminas de aço-silício de grão não orientado (0.5 mm) com verniz isolante C-5 para redução de correntes parasitas (Foucault).",
    specs: [
      { label: "Número de Ranhuras", value: "36 ranhuras semi-fechadas" },
      { label: "Polos Magnéticos", value: "4 Polos (2 pares)" },
      { label: "Densidade de Fluxo", value: "1.4 a 1.6 Tesla nos dentes" },
      { label: "Perdas no Ferro", value: "~2.5 W/kg a 50 Hz" },
    ],
    maintenanceTip: "Inspeção visual contra descascamento de verniz, pontos quentes (termografia) e cunhas soltas nas ranhuras.",
  },
  {
    id: "rotor",
    name: "Rotor Gaiola de Esquilo",
    category: "Parte Girante Eletromecânica",
    src: "/assets/elementos3d/ac_induction_motor.glb",
    poster: "/img/Rotor.png",
    autoRotate: true,
    autoplay: true,
    functionDesc: "Gera o torque mecânico através da corrente induzida nas barras em curto-circuito pelo campo magnético do estator.",
    material: "Barras e anéis de curto-circuito em alumínio fundido sob pressão / Cobre eletrolítico sobre eixo de aço SAE 1045.",
    specs: [
      { label: "Tipo Construtivo", value: "Gaiola de Esquilo (Squirrel Cage)" },
      { label: "Inclinação de Barras", value: "1 ranhura estatórica (redução de ruído e cogging)" },
      { label: "Velocidade Síncrona", value: "1500 RPM a 50 Hz" },
      { label: "Balanceamento Dinâmico", value: "Grau G 2.5 (ISO 1940)" },
    ],
    maintenanceTip: "Análise de assinatura de corrente do motor (MCSA) para detecção de trincas ou barras rompidas.",
  },
  {
    id: "bobina",
    name: "Enrolamento Estatórico",
    category: "Circuito Elétrico",
    src: "/assets/elementos3d/bobina5.glb",
    autoRotate: true,
    functionDesc: "Três enrolamentos defasados no espaço em 120° que produzem o campo magnético girante síncrono.",
    material: "Fio de cobre esmaltado redondo Classe F (155°C) ou H (180°C) com dupla camada de poliéster-imida e poliamida-imida.",
    specs: [
      { label: "Classe de Isolação", value: "Classe F (155°C)" },
      { label: "Conexão", value: "Estrela (380V) / Triângulo (220V)" },
      { label: "Resistência de Fase", value: "0.42 Ω a 20°C" },
      { label: "Tensão de Rigidez", value: "> 2500 V RMS por 1 minuto" },
    ],
    maintenanceTip: "Medir resistência de isolamento (R_iso > 100 MΩ) e índice de polarização (IP > 2.0).",
  },
  {
    id: "rolamento",
    name: "Rolamento de Esferas",
    category: "Elemento de Mancal",
    src: "/assets/elementos3d/rolamento.glb",
    autoRotate: true,
    functionDesc: "Sustenta radial e axialmente o rotor, garantindo o entreferro uniforme e mínimo atrito de rotação.",
    material: "Aço cromo 100Cr6 temperado com folga radial C3.",
    specs: [
      { label: "Tipo", value: "Rolamento rígido de esferas (ex: 6308-2Z-C3)" },
      { label: "Lubrificação", value: "Graxa de poliureia / Lítio complexo" },
      { label: "Vida Nominal L10h", value: "40.000 horas em serviço normal" },
      { label: "Temp. Máx. Trabalho", value: "110°C contínua" },
    ],
    maintenanceTip: "Monitoramento por ultrassom e análise de vibração espectral (detecção de falha na pista interna/externa).",
  },
  {
    id: "ventilador",
    name: "Ventilador de Refrigeração",
    category: "Sistema de Arrefecimento",
    src: "/assets/elementos3d/ventilador1.glb",
    autoRotate: true,
    functionDesc: "Proporciona circulação forçada de ar sobre a carcaça aletada (sistema TEFC - Totalmente Fechado com Ventilação Externa).",
    material: "Polipropileno reforçado com fibra de vidro ou alumínio injetado.",
    specs: [
      { label: "Método de Resfriamento", value: "IC411 (NBR IEC 60034-6)" },
      { label: "Direção de Fluxo", value: "Bidirecional axial para as aletas" },
      { label: "Fixação", value: "Trava elástica sobre o eixo" },
    ],
    maintenanceTip: "Limpeza regular das grades e aletas para evitar acúmulo de poeira e superaquecimento do motor.",
  },
];

export default function MotorComponetesPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const activeComp = MOTOR_COMPONENTS[selectedIdx];

  return (
    <Box sx={{ color: "text.primary" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="overline" color="text.secondary">
            Catálogo Eletromecânico 3D Offline
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            Componentes do Motor de Indução
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Modelos tridimensionais interativos locais e especificações técnicas de engenharia
          </Typography>
        </Box>
        <Chip
          icon={<PrecisionManufacturingIcon />}
          label="100% Offline"
          color="success"
          size="small"
          variant="outlined"
        />
      </Stack>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={selectedIdx}
          onChange={(_, idx) => setSelectedIdx(idx)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Abas de componentes 3D"
        >
          {MOTOR_COMPONENTS.map((comp, idx) => (
            <Tab
              key={comp.id}
              label={comp.name}
              icon={idx === 0 ? <MemoryIcon fontSize="small" /> : idx === 3 ? <ElectricBoltIcon fontSize="small" /> : <DonutSmallIcon fontSize="small" />}
              iconPosition="start"
              sx={{ minHeight: 48, textTransform: "none", fontWeight: 600 }}
            />
          ))}
        </Tabs>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ bgcolor: "rgba(17, 24, 39, 0.7)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <CardContent sx={{ p: 1 }}>
              <Base3DViewer
                key={activeComp.id}
                src={activeComp.src}
                alt={activeComp.name}
                poster={activeComp.poster}
                height="62vh"
                autoRotate={activeComp.autoRotate ?? true}
                autoplay={activeComp.autoplay ?? false}
                title={activeComp.name}
                badges={[{ label: activeComp.category, color: "primary" }]}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2}>
            <Card sx={{ bgcolor: "background.paper" }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <SettingsInputComponentIcon color="primary" fontSize="small" />
                  <Typography variant="h6" fontWeight={700}>
                    {activeComp.name}
                  </Typography>
                </Stack>
                <Chip label={activeComp.category} size="small" color="info" sx={{ mb: 1.5 }} />

                <Typography variant="caption" color="text.secondary" display="block" fontWeight={700} gutterBottom>
                  FUNÇÃO ELETROMECÂNICA
                </Typography>
                <Typography variant="body2" paragraph>
                  {activeComp.functionDesc}
                </Typography>

                <Typography variant="caption" color="text.secondary" display="block" fontWeight={700} gutterBottom>
                  MATERIAL CONSTRUTIVO
                </Typography>
                <Typography variant="body2" paragraph>
                  {activeComp.material}
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                <Typography variant="caption" color="text.secondary" display="block" fontWeight={700} gutterBottom>
                  PARÂMETROS TÉCNICOS
                </Typography>
                <Stack spacing={0.75}>
                  {activeComp.specs.map((spec, i) => (
                    <Box key={i} sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                      <Typography variant="body2" color="text.secondary">{spec.label}:</Typography>
                      <Typography variant="body2" fontWeight={600}>{spec.value}</Typography>
                    </Box>
                  ))}
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                <Typography variant="caption" color="warning.main" display="block" fontWeight={700} gutterBottom>
                  DIAGNÓSTICO & MANUTENÇÃO
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.82rem" }}>
                  {activeComp.maintenanceTip}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
