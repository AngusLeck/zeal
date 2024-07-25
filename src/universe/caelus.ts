import { BodyOnRails } from "./BodyOnRails";
import { sol } from "../constants";
import { PointLight } from "three";
import { materials } from "./materials";
import { zeal } from "./zeal";

const caelusLight = new PointLight(0xff8822, 20);

export const caelus = new BodyOnRails(
  { radius: 6.911e7, mass: sol.caelus.mass, emissiveIntensity: 0 },
  [
    {
      body: zeal,
      radius: sol.zeal.orbit.distance,
      direction: "clockwise",
      plane: "perpendicular",
      phase: 0,
    },
  ],
  materials.jupiter,
  sol.caelus.day,
  50
);

caelus.add(caelusLight);

caelus.castShadow = true;
caelus.receiveShadow = true;
