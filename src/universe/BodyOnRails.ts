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
import { RealDistance, RealTime } from "../constants";
import { orbitalPeriod } from "../utils/orbitalPeriod";

const colors = Object.keys(Color.NAMES);

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
  impossibleDisplacement?: number;
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
    public day = Math.random() * 60 * 60 * 48,
    heightSegments = 30
  ) {
    super(
      new SphereGeometry(
        radius / RealDistance.Model,
        heightSegments * 2,
        heightSegments
      ),
      material ??
        new MeshStandardMaterial({
          color: color ?? colors[Math.trunc(Math.random() * colors.length)],
          wireframe: false,
          emissive: color ?? colors[Math.trunc(Math.random() * colors.length)],
          emissiveIntensity: emissiveIntensity ?? 1,
        })
    );

    this.scaledRadius = radius / RealDistance.Model;

    satellites.forEach((satellite) => {
      satellite.period = satellite.geostationary
        ? this.day
        : satellite.tidallyLocked
        ? satellite.body.day
        : orbitalPeriod(mass, satellite.radius);
    });

    // r = (T**2 * G / 4Pi**2)**1/3
  }

  public animate(time: number): void {
    const scaledTime = RealTime.Model * time;
    this.setRotationFromAxisAngle(
      new Vector3(0, 1, 0),
      (-2 * Math.PI * scaledTime) / this.day
    );

    for (const {
      body,
      radius,
      phase,
      direction,
      plane,
      period,
      impossibleDisplacement,
    } of this.satellites) {
      const orbitDirection = direction === "anticlockwise" ? -1 : 1;
      const signedTime = orbitDirection * scaledTime;
      const twoPiOnPeriod = period ? (2 * Math.PI) / period : 1;

      const X =
        (radius / RealDistance.Model) *
        Math.cos(twoPiOnPeriod * signedTime - (phase ?? 0));
      const Y =
        (radius / RealDistance.Model) *
        Math.sin(twoPiOnPeriod * signedTime - (phase ?? 0));

      switch (plane) {
        case "perpendicular":
          body.position.x = this.position.x + X;
          body.position.y =
            this.position.y +
            (impossibleDisplacement ?? 0) / RealDistance.Model;
          body.position.z = this.position.z + Y;
          break;
        case "coplanar":
        default:
          body.position.x = this.position.x + X;
          body.position.y = this.position.y + Y;
          body.position.z =
            this.position.z +
            (impossibleDisplacement ?? 0) / RealDistance.Model;
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
