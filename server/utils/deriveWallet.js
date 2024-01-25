const utxolib = require('@bitgo/utxo-lib');
const bip39 = require('bip39');
/**
 * Derives the wallet's funding wif based on the supplied mnemonic and derivation path
 * Refer to the createWallet.js example for background on key wallet attributes
 *
 * @param {string} senderMnemonic the 12 word mnemonic seed for the sending wallet
 * @param {string} derivationPath the derivation path used for the sending wallet
 * @param {string} senderAddress the eCash address of the sender
 * @returns {object} wallet the populated wallet object for use throughout sendToken()
 */
async function deriveWallet(senderMnemonic, derivationPath, senderAddress) {
    // Derive wallet attributes
    const rootSeedBuffer = await bip39.mnemonicToSeed(senderMnemonic, '');
    const masterHDNode = utxolib.bip32.fromSeed(
        rootSeedBuffer,
        utxolib.networks.ecash,
    );

    // Extract the wallet's wif (wallet import format), which is used to sign the transaction
    const fundingWif = masterHDNode.derivePath(derivationPath).toWIF();

    const wallet = {
        address: senderAddress,
        mnemonic: senderMnemonic,
        fundingWif: fundingWif,
        derivationPath: derivationPath,
    };

    return wallet;
}

module.exports = {
    deriveWallet,
};