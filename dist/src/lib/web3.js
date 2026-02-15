"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBalance = exports.getSigner = exports.publicClient = void 0;
const ethers_1 = require("ethers");
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const viem_2 = require("viem");
const constant_1 = require("../constants/constant");
exports.publicClient = (0, viem_1.createPublicClient)({
    chain: chains_1.cronosTestnet,
    transport: (0, viem_1.http)()
});
const getBalance = async (address) => {
    const data = await exports.publicClient.readContract({
        address: constant_1.BUSDCE_ADDRESS,
        abi: viem_2.erc20Abi,
        functionName: 'balanceOf',
        args: [address]
    });
    return (0, viem_1.formatUnits)(data, 6);
};
exports.getBalance = getBalance;
const getSigner = (private_Key) => {
    return new ethers_1.ethers.Wallet(private_Key, new ethers_1.ethers.JsonRpcProvider("https://evm-t3.cronos.org"));
};
exports.getSigner = getSigner;
