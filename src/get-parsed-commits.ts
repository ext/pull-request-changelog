import { type Commit, type ParserStreamOptions, parseCommits } from "conventional-commits-parser";
import { getRawCommits } from "git-raw-commits";

/**
 * Get a list of commits between git ref `from` (exclusive) and `to` (inclusive).
 *
 * @internal
 */
export async function getParsedCommits(
	git: {
		from: string;
		to: string;
	},
	parserOpts: ParserStreamOptions,
): Promise<Commit[]> {
	const parser = parseCommits(parserOpts);
	const commits = await Array.fromAsync(getRawCommits(git));
	return await Array.fromAsync(parser(commits));
}
