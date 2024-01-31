class InputSanitizer {
    static sanitizeString(input) {
        if (typeof input !== 'string') {
            throw new Error('Input must be a string.');
        }
        // replace potentially dangerous characters with empty string
        input = input.replace(/['";]/g, '');

        // also sanitize by removing common SQL keywords
        return this.removeSqlKeywords(input);
    }

    static removeSqlKeywords(input) {
        const keywords = ['SELECT', 'INSERT', 'DELETE', 'UPDATE', 'DROP', 'EXEC', 'UNION'];
        const regex = new RegExp(keywords.join('|'), 'gi');
        return input.replace(regex, '');
    }
}

module.exports = InputSanitizer;

