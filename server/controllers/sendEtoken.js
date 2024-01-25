const { ChronikClient } = require('chronik-client');
const utxolib = require('@bitgo/utxo-lib');
const { getUtxosFromAddress } = require('../utils/getUtxosFromAddress');

const {chronikInstance,log, senderAddress, phrase, tokenId, userAmount} = require('../configs/constants.js')

const {
    generateTokenTxInput,
    generateTokenTxOutput,
    signAndBuildTx,
    parseChronikUtxos,
} = require('../utils/utils.js');

const {deriveWallet} = require('../utils/deriveWallet.js');
const ClaimModel = require('../models/Claim');


const sendEtoken = async (req, res) =>{
    try {
        
        const {userAddress} = req.body
        
        // Prepare the wallet that will send the token
        // Retrieve XEC and SLP utxos from wallet

        const derivationPath = "m/44'/1899'/0'/0/0";
        //const derivationPath = "m/44'/145'/0'/0"

        // Derive wallet object containing the funding wif to sign txs
        const wallet = await deriveWallet(
            phrase,
            derivationPath,
            senderAddress,
        );
        
        const tokenObj = {
            tokenId,
            userAmount,
            tokenReceiverAddress: userAddress,
        }

        // Instantiate chronik-client
        const chronik = new ChronikClient(chronikInstance);

        const combinedUtxos = await getUtxosFromAddress(
            chronik,
            wallet.address,
        );
        const parsedUtxos = parseChronikUtxos(combinedUtxos);
        const nonSlpUtxos = parsedUtxos.xecUtxos;
        const slpUtxos = parsedUtxos.slpUtxos
        
        // Initialize the bitgo transaction builder to the XEC network
        // which will be used to build and sign the transaction
        let txBuilder = utxolib.bitgo.createTransactionBuilderForNetwork(
            utxolib.networks.ecash,
        );
        
        let tokenTxInputObj = generateTokenTxInput(
            'SEND',
            nonSlpUtxos,
            slpUtxos,
            tokenObj.tokenId,
            tokenObj.userAmount,
            2.01, // default fee
            txBuilder,
        );
        // update txBuilder object with inputs
        txBuilder = tokenTxInputObj.txBuilder;

        let tokenTxOutputObj = generateTokenTxOutput(
            txBuilder,
            'SEND',
            wallet.address,
            tokenTxInputObj.inputTokenUtxos,
            tokenTxInputObj.remainderXecValue,
            null, // token config object - for GENESIS tx only
            tokenObj.tokenReceiverAddress,
            tokenObj.userAmount,
        );
        // update txBuilder object with outputs
        txBuilder = tokenTxOutputObj;
        
        // append the token input UTXOs to the array of XEC input UTXOs for signing
        const combinedInputUtxos = tokenTxInputObj.inputXecUtxos.concat(
            tokenTxInputObj.inputTokenUtxos,
        );
        
    const rawTxHex = signAndBuildTx(combinedInputUtxos, txBuilder, wallet);
    
    // Broadcast transaction to the network via the chronik client
    // sample chronik.broadcastTx() response:
    //    {"txid":"0075130c9ecb342b5162bb1a8a870e69c935ea0c9b2353a967cda404401acf19"}
        let broadcastResponse;
    
        broadcastResponse = await chronik.broadcastTx(
            rawTxHex,
            false, // skipSlpCheck to bypass chronik safety mechanism in place to avoid accidental burns
        );
        if (!broadcastResponse) {
            throw new Error('Empty chronik broadcast response');
        }

        const claim = {
            eCashAddress: String(userAddress),
            userIp: req.ip
        }

        const newClaim = new ClaimModel(claim)
        log('newClaim: ', newClaim)
        await newClaim.save()

        res.status(200).json(broadcastResponse)
    } catch (err) {
        log('Error broadcasting tx to chronik client');
        res.status(503).json({"error": String(err)})
    }

}

module.exports = sendEtoken;