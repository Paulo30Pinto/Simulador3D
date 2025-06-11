import * as React from 'react';
import { createTheme } from '@mui/material/styles';
import {
  AppProvider,
  type Router,
} from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import NAVIGATION from './router/navagacao.routes';
import PageContent from './containers/pageContent';
import { Grid } from '@mui/material';

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { dark: true, light: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});


/*
function PageContent({ pathname }: { pathname: string }) {
  return (
    <Box
      sx={{
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <Typography>Minha Pagina {pathname}</Typography>
    </Box>
  );
}
*/

interface DemoProps {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window?: () => Window;
}

export default function App(props: DemoProps) {
  const { window } = props;

  const [pathname, setPathname] = React.useState('/home');

  const router = React.useMemo<Router>(() => {
    return {
      pathname,
      searchParams: new URLSearchParams(),
      navigate: (path) => setPathname(String(path)),
    };
  }, [pathname]);

  // Remove this const when copying and pasting into your project.
  const demoWindow = window !== undefined ? window() : undefined;

  return (
    <AppProvider
      branding={{
        logo: (
          <img
            src="../public/logo.png"
            alt="Monteiro & Monteiro"
          />
        ),
        title: "",
        homeUrl: "/toolpad/core/introduction",
      }}
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout defaultSidebarCollapsed>
        <div className='' style={{ maxWidth: '90vw', height: '100%' }}>
          <Grid container spacing={2}>
            <Grid size={{xs: 12, lg: 10}}>
              <PageContent pathname={pathname} />
            </Grid>
            <Grid size={{xs: 12, lg: 2}}>
              <div className='' style={{ maxWidth: '100%', height: '100%' }}>
                  <img src="/public/img/multimetro2.png" alt="Logo" style={{ maxWidth: '100%', height: '70vh' }} />
              </div>
            </Grid>
          </Grid>
        </div>

      </DashboardLayout>
    </AppProvider>
  );
}
