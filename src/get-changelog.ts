import { ConventionalChangelog } from "conventional-changelog";
import { WritableStreamBuffer } from "stream-buffers";

/**
 * Get changelog from conventional-changelog.
 *
 * @internal
 */
export function getChangelog(
	git: { from: string; to: string },
	config: object,
	parserOpts: object,
	writerOpts: object,
): Promise<string | false> {
	return new Promise((resolve, reject) => {
		const stream = new WritableStreamBuffer();

		stream.on("finish", () => {
			resolve(stream.getContentsAsString("utf-8"));
		});

		stream.on("error", (err) => {
			reject(err);
		});

		const context = { linkReferences: false };

		const generator = new ConventionalChangelog()
			.config(config)
			.options({ outputUnreleased: true })
			.context(context)
			.commits(git, parserOpts)
			.writer(writerOpts);
		generator.writeStream().pipe(stream);
	});
}
