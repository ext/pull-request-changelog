import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { moduleResolve } from "import-meta-resolve";
import meow from "meow";
import { type PullRequestChangelogOptions, pullRequestChangelog } from "./pull-request-changelog";

interface ConfigModule {
	default(
		this: void,
	): PullRequestChangelogOptions["config"] | Promise<PullRequestChangelogOptions["config"]>;
}

async function getConfig(
	cwd: string,
	flags: { preset: string | undefined; config: string | undefined },
): Promise<PullRequestChangelogOptions["config"]> {
	const { preset, config } = flags;
	if (config) {
		const fullpath = path.join(cwd, config);
		const { default: configFactory } = (await import(fullpath)) as ConfigModule;
		return await configFactory();
	}
	if (preset) {
		const base = pathToFileURL(path.join(cwd, "noop.js"));
		const modulePath = moduleResolve(preset, base, new Set(["node", "import"]));
		const { default: configFactory } = (await import(
			modulePath as unknown as string
		)) as ConfigModule;
		return await configFactory();
	}
	return {
		whatBump() {
			return { level: 2 };
		},
	};
}

async function getTemplates(
	cwd: string,
	flags: { templateDir: string | undefined },
): Promise<PullRequestChangelogOptions["template"]> {
	const { templateDir } = flags;
	if (!templateDir || templateDir === "") {
		return {};
	}

	const template: PullRequestChangelogOptions["template"] = {};
	const filepaths = {
		message: path.join(cwd, templateDir, "message.hbs"),
		header: path.join(cwd, templateDir, "header.hbs"),
		footer: path.join(cwd, templateDir, "footer.hbs"),
	} as const;
	for (const name of ["message", "header", "footer"] as const) {
		const filepath = filepaths[name];
		if (existsSync(filepath)) {
			template[name] = await fs.readFile(filepath, "utf-8");
		}
	}

	return template;
}

export async function cli(cwd: string, argv: string[]): Promise<void> {
	const cli = meow(
		`
Usage
  $ npx pull-request-changelog -f origin/main

Options
  --from, -f          Base branch/ref
  --to, -t            Pull request branch/ref (default: HEAD)
  --preset, -p        Conventional Changelog preset (NPM package)
  --config, -c        Conventional Changelog config (filename)
  --template-dir, -T  Template directory

Other
  --help      Show usage
  --version   Show version

The template directory may contain the files:

- message.hbs for the main template
- header.hbs for the header partial
- footer.hbs for the footer partial

`,
		{
			argv,
			importMeta: import.meta,
			flags: {
				from: {
					type: "string",
					shortFlag: "f",
					isRequired: true,
				},
				to: {
					type: "string",
					shortFlag: "t",
					default: "HEAD",
				},
				preset: {
					type: "string",
					shortFlag: "p",
				},
				config: {
					type: "string",
					shortFlag: "c",
				},
				templateDir: {
					type: "string",
					shortFlag: "T",
				},
			},
		},
	);

	const config = await getConfig(cwd, cli.flags);
	const template = await getTemplates(cwd, cli.flags);
	const output = await pullRequestChangelog({
		config,
		git: {
			from: cli.flags.from,
			to: cli.flags.to,
		},
		template,
	});

	/* eslint-disable-next-line no-console -- expected to log */
	console.log(output);
}
