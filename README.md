# Basic TS Project

## Set Up

### Dependencies

- Node
- yarn

### Initialise Project

1. install dependencies `yarn`
2. lint and test `yarn validate`
3. run greeting script `yarn do greetings`

## How To Use

### Scripts

Need some code to be executable from the command line?

1. put your script in the `src/scripts` directory
2. run it with `yarn do <file name>`

### Tests

To test your code:

1. create a directory `tests` near whatever you want to test
2. create a test file `<thing you want to test>.test.ts`
3. the tests in this directory use `Jest` so when testing code remember to `describe` what `it` should do.
4. to run a specific test file run `yarn test <file>`
5. to run all tests run `yarn test`
