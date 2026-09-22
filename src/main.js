import * as THREE from 'three'
import { gsap } from 'gsap'
import { Sunflower } from './sunflower/Sunflower.js'
import { MessageOverlay } from './ui/MessageOverlay.js'
import { state } from './state/GameState.js'
import { ROMANTIC_MESSAGES } from './utils/messages.js'
import { setupLights } from './utils/lighting.js'
import './style.css'

const canvas = document.getElementById('three-canvas')
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.1
renderer.setClearColor(0x000000, 0)

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 0, 5)
camera.lookAt(0, -0.5, 0)

setupLights(scene)

const video = document.getElementById('bg-video')
const audio = document.getElementById('bg-audio')
const uiOverlay = document.getElementById('ui-overlay')
const dateTitle = document.getElementById('date-title')
const memoryPhoto = document.getElementById('memory-photo')
const memoryPhotoClose = document.getElementById('memory-photo-close')
const orientationNotice = document.createElement('div')
orientationNotice.className = 'orientation-notice'
orientationNotice.innerHTML = '<div class="orientation-icon" aria-hidden="true">↔</div><p>Gira tu dispositivo<br>para continuar</p>'
uiOverlay.appendChild(orientationNotice)

function openMemoryPhoto() {
  if (isMobilePortrait() || memoryPhoto.classList.contains('is-open')) return

  memoryPhoto.classList.add('is-open')
  memoryPhoto.setAttribute('aria-hidden', 'false')
  gsap.fromTo(memoryPhoto,
    { scale: 0.08, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.65, ease: 'back.out(1.35)' }
  )
}

function closeMemoryPhoto() {
  if (!memoryPhoto.classList.contains('is-open')) return

  gsap.to(memoryPhoto, {
    scale: 0.08,
    opacity: 0,
    duration: 0.42,
    ease: 'power2.in',
    onComplete: () => {
      memoryPhoto.classList.remove('is-open')
      memoryPhoto.setAttribute('aria-hidden', 'true')
    }
  })
}

dateTitle.addEventListener('click', openMemoryPhoto)
dateTitle.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    openMemoryPhoto()
  }
})
memoryPhotoClose.addEventListener('click', closeMemoryPhoto)

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
let hoveredPetalIndex = -1

let audioUnlocked = false

function isMobilePortrait() {
  const isTouchDevice = navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches
  return isTouchDevice && window.innerHeight > window.innerWidth
}

function unlockAudio() {
  if (!audioUnlocked && !isMobilePortrait()) {
    audio.play()
      .then(() => {
        audioUnlocked = true
      })
      .catch(() => {})
  }
}

function unlockVideo() {
  video.play().catch(() => {})
}

function unlockAll() {
  if (isMobilePortrait()) return
  unlockVideo()
  unlockAudio()
}

window.addEventListener('click', unlockAll)
window.addEventListener('keydown', unlockAll)

video.play().catch(() => {})
unlockAudio()

video.addEventListener('error', (e) => {
  console.error('Video error:', e, video.error)
})
video.addEventListener('loadeddata', () => {
  console.log('Video loadeddata, readyState:', video.readyState)
})
video.addEventListener('canplay', () => {
  console.log('Video canplay')
})

canvas.addEventListener('click', handlePetalClick)
canvas.addEventListener('touchstart', handlePetalClick, { passive: true })
canvas.addEventListener('pointermove', handlePetalHover)

const messageOverlay = new MessageOverlay()

const sunflower = new Sunflower()
scene.add(sunflower)

function updateOrientationLock() {
  const portrait = isMobilePortrait()
  document.body.classList.toggle('mobile-portrait-lock', portrait)

  if (portrait) {
    setPetalHighlight(-1)
    canvas.style.cursor = 'default'
    closeMemoryPhoto()
  }
}

function handlePetalClick(event) {
  if (state.isAnimating || isMobilePortrait()) return

  const clientX = event.clientX || (event.touches && event.touches[0].clientX)
  const clientY = event.clientY || (event.touches && event.touches[0].clientY)
  if (clientX === undefined || clientY === undefined) return

  mouse.set(
    (clientX / window.innerWidth) * 2 - 1,
    -(clientY / window.innerHeight) * 2 + 1
  )

  raycaster.setFromCamera(mouse, camera)

  const hitIndex = getHoveredPetal()

  if (hitIndex >= 0) {
    animatePetal(hitIndex)
  }
}

function getHoveredPetal() {
  sunflower.updateMatrixWorld(true)
  const intersections = raycaster.intersectObjects(sunflower.getPetalMeshes(), false)

  for (const intersection of intersections) {
    const index = intersection.object.userData.petalIndex
    const petal = sunflower.getPetal(index)
    if (!petal.animating) return index
  }

  return -1
}

function handlePetalHover(event) {
  if (state.isAnimating || isMobilePortrait()) {
    setPetalHighlight(-1)
    canvas.style.cursor = 'default'
    return
  }

  mouse.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  )
  raycaster.setFromCamera(mouse, camera)
  const nextHoveredPetal = getHoveredPetal()
  setPetalHighlight(nextHoveredPetal)
  canvas.style.cursor = nextHoveredPetal >= 0 ? 'pointer' : 'default'
}

function setEmissive(material, hex, intensity) {
  const mats = Array.isArray(material) ? material : [material]
  mats.forEach(mat => {
    if (mat.emissive !== undefined) {
      mat.emissive.setHex(hex)
      mat.emissiveIntensity = intensity
    }
  })
}

function setPetalHighlight(index) {
  if (hoveredPetalIndex === index) return

  if (hoveredPetalIndex >= 0) {
    sunflower.getPetal(hoveredPetalIndex).mesh.traverse(child => {
      if (child.isMesh) setEmissive(child.material, 0x000000, 0)
    })
  }

  if (index >= 0) {
    sunflower.getPetal(index).mesh.traverse(child => {
      if (child.isMesh) setEmissive(child.material, 0xFFBF00, 0.25)
    })
  }

  hoveredPetalIndex = index
}

async function animatePetal(index) {
  state.isAnimating = true
  state.currentPetalIndex = index

  const petal = sunflower.getPetal(index)

  await petal.animateToCenterAndReturn(camera,
    () => {
      messageOverlay.show(ROMANTIC_MESSAGES[index], petal, camera)
    },
    () => {
      messageOverlay.hide()
    }
  )

  state.isAnimating = false
  state.currentPetalIndex = null
}

let lastTime = 0
function animate(time) {
  requestAnimationFrame(animate)

  const delta = (time - lastTime) * 0.001
  lastTime = time

  if (!state.isAnimating) {
    const idleTime = time * 0.001
    const swayAmount = 0.015
    const swaySpeed = 0.35

    sunflower.rotation.y = Math.sin(idleTime * swaySpeed) * swayAmount
    sunflower.rotation.x = Math.sin(idleTime * swaySpeed * 0.7 + 1.5) * swayAmount * 0.6

    sunflower.petals.forEach((petal, i) => {
      if (!petal.removed && !petal.animating) {
        const petalSway = Math.sin(idleTime * 0.7 + i * 0.5) * 0.008
        petal.rotation.z = petal.originalRotation.z + petalSway
      }
    })
  }

  messageOverlay.updatePosition()

  renderer.render(scene, camera)
}

animate(0)

function handleViewportChange() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)

  sunflower.updatePosition(window.innerWidth, window.innerHeight)
  setPetalHighlight(-1)
  updateOrientationLock()
  if (!isMobilePortrait()) unlockAudio()
}

window.addEventListener('resize', handleViewportChange)
window.addEventListener('orientationchange', handleViewportChange)
window.visualViewport?.addEventListener('resize', handleViewportChange)
updateOrientationLock()