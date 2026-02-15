"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountBalance = exports.getAccountDetails = exports.createAccountViaApi = void 0;
exports.callPaymentAPI = callPaymentAPI;
const constant_1 = require("../constants/constant");
const web3_1 = require("./web3");
const createAccountViaApi = async (phoneNumber) => {
    const response = await fetch(`${constant_1.SENDIO_BASE_URL}/api/account/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
    });
    return response.json();
};
exports.createAccountViaApi = createAccountViaApi;
const getAccountDetails = async (phoneNumber) => {
    const response = await fetch(`${constant_1.SENDIO_BASE_URL}/api/account/details`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
    });
    return response.json();
};
exports.getAccountDetails = getAccountDetails;
const getAccountBalance = async (phoneNumber) => {
    const response = await fetch(`${constant_1.SENDIO_BASE_URL}/api/account/details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
    });
    if (!response.ok) {
        return ("Failed to fetch account details");
    }
    const result = await response.json();
    if (!result?.data?.address) {
        return ("Wallet address not found");
    }
    return await (0, web3_1.getBalance)(result.data.address);
};
exports.getAccountBalance = getAccountBalance;
async function callPaymentAPI(phoneNumber, amount, toAddress) {
    console.log("The Address", toAddress);
    toAddress = String(toAddress).trim();
    // Remove leading slash if it exists
    if (toAddress.startsWith("/")) {
        toAddress = toAddress.slice(1);
    }
    // Basic validation for address format (Cronos/EVM)
    if (!toAddress.startsWith("0x") || toAddress.length !== 42) {
        throw new Error("Invalid toAddress. Please use a valid wallet address.");
    }
    const res = await fetch(`${constant_1.SENDIO_BASE_URL}/api/x402/Request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            phoneNumber,
            Amount: amount,
            toAddress,
        }),
    });
    // Prevent JSON parse errors if API returns HTML
    const text = await res.text();
    if (!res.ok) {
        throw new Error(`API Error: ${text}`);
    }
    return JSON.parse(text);
}
