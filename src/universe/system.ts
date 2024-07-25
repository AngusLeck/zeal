import { BodyOnRails } from "./BodyOnRails";
import { RealDistance, sol } from "../constants";
import { caelus } from "./caelus";

export const system = new BodyOnRails(
  {
    radius: sol.star.radius,
    mass: sol.star.mass,
    color: "wheat",
    emissiveIntensity: 1.2,
  },
  [
    {
      body: caelus,
      radius: 8 * RealDistance.LightMinute,
      direction: "clockwise",
      plane: "coplanar",
      phase: 0,
    },
    {
      body: new BodyOnRails({ radius: 2e7, mass: 2e29 }, [
        {
          body: new BodyOnRails({ radius: 1e7, mass: 1e28 }),
          radius: 3e8,
          direction: "clockwise",
          plane: "coplanar",
          phase: 0,
        },
        {
          body: new BodyOnRails({ radius: 2e7, mass: 1e28 }),
          radius: 4e8,
          direction: "clockwise",
          plane: "coplanar",
          phase: 0,
        },
        {
          body: new BodyOnRails({ radius: 6e6, mass: 1e28 }),
          radius: 5e8,
          direction: "clockwise",
          plane: "coplanar",
          phase: 0,
        },
      ]),
      radius: 6e9,
      direction: "clockwise",
      plane: "coplanar",
      phase: 2,
    },
    {
      body: new BodyOnRails({ radius: 4e7, mass: 2e28 }, [
        {
          body: new BodyOnRails({ radius: 5e6, mass: 1e27 }),
          radius: 5e8,
          direction: "clockwise",
          plane: "coplanar",
          phase: 0,
        },
        {
          body: new BodyOnRails({ radius: 3e6, mass: 1e27 }),
          radius: 5e8,
          direction: "clockwise",
          plane: "coplanar",
          phase: 4,
        },
      ]),
      radius: 4e9,
      direction: "clockwise",
      plane: "coplanar",
      phase: 1,
    },
  ]
);
