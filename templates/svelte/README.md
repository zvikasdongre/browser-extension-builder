# Browser extension with svelte

This project is created by the **browser-extension-builder**.
You can create a browser extension with `svelte` using this template.

## Get started

### Install the dependencies:

ℹ️ Info: If you want `Typescript` then see [Typescript section](#using-typescript) below, And then proceed.

```bash
npm install
# or with `yarn`:
# yarn
```

### Start in dev mode:

```bash
npm run dev
# or with `yarn`:
# yarn dev
```

### Load your extension on browser:

   1. Chrome

      1. Goto `chrome://extensions/`
      2. Enable `Developer mode`
      3. Click on `Load unpacked`
      4. Select the `dist` folder

   2. Firefox

      1. Open Firefox
      2. Goto `about:debugging#addons`
      3. Click on `Load Temporary Add-on`
      4. Select the `dist/manifest.json` file

### Build:

To minify and zip run:

```bash
npm run build
# or with `yarn`:
# yarn build
```
This will minifiy your code and also generate a `zip` in `releases` folder, that you can publish.

## Using TypeScript:

This template comes with a script to set up a TypeScript development environment, you can run it before [installing dependencies](#install-the-dependencies):

```bash
node scripts/setupTypeScript.js
```

Or remove the script via:

```bash
rm scripts/setupTypeScript.js
```
