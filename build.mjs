import fs from "node:fs/promises";
import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";
import { analyzeMetafile, build } from "esbuild";
import isCI from "is-ci";

const pkg = JSON.parse(await fs.readFile("package.json", "utf-8"));

const esbuildResult = await build({
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
			`import { createRequire } from "node:module";`,
			`const require = createRequire(import.meta.url);`,
		].join("\n"),
	},
});

console.log(await analyzeMetafile(esbuildResult.metafile));

if (isCI) {
	console.group(`Running API Extractor in CI mode.`);
} else {
	console.group(`Running API Extractor in local mode.`);
}
const config = ExtractorConfig.loadFileAndPrepare("api-extractor.json");
const apiResult = Extractor.invoke(config, {
	localBuild: !isCI,
	showVerboseMessages: true,
});
if (apiResult.succeeded) {
	console.log(`API Extractor completed successfully`);
} else {
	const { errorCount, warningCount } = esbuildResult;
	console.error(
		`API Extractor completed with\n${errorCount} error(s) and ${warningCount} warning(s)`,
	);
	process.exitCode = 1;
}
console.groupEnd();
