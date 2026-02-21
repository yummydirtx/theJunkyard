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

// ═══════════════════════════════════════════════════════════════════════════════
//  VERTEX SHADER — Gerstner waves with Jacobian for foam detection
// ═══════════════════════════════════════════════════════════════════════════════

const oceanVertexShader = /* glsl */ `
uniform float uTime;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying float vElevation;
varying float vJacobian;   // Jacobian determinant — <0 means wave is folding/breaking

// ── noise ──
float hash2D(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash2D(i), b = hash2D(i + vec2(1,0));
    float c = hash2D(i + vec2(0,1)), d = hash2D(i + vec2(1,1));
    return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}
float fbm(vec2 p, int oct) {
    float v = 0.0, a = 0.5, f = 1.0;
    for (int i = 0; i < 6; i++) {
        if (i >= oct) break;
        v += a * valueNoise(p * f);
        a *= 0.5; f *= 2.0;
    }
    return v;
}

// ── Gerstner wave: returns displacement AND partial derivatives for Jacobian ──
// dx/dx0, dz/dz0 partials are needed to compute the Jacobian determinant
struct WaveResult {
    vec3 displacement;
    float dxdx; // partial derivative dx/dx0
    float dzdz; // partial derivative dz/dz0
    float dxdz; // cross partial
    float dzdx; // cross partial
};

WaveResult gerstnerWave(vec2 p, vec2 dir, float steepness, float wavelength, float speed) {
    WaveResult r;
    float k = 6.28318 / wavelength;
    float c = sqrt(9.81 / k);
    float f = k * (dot(dir, p) - c * speed * uTime);
    float a = steepness / k;
    float sinF = sin(f);
    float cosF = cos(f);

    r.displacement = vec3(
        dir.x * a * cosF,
        a * sinF,
        dir.y * a * cosF
    );

    // Partial derivatives of the displaced position w.r.t. original position
    // These form the Jacobian matrix of the Gerstner transformation
    r.dxdx = -dir.x * dir.x * steepness * sinF;
    r.dzdz = -dir.y * dir.y * steepness * sinF;
    r.dxdz = -dir.x * dir.y * steepness * sinF;
    r.dzdx = r.dxdz;

    return r;
}

void main() {
    vec3 pos = position;
    vec2 p = pos.xz;

    // Accumulate Gerstner waves — 8 waves for richer detail
    // Also accumulate Jacobian partial derivatives
    float J_dxdx = 1.0, J_dzdz = 1.0, J_dxdz = 0.0, J_dzdx = 0.0;
    vec3 totalDisp = vec3(0.0);

    // Wave 1 — dominant swell (high steepness for breaking)
    WaveResult w1 = gerstnerWave(p, normalize(vec2(1.0, 0.6)),  0.42, 14.0, 1.0);
    // Wave 2 — secondary swell
    WaveResult w2 = gerstnerWave(p, normalize(vec2(0.7, -0.4)), 0.35, 9.0,  1.15);
    // Wave 3 — cross swell
    WaveResult w3 = gerstnerWave(p, normalize(vec2(-0.3, 1.0)), 0.28, 7.0,  0.9);
    // Wave 4 — medium chop
    WaveResult w4 = gerstnerWave(p, normalize(vec2(0.9, 0.2)),  0.20, 4.5,  1.5);
    // Wave 5 — angled chop
    WaveResult w5 = gerstnerWave(p, normalize(vec2(-0.6, 0.8)), 0.16, 3.0,  1.8);
    // Wave 6 — fine ripples
    WaveResult w6 = gerstnerWave(p, normalize(vec2(0.4, -0.9)), 0.10, 2.0,  2.2);
    // Wave 7 — micro detail
    WaveResult w7 = gerstnerWave(p, normalize(vec2(-0.8, -0.3)),0.06, 1.3,  2.8);
    // Wave 8 — finest ripples
    WaveResult w8 = gerstnerWave(p, normalize(vec2(0.2, 0.95)), 0.04, 0.8,  3.2);

    totalDisp = w1.displacement + w2.displacement + w3.displacement + w4.displacement
              + w5.displacement + w6.displacement + w7.displacement + w8.displacement;

    // Accumulate Jacobian partials (additive since displacement is additive)
    J_dxdx += w1.dxdx + w2.dxdx + w3.dxdx + w4.dxdx + w5.dxdx + w6.dxdx + w7.dxdx + w8.dxdx;
    J_dzdz += w1.dzdz + w2.dzdz + w3.dzdz + w4.dzdz + w5.dzdz + w6.dzdz + w7.dzdz + w8.dzdz;
    J_dxdz += w1.dxdz + w2.dxdz + w3.dxdz + w4.dxdz + w5.dxdz + w6.dxdz + w7.dxdz + w8.dxdz;
    J_dzdx += w1.dzdx + w2.dzdx + w3.dzdx + w4.dzdx + w5.dzdx + w6.dzdx + w7.dzdx + w8.dzdx;

    // Jacobian determinant: J = dxdx*dzdz - dxdz*dzdx
    // When J <= 0, the wave surface is folding over itself (breaking!)
    float jacobian = J_dxdx * J_dzdz - J_dxdz * J_dzdx;

    // Add FBM noise for organic variation
    float noiseY = (fbm(p * 0.06 + uTime * 0.05, 5) - 0.5) * 1.2;
    noiseY += (fbm(p * 0.12 - uTime * 0.03, 4) - 0.5) * 0.5;
    totalDisp.y += noiseY;
    totalDisp.x += (fbm(p * 0.1 + vec2(50.0, 0.0) + uTime * 0.02, 3) - 0.5) * 0.3;
    totalDisp.z += (fbm(p * 0.1 + vec2(0.0, 50.0) - uTime * 0.02, 3) - 0.5) * 0.3;

    pos += totalDisp;

    vElevation = totalDisp.y;
    vJacobian = jacobian;
    vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;

    // Compute normals via finite differences
    float eps = 0.15;
    vec3 posR = position + vec3(eps, 0.0, 0.0);
    vec3 posU = position + vec3(0.0, 0.0, eps);

    vec3 dR = w1.displacement + w2.displacement + w3.displacement + w4.displacement
            + w5.displacement + w6.displacement + w7.displacement + w8.displacement;
    vec3 dU = dR; // approximate — recompute for accuracy

    // Recompute for offset positions
    vec3 dispR = gerstnerWave(posR.xz, normalize(vec2(1.0,0.6)), 0.42,14.0,1.0).displacement
               + gerstnerWave(posR.xz, normalize(vec2(0.7,-0.4)),0.35,9.0,1.15).displacement
               + gerstnerWave(posR.xz, normalize(vec2(-0.3,1.0)),0.28,7.0,0.9).displacement
               + gerstnerWave(posR.xz, normalize(vec2(0.9,0.2)), 0.20,4.5,1.5).displacement
               + gerstnerWave(posR.xz, normalize(vec2(-0.6,0.8)),0.16,3.0,1.8).displacement
               + gerstnerWave(posR.xz, normalize(vec2(0.4,-0.9)),0.10,2.0,2.2).displacement
               + gerstnerWave(posR.xz, normalize(vec2(-0.8,-0.3)),0.06,1.3,2.8).displacement
               + gerstnerWave(posR.xz, normalize(vec2(0.2,0.95)),0.04,0.8,3.2).displacement;
    dispR.y += (fbm(posR.xz * 0.06 + uTime * 0.05, 5) - 0.5) * 1.2;
    dispR.y += (fbm(posR.xz * 0.12 - uTime * 0.03, 4) - 0.5) * 0.5;

    vec3 dispU = gerstnerWave(posU.xz, normalize(vec2(1.0,0.6)), 0.42,14.0,1.0).displacement
               + gerstnerWave(posU.xz, normalize(vec2(0.7,-0.4)),0.35,9.0,1.15).displacement
               + gerstnerWave(posU.xz, normalize(vec2(-0.3,1.0)),0.28,7.0,0.9).displacement
               + gerstnerWave(posU.xz, normalize(vec2(0.9,0.2)), 0.20,4.5,1.5).displacement
               + gerstnerWave(posU.xz, normalize(vec2(-0.6,0.8)),0.16,3.0,1.8).displacement
               + gerstnerWave(posU.xz, normalize(vec2(0.4,-0.9)),0.10,2.0,2.2).displacement
               + gerstnerWave(posU.xz, normalize(vec2(-0.8,-0.3)),0.06,1.3,2.8).displacement
               + gerstnerWave(posU.xz, normalize(vec2(0.2,0.95)),0.04,0.8,3.2).displacement;
    dispU.y += (fbm(posU.xz * 0.06 + uTime * 0.05, 5) - 0.5) * 1.2;
    dispU.y += (fbm(posU.xz * 0.12 - uTime * 0.03, 4) - 0.5) * 0.5;

    vec3 tangent = normalize((posR + dispR) - (position + totalDisp));
    vec3 bitangent = normalize((posU + dispU) - (position + totalDisp));
    vNormal = normalize(cross(bitangent, tangent));

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

// ═══════════════════════════════════════════════════════════════════════════════
//  FRAGMENT SHADER — Jacobian foam, whitecaps, SSS, Fresnel
// ═══════════════════════════════════════════════════════════════════════════════

const oceanFragmentShader = /* glsl */ `
uniform vec3 uDeepColor;
uniform vec3 uShallowColor;
uniform vec3 uSkyColor;
uniform vec3 uSunDirection;
uniform float uTime;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying float vElevation;
varying float vJacobian;

// ── noise ──
float hash2D(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float valueNoise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash2D(i), b = hash2D(i + vec2(1,0));
    float c = hash2D(i + vec2(0,1)), d = hash2D(i + vec2(1,1));
    return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}
float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * valueNoise(p); p *= 2.0; a *= 0.5; }
    return v;
}

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);

    // ── Fresnel (Schlick approximation, water IOR ~1.33) ──
    float cosTheta = max(dot(viewDir, normal), 0.0);
    float F0 = 0.02;
    float fresnel = F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);

    // ── Water body color ──
    float depthFactor = smoothstep(-2.5, 3.0, vElevation);
    vec3 waterColor = mix(uDeepColor, uShallowColor, depthFactor);
    // Murky mid-depth tint
    vec3 murkColor = vec3(0.03, 0.09, 0.08);
    float murkFactor = smoothstep(-1.5, 0.5, vElevation) * (1.0 - smoothstep(0.5, 2.5, vElevation));
    waterColor = mix(waterColor, murkColor, murkFactor * 0.35);

    // ── Lighting ──
    float diffuse = max(dot(normal, uSunDirection), 0.0) * 0.5 + 0.5;
    vec3 halfDir = normalize(uSunDirection + viewDir);
    float spec1 = pow(max(dot(normal, halfDir), 0.0), 512.0);
    float spec2 = pow(max(dot(normal, halfDir), 0.0), 32.0);
    vec3 specular = vec3(1.0, 0.95, 0.85) * spec1 * 3.5
                  + vec3(0.5, 0.65, 0.8) * spec2 * 0.3;

    // ── Sky reflection ──
    vec3 reflectDir = reflect(-viewDir, normal);
    float skyMix = smoothstep(-0.1, 0.5, reflectDir.y);
    vec3 envColor = mix(vec3(0.08, 0.18, 0.28), uSkyColor, skyMix);

    // ═══════════════════════════════════════════════════
    //  JACOBIAN-BASED FOAM — where waves fold and break
    // ═══════════════════════════════════════════════════
    vec2 foamUV = vWorldPosition.xz;

    // Jacobian foam: J < threshold means wave surface is compressing/folding
    // Lower Jacobian = more intense breaking
    float jacobianFoam = 1.0 - smoothstep(-0.3, 0.8, vJacobian);
    // Add noise breakup so foam isn't a solid sheet
    float foamNoise1 = fbm(foamUV * 1.2 + uTime * 0.12);
    float foamNoise2 = fbm(foamUV * 3.5 - uTime * 0.08);
    float foamNoise3 = fbm(foamUV * 8.0 + vec2(uTime * 0.05, -uTime * 0.03));

    // Main breaking foam — patchy, noisy, concentrated at folding areas
    float breakingFoam = jacobianFoam * smoothstep(0.25, 0.55, foamNoise1);
    breakingFoam *= (0.6 + 0.4 * foamNoise2); // texture variation
    // Fine bubble detail (halftone-like)
    breakingFoam *= smoothstep(0.15, 0.5, foamNoise3);

    // Crest whitecaps — even where Jacobian hasn't gone negative
    float crestFoam = smoothstep(0.8, 2.2, vElevation);
    crestFoam *= smoothstep(0.3, 0.6, foamNoise1) * smoothstep(0.2, 0.5, foamNoise2);

    // Foam trailing streaks (wind-blown)
    float streakNoise = fbm(foamUV * 5.0 + vec2(uTime * 0.06, 0.0));
    float streaks = smoothstep(0.3, 1.5, vElevation) * smoothstep(0.58, 0.78, streakNoise) * 0.35;

    // Combine all foam sources
    float totalFoam = max(breakingFoam, max(crestFoam, streaks));
    totalFoam = clamp(totalFoam, 0.0, 1.0);

    // Foam color — slightly warm off-white, brighter where foam is densest
    vec3 foamColor = mix(vec3(0.82, 0.88, 0.90), vec3(0.95, 0.97, 0.98), totalFoam);
    vec3 litFoam = foamColor * (diffuse * 0.4 + 0.6);

    // ── Sub-surface scattering ──
    float sss = pow(max(dot(viewDir, -uSunDirection + normal * 0.5), 0.0), 3.0);
    vec3 sssColor = vec3(0.0, 0.5, 0.4) * sss * 0.4;
    // Extra SSS on thin wave crests (light shining through)
    float crestThinness = smoothstep(0.5, 2.0, vElevation) * (1.0 - totalFoam);
    sssColor += vec3(0.05, 0.35, 0.25) * crestThinness * 0.3;

    // ── Composite ──
    vec3 color = waterColor * diffuse;
    color = mix(color, envColor, fresnel * 0.55);
    color += specular;
    color += sssColor;
    color = mix(color, litFoam, totalFoam * 0.9);

    // Horizon distance fog
    float dist = length(vWorldPosition - cameraPosition);
    float fogFactor = smoothstep(40.0, 160.0, dist);
    vec3 fogColor = vec3(0.62, 0.75, 0.83);
    color = mix(color, fogColor, fogFactor * 0.7);

    gl_FragColor = vec4(color, 1.0);
}
`;

// ═══════════════════════════════════════════════════════════════════════════════
//  React components
// ═══════════════════════════════════════════════════════════════════════════════

const OceanMesh: React.FC = () => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const geometry = useMemo(() => {
        const geo = new THREE.PlaneGeometry(500, 500, 512, 512);
        geo.rotateX(-Math.PI / 2);
        return geo;
    }, []);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uDeepColor: { value: new THREE.Color('#002040') },
            uShallowColor: { value: new THREE.Color('#006090') },
            uSkyColor: { value: new THREE.Color('#87ceeb') },
            uSunDirection: { value: new THREE.Vector3(0.6, 0.35, 0.7).normalize() },
        }),
        []
    );

    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    return (
        <mesh geometry={geometry}>
            <shaderMaterial
                ref={materialRef}
                vertexShader={oceanVertexShader}
                fragmentShader={oceanFragmentShader}
                uniforms={uniforms}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};

const Lighting: React.FC = () => (
    <>
        <directionalLight position={[20, 15, 15]} intensity={3.0} color="#ffe0a0" />
        <directionalLight position={[-15, 8, -20]} intensity={0.8} color="#6eb5ff" />
        <hemisphereLight args={['#b1e1ff', '#002244', 0.5]} />
        <ambientLight intensity={0.15} />
    </>
);

const OceanScene: React.FC = () => {
    return (
        <>
            <Sky
                distance={450000}
                sunPosition={[100, 15, 80]}
                inclination={0.49}
                azimuth={0.25}
                turbidity={10}
                rayleigh={2.5}
                mieCoefficient={0.005}
                mieDirectionalG={0.85}
            />

            <Lighting />
            <OceanMesh />

            <OrbitControls
                autoRotate
                autoRotateSpeed={0.25}
                enableZoom={true}
                enablePan={false}
                maxPolarAngle={Math.PI / 2.3}
                minPolarAngle={Math.PI / 5}
                minDistance={6}
                maxDistance={45}
                target={[0, 0, 0]}
            />

            <EffectComposer>
                <Bloom
                    intensity={0.7}
                    luminanceThreshold={0.7}
                    luminanceSmoothing={0.9}
                    mipmapBlur
                />
                <Vignette eskil={false} offset={0.1} darkness={0.35} />
                <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
            </EffectComposer>

            <fog attach="fog" args={['#0a2535', 30, 90]} />
        </>
    );
};

export default OceanScene;
