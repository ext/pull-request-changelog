import path from "node:path";
import meow from "meow";
import { type PullRequestChangelogOptions, pullRequestChangelog } from "./pull-request-changelog";

export async function cli(cwd: string, argv: string[]): Promise<void> {
	const cli = meow(
		`
Usage
  $ npx pull-request-changelog -f origin/main

Options
  --from, -f    Base branch/ref
  --to, -t      Pull request branch/ref (default: HEAD)
  --preset, -p  Conventional Changelog preset

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
					isRequired: true,
				},
			},
		},
	);

	const moduleName = cli.flags.preset.startsWith(".")
		? path.join(cwd, cli.flags.preset)
		: cli.flags.preset;
	const { default: presetFactory } = (await import(moduleName)) as {
		default(
			this: void,
		): PullRequestChangelogOptions["config"] | Promise<PullRequestChangelogOptions["config"]>;
	};
	const config = await presetFactory();

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
