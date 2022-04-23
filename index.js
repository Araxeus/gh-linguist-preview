import { load as parseYML } from 'js-yaml';
const $ = s => document.querySelector(s);

const bodySelectors = [
    '[name="pull_request[body]"]',
    '[name="issue[body]"]',
    '[name="issue_comment[body]"]'
];

const getNthParent = (elem, n) =>
    n === 0 ? elem : getNthParent(elem.parentNode, n - 1);

const getBody = () => {
    let result = null;
    for (const selector of bodySelectors) {
        const body = $(selector);
        if (body) {
            if (
                getNthParent(body, 6).classList.contains('is-comment-editing')
            ) {
                return body;
            } else {
                result ??= body;
            }
        }
    }
    return result;
};

const firstOwnedComment = getBody();
if (
    !firstOwnedComment ||
    !getNthParent(firstOwnedComment, 6).classList.contains('is-comment-editing')
) {
    $('button.js-comment-edit-button')?.scrollIntoView({ block: 'center' });
    $('button.js-comment-edit-button')?.click();
} // total 500ms after should be ok

fetch(
    'https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml'
)
    .then(res => res.blob())
    .then(blob => blob.text())
    .then(parseYML)
    .then(yml => setTimeout(start, 200, yml));

const clickPreview = () =>
    $(
        'div.previewable-comment-form:is(.write-selected, .preview-selected) button.preview-tab'
    )?.click();

function start(res) {
    const languages = Object.keys(res);
    let index = -1;

    const currentLanguage = getBody()?.value.match(/```(.+)\n/)?.[1];

    if (currentLanguage) {
        const lang = currentLanguage.toLowerCase();

        index = Object.entries(res).findIndex(
            ([key, value]) =>
                key.toLowerCase() === lang ||
                value.aliases?.some(alias => alias.toLowerCase() === lang)
        );

        if (index >= 0)
            console.log(
                `[${index + 1}/${languages.length}]: ${currentLanguage}`
            );

        clickPreview();
    }

    function replaceLanguage(replacement = '') {
        const body = getBody();
        if (!body) throw '[gh-linguist-preview] No comment detected';
        body.value = body.value.replace(/```.*\n/, '```' + replacement + '\n');
        clickPreview();
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
