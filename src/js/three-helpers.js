import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import raf from '/src/js/utils/raf'


export function init() {


  // CAMERA
  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight)


  // RENDERER
  const renderer = new THREE.WebGLRenderer({antialias: true})
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)
  const canvas = document.querySelector('canvas')


  // CONTROLS
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableZoom = true
  controls.enablePan = true
  controls.enableDamping = true
  controls.dampingFactor = 0.085

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  raf.subscribe(() => {
    controls.update()
  })

  return {
    scene,
    camera,
    renderer,
    controls
  }
}