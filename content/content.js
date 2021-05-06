chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        if (Array.isArray(message) && !message.length && !message.indexOf("password")) {
            return false;
        }

        const passwordField = document.querySelector('input[type="password"]');
        if (!document.body.contains(passwordField)) {
            return false;
        }

        passwordField.value = message.password;
    }
);