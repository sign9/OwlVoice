const hashElement = document.getElementById('hashtype');
const globalSecretElement = document.getElementById('globalsecret');
const passwordLengthElement = document.getElementById('passwordlength');
const passwordLengthValueElement = document.getElementById('passwordlengthvalue');

/**
 *
 */
function saveOptions() {
    let globalSecret = globalSecretElement.value;
    let hashVariant = hashElement.value;
    let passwordLength = passwordLengthElement.value;

    chrome.storage.sync.set({
        globalSecret: globalSecret,
        hashVariant: hashVariant,
        passwordLength: passwordLength
    }, function() {
        let status = document.getElementById('status');
        status.textContent = 'Options saved.';

        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

/**
 *
 */
function restoreOptions() {
    chrome.storage.sync.get({
        globalSecret: Math.random().toString(36).substr(2),
        hashVariant: 'SHA-256',
        passwordLength: 12
    }, function(items) {
        globalSecretElement.value = items.globalSecret || Math.random().toString(36).substr(2);
        hashElement.value = items.hashVariant;
        passwordLengthElement.value = items.passwordLength;
        passwordLengthValueElement.value = items.passwordLength;
    });
}

/**
 *
 */
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
passwordLengthElement.addEventListener('input', () => {
    passwordLengthValueElement.value = passwordLengthElement.value;
});