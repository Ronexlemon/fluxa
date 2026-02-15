"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWallet = void 0;
const ethers_1 = require("ethers");
const generateWallet = () => {
    const result = ethers_1.Wallet.createRandom();
    return { address: result.address, private_Key: result.privateKey };
};
exports.generateWallet = generateWallet;
