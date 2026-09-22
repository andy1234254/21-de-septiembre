import * as THREE from 'three'
import { createLeafGeometry } from '../utils/voxelUtils.js'

export class Leaves extends THREE.Group {
  constructor() {
    super()
    this.name = 'sunflower-leaves'

    const leaf1 = createLeafGeometry(1)
    leaf1.position.set(-0.32, -0.78, 0.18)
    leaf1.rotation.z = -0.3
    leaf1.rotation.y = -0.4
    leaf1.scale.set(1.35, 1.2, 1.1)
    this.add(leaf1)

    const leaf2 = createLeafGeometry(-1)
    leaf2.position.set(0.38, -1.25, -0.15)
    leaf2.rotation.z = 0.3
    leaf2.rotation.y = 0.5
    leaf2.scale.set(1.25, 1.1, 1.05)
    this.add(leaf2)

    this.position.y = -0.1
  }
}