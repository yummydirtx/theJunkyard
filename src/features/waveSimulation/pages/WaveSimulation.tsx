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

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import PageLayout from '../../../components/layout/PageLayout';
import OceanScene, {
    type OceanPostTuning,
    type OceanQuality,
    type OceanTuning,
    getOceanTuningFromQuality,
} from '../components/OceanScene';
import { useTitle } from '../../../hooks/useTitle';

/** Color mode type matching the rest of the app */
type ColorMode = 'light' | 'dark';

interface WaveSimulationProps {
    mode: ColorMode;
    setMode: (mode: ColorMode) => void;
}

type AdjustableParamKey =
    | 'waveAmplitude'
    | 'choppiness'
    | 'windSpeed'
    | 'depthMeters'
    | 'detailIntensity'
    | 'foamIntensity'
    | 'glintIntensity'
    | 'bloomIntensity'
    | 'bloomThreshold'
    | 'bloomSmoothing';

const PARAMETER_CONFIG: Array<{
    key: AdjustableParamKey;
    label: string;
    min: number;
    max: number;
    step: number;
    format?: (value: number) => string;
}> = [
    { key: 'waveAmplitude', label: 'Wave Height', min: 0.55, max: 1.45, step: 0.01 },
    { key: 'choppiness', label: 'Choppiness', min: 0.7, max: 1.35, step: 0.01 },
    { key: 'windSpeed', label: 'Wind Speed', min: 0.55, max: 1.6, step: 0.01 },
    { key: 'depthMeters', label: 'Water Depth', min: 40, max: 140, step: 1, format: (v) => `${Math.round(v)}m` },
    { key: 'detailIntensity', label: 'Surface Detail', min: 0.3, max: 1.6, step: 0.01 },
    { key: 'foamIntensity', label: 'Foam Amount', min: 0.3, max: 1.8, step: 0.01 },
    { key: 'glintIntensity', label: 'Sun Glints', min: 0.0, max: 2.0, step: 0.01 },
    { key: 'bloomIntensity', label: 'Bloom', min: 0.0, max: 0.9, step: 0.01 },
    { key: 'bloomThreshold', label: 'Bloom Threshold', min: 0.4, max: 1.0, step: 0.01 },
    { key: 'bloomSmoothing', label: 'Bloom Smoothing', min: 0.1, max: 1.0, step: 0.01 },
];

/**
 * WaveSimulation page — fullscreen 3D ocean wave simulation with bloom,
 * atmospheric sky, and animated wave geometry.
 */
const WaveSimulation: React.FC<WaveSimulationProps> = ({ mode, setMode }) => {
    useTitle('theJunkyard: Wave Simulation');
    const [menuOpen, setMenuOpen] = useState(false);
    const [postProcessingEnabled, setPostProcessingEnabled] = useState<boolean>(() => {
        if (typeof window === 'undefined') {
            return true;
        }
        return window.localStorage.getItem('wave-post-processing') !== 'off';
    });
    const [quality, setQuality] = useState<OceanQuality>(() => {
        if (typeof window === 'undefined') {
            return 'balanced';
        }
        const stored = window.localStorage.getItem('wave-quality');
        if (stored === 'low' || stored === 'balanced' || stored === 'ultra') {
            return stored;
        }
        return 'balanced';
    });
    const [draftTuning, setDraftTuning] = useState<OceanTuning>(() => getOceanTuningFromQuality(quality));
    const tuningRef = useRef<OceanTuning>(getOceanTuningFromQuality(quality));
    const [postTuning, setPostTuning] = useState<OceanPostTuning>(() => {
        const initial = getOceanTuningFromQuality(quality);
        return {
            bloomIntensity: initial.bloomIntensity,
            bloomThreshold: initial.bloomThreshold,
            bloomSmoothing: initial.bloomSmoothing,
        };
    });

    const syncPostTuning = (next: OceanTuning) => {
        setPostTuning({
            bloomIntensity: next.bloomIntensity,
            bloomThreshold: next.bloomThreshold,
            bloomSmoothing: next.bloomSmoothing,
        });
    };

    useEffect(() => {
        window.localStorage.setItem('wave-quality', quality);
    }, [quality]);

    useEffect(() => {
        window.localStorage.setItem('wave-post-processing', postProcessingEnabled ? 'on' : 'off');
    }, [postProcessingEnabled]);

    useEffect(() => {
        const nextTuning = getOceanTuningFromQuality(quality);
        setDraftTuning(nextTuning);
        tuningRef.current = nextTuning;
        syncPostTuning(nextTuning);
    }, [quality]);

    const handleTuningPreview = (key: AdjustableParamKey) => (_event: Event, value: number | number[]) => {
        if (typeof value === 'number') {
            setDraftTuning((prev) => ({ ...prev, [key]: value }));
        }
    };

    const handleTuningCommit = (key: AdjustableParamKey) => (_event: Event | React.SyntheticEvent, value: number | number[]) => {
        if (typeof value === 'number') {
            setDraftTuning((prev) => {
                const next = { ...prev, [key]: value };
                tuningRef.current = next;
                return next;
            });

            if (key === 'bloomIntensity' || key === 'bloomThreshold' || key === 'bloomSmoothing') {
                setPostTuning((prev) => ({ ...prev, [key]: value }));
            }
        }
    };

    const canvasSettings = useMemo(() => {
        if (quality === 'low') {
            return {
                dpr: [0.65, 0.9] as [number, number],
                antialias: false,
                toneMapping: postProcessingEnabled && postTuning.bloomIntensity > 0.01 ? 0 : THREE.ACESFilmicToneMapping,
            };
        }
        if (quality === 'ultra') {
            return {
                dpr: [0.95, 1.35] as [number, number],
                antialias: true,
                toneMapping: postProcessingEnabled ? 0 : THREE.ACESFilmicToneMapping,
            };
        }
        return {
            dpr: [0.75, 1.1] as [number, number],
            antialias: false,
            toneMapping: postProcessingEnabled ? 0 : THREE.ACESFilmicToneMapping,
        };
    }, [postProcessingEnabled, quality, postTuning.bloomIntensity]);

    const canvasView = useMemo(
        () => (
            <Canvas
                camera={{ position: [0, 3, 14], fov: 60, near: 0.1, far: 200 }}
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
                    enablePostProcessing={postProcessingEnabled}
                />
            </Canvas>
        ),
        [canvasSettings, postProcessingEnabled, quality, postTuning]
    );

    return (
        <PageLayout
            mode={mode}
            setMode={setMode}
            sx={{
                backgroundImage: 'none',
                backgroundColor: 'transparent',
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100vh',
                    minHeight: '100vh',
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: { xs: 84, sm: 92 },
                        right: { xs: 12, sm: 18 },
                        zIndex: 12,
                        width: { xs: menuOpen ? 238 : 74, sm: 284 },
                        borderRadius: 2,
                        border: '1px solid rgba(255,255,255,0.22)',
                        bgcolor: 'rgba(9, 18, 28, 0.28)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
                        pointerEvents: 'auto',
                        overflow: 'hidden',
                        transformOrigin: 'top right',
                        willChange: 'width',
                        transition: (theme) =>
                            theme.transitions.create('width', {
                                duration: menuOpen
                                    ? theme.transitions.duration.enteringScreen
                                    : theme.transitions.duration.leavingScreen,
                                easing: menuOpen ? theme.transitions.easing.easeOut : theme.transitions.easing.sharp,
                            }),
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: { xs: 0.55, sm: 1.25 },
                            py: { xs: 0.5, sm: 0.75 },
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 0.75 } }}>
                            <TuneRoundedIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.9)' }} />
                            <Typography
                                sx={{
                                    display: { xs: 'none', sm: 'block' },
                                    color: 'rgba(255,255,255,0.92)',
                                    fontWeight: 600,
                                    fontSize: '0.86rem',
                                }}
                            >
                                Quality
                            </Typography>
                        </Box>
                        <IconButton
                            size="small"
                            onClick={() => setMenuOpen((open) => !open)}
                            sx={{ color: 'rgba(255,255,255,0.9)' }}
                            aria-label="Toggle quality menu"
                        >
                            {menuOpen ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
                        </IconButton>
                    </Box>

                    <Collapse in={menuOpen}>
                        <Box
                            sx={{
                                px: 1.25,
                                pb: 1.25,
                                maxHeight: { xs: 'calc(100vh - 170px)', sm: 'calc(100vh - 190px)' },
                                overflowY: 'auto',
                                overscrollBehavior: 'contain',
                            }}
                        >
                            <ToggleButtonGroup
                                value={quality}
                                exclusive
                                onChange={(_, value: OceanQuality | null) => {
                                    if (value) {
                                        setQuality(value);
                                    }
                                }}
                                fullWidth
                                size="small"
                                color="primary"
                            >
                                <ToggleButton value="low" sx={{ textTransform: 'none', color: '#e8f3ff' }}>
                                    Low
                                </ToggleButton>
                                <ToggleButton value="balanced" sx={{ textTransform: 'none', color: '#e8f3ff' }}>
                                    Balanced
                                </ToggleButton>
                                <ToggleButton value="ultra" sx={{ textTransform: 'none', color: '#e8f3ff' }}>
                                    Ultra
                                </ToggleButton>
                            </ToggleButtonGroup>
                            <Typography
                                sx={{
                                    mt: 0.9,
                                    color: 'rgba(230,240,255,0.82)',
                                    fontSize: '0.72rem',
                                    lineHeight: 1.3,
                                }}
                            >
                                {quality === 'low' && 'Fastest rendering with simplified effects.'}
                                {quality === 'balanced' && 'Recommended quality/performance balance.'}
                                {quality === 'ultra' && 'Highest fidelity, strongest GPU load.'}
                            </Typography>
                            <Typography
                                sx={{
                                    mt: 0.45,
                                    color: 'rgba(190,216,245,0.75)',
                                    fontSize: '0.66rem',
                                    lineHeight: 1.2,
                                }}
                            >
                                Drag sliders, release to apply.
                            </Typography>

                            <Divider sx={{ my: 1.2, borderColor: 'rgba(255,255,255,0.16)' }} />

                            <FormControlLabel
                                sx={{
                                    m: 0,
                                    mb: 0.65,
                                    '& .MuiFormControlLabel-label': {
                                        color: 'rgba(232,243,255,0.9)',
                                        fontSize: '0.74rem',
                                        fontWeight: 600,
                                        letterSpacing: '0.01em',
                                    },
                                }}
                                control={(
                                    <Switch
                                        checked={postProcessingEnabled}
                                        onChange={(_event, checked) => setPostProcessingEnabled(checked)}
                                        size="small"
                                    />
                                )}
                                label="Enable Post Processing"
                            />

                            <Stack spacing={0.95}>
                                {PARAMETER_CONFIG.map((param) => {
                                    const rawValue = draftTuning[param.key];
                                    const valueText = param.format ? param.format(rawValue) : rawValue.toFixed(2);
                                    return (
                                        <Box key={param.key}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.2 }}>
                                                <Typography sx={{ color: 'rgba(238,245,255,0.9)', fontSize: '0.7rem' }}>
                                                    {param.label}
                                                </Typography>
                                                <Typography sx={{ color: 'rgba(215,232,255,0.82)', fontSize: '0.68rem' }}>
                                                    {valueText}
                                                </Typography>
                                            </Box>
                                            <Slider
                                                value={rawValue}
                                                min={param.min}
                                                max={param.max}
                                                step={param.step}
                                                onChange={handleTuningPreview(param.key)}
                                                onChangeCommitted={handleTuningCommit(param.key)}
                                                size="small"
                                                sx={{
                                                    color: '#8bc8ff',
                                                    py: 0.2,
                                                    '& .MuiSlider-thumb': {
                                                        width: 11,
                                                        height: 11,
                                                    },
                                                }}
                                            />
                                        </Box>
                                    );
                                })}
                            </Stack>

                            <Button
                                variant="outlined"
                                size="small"
                                fullWidth
                                onClick={() => {
                                    const nextTuning = getOceanTuningFromQuality(quality);
                                    setDraftTuning(nextTuning);
                                    tuningRef.current = nextTuning;
                                    syncPostTuning(nextTuning);
                                }}
                                sx={{
                                    mt: 1,
                                    textTransform: 'none',
                                    borderColor: 'rgba(255,255,255,0.3)',
                                    color: '#e8f3ff',
                                }}
                            >
                                Reset To {quality}
                            </Button>
                        </Box>
                    </Collapse>
                </Box>

                {/* Overlay title */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: { xs: 84, sm: 104 },
                        left: 0,
                        right: 0,
                        zIndex: 10,
                        textAlign: 'center',
                        pointerEvents: 'none',
                    }}
                >
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 800,
                            letterSpacing: '-0.02em',
                            color: '#fff',
                            textShadow: '0 2px 32px rgba(0,0,0,0.55), 0 1px 6px rgba(0,0,0,0.35)',
                            fontSize: { xs: '2rem', sm: '3rem', md: '3.5rem' },
                        }}
                    >
                        Ocean Waves
                    </Typography>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            color: 'rgba(255,255,255,0.78)',
                            textShadow: '0 1px 12px rgba(0,0,0,0.5)',
                            mt: 1,
                            fontSize: { xs: '0.9rem', sm: '1.1rem' },
                        }}
                    >
                        Real-time 3D wave simulation with bloom &amp; atmospheric lighting
                    </Typography>
                </Box>

                {/* Three.js canvas */}
                {canvasView}
            </Box>
        </PageLayout>
    );
};

export default WaveSimulation;
