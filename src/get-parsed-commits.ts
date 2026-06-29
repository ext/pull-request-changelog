import { GitClient } from "@conventional-changelog/git-client";
import { type Commit, type ParserStreamOptions, parseCommits } from "conventional-commits-parser";

/**
 * Get a list of commits between Git ref `from` (exclusive) and `to` (inclusive).
 *
 * @internal
 */
export async function getParsedCommits(
	cwd: string,
	git: {
		from: string;
		to: string;
	},
	parserOpts: ParserStreamOptions,
): Promise<Commit[]> {
	const client = new GitClient(cwd);
	const parser = parseCommits(parserOpts);
	const commits = await Array.fromAsync(client.getRawCommits(git));
	return await Array.fromAsync(parser(commits));
}
