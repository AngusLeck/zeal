/* eslint-disable etc/prefer-less-than */
import * as THREE from "three";

import { BodyOnRails, Satellite } from "./BodyOnRails";

// screen variables
let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

//mouse variables
let mouseX = 0;
let mouseY = 0;

// container variables
let container;

// camera variables
let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;

// camera variables
let cameraRig: THREE.Group;
let cameraPerspective: THREE.PerspectiveCamera;
let cameraPerspectiveHelper: THREE.CameraHelper;
let cameraPanX = 90;
let cameraPanY = 20;

// time in seconds
let animationTime = 0;
let realTime = Date.now();
let paused = false;
let speed = 1;

const loader = new THREE.TextureLoader();
const jupiterTexture = loader.load("jupiter.jpeg");

const jupiterMaterial = new THREE.MeshPhysicalMaterial({
  map: jupiterTexture,
});

const earthTexture = loader.load("earth.jpeg");

const earthMaterial = new THREE.MeshPhysicalMaterial({
  map: earthTexture,
  depthTest: true,
  depthWrite: true,
});

const phase = 2.1;
const elevation = 6e3;
const impossibleDisplacement = 2000e3;
const correction = impossibleDisplacement * 0.174;

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
    radius: 6e6 - correction + elevation,
    plane: "perpendicular",
    geostationary: true,
    phase: phase,
    impossibleDisplacement,
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
    radius: 6e6 - correction + elevation * 6,
    plane: "perpendicular",
    geostationary: true,
    phase: phase + 0.01,
    impossibleDisplacement,
  },
];

const E = new BodyOnRails(
  { radius: 6e6, mass: 1e28 },
  cities,
  earthMaterial,
  60 * 60 * 24,
  120
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
  jupiterMaterial,
  60 * 60 * 16,
  50
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

  camera = new THREE.PerspectiveCamera(60, aspect / 2, 1, 10000);
  camera.position.z = 50;

  cameraRig = new THREE.Group();
  cameraPerspective = new THREE.PerspectiveCamera(60, aspect, 0.00001, 20000);
  cameraPerspectiveHelper = new THREE.CameraHelper(cameraPerspective);

  scene.add(cameraPerspectiveHelper);

  // counteract different front orientation of cameras vs rig

  cameraPerspective.rotation.y = Math.PI;
  // cameraPerspective.rotation.z = angleCorrection;

  // cameraPanX = cameraPerspective.rotation.x;
  // cameraPanY = cameraPerspective.rotation.y;

  cameraRig.add(cameraPerspective);

  scene.add(cameraRig);

  system.addToScene(scene);

  const jupiterLight = new THREE.PointLight(0xff8822, 20);
  J.add(jupiterLight);

  const dirlight = new THREE.SpotLight(0xffffff, 20000000, 0, Math.PI / 500);

  dirlight.target = J;
  dirlight.castShadow = true;
  dirlight.shadow.mapSize.width = 1000;
  dirlight.shadow.mapSize.height = 1000;
  dirlight.shadow.camera.near = 500;
  dirlight.shadow.camera.far = 10000;

  scene.add(dirlight);

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

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  renderer.setAnimationLoop(animate);
  container.appendChild(renderer.domElement);

  renderer.setScissorTest(true);

  window.addEventListener("resize", onWindowResize);
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("mousemove", onMouseMove);
}

//

function onKeyDown(event: KeyboardEvent): void {
  console.log(JSON.stringify(event));
  switch (event.key) {
    case " ":
      paused = !paused;
      break;
    case "ArrowUp":
      speed = speed * 2;
      break;
    case "ArrowDown":
      speed = speed / 2;
      break;
    case "ArrowRight":
      animationTime += 0.5 * speed;
      break;
    case "ArrowLeft":
      animationTime -= 0.5 * speed;
  }
}

function onMouseMove(event: MouseEvent): void {
  mouseX = (2 * event.clientX) / document.body.offsetWidth - 1;
  mouseY = (2 * event.clientY) / document.body.offsetHeight - 1;
}

function onWindowResize(): void {
  SCREEN_WIDTH = window.innerWidth;
  SCREEN_HEIGHT = document.body.offsetHeight;
  aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

  camera.aspect = 0.5 * aspect;
  camera.updateProjectionMatrix();

  cameraPerspective.aspect = aspect;
  cameraPerspective.updateProjectionMatrix();
}

function animate(): void {
  //   const r = 1509 + (((Date.now() / 1000) % 10) - 5);

  const currentTime = Date.now();
  const delta = (currentTime - realTime) / 1000;
  realTime = currentTime;

  animationTime += paused ? 0 : delta * speed;

  const angleDeviation = 1;

  cameraPanX += Math.abs(mouseX) > 0.3 ? angleDeviation * mouseX : 0;
  cameraPanY += Math.abs(mouseY) > 0.4 ? (-angleDeviation * mouseY) / 2 : 0;
  cameraPanY = Math.min(Math.max(cameraPanY, 15), 80);

  system.animate(animationTime);

  cameraPerspectiveHelper.update();
  cameraPerspectiveHelper.visible = false;

  camera.position.x = J.position.x;
  camera.position.y = J.position.y;

  cameraRig.position.set(...cities[0].body.position.toArray());

  const N = new THREE.Vector3()
    .add(cities[0].body.position)
    .sub(E.position)
    .normalize();

  const C = new THREE.Vector3()
    .add(cities[1].body.position)
    .sub(cities[0].body.position)
    .projectOnPlane(N)
    .normalize();

  const P = new THREE.Vector3().crossVectors(N, C).normalize();

  const PW = Math.cos((Math.PI / 180) * cameraPanX);
  const CW = Math.sin((Math.PI / 180) * cameraPanX);
  const FW = Math.cos((Math.PI / 180) * cameraPanY);
  const NW = Math.sin((Math.PI / 180) * cameraPanY);

  const V = new THREE.Vector3()
    .add(P.multiplyScalar(PW * FW))
    .add(C.multiplyScalar(CW * FW))
    .add(N.multiplyScalar(NW))
    .add(cities[1].body.position);

  const U = new THREE.Vector3()
    .add(cities[0].body.position)
    .add(N.multiplyScalar(1000000));

  cameraRig.up.set(U.x, U.y, U.z);
  cameraRig.lookAt(V);

  // cameraPerspective.rotation.z = -angleCorrection;

  cameraPerspective.updateProjectionMatrix();

  // cameraPerspective.setRotationFromQuaternion(
  //   new THREE.Quaternion().slerp(Right, cameraPanX)
  // );
  // cameraRig.setRotationFromQuaternion(Up);

  // cameraRig.renderer.setClearColor(0x000000, 1);s
  renderer.setScissor(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  renderer.setViewport(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  renderer.render(scene, cameraPerspective);

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
