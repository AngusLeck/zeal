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
