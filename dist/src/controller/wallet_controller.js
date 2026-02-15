"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAccount = exports.getAccountdetails = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const wallet_1 = require("../service/wallet/wallet");
const CreateAccount = (0, express_async_handler_1.default)(async (req, res) => {
    const { phoneNumber } = req.body || {};
    try {
        if (!phoneNumber) {
            res.status(400).json({ status: false, message: "phoneNumber is required" });
            return;
        }
        const walletExists = await (0, wallet_1.isWalletExits)(phoneNumber);
        if (walletExists) {
            res.status(400).json({
                status: false,
                message: "Wallet with this phone number already exists",
            });
            return;
        }
        const accountDetails = await (0, wallet_1.createWallet)(phoneNumber);
        const { privateKey, ...safeAccountDetails } = accountDetails;
        res.status(201).json({
            status: true,
            message: "Wallet created successfully",
            data: safeAccountDetails,
        });
    }
    catch (err) {
        res.status(500).json({
            status: true,
            message: "Failed to create Account",
        });
    }
});
exports.CreateAccount = CreateAccount;
const getAccountdetails = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { phoneNumber } = req.body || {};
        if (!phoneNumber) {
            res.status(400).json({
                status: false,
                message: "phoneNumber is required",
            });
            return;
        }
        const details = await (0, wallet_1.getWalletByPhoneNumber)(phoneNumber);
        if (!details) {
            res.status(404).json({
                status: false,
                message: "Wallet account not found",
            });
            return;
        }
        res.status(200).json({
            status: true,
            message: "Wallet details fetched successfully",
            data: details,
        });
    }
    catch (error) {
        console.error("getAccountdetails error:", error);
        res.status(500).json({
            status: false,
            message: "Internal server error",
        });
    }
});
exports.getAccountdetails = getAccountdetails;
