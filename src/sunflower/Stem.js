import * as THREE from 'three'
import { createStemGeometry } from '../utils/voxelUtils.js'

export class Stem extends THREE.Group {
  constructor(height = 4.6) {
    super()
    this.name = 'sunflower-stem'
    const geometry = createStemGeometry(height)
    this.add(geometry)
    this.position.y = -0.05
    this.scale.setScalar(0.95)
  }
}