import { Physical } from "../constants";

export function orbitalDistance(mass: number, period: number): number {
  return ((period * Math.sqrt(Physical.G * mass)) / (2 * Math.PI)) ** (2 / 3);
}
