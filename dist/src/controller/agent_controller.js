"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentMcpcontroller = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const AgentMcpcontroller = (0, express_async_handler_1.default)(async (req, res) => {
    const { method, params, id } = req.body;
    // 1. Tool Discovery: Tells ChatGPT what this agent can do
    if (method === "list_tools") {
        res.status(200).json({
            id,
            result: {
                tools: [
                    {
                        name: "pay_bill",
                        description: "Executes a USDT/Stablecoin payment for a specific bill or recipient.",
                        inputSchema: {
                            type: "object",
                            properties: {
                                phoneNumber: { type: "string", description: "User's registered phone number" },
                                amount: { type: "string", description: "Amount in USDT (e.g., '50.00')" },
                                recipientAddress: { type: "string", description: "The 0x Ethereum address of the biller" },
                                reason: { type: "string", description: "A memo for the payment" }
                            },
                            required: ["phoneNumber", "amount", "recipientAddress"]
                        }
                    }
                ]
            }
        });
        return;
    }
    // 2. Tool Execution: ChatGPT calls this when it wants to pay a bill
    if (method === "call_tool") {
        const { name, arguments: args } = params;
        if (name === "pay_bill") {
            // Integrate your existing services here
            const result = { hash: "" }; //await makePayment({
            //   phone: args.phoneNumber,
            //   amount: args.amount,
            //   to: args.recipientAddress,
            //   memo: args.reason || "Weekly Bill Payment"
            // });
            res.status(200).json({
                id,
                result: {
                    content: [{ type: "text", text: `Payment of ${args.amount} USDT successful. Tx: ${result.hash}` }],
                    isError: false
                }
            });
            return;
        }
    }
    // Fallback for unknown methods
    res.status(404).json({ id, error: { code: -32601, message: "Method not found" } });
});
exports.AgentMcpcontroller = AgentMcpcontroller;
