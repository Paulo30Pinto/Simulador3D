
import { Box, Card, CardContent, Grid, Stack, Typography, Chip } from '@mui/material';
import { EstatorViewer } from '../components/model-viewer';

export default function Estator() {
  return (
    <Box sx={{ color: 'text.primary' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} mb={2}>
        <Box>
          <Typography variant="overline" color="text.secondary">Componente Eletromagnético Estático</Typography>
          <Typography variant="h4" fontWeight={700}>Estator Ranhurado</Typography>
          <Typography color="text.secondary">Núcleo ferromagnético laminado com 36 ranhuras para bobinagem trifásica</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip label="Aço-Silício 0.5mm" color="warning" variant="outlined" />
          <Chip label="36 Ranhuras" color="primary" variant="outlined" />
          <Chip label="4 Polos" color="info" variant="outlined" />
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ bgcolor: 'rgba(17, 24, 39, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <CardContent sx={{ p: 1.5 }}>
              <EstatorViewer height="66vh" />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2}>
            <Card sx={{ bgcolor: 'background.paper' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Princípio Físico e Construção
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  O estator é a parte estacionária do motor. É construído a partir do empilhamento de lâminas finas de aço-silício isoladas eletricamente entre si para minimizar perdas por histerese e correntes parasitas de Foucault.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  As ranhuras internas abrigam as bobinas trifásicas que, quando alimentadas por correntes defasadas em 120°, criam a Força Magnetomotriz Girante (FMG) na velocidade síncrona.
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: 'background.paper' }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Especificações Técnicas
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Diâmetro Interno:</Typography>
                    <Typography variant="body2" fontWeight={600}>180 mm</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Comprimento do Pacote:</Typography>
                    <Typography variant="body2" fontWeight={600}>145 mm</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Indução no Entreferro (Bg):</Typography>
                    <Typography variant="body2" fontWeight={600}>0.78 T</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Isolação de Ranhura:</Typography>
                    <Typography variant="body2" fontWeight={600}>Mylar / Nomex (Classe F)</Typography>
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
