import * as THREE from 'three'
import { AmbientLight, AudioListener, ExtrudeBufferGeometry, Shape, Vector3, Color, CubeReflectionMapping, Fog, Mesh, MeshPhysicalMaterial, Object3D, PointLight, TextureLoader } from 'three'
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'
import gsap from 'gsap'
import greyModel from '/src/assets/models/grey2.gltf'
import imagesLoaded from 'imagesloaded'
import thumbnail from '/src/assets/images/thumbnail.jpg'

function lerp (start, end, amt) { return (1 - amt) * start + amt * end }
const loader = new GLTFLoader()
const isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
                 navigator.userAgent &&
                 navigator.userAgent.indexOf('CriOS') == -1 &&
                 navigator.userAgent.indexOf('FxiOS') == -1;
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
let grey, light, amb, mouseX, mouseY, letter1, letter2, letter3, letter4, light2, video, videoTexture, planeGeometry, planeTexture, plane
const start = Date.now()
const body = document.querySelector('body')
let imgLoad = new imagesLoaded(body)
const preloader = document.querySelector('.preloader')
scene = new THREE.Scene()
gsap.set('.menu ul li', {y:'100%'})
gsap.set('.logo, footer', {autoAlpha:0})
gsap.set('.video', {y:'40%', autoAlpha:0})

// GLTF
loader.load(
	greyModel,
	function (gltf) {
    scene.add(gltf.scene.children[0])
    // sceneInit()
    if (isMobile.any()){
      mobileLaunch()
      homeLaunch()
    } else {
      sceneInit()
      homeLaunch()
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
    const pX = Math.random() * 10 - 5
    const pY = Math.random() * 10 - 5
    const pZ = Math.random() * 10 - 5

    vertices.push(pX, pY, pZ)
  }

  particles.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))

  return new THREE.Points(particles, pMaterial)
}

imgLoad.on( 'done', function( instance, image ) {
  console.log('done')
  let tl = gsap.timeline()
  tl
  .to(preloader, {autoAlpha:0, duration:1}, 0.5)
})

function sceneInit() {


  // RENDERER
  renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(1)
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
  light = new PointLight(0xffffff, 1.2, 0, 1)
  light2 = new PointLight(0xffffff, 1.2, 0, 1)
  amb = new AmbientLight(0xffffff, 0.5)
  light.position.set(0, -10, -10)
  light2.position.set(0, 10, 10)
  scene.add(light, light2)


  // VIDEOS
  videoTexture = new THREE.TextureLoader().load(thumbnail)
  planeGeometry = new THREE.PlaneGeometry(1, 1)
  planeTexture = new THREE.MeshStandardMaterial({map: videoTexture})
  plane = new THREE.Mesh(planeGeometry, planeTexture)
  plane.position.set(-0.08, 0, 2.8)
  plane.scale.set(0,0,0)
  scene.add(plane)



  // HOVER
  function safariVideos() {
    document.querySelectorAll('.menu ul li').forEach(links => {
      let videos = document.querySelectorAll('.video')

      links.addEventListener('mouseenter', event => {
        let menuData = links.getAttribute('data')
        videos.forEach(video => {
          let videoData = video.getAttribute('data')
          if (menuData === videoData) {
            let img = video.querySelector('img').src
            videoTexture = new THREE.TextureLoader().load(img)
            plane.material.map = videoTexture
            // plane.material.map = videoTexture
            gsap.fromTo(plane.scale,{y:0.8, x:0.8, z:0.8}, {y:1, x:1, z:1, duration:1.2, ease:'expo.out'})
            gsap.to([letter1.scale, letter2.scale, letter3.scale, letter4.scale],{y:0, x:0, z:0, duration:1.2, ease:'expo.out', stagger:0.1})  
            
          }
        })
      })

      links.addEventListener('mouseleave', event => {
        let menuData = links.getAttribute('data')
        videos.forEach(video => {
          let videoData = video.getAttribute('data')
          if (menuData === videoData) {
            gsap.killTweensOf(plane.scale)
            gsap.to(plane.scale, {y:0, x:0, z:0, duration:1.2, ease:'expo.out'})
            gsap.fromTo([letter1.rotation, letter2.rotation, letter3.rotation, letter4.rotation],{x:0}, {x:-Math.PI * 2, duration:1.2, ease:'expo.out', stagger:0.1})
            gsap.to([letter1.scale, letter2.scale, letter3.scale, letter4.scale], {y:1, x:1, z:1, duration:1.2, ease:'expo.out', stagger:0.1})  
          }
        })
      })
    })
  }

  function chromeVideos() {
    document.querySelectorAll('.menu ul li').forEach(links => {
      let videos = document.querySelectorAll('.videos video')

      links.addEventListener('mouseenter', event => {
        let menuData = links.getAttribute('data')
        videos.forEach(video => {
          let videoData = video.getAttribute('data')
          if (menuData === videoData) {
            videoTexture = new THREE.VideoTexture(video)
            plane.material.map = videoTexture
            video.muted = 'true'
            videoTexture.needsUpdate
            videoTexture.crossOrigin = 'anonymous'
            videoTexture.src = 'src to video'
            video.setAttribute('muted', '')
            video.play()
            gsap.fromTo(plane.scale,{y:0.6, x:0.6, z:0.6}, {y:1, x:1, z:1, duration:1.2, ease:'expo.out'})
            gsap.to([letter1.scale, letter2.scale, letter3.scale, letter4.scale],{y:0, x:0, z:0, duration:1.2, ease:'expo.out', stagger:0.1})  
            
          }
        })
      })

      links.addEventListener('mouseleave', event => {
        let menuData = links.getAttribute('data')
        videos.forEach(video => {
          let videoData = video.getAttribute('data')
          if (menuData === videoData) {
            video.pause()
            gsap.killTweensOf(plane.scale)
            gsap.to(plane.scale, {y:0, x:0, z:0, duration:1.2, ease:'expo.out'})
            gsap.fromTo([letter1.rotation, letter2.rotation, letter3.rotation, letter4.rotation],{x:0}, {x:-Math.PI * 2, duration:1.2, ease:'expo.out', stagger:0.1})
            gsap.to([letter1.scale, letter2.scale, letter3.scale, letter4.scale], {y:1, x:1, z:1, duration:1.2, ease:'expo.out', stagger:0.1})  
          }
        })
      })
    })
  }

  if (isSafari === false) {
    console.log('chrome')
    chromeVideos()
  } else {
    console.log('safari')
    safariVideos()
  }


  // EFFECTS

  effect = new AsciiEffect(renderer,' .-#&@/+',{invert: true})
  effect.setSize(window.innerWidth, window.innerHeight)
  effect.domElement.style.color = '#454545'
  effect.domElement.style.backgroundColor = 'none'
  document.body.appendChild(effect.domElement)

  effect.domElement.style.position = 'absolute'
  effect.domElement.style.top = '0px'

  let table = effect.domElement.querySelector('table')
  table.style.display = 'table'
  gsap.set(effect.domElement, {scale:1.05})
  effect.domElement.style.left = '0px'
  effect.domElement.style.zIndex = '1'


  if (isMobile.any()) {
    camera.position.z = 8
    camera.position.y = -0.3
  }

  // CONTROLS
  // controls = new TrackballControls(camera, effect.domElement)
  // controls = new OrbitControls(camera, renderer.domElement)
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
  grey.position.set(-0.08, 0, 1)
  letter1 = grey.children[0]
  letter2 = grey.children[1]
  letter3 = grey.children[2]
  letter4 = grey.children[3]


  // INTRO
  let tl = gsap.timeline()

  tl
  .from(camera.position, {z:50, duration:2, ease:'expo.out'}, 0.5)
  .fromTo([letter1.scale, letter2.scale, letter3.scale, letter4.scale],{y:0, x:0, z:0}, {y:1, x:1, z:1, duration:1.2, ease:'expo.out', stagger:0.1}, 1)
  .fromTo([letter1.rotation, letter2.rotation, letter3.rotation, letter4.rotation],{x:0}, {x:-Math.PI * 2, duration:1.2, ease:'expo.out', stagger:0.1}, 1)
  .to('.menu ul li', {y:'0%', autoAlpha:1, duration:1.2, ease:'power4.out', stagger:0.06}, '-=1.2')
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

function mobileLaunch() {
  let tl = gsap.timeline()

  tl
  .to('.video', {y:'0%', autoAlpha:1, ease:'power4.out', duration:1.4, stagger: 0.2}, 0.5)
  .to('.menu ul li', {y:'0%', autoAlpha:1, duration:1.2, ease:'power4.out', stagger:0.09},  0.5)
  .to('.logo, footer', {autoAlpha:1, duration:1.2, ease:'power4.out', stagger:0.1}, '-=1.6')
}

function homeLaunch(){
  if (isMobile.any()) {
    document.querySelectorAll('.video').forEach(video => {
      video.addEventListener('click', event => {
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

function openPlayer(data) {
  document.querySelectorAll('.player').forEach(player => {

    gsap.killTweensOf(player)

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
      tl = gsap.timeline()
      tl
      .set(currentBg, {autoAlpha:0})
      .set(currentPlayer, {autoAlpha:0, scale:1})
      .set(currentText, {y:'100%', autoAlpha:1})
      .set(currentCloseAnim, {y:'101%', autoAlpha:1})
      .add(function(){player.style.display = 'block'; currentTap.style.display = 'block'})
      .to(currentBg, {autoAlpha:1, duration:0.6, ease:'power2.out'})
      .to(currentPlayer, {autoAlpha:1, scale:1, duration:1, ease:'power2.out'}, '-=0.3')
      .to(currentCloseAnim, {y:'0%', duration:1, ease:'power4.out'}, '-=0.9')      
      .to(currentText, {y:'0%', duration:1, ease:'power4.out', stagger:0.2}, '-=0.8')
      .add(function(){currentPlayer.style.visibility = 'visible'})
          
    }

    currentVideo.addEventListener('click', event => {
      if (videoStatus === 'playing'){
        currentPlayer.pause()
        videoStatus = 'paused'
        currentTap.style.display = 'block'
      } else {
        currentPlayer.play()
        videoStatus = 'playing'
        currentTap.style.display = 'none'
      }
      

    })
    currentClose.addEventListener('click', event => {
      currentTap.style.display = 'none'
      tl = gsap.timeline()
      tl
      .set(player, {pointerEvents: 'none'})
      .to(currentText, {autoAlpha:0, duration:0.6, ease:'power2.out'})
      .to(currentCloseAnim, {y:'-110%', duration:1, ease:'power2.out'}, '-=0.6')
      .to(currentPlayer, {autoAlpha:0, duration:0.6, ease:'power2.out'}, '-=0.8')
      .to(currentBg, {autoAlpha:0, duration:0.6, ease:'power2.out'}, '-=0.8')
      .add(function(){
        player.style.display = 'none'
        player.style.pointerEvents = 'all'
        currentPlayer.pause()
        currentPlayer.currentTime = 0
        videoStatus = 'stopped'
        currentTap.style.display = 'block'
      })    
    })
  })
}