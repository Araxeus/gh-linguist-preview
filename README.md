# gh-linguist-preview

Browserscript to preview github codeblocks style

Script **always** modify the **first** codeblock in the selected comment

If there is no comment currently in edit mode, script by default will pick your **first editable comment/post**

(if none are found, it will do nothing)

## Installation

you can save the script by creating a new bookmark, in the url put `javascript: ` then the content of [dist/bundle.min.js](https://github.com/Araxeus/gh-linguist-preview/blob/main/dist/bundle.min.js)

## How to run it

Navigate to a github pr/issue page where you have an editable commment that includes a code block, then either:

1. Launch the bookmarklet you created
2. Paste the content of [dist/bundle.min.js](https://github.com/Araxeus/gh-linguist-preview/blob/main/dist/bundle.min.js) in your devtools console

Navigation is done via the arrow keys

status updates can be viewed in devtool

## Build it yourself
The script is automatically build by github actions, and includes an update checker, so its best not build yourself

if you still want to:

isntall `nodeJS` and `Yarn`

run in project directory:
* `yarn`: to install dependecies
* `yarn build`: to build and minify, output in dist folder
