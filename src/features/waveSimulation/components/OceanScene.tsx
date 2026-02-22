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

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky, OrbitControls } from '@react-three/drei';
import {
    EffectComposer,
    Bloom,
    ToneMapping,
    Vignette,
} from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';

const WAVE_COUNT = 9;
export type OceanQuality = 'low' | 'balanced' | 'ultra';
export interface OceanTuning {
    waveAmplitude: number;
    choppiness: number;
    windSpeed: number;
    depthMeters: number;
    detailIntensity: number;
    foamIntensity: number;
    glintIntensity: number;
    bloomIntensity: number;
    bloomThreshold: number;
    bloomSmoothing: number;
}

export interface OceanPostTuning {
    bloomIntensity: number;
    bloomThreshold: number;
    bloomSmoothing: number;
}

export interface OceanControlsConfig {
    autoRotate?: boolean;
    autoRotateSpeed?: number;
    enableZoom?: boolean;
    enablePan?: boolean;
    enableRotate?: boolean;
    enableDamping?: boolean;
    dampingFactor?: number;
    minPolarAngle?: number;
    maxPolarAngle?: number;
    minAzimuthAngle?: number;
    maxAzimuthAngle?: number;
    minDistance?: number;
    maxDistance?: number;
}

interface OceanQualityPreset extends OceanTuning {
    segments: number;
}

const WIND_DIRECTION = new THREE.Vector2(1, 0.35).normalize();
const SKY_SUN_POSITION = new THREE.Vector3(140, 26, 78);
const SUN_DIRECTION = SKY_SUN_POSITION.clone().normalize();

export const OCEAN_QUALITY_PRESETS: Record<OceanQuality, OceanQualityPreset> = {
    low: {
        segments: 170,
        waveAmplitude: 0.86,
        choppiness: 0.9,
        windSpeed: 0.92,
        depthMeters: 85,
        detailIntensity: 0.56,
        foamIntensity: 0.66,
        glintIntensity: 0.72,
        bloomIntensity: 0.0,
        bloomThreshold: 1.0,
        bloomSmoothing: 1.0,
    },
    balanced: {
        segments: 260,
        waveAmplitude: 1.0,
        choppiness: 1.02,
        windSpeed: 1.0,
        depthMeters: 95,
        detailIntensity: 1.0,
        foamIntensity: 1.0,
        glintIntensity: 1.0,
        bloomIntensity: 0.42,
        bloomThreshold: 0.84,
        bloomSmoothing: 0.9,
    },
    ultra: {
        segments: 320,
        waveAmplitude: 1.06,
        choppiness: 1.06,
        windSpeed: 1.03,
        depthMeters: 105,
        detailIntensity: 1.18,
        foamIntensity: 1.08,
        glintIntensity: 1.15,
        bloomIntensity: 0.6,
        bloomThreshold: 0.8,
        bloomSmoothing: 0.9,
    },
};

export const getOceanTuningFromQuality = (quality: OceanQuality): OceanTuning => {
    const preset = OCEAN_QUALITY_PRESETS[quality];
    return {
        waveAmplitude: preset.waveAmplitude,
        choppiness: preset.choppiness,
        windSpeed: preset.windSpeed,
        depthMeters: preset.depthMeters,
        detailIntensity: preset.detailIntensity,
        foamIntensity: preset.foamIntensity,
        glintIntensity: preset.glintIntensity,
        bloomIntensity: preset.bloomIntensity,
        bloomThreshold: preset.bloomThreshold,
        bloomSmoothing: preset.bloomSmoothing,
    };
};

const MAIN_LIGHT_POSITION: [number, number, number] = [
    SUN_DIRECTION.x * 70,
    SUN_DIRECTION.y * 70,
    SUN_DIRECTION.z * 70,
];

const FILL_LIGHT_POSITION: [number, number, number] = [
    -SUN_DIRECTION.x * 62,
    Math.max(8, -SUN_DIRECTION.y * 62 + 16),
    -SUN_DIRECTION.z * 62,
];

const DEFAULT_CONTROLS_CONFIG: Required<OceanControlsConfig> = {
    autoRotate: true,
    autoRotateSpeed: 0.2,
    enableZoom: true,
    enablePan: false,
    enableRotate: true,
    enableDamping: true,
    dampingFactor: 0.045,
    maxPolarAngle: Math.PI / 2.2,
    minPolarAngle: Math.PI / 5.2,
    minAzimuthAngle: -Infinity,
    maxAzimuthAngle: Infinity,
    minDistance: 6,
    maxDistance: 55,
};

const pseudoRandom = (seed: number): number => {
    const x = Math.sin(seed * 12.9898 + seed * seed * 78.233) * 43758.5453123;
    return x - Math.floor(x);
};

const rotate2D = (vector: THREE.Vector2, angle: number): THREE.Vector2 => {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new THREE.Vector2(vector.x * c - vector.y * s, vector.x * s + vector.y * c);
};

const buildWaveSpectrum = (count: number, windDirection: THREE.Vector2) => {
    const waveA: THREE.Vector4[] = [];
    const waveB: THREE.Vector4[] = [];
    const crossSwellDirection = rotate2D(windDirection, -Math.PI / 3.15).normalize();

    for (let i = 0; i < count; i += 1) {
        const t = i / (count - 1);
        const wavelength = THREE.MathUtils.lerp(34, 1.2, Math.pow(t, 0.7));
        const peak = Math.exp(-Math.pow((t - 0.28) / 0.24, 2.0));
        const amplitude = THREE.MathUtils.lerp(1.2, 0.055, Math.pow(t, 0.58)) * (0.52 + peak * 0.48);

        const spread = THREE.MathUtils.lerp(0.08, 0.94, Math.pow(t, 1.04));
        const directionalBlend = THREE.MathUtils.clamp(0.43 - Math.abs(t - 0.3) * 2.2, 0, 0.43);
        const baseDirection = windDirection.clone().lerp(crossSwellDirection, directionalBlend).normalize();
        const jitter =
            (pseudoRandom(10.7 + i * 17.17) - 0.5) * spread
            + (pseudoRandom(55.2 + i * 7.19) - 0.5) * spread * 0.55;

        const direction = rotate2D(baseDirection, jitter).normalize();
        const directionalDamping = Math.pow(
            THREE.MathUtils.clamp(direction.dot(windDirection) * 0.5 + 0.5, 0, 1),
            THREE.MathUtils.lerp(4.0, 1.5, t)
        );

        const speedScale = THREE.MathUtils.lerp(1.24, 0.78, t) * THREE.MathUtils.lerp(0.94, 1.08, pseudoRandom(8.1 + i * 5.3));
        const steepness = THREE.MathUtils.lerp(0.55, 1.02, Math.pow(t, 0.72));
        const phase = pseudoRandom(92.0 + i * 13.17) * Math.PI * 2.0;

        waveA.push(new THREE.Vector4(direction.x, direction.y, amplitude * THREE.MathUtils.lerp(0.38, 1.0, directionalDamping), wavelength));
        waveB.push(new THREE.Vector4(speedScale, steepness, phase, spread));
    }

    return { waveA, waveB };
};

const formatFloat = (value: number) => value.toFixed(6);
const WAVE_SPECTRUM = buildWaveSpectrum(WAVE_COUNT, WIND_DIRECTION);

const WAVE_VERTEX_SNIPPET = WAVE_SPECTRUM.waveA.map((a, index) => {
    const b = WAVE_SPECTRUM.waveB[index];
    return `
    {
        vec2 dir = normalize(vec2(${formatFloat(a.x)}, ${formatFloat(a.y)}));
        float amp = ${formatFloat(a.z)} * uWaveAmplitude;
        float wavelength = ${formatFloat(a.w)};
        float speedScale = ${formatFloat(b.x)};
        float steepness = ${formatFloat(b.y)};
        float phaseOffset = ${formatFloat(b.z)};
        float spread = ${formatFloat(b.w)};

        float directionalBoost = mix(0.82, 1.18, clamp(dot(dir, uWindDirection) * 0.5 + 0.5, 0.0, 1.0));
        float envelopeA = 0.86 + 0.30 * sin(dot(xz, dir * (0.011 + spread * 0.016)) + uTime * 0.11 + ${formatFloat((index + 1) * 1.21)});
        float envelopeB = 0.90 + 0.22 * sin(dot(xz, vec2(-dir.y, dir.x) * (0.008 + spread * 0.01)) - uTime * 0.08 + ${formatFloat((index + 1) * 0.79)});
        amp *= gust * directionalBoost * envelopeA * envelopeB;

        float k = 6.28318530718 / wavelength;
        float finiteDepth = max(tanhApprox(k * uDepthMeters), 0.16);
        float omega = sqrt(9.81 * k * finiteDepth) * speedScale * uWindSpeed;
        float phase = k * dot(dir, xz) - omega * uTime + phaseOffset;
        float s = sin(phase);
        float c = cos(phase);

        float q = min(1.0, (uChoppiness * steepness) / max(k * amp * ${formatFloat(WAVE_COUNT)}, 0.0001));
        float ak = amp * k;
        float waveTerm = q * ak * s;

        displacement.x += dir.x * q * amp * c;
        displacement.y += amp * s;
        displacement.z += dir.y * q * amp * c;

        dPdX.x += -dir.x * dir.x * waveTerm;
        dPdX.y += dir.x * ak * c;
        dPdX.z += -dir.x * dir.y * waveTerm;

        dPdZ.x += -dir.x * dir.y * waveTerm;
        dPdZ.y += dir.y * ak * c;
        dPdZ.z += -dir.y * dir.y * waveTerm;

        crestAccum += max(0.0, s) * ak;
    }`;
}).join('\n');

const oceanVertexShader = /* glsl */ `
uniform float uTime;
uniform float uWaveAmplitude;
uniform float uChoppiness;
uniform float uWindSpeed;
uniform float uDepthMeters;
uniform float uDetailIntensity;
uniform vec2 uWindDirection;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying float vElevation;
varying float vJacobian;
varying float vDepthFade;
varying float vBreaking;
varying float vSlope;
varying float vFoamTrail;
varying float vMicroRoughness;

float hash2D(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash2D(i);
    float b = hash2D(i + vec2(1.0, 0.0));
    float c = hash2D(i + vec2(0.0, 1.0));
    float d = hash2D(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
        v += a * valueNoise(p);
        p *= 2.0;
        a *= 0.5;
    }
    return v;
}
float tanhApprox(float x) {
    float clamped = clamp(x, -10.0, 10.0);
    float e2x = exp(2.0 * clamped);
    return (e2x - 1.0) / (e2x + 1.0);
}

void main() {
    vec3 displaced = position;
    vec2 xz = position.xz;
    vec2 crossWind = vec2(-uWindDirection.y, uWindDirection.x);

    float gustField = fbm(xz * 0.006 + uWindDirection * (uTime * 0.042 * uWindSpeed));
    gustField += fbm(xz * 0.015 + crossWind * 3.2 - uWindDirection * (uTime * 0.067 * uWindSpeed)) * 0.5;
    float gust = mix(0.72, 1.28, clamp(gustField, 0.0, 1.0));

    vec3 displacement = vec3(0.0);
    vec3 dPdX = vec3(1.0, 0.0, 0.0);
    vec3 dPdZ = vec3(0.0, 0.0, 1.0);
    float crestAccum = 0.0;

${WAVE_VERTEX_SNIPPET}

    float capillaryA = (fbm(xz * 0.22 + vec2(uTime * 0.24, -uTime * 0.17)) - 0.5) * 0.12 * uDetailIntensity;
    float capillaryB = (valueNoise(xz * 0.39 + vec2(-uTime * 0.29, uTime * 0.2) + 40.0) - 0.5) * 0.05 * uDetailIntensity;
    displacement.y += capillaryA + capillaryB;
    displacement.x += sin(xz.y * 0.06 + uTime * 0.4) * 0.015 * uDetailIntensity;
    displacement.z += cos(xz.x * 0.06 - uTime * 0.35) * 0.015 * uDetailIntensity;
    displaced += displacement;

    vec3 normal = normalize(cross(dPdZ, dPdX));
    float jacobian = dPdX.x * dPdZ.z - dPdZ.x * dPdX.z;
    float slope = clamp(1.0 - normal.y, 0.0, 1.0);

    vWorldPosition = (modelMatrix * vec4(displaced, 1.0)).xyz;
    vNormal = normal;
    vElevation = displacement.y;
    vJacobian = jacobian;
    vSlope = slope;
    vBreaking = clamp(crestAccum * ${formatFloat(1 / WAVE_COUNT)} * 1.33, 0.0, 1.0);
    float trailField = fbm(vec2(dot(xz, uWindDirection) * 0.08, dot(xz, crossWind) * 0.32) + vec2(uTime * 0.36, 0.0));
    vFoamTrail = smoothstep(0.56, 0.89, trailField) * smoothstep(0.18, 0.74, slope);
    vMicroRoughness = clamp(0.22 + 0.5 * gust + 0.4 * abs(capillaryA + capillaryB), 0.0, 1.0);

    float camDist = length((modelViewMatrix * vec4(displaced, 1.0)).xyz);
    vDepthFade = smoothstep(12.0, 140.0, camDist);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

const oceanFragmentShader = /* glsl */ `
uniform vec3 uDeepColor;
uniform vec3 uShallowColor;
uniform vec3 uSkyColor;
uniform vec3 uSunDirection;
uniform vec3 uFoamTint;
uniform vec2 uWindDirection;
uniform float uTime;
uniform float uDetailIntensity;
uniform float uFoamIntensity;
uniform float uGlintIntensity;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying float vElevation;
varying float vJacobian;
varying float vDepthFade;
varying float vBreaking;
varying float vSlope;
varying float vFoamTrail;
varying float vMicroRoughness;

float hash2D(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash2D(i);
    float b = hash2D(i + vec2(1.0, 0.0));
    float c = hash2D(i + vec2(0.0, 1.0));
    float d = hash2D(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
        v += a * valueNoise(p);
        p *= 2.0;
        a *= 0.5;
    }
    return v;
}
float clamp01(float x) {
    return clamp(x, 0.0, 1.0);
}
float distributionGGX(float NdotH, float roughness) {
    float alpha = roughness * roughness;
    float alpha2 = alpha * alpha;
    float denom = NdotH * NdotH * (alpha2 - 1.0) + 1.0;
    return alpha2 / max(3.14159265 * denom * denom, 0.0001);
}
float geometrySchlickGGX(float NdotX, float roughness) {
    float r = roughness + 1.0;
    float k = (r * r) / 8.0;
    return NdotX / max(NdotX * (1.0 - k) + k, 0.0001);
}
float geometrySmith(float NdotV, float NdotL, float roughness) {
    return geometrySchlickGGX(NdotV, roughness) * geometrySchlickGGX(NdotL, roughness);
}

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 sunDir = normalize(uSunDirection);
    vec2 uv = vWorldPosition.xz;
    vec2 crossWind = vec2(-uWindDirection.y, uWindDirection.x);

    float detailFade = 1.0 - vDepthFade;
    float detailStrength = mix(0.03, 0.15, detailFade) * (0.74 + 0.38 * vMicroRoughness) * uDetailIntensity;
    vec3 detail1 = vec3(
        fbm(uv * 2.0 + uTime * vec2(0.18, 0.08)) - 0.5,
        1.0,
        fbm(uv * 2.0 + vec2(44.0, -22.0) - uTime * vec2(0.11, -0.09)) - 0.5
    );
    vec3 detail2 = vec3(
        fbm(uv * 5.8 - uTime * vec2(0.28, -0.21)) - 0.5,
        1.0,
        fbm(uv * 5.8 + vec2(-83.0, 62.0) + uTime * vec2(-0.24, 0.23)) - 0.5
    );
    normal = normalize(normal + detail1 * detailStrength + detail2 * detailStrength * 0.58);

    float NdotV = clamp01(dot(normal, viewDir));
    float NdotL = clamp01(dot(normal, sunDir));
    float F0 = 0.0204;
    float fresnel = F0 + (1.0 - F0) * pow(1.0 - NdotV, 5.0);

    float depthFactor = smoothstep(-2.9, 2.7, vElevation);
    vec3 waterColor = mix(uDeepColor, uShallowColor, depthFactor);
    float opticalDepth = max(0.2, -vElevation + 1.3 + vSlope * 1.45);
    vec3 absorption = exp(-vec3(0.42, 0.11, 0.045) * opticalDepth);
    waterColor *= absorption;
    waterColor = mix(waterColor, vec3(0.02, 0.08, 0.1), smoothstep(-1.5, 0.4, vElevation) * 0.18);

    vec3 halfDir = normalize(viewDir + sunDir);
    float roughness = mix(0.13, 0.04, detailFade) * mix(1.18, 0.86, vMicroRoughness);
    float NdotH = clamp01(dot(normal, halfDir));
    float D = distributionGGX(NdotH, roughness);
    float G = geometrySmith(NdotV, NdotL, roughness);
    float specularTerm = (D * G * fresnel) / max(4.0 * max(NdotV, 0.001) * max(NdotL, 0.001), 0.001);
    vec3 specular = vec3(1.0, 0.97, 0.92) * specularTerm * (2.2 + detailFade * 0.7);

    float glintNoise = valueNoise(vec2(dot(uv, uWindDirection) * 36.0, dot(uv, crossWind) * 10.2) + vec2(uTime * 0.62, -uTime * 0.18));
    float glintMask = smoothstep(0.72, 0.97, glintNoise + detailFade * 0.14 + vMicroRoughness * 0.08);
    float glint = pow(clamp01(dot(reflect(-sunDir, normal), viewDir)), 220.0) * glintMask * detailFade;
    specular += vec3(1.0, 0.99, 0.95) * glint * 2.5 * uGlintIntensity;

    vec3 reflectDir = reflect(-viewDir, normal);
    float skyMix = smoothstep(-0.25, 0.72, reflectDir.y);
    vec3 horizonTint = mix(vec3(0.03, 0.09, 0.16), vec3(0.18, 0.24, 0.3), smoothstep(-0.4, 0.15, reflectDir.y));
    vec3 envColor = mix(horizonTint, uSkyColor, skyMix);
    envColor += vec3(1.0, 0.84, 0.6) * pow(clamp01(dot(reflectDir, sunDir)), 140.0) * 1.35;

    float jacobianFoam = 1.0 - smoothstep(-0.2, 0.62, vJacobian);
    float crestFoam = smoothstep(0.24, 0.92, vBreaking);
    float slopeFoam = smoothstep(0.22, 0.82, vSlope);
    float foamNoiseA = fbm(uv * 2.5 + vec2(uTime * 0.12, -uTime * 0.06));
    float foamNoiseB = valueNoise(uv * 6.4 + vec2(-uTime * 0.08, uTime * 0.1));
    float windAligned = fbm(vec2(dot(uv, uWindDirection) * 2.0, dot(uv, crossWind) * 6.9) + vec2(uTime * 0.37, 0.0));
    float trailFoam = smoothstep(0.57, 0.86, windAligned) * vFoamTrail;

    float totalFoam = jacobianFoam * 0.72 + crestFoam * 0.64 + slopeFoam * 0.24;
    totalFoam *= smoothstep(0.24, 0.72, foamNoiseA + 0.22);
    totalFoam *= 0.76 + 0.24 * smoothstep(0.3, 0.7, foamNoiseB);
    totalFoam *= uFoamIntensity;
    totalFoam = clamp(totalFoam + trailFoam * 0.78, 0.0, 1.0);
    totalFoam *= mix(1.0, 0.5, vDepthFade);
    vec3 foamColor = mix(uFoamTint, vec3(0.98, 0.99, 1.0), clamp01(totalFoam * 1.2));
    vec3 litFoam = foamColor * (0.58 + 0.42 * NdotL);

    float forwardScatter = pow(clamp01(dot(viewDir, -sunDir + normal * 0.45)), 2.9);
    float horizonScatter = pow(1.0 - NdotV, 2.25);
    vec3 subsurface = vec3(0.03, 0.28, 0.24) * forwardScatter * (0.42 + 0.58 * vSlope);
    subsurface += vec3(0.015, 0.09, 0.12) * horizonScatter * (1.0 - fresnel);

    vec3 baseDiffuse = waterColor * (0.27 + 0.73 * NdotL);
    vec3 color = mix(baseDiffuse, envColor, fresnel * 0.84);
    color += specular;
    color += subsurface;
    color = mix(color, litFoam, totalFoam * 0.92);

    float sprayNoise = valueNoise(uv * 7.0 + vec2(uTime * 0.21, -uTime * 0.17));
    float spray = smoothstep(0.48, 1.0, vBreaking) * smoothstep(0.24, 0.84, vSlope) * smoothstep(0.52, 0.9, sprayNoise);
    spray *= uFoamIntensity;
    color += vec3(0.12, 0.14, 0.16) * spray * 0.22;

    float dist = length(vWorldPosition - cameraPosition);
    float distFog = 1.0 - exp(-dist * 0.0104);
    float heightFog = exp(-max(vWorldPosition.y, 0.0) * 0.27);
    float fogAmount = distFog * heightFog;
    float sunAlignment = clamp01(dot(normalize(vWorldPosition - cameraPosition), sunDir));
    vec3 fogColor = mix(vec3(0.5, 0.62, 0.74), vec3(0.91, 0.75, 0.56), pow(sunAlignment, 5.0));
    color = mix(color, fogColor, fogAmount * (0.58 + 0.28 * horizonScatter));

    gl_FragColor = vec4(color, 1.0);
}
`;

interface OceanMeshProps {
    quality: OceanQuality;
    tuningRef: React.MutableRefObject<OceanTuning>;
}

const OceanMesh: React.FC<OceanMeshProps> = ({ quality, tuningRef }) => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const preset = OCEAN_QUALITY_PRESETS[quality];

    const geometry = useMemo(() => {
        const geo = new THREE.PlaneGeometry(900, 900, preset.segments, preset.segments);
        geo.rotateX(-Math.PI / 2);
        return geo;
    }, [preset.segments]);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uWaveAmplitude: { value: preset.waveAmplitude },
            uChoppiness: { value: preset.choppiness },
            uWindSpeed: { value: preset.windSpeed },
            uDepthMeters: { value: preset.depthMeters },
            uDetailIntensity: { value: preset.detailIntensity },
            uFoamIntensity: { value: preset.foamIntensity },
            uGlintIntensity: { value: preset.glintIntensity },
            uWindDirection: { value: WIND_DIRECTION.clone() },
            uDeepColor: { value: new THREE.Color('#001a33') },
            uShallowColor: { value: new THREE.Color('#0d7aa7') },
            uSkyColor: { value: new THREE.Color('#91c7f5') },
            uSunDirection: { value: SUN_DIRECTION.clone() },
            uFoamTint: { value: new THREE.Color('#a9c4cf') },
        }),
        [preset]
    );

    useFrame(({ clock }) => {
        if (!materialRef.current) {
            return;
        }

        const tuning = tuningRef.current;
        const shaderUniforms = materialRef.current.uniforms;
        shaderUniforms.uTime.value = clock.getElapsedTime();
        shaderUniforms.uWaveAmplitude.value = tuning.waveAmplitude;
        shaderUniforms.uChoppiness.value = tuning.choppiness;
        shaderUniforms.uWindSpeed.value = tuning.windSpeed;
        shaderUniforms.uDepthMeters.value = tuning.depthMeters;
        shaderUniforms.uDetailIntensity.value = tuning.detailIntensity;
        shaderUniforms.uFoamIntensity.value = tuning.foamIntensity;
        shaderUniforms.uGlintIntensity.value = tuning.glintIntensity;
        shaderUniforms.uSunDirection.value.copy(SUN_DIRECTION);
    });

    return (
        <mesh geometry={geometry}>
            <shaderMaterial
                ref={materialRef}
                vertexShader={oceanVertexShader}
                fragmentShader={oceanFragmentShader}
                uniforms={uniforms}
                side={THREE.FrontSide}
            />
        </mesh>
    );
};

const Lighting: React.FC = () => (
    <>
        <directionalLight position={MAIN_LIGHT_POSITION} intensity={3.35} color="#ffd6a1" />
        <directionalLight position={FILL_LIGHT_POSITION} intensity={0.86} color="#7bbfff" />
        <hemisphereLight args={['#d8edff', '#001b33', 0.6]} />
        <ambientLight intensity={0.12} />
    </>
);

interface OceanSceneProps {
    quality: OceanQuality;
    tuningRef: React.MutableRefObject<OceanTuning>;
    postTuning: OceanPostTuning;
    controls?: OceanControlsConfig;
    enablePostProcessing?: boolean;
}

const OceanScene: React.FC<OceanSceneProps> = ({
    quality,
    tuningRef,
    postTuning,
    controls,
    enablePostProcessing = true,
}) => {
    const controlsConfig = { ...DEFAULT_CONTROLS_CONFIG, ...controls };

    return (
        <>
            <Sky
                distance={450000}
                sunPosition={[SKY_SUN_POSITION.x, SKY_SUN_POSITION.y, SKY_SUN_POSITION.z]}
                inclination={0.48}
                azimuth={0.24}
                turbidity={7}
                rayleigh={2.8}
                mieCoefficient={0.004}
                mieDirectionalG={0.9}
            />

            <Lighting />
            <OceanMesh key={quality} quality={quality} tuningRef={tuningRef} />

            <OrbitControls
                autoRotate={controlsConfig.autoRotate}
                autoRotateSpeed={controlsConfig.autoRotateSpeed}
                enableZoom={controlsConfig.enableZoom}
                enablePan={controlsConfig.enablePan}
                enableRotate={controlsConfig.enableRotate}
                enableDamping={controlsConfig.enableDamping}
                dampingFactor={controlsConfig.dampingFactor}
                maxPolarAngle={controlsConfig.maxPolarAngle}
                minPolarAngle={controlsConfig.minPolarAngle}
                minAzimuthAngle={controlsConfig.minAzimuthAngle}
                maxAzimuthAngle={controlsConfig.maxAzimuthAngle}
                minDistance={controlsConfig.minDistance}
                maxDistance={controlsConfig.maxDistance}
                target={[0, 0, 0]}
            />

            {enablePostProcessing && (quality !== 'low' || postTuning.bloomIntensity > 0.01) && (
                <EffectComposer multisampling={0}>
                    {postTuning.bloomIntensity > 0 && (
                        <Bloom
                            intensity={postTuning.bloomIntensity}
                            luminanceThreshold={postTuning.bloomThreshold}
                            luminanceSmoothing={postTuning.bloomSmoothing}
                        />
                    )}
                    <Vignette eskil={false} offset={0.09} darkness={0.28} />
                    <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
                </EffectComposer>
            )}

            <fog attach="fog" args={['#081f30', 28, 135]} />
        </>
    );
};

export default OceanScene;
