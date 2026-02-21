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

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Canvas } from '@react-three/fiber';
import PageLayout from '../../../components/layout/PageLayout';
import OceanScene from '../components/OceanScene';
import { useTitle } from '../../../hooks/useTitle';

/** Color mode type matching the rest of the app */
type ColorMode = 'light' | 'dark';

interface WaveSimulationProps {
    mode: ColorMode;
    setMode: (mode: ColorMode) => void;
}

/**
 * WaveSimulation page — fullscreen 3D ocean wave simulation with bloom,
 * atmospheric sky, and animated wave geometry.
 */
const WaveSimulation: React.FC<WaveSimulationProps> = ({ mode, setMode }) => {
    useTitle('theJunkyard: Wave Simulation');

    return (
        <PageLayout mode={mode} setMode={setMode} sx={{}}>
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: 'calc(100vh - 64px)', // full viewport minus appbar
                    minHeight: 500,
                    mt: '64px', // offset for fixed appbar
                }}
            >
                {/* Overlay title */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: { xs: 24, sm: 40 },
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
                <Canvas
                    camera={{ position: [0, 3, 14], fov: 60, near: 0.1, far: 200 }}
                    gl={{
                        antialias: true,
                        toneMapping: 0, // handled by postprocessing
                        outputColorSpace: 'srgb',
                    }}
                    dpr={[1, 1.5]}
                    style={{ width: '100%', height: '100%', display: 'block' }}
                >
                    <OceanScene />
                </Canvas>
            </Box>
        </PageLayout>
    );
};

export default WaveSimulation;
