"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makePayment = void 0;
const x402_1 = require("../lib/x402");
const processor = new x402_1.PaymentProcessor();
const makePayment = async (req_details, header_Details) => {
    const result = await processor.verifyResponse(req_details, header_Details);
    console.log(result);
    return result;
};
exports.makePayment = makePayment;
