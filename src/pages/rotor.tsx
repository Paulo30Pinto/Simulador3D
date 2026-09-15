
import { Box, Card, CardContent, Grid, Stack, Typography, Chip } from '@mui/material';
import { RotorViewer } from '../components/model-viewer';


export default function Rotor() {
  return (
    <Box sx={{ color: 'text.primary' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} mb={2}>
        <Box>
          <Typography variant="overline" color="text.secondary">Elemento Rotativo Eletromecânico</Typography>
          <Typography variant="h4" fontWeight={700}>Rotor em Gaiola de Esquilo</Typography>
          <Typography color="text.secondary">Conjunto rotórico com barras condutoras inclinadas, anéis de curto e eixo mecânico usinado</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip label="Gaiola em Alumínio" color="info" variant="outlined" />
          <Chip label="Eixo SAE 1045" color="default" variant="outlined" />
          <Chip label="Barras Inclinadas" color="success" variant="outlined" />
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ bgcolor: 'rgba(17, 24, 39, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <CardContent sx={{ p: 1.5 }}>
              <RotorViewer height="66vh" />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2}>
            <Card sx={{ bgcolor: 'background.paper' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Princípio de Funcionamento
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  O rotor de gaiola de esquilo opera com base na Lei de Indução de Faraday e na Lei de Lenz. O campo magnético girante do estator induz tensão nas barras em curto.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  A corrente resultante interage com o campo estatórico, gerando a força de Lorentz que produz o torque mecânico contínuo no eixo motor.
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: 'background.paper' }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Dados Construtivos
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Diâmetro do Eixo:</Typography>
                    <Typography variant="body2" fontWeight={600}>38 mm (ponta k6)</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Entreferro Mecânico (g):</Typography>
                    <Typography variant="body2" fontWeight={600}>0.45 mm</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Resistência Rotórica (R2&apos;):</Typography>
                    <Typography variant="body2" fontWeight={600}>0.35 Ω (refletida)</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Inércia do Rotor (J):</Typography>
                    <Typography variant="body2" fontWeight={600}>0.045 kg·m²</Typography>
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
