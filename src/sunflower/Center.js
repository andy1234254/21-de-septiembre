import * as THREE from 'three'
import { createCenterGeometry } from '../utils/voxelUtils.js'

export class Center extends THREE.Group {
  constructor() {
    super()
    this.name = 'sunflower-center'
    const geometry = createCenterGeometry()
    this.add(geometry)
    this.position.y = 0.15
    this.scale.setScalar(0.85)
  }
}