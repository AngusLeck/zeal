import { Physical } from "../constants";

export function orbitalPeriod(mass: number, radius: number): number {
  return (2 * Math.PI * radius ** (3 / 2)) / Math.sqrt(Physical.G * mass);
}
