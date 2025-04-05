const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Get ABI
const contractJson = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../artifacts/contracts/ReviewContract.sol/ReviewContract.json")
  )
);
const contractABI = contractJson.abi;
const contractAddress = process.env.REVIEW_CONTRACT_ADDRESS;

const reviewContract = new ethers.Contract(contractAddress, contractABI, signer);

module.exports = { reviewContract };
