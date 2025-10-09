import { type Options as WriterOptions } from "conventional-changelog-writer";
import {
	type Commit,
	type ParserStreamOptions as ParserOptions,
} from "conventional-commits-parser";
import { defaultTemplates } from "./default-templates";
import { getChangelog } from "./get-changelog";
import { getParsedCommits } from "./get-parsed-commits";
import { renderTemplate } from "./render-template";

/**
 * @public
 */
export interface PullRequestChangelogOptions {
	config: {
		parserOpts?: ParserOptions;
		writerOpts?: WriterOptions;
		whatBump(this: void, commits: Commit[]): { level: 0 | 1 | 2 };
	};
	git: {
		from: string;
		to: string;
	};
	title?: string;
	template?:
		| {
				message?: string;
				header?: string;
				footer?: string;
		  }
		| undefined;
}

const release = ["major", "minor", "patch"] as const;

/**
 * Get conventional changelog for given git commit range.
 *
 * @public
 */
export async function pullRequestChangelog(options: PullRequestChangelogOptions): Promise<string> {
	const { config, git } = options;

	const parserOpts = { ...config.parserOpts };
	const writerOpts = { ...config.writerOpts, headerPartial: "", footerPartial: "" };
	const parsedCommits = await getParsedCommits(git, parserOpts);
	const bump = config.whatBump(parsedCommits);

	const changelog = await getChangelog(git, config, parserOpts, writerOpts);

	const template = {
		...defaultTemplates,
		...options.template,
	};

	return renderTemplate(template, {
		title: options.title ?? "CHANGELOG",
		changelog,
		bump: release[bump.level],
	});
}
