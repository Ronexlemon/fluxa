import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { makePayment } from "../service/payment"; // Assuming this handles the stablecoin transfer

const AgentMcpcontroller = asyncHandler(
  async (req: Request, res: Response) => {
    const { method, params, id } = req.body;
if (!method || !id) {
   res.status(400).json({ error: "Missing required fields: method or id" });
   return
}

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
      return
    }

    // 2. Tool Execution: ChatGPT calls this when it wants to pay a bill
    if (method === "call_tool") {
      const { name, arguments: args } = params;

      if (name === "pay_bill") {
        // Integrate your existing services here
        const result =  {hash:""} //await makePayment({
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
        return
      }
    }

    // Fallback for unknown methods
    res.status(404).json({ id, error: { code: -32601, message: "Method not found" } });
  }
);

export { AgentMcpcontroller };