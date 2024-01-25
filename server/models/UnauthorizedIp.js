const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const UnauthorizedIp = new Schema(
    {
        userIp:{
            type: String,
            required:  true,
            trim: true
        },
    },
    {
        collection: "unauthorizedIp",
        timestamps: true, //TODO createdAt, updatedAt
        versionKey: false
    }
)

const UnauthorizedIpModel = model("UnauthorizedIp", UnauthorizedIp)
module.exports = UnauthorizedIpModel