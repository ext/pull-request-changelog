import fs from "node:fs/promises";
import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";
import dedent from "dedent";
import { analyzeMetafile, build } from "esbuild";
import isCI from "is-ci";
import spawn from "nano-spawn";
import { parse } from "yaml";

const pkg = JSON.parse(await fs.readFile("package.json", "utf-8"));

function formatParam([name, param]) {
	if (name.startsWith("internal-")) {
		return "";
	}
	return `${name} | ${param.default ? JSON.stringify(param.default) : ""} | ${param.description}`;
}

async function updateReadme() {
	const readme = await fs.readFile("README.md", "utf-8");
	const action = parse(await fs.readFile("action.yml", "utf-8"));

	action.inputs.version.default = "auto";

	const paramPreamble = "<!-- ACTION INPUTS BEGIN -->";
	const paramPostamble = "<!-- ACTION INPUTS END -->";
	const paramRegex = new RegExp(`(${paramPreamble})[^]*(${paramPostamble})`);
	const paramTable = dedent`
		<!-- prettier-ignore -->
		Input&nbsp;parameter | Default | Description
		--- | --- | ---
		${Object.entries(action.inputs).map(formatParam).filter(Boolean).join("\n")}
	`;

	const usagePreamble = "<!-- CLI USAGE BEGIN -->";
	const usagePostamble = "<!-- CLI USAGE END -->";
	const usageRegex = new RegExp(`(${usagePreamble})[^]*(${usagePostamble})`);
	const output = await spawn("node", ["bin/pull-request-changelog.mjs", "--help"]);
	const usage = dedent`
		\`\`\`plaintext
		${output.stdout.trim()}
		\`\`\`
	`;

	const updated = readme
		.replace(paramRegex, `$1\n\n${paramTable}\n\n$2`)
		.replace(usageRegex, `$1\n\n${usage}\n\n$2`);
	if (readme !== updated) {
		if (isCI) {
			console.error("README.md not up-to-date, run build locally and add changes");
			process.exitCode = 1;
		} else {
			await fs.writeFile("README.md", updated, "utf-8");
		}
	}
}

async function esbuild() {
	const result = await build({
		entryPoints: ["src/index.ts", "src/cli.ts"],
		outdir: "dist",
		bundle: true,
		splitting: true,
		platform: "node",
		target: "node22",
		format: "esm",
		logLevel: "info",
		metafile: true,
		external: pkg.externalDependencies,
		banner: {
			js: [
				`import { createRequire as prRequestChangelogCreateRequire } from "node:module";`,
				`const require = prRequestChangelogCreateRequire(import.meta.url);`,
			].join("\n"),
		},
	});

	console.log(await analyzeMetafile(result.metafile));
}

async function apiExtractor() {
	if (isCI) {
		console.group(`Running API Extractor in CI mode.`);
	} else {
		console.group(`Running API Extractor in local mode.`);
	}
	const config = ExtractorConfig.loadFileAndPrepare("api-extractor.json");
	const result = Extractor.invoke(config, {
		localBuild: !isCI,
		showVerboseMessages: true,
	});
	if (result.succeeded) {
		console.log(`API Extractor completed successfully`);
	} else {
		const { errorCount, warningCount } = result;
		console.error(
			`API Extractor completed with\n${errorCount} error(s) and ${warningCount} warning(s)`,
		);
		process.exitCode = 1;
	}
	console.groupEnd();
}

await fs.rm("dist", { recursive: true, force: true });
await esbuild();
await apiExtractor();
await updateReadme();
