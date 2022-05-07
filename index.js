import { load as parseYML } from 'js-yaml';
const $ = s => document.querySelector(s);

const scriptVersion = '1.0.5';

const bodySelectors = [
    '[name="pull_request[body]"]',
    '[name="issue[body]"]',
    '[name="issue_comment[body]"]',
    '[name="comment[body]"]'
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
    !(
        firstOwnedComment.id === 'new_comment_field' ||
        getNthParent(firstOwnedComment, 6).classList.contains(
            'is-comment-editing'
        )
    )
) {
    $('button.js-comment-edit-button')?.scrollIntoView({ block: 'center' });
    $('button.js-comment-edit-button')?.click();
} // total 500ms after should be ok

fetch(
    'https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml'
)
    .then(res => res.text())
    .then(parseYML)
    .then(yml => setTimeout(start, 400, yml));

const clickPreview = () =>
    (
        $(
            'div.previewable-comment-form:is(.write-selected, .preview-selected) button.preview-tab'
        ) || $('button.preview-tab')
    )?.click();

function start(res) {
    const languages = Object.keys(res);
    let index = -1;

    const currentLanguage = getBody()?.value.match(/```(.*)\n/)?.[1];

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
    }
    if (typeof currentLanguage === 'string') {
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

    checkVersion();
}

function checkVersion() {
    const toSemver = str => str.split('.').map(Number);

    fetch(
        'https://raw.githubusercontent.com/Araxeus/gh-linguist-preview/main/package.json'
    )
        .then(res => res.json())
        .then(({ version: remoteVersion }) => {
            if (remoteVersion !== scriptVersion) {
                const semver = {
                    local: toSemver(scriptVersion),
                    remote: toSemver(remoteVersion)
                };
                const isMajor = semver.local[0] < semver.remote[0];
                const isMinor = semver.local[1] < semver.remote[1];
                if (isMajor || isMinor) {
                    setTimeout(
                        alert,
                        400,
                        `gh-linguist-preview has a new ${
                            isMajor ? 'major' : 'minor'
                        } version! (${remoteVersion})`
                    );
                }
                console.error(
                    [
                        'gh-linguist-preview needs updating!',
                        `Current version: ${scriptVersion}`,
                        `Latest version: ${remoteVersion}`,
                        'Visit github to copy the latest version:',
                        'https://github.com/Araxeus/gh-linguist-preview/blob/main/dist/bundle.min.js'
                    ].join('\n  ')
                );
            }
        });
}
