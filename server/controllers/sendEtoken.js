const { ChronikClient } = require('chronik-client');
const utxolib = require('@bitgo/utxo-lib');
const ecashaddr = require('ecashaddrjs')
const { coinSelect } = require('ecash-coinselect');
const { getUtxosFromAddress } = require('../utils/getUtxosFromAddress');
const {convertXecToSatoshis } = require('../utils/convertXecToSatoshis')

const {amountOfXec, chronikInstance,log, senderAddress, phrase, tokenId, amountOfEtoken, active} = require('../configs/constants.js')

const {deriveWallet} = require('../utils/deriveWallet.js');
const ClaimModel = require('../models/Claim');
const {
    generateTokenTxInput,
    generateTokenTxOutput,
    signAndBuildTx,
    parseChronikUtxos,
} = require('../utils/utils.js');

const HASHTYPES = {
    SIGHASH_ALL: 0x01,
    SIGHASH_FORKID: 0x40,
};


const sendEtoken = async (req, res) =>{
    try {
        
        const {userAddress} = req.body
        
        const clientIp = req.ip
        const foundClaimAddress = await ClaimModel.findOne({eCashAddress: userAddress})

        if(active === "OFF"){
            res.status(400).json({
                message: "Sorry, the claim period for this coupon is over.",
                error: true
            })
            return
        }

        if(foundClaimAddress){
            if(foundClaimAddress.vpn === false){
                res.status(401).json({
                    message: "Someone has already claimed from this eCash Address",
                    error: true
                })
            }else{
                res.status(401).json({
                    message: "Using VPN is not allowed to claim",
                    error: true
                })
            }
            return
        }

        const foundClaim = await ClaimModel.findOne({userIp: clientIp})

        if(foundClaim){
            res.status(401).json({
                message: "Someone has already claimed from this IP",
                error: true
            })
            return
        }
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
            amountOfEtoken: String(amountOfEtoken/100),
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
            tokenObj.amountOfEtoken,
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
            tokenObj.amountOfEtoken,
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

    
            // In JS, Number.MAX_SAFE_INTEGER = 9007199254740991. Since total supply of
            // satoshis in eCash is 2100000000000000, it is safe to use JS native numbers
    
            // Initialize the bitgo transaction builder to the XEC network
            // which will be used to build and sign the transaction
            let txBuilder2 = utxolib.bitgo.createTransactionBuilderForNetwork(
                utxolib.networks.ecash,
            );
    
            // ** Part 1 - Convert user input into satoshis **
    
            // Convert the XEC amount to satoshis
            // Note: 'Number' type is used throughout this example in favour
            // of BigInt as XEC amounts can have decimals
            let sendAmountInSats = convertXecToSatoshis(amountOfXec);
    
            // ** Part 2. Extract the sending wallet's XEC utxos **
                log("wallet.address: ",wallet.address)
            // Retrieve the sending wallet's XEC + SLP utxos using the function from the getUtxosFromAddress.js example
            const combinedUtxos2 = await getUtxosFromAddress(
                chronik,
                wallet.address,
            );
    
            // The eCash utxos are in the first element of the response (combinedUtxos) from Chronik
            // This is due to chronik.script().utxos() returning:
            // a) an empty array if there are no utxos at the address; or
            // b) an array of one object with the key 'utxos' if there are utxos
            const { utxos } = combinedUtxos2[0];
            log("combinedUtxos2: " ,combinedUtxos2)
            // ** Part 3. Collect enough XEC utxos (tx inputs) to pay for sendAmountInSats + fees **
    
            // Define the recipients (i.e. outputs) of this tx and the amounts in sats
            // In this case, we have only one targetOutput. coinSelect accepts an array input.
            const targetOutputs = [
                {
                    value: sendAmountInSats,
                    address: userAddress,
                },
            ];
    
            // Call on ecash-coinselect to select enough XEC utxos and outputs inclusive of change
            let { inputs, outputs } = coinSelect(utxos, targetOutputs);
            log("inputs: ",inputs)
            // Add the selected xec utxos to the tx builder as inputs
            for (const input of inputs) {
                txBuilder2.addInput(input.outpoint.txid, input.outpoint.outIdx);
            }
    
            // ** Part 4. Generate the tx outputs **
    
            for (const output of outputs) {
                if (!output.address) {
                    // Note that you may now have a change output with no specified address
                    // This is expected behavior of coinSelect
                    // User provides target output, coinSelect adds change output if necessary (with no address key)
    
                    // Change address is wallet address
                    output.address = wallet.address;
                }
    
                txBuilder2.addOutput(
                    // utxo-lib's txBuilder currently only interacts with the legacy address
                    // TODO add cashaddr support for eCash to txBuilder in utxo-lib
                    ecashaddr.toLegacy(output.address),
                    output.value,
                );
            }
    
            // ** Part 5. Sign the transaction **
    
            // Extract the key pair based on the wallet wif
            const utxoECPair = utxolib.ECPair.fromWIF(
                wallet.fundingWif,
                utxolib.networks.ecash,
            );
    
            // Loop through all the collected XEC input utxos
            for (let i = 0; i < inputs.length; i++) {
                const thisUtxo = inputs[i];
    
                // Sign this tx
                txBuilder2.sign(
                    i, // vin
                    utxoECPair, // keyPair
                    undefined, // redeemScript, typically used for P2SH addresses
                    HASHTYPES.SIGHASH_ALL | HASHTYPES.SIGHASH_FORKID, // hashType
                    parseInt(thisUtxo.value), // value of this single utxo
                );
            }
    
            // ** Part 6. Build the transaction **
    
            const tx = txBuilder2.build();
            // Convert to raw hex for use in chronik
            const hex = tx.toHex();
    
            // ** Part 7. Broadcast raw hex to the network via chronik **
    
            // Example successful chronik.broadcastTx() response:
            //    {"txid":"0075130c9ecb342b5162bb1a8a870e69c935ea0c9b2353a967cda404401acf19"}
            const response = await chronik.broadcastTx(hex);
            if (!response) {
                throw new Error('sendXec(): Empty chronik broadcast response');
            }

            const claim = {
                eCashAddress: String(userAddress),
                userIp: req.ip,
                vpn: false
            }
    
            const newClaim = new ClaimModel(claim)
            await newClaim.save()
            broadcastResponse.txid2 = response.txid
            res.status(200).json(broadcastResponse)
        } catch (err) {
            log('Error broadcasting tx to chronik client');
            res.status(503).json({"error": String(err)})
        }
    
        
}

module.exports = sendEtoken;