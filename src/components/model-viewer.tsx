import { useRef, useState, useCallback, useEffect } from "react";
import "@google/model-viewer";
import { Box, IconButton, Tooltip, Chip, Stack } from "@mui/material";
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SyncIcon from '@mui/icons-material/Sync';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

interface BaseViewerProps {
  src: string;
  alt: string;
  poster?: string;
  height?: string | number;
  autoRotate?: boolean;
  rotationPerSecond?: string;
  autoplay?: boolean;
  title?: string;
  badges?: { label: string; color?: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" }[];
  children?: React.ReactNode;
}

export function Base3DViewer({
  src,
  alt,
  poster,
  height = "70vh",
  autoRotate = true,
  rotationPerSecond = "30deg",
  autoplay = false,
  title,
  badges,
  children,
}: BaseViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLElement | null>(null);
  const [isRotating, setIsRotating] = useState(autoRotate);

  useEffect(() => {
    setIsRotating(autoRotate);
  }, [autoRotate]);

  const handleResetCamera = useCallback(() => {
    const viewer = viewerRef.current as unknown as {
      resetTurntable?: () => void;
      cameraOrbit?: string;
      fieldOfView?: string;
      jumpCameraToGoal?: () => void;
    } | null;
    if (viewer) {
      if (typeof viewer.resetTurntable === 'function') {
        viewer.resetTurntable();
      }
      viewer.cameraOrbit = "0deg 75deg 105%";
      viewer.fieldOfView = "auto";
      if (typeof viewer.jumpCameraToGoal === 'function') {
        viewer.jumpCameraToGoal();
      }
    }
  }, []);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    const viewer = viewerRef.current as unknown as {
      zoom?: (ratio: number) => void;
    } | null;
    if (viewer && typeof viewer.zoom === 'function') {
      viewer.zoom(direction === 'in' ? 1.3 : 0.7);
    }
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        width: "100%",
        height,
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: "rgba(15, 23, 42, 0.85)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <model-viewer
        ref={viewerRef}
        src={src}
        alt={alt}
        poster={poster}
        camera-controls
        touch-action="pan-y"
        shadow-intensity="1.2"
        shadow-softness="0.6"
        exposure="1.05"
        environment-image="neutral"
        interaction-prompt="none"
        {...(isRotating ? { 'auto-rotate': true, 'rotation-per-second': rotationPerSecond } : {})}
        {...(autoplay ? { autoplay: true } : {})}
        style={{ width: "100%", height: "100%", outline: "none" }}
      />

      {/* Top badges & Title overlay */}
      {(title || (badges && badges.length > 0)) && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            position: "absolute",
            top: 14,
            left: 14,
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          {title && (
            <Chip
              label={title}
              size="small"
              sx={{
                bgcolor: "rgba(30, 41, 59, 0.85)",
                color: "#f8fafc",
                fontWeight: 600,
                border: "1px solid rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(6px)",
              }}
            />
          )}
          {badges?.map((b, i) => (
            <Chip
              key={i}
              label={b.label}
              size="small"
              color={b.color || "primary"}
              sx={{ fontWeight: 600, backdropFilter: "blur(6px)" }}
            />
          ))}
        </Stack>
      )}

      {/* Interactive Toolbar Overlay */}
      <Stack
        direction="row"
        spacing={0.5}
        sx={{
          position: "absolute",
          bottom: 14,
          right: 14,
          zIndex: 10,
          bgcolor: "rgba(15, 23, 42, 0.75)",
          borderRadius: 2,
          p: 0.5,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Tooltip title="Aproximar (Zoom In)">
          <IconButton size="small" onClick={() => handleZoom('in')} sx={{ color: "#94a3b8", "&:hover": { color: "#fff" } }}>
            <ZoomInIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Afastar (Zoom Out)">
          <IconButton size="small" onClick={() => handleZoom('out')} sx={{ color: "#94a3b8", "&:hover": { color: "#fff" } }}>
            <ZoomOutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={isRotating ? "Pausar Rotação" : "Iniciar Rotação"}>
          <IconButton
            size="small"
            onClick={() => setIsRotating((prev) => !prev)}
            sx={{ color: isRotating ? "#38bdf8" : "#94a3b8", "&:hover": { color: "#fff" } }}
          >
            <SyncIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Redefinir Câmera">
          <IconButton size="small" onClick={handleResetCamera} sx={{ color: "#94a3b8", "&:hover": { color: "#fff" } }}>
            <RestartAltIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Tela Cheia">
          <IconButton size="small" onClick={handleToggleFullscreen} sx={{ color: "#94a3b8", "&:hover": { color: "#fff" } }}>
            <FullscreenIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {children}
    </Box>
  );
}

interface MotorViewerProps {
  rpm?: number;
  state?: string;
  height?: string | number;
}

export const MotorViewer = ({ rpm = 0, state, height = "70vh" }: MotorViewerProps) => {
  const isRunning = rpm > 5;
  // Dynamic rotation speed proportional to physical RPM
  const rotationDegPerSec = isRunning ? Math.min(Math.max(rpm * 0.15, 25), 450) : 0;

  const badges = [
    { label: `${rpm.toFixed(0)} RPM`, color: (isRunning ? "success" : "default") as "success" | "default" },
    ...(state ? [{ label: state, color: (isRunning ? "primary" : "default") as "primary" | "default" }] : []),
  ];

  return (
    <Base3DViewer
      src="/assets/elementos3d/motor.glb"
      alt="Modelo 3D Motor de Indução Trifásico Montado"
      poster="/img/motorAssincono.png"
      height={height}
      autoRotate={isRunning}
      rotationPerSecond={`${rotationDegPerSec.toFixed(0)}deg`}
      title="Motor Completo (10 kW)"
      badges={badges}
    />
  );
};

export const RotorViewer = ({ height = "70vh" }: { height?: string | number }) => {
  return (
    <Base3DViewer
      src="/assets/elementos3d/ac_induction_motor.glb"
      alt="Modelo 3D Rotor em Gaiola de Esquilo e Eixo"
      poster="/img/Rotor.png"
      height={height}
      autoRotate={true}
      rotationPerSecond="20deg"
      autoplay={true}
      title="Rotor Gaiola de Esquilo"
      badges={[{ label: "Barras de Alumínio", color: "info" }, { label: "Eixo de Aço", color: "default" }]}
    />
  );
};

export const EstatorViewer = ({ height = "70vh" }: { height?: string | number }) => {
  return (
    <Base3DViewer
      src="/assets/elementos3d/estator2.glb"
      alt="Modelo 3D Estator com Núcleo Laminado Ranhurado"
      poster="/img/Estator.png"
      height={height}
      autoRotate={true}
      rotationPerSecond="25deg"
      title="Estator Ranhurado"
      badges={[{ label: "Aço Silício Laminado", color: "warning" }, { label: "4 Polos", color: "info" }]}
    />
  );
};

export const BobinaViewer = ({ height = "70vh" }: { height?: string | number }) => {
  return (
    <Base3DViewer
      src="/assets/elementos3d/bobina5.glb"
      alt="Modelo 3D Enrolamento Estatórico Trifásico"
      height={height}
      autoRotate={true}
      rotationPerSecond="25deg"
      title="Enrolamento Estatórico"
      badges={[{ label: "Cobre Esmaltado Classe F", color: "secondary" }, { label: "Conexão Estrela/Triângulo", color: "default" }]}
    />
  );
};
