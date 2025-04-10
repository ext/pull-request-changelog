import spawn from "nano-spawn";
import { parse } from "semver";

async function getTags(env, cwd) {
	const { stdout: tags } = await spawn("git", ["tag"], { env, cwd });
	return tags.split("\n");
}

export async function updateTags(env, cwd, version) {
	const parsed = parse(version);
	const major = `v${parsed.major}`;
	const minor = `v${parsed.major}.${parsed.minor}`;
	const tags = await getTags(env, cwd);
	if (tags.include(major)) {
		await spawn("git", ["push", `:${major}`], { env, cwd });
	}
	if (tags.include(minor)) {
		await spawn("git", ["push", `:${major}`], { env, cwd });
	}
	await spawn("git", ["push", `${version}:${major}`], { env, cwd });
	await spawn("git", ["push", `${version}:${minor}`], { env, cwd });
}

export async function publish(_pluginConfig, context) {
	const { nextRelease, logger, env, cwd } = context;
	logger.log(`Updating git tags`);
	await updateTags(env, cwd, nextRelease.version);
}
