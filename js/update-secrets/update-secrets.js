function encrypt(sodium, key, token) {
    const binaryKey = sodium.from_base64(key, sodium.base64_variants.ORIGINAL);
    const binaryToken = sodium.from_string(token);

    const encrypted = sodium.crypto_box_seal(binaryToken, binaryKey);

    return Promise.resolve(sodium.to_base64(encrypted, sodium.base64_variants.ORIGINAL));
}