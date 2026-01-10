export const generatePassword = (length = 16, options = {}) => {
    const {
        includeUppercase = true,
        includeLowercase = true,
        includeNumbers = true,
        includeSymbols = true,
        excludeSimilar = false,
        excludeChars = '',
    } = options;

    let charset = '';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    if (excludeSimilar) {
        // Remove I, l, 1, O, 0
        charset = charset.replace(/[Il1O0]/g, '');
    }

    if (excludeChars) {
        const excludeRegex = new RegExp(`[${excludeChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`, 'g');
        charset = charset.replace(excludeRegex, '');
    }

    if (charset.length === 0) return '';

    let password = '';
    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
        password += charset[randomValues[i] % charset.length];
    }

    return password;
};
