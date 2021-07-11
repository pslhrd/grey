import * as THREE from 'three'
import { AmbientLight, AudioListener, ExtrudeBufferGeometry, Shape, Vector3, Color, CubeReflectionMapping, Fog, Mesh, MeshPhysicalMaterial, Object3D, PointLight, TextureLoader } from 'three'
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'
import gsap from 'gsap'
import greyModel from '/src/assets/models/grey.gltf'
import imagesLoaded from 'imagesloaded'


const loader = new GLTFLoader()

let scene, camera, controls, renderer, effect
let grey, light, amb
const body = document.querySelector('body')
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

let imgLoad = new imagesLoaded(body,onceLoaded())

imgLoad.on( 'progress', function( instance, image ) {
  var result = image.isLoaded ? 'loaded' : 'broken';
  console.log( 'image is ' + result + ' for ' + image.img.src );
})

function onceLoaded() {
  console.log('Loaded')
}


function sceneInit() {

  // RENDERER
  renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(1)
  // document.body.appendChild(renderer.domElement)


  // CAMERA
  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight)
  camera.position.z = 4
  camera.position.x = 0
  camera.position.y = 0
  scene.add(camera)


  // LIGHTS
  light = new PointLight(0xffffff, 1.8, 0, 1)
  amb = new AmbientLight(0xffffff, 0.5)
  light.position.set(5, 5, 0)
  scene.add(amb, light)



  // EFFECTS
  effect = new AsciiEffect(renderer,' .-#',{invert: true})
  effect.setSize(window.innerWidth, window.innerHeight)
  effect.domElement.style.color = '#B0B0B0'
  effect.domElement.style.backgroundColor = '#EDEDED'
  document.body.appendChild(effect.domElement)
  effect.domElement.style.position = 'absolute'
  effect.domElement.style.top = '0px'
  effect.domElement.style.left = '0px'


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


  // INTRO


  function animate() {
    requestAnimationFrame(animate)
    render()
  }

  function render() {
    const timer = Date.now() - start

    controls.update()
    effect.render(scene, camera)

    grey.rotation.y = timer * 0.0005
  }

  animate()
}

document.querySelectorAll('.video').forEach(video => {
  video.addEventListener('click', event => {
    let data = video.getAttribute('data')
    openPlayer(data)
  })
  video.addEventListener('mouseenter', event => {
    let player = video.querySelector('.video-player video')
    player.play()
  })
  video.addEventListener('mouseleave', event => {
    let player = video.querySelector('.video-player video')
    player.pause()
  })
})

function openPlayer(data) {
  console.log(effect)
  document.querySelectorAll('.player').forEach(player => {

    let playerData = player.getAttribute('data')
    let currentVideo = player.querySelector('.player-video')
    let currentPlayer = player.querySelector('.player-video video')
    let currentText = player.querySelectorAll('.player-content span')
    let currentBg = player.querySelector('.player-background')
    let currentClose = player.querySelector('.close')
    let currentCloseAnim = player.querySelector('.close span')
    let videoStatus

    if (playerData === data) {
      let tl = gsap.timeline()
      tl
      .set(currentBg, {autoAlpha:0})
      .set(currentPlayer, {autoAlpha:0, scale:1.2})
      .set(currentText, {y:'100%', autoAlpha:1})
      .set(currentCloseAnim, {y:'101%', autoAlpha:1})
      .add(function(){player.style.display = 'block'})
      .to(currentBg, {autoAlpha:1, duration:1, ease:'power4.out'})
      .to(currentPlayer, {autoAlpha:1, scale:1, duration:1.2, ease:'power4.out'}, '-=0.9')
      .to(currentCloseAnim, {y:'0%', duration:1.2, ease:'power4.out'}, '-=0.9')      
      .to(currentText, {y:'0%', duration:1, ease:'power4.out', stagger:0.2}, '-=0.8')
          
    }

    currentVideo.addEventListener('click', event => {
      console.log(currentPlayer)
      if (videoStatus === 'playing'){
        currentPlayer.pause()
        videoStatus = 'paused'
      } else {
        currentPlayer.play()
        videoStatus = 'playing'
      }
      

    })
    currentClose.addEventListener('click', event => {
      let tl = gsap.timeline()
      tl
      .set(player, {pointerEvents: 'none'})
      .to(currentText, {autoAlpha:0, duration:0.6, ease:'power2.out'})
      .to(currentCloseAnim, {y:'-101%', duration:1, ease:'power2.out'}, '-=0.6')
      .to(currentPlayer, {autoAlpha:0, duration:1, ease:'power4.out'}, '-=0.8')
      .to(currentBg, {autoAlpha:0, duration:1, ease:'power4.out'}, '-=0.8')
      .add(function(){
        player.style.display = 'none'
        player.style.pointerEvents = 'all'
        currentPlayer.pause()
        currentPlayer.currentTime = 0
        videoStatus = 'stopped'
      })    
    })
  })
}