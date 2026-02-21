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

const WAVE_COUNT = 8;
const WIND_DIRECTION = new THREE.Vector2(1, 0.35).normalize();
const SKY_SUN_POSITION = new THREE.Vector3(140, 26, 78);
const SUN_DIRECTION = SKY_SUN_POSITION.clone().normalize();

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
    const crossSwellDirection = rotate2D(windDirection, -Math.PI / 3.0).normalize();

    for (let i = 0; i < count; i += 1) {
        const t = i / (count - 1);
        const wavelength = THREE.MathUtils.lerp(26, 1.4, Math.pow(t, 0.74));
        const peak = Math.exp(-Math.pow((t - 0.28) / 0.27, 2.0));
        const amplitude = THREE.MathUtils.lerp(1.08, 0.08, Math.pow(t, 0.62)) * (0.5 + peak * 0.5);

        const spread = THREE.MathUtils.lerp(0.08, 0.86, Math.pow(t, 1.02));
        const directionalBlend = THREE.MathUtils.clamp(0.42 - Math.abs(t - 0.28) * 2.0, 0, 0.42);
        const baseDirection = windDirection.clone().lerp(crossSwellDirection, directionalBlend).normalize();
        const jitter = (pseudoRandom(11.7 + i * 17.03) - 0.5) * spread;

        const direction = rotate2D(baseDirection, jitter).normalize();
        const directionalDamping = Math.pow(
            THREE.MathUtils.clamp(direction.dot(windDirection) * 0.5 + 0.5, 0, 1),
            THREE.MathUtils.lerp(3.8, 1.7, t)
        );

        const speedScale = THREE.MathUtils.lerp(1.2, 0.8, t) * THREE.MathUtils.lerp(0.95, 1.07, pseudoRandom(8.2 + i * 5.12));
        const steepness = THREE.MathUtils.lerp(0.55, 1.0, Math.pow(t, 0.7));
        const phase = pseudoRandom(92.0 + i * 13.17) * Math.PI * 2.0;

        waveA.push(new THREE.Vector4(direction.x, direction.y, amplitude * THREE.MathUtils.lerp(0.45, 1.0, directionalDamping), wavelength));
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

        float directionalBoost = mix(0.84, 1.16, clamp(dot(dir, uWindDirection) * 0.5 + 0.5, 0.0, 1.0));
        float envelope = 0.88 + 0.28 * sin(dot(xz, dir * (0.012 + spread * 0.015)) + uTime * 0.1 + ${formatFloat((index + 1) * 1.371)});
        amp *= gust * directionalBoost * envelope;

        float k = 6.28318530718 / wavelength;
        float omega = sqrt(9.81 * k) * speedScale * uWindSpeed;
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
uniform vec2 uWindDirection;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying float vElevation;
varying float vJacobian;
varying float vDepthFade;
varying float vBreaking;
varying float vSlope;
varying float vFoamTrail;

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

void main() {
    vec3 displaced = position;
    vec2 xz = position.xz;
    vec2 crossWind = vec2(-uWindDirection.y, uWindDirection.x);

    float gustField = fbm(xz * 0.006 + uWindDirection * (uTime * 0.045 * uWindSpeed));
    gustField += fbm(xz * 0.017 + crossWind * 3.7 - uWindDirection * (uTime * 0.07 * uWindSpeed)) * 0.5;
    float gust = mix(0.74, 1.25, clamp(gustField, 0.0, 1.0));

    vec3 displacement = vec3(0.0);
    vec3 dPdX = vec3(1.0, 0.0, 0.0);
    vec3 dPdZ = vec3(0.0, 0.0, 1.0);
    float crestAccum = 0.0;

${WAVE_VERTEX_SNIPPET}

    float capillary = (fbm(xz * 0.22 + vec2(uTime * 0.25, -uTime * 0.19)) - 0.5) * 0.14;
    displacement.y += capillary;
    displaced += displacement;

    vec3 normal = normalize(cross(dPdZ, dPdX));
    float jacobian = dPdX.x * dPdZ.z - dPdZ.x * dPdX.z;
    float slope = clamp(1.0 - normal.y, 0.0, 1.0);

    vWorldPosition = (modelMatrix * vec4(displaced, 1.0)).xyz;
    vNormal = normal;
    vElevation = displacement.y;
    vJacobian = jacobian;
    vSlope = slope;
    vBreaking = clamp(crestAccum * ${formatFloat(1 / WAVE_COUNT)} * 1.4, 0.0, 1.0);
    float trailField = fbm(vec2(dot(xz, uWindDirection) * 0.08, dot(xz, crossWind) * 0.33) + vec2(uTime * 0.38, 0.0));
    vFoamTrail = smoothstep(0.56, 0.88, trailField) * smoothstep(0.18, 0.72, slope);

    float camDist = length((modelViewMatrix * vec4(displaced, 1.0)).xyz);
    vDepthFade = smoothstep(12.0, 130.0, camDist);

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

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying float vElevation;
varying float vJacobian;
varying float vDepthFade;
varying float vBreaking;
varying float vSlope;
varying float vFoamTrail;

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
float saturate(float x) {
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
    float detailStrength = mix(0.03, 0.14, detailFade);
    vec3 detail1 = vec3(
        fbm(uv * 1.8 + uTime * vec2(0.16, 0.07)) - 0.5,
        1.0,
        fbm(uv * 1.8 + vec2(44.0, -22.0) - uTime * vec2(0.11, -0.09)) - 0.5
    );
    vec3 detail2 = vec3(
        fbm(uv * 5.1 - uTime * vec2(0.27, -0.2)) - 0.5,
        1.0,
        fbm(uv * 5.1 + vec2(-83.0, 62.0) + uTime * vec2(-0.24, 0.23)) - 0.5
    );
    normal = normalize(normal + detail1 * detailStrength + detail2 * detailStrength * 0.55);

    float NdotV = saturate(dot(normal, viewDir));
    float NdotL = saturate(dot(normal, sunDir));
    float F0 = 0.0204;
    float fresnel = F0 + (1.0 - F0) * pow(1.0 - NdotV, 5.0);

    float depthFactor = smoothstep(-2.8, 2.6, vElevation);
    vec3 waterColor = mix(uDeepColor, uShallowColor, depthFactor);
    float opticalDepth = max(0.2, -vElevation + 1.2 + vSlope * 1.3);
    vec3 absorption = exp(-vec3(0.42, 0.11, 0.045) * opticalDepth);
    waterColor *= absorption;

    vec3 halfDir = normalize(viewDir + sunDir);
    float roughness = mix(0.13, 0.05, detailFade);
    float NdotH = saturate(dot(normal, halfDir));
    float D = distributionGGX(NdotH, roughness);
    float G = geometrySmith(NdotV, NdotL, roughness);
    float specularTerm = (D * G * fresnel) / max(4.0 * max(NdotV, 0.001) * max(NdotL, 0.001), 0.001);
    vec3 specular = vec3(1.0, 0.97, 0.92) * specularTerm * (1.9 + detailFade);

    float glintNoise = fbm(vec2(dot(uv, uWindDirection) * 34.0, dot(uv, crossWind) * 10.0) + vec2(uTime * 0.65, -uTime * 0.18));
    float glintMask = smoothstep(0.74, 0.96, glintNoise + detailFade * 0.12);
    float glint = pow(saturate(dot(reflect(-sunDir, normal), viewDir)), 160.0) * glintMask * detailFade;
    specular += vec3(1.0, 0.99, 0.94) * glint * 2.1;

    vec3 reflectDir = reflect(-viewDir, normal);
    float skyMix = smoothstep(-0.25, 0.6, reflectDir.y);
    vec3 envColor = mix(vec3(0.04, 0.11, 0.19), uSkyColor, skyMix);
    envColor += vec3(1.0, 0.83, 0.58) * pow(saturate(dot(reflectDir, sunDir)), 128.0) * 1.2;

    float jacobianFoam = 1.0 - smoothstep(-0.18, 0.62, vJacobian);
    float crestFoam = smoothstep(0.26, 0.92, vBreaking);
    float slopeFoam = smoothstep(0.24, 0.8, vSlope);
    float foamNoise = fbm(uv * 2.3 + vec2(uTime * 0.12, -uTime * 0.06));
    float windAligned = fbm(vec2(dot(uv, uWindDirection) * 1.9, dot(uv, crossWind) * 6.5) + vec2(uTime * 0.38, 0.0));
    float trailFoam = smoothstep(0.58, 0.86, windAligned) * vFoamTrail;

    float totalFoam = jacobianFoam * 0.72 + crestFoam * 0.62 + slopeFoam * 0.23;
    totalFoam *= smoothstep(0.24, 0.72, foamNoise + 0.22);
    totalFoam = clamp(totalFoam + trailFoam * 0.75, 0.0, 1.0);
    totalFoam *= mix(1.0, 0.48, vDepthFade);
    vec3 foamColor = mix(uFoamTint, vec3(0.98, 0.99, 1.0), saturate(totalFoam * 1.2));
    vec3 litFoam = foamColor * (0.58 + 0.42 * NdotL);

    float forwardScatter = pow(saturate(dot(viewDir, -sunDir + normal * 0.45)), 2.6);
    float horizonScatter = pow(1.0 - NdotV, 2.2);
    vec3 subsurface = vec3(0.03, 0.28, 0.24) * forwardScatter * (0.44 + 0.56 * vSlope);
    subsurface += vec3(0.015, 0.09, 0.12) * horizonScatter * (1.0 - fresnel);

    vec3 baseDiffuse = waterColor * (0.28 + 0.72 * NdotL);
    vec3 color = mix(baseDiffuse, envColor, fresnel * 0.8);
    color += specular;
    color += subsurface;
    color = mix(color, litFoam, totalFoam * 0.92);

    float dist = length(vWorldPosition - cameraPosition);
    float distFog = 1.0 - exp(-dist * 0.0108);
    float heightFog = exp(-max(vWorldPosition.y, 0.0) * 0.27);
    float fogAmount = distFog * heightFog;
    float sunAlignment = saturate(dot(normalize(vWorldPosition - cameraPosition), sunDir));
    vec3 fogColor = mix(vec3(0.5, 0.62, 0.74), vec3(0.91, 0.75, 0.56), pow(sunAlignment, 5.0));
    color = mix(color, fogColor, fogAmount * (0.58 + 0.28 * horizonScatter));

    gl_FragColor = vec4(color, 1.0);
}
`;

const OceanMesh: React.FC = () => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const geometry = useMemo(() => {
        const geo = new THREE.PlaneGeometry(900, 900, 320, 320);
        geo.rotateX(-Math.PI / 2);
        return geo;
    }, []);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uWaveAmplitude: { value: 1.0 },
            uChoppiness: { value: 1.0 },
            uWindSpeed: { value: 1.0 },
            uWindDirection: { value: WIND_DIRECTION.clone() },
            uDeepColor: { value: new THREE.Color('#001a33') },
            uShallowColor: { value: new THREE.Color('#0d7aa7') },
            uSkyColor: { value: new THREE.Color('#91c7f5') },
            uSunDirection: { value: SUN_DIRECTION.clone() },
            uFoamTint: { value: new THREE.Color('#a9c4cf') },
        }),
        []
    );

    useFrame(({ clock }) => {
        if (!materialRef.current) {
            return;
        }

        const shaderUniforms = materialRef.current.uniforms;
        shaderUniforms.uTime.value = clock.getElapsedTime();
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
        <directionalLight position={MAIN_LIGHT_POSITION} intensity={3.2} color="#ffd6a1" />
        <directionalLight position={FILL_LIGHT_POSITION} intensity={0.8} color="#7bbfff" />
        <hemisphereLight args={['#d5ecff', '#001b33', 0.58]} />
        <ambientLight intensity={0.12} />
    </>
);

const OceanScene: React.FC = () => {
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
            <OceanMesh />

            <OrbitControls
                autoRotate
                autoRotateSpeed={0.2}
                enableZoom={true}
                enablePan={false}
                enableDamping
                dampingFactor={0.045}
                maxPolarAngle={Math.PI / 2.2}
                minPolarAngle={Math.PI / 5.2}
                minDistance={6}
                maxDistance={55}
                target={[0, 0, 0]}
            />

            <EffectComposer>
                <Bloom
                    intensity={0.62}
                    luminanceThreshold={0.82}
                    luminanceSmoothing={0.93}
                    mipmapBlur
                />
                <Vignette eskil={false} offset={0.09} darkness={0.3} />
                <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
            </EffectComposer>

            <fog attach="fog" args={['#081f30', 28, 135]} />
        </>
    );
};

export default OceanScene;
