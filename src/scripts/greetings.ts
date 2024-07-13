import { HelloWorld } from "../HelloWorld";

const greeting = process.argv.slice(2);

const greeter = new HelloWorld(
  greeting.length ? greeting.join(" ") : undefined
);

console.log(greeter.greet());
