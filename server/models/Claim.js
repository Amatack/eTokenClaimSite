const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const Claim = new Schema(
    {
        eCashAddress:{
            type: String,
            required:  false,
            trim: true
        },
        userIp:{
            type: String,
            required: true,
            trim: true,
        },
        vpn:{
            type: Boolean,
            required: true,
            trim: true,
        }
    },
    {
        collection: "claim",
        timestamps: true, //TODO createdAt, updatedAt
        versionKey: false
    }
)

const ClaimModel = model("Claim", Claim);

module.exports = ClaimModel;