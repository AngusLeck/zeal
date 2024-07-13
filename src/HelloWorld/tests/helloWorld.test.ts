import { HelloWorld } from "../HelloWorld";
import { scenarios } from "./scenarios";

describe.each(scenarios)("Hello World Scenarios", ({ scenario, greeting }) => {
  describe(scenario, () => {
    const greeter = new HelloWorld(greeting);

    it(`Should should greet with "${greeting}"`, () => {
      expect(greeter.greet()).toBe(greeting);
    });
  });
});
