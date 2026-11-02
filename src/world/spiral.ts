// The overworld is laid out along an Archimedean spiral (a nautilus!).
// r(θ) = A + B·θ ; zones sit at equal arc-length steps along it.

export const SPIRAL_A = 14
export const SPIRAL_B = 9

export function spiralPoint(theta: number): { x: number; z: number } {
  const r = SPIRAL_A + SPIRAL_B * theta
  return { x: r * Math.cos(theta), z: r * Math.sin(theta) }
}

/** Walk the spiral numerically and return θ at a given arc length from θ=0. */
export function thetaAtArc(arc: number): number {
  const step = 0.002
  let theta = 0
  let acc = 0
  while (acc < arc) {
    const r = SPIRAL_A + SPIRAL_B * theta
    acc += Math.sqrt(r * r + SPIRAL_B * SPIRAL_B) * step
    theta += step
  }
  return theta
}
