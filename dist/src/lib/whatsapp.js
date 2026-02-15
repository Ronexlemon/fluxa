"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WasenderClient = void 0;
class WasenderClient {
    apiBaseUrl = "https://www.wasenderapi.com/api";
    token;
    constructor(token) {
        if (!token) {
            throw new Error("Wasender API token is required");
        }
        this.token = token;
    }
    /** Get phone number from LID */
    async getPhoneNumberFromLid(lid) {
        const response = await fetch(`${this.apiBaseUrl}/pn-from-lid/${encodeURIComponent(lid)}`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
            },
        });
        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Wasender LID lookup failed: ${err}`);
        }
        const result = await response.json();
        console.log("The Result is", result);
        // ✅ pn is the correct field
        return result?.pn || result?.data?.pn || null;
    }
    /** Send WhatsApp message using phone number */
    async sendMessage({ phoneNumber, message, }) {
        const response = await fetch(`${this.apiBaseUrl}/send-message`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                to: phoneNumber,
                text: message,
            }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Wasender send-message error: ${errorText}`);
        }
        return response.json();
    }
    /** Resolve LID → phone number → send message */
    async sendMessageFromLid({ lid, message, }) {
        const phoneNumber = await this.getPhoneNumberFromLid(lid);
        return this.sendMessage({
            phoneNumber: phoneNumber,
            message,
        });
    }
}
exports.WasenderClient = WasenderClient;
