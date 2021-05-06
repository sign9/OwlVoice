/**
 * base85 Encoder
 *
 * How it works:
 * 1. Divide a text into 4-character chunks
 * 2. Convert the chunks of text to binary
 * 3. Padding binary data to 32 bit
 * 4. Calculate based on base85
 * 5. Convert the numbers to characters
 * 6. Output the concatenated characters
 */
class Base85Encoder {

    constructor(useCustomAlphabet = false) {
        this.useCustomAlphabet = useCustomAlphabet;
        this.customAlphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#';
    }

    /**
     * Encode given String
     *
     * @param {string} text
     * @returns {string}
     */
    encode(text) {
        let blocks = [];
        let output = [];

        const textChunks = this.chunkString(text);

        textChunks.forEach(chunk => {
            let binary = this.textToBinary(chunk).join('');
            blocks.push(this.padBinary(binary));
        });

        blocks.forEach(block => {
            let separatedValues = this.loopedDivision(parseInt(block, 2));
            output = [].concat(output, this.lookupChar(separatedValues));
        });

        return output.join('');
    }

    /**
     * Calculate to base 85
     *
     * divide by 85^4 & modulo 85^4 as new start value
     * divide by 85^3 & modulo 85^3 as new start value
     * divide by 85^2 & modulo 85^2 as new start value
     * divide by 85   & modulo 85   as new start value
     *
     * @param {Number} value
     * @returns {Number[]}
     */
    loopedDivision(value) {
        let values = [];
        let modulo = value;

        for (let i = 4, len = 1; i >= len; i--) {

            let divisor = Math.pow(85, i);
            let calculatedValue = ~~(modulo / divisor);
            modulo = modulo % divisor;

            values.push(calculatedValue);
        }

        values.push(modulo);
        return values;
    }

    /**
     * Transform number to character
     * @param {Number[]} value
     * @returns {string[]}
     */
    lookupChar(value) {
        let values = [];

        value.forEach(item => {

            if (!this.useCustomAlphabet) {
                item += 33;
            }

            values.push(String.fromCharCode(item));

        });

        return values;
    }

    /**
     * Split given string to chunks
     *
     * @param {string} text
     * @returns {boolean|string[]}
     */
    chunkString(text = '') {
        if (text.length <= 0) {
            return false;
        }

        return text.match(/.{1,4}/g);
    }

    /**
     * Padding the binary data to 32-bit
     *
     * @param binary
     * @returns {boolean|string}
     */
    padBinary(binary = '') {
        if (binary.length <= 0) {
            return false;
        }

        return binary.toString().padEnd(32, '0');
    }

    /**
     * Transform string to binary
     *
     * @param text
     * @returns {boolean|string[]}
     */
    textToBinary(text='') {
        if (text.length <= 0) {
            return false;
        }

        return text.split('').map(char => {
            return char.charCodeAt(0).toString(2).padStart(8, '0');
        });
    }
}

