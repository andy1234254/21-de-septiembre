import * as THREE from 'three'

export function setupLights(scene) {
  const mainLight = new THREE.DirectionalLight(0xFFD700, 2.8)
  mainLight.position.set(-4, 8, 4)
  mainLight.castShadow = true
  mainLight.shadow.mapSize.width = 2048
  mainLight.shadow.mapSize.height = 2048
  mainLight.shadow.camera.near = 0.5
  mainLight.shadow.camera.far = 25
  mainLight.shadow.camera.left = -8
  mainLight.shadow.camera.right = 8
  mainLight.shadow.camera.top = 8
  mainLight.shadow.camera.bottom = -8
  mainLight.shadow.bias = -0.0005
  mainLight.shadow.normalBias = 0.02
  scene.add(mainLight)

  const ambient = new THREE.AmbientLight(0xFF8C00, 0.35)
  scene.add(ambient)

  const hemi = new THREE.HemisphereLight(0x4488FF, 0xFF6600, 0.5)
  scene.add(hemi)

  const lavaGlow = new THREE.PointLight(0xFF5500, 1.2, 6)
  lavaGlow.position.set(-2, 0.5, -1)
  scene.add(lavaGlow)

  const rimLight = new THREE.DirectionalLight(0xFFBF00, 0.4)
  rimLight.position.set(0, -1.5, -4)
  scene.add(rimLight)

  const fillLight = new THREE.DirectionalLight(0xFFAA00, 0.35)
  fillLight.position.set(2.5, 4, -2.5)
  scene.add(fillLight)

  return { mainLight, ambient, hemi, lavaGlow, rimLight, fillLight }
}