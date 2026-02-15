"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.x40PaymentRequest = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const wallet_1 = require("../service/wallet/wallet");
const payment_1 = require("../service/payment");
const x40PaymentRequest = (0, express_async_handler_1.default)(async (req, res) => {
    const { phoneNumber, Amount, toAddress } = req.body || {};
    if (!phoneNumber || !Amount || !toAddress) {
        res.status(402).json({
            status: false,
            message: "phoneNumber and Amount is required",
        });
        return;
    }
    const x402Data = {
        phoneNumber: phoneNumber,
        Amount: Amount,
        toAddress: toAddress
    };
    const walletdetails = await (0, wallet_1.getWalletByPhoneNumber)(phoneNumber);
    const requirementDetails = {
        payTo: toAddress,
        amount: Amount,
        description_order_Number: "sending usdce"
    };
    const header_Details = {
        private_key: walletdetails.privateKey,
        value: Amount,
        to: toAddress
    };
    const result = await (0, payment_1.makePayment)(requirementDetails, header_Details);
    res.status(200).json({
        status: true,
        message: "PaymentRequest Successful",
        data: result,
    });
});
exports.x40PaymentRequest = x40PaymentRequest;
