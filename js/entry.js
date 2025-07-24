import {object, classes} from '@stgroves/js-utilities';

class Keys {
    /**
     * Create a Keys instance from the keyset storage object.
     * @param {Entry~StorageObject} keySet
     * @returns {Keys}
     */
    static loadFromObject(keySet) {
        const newKeys = new Keys();
        const validKeySet = object.requireArgs(Object.keys(newKeys.getObject()), keySet);

        newKeys.#privateEncryptionKey = validKeySet.privateEncryptionKey;
        newKeys.#publicEncryptionKey = validKeySet.publicEncryptionKey;

        return newKeys;
    }

    #publicEncryptionKey;
    #privateEncryptionKey;

    /**
     * Stores the encryption keys.
     * @param {Uint8Array} privateKey
     * @param {Uint8Array} publicKey
     */
    setEncryptionKeyPair(privateKey, publicKey) {
        this.#privateEncryptionKey = privateKey;
        this.#publicEncryptionKey = publicKey;
    }

    /**
     * Get JS Object.
     * @returns {Readonly<Entry~StorageObject>}
     */
    getObject() {
        return Object.freeze({
            publicEncryptionKey: this.#publicEncryptionKey,
            privateEncryptionKey: this.#privateEncryptionKey
        });
    }
}

export default class Entry {
    /**
     * Generates and stores new encryption keys.
     * @param {Object} sodium
     * @param {Entry} thisEntry
     * @param {Entry} otherEntry
     */
    static generateEncryptionKeys(sodium, thisEntry, otherEntry) {
        const otherEntryKeyPair = sodium.crypto_box_keypair();
        const thisEntryKeyPair = sodium.crypto_box_keypair();

        thisEntry.#entries.peek().setEncryptionKeyPair(thisEntryKeyPair.privateKey, otherEntryKeyPair.publicKey);
        otherEntry.#entries.peek().setEncryptionKeyPair(otherEntryKeyPair.privateKey, thisEntryKeyPair.publicKey);
    }

    /**
     * Create an Entry instance from the stored object.
     * @param {Entry~StorageObject | Entry~StorageObject[]} storedObj
     * @returns {Entry}
     */
    static loadFromStorage(storedObj) {
        const isArray = Array.isArray(storedObj);
        const newEntryObject = new Entry(isArray);

        const targetArray = isArray ? storedObj.reverse() : [storedObj];

        targetArray.forEach(
            /** @param {Entry~StorageObject} keySet */
            (keySet) => newEntryObject.#entries.enqueue(Keys.loadFromObject(keySet))
        );

        return newEntryObject;
    }

    /**
     * @private
     * @type {classes.Queue}
     */
    #entries;
    #isCritical;

    constructor(isCritical) {
        this.#entries = new classes.Queue(isCritical ? 2 : 1, classes.Queue.Mode.CYCLE);
        this.#isCritical = isCritical;

        this.createEmptyKeySet();
    }

    /**
     * Creates a new empty Keys object.
     */
    createEmptyKeySet() {
        this.#entries.enqueue(new Keys());
    }

    /**
     * Converts instance into a storable object.
     * @returns {Entry~StorageObject | [Entry~StorageObject]}
     */
    getStorageObject() {
        const queue = this.#entries.toArray();
        const keySets = queue.map((entry) => entry.getObject());

        return this.#isCritical ? keySets : keySets[0];
    }
}

/**
 * @typedef {Object} Entry~StorageObject
 * @property {Uint8Array} publicEncryptionKey
 * @property {Uint8Array} privateEncryptionKey
 */