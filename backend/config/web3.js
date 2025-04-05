const { ethers } = require("ethers");
require("dotenv").config();
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.CRYPTO_PRIVATE_KEY, provider);
module.exports = { ethers, provider, wallet };