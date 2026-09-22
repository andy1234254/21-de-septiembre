import * as THREE from 'three'

export class MessageOverlay {
  constructor() {
    this.el = document.createElement('div')
    this.el.className = 'message-box hidden'
    document.getElementById('ui-overlay').appendChild(this.el)
    this.hideTimeout = null
    this.petal = null
    this.camera = null
  }

  show(message, petal, camera) {
    this.el.textContent = message
    this.petal = petal
    this.camera = camera
    this.el.classList.remove('hidden')
    this.el.classList.add('visible')

    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout)
      this.hideTimeout = null
    }
  }

  hide() {
    this.petal = null
    this.camera = null
    this.el.classList.remove('visible')
    this.el.classList.add('hidden')

    this.hideTimeout = setTimeout(() => {
      this.el.classList.add('hidden')
    }, 400)
  }

  updatePosition() {
    if (!this.petal || !this.camera) return

    this.petal.updateMatrixWorld(true)
    const bounds = new THREE.Box3().setFromObject(this.petal.mesh)
    const corners = []
    const min = bounds.min
    const max = bounds.max

    for (const x of [min.x, max.x]) {
      for (const y of [min.y, max.y]) {
        for (const z of [min.z, max.z]) {
          const point = new THREE.Vector3(x, y, z).project(this.camera)
          corners.push({
            x: (point.x * 0.5 + 0.5) * window.innerWidth,
            y: (-point.y * 0.5 + 0.5) * window.innerHeight
          })
        }
      }
    }

    const left = Math.min(...corners.map(point => point.x))
    const right = Math.max(...corners.map(point => point.x))
    const top = Math.min(...corners.map(point => point.y))
    const bottom = Math.max(...corners.map(point => point.y))
    const petalWidth = right - left
    const petalHeight = bottom - top
    const messageWidth = THREE.MathUtils.clamp(petalWidth * 0.78, 76, 220)
    const fontSize = THREE.MathUtils.clamp(Math.min(petalWidth * 0.065, petalHeight * 0.22), 8, 15)

    this.el.style.left = `${(left + right) / 2}px`
    this.el.style.top = `${(top + bottom) / 2}px`
    this.el.style.width = `${messageWidth}px`
    this.el.style.fontSize = `${fontSize}px`
  }
}