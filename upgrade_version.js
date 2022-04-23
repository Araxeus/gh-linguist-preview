import { readFile, writeFile } from 'fs/promises';

import json from './package.json' assert { type: 'json' }; // { version as oldVersion }
const oldVersion = json.version;

let [, , type] = process.argv;
const typeMap = ['major', 'minor', 'patch'];
if (type === undefined) {
    const { red, yellow, green } = (await import('chalk')).default
    const colors = [red, yellow, green];
    const sign = '⭕';
    const { prompt } = (await import('inquirer')).default;
    type = (await prompt([
                {
                    type: 'list',
                    name: 'output',
                    message: 'What kind of upgrade would you like to do?',
                    choices: typeMap.map((type, i) => `${colors[i](sign)} ${type} (${upgrade(oldVersion, i)})`).reverse()
                }
     ])).output;
}

const index = isNaN(type) ? typeMap.indexOf(type) : Number(type);
if (!typeMap[index]) throw 'invalid type';

function upgrade(version, index) {
    const arr = version.split('.').map(Number);
    arr[index]++;
    for (let i = index + 1; i < arr.length; i++) arr[i] = 0;
    return arr.join('.');
}

// *****************
const regex = /(scriptVersion = '|version": ")(\d+\.\d+\.\d+)/;
const replacer = (_, line, version) => line + upgrade(version, index);

function upgradeInFile(path) {
    return new Promise((resolve, reject) => {
        readFile(path, 'utf8', (readErr, data) => {
            if (readErr) {
                reject(readErr);
            } else {
                writeFile(
                    path,
                    data.replace(regex, replacer),
                    'utf8',
                    writeErr => {
                        if (writeErr) reject(writeErr);
                        resolve();
                    }
                );
            }
        });
    });
}

function upgradeInFiles(...paths) {
    return Promise.all(paths.map(upgradeInFile));
}

let newVersion;

upgradeInFiles('./index.js', './package.json')
    .then(() => {
        console.log(
            `Version was successfully upgraded from ${oldVersion} to ${newVersion} [${typeMap[index]}]`
        );
    })
    .catch(err => {
        throw err;
    });
