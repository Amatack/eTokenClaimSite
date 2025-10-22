
const utxolib = require('@bitgo/utxo-lib');

const signUtxosByAddress = (inputUtxos, wallet, txBuilder) => {
    for (let i = 0; i < inputUtxos.length; i++) {
        const utxo = inputUtxos[i];
        const wif = wallet.fundingWif;
        const utxoECPair = utxolib.ECPair.fromWIF(wif, utxolib.networks.ecash);

        // Specify hash type
        // This should be handled at the utxo-lib level, pending latest published version
        const hashTypes = {
            SIGHASH_ALL: 0x01,
            SIGHASH_FORKID: 0x40,
        };

        txBuilder.sign(
            i, // vin
            utxoECPair, // keyPair
            undefined, // redeemScript
            hashTypes.SIGHASH_ALL | hashTypes.SIGHASH_FORKID, // hashType
            parseInt(utxo.sats), // value - chronik returns 'sats' property (BigInt)
        );
    }

    return txBuilder;
};

module.exports = {
    signUtxosByAddress
};