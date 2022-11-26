import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 360 })

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */
const parameters = {}
parameters.count = 100000
parameters.size = 0.01
parameters.radius = 5
parameters.branches = 3
parameters.spin = 1
parameters.randomness = 0.2
parameters.randomnessPower = 3
parameters.insideColor = "#ff6030"
parameters.outsideColor = "#1b3984"

let galaxyGeometry = null
let galaxyMaterial = null
let Galaxy = null

const generateGalaxy = function () {

    if (Galaxy !== null) {
        galaxyGeometry.dispose()
        galaxyMaterial.dispose()
        scene.remove(Galaxy)
    }

    galaxyGeometry = new THREE.BufferGeometry()
    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)

    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3

        const radius = Math.random() * parameters.radius
        const spinAngle = radius * parameters.spin
        const branchesAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)

        positions[i3] = Math.cos(branchesAngle + spinAngle) * radius + randomX
        positions[i3 + 1] = randomY
        positions[i3 + 2] = Math.sin(branchesAngle + spinAngle) * radius + randomZ

        // Colors 


        const colorInside = new THREE.Color(parameters.insideColor)
        const colorOutside = new THREE.Color(parameters.outsideColor)

        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / parameters.radius)


        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b

    }
    galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    galaxyMaterial = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })

    Galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial)
    scene.add(Galaxy)
}

generateGalaxy()

gui.add(parameters, "count", 100, 1000000, 100).name("Number Of Particles").onFinishChange(generateGalaxy)
gui.add(parameters, "size", 0.001, 0.1, 0.001).name("Size Of Particles").onFinishChange(generateGalaxy)
gui.add(parameters, "radius", 0.01, 20, 0.01).name("Radius Of Galaxies").onFinishChange(generateGalaxy)
gui.add(parameters, "branches", 2, 20, 1).name("Branches Of Galaxies").onFinishChange(generateGalaxy)
gui.add(parameters, "spin", -5, 5, 0.01).name("Spin Galaxies").onFinishChange(generateGalaxy)
gui.add(parameters, "randomness", -5, 5, 0.01).name("Randomness").onFinishChange(generateGalaxy)
gui.add(parameters, "randomnessPower", 1, 10, 0.001).name("Randomness Power").onFinishChange(generateGalaxy)
gui.addColor(parameters, "insideColor").name("Inside Color").onFinishChange(generateGalaxy)
gui.addColor(parameters, "outsideColor").name("Outside Color").onFinishChange(generateGalaxy)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // update galaxy 
    Galaxy.rotation.y = elapsedTime * 0.05

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()