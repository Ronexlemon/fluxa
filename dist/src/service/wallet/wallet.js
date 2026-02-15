"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWalletExits = exports.deleteWalletByPhoneNumber = exports.getWalletByPhoneNumber = exports.createWallet = void 0;
const prisma_1 = require("../../config/prisma");
const wallet_1 = require("../../hooks/wallet");
const createWallet = async (phoneNumber) => {
    const { address, private_Key } = (0, wallet_1.generateWallet)();
    const wallet = await prisma_1.prisma.wallet.create({
        data: {
            phoneNumber: phoneNumber.toLowerCase(),
            address: address.toLowerCase(),
            privateKey: private_Key.toLowerCase(),
        },
    });
    return wallet;
};
exports.createWallet = createWallet;
const isWalletExits = async (phoneNumber) => {
    const existing = await prisma_1.prisma.wallet.findUnique({
        where: { phoneNumber },
    });
    return !!existing;
};
exports.isWalletExits = isWalletExits;
const getWalletByPhoneNumber = async (phoneNumber) => {
    const wallet = await prisma_1.prisma.wallet.findUnique({
        where: { phoneNumber },
    });
    if (!wallet) {
        throw new Error(`Wallet not found for ${phoneNumber}`);
    }
    return wallet;
};
exports.getWalletByPhoneNumber = getWalletByPhoneNumber;
const deleteWalletByPhoneNumber = async (phoneNumber) => {
    const wallet = await prisma_1.prisma.wallet.delete({
        where: { phoneNumber },
    });
    return wallet;
};
exports.deleteWalletByPhoneNumber = deleteWalletByPhoneNumber;
