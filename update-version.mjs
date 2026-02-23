import fs from "node:fs/promises";
import path from "node:path";
import spawn from "nano-spawn";
import prettier from "prettier";
import { parse, stringify } from "yaml";

const filename = "action.yml";

export async function updateActionVersion(cwd, version) {
	const filepath = path.join(cwd, filename);
	const action = parse(await fs.readFile(filepath, "utf-8"));
	action.inputs.version.default = version;
	const content = stringify(action, {
		blockQuote: "literal",
		lineWidth: 100,
	}).replaceAll(/^([a-z]+:)$/gm, "\n$1");
	const options = await prettier.resolveConfig(filename);
	const formatted = await prettier.format(content, {
		...options,
		filepath,
	});
	await fs.writeFile(filepath, formatted);
}

export async function prepare(_pluginConfig, context) {
	const { nextRelease, logger, cwd } = context;
	logger.log(`Updating version in ${filename}`);
	await updateActionVersion(cwd, nextRelease.version);
	await spawn("git", ["add", filename]);
}
