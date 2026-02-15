"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProcessor = void 0;
const facilitator_client_1 = require("@crypto.com/facilitator-client");
const web3_1 = require("./web3");
const facilitator = new facilitator_client_1.Facilitator({
    network: facilitator_client_1.CronosNetwork.CronosTestnet
});
const generateRequirements = (details) => {
    const requirements = facilitator.generatePaymentRequirements({
        payTo: details.payTo,
        description: `Payment for Order #: ${details.description_order_Number}`,
        maxAmountRequired: details.amount
    });
    return requirements;
};
const requestHeader = async (details) => {
    const signer = (0, web3_1.getSigner)(details.private_key);
    const header = await facilitator.generatePaymentHeader({
        to: details.to,
        value: details.value,
        signer: signer,
        validBefore: Math.floor(Date.now() / 1000) + 600,
    });
    return header;
};
const getBody = async (requirementDetails, headerDetails) => {
    const require_ments = generateRequirements(requirementDetails);
    const header_response = await requestHeader(headerDetails);
    return facilitator.buildVerifyRequest(header_response, require_ments);
};
const verifyResponse = async (requirementDetails, headerDetails) => {
    const body = await getBody(requirementDetails, headerDetails);
    const response = await facilitator.verifyPayment(body);
    return response;
};
const settlePayment = async (requirementDetails, headerDetails) => {
    const body = await getBody(requirementDetails, headerDetails);
    const settlementResponse = await facilitator.settlePayment(body);
    return settlePayment;
};
class PaymentProcessor {
    facilitator;
    constructor() {
        this.facilitator = new facilitator_client_1.Facilitator({
            network: facilitator_client_1.CronosNetwork.CronosTestnet,
        });
    }
    generateRequirements(details) {
        return this.facilitator.generatePaymentRequirements({
            payTo: details.payTo,
            description: `Payment for Order #: ${details.description_order_Number}`,
            maxAmountRequired: details.amount,
        });
    }
    async requestHeader(details) {
        const signer = (0, web3_1.getSigner)(details.private_key);
        return await this.facilitator.generatePaymentHeader({
            to: details.to,
            value: details.value,
            signer,
            validBefore: Math.floor(Date.now() / 1000) + 600,
        });
    }
    async getBody(requirementDetails, headerDetails) {
        const requirements = this.generateRequirements(requirementDetails);
        const header = await this.requestHeader(headerDetails);
        return this.facilitator.buildVerifyRequest(header, requirements);
    }
    async verifyResponse(requirementDetails, headerDetails) {
        const body = await this.getBody(requirementDetails, headerDetails);
        const response = await this.facilitator.verifyPayment(body);
        if (response.isValid) {
            return await this.settlePayment(requirementDetails, headerDetails);
        }
        return response;
    }
    async settlePayment(requirementDetails, headerDetails) {
        const body = await this.getBody(requirementDetails, headerDetails);
        const settlementResponse = await this.facilitator.settlePayment(body);
        return settlementResponse;
    }
}
exports.PaymentProcessor = PaymentProcessor;
