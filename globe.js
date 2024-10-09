let scene, camera, renderer, earth, connections

function init() {
  scene = new THREE.Scene()

  const container = document.getElementById("globe-container")
  const aspect = container.offsetWidth / container.offsetHeight
  camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(container.offsetWidth, container.offsetHeight)
  container.appendChild(renderer.domElement)

  // Create Earth
  const earthGeometry = new THREE.SphereGeometry(5, 64, 64)
  const textureLoader = new THREE.TextureLoader()
  const earthTexture = textureLoader.load(
    "https://unpkg.com/three-globe/example/img/earth-dark.jpg"
  )
  const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthTexture,
    bumpMap: textureLoader.load(
      "https://unpkg.com/three-globe/example/img/earth-topology.png"
    ),
    bumpScale: 0.05,
    specularMap: textureLoader.load(
      "https://unpkg.com/three-globe/example/img/earth-water.png"
    ),
    specular: new THREE.Color("grey"),
    shininess: 50,
  })
  earth = new THREE.Mesh(earthGeometry, earthMaterial)
  scene.add(earth)

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0x404040, 1)
  scene.add(ambientLight)

  // Add directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(5, 3, 5)
  scene.add(directionalLight)

  // Create connections
  connections = new THREE.Group()
  scene.add(connections)
  createConnections()

  camera.position.z = 15

  window.addEventListener("resize", onWindowResize, false)

  animate()
}

function createConnections() {
  const connectionMaterial = new THREE.LineBasicMaterial({
    color: 0x00ffff,
    linewidth: 1,
    transparent: true,
    opacity: 0.8,
  })

  const cities = [
    { lat: 40.7128, lon: -74.006 }, // New York
    { lat: 51.5074, lon: -0.1278 }, // London
    { lat: 35.6762, lon: 139.6503 }, // Tokyo
    { lat: -33.8688, lon: 151.2093 }, // Sydney
    { lat: -1.2921, lon: 36.8219 }, // Nairobi
    { lat: 55.7558, lon: 37.6173 }, // Moscow
    { lat: 19.4326, lon: -99.1332 }, // Mexico City
    { lat: -22.9068, lon: -43.1729 }, // Rio de Janeiro
  ]

  for (let i = 0; i < cities.length; i++) {
    for (let j = i + 1; j < cities.length; j++) {
      const startPos = latLonToVector3(cities[i].lat, cities[i].lon, 5)
      const endPos = latLonToVector3(cities[j].lat, cities[j].lon, 5)

      const curve = new THREE.QuadraticBezierCurve3(
        startPos,
        startPos
          .clone()
          .add(endPos)
          .multiplyScalar(0.5)
          .normalize()
          .multiplyScalar(7),
        endPos
      )

      const points = curve.getPoints(50)
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const connection = new THREE.Line(geometry, connectionMaterial)

      connections.add(connection)

      // Animate connection opacity
      gsap.to(connection.material, {
        opacity: 0.2,
        duration: 1 + Math.random() * 2,
        yoyo: true,
        repeat: -1,
        ease: "power2.inOut",
      })
    }
  }
}

function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)
  return new THREE.Vector3(x, y, z)
}

function animate() {
  requestAnimationFrame(animate)

  earth.rotation.y += 0.002
  connections.rotation.y += 0.002

  renderer.render(scene, camera)
}

function onWindowResize() {
  const container = document.getElementById("globe-container")
  camera.aspect = container.offsetWidth / container.offsetHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container.offsetWidth, container.offsetHeight)
}

init()
