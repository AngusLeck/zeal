import * as THREE from "three";

import Stats from "three/examples/jsm/libs/stats.module";
import { BodyOnRails, Satellite } from "./BodyOnRails";

// screen variables
let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

// container variables
let container, stats: Stats;

// camera variables
let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;

// camera variables
let cameraRig: THREE.Object3D<THREE.Object3DEventMap>;
let cameraPerspective: THREE.PerspectiveCamera;
let cameraPerspectiveHelper: THREE.CameraHelper;

const loader = new THREE.TextureLoader();
const jupiterTexture = loader.load("./static/jupiter/textures/texture.jpeg");

const jupiterMaterial = new THREE.MeshPhysicalMaterial({
  map: jupiterTexture,
});

const earthTexture = loader.load(
  "./static/earth/textures/Material.001_baseColor.jpeg"
);

const earthMaterial = new THREE.MeshPhysicalMaterial({
  map: earthTexture,
  depthTest: true,
  depthWrite: true,
});

const phase = 2;
const elevation = 6e3;
const cities: Satellite[] = [
  {
    body: new BodyOnRails(
      {
        color: "red",
        emissiveIntensity: 100,
        mass: 10,
        radius: 1e6,
      },
      []
    ),
    radius: 6e6 + elevation,
    plane: "perpendicular",
    geostationary: true,
    phase: phase,
  },
  {
    body: new BodyOnRails(
      {
        color: "blue",
        emissiveIntensity: 1,
        mass: 10,
        radius: 1,
      },
      []
    ),
    radius: 6e6 + 4 * elevation,
    plane: "perpendicular",
    geostationary: true,
    phase: phase + 0.01,
  },
];

const E = new BodyOnRails(
  { radius: 6e6, mass: 1e28 },
  cities,
  earthMaterial,
  60 * 60 * 24
);

const J = new BodyOnRails(
  { radius: 7e7, mass: 1e29 },
  [
    {
      body: E,
      radius: 2e8,
      direction: "clockwise",
      plane: "perpendicular",
      phase: 0,
      tidallyLocked: true,
    },
  ],
  jupiterMaterial
);

E.castShadow = true;
E.receiveShadow = true;
J.castShadow = true;
J.receiveShadow = true;

const system = new BodyOnRails(
  { radius: 6e8, mass: 2e30, color: "wheat", emissiveIntensity: 1.2 },
  [
    {
      body: J,
      radius: 8 * 60e8,
      direction: "clockwise",
      plane: "coplanar",
      phase: 0,
    },
    {
      body: new BodyOnRails({ radius: 2e7, mass: 2e29 }, [
        {
          body: new BodyOnRails({ radius: 1e7, mass: 1e28 }),
          radius: 3e8,
          direction: "clockwise",
          plane: "coplanar",
          phase: 0,
        },
        {
          body: new BodyOnRails({ radius: 2e7, mass: 1e28 }),
          radius: 4e8,
          direction: "clockwise",
          plane: "coplanar",
          phase: 0,
        },
        {
          body: new BodyOnRails({ radius: 6e6, mass: 1e28 }),
          radius: 5e8,
          direction: "clockwise",
          plane: "coplanar",
          phase: 0,
        },
      ]),
      radius: 6e9,
      direction: "clockwise",
      plane: "coplanar",
      phase: 2,
    },
    {
      body: new BodyOnRails({ radius: 4e7, mass: 2e28 }, [
        {
          body: new BodyOnRails({ radius: 5e6, mass: 1e27 }),
          radius: 5e8,
          direction: "clockwise",
          plane: "coplanar",
          phase: 0,
        },
        {
          body: new BodyOnRails({ radius: 3e6, mass: 1e27 }),
          radius: 5e8,
          direction: "clockwise",
          plane: "coplanar",
          phase: 4,
        },
      ]),
      radius: 4e9,
      direction: "clockwise",
      plane: "coplanar",
      phase: 1,
    },
  ]
);

init();

function init(): void {
  container = document.createElement("div");
  document.body.appendChild(container);

  scene = new THREE.Scene();

  scene.castShadow = true;

  //

  camera = new THREE.PerspectiveCamera(60, aspect / 2, 1, 10000);
  camera.position.z = 50;

  cameraPerspective = new THREE.PerspectiveCamera(50, aspect, 150, 1000);

  cameraPerspectiveHelper = new THREE.CameraHelper(cameraPerspective);
  scene.add(cameraPerspectiveHelper);

  //

  // counteract different front orientation of cameras vs rig

  cameraPerspective.rotation.y = Math.PI;
  cameraPerspective.rotation.z = (3 * Math.PI) / 2;

  cameraRig = new THREE.Group();

  cameraRig.add(cameraPerspective);

  scene.add(cameraRig);

  //

  system.addToScene(scene);

  //

  const light = new THREE.PointLight(0xff8822, 60);
  J.add(light);

  const dirlight = new THREE.SpotLight(0xffffff, 20000000, 0, Math.PI / 50);

  dirlight.target = J;
  dirlight.castShadow = true;
  dirlight.shadow.mapSize.width = 500000000;
  dirlight.shadow.mapSize.height = 500000000;
  dirlight.shadow.camera.near = 500;
  dirlight.shadow.camera.far = 10000;

  scene.add(dirlight);

  //

  const geometry = new THREE.BufferGeometry();
  const vertices = [];

  for (let i = 0; i < 30000; i++) {
    vertices.push(THREE.MathUtils.randFloatSpread(30000)); // x
    vertices.push(THREE.MathUtils.randFloatSpread(30000)); // y
    vertices.push(THREE.MathUtils.randFloatSpread(30000)); // z
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  const particles = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ color: 0x999999 })
  );
  scene.add(particles);

  //

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  renderer.setAnimationLoop(animate);
  container.appendChild(renderer.domElement);

  renderer.setScissorTest(true);

  //

  stats = new Stats();
  container.appendChild(stats.dom);

  //

  window.addEventListener("resize", onWindowResize);
}

//

function onWindowResize(): void {
  SCREEN_WIDTH = window.innerWidth;
  SCREEN_HEIGHT = window.innerHeight;
  aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

  camera.aspect = 0.5 * aspect;
  camera.updateProjectionMatrix();

  cameraPerspective.aspect = 0.5 * aspect;
  cameraPerspective.updateProjectionMatrix();
}

//

function animate(): void {
  render();
  stats.update();
}

function render(): void {
  //   const r = 1509 + (((Date.now() / 1000) % 10) - 5);
  const r = Date.now() / 1000;

  system.animate(r);

  cameraPerspective.fov = 80;
  cameraPerspective.near = 0.0001;
  cameraPerspective.far = 20000;
  cameraPerspective.updateProjectionMatrix();

  cameraPerspectiveHelper.update();
  cameraPerspectiveHelper.visible = false;

  camera.position.x = J.position.x;
  camera.position.y = J.position.y;

  cameraRig.position.x = cities[0].body.position.x;
  cameraRig.position.y = cities[0].body.position.y;
  cameraRig.position.z = cities[0].body.position.z;

  cameraRig.lookAt(cities[1].body.position);

  renderer.setClearColor(0x000000, 1);
  renderer.setScissor(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  renderer.setViewport(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  renderer.render(scene, cameraPerspective);

  //

  renderer.setClearColor(0x111111, 1);
  renderer.setScissor(
    (7 * SCREEN_WIDTH) / 8,
    0,
    SCREEN_WIDTH / 8,
    SCREEN_HEIGHT / 4
  );
  renderer.setViewport(
    (7 * SCREEN_WIDTH) / 8,
    0,
    SCREEN_WIDTH / 8,
    SCREEN_HEIGHT / 4
  );
  renderer.render(scene, camera);
}
