import { orbitalDistance } from "./utils/orbitalDistance";
import { orbitalPeriod } from "./utils/orbitalPeriod";

export enum RealDistance {
  LightSecond = 3e8,
  LightMinute = RealDistance.LightSecond * 60,
  LightHour = RealDistance.LightMinute * 60,
  Stars = RealDistance.LightHour * 2,
  Model = 1e7,
}

export enum ScaledDistance {
  LightSecond = RealDistance.LightSecond / RealDistance.Model,
  LightMinute = RealDistance.LightMinute / RealDistance.Model,
  LightHour = RealDistance.LightHour / RealDistance.Model,
  Stars = RealDistance.Stars / RealDistance.Model,
  Model = 1,
}

export enum RealTime {
  Model = 2e3,
}

export enum Physical {
  G = 6.674e-11,
}

export const sol = {
  zeal: {
    mass: 6e24,
    radius: 6e6,
    day: 60 * 60 * 24,
    orbit: {
      distance: NaN,
      period: NaN,
    },
  },
  caelus: {
    mass: 1.8982e27,
    radius: 6.911e7,
    day: NaN,
    orbit: {
      distance: 8 * RealDistance.LightMinute,
      period: NaN,
    },
  },
  star: {
    mass: 2e30,
    radius: 7e8,
  },
};

sol.zeal.orbit.period = sol.zeal.day;
sol.zeal.orbit.distance = orbitalDistance(
  sol.caelus.mass,
  sol.zeal.orbit.period
);

const solarMonths = 12.73371;

sol.caelus.orbit.period = orbitalPeriod(
  sol.star.mass,
  sol.caelus.orbit.distance
);
sol.caelus.day = 1 / (solarMonths / sol.caelus.orbit.period + 1 / sol.zeal.day);
