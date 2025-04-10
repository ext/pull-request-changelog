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

export async function cli(cwd: string, argv: string[]): Promise<void> {
	const cli = meow(
		`
Usage
  $ npx pull-request-changelog -f origin/main

Options
  --from, -f    Base branch/ref
  --to, -t      Pull request branch/ref (default: HEAD)
  --preset, -p  Conventional Changelog preset (NPM package)
  --config, -c  Conventional Changelog config (filename)

Other
  --help      Show usage
  --version   Show version

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
			},
		},
	);

	const config = await getConfig(cwd, cli.flags);
	const output = await pullRequestChangelog({
		config,
		git: {
			from: cli.flags.from,
			to: cli.flags.to,
		},
	});

	/* eslint-disable-next-line no-console -- expected to log */
	console.log(output);
}
