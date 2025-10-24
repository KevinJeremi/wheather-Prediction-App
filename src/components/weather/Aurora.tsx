'use client';

import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';

import './Aurora.css';

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ), 
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {              \
  int index = 0;                                            \
  for (int i = 0; i < 2; i++) {                               \
     ColorStop currentColor = colors[i];                    \
     bool isInBetween = currentColor.position <= factor;    \
     index = int(mix(float(index), float(i), float(isInBetween))); \
  }                                                         \
  ColorStop currentColor = colors[index];                   \
  ColorStop nextColor = colors[index + 1];                  \
  float range = nextColor.position - currentColor.position; \
  float lerpFactor = (factor - currentColor.position) / range; \
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  
  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);
  
  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);
  
  // Improved animation with more movement
  float time1 = uTime * 0.08;
  float time2 = uTime * 0.05;
  float time3 = uTime * 0.03;
  
  float noise1 = snoise(vec2(uv.x * 3.0 + time1, uv.y * 1.5 + time1 * 0.5));
  float noise2 = snoise(vec2(uv.x * 2.0 - time2, uv.y * 2.0 + time2));
  float noise3 = snoise(vec2(uv.x * 1.5 + time3 * 0.7, uv.y * 1.0 - time3));
  
  float height = (noise1 * 0.4 + noise2 * 0.3 + noise3 * 0.3) * uAmplitude;
  height = exp(height * 0.8);
  
  float wavePattern = sin(uv.x * 6.28 + uTime * 0.15) * 0.1;
  float verticalFlow = (uv.y * 2.5 - height + wavePattern + 0.3);
  float intensity = 0.7 * verticalFlow;
  
  // Smoother blend
  float midPoint = 0.25;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.6, midPoint + uBlend * 0.6, intensity);
  
  // Add glow effect
  vec3 auroraColor = intensity * rampColor;
  auroraColor *= (1.0 + sin(uTime * 0.5) * 0.2);
  
  fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha * 0.85);
}
`;

interface AuroraProps {
    colorStops?: string[];
    amplitude?: number;
    blend?: number;
    speed?: number;
}

export default function Aurora({
    colorStops = ['#2F80ED', '#FFFFFF', '#56CCF2'],
    amplitude = 1.2,
    blend = 0.6,
    speed = 0.8,
}: AuroraProps) {
    const propsRef = useRef({ colorStops, amplitude, blend, speed });
    propsRef.current = { colorStops, amplitude, blend, speed };

    const ctnDom = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctn = ctnDom.current;
        if (!ctn) return;

        const renderer = new Renderer({
            alpha: true,
            premultipliedAlpha: true,
            antialias: true,
        });
        const gl = renderer.gl;
        gl.clearColor(0, 0, 0, 0);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.canvas.style.backgroundColor = 'transparent';

        let program: Program;

        function resize() {
            if (!ctn) return;
            const width = ctn.offsetWidth;
            const height = ctn.offsetHeight;
            renderer.setSize(width, height);
            if (program) {
                program.uniforms.uResolution.value = [width, height];
            }
        }

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(ctn);

        const geometry = new Triangle(gl);
        if (geometry.attributes.uv) {
            delete geometry.attributes.uv;
        }

        const colorStopsArray = colorStops.map((hex) => {
            const c = new Color(hex);
            return [c.r, c.g, c.b];
        });

        program = new Program(gl, {
            vertex: VERT,
            fragment: FRAG,
            uniforms: {
                uTime: { value: 0 },
                uAmplitude: { value: amplitude },
                uColorStops: { value: colorStopsArray },
                uResolution: { value: [ctn.offsetWidth, ctn.offsetHeight] },
                uBlend: { value: blend },
            },
        });

        const mesh = new Mesh(gl, { geometry, program });
        ctn.appendChild(gl.canvas);

        let animateId = 0;
        const startTime = Date.now();

        const update = () => {
            animateId = requestAnimationFrame(update);
            const elapsed = (Date.now() - startTime) * 0.001;
            const { speed: propSpeed = 0.8 } = propsRef.current;

            // Update time uniform dengan speed yang tepat
            program.uniforms.uTime.value = elapsed * propSpeed;
            program.uniforms.uAmplitude.value = propsRef.current.amplitude ?? 1.2;
            program.uniforms.uBlend.value = propsRef.current.blend ?? blend;

            const stops = propsRef.current.colorStops ?? colorStops;
            program.uniforms.uColorStops.value = stops.map((hex) => {
                const c = new Color(hex);
                return [c.r, c.g, c.b];
            });

            renderer.render({ scene: mesh });
        };

        animateId = requestAnimationFrame(update);
        resize();

        return () => {
            cancelAnimationFrame(animateId);
            resizeObserver.disconnect();
            if (ctn && gl.canvas.parentNode === ctn) {
                ctn.removeChild(gl.canvas);
            }
            try {
                const ext = gl.getExtension('WEBGL_lose_context');
                if (ext) ext.loseContext();
            } catch (e) {
                console.error('Error losing WebGL context:', e);
            }
        };
    }, [amplitude, blend, colorStops, speed]);

    return <div ref={ctnDom} className="aurora-container" />;
}
