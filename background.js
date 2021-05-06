importScripts('/lib/base85encoder.js');

// global identifier
const CONTEXT_MENU_ID = "OwlVoice";

// In-page cache of the user's options
let options = {};

/**
 * Loads Storage Data
 */
chrome.storage.sync.get({
    globalSecret: Math.random().toString(36).substr(2),
    hashVariant: 'SHA-256',
    passwordLength: 12
}, items => {
    options = items;
});

/**
 * On Install set defined globalSecret
 */
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({
        globalSecret: options.globalSecret
    });

});

/**
 * Opens permanent connection to communicate with popup
 */
chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(async function(msg) {
        const password = await getPassword(msg.content);
        port.postMessage({type: msg.type, password: password});
    });
});

/**
 * Adds context menu entry
 */
chrome.contextMenus.create({
    title: "Get Password for: %s",
    id: CONTEXT_MENU_ID,
    contexts: ["selection"]
});

/**
 * Set an EventListener to context menu entry
 */
chrome.contextMenus.onClicked.addListener(contextFunction);

async function getPassword(content) {
    const hash = await digest(content, options.hashVariant);
    const base85 = new Base85Encoder();
    const password = base85.encode(hash);

    return password.substr(0, options.passwordLength);
}

/**
 * Hash given string with given digest
 *
 * @param {String} value Value
 * @param {String} type  Digest type
 *
 * @return {Promise<string>}
 */
async function digest(value, type = 'SHA-256') {

    return Array.from(
        new Uint8Array(await crypto.subtle.digest(type, new TextEncoder().encode(value)))
    ).map(b => b.toString(16).padStart(2, '0')).join('');

}

/**
 * Creates Password from selected String and send it to password field

 * @param {Object} info
 * @param {Object} tab
 * @returns {Promise<void>}
 */
async function contextFunction(info, tab) {
    if (info.menuItemId !== CONTEXT_MENU_ID) {
        return;
    }

    const urlObject = new URL(tab.url);
    const domain = urlObject.protocol + '//' + urlObject.hostname;

    const content = domain + options.globalSecret + info.selectionText.trim();
    const password = await getPassword(content);

    chrome.tabs.sendMessage(tab.id, {'password': password});
}