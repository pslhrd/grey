import * as THREE from 'three'
import { AmbientLight, AudioListener, ExtrudeBufferGeometry, Shape, Vector3, Color, CubeReflectionMapping, Fog, Mesh, MeshPhysicalMaterial, Object3D, PointLight, TextureLoader } from 'three'
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'
import gsap from 'gsap'
import greyModel from '/src/assets/models/grey2.gltf'
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
let grey, light, amb, mouseX, mouseY, letter1, letter2, letter3, letter4
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
      menuLaunch()
      // sceneInit()
    } else {
      sceneInit()
      menuLaunch()
      homeLaunch()
      // movingImages()
    }
	}
)

function createParticleSystem (n) {
  const particles = new THREE.BufferGeometry()
  const vertices = []
  const pMaterial = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    opacity: 0.15,
    size: 0.1,
    transparent: true
  })

  for (let p = 0; p < n; p++) {
    const pX = Math.random() * 20 - 10
    const pY = Math.random() * 20 - 10
    const pZ = Math.random() * 20 - 10

    vertices.push(pX, pY, pZ)
  }

  particles.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))

  return new THREE.Points(particles, pMaterial)
}

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
  camera.position.z = 5
  camera.position.x = 0
  camera.position.y = 0
  scene.add(camera)

  // PARTICLES
  const particles = createParticleSystem(200)
  scene.add(particles)


  // LIGHTS
  light = new PointLight(0xffffff, 2, 0, 1)
  amb = new AmbientLight(0xffffff, 0.5)
  light.position.set(5, 5, 0)
  scene.add(amb, light)



  // EFFECTS
  effect = new AsciiEffect(renderer,' .-#',{invert: true})
  effect.setSize(window.innerWidth, window.innerHeight)
  effect.domElement.style.color = '#454545'
  effect.domElement.style.backgroundColor = 'none'
  document.body.appendChild(effect.domElement)
  effect.domElement.style.position = 'absolute'
  effect.domElement.style.top = '0px'
  effect.domElement.style.left = '0px'
  effect.domElement.style.zIndex = '1'


  if (isMobile.any()) {
    camera.position.z = 10
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

  grey = scene.children[0]
  letter1 = grey.children[0]
  letter2 = grey.children[1]
  letter3 = grey.children[2]
  letter4 = grey.children[3]


  // INTRO
  let tl = gsap.timeline()
  tl
  .set('.menu ul li', {autoAlpha:0})
  .set('.video', {autoAlpha:0, scale:0.8})
  .set('.logo, footer', {autoAlpha:0})

  .from(camera.position, {z:100, duration:2, ease:'power4.out'}, 2)
  .to('.video', {scale:1, autoAlpha:1, duration:1.2, ease:'power4.out', stagger:{ease:'power1.in', each:0.2}}, '-=1.2')
  .to('.menu ul li', {autoAlpha:1, duration:1.2, ease:'power3.out', stagger:0.1}, '-=2')
  .to('.logo, footer', {autoAlpha:1, duration:1.2, ease:'power4.out', stagger:0.1}, '-=1.6')


  function animate() {
    requestAnimationFrame(animate)
    render()
  }

  function render() {
    const timer = Date.now() - start
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
    document.querySelectorAll('.menu ul li').forEach(video => {
      video.addEventListener('click', event => {
        let data = video.getAttribute('data')
        openPlayer(data)
      })
    })
  }
}

function menuLaunch() {
  document.querySelectorAll('.menu ul li').forEach(links => {
    let videos = document.querySelectorAll('.video')

    links.addEventListener('mouseenter', event => {
      let menuData = links.getAttribute('data')
      videos.forEach(video => {
        let videoData = video.getAttribute('data')
        if (menuData === videoData) {
          if (isSafari === false) {
            gsap.fromTo([letter1.rotation, letter2.rotation, letter3.rotation, letter4.rotation],{x:0}, {x:-Math.PI * 2, duration:2, ease:'expo.out', stagger:0.1})
          }        
          gsap.set(video, {autoAlpha:0})
          video.querySelector('video').play()
          video.style.display = 'block'
          gsap.to(video, {autoAlpha:1, duration:0.6})
        }
      })
    })

    links.addEventListener('mouseleave', event => {
      let menuData = links.getAttribute('data')
      videos.forEach(video => {
        let videoData = video.getAttribute('data')
        if (menuData === videoData) {
          video.querySelector('video').pause()
          gsap.set(video, {autoAlpha:0})
          video.style.display = 'none'
        }
      })
    })
  })

}

function openPlayer(data) {
  console.log(effect)
  document.querySelectorAll('.player').forEach(player => {

    let tl = gsap.timeline()

    let playerData = player.getAttribute('data')
    let currentVideo = player.querySelector('.player-video')
    let currentPlayer = player.querySelector('.player-video video')
    let currentText = player.querySelectorAll('.player-content span')
    let currentBg = player.querySelector('.player-background')
    let currentClose = player.querySelector('.close')
    let currentCloseAnim = player.querySelector('.close span')
    let currentTap = player.querySelector('.tap')
    let videoStatus

    if (playerData === data) {
      tl.kill()
      tl = gsap.timeline()
      tl
      .set(currentBg, {autoAlpha:0})
      .set(currentPlayer, {autoAlpha:0, scale:1})
      .set(currentText, {y:'100%', autoAlpha:1})
      .set(currentCloseAnim, {y:'101%', autoAlpha:1})
      .add(function(){player.style.display = 'block'})
      .to(currentBg, {autoAlpha:1, duration:0.8, ease:'power2.out'})
      .to(currentPlayer, {autoAlpha:1, scale:1, duration:1.2, ease:'power4.out'}, '-=0.7')
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
        currentTap.style.display = 'none'
      }
      

    })
    currentClose.addEventListener('click', event => {
      tl.kill()
      currentTap.style.display = 'none'
      tl = gsap.timeline()
      tl
      .set(player, {pointerEvents: 'none'})
      .to(currentText, {autoAlpha:0, duration:0.6, ease:'power2.out'})
      .to(currentCloseAnim, {y:'-110%', duration:1, ease:'power2.out'}, '-=0.6')
      .to(currentPlayer, {autoAlpha:0, duration:1, ease:'power2.out'}, '-=0.8')
      .to(currentBg, {autoAlpha:0, duration:1, ease:'power2.out'}, '-=0.8')
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

function movingImages() {
  document.querySelectorAll('.video').forEach((video) => {
    let speed = video.getAttribute('speed')
    document.addEventListener('mousemove', event => {
      let 
      xPos = (event.clientX / window.innerWidth) - 0.5,
      yPos = (event.clientY / window.innerHeight) - 0.5

      gsap.to(video, {y: -yPos * speed, x: -xPos * speed, ease:'power1.out', duration:0.8})
    })

  })
}