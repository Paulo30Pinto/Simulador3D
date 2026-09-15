
import { Box, Card, CardContent, Grid, Stack, Typography, Chip } from '@mui/material';
import { BobinaViewer } from '../components/model-viewer';

export default function Bobina() {
  return (
    <Box sx={{ color: 'text.primary' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} mb={2}>
        <Box>
          <Typography variant="overline" color="text.secondary">Circuito Elétrico de Excitação</Typography>
          <Typography variant="h4" fontWeight={700}>Enrolamento Estatórico</Typography>
          <Typography color="text.secondary">Bobinas de cobre esmaltado com distribuição trifásica simétrica e isolamento dielétrico de alto desempenho</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip label="Cobre Esmaltado" color="secondary" variant="outlined" />
          <Chip label="Classe F (155°C)" color="warning" variant="outlined" />
          <Chip label="Defasagem 120°" color="primary" variant="outlined" />
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ bgcolor: 'rgba(17, 24, 39, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <CardContent sx={{ p: 1.5 }}>
              <BobinaViewer height="66vh" />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2}>
            <Card sx={{ bgcolor: 'background.paper' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Topologia de Bobinagem
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  As bobinas são inseridas nas ranhuras do estator em camadas (camada simples ou dupla), agrupadas em fases U, V e W. A distribuição espacial adequada reduz harmônicas de campo magnético e melhora a forma de onda do fluxo.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  O passo de bobina encurtado (chording) é aplicado para eliminar a 5ª e 7ª harmônicas espaciais, aumentando a eficiência e reduzindo aquecimento desnecessário.
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: 'background.paper' }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Parâmetros de Fase
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Resistência por Fase (R1):</Typography>
                    <Typography variant="body2" fontWeight={600}>0.42 Ω a 20°C</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Reatância de Dispersão (X1):</Typography>
                    <Typography variant="body2" fontWeight={600}>0.95 Ω (50 Hz)</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Tensão Nominal:</Typography>
                    <Typography variant="body2" fontWeight={600}>380 V (Y) / 220 V (Δ)</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Elevação Máx. Temperatura:</Typography>
                    <Typography variant="body2" fontWeight={600}>105 K (Classe F)</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

