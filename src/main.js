import * as THREE from 'three'
import { AmbientLight, AudioListener, ExtrudeBufferGeometry, Shape, Vector3, Color, CubeReflectionMapping, Fog, Mesh, MeshPhysicalMaterial, Object3D, PointLight, TextureLoader } from 'three'
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'
import gsap from 'gsap'
import greyModel from '/src/assets/models/grey.gltf'
import imagesLoaded from 'imagesloaded'

function lerp (start, end, amt) { return (1 - amt) * start + amt * end }
const loader = new GLTFLoader()
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
const isMobile = {
  Android: function () {
    return navigator.userAgent.match(/Android/i)
  },
  BlackBerry: function () {
    return navigator.userAgent.match(/BlackBerry/i)
  },
  iOS: function () {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i)
  },
  Opera: function () {
    return navigator.userAgent.match(/Opera Mini/i)
  },
  Windows: function () {
    return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i)
  },
  any: function () {
    return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows())
  }
}

let scene, camera, controls, renderer, effect
let grey, light, amb, mouseX, mouseY
const body = document.querySelector('body')
const preloader = document.querySelector('.preloader')
scene = new THREE.Scene()

// GLTF
loader.load(
	greyModel,
	function (gltf) {
    scene.add(gltf.scene.children[0])
    // sceneInit()
    if (isSafari === true){
      homeLaunch()
    } else {
      sceneInit()
      homeLaunch()
    }
	}
)

const start = Date.now()
let imgLoad = new imagesLoaded(body)

imgLoad.on( 'done', function( instance, image ) {
  let tl = gsap.timeline()
  tl
  .to(preloader, {autoAlpha:0, duration:1}, 1)

})

function sceneInit() {


  // RENDERER
  renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(0.1)
  // document.body.appendChild(renderer.domElement)


  // CAMERA
  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight)
  camera.position.z = 3.5
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
  effect.domElement.style.zIndex = '1'


  if (isMobile.any()) {
    camera.position.z = 2
    effect.domElement.style.position = 'fixed'
    effect.domElement.style.color = '#E0E0E0'
  } else {
    effect.domElement.style.position = 'absolute'
  }

  // CONTROLS
  // controls = new TrackballControls(camera, effect.domElement)
  // controls = new OrbitControls(camera, effect.domElement)
  // controls.enableZoom = true
  // controls.enablePan = true
  // controls.enableDamping = true
  // controls.dampingFactor = 0.085

  function onWindowResize() {
    renderer.setSize( window.innerWidth, window.innerHeight )
    camera.aspect = window.innerWidth / window.innerHeight
    effect.setSize( window.innerWidth, window.innerHeight )
    camera.updateProjectionMatrix()
    animate()
  }

  window.addEventListener('resize', onWindowResize, false)

  const cursor = new THREE.Vector2()
  const mouse = { x: 0, y: 0, target: null }

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX / window.innerWidth * 2 - 1
    mouse.y = e.clientY / window.innerHeight * 2 - 1
    mouse.target = e.target
  })

  const cameraLookingAt = new THREE.Vector3(mouse.x, mouse.y, 0)
  camera.lookAt(cameraLookingAt)

  grey = scene.children[0]


  // INTRO
  let tl = gsap.timeline()
  tl
  .set('.video', {autoAlpha:0, scale:0.8})
  .set('.logo, footer', {autoAlpha:0})

  .from(camera.position, {z:100, duration:2, ease:'power4.out'}, 2)
  .to('.video', {scale:1, autoAlpha:1, duration:1.2, ease:'power4.out', stagger:{ease:'power1.in', each:0.2}}, '-=1.2')
  .to('.logo, footer', {autoAlpha:1, duration:1.2, ease:'power4.out', stagger:0.1}, '-=1.6')


  function animate() {
    requestAnimationFrame(animate)
    render()
  }

  function render() {
    const timer = Date.now() - start

    cameraLookingAt.set(
      lerp(cameraLookingAt.x, mouse.x/3, 0.05),0,0
    )
    camera.lookAt(cameraLookingAt)

    // controls.update()
    effect.render(scene, camera)

    grey.rotation.y = timer * 0.0005
  }

  animate()
}

function homeLaunch(){
  if (isMobile.any()) {
    document.querySelectorAll('.video').forEach(video => {
      video.addEventListener('click', event => {
        event.preventDefault()
        let data = video.getAttribute('data')
        openPlayer(data)
      })
    })
  } else {
    document.querySelectorAll('.video').forEach(video => {
      video.addEventListener('click', event => {
        let data = video.getAttribute('data')
        openPlayer(data)
      })
      video.addEventListener('mouseenter', event => {
        let player = video.querySelector('.video-player video')
        // gsap.to(camera.position, {z:6, duration: 0.3, ease:'power3.out'})
        gsap.to(grey.rotation, {x:1, duration:2, ease:'elastic.out'})
        player.play()
      })
      video.addEventListener('mouseleave', event => {
        let player = video.querySelector('.video-player video')
        gsap.to(grey.rotation, {x:0, duration:2, ease:'elastic.out'})
        player.pause()
      })
    })
  }
}

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
      .to(currentCloseAnim, {y:'-103%', duration:1, ease:'power2.out'}, '-=0.6')
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