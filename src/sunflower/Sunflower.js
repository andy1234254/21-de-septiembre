import * as THREE from 'three'
import { Petal } from './Petal.js'
import { Center } from './Center.js'
import { Stem } from './Stem.js'
import { Leaves } from './Leaves.js'

export class Sunflower extends THREE.Group {
  constructor() {
    super()
    this.name = 'sunflower'
    this.petals = []
    this.PETAL_COUNT = 10

    this.center = new Center()
    this.stem = new Stem()
    this.leaves = new Leaves()
    this.head = new THREE.Group()
    this.head.name = 'sunflower-head'
    this.head.rotation.x = Math.PI / 2
    this.head.scale.setScalar(0.9)

    this.head.add(this.center)
    this.add(this.head, this.stem, this.leaves)

    this.createPetals()
    this.updatePosition()
  }

  createPetals() {
    this.petals.forEach(p => p.removeFromParent())
    this.petals = []

    for (let i = 0; i < this.PETAL_COUNT; i++) {
      const petal = new Petal(i, this.PETAL_COUNT)
      this.petals.push(petal)
      this.head.add(petal)
    }
  }

  updatePosition(viewportWidth = window.innerWidth, viewportHeight = window.innerHeight) {
    const aspect = viewportWidth / viewportHeight
    const baseScale = Math.min(viewportWidth, viewportHeight) / 900
    const scale = THREE.MathUtils.clamp(baseScale * 0.95, 0.45, 1)

    this.scale.setScalar(scale)

    const horizontalRange = THREE.MathUtils.clamp((aspect - 0.5) / 1.3, 0, 1)
    const horizontalOffset = THREE.MathUtils.lerp(0.82, 1.55, horizontalRange)
    const x = -aspect * horizontalOffset * scale
    const y = -1.15 * scale

    this.position.set(x, y, 0)
  }

  getPetal(index) {
    return this.petals[index]
  }

  getPetalMeshes() {
    const meshes = []
    this.petals.forEach(petal => {
      petal.mesh.traverse(child => {
        if (child.isMesh) meshes.push(child)
      })
    })
    return meshes
  }

  reset() {
    this.petals.forEach(petal => {
      petal.reset()
    })
  }

  setAnimating(state) {
    this.petals.forEach(p => p.animating = state)
  }
}