import * as THREE from 'three'
import { AmbientLight, AudioListener, ExtrudeBufferGeometry, Shape, Vector3, Color, CubeReflectionMapping, Fog, Mesh, MeshPhysicalMaterial, Object3D, PointLight, TextureLoader } from 'three'
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'
import gsap from 'gsap'
import greyModel from '/src/assets/models/grey.gltf'


const loader = new GLTFLoader()

let scene, camera, controls, renderer, effect
let grey, light, amb
scene = new THREE.Scene()

// GLTF
loader.load(
	greyModel,
	function (gltf) {
    scene.add(gltf.scene.children[0])
    sceneInit()
	}
)

const start = Date.now()


function sceneInit() {

  // RENDERER
  renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  // document.body.appendChild(renderer.domElement)


  // CAMERA
  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight)
  camera.position.z = 6
  camera.position.x = 0
  camera.position.y = 0
  scene.add(camera)


  // LIGHTS
  light = new PointLight(0xffffff, 1.8, 0, 1)
  amb = new AmbientLight(0xffffff, 0.5)
  light.position.set(0, 10, 0)
  scene.add(amb, light)



  // EFFECTS
  effect = new AsciiEffect(renderer,' .:-#',{invert: true})
  effect.setSize(window.innerWidth, window.innerHeight)
  effect.domElement.style.color = 'white'
  effect.domElement.style.backgroundColor = 'black'
  document.body.appendChild(effect.domElement)


  // CONTROLS
  // controls = new TrackballControls(camera, effect.domElement)
  controls = new OrbitControls(camera, effect.domElement)
  controls.enableZoom = true
  controls.enablePan = true
  controls.enableDamping = true
  controls.dampingFactor = 0.085

  function onWindowResize() {
    renderer.setSize( window.innerWidth, window.innerHeight )
    camera.aspect = window.innerWidth / window.innerHeight
    effect.setSize( window.innerWidth, window.innerHeight )
    camera.updateProjectionMatrix()
    animate()
  }

  window.addEventListener('resize', onWindowResize, false)

  grey = scene.children[0]


  function animate() {
    requestAnimationFrame(animate)
    render()
  }

  function render() {
    const timer = Date.now() - start

    controls.update()
    effect.render(scene, camera)

    grey.rotation.y = timer * 0.0006;
  }

  animate()
}
