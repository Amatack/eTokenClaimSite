function convertXecToSatoshis(xecAmount) {
    // XEC currently uses 2 decimal points
    const ECASH_DECIMALS = 2;
    const amountInSats = xecAmount * 10 ** ECASH_DECIMALS;
    return amountInSats;
}

module.exports.convertXecToSatoshis = convertXecToSatoshis;