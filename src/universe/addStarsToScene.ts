import {
  Scene,
  BufferGeometry,
  MathUtils,
  Float32BufferAttribute,
  Points,
  PointsMaterial,
} from "three";
import { gaussianRandom } from "../utils/gaussianRandom";
import { ScaledDistance } from "../constants";

export function addStarsToScene(scene: Scene): void {
  const geometry = new BufferGeometry();
  const starAllowance = 3000;
  const vertices = [];

  // milky-way
  for (let i = 0; i < starAllowance; i++) {
    const m = gaussianRandom(0.5, 0.25);
    const n = 1 - m;
    const phi = Math.acos(2 * gaussianRandom(0.3, 0.03) - 1);
    const r = MathUtils.randFloat(
      ScaledDistance.LightHour,
      ScaledDistance.Stars
    );
    const a = -0.3 * Math.PI;
    const b = 0.4 * Math.PI;

    vertices.push(r * (m * Math.cos(a) + n * Math.cos(b)) * Math.sin(phi)); // x
    vertices.push(r * (m * Math.sin(a) + n * Math.sin(b)) * Math.sin(phi)); // y
    vertices.push(r * Math.cos(phi)); // z
  }

  // other stars
  for (let i = 0; i < starAllowance; i++) {
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    const r = MathUtils.randFloat(
      40 * ScaledDistance.LightMinute,
      ScaledDistance.Stars
    );

    vertices.push(r * Math.cos(theta) * Math.sin(phi)); // x
    vertices.push(r * Math.sin(theta) * Math.sin(phi)); // y
    vertices.push(r * Math.cos(phi)); // z
  }

  geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));

  const particles = new Points(
    geometry,
    new PointsMaterial({
      color: 0x999999,
      size: ScaledDistance.LightSecond * 3,
    })
  );

  scene.add(particles);
}
