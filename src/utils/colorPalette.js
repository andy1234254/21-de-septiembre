import * as THREE from 'three'

export const COLORS = {
  petal: {
    gold: 0xFFD700,
    warmYellow: 0xFFE87C,
    amber: 0xFFBF00,
    orange: 0xFF8C00,
    darkOrange: 0xCC6600,
    highlight: 0xFFF3A0,
    shadow: 0xB35900,
    side: 0xE6A800
  },
  center: {
    darkBrown: 0x4A2A16,
    mediumBrown: 0x7A4B24,
    warmBrown: 0xA66A35,
    veryDark: 0x32190D
  },
  stem: {
    darkGreen: 0x1B4D1B,
    mediumGreen: 0x2E7D32,
    highlight: 0x3EA63E,
    shadow: 0x0D2B0D
  },
  leaf: {
    darkGreen: 0x1B4D1B,
    mediumGreen: 0x2E7D32,
    highlight: 0x4CAF50,
    shadow: 0x0D2B0D
  }
}

function getVariedColor(baseHex, petalIndex, totalPetals, variationAmount = 0.08) {
  const color = new THREE.Color(baseHex)
  const hsl = { h: 0, s: 0, l: 0 }
  color.getHSL(hsl)

  const variation = ((petalIndex * 17) % totalPetals) / totalPetals
  const shift = (variation - 0.5) * 2 * variationAmount

  hsl.l = THREE.MathUtils.clamp(hsl.l + shift, 0.2, 0.95)
  hsl.s = THREE.MathUtils.clamp(hsl.s + shift * 0.5, 0.3, 1)

  color.setHSL(hsl.h, hsl.s, hsl.l)
  return color.getHex()
}

export function getPetalMaterials(petalIndex = 0, totalPetals = 12) {
  const baseColors = COLORS.petal
  const baseProps = { roughness: 0.7, metalness: 0.1, emissive: 0x000000, emissiveIntensity: 0 }

  const gold = getVariedColor(baseColors.gold, petalIndex, totalPetals, 0.06)
  const warmYellow = getVariedColor(baseColors.warmYellow, petalIndex, totalPetals, 0.06)
  const amber = getVariedColor(baseColors.amber, petalIndex, totalPetals, 0.08)
  const orange = getVariedColor(baseColors.orange, petalIndex, totalPetals, 0.08)
  const darkOrange = getVariedColor(baseColors.darkOrange, petalIndex, totalPetals, 0.1)
  const highlight = getVariedColor(baseColors.highlight, petalIndex, totalPetals, 0.05)
  const shadow = getVariedColor(baseColors.shadow, petalIndex, totalPetals, 0.1)
  const side = getVariedColor(baseColors.side, petalIndex, totalPetals, 0.07)

  return [
    new THREE.MeshStandardMaterial({ ...baseProps, color: side }),                    // right
    new THREE.MeshStandardMaterial({ ...baseProps, color: side }),                    // left
    new THREE.MeshStandardMaterial({ ...baseProps, color: gold, roughness: 0.6 }),      // top
    new THREE.MeshStandardMaterial({ ...baseProps, color: shadow, roughness: 0.8, metalness: 0.05 }), // bottom
    new THREE.MeshStandardMaterial({ ...baseProps, color: gold, roughness: 0.6 }),    // front
    new THREE.MeshStandardMaterial({ ...baseProps, color: darkOrange, roughness: 0.75, metalness: 0.05 }) // back
  ]
}

export function getCenterMaterials() {
  const { darkBrown, mediumBrown, warmBrown, veryDark } = COLORS.center
  const baseProps = { roughness: 0.85, metalness: 0.02, emissive: 0x000000, emissiveIntensity: 0 }
  return [
    new THREE.MeshStandardMaterial({ ...baseProps, color: veryDark, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ ...baseProps, color: darkBrown }),
    new THREE.MeshStandardMaterial({ ...baseProps, color: mediumBrown, roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ ...baseProps, color: warmBrown, roughness: 0.75 })
  ]
}

export function getStemMaterials() {
  const { darkGreen, mediumGreen, highlight, shadow } = COLORS.stem
  const baseProps = { roughness: 0.8, metalness: 0.02, emissive: 0x000000, emissiveIntensity: 0 }
  return [
    new THREE.MeshStandardMaterial({ ...baseProps, color: shadow }),
    new THREE.MeshStandardMaterial({ ...baseProps, color: shadow }),
    new THREE.MeshStandardMaterial({ ...baseProps, color: highlight, roughness: 0.7 }),
    new THREE.MeshStandardMaterial({ ...baseProps, color: darkGreen, roughness: 0.85 }),
    new THREE.MeshStandardMaterial({ ...baseProps, color: mediumGreen, roughness: 0.75 }),
    new THREE.MeshStandardMaterial({ ...baseProps, color: darkGreen })
  ]
}

export function getLeafMaterials() {
  const { darkGreen, mediumGreen, highlight, shadow } = COLORS.leaf
  const baseProps = { roughness: 0.8, metalness: 0.01, emissive: 0x000000, emissiveIntensity: 0 }
  return [
    new THREE.MeshStandardMaterial({ ...baseProps, color: shadow, roughness: 0.85 }),
    new THREE.MeshStandardMaterial({ ...baseProps, color: shadow, roughness: 0.85 }),
    new THREE.MeshStandardMaterial({ ...baseProps, color: highlight, roughness: 0.7, metalness: 0.02 }),
    new THREE.MeshStandardMaterial({ ...baseProps, color: darkGreen, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ ...baseProps, color: mediumGreen, roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ ...baseProps, color: mediumGreen, roughness: 0.8 })
  ]
}