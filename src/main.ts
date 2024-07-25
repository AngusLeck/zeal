/* eslint-disable etc/prefer-less-than */

import {
  BackSide,
  CameraHelper,
  Group,
  Mesh,
  MeshBasicMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Raycaster,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from "three";
import { ScaledDistance } from "./constants";
import {
  system,
  caelus,
  cities,
  zeal,
  sunlight,
  addStarsToScene,
} from "./universe";

// screen variables
let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

//mouse variables
let mouseX = 0;
let mouseY = 0;

let cameraPanX = 90;
let cameraPanY = 20;

// time in seconds
let animationTime = 6;
let realTime = Date.now();
let paused = false;
let speed = 1;

const scene = new Scene();

scene.add(sunlight);
scene.castShadow = true;

const sunVectors = [
  new Vector3(0, 0, 1),
  new Vector3(0, 1, 0),
  new Vector3(1, 0, 0),
  new Vector3(0, 0, -1),
  new Vector3(0, -1, 0),
  new Vector3(-1, 0, 0),
].map((v) => v.multiplyScalar(system.scaledRadius * 1.1));

const container = document.createElement("div");
document.body.appendChild(container);

const camera = new PerspectiveCamera(
  60,
  aspect > 1 ? aspect / 2 : aspect,
  1,
  ScaledDistance.Stars
);
camera.position.z = 50;

const cameraRig = new Group();
const cameraPerspective = new PerspectiveCamera(
  aspect > 1 ? 60 : 90,
  aspect,
  0.00001,
  ScaledDistance.Stars
);
const cameraPerspectiveHelper = new CameraHelper(cameraPerspective);

const mockSky = new Mesh(
  new SphereGeometry(0.1, 100, 100),
  new MeshBasicMaterial({
    color: 0x91c1ff,
    opacity: 0,
    transparent: true,
    side: BackSide,
  })
);

cameraPerspective.add(mockSky);

scene.add(cameraPerspectiveHelper);

// counteract different front orientation of cameras vs rig
cameraPerspective.rotation.y = Math.PI;

cameraRig.add(cameraPerspective);

scene.add(cameraRig);

system.addToScene(scene);

addStarsToScene(scene);

const renderer = new WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
renderer.setAnimationLoop(animate);
container.appendChild(renderer.domElement);

renderer.setScissorTest(true);

window.addEventListener("resize", onWindowResize);
document.addEventListener("keydown", onKeyDown);
document.addEventListener("wheel", onWheel);
document.addEventListener("touchstart", onTouchStartOrEnd);
document.addEventListener("touchend", onTouchStartOrEnd);
document.addEventListener("touchcancel", onTouchStartOrEnd);
document.addEventListener("touchmove", onTouchMove);

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

function onWheel(event: WheelEvent): void {
  setViewMovementVarsFromDeltas(event);
}

let lastTouchCoordinates: { x: number; y: number } | undefined;

function onTouchStartOrEnd(event: TouchEvent): void {
  if (event.touches.length === 0) {
    lastTouchCoordinates = undefined;
  }
  lastTouchCoordinates = lastTouchCoordinates ?? getTouchCoordinates(event);
}

function onTouchMove(event: TouchEvent): void {
  const touchCoordinates = getTouchCoordinates(event);

  if (lastTouchCoordinates) {
    setViewMovementVarsFromDeltas({
      deltaX: lastTouchCoordinates.x - touchCoordinates.x,
      deltaY: lastTouchCoordinates.y - touchCoordinates.y,
    });
  }

  lastTouchCoordinates = touchCoordinates;
}

function getTouchCoordinates(event: TouchEvent): { x: number; y: number } {
  const touches = [...event.touches];

  return touches
    .map((touch) => ({
      x: touch.clientX,
      y: touch.clientY,
    }))
    .reduce(
      ({ x: averageX, y: averageY }, { x, y }) => ({
        x: averageX + x / touches.length,
        y: averageY + y / touches.length,
      }),
      { x: 0, y: 0 }
    );
}

function setViewMovementVarsFromDeltas({
  deltaX,
  deltaY,
}: {
  deltaX: number;
  deltaY: number;
}): void {
  mouseX = Math.min(Math.max(deltaX / 30, -1), 1);
  mouseY = Math.min(Math.max(deltaY / 30, -1), 1);
}

function onWindowResize(): void {
  SCREEN_WIDTH = window.innerWidth;
  SCREEN_HEIGHT = document.body.offsetHeight;
  aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

  camera.aspect = aspect > 1 ? 0.5 * aspect : aspect;
  camera.updateProjectionMatrix();

  cameraPerspective.aspect = aspect;
  cameraPerspective.fov = aspect > 1 ? 60 : 90;
  cameraPerspective.updateProjectionMatrix();
}

function animate(): void {
  const currentTime = Date.now();
  const delta = (currentTime - realTime) / 1000;
  realTime = currentTime;

  animationTime += paused ? 0 : delta * speed;

  const angleDeviation = 100;

  cameraPanX += angleDeviation * mouseX * delta;
  cameraPanY += -angleDeviation * mouseY * delta;
  cameraPanY = Math.min(Math.max(cameraPanY, 15), 80);

  mouseX *= 0.95;
  mouseY *= 0.95;

  if (mouseX ** 2 + mouseY ** 2 < 0.001) {
    mouseX = 0;
    mouseY = 0;
  }

  system.animate(animationTime);

  cameraPerspectiveHelper.update();
  cameraPerspectiveHelper.visible = false;

  camera.position.x = caelus.position.x;
  camera.position.y = caelus.position.y;

  cameraRig.position.set(...cities[0].body.position.toArray());

  const N = new Vector3()
    .add(cities[0].body.position)
    .sub(zeal.position)
    .normalize();

  const C = new Vector3()
    .add(cities[1].body.position)
    .sub(cities[0].body.position)
    .projectOnPlane(N)
    .normalize();

  const P = new Vector3().crossVectors(N, C).normalize();

  const PW = Math.cos((Math.PI / 180) * cameraPanX);
  const CW = Math.sin((Math.PI / 180) * cameraPanX);
  const FW = Math.cos((Math.PI / 180) * cameraPanY);
  const NW = Math.sin((Math.PI / 180) * cameraPanY);

  const V = new Vector3()
    .add(P.multiplyScalar(PW * FW))
    .add(C.multiplyScalar(CW * FW))
    .add(N.multiplyScalar(NW))
    .add(cities[1].body.position);

  const U = new Vector3()
    .add(cities[0].body.position)
    .add(N.multiplyScalar(1000000));

  cameraRig.up.set(U.x, U.y, U.z);
  cameraRig.lookAt(V);

  cameraPerspective.updateProjectionMatrix();

  renderer.setScissor(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  renderer.setViewport(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  renderer.render(scene, cameraPerspective);

  const homeVector = new Vector3().copy(cameraRig.position).multiplyScalar(-1);

  const dayPercentage =
    sunVectors
      .map(
        (sunVector) =>
          new Raycaster(
            cameraRig.position,
            new Vector3().copy(sunVector).add(homeVector).normalize()
          )
      )
      .map((cast) => !cast.intersectObject(caelus).length)
      .filter(Boolean).length / 6;

  const angleToSun = homeVector.angleTo(U);

  const nightAngle = Math.PI / 2 + Math.PI / 10;
  const sunSetAngle = Math.PI / 2;
  const dayAngle = Math.PI / 2 - Math.PI / 10;

  if (angleToSun > nightAngle) {
    //night
    mockSky.material.opacity = 0;
  } else if (angleToSun > sunSetAngle) {
    // sunrise(set)
    mockSky.material.color.set(0xfa8072);
    mockSky.material.opacity =
      ((nightAngle - angleToSun) / (nightAngle - sunSetAngle)) *
      dayPercentage *
      0.2;
  } else {
    // day
    mockSky.material.color.set(0x91c1ff);
    mockSky.material.opacity =
      (0.2 + 0.15 * ((sunSetAngle - angleToSun) / (sunSetAngle - dayAngle))) *
      dayPercentage;
  }

  const zoomedOutSceneParams: [number, number, number, number] = [
    aspect > 1 ? (7 * SCREEN_WIDTH) / 8 : (3 * SCREEN_WIDTH) / 4,
    0,
    aspect > 1 ? SCREEN_WIDTH / 8 : SCREEN_WIDTH / 4,
    SCREEN_HEIGHT / 4,
  ];

  renderer.setClearColor(0x000000, 1);
  renderer.setScissor(...zoomedOutSceneParams);
  renderer.setViewport(...zoomedOutSceneParams);
  renderer.render(scene, camera);
}
