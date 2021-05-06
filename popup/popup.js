const showDomainElement = document.getElementById('domain');
const usernameElement = document.getElementById('username');
const customSecretElement = document.getElementById('secret');
const feedbackElement = document.getElementById('feedback');

const copyButton = document.getElementById('copy');
const autofillButton = document.getElementById('fill');
const clearLink = document.getElementById('clear');

const port = chrome.runtime.connect({
    name: "Owl Voice"
});

let domain = 'localhost';
let options = {}
let currentTabId;

/**
 * Load storage data
 */
chrome.storage.sync.get({
    globalSecret: Math.random().toString(36).substr(2),
    hashVariant: 'SHA-256',
    passwordLength: 12
}, items => {
    options = items;
});

/**
 * Get active Tab and save URL and TabID
 */
chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const urlObject = new URL(tabs[0].url);
    domain = urlObject.protocol + '//' + urlObject.hostname;
    showDomainElement.innerText = domain;
    currentTabId = tabs[0].id;
});

/**
 * Get Password from the background.js
 *
 * @param {string} content
 * @param {string} type
 * @returns {void}
 */
async function getPassword(content, type) {

    port.postMessage({type: type, content: content});

    port.onMessage.addListener(async (message) => {
        if (message.type === 'clipboard') {
            navigator.clipboard.writeText(message.password).then(() =>{
                feedbackElement.innerText = 'Saved to clipboard'
                clearFeedback();
            });
        } else if (message.type === 'autofill') {
            chrome.tabs.sendMessage(currentTabId, {'password': message.password});
            feedbackElement.innerText = 'Password transmitted';
            clearFeedback();
        }
    });
}

/**
 * Build content string and get Password from the background.js
 * @param {String} username
 * @param {String} customSecret
 * @param {String} type
 * @returns {Promise<string>}
 */
async function generatePassword(username, customSecret, type) {
    const content = domain + options.globalSecret + username + customSecret;
    await getPassword(content, type);
}

function clearFeedback() {
    setTimeout(() => {
        feedbackElement.innerText = '';
    }, 4000)
}

/**
 * Copy button action
 * Generates password an save it to clipboard
 */
copyButton.addEventListener('click', async () => {
    const username = usernameElement.value;
    const customSecret = customSecretElement.value;

    await generatePassword(username, customSecret, 'clipboard');
});

/**
 * Autofill button action
 * Generates Password and autofill password field
 */
autofillButton.addEventListener('click', async () => {
    const username = usernameElement.value;
    const customSecret = customSecretElement.value;

    await generatePassword(username, customSecret, 'autofill');
});

/**
 * Reset Input Fields and clear clipboard
 */
clearLink.addEventListener('click', () => {
    usernameElement.value = '';
    customSecretElement.value = '';

    navigator.clipboard.writeText('').then(() => {feedbackElement.innerText = 'Clipboard cleared'});
    clearFeedback();
});