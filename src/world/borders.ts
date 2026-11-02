import * as THREE from 'three'
import { glowSprite } from './fx'
import { GROUND_Y, type P, isLand } from './geo'
import { ribbonGeometry } from './road'

export interface Bounds {
  x0: number
  x1: number
  z0: number
  z1: number
}

function hazardTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 32
  c.height = 32
  const g = c.getContext('2d')!
  g.fillStyle = '#10081f'
  g.fillRect(0, 0, 32, 32)
  g.fillStyle = '#ffb800'
  for (let i = -1; i < 3; i++) {
    g.beginPath()
    g.moveTo(i * 16, 32)
    g.lineTo(i * 16 + 8, 32)
    g.lineTo(i * 16 + 40, 0)
    g.lineTo(i * 16 + 32, 0)
    g.fill()
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/**
 * The edge of the playable city: a translucent neon curtain with scrolling chevrons, a hazard-stripe kerb
 * where it runs over land, and posts every so often. It brightens as you get close.
 */
export function buildBorders(b: Bounds): { obj: THREE.Group; update(t: number, px: number, pz: number): void } {
  const group = new THREE.Group()
  const H = 15
  const corners: P[] = [
    [b.x0, b.z0],
    [b.x1, b.z0],
    [b.x1, b.z1],
    [b.x0, b.z1],
  ]
  const uniforms = { uTime: { value: 0 }, uPlayer: { value: new THREE.Vector2(1e5, 1e5) } }
  const curtainMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    fog: false,
    uniforms,
    vertexShader: /* glsl */ `varying vec2 vUv; varying vec3 vW; void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      varying vec2 vUv; varying vec3 vW; uniform float uTime; uniform vec2 uPlayer;
      void main(){
        float along = vUv.x * 4000.0;
        float h = vUv.y;
        float fade = pow(1.0 - h, 1.6);
        // chevrons marching along the wall
        float c = abs(fract((along - uTime * 12.0) / 14.0) - 0.5) * 2.0;
        float chev = smoothstep(0.55, 0.45, abs(c - h * 0.9 - 0.05));
        float d = distance(vW.xz, uPlayer);
        float near = 0.22 + 0.75 * smoothstep(120.0, 15.0, d);
        float base = fade * (0.16 + 0.28 * chev);
        vec3 col = mix(vec3(1.0, 0.17, 0.84), vec3(1.0, 0.72, 0.1), smoothstep(0.0, 0.35, h));
        float a = base * near + smoothstep(0.06, 0.0, h) * 0.5 * near;
        gl_FragColor = vec4(col * a, a);
      }
    `,
  })

  const hazard = hazardTexture()
  const kerbMat = new THREE.MeshBasicMaterial({ map: hazard, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })
  const postMat = new THREE.MeshBasicMaterial({ color: 0x20103a })

  for (let i = 0; i < 4; i++) {
    const a = corners[i]
    const c = corners[(i + 1) % 4]
    const len = Math.hypot(c[0] - a[0], c[1] - a[1])
    const geo = new THREE.PlaneGeometry(len, H, 1, 1).translate(0, H / 2, 0)
    // remap uv.x so the chevron phase is continuous but unique per wall
    const curtain = new THREE.Mesh(geo, curtainMat)
    curtain.position.set((a[0] + c[0]) / 2, 0, (a[1] + c[1]) / 2)
    curtain.rotation.y = Math.atan2(-(c[1] - a[1]), c[0] - a[0])
    curtain.renderOrder = 3
    curtain.frustumCulled = false
    group.add(curtain)

    // kerb + posts, only where there is land to put them on
    let run: THREE.Vector3[] = []
    const flush = () => {
      if (run.length > 2) {
        const k = new THREE.Mesh(ribbonGeometry(run, 1.6, 3.2), kerbMat)
        k.renderOrder = 2
        group.add(k)
      }
      run = []
    }
    const step = 8
    const n = Math.ceil(len / step)
    for (let s = 0; s <= n; s++) {
      const u = s / n
      const x = a[0] + (c[0] - a[0]) * u
      const z = a[1] + (c[1] - a[1]) * u
      if (isLand(x, z)) {
        run.push(new THREE.Vector3(x, GROUND_Y + 0.05, z))
        if (s % 6 === 0) {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.6, H * 0.7, 0.6), postMat)
          post.position.set(x, GROUND_Y + (H * 0.7) / 2, z)
          group.add(post)
          const lamp = glowSprite(s % 12 === 0 ? 0xff2bd6 : 0xffb800, 3.4, 0.85)
          lamp.position.set(x, GROUND_Y + H * 0.7 + 0.8, z)
          group.add(lamp)
        }
      } else flush()
    }
    flush()
  }

  return {
    obj: group,
    update(t, px, pz) {
      uniforms.uTime.value = t
      uniforms.uPlayer.value.set(px, pz)
    },
  }
}
