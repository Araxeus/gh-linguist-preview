import { load as parseYML } from 'js-yaml';
const $ = s => document.querySelector(s);

const getBody = () => $('[name="pull_request[body]"]') || $('[name="issue[body]"]')

const getNthParent = (elem, n) =>
    n === 0 ? elem : getNthParent(elem.parentNode, n - 1);

const firstOwnedComment = getBody();
if (
    !firstOwnedComment ||
    !getNthParent(firstOwnedComment, 6).classList.contains('is-comment-editing')
) {
    $('button.js-comment-edit-button')?.click();
} // total 500ms after should be ok

fetch(
    'https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml'
)
    .then(res => res.blob())
    .then(blob => blob.text())
    .then(parseYML)
    .then(start);

function start(res) {
    const languages = Object.keys(res);
    let index = -1;

    const currentLanguage = getBody()?.value.match(
        /```(.+)\n/
    )?.[1];

    if (currentLanguage) {
        const lang = currentLanguage.toLowerCase();

        let index = Object.entries(res).findIndex(
            ([key, value]) =>
                key.toLowerCase() === lang ||
                value.aliases?.some(alias => alias.toLowerCase() === lang)
        );
    
        if (index >= 0)
            console.log(`[${index + 1}/${languages.length}]: ${currentLanguage}`);
    }

    function replaceLanguage(replacement = '') {
        const body = getBody();
        body.value = body.value.replace(/```.*\n/, '```' + replacement + '\n');
        $('button.preview-tab').click();
        console.log(`[${index + 1}/${languages.length}]: ${replacement}`);
    }

    document.onkeyup = e => {
        //if (!e.ctrlKey) return;
        if (e.key === 'ArrowRight') {
            index += index < languages.length - 1 ? 1 : 0;
            replaceLanguage(languages[index]);
        } else if (e.key === 'ArrowLeft') {
            index -= index > 0 ? 1 : 0;
            replaceLanguage(languages[Math.max(index, 0)]);
        }
    };
}
