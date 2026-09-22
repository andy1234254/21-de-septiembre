import * as THREE from 'three'
import { getPetalMaterials, getCenterMaterials, getStemMaterials, getLeafMaterials } from './colorPalette.js'

export function createVoxelBlock(size, materials) {
  const geometry = new THREE.BoxGeometry(size, size, size)
  const mesh = new THREE.Mesh(geometry, materials)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

export function createPetalGeometry(petalIndex, totalPetals = 10) {
  const group = new THREE.Group()
  const baseSize = 0.2
  const materials = getPetalMaterials(petalIndex, totalPetals)

  const angle = (petalIndex / totalPetals) * Math.PI * 2
  const variation = (petalIndex * 0.137) % 1
  const petalWidths = [2, 6, 6, 6, 2]
  const lengthVariation = 0.9 + variation * 0.2
  const rotationVariation = (variation - 0.5) * 0.1

  for (let seg = 0; seg < petalWidths.length; seg++) {
    const t = seg / (petalWidths.length - 1)
    const width = petalWidths[seg]
    const height = baseSize * (0.7 + 0.3 * Math.sin(t * Math.PI))
    const depth = baseSize * 1.1
    const segLength = baseSize * 0.95 * lengthVariation

    for (let w = 0; w < width; w++) {
      const xOffset = (w - (width - 1) / 2) * baseSize * 1.02
      const block = createVoxelBlock(baseSize, materials.map(m => m.clone()))
      block.position.set(xOffset, 0, seg * segLength)
      block.scale.set(1, height / baseSize, depth / baseSize)
      group.add(block)
    }

  }

  group.rotation.y = rotationVariation
  group.userData.segmentCount = petalWidths.length
  group.userData.maxWidth = 4
  group.userData.lengthVariation = lengthVariation
  return group
}

export function createCenterGeometry() {
  const group = new THREE.Group()
  const materials = getCenterMaterials()
  const radius = 0.84
  const layers = 6
  const layerHeight = 0.18

  for (let layer = 0; layer < layers; layer++) {
    const layerRadius = radius * (1 - layer * 0.13)
    const blocksPerRing = Math.max(10, Math.floor(24 * (layerRadius / radius)))
    const yPos = layer * layerHeight - (layers - 1) * layerHeight * 0.4

    for (let i = 0; i < blocksPerRing; i++) {
      const angle = (i / blocksPerRing) * Math.PI * 2
      const blockSize = (Math.PI * 2 * layerRadius) / blocksPerRing * 0.92
      const block = createVoxelBlock(blockSize, materials.map(m => m.clone()))
      block.position.set(
        Math.cos(angle) * layerRadius,
        yPos,
        Math.sin(angle) * layerRadius
      )
      block.rotation.y = -angle + Math.PI / 2
      block.scale.y = 1
      group.add(block)
    }

    for (let ring = 1; ring < 4; ring++) {
      const innerRadius = layerRadius * (1 - ring * 0.3)
      const innerBlocks = Math.max(4, Math.floor(blocksPerRing * (1 - ring * 0.3)))
      for (let i = 0; i < innerBlocks; i++) {
        const angle = (i / innerBlocks) * Math.PI * 2
        const blockSize = (Math.PI * 2 * innerRadius) / innerBlocks * 0.9
        const block = createVoxelBlock(blockSize, materials.map(m => m.clone()))
        block.position.set(
          Math.cos(angle) * innerRadius,
          yPos,
          Math.sin(angle) * innerRadius
        )
        block.rotation.y = -angle + Math.PI / 2
        block.scale.y = 1
        group.add(block)
      }
    }

    const core = createVoxelBlock(0.34, materials.map(m => m.clone()))
    core.position.set(0, yPos, 0)
    core.scale.set(1, 0.8, 1)
    group.add(core)
  }

  return group
}

export function createStemGeometry(height = 2.8) {
  const group = new THREE.Group()
  const materials = getStemMaterials()
  const blockSize = 0.2
  const blocks = Math.floor(height / blockSize)

  for (let i = 0; i < blocks; i++) {
    const block = createVoxelBlock(blockSize, materials.map(m => m.clone()))
    const sway = Math.sin(i * 0.7) * blockSize * 0.12
    block.position.set(sway, -i * blockSize * 0.96, 0)

    if (i % 4 === 0 && i > 0) {
      block.scale.set(1.15, 1, 1.15)
    }

    group.add(block)
  }

  return group
}

export function createLeafGeometry(side = 1) {
  const group = new THREE.Group()
  const materials = getLeafMaterials()
  const baseSize = 0.2
  const leafWidths = [1, 2, 3, 3, 2, 2, 1]

  for (let layer = 0; layer < leafWidths.length; layer++) {
    const blocksInLayer = leafWidths[layer]
    for (let i = 0; i < blocksInLayer; i++) {
      const block = createVoxelBlock(baseSize, materials.map(m => m.clone()))
      const xOffset = (i - (blocksInLayer - 1) / 2) * baseSize * 1.02
      const yOffset = -layer * baseSize * 0.68
      const zOffset = layer * baseSize * 0.32 * side

      block.position.set(xOffset * side, yOffset, zOffset)
      block.rotation.z = side * 0.12 * layer
      block.scale.set(1.25 - layer * 0.1, 0.72, 1.05 + layer * 0.08)
      group.add(block)
    }
  }

  return group
}