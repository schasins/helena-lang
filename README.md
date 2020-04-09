# helena-library

The code for the Helena library, including the Chrome extension.

## Quickstart

1. Run `npm install` to install all development dependencies.
2. Run `npx webpack` to generate the `dist` directory and place the compiled 
extension code into it.
3. In Google Chrome, navigate to `chrome://extensions` in the browser bar
(preferably in a Chrome profile designated only for Helena use).
4. Toggle `Developer mode` in the top-right corner on.
5. Click `Load unpacked`, and navigate to the `dist` directory generated in this
repository by the webpack compilation.
6. The extension should now be loaded!

## For Developers

Any changes made to files in the `dist` directory will be overwritten the next
time the webpack compilation is executed. As a result, make all edits, including
to the Chrome extension `manifest.json`, image files, HTML files, Typescript,
etc., to the files within the `src` directory.

As of April 2020, recommend using [Visual Studio Code](https://code.visualstudio.com/)
for development, as it does a lot of Typescript compiler checking by default and
is super convenient to use.

## TODO

- Restructuring classes/interfaces in a clearer way.
- Better documentation for classes/functions.