/**
 * helper methods for encryption and decryption of access tokens
 */
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const iv = crypto.randomBytes(16);
const encrypt = (text) => {

    const cipher = crypto.createCipheriv(algorithm, process.env.ENCRYPTION_KEY, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return [
        iv.toString('hex'),
        encrypted.toString('hex')
    ];
};

const decrypt = (hash) => {

    if (hash.length < 2) {
        return '';
    }

    const decipher = crypto.createDecipheriv(algorithm, process.env.ENCRYPTION_KEY, Buffer.from(hash[0], 'hex'));

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash[1], 'hex')), decipher.final()]);

    return decrpyted.toString();
};

exports.encrypt = encrypt;
exports.decrypt = decrypt;
