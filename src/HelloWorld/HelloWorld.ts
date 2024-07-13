export class HelloWorld {
  private greeting;

  constructor(greetingMessage = "Hello World") {
    this.greeting = greetingMessage;
  }

  public greet(): string {
    return this.greeting;
  }
}
