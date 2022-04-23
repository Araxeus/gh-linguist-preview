import { readFile, writeFile } from 'fs/promises';

import json from './package.json' assert { type: 'json' }; // { version as oldVersion }
const oldVersion = json.version;
let newVersion;

let [, , type] = process.argv;
const typeMap = ['major', 'minor', 'patch'];
if (type === undefined) {
    const titleCase = str => str[0].toUpperCase() + str.slice(1);
    const { red, yellow, green } = (await import('chalk')).default
    const colors = [red, yellow, green];
    const sign = '⭕';
    const { prompt } = (await import('inquirer')).default;
    type = (await prompt([
                {
                    type: 'list',
                    name: 'output',
                    message: 'What kind of upgrade would you like to do?',
                    choices: [...typeMap.map((type, i) => `${colors[i](sign)} ${titleCase(type)} (${upgrade(oldVersion, i)})`).reverse(), `${sign} Cancel`]
                }
     ])).output.split(' ')[1];
     if (type === 'Cancel') process.exit(0);
}

const index = isNaN(type) ? typeMap.indexOf(type.toLowerCase()) : Number(type);
if (!typeMap[index]) throw 'invalid type';

newVersion = upgrade(oldVersion, index);

function upgrade(version, index) {
    const arr = version.split('.').map(Number);
    arr[index]++;
    for (let i = index + 1; i < arr.length; i++) arr[i] = 0;
    return arr.join('.');
}

// *****************
const regex = /(scriptVersion = '|version": ")(\d+\.\d+\.\d+)/;
const replacer = (_, line, version) => line + upgrade(version, index);

async function upgradeInFile(path) {
    const content = await readFile(path, 'utf8');
    const newContent = content.replace(regex, replacer);
    if (newContent !== content) await writeFile(path, newContent);
}

function upgradeInFiles(...paths) {
    return Promise.all(paths.map(upgradeInFile));
}

upgradeInFiles('./index.js', './package.json')
    .then(() => {
        console.log(
            `Version was successfully upgraded from ${oldVersion} to ${newVersion} [${typeMap[index]}]`
        );
    })
    .catch(err => {
        throw err;
    });
