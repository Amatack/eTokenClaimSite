const bip39 = require("bip39")
const ecc = require('tiny-secp256k1');
const {BIP32Factory} = require('bip32');
const { ChronikClient } = require('chronik-client');
const utxolib = require('@bitgo/utxo-lib');
const ecashaddrjs = require('ecashaddrjs')

const { chronikInstances,phrase, tokenId } = require("../configs/constants.js")
const {addDot} = require("../utils/addDot.js")
const {deriveWallet} =require("../utils/deriveWallet.js")
const {getUtxosFromAddress} =require("../utils/getUtxosFromAddress.js")
const {parseChronikUtxos} = require('../utils/utils.js');


const getEtokenInfo = async(req, res) =>{
    try {
        const {fromString} = await import('uint8arrays');
        const chronikInstancesArray = chronikInstances.split(' ')
        const chronik = new ChronikClient(chronikInstancesArray);
        const derivationPath = "m/44'/1899'/0'/0/0";
        const bip32 = BIP32Factory(ecc);
        const seedBuffer = bip39.mnemonicToSeedSync(phrase)
        const masterKey = bip32.fromSeed(seedBuffer)
        const publicKey = masterKey.derivePath(derivationPath)
        const legacyAddress = utxolib.payments.p2pkh({ pubkey: publicKey.publicKey }).address;

        const hash = utxolib.address.fromBase58Check(legacyAddress).hash.toString('hex')
        const uint8array = fromString(hash, 'hex')

        const senderAddress = ecashaddrjs.encode("ecash", "P2PKH" , uint8array)
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


        const tokenInfo = await chronik.token(tokenId)
        const decimals = tokenInfo.genesisInfo.decimals
        
        let slpUtxosFiltered = slpUtxos.filter(object =>{ 
            return object.token.tokenId === tokenId
        });

        // slp Utxos from Faucet rewards


        let amount = slpUtxosFiltered.reduce((acumulador, object) => acumulador + Number(object.token.atoms), 0);
        let amountWithDot = addDot(amount, decimals)

        return res.status(200).json({
            "availableTokens": amountWithDot,
            "tokenName": tokenInfo.genesisInfo.tokenName,
            "tokenTicker": tokenInfo.genesisInfo.tokenTicker,
            "tokenId": tokenId,
            
        })
    
    } catch (error) {
        console.error(error)
        res.status(503).json(error)
    }
}

module.exports = getEtokenInfo;