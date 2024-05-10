const bip39 = require("bip39")
const ecc = require('tiny-secp256k1');
const {BIP32Factory} = require('bip32');
const { ChronikClient } = require('chronik-client');
const utxolib = require('@bitgo/utxo-lib');
const ecashaddrjs = require('ecashaddrjs')

const { chronikInstance,phrase, tokenId , userAmount} = require("../configs/constants.js")
const {addDot} = require("../utils/addDot.js")
const {deriveWallet} =require("../utils/deriveWallet.js")
const {getUtxosFromAddress} =require("../utils/getUtxosFromAddress.js")
const {parseChronikUtxos} = require('../utils/utils.js');


const getEtokenInfo = async(req, res) =>{
    try {
        const {fromString} = await import('uint8arrays');
        const chronik = new ChronikClient(chronikInstance);
        const derivationPath = "m/44'/1899'/0'/0/0";
        const bip32 = BIP32Factory(ecc);
        console.log("phrase: ", phrase)
        const seedBuffer = bip39.mnemonicToSeedSync(phrase)
        const masterKey = bip32.fromSeed(seedBuffer)
        const publicKey = masterKey.derivePath(derivationPath)
        const legacyAddress = utxolib.payments.p2pkh({ pubkey: publicKey.publicKey }).address;

        const hash = utxolib.address.fromBase58Check(legacyAddress).hash.toString('hex')
        const uint8array = fromString(hash, 'hex')

        const senderAddress = ecashaddrjs.encode("ecash", "P2PKH" , uint8array)
        console.log("senderAddress: ", senderAddress)
        const wallet = await deriveWallet(
            phrase,
            derivationPath,
            senderAddress,
        );

        const combinedUtxos = await getUtxosFromAddress(
            chronik,
            wallet.address,
        );

        const parsedUtxos = parseChronikUtxos(combinedUtxos);
        const nonSlpUtxos = parsedUtxos.xecUtxos;
        const slpUtxos = parsedUtxos.slpUtxos

        console.log("slpUtxos: ",slpUtxos)

        const tokenInfo = await chronik.token(tokenId)
        const decimals = tokenInfo.slpTxData.genesisInfo.decimals
        
        let slpUtxosFiltered = slpUtxos.filter(object => object.slpMeta.tokenId === tokenId);

        // slp Utxos from Faucet rewards
        console.log("slpUtxos From FaucetToken: ",slpUtxosFiltered);


        let amount = slpUtxosFiltered.reduce((acumulador, object) => acumulador + Number(object.slpToken.amount), 0);
        
        let amountWithDot = addDot(amount, decimals)

        return res.status(200).json({
            "availableTokens": amountWithDot,
            "tokenName": tokenInfo.slpTxData.genesisInfo.tokenName,
            "tokenTicker": tokenInfo.slpTxData.genesisInfo.tokenTicker,
            "tokenId": tokenId,
            
        })
    
    } catch (error) {
        console.log(error)
        res.status(503).json(error)
    }
}

module.exports = getEtokenInfo;