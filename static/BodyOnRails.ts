/* eslint-disable @typescript-eslint/indent */
import {
  Color,
  Material,
  Mesh,
  MeshStandardMaterial,
  Scene,
  SphereGeometry,
  Vector3,
} from "three";

const colors = Object.keys(Color.NAMES);

const G = 6.674e-11; /** gravitational constant */
const lengthScale = 1e7;
const timeScale = 2e3;

export interface Satellite {
  body: BodyOnRails;
  /** meters */
  radius: number;
  /** radians */
  phase?: number;
  direction?: "clockwise" | "anticlockwise";
  plane?: "coplanar" | "perpendicular";
  period?: number;
  geostationary?: boolean;
  tidallyLocked?: boolean;
}

export class BodyOnRails extends Mesh {
  public scaledRadius: number;

  constructor(
    {
      radius,
      mass,
      emissiveIntensity,
      color,
    }: {
      /** meters */
      radius: number;
      /** kilograms */
      mass: number;
      /** how much light */
      emissiveIntensity?: number;
      color?: keyof typeof Color.NAMES;
    } = {
      radius: Math.random() * 1e8,
      mass: Math.random() * 1e28,
      emissiveIntensity: 1000,
      color: "white",
    },
    private satellites: Satellite[] = [],
    material?: Material,
    private day: number = Math.random() * 60 * 60 * 48
  ) {
    super(
      new SphereGeometry(radius / lengthScale, 100, 50),
      material ??
        new MeshStandardMaterial({
          color: color ?? colors[Math.trunc(Math.random() * colors.length)],
          wireframe: false,
          emissive: color ?? colors[Math.trunc(Math.random() * colors.length)],
          emissiveIntensity: emissiveIntensity ?? 0.1,
        })
    );

    this.scaledRadius = radius / lengthScale;

    satellites.forEach((satellite) => {
      satellite.period = satellite.geostationary
        ? this.day
        : satellite.tidallyLocked
        ? satellite.body.day
        : (2 * Math.PI * satellite.radius ** (3 / 2)) / Math.sqrt(G * mass);
    });
  }

  public animate(time: number): void {
    const scaledTime = timeScale * time;
    this.setRotationFromAxisAngle(
      new Vector3(0, 1, 0),
      (-2 * Math.PI * scaledTime) / this.day
    );

    for (const { body, radius, phase, direction, plane, period } of this
      .satellites) {
      const orbitDirection = direction === "anticlockwise" ? -1 : 1;
      const signedTime = orbitDirection * scaledTime;
      const twoPiOnPeriod = period ? (2 * Math.PI) / period : 1;

      const X =
        (radius / lengthScale) *
        Math.cos(twoPiOnPeriod * signedTime - (phase ?? 0));
      const Y =
        (radius / lengthScale) *
        Math.sin(twoPiOnPeriod * signedTime - (phase ?? 0));

      switch (plane) {
        case "perpendicular":
          body.position.x = this.position.x + X;
          body.position.y = this.position.y;
          body.position.z = this.position.z + Y;
          break;
        case "coplanar":
        default:
          body.position.x = this.position.x + X;
          body.position.y = this.position.y + Y;
          body.position.z = this.position.z;
          break;
      }

      body.animate(time);
    }
  }

  public addToScene(scene: Scene): void {
    scene.add(this);
    this.satellites.forEach(({ body }) => body.addToScene(scene));
  }
}
