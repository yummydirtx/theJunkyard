// Copyright (c) 2025 Alex Frutkin
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (theJunkyard), to deal in
// theJunkyard without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// theJunkyard, and to permit persons to whom theJunkyard is furnished to do so,
// subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of theJunkyard.
// 
// THEJUNKYARD IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THEJUNKYARD OR THE USE OR OTHER DEALINGS IN THEJUNKYARD.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { alpha, keyframes } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { Canvas, useFrame } from '@react-three/fiber';
import CodeIcon from '@mui/icons-material/Code';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ProfilePic from '../../../assets/profilepic.jpeg';
import OceanScene, {
  type OceanQuality,
  type OceanPostTuning,
  type OceanTuning,
  getOceanTuningFromQuality,
} from '../../waveSimulation/components/OceanScene';

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const HERO_MAX_MANUAL_ROTATION_SPEED = 6.4;
const STICK_KNOB_RADIUS_PX = 18;
const FIXED_POLAR_ANGLE = Math.PI / 2.45;
const HERO_CAMERA_DISTANCE = 17;
const HERO_SUN_VECTOR_X = 140;
const HERO_SUN_VECTOR_Z = 78;
const HERO_SUN_VECTOR_LENGTH_XZ = Math.hypot(HERO_SUN_VECTOR_X, HERO_SUN_VECTOR_Z);
const HERO_CAMERA_HORIZONTAL_DISTANCE = HERO_CAMERA_DISTANCE * Math.sin(FIXED_POLAR_ANGLE);
const HERO_INITIAL_AZIMUTH_OFFSET_RAD = (6 * Math.PI) / 180;
const HERO_CAMERA_BASE_X = (-HERO_SUN_VECTOR_X / HERO_SUN_VECTOR_LENGTH_XZ) * HERO_CAMERA_HORIZONTAL_DISTANCE;
const HERO_CAMERA_BASE_Z = (-HERO_SUN_VECTOR_Z / HERO_SUN_VECTOR_LENGTH_XZ) * HERO_CAMERA_HORIZONTAL_DISTANCE;
const HERO_CAMERA_START_X =
  HERO_CAMERA_BASE_X * Math.cos(HERO_INITIAL_AZIMUTH_OFFSET_RAD)
  - HERO_CAMERA_BASE_Z * Math.sin(HERO_INITIAL_AZIMUTH_OFFSET_RAD);
const HERO_CAMERA_START_Y = HERO_CAMERA_DISTANCE * Math.cos(FIXED_POLAR_ANGLE);
const HERO_CAMERA_START_Z =
  HERO_CAMERA_BASE_X * Math.sin(HERO_INITIAL_AZIMUTH_OFFSET_RAD)
  + HERO_CAMERA_BASE_Z * Math.cos(HERO_INITIAL_AZIMUTH_OFFSET_RAD);
const HERO_QUALITY_ORDER: OceanQuality[] = ['ultra', 'balanced', 'low'];
const HERO_LOW_FPS_THRESHOLD = 30;
const HERO_FPS_SAMPLE_SECONDS = 1.6;
const HERO_FPS_WARMUP_SECONDS = 2.4;
const HERO_FPS_DEGRADE_COOLDOWN_SECONDS = 2.2;

const getHeroPostTuningFromQuality = (quality: OceanQuality): OceanPostTuning => {
  const sourceQuality = quality === 'low' ? 'low' : 'balanced';
  const tuning = getOceanTuningFromQuality(sourceQuality);
  return {
    bloomIntensity: tuning.bloomIntensity,
    bloomThreshold: tuning.bloomThreshold,
    bloomSmoothing: tuning.bloomSmoothing,
  };
};

interface HeroFpsMonitorProps {
  quality: OceanQuality;
  onSubThirtyFps: () => void;
}

const HeroFpsMonitor: React.FC<HeroFpsMonitorProps> = ({ quality, onSubThirtyFps }) => {
  const sampleElapsedRef = useRef(0);
  const sampleFramesRef = useRef(0);
  const warmupElapsedRef = useRef(0);
  const cooldownElapsedRef = useRef(HERO_FPS_DEGRADE_COOLDOWN_SECONDS);

  useEffect(() => {
    sampleElapsedRef.current = 0;
    sampleFramesRef.current = 0;
    cooldownElapsedRef.current = HERO_FPS_DEGRADE_COOLDOWN_SECONDS;
  }, [quality]);

  useFrame((_state, delta) => {
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
      sampleElapsedRef.current = 0;
      sampleFramesRef.current = 0;
      return;
    }

    if (!Number.isFinite(delta) || delta <= 0 || delta > 0.25) {
      sampleElapsedRef.current = 0;
      sampleFramesRef.current = 0;
      return;
    }

    warmupElapsedRef.current += delta;
    cooldownElapsedRef.current += delta;
    sampleElapsedRef.current += delta;
    sampleFramesRef.current += 1;

    if (sampleElapsedRef.current < HERO_FPS_SAMPLE_SECONDS) {
      return;
    }

    const fps = sampleFramesRef.current / sampleElapsedRef.current;
    const canDowngrade =
      quality !== 'low'
      && warmupElapsedRef.current >= HERO_FPS_WARMUP_SECONDS
      && cooldownElapsedRef.current >= HERO_FPS_DEGRADE_COOLDOWN_SECONDS;

    if (canDowngrade && fps < HERO_LOW_FPS_THRESHOLD) {
      onSubThirtyFps();
      cooldownElapsedRef.current = 0;
    }

    sampleElapsedRef.current = 0;
    sampleFramesRef.current = 0;
  });

  return null;
};

const AnimatedHero: React.FC = () => {
  const [displayText, setDisplayText] = useState('');
  const fullText = "Welcome to the Junkyard";
  const [showCursor, setShowCursor] = useState(true);
  const [stickRatio, setStickRatio] = useState(0);
  const [isStickDragging, setIsStickDragging] = useState(false);
  const [quality, setQuality] = useState<OceanQuality>('ultra');
  const tuningRef = useRef<OceanTuning>(getOceanTuningFromQuality('ultra'));
  const stickTrackRef = useRef<HTMLDivElement | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const [postTuning, setPostTuning] = useState<OceanPostTuning>(() => getHeroPostTuningFromQuality('ultra'));
  const reduceHeroQuality = useCallback(() => {
    setQuality((currentQuality) => {
      const currentIndex = HERO_QUALITY_ORDER.indexOf(currentQuality);
      if (currentIndex < 0 || currentIndex >= HERO_QUALITY_ORDER.length - 1) {
        return currentQuality;
      }
      return HERO_QUALITY_ORDER[currentIndex + 1];
    });
  }, []);
  const canvasSettings = useMemo(() => {
    if (quality === 'low') {
      return {
        dpr: [0.55, 0.85] as [number, number],
        antialias: false,
        toneMapping: 0,
      };
    }

    if (quality === 'ultra') {
      return {
        dpr: [0.95, 1.35] as [number, number],
        antialias: true,
        toneMapping: 0,
      };
    }

    return {
      dpr: [0.75, 1.1] as [number, number],
      antialias: false,
      toneMapping: 0,
    };
  }, [quality]);
  const heroRotationSpeed = useMemo(() => {
    const deadzoneAppliedRatio = Math.abs(stickRatio) < 0.03 ? 0 : stickRatio;
    return deadzoneAppliedRatio * HERO_MAX_MANUAL_ROTATION_SPEED;
  }, [stickRatio]);
  const isJoystickRotationActive = Math.abs(heroRotationSpeed) > 0.001;

  useEffect(() => {
    const nextTuning = getOceanTuningFromQuality(quality);
    tuningRef.current = nextTuning;
    setPostTuning(getHeroPostTuningFromQuality(quality));
  }, [quality]);

  const updateStickFromClientX = useCallback((clientX: number) => {
    const track = stickTrackRef.current;
    if (!track) {
      return;
    }

    const rect = track.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const maxOffset = Math.max(rect.width / 2 - STICK_KNOB_RADIUS_PX, 1);
    const clampedOffset = Math.min(maxOffset, Math.max(-maxOffset, clientX - centerX));
    setStickRatio(clampedOffset / maxOffset);
  }, []);

  const resetStick = useCallback(() => {
    activePointerIdRef.current = null;
    setIsStickDragging(false);
    setStickRatio(0);
  }, []);

  const handleStickPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    activePointerIdRef.current = event.pointerId;
    setIsStickDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    updateStickFromClientX(event.clientX);
  }, [updateStickFromClientX]);

  const handleStickPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== event.pointerId) {
      return;
    }

    updateStickFromClientX(event.clientX);
  }, [updateStickFromClientX]);

  const handleStickPointerEnd = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    resetStick();
  }, [resetStick]);

  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 80);

    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      clearInterval(typingInterval);
      clearInterval(cursorInterval);
    };
  }, []);

  const skills = [
    { icon: <CodeIcon fontSize="small" />, label: 'Full Stack Dev' },
    { icon: <RocketLaunchIcon fontSize="small" />, label: 'React & TypeScript' },
    { icon: <AutoAwesomeIcon fontSize="small" />, label: 'Cloud & AI' },
  ];

  const waveBackground = useMemo(
    () => (
      <Canvas
        camera={{ position: [HERO_CAMERA_START_X, HERO_CAMERA_START_Y, HERO_CAMERA_START_Z], fov: 60, near: 0.1, far: 200 }}
        gl={{
          antialias: canvasSettings.antialias,
          powerPreference: 'high-performance',
          toneMapping: canvasSettings.toneMapping,
          outputColorSpace: 'srgb',
        }}
        dpr={canvasSettings.dpr}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <OceanScene
          quality={quality}
          tuningRef={tuningRef}
          postTuning={postTuning}
          enablePostProcessing={false}
          controls={{
            autoRotate: isJoystickRotationActive,
            autoRotateSpeed: heroRotationSpeed,
            enableZoom: false,
            enablePan: false,
            enableRotate: false,
            minPolarAngle: FIXED_POLAR_ANGLE,
            maxPolarAngle: FIXED_POLAR_ANGLE,
            minDistance: HERO_CAMERA_DISTANCE,
            maxDistance: HERO_CAMERA_DISTANCE,
          }}
        />
        <HeroFpsMonitor quality={quality} onSubThirtyFps={reduceHeroQuality} />
      </Canvas>
    ),
    [canvasSettings, heroRotationSpeed, isJoystickRotationActive, postTuning, quality, reduceHeroQuality]
  );

  return (
    <Box
      id="hero"
      sx={{
        width: '100%',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        pt: { xs: 8, md: 10 },
        pb: { xs: 4, md: 0 },
        backgroundColor: '#061628',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        {waveBackground}
      </Box>

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(2, 10, 18, 0.38) 0%, rgba(5, 14, 25, 0.48) 45%, rgba(4, 9, 15, 0.65) 100%)',
        }}
      />

      {/* Floating geometric shapes */}
      {[...Array(5)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: { xs: 100, md: 200 },
            height: { xs: 100, md: 200 },
            borderRadius: i % 2 === 0 ? '50%' : '20%',
            background: (theme) =>
              alpha(theme.palette.primary.main, 0.1),
            backdropFilter: 'blur(10px)',
            animation: `${float} ${8 + i * 2}s ease-in-out infinite`,
            left: `${i * 20}%`,
            top: `${i * 15}%`,
            opacity: 0.3,
          }}
        />
      ))}

      <Container
        sx={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          py: { xs: 8, md: 12 },
        }}
      >
        {/* Profile Picture with Glow */}
        <Box
          sx={{
            animation: `${fadeInUp} 1s ease-out, ${pulse} 3s ease-in-out infinite`,
            animationDelay: '0s',
          }}
        >
          <Box
            component="img"
            src={ProfilePic}
            alt="Alex Frutkin"
            sx={(theme) => ({
              width: { xs: 120, md: 180 },
              height: { xs: 120, md: 180 },
              borderRadius: '50%',
              border: '4px solid',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              boxShadow: `
                0 0 60px ${alpha(theme.palette.primary.main, 0.6)},
                0 0 120px ${alpha(theme.palette.secondary.main, 0.4)},
                0 10px 40px rgba(0, 0, 0, 0.3)
              `,
              objectFit: 'cover',
            })}
          />
        </Box>

        {/* Animated Title */}
        <Box
          sx={{
            animation: `${fadeInUp} 1s ease-out`,
            animationDelay: '0.2s',
            animationFillMode: 'backwards',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '5rem' },
              fontWeight: 900,
              background: 'linear-gradient(45deg, #fff 30%, rgba(255,255,255,0.7) 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 20px rgba(0,0,0,0.3)',
              mb: 1,
              fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
              letterSpacing: '-0.02em',
              minHeight: { xs: '5rem', sm: '3.5rem', md: '5rem' },
            }}
          >
            {displayText}
            <Box
              component="span"
              sx={{
                opacity: showCursor ? 1 : 0,
                transition: 'opacity 0.1s',
                color: '#fff',
              }}
            >
              |
            </Box>
          </Typography>

          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.95)',
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              mb: 3,
            }}
          >
            Hi, I'm Alex Frutkin
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: '1rem', sm: '1.25rem' },
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.85)',
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6,
              textShadow: '0 1px 5px rgba(0,0,0,0.2)',
            }}
          >
            Software Engineering student at UC Irvine, passionate about building
            innovative solutions and creating exceptional user experiences.
          </Typography>
        </Box>

        {/* Skill Tags */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: { xs: 1, sm: 1.5, md: 2 },
            animation: `${fadeInUp} 1s ease-out`,
            animationDelay: '0.4s',
            animationFillMode: 'backwards',
            maxWidth: '100%',
            px: { xs: 2, sm: 0 },
          }}
        >
          {skills.map((skill, index) => (
            <Chip
              key={index}
              icon={skill.icon}
              label={skill.label}
              sx={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontWeight: 600,
                fontSize: { xs: '0.875rem', md: '1rem' },
                px: { xs: 1.5, md: 2 },
                py: { xs: 2, md: 2.5 },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '& .MuiChip-icon': {
                  color: '#fff',
                  fontSize: { xs: '1rem', md: '1.25rem' },
                },
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.25)',
                  transform: 'translateY(-4px) scale(1.05)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                },
              }}
            />
          ))}
        </Box>

      </Container>

      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          bottom: { xs: 20, md: 24 },
          transform: 'translateX(-50%)',
          zIndex: 3,
          width: { xs: 220, sm: 280 },
          px: 1.25,
          py: 0.85,
          borderRadius: 999,
          border: '1px solid rgba(255, 255, 255, 0.24)',
          bgcolor: 'rgba(7, 18, 30, 0.52)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
          userSelect: 'none',
          animation: `${fadeIn} 1s ease-out`,
          animationDelay: '0.6s',
          animationFillMode: 'backwards',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.72rem',
            color: 'rgba(233, 245, 255, 0.82)',
            textAlign: 'center',
            mb: 0.7,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}
        >
          Camera Drift
        </Typography>
        <Box
          ref={stickTrackRef}
          onPointerDown={handleStickPointerDown}
          onPointerMove={handleStickPointerMove}
          onPointerUp={handleStickPointerEnd}
          onPointerCancel={handleStickPointerEnd}
          onLostPointerCapture={handleStickPointerEnd}
          sx={{
            position: 'relative',
            height: 28,
            borderRadius: 999,
            background: 'linear-gradient(90deg, rgba(255, 132, 132, 0.22), rgba(255, 255, 255, 0.2), rgba(136, 208, 255, 0.26))',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            cursor: 'ew-resize',
            touchAction: 'pan-y',
          }}
          aria-label="Horizontal camera control"
        >
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 2,
              height: 14,
              bgcolor: 'rgba(255,255,255,0.35)',
              transform: 'translate(-50%, -50%)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: STICK_KNOB_RADIUS_PX * 2,
              height: STICK_KNOB_RADIUS_PX * 2,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.85)',
              background:
                'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(166, 222, 255, 0.5) 65%, rgba(97, 174, 225, 0.5) 100%)',
              boxShadow: '0 0 0 4px rgba(168, 226, 255, 0.16), 0 8px 18px rgba(0, 0, 0, 0.28)',
              transform: `translate(calc(-50% + ${stickRatio * 90}px), -50%)`,
              transition: isStickDragging ? 'none' : 'transform 180ms ease-out',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AnimatedHero;
