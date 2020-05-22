# helena-lang

The code for the Helena library, including the Chrome extension.

## Quickstart

1. Run `npm install` to install all development dependencies.
2. Run `npx webpack` to generate the `dist` directory and place the compiled
   code into it.

## Miscellaneous

As of April 2020, recommend using [Visual Studio Code](https://code.visualstudio.com/)
for development, as it does a lot of Typescript compiler checking by default and
is super convenient to use.

## Testing

### Prerequisites

- Run Steps 1 and 2 under **Quickstart** above.
- Command line tool for `docker`
- Command line tool for `md5sum`

### Run Integration Test

Integration test is currently in the higher-level `helena` repository. Run
`./utilities/run-ci.sh` from the main directory of the `helena` repository.

## TODO

- Not sure what exactly should be exported from this library, might need to be
  lower level than current setup.
- Restructuring classes/interfaces in a clearer way.
- Better documentation for classes/functions.
