// @ts-check

const fs = require("fs")
const path = require("path")
const { argv } = require("process")

const projectRoot = argv[2] || path.join(__dirname, "..")

// Add deps to pkg.json
const packageJSON = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json"), "utf8"))
packageJSON.devDependencies = Object.assign(packageJSON.devDependencies, {
  "@rollup/plugin-commonjs": "^17.0.0",
  "@rollup/plugin-node-resolve": "^11.0.1",
  "@rollup/plugin-replace": "^2.4.2",
  "@rollup/plugin-typescript": "^8.1.0",
  "rollup": "^2.35.1",
  "rollup-plugin-chrome-extension": "^3.4.0",
  "rollup-plugin-empty-dir": "^1.0.4",
  "rollup-plugin-zip": "^1.0.1",
  "tslib": "^2.0.3",
  "typescript": "^4.1.3"
})

packageJSON.dependencies = Object.assign(packageJSON.dependencies, {
  "@types/chrome": "^0.0.127",
  "@types/firefox-webext-browser": "^82.0.0",
  "@types/react": "^17.0.0",
  "@types/react-dom": "^17.0.0",
  "react": "^17.0.2",
  "react-dom": "^17.0.2"
})

// Write the package JSON
fs.writeFileSync(path.join(projectRoot, "package.json"), JSON.stringify(packageJSON, null, "  "))

// mv src/popup/main.js to main.ts
const beforeMainJSPath = path.join(projectRoot, "src", "popup", "main.js")
const afterMainTSPath = path.join(projectRoot, "src", "popup", "main.tsx")
fs.renameSync(beforeMainJSPath, afterMainTSPath)

// mv src/popup/Popup.jsx to Popup.tsx
const beforePopupJSXPath = path.join(projectRoot, "src", "popup", "Popup.jsx")
const afterPopupTSXPath = path.join(projectRoot, "src", "popup", "Popup.tsx")
fs.renameSync(beforePopupJSXPath, afterPopupTSXPath)

// mv src/background.js to src/background.ts
const beforeBackgroundJSPath = path.join(projectRoot, "src", "background.js")
const afterBackgroundTSPath = path.join(projectRoot, "src", "background.ts")
fs.renameSync(beforeBackgroundJSPath, afterBackgroundTSPath)

function replaceContents(path, replace) {
  let file = fs.readFileSync(path, "utf8");
  replace.forEach(item => {
    file = file.replace(item.from, item.to)
  });
  fs.writeFileSync(path, file);
}

const replaceContentsOf = [
  {
    path: path.join(projectRoot, "src", "popup", "Popup.tsx"),
    replace: [
      {
        from: "const App = () => {",
        to: 'const App = (): JSX.Element => {'
      }
    ]
  },
  {
    path: path.join(projectRoot, "src/popup", "popup.html"),
    replace: [
      {
        from: "main.js",
        to: "main.tsx"
      }
    ]
  },
  {
    path: path.join(projectRoot, "src", "manifest.json"),
    replace: [
      {
        from: "background.js",
        to: "background.ts"
      }
    ]
  },
  {
    path: afterBackgroundTSPath,
    replace: [
      {
        from: "console.clear();",
        to: "// @ts-ignore\nconsole.clear();"
      }
    ]
  },
]

replaceContentsOf.forEach(item => {
  const { path, replace } = item;
  replaceContents(path, replace);
})

// Edit rollup config
const rollupConfigPath = path.join(projectRoot, "rollup.config.js")
let rollupConfig = fs.readFileSync(rollupConfigPath, "utf8")

// Edit imports
rollupConfig = rollupConfig.replace(`'@rollup/plugin-node-resolve';`, `'@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';`)

// Replace name of entry point
// rollupConfig = rollupConfig.replace(`'src/main.js'`, `'src/main.ts'`)

// Add TypeScript
rollupConfig = rollupConfig.replace(
  'commonjs(),',
  'commonjs(),\n\t\ttypescript(),'
);
fs.writeFileSync(rollupConfigPath, rollupConfig)

// Add TSConfig
const tsconfig = `{
  "compilerOptions": {
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "jsx": "react",
    "lib": ["dom", "es2019"],
    "module": "ESNext",
    "moduleResolution": "node",
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "strict": true,
    "target": "es2018"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules/*", "dist/*"]
}`
const tsconfigPath =  path.join(projectRoot, "tsconfig.json")
fs.writeFileSync(tsconfigPath, tsconfig)

// Delete this script, but not during testing
if (!argv[2]) {
  // Remove the script
  fs.unlinkSync(path.join(__filename))

  // Check for Mac's DS_store file, and if it's the only one left remove it
  const remainingFiles = fs.readdirSync(path.join(__dirname))
  if (remainingFiles.length === 1 && remainingFiles[0] === '.DS_store') {
    fs.unlinkSync(path.join(__dirname, '.DS_store'))
  }

  // Check if the scripts folder is empty
  if (fs.readdirSync(path.join(__dirname)).length === 0) {
    // Remove the scripts folder
    fs.rmdirSync(path.join(__dirname))
  }
}

console.log("Converted to TypeScript.")

if (fs.existsSync(path.join(projectRoot, "node_modules"))) {
  console.log("\nYou will need to re-run your dependency manager to get started.")
}
