import * as THREE from 'three'

/**
 * Small helper so our hand-written shaders still get scene fog.
 * The vertex body must set `vec4 w` (world position) and `vec4 mvPosition`.
 */
export function fogMaterial(opts: {
  uniforms: Record<string, THREE.IUniform>
  fragment: string
  /** extra varyings/uniforms/functions for the vertex shader */
  vertexHead?: string
  /** runs on the local-space position `lp` before the instance matrix is applied */
  localBody?: string
  /** runs after `vec4 w = world position` is known */
  vertexBody?: string
  instanced?: boolean
  transparent?: boolean
  side?: THREE.Side
  depthWrite?: boolean
}): THREE.ShaderMaterial {
  const vertex = /* glsl */ `
    varying vec3 vW;
    ${opts.vertexHead ?? ''}
    #include <fog_pars_vertex>
    void main(){
      vec4 lp = vec4(position, 1.0);
      ${opts.localBody ?? ''}
      ${
        opts.instanced
          ? `#ifdef USE_INSTANCING
        lp = instanceMatrix * lp;
      #endif`
          : ''
      }
      vec4 w = modelMatrix * lp;
      vW = w.xyz;
      ${opts.vertexBody ?? ''}
      vec4 mvPosition = viewMatrix * w;
      gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
    }
  `
  const fragment = /* glsl */ `
    varying vec3 vW;
    #include <fog_pars_fragment>
    ${opts.fragment}
  `
  return new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, opts.uniforms]),
    vertexShader: vertex,
    fragmentShader: fragment,
    fog: true,
    transparent: opts.transparent ?? false,
    side: opts.side ?? THREE.FrontSide,
    depthWrite: opts.depthWrite ?? true,
  })
}

/** Safe in both vertex and fragment shaders. */
export const GLSL_HASH = /* glsl */ `
  float hash21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
`

/** Fragment-only (uses derivatives). */
export const GLSL_GRID = /* glsl */ `
  float grid(vec2 p, float size, float width){
    vec2 q = p / size;
    vec2 g = abs(fract(q - 0.5) - 0.5) / fwidth(q);
    return 1.0 - min(min(g.x, g.y) / width, 1.0);
  }
`
