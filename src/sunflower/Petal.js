import * as THREE from 'three'
import { gsap } from 'gsap'
import { createPetalGeometry } from '../utils/voxelUtils.js'

export class Petal extends THREE.Group {
  constructor(index, totalPetals = 10) {
    super()
    this.index = index
    this.totalPetals = totalPetals
    this.removed = false
    this.animating = false
    this.name = `petal-${index}`

    const geometry = createPetalGeometry(index, totalPetals)
    this.mesh = geometry
    this.add(this.mesh)

    this.userData.petalIndex = index
    this.userData.isPetal = true

    const angle = (index / totalPetals) * Math.PI * 2
    const centerRadius = 0.82
    const petalGap = 0.02
    const radius = centerRadius + petalGap

    const depthVariation = 0
    const rotationVariation = -0.02
    const tiltFrontal = 0.15  // ligero giro para mirar ligeramente al frente
    const rotationYDynamic = 0.2  // ~11.5° para toque dinámico
    const scaleVariation = 0.95 + Math.random() * 0.1

    this.position.set(
      Math.cos(angle) * radius,
      depthVariation,
      Math.sin(angle) * radius
    )
    this.rotation.y = -angle + Math.PI / 2 + rotationYDynamic
    this.rotation.x = tiltFrontal + rotationVariation  // frontal plano con ligera inclusión
    this.rotation.z = (Math.random() - 0.5) * 0.05
    this.scale.setScalar(scaleVariation * 0.95)

    this.originalPosition = this.position.clone()
    this.originalRotation = this.rotation.clone()
    this.originalScale = this.scale.clone()
    this.originalMeshRotation = this.mesh.rotation.clone()

    this.mesh.traverse(child => {
      if (child.isMesh) {
        child.userData.petalIndex = index
        child.userData.isPetal = true
      }
    })

  }

  async animateToCenterAndReturn(camera, onMessageStart, onMessageEnd) {
    if (this.animating || this.removed) return

    this.animating = true

    const worldPos = new THREE.Vector3()
    this.getWorldPosition(worldPos)
    const centerWorld = new THREE.Vector3(0, -0.25, 0)
    const approachTarget = this.parent.worldToLocal(centerWorld)

    const tl = gsap.timeline()

    tl.to(this.rotation, {
      x: 0,
      y: 0,
      z: 0,
      duration: 0.55,
      ease: 'power2.out'
    }, 0)

    tl.to(this.mesh.rotation, {
      y: 0,
      duration: 0.55,
      ease: 'power2.out'
    }, 0)

    tl.to(this.scale, {
      x: 1.8, y: 1.8, z: 1.8,
      duration: 0.45,
      ease: 'power1.out'
    }, 0)

    tl.to(this.position, {
      x: approachTarget.x,
      y: approachTarget.y,
      z: approachTarget.z,
      duration: 0.6,
      ease: 'power2.inOut'
    }, 0)

    await new Promise(resolve => tl.eventCallback('onComplete', resolve))

    onMessageStart()

    await new Promise(resolve => setTimeout(resolve, 5000))

    onMessageEnd()

    const returnTl = gsap.timeline()

    returnTl.to(this.position, {
      x: this.originalPosition.x,
      y: this.originalPosition.y,
      z: this.originalPosition.z,
      duration: 0.8,
      ease: 'back.out(1.7)'
    })

    returnTl.to(this.rotation, {
      x: this.originalRotation.x,
      y: this.originalRotation.y,
      z: this.originalRotation.z,
      duration: 0.8,
      ease: 'back.out(1.7)'
    }, 0)

    returnTl.to(this.mesh.rotation, {
      x: this.originalMeshRotation.x,
      y: this.originalMeshRotation.y,
      z: this.originalMeshRotation.z,
      duration: 0.8,
      ease: 'back.out(1.7)'
    }, 0)

    returnTl.to(this.scale, {
      x: this.originalScale.x,
      y: this.originalScale.y,
      z: this.originalScale.z,
      duration: 0.6,
      ease: 'elastic.out(1, 0.6)'
    }, 0.1)

    await new Promise(resolve => returnTl.eventCallback('onComplete', resolve))

    this.animating = false
  }

  reset() {
    this.removed = false
    this.animating = false
    this.position.copy(this.originalPosition)
    this.rotation.copy(this.originalRotation)
    this.scale.copy(this.originalScale)
    this.mesh.rotation.copy(this.originalMeshRotation)
    this.mesh.traverse(child => {
      if (child.isMesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material]
        mats.forEach(m => m.opacity = 1)
      }
    })
  }
}