import { readFile, writeFile } from "node:fs/promises";
import chalk from "chalk";
const { red, yellow, green } = chalk;

import json from "./package.json"; // { version as oldVersion }
const oldVersion = json.version;

let [, , type] = process.argv;
const typeMap = ["major", "minor", "patch"];
if (type === "help") {
	const types = {
		patch: green("patch"),
		minor: yellow("minor"),
		major: red("major"),
	};
	const helpData = [
		`${types.patch}: Backwards-compatible Bug fixes`,
		`${types.minor}: Backwards-compatible features`,
		`${types.major}: Possible breaking changes`,
	];
	console.log(`
    Usage:
        $ node upgrade_version.js [${Object.values(types).join("|")}]
            ${helpData.join("\n            ")}
    `);
	process.exit(0);
}
if (type === undefined) {
	const titleCase = (str) => str[0].toUpperCase() + str.slice(1);
	const colors = [red, yellow, green];
	const sign = "⭕";
	const { prompt, Separator } = (await import("inquirer")).default;
	type = (
		await prompt([
			{
				type: "list",
				name: "output",
				message: "What kind of upgrade would you like to do?",
				choices: [
					...typeMap
						.map(
							(type, i) =>
								`${colors[i](sign)} ${titleCase(type)} (${upgrade(oldVersion, i)})`,
						)
						.reverse(),
					new Separator(),
					`${sign} Cancel (keep ${oldVersion})`,
				],
			},
		])
	).output.split(" ")[1];
	if (type === "Cancel") process.exit(0);
}

// biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
const index = isNaN(type) ? typeMap.indexOf(type.toLowerCase()) : Number(type);
if (!typeMap[index]) throw "invalid type";

const newVersion = upgrade(oldVersion, index);

function upgrade(version, index) {
	const arr = version.split(".").map(Number);
	arr[index]++;
	for (let i = index + 1; i < arr.length; i++) arr[i] = 0;
	return arr.join(".");
}

// *****************
const regex = /(scriptVersion = '|version": ")(\d+\.\d+\.\d+)/;
const replacer = (_, line, version) => line + upgrade(version, index);

async function upgradeInFile(path) {
	const content = await readFile(path, "utf8");
	const newContent = content.replace(regex, replacer);
	if (newContent !== content) await writeFile(path, newContent);
}

function upgradeInFiles(...paths) {
	return Promise.all(paths.map(upgradeInFile));
}

upgradeInFiles("./index.js", "./package.json")
	.then(() => {
		console.log(
			`${green("success:")} Version upgraded from ${oldVersion} to ${newVersion} [${typeMap[index]}]`,
		);
	})
	.catch((err) => {
		throw err;
	});
