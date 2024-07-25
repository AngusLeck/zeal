import { Satellite, BodyOnRails } from "./BodyOnRails";
import { sol } from "../constants";
import { materials } from "./materials";

const phase = 2.1;
const elevation = 6e3;
const impossibleDisplacement = 2000e3;
const correction = impossibleDisplacement * 0.174;

export const cities: Satellite[] = [
  {
    body: new BodyOnRails(
      {
        color: "red",
        emissiveIntensity: 0,
        mass: 10,
        radius: 1e6,
      },
      []
    ),
    radius: sol.zeal.radius - correction + elevation,
    plane: "perpendicular",
    geostationary: true,
    phase: phase,
    impossibleDisplacement,
  },
  {
    body: new BodyOnRails(
      {
        color: "blue",
        emissiveIntensity: 0,
        mass: 10,
        radius: 1,
      },
      []
    ),
    radius: sol.zeal.radius - correction + elevation * 6,
    plane: "perpendicular",
    geostationary: true,
    phase: phase + 0.01,
    impossibleDisplacement,
  },
];

export const zeal = new BodyOnRails(
  { radius: sol.zeal.radius, mass: 6e24 },
  cities,
  materials.earth,
  sol.zeal.day,
  120
);

zeal.castShadow = true;
zeal.receiveShadow = true;
