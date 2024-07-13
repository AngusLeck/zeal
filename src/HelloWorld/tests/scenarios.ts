interface HelloWorldScenario {
  scenario: string;
  greeting: string;
}

export const scenarios: HelloWorldScenario[] = [
  { scenario: "Classic greeting", greeting: "Hello world!" },
  {
    scenario: "Salutations",
    greeting: "Salutations, good friend!",
  },
  {
    scenario: "Whale",
    greeting:
      "And wow! Hey! What’s this thing suddenly coming towards me very fast? Very very fast. So big and flat and round, it needs a big wide sounding name like … ow … ound … round … ground! That’s it! That’s a good name – ground!",
  },
];
