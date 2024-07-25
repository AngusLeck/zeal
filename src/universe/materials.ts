import {
  TextureLoader,
  MeshLambertMaterial,
  MeshPhysicalMaterial,
} from "three";

const jupiterTexture = new TextureLoader().load("jupiter.jpeg");
const jupiterMaterial = new MeshLambertMaterial({
  map: jupiterTexture,
});

const earthTexture = new TextureLoader().load("earth.jpeg");
const earthMaterial = new MeshPhysicalMaterial({
  map: earthTexture,
  depthTest: true,
  depthWrite: true,
});

export const materials = { earth: earthMaterial, jupiter: jupiterMaterial };
