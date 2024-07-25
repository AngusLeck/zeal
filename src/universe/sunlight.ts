import { ScaledDistance } from "../constants";
import { SpotLight } from "three";
import { caelus } from "./caelus";

export const sunlight = new SpotLight(0xffffff, 180000000, 0, Math.PI / 1500);
sunlight.target = caelus;
sunlight.castShadow = true;
sunlight.shadow.mapSize.width = 1200;
sunlight.shadow.mapSize.height = 1200;
sunlight.shadow.camera.near = 7.5 * ScaledDistance.LightMinute;
sunlight.shadow.camera.far = 8.5 * ScaledDistance.LightMinute;
