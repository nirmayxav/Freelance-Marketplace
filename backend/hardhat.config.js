require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
console.log("Sepolia URL:", process.env.BLOCKCHAIN_RPC);
console.log("Private Key:", process.env.PRIVATE_KEY);


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    ganache: {
      url: "HTTP://127.0.0.1:7545",
      accounts: [
        "2a3054ee02c2eaf3e19db96e8a07596ef352b951fdc822ffefaed7c51f395c17"
      ]
    },
    sepolia: {
      url: process.env.BLOCKCHAIN_RPC || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  solidity: "0.8.28",
};
