# gh-linguist-preview

Browserscript to preview github codeblocks style

## Installation

you can save the script by creating a new bookmark, in the url put `javascript: ` then the content of [dist/bundle.min.js](https://github.com/Araxeus/gh-linguist-preview/blob/main/dist/bundle.min.js)

## How to run it

Navigate to a page with a comment editor and then either:

1. Launch the bookmarklet you created
2. Paste the content of [dist/bundle.min.js](https://github.com/Araxeus/gh-linguist-preview/blob/main/dist/bundle.min.js) in your devtools

## Interaction

Script will change the language of **The first code block** in your **first editable comment/post**

Navigation is done via the arrow keys

status updates can be viewed in devtool

## Build it yourself
requires `nodeJS`, `Yarn`

run in project directory:
* `yarn`: to install dependecies
* `yarn build`: to build and minify, output in dist folder
