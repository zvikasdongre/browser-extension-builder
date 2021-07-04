#!/usr/bin/env node

// Base variables
const fs = require("fs-extra");
const path = require("path");
const prompts = require("prompts");
const colors = require('colors/safe');
const argv = require('minimist')(process.argv.slice(2));
const slugify = require('slugify');
const { renderToFolder } = require("template-file");

const frameworks = [
	{
		name: colors.brightYellow("Svelte"),
		template_name: "svelte"
	}
];

async function launch() {

	let orignal_name = "My extension";

	const questions = [
		{
			type: 'text',
			name: 'name',
			message: `Name your extension:`,
			initial: orignal_name,
			onState: (state) => {
				build_dir = slugify(state.value.trim() || orignal_name, {lower: true});
			},
			validate: value => !value.trim() ? `Please enter a name!` : true
		},
		{
			type: 'text',
			name: 'description',
			message: 'What does your extension do?',
			initial: "Just an extension built with browser-extension-builder"
		},
		{
			type: 'select',
			name: 'framework',
			message: 'Select a framework:',
			initial: 0,
			choices: frameworks.map((framework) => {
				return {
					title: framework.name,
					value: framework.template_name
				}
			})
		},
	];

	const promptCancelled = (prompt, answers) => {
		throw new Error('Abort.');
  }
  try {

		const response = await prompts(questions, {onCancel: promptCancelled});
		const { name, description, framework } = response;

		let dir_name = slugify(name.trim(), {lower: true});

		const copy_filter = (src, dest) => {
			const file_name = path.basename(src);
			if (file_name === "package.json") {
				renderToFolder(src, path.dirname(dest), {name: dir_name, description});
				return false;
			} else if (file_name === "manifest.json") {
				renderToFolder(src, path.dirname(dest), response);
				return false;
			} else {
				return true;
			}
		}
		console.log(colors.cyan("\nGenerating template..."));
		const framework_path = path.join(__dirname, "templates", framework);
		fs.copySync(framework_path, path.join(process.cwd(), dir_name), { filter: copy_filter });

		// Adds the extension recommendation
		fs.mkdirSync(path.join(dir_name, ".vscode"), { recursive: true })
		fs.writeFileSync(path.join(dir_name, ".vscode", "extensions.json"), JSON.stringify(
			{"recommendations": ["svelte.svelte-vscode"]}, null, 2)
		)

		console.log(colors.brightCyan(`\nCloned template in "${dir_name}".`));
		const install_msg = "".concat(
	  `    cd ${dir_name}\n`,
	  `    npm install\n`,
	  `    npm run dev\n`,
	  `\n    --- or ---\n\n`,
	  `    cd ${dir_name}\n`,
	  `    yarn\n`,
	  `    yarn dev\n`
	  );

	  console.log(colors.brightGreen("\nDone. Here are few things you have to do now:\n"));
	  console.log("1. Start in dev mode:");
	  console.log(install_msg);
	  console.log("2. Load your extension in the browser by selecting the `dist` folder.");
	  // console.log("    a. Open the Extension Management page by navigating to chrome://extensions.\n    b. Enable Developer Mode by clicking the toggle switch next to Developer mode.\n    c. Click the Load unpacked button and select the `dist` folder.")
	  console.log("3. And you are done. Happy Coding!");
  } catch (e) {
  	console.log(colors.brightRed(e.message));
  	return;
  }
}

launch();