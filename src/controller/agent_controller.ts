import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { getXPaymentHeader, makePayment } from "../service/payment"; // Assuming this handles the stablecoin transfer
interface SettlementConfig {
  req: Request;
  price: string;
  scheme?: "exact" | "upto";
  customResourceUrl?: string;
}
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

import { settlePayment, facilitator,verifyPayment } from "thirdweb/x402";
import { createThirdwebClient } from "thirdweb";
import { avalanche } from "thirdweb/chains";
import { celo } from "viem/chains";

import { getWalletByPhoneNumber } from "../service/wallet/wallet";
import { CeloX402Payment,CeloPaymentService } from "../lib/celox402";
import { decodeSignEncode } from "../lib/sign";
import { THIRDWEB_SECRET_KEY } from "../constants/constant";


const client = createThirdwebClient({
 secretKey: THIRDWEB_SECRET_KEY as string,
});

const thirdwebFacilitator = facilitator({
  client,
  serverWalletAddress: "0xd0Cc0Af5fD30392614560f406C67Efc4D5339c25",
});



const payment = new CeloX402Payment({
  thirdwebSecretKey: THIRDWEB_SECRET_KEY  as string,
 serverWalletAddress: "0xd0Cc0Af5fD30392614560f406C67Efc4D5339c25",
  isTestnet: true, 
});


const settlePaymentController = asyncHandler(
  async (req: Request, res: Response) => {
const { phoneNumber,amount } = req.body ||  {};

    if (!phoneNumber) {
      res.status(402).json({
        status: false,
        message: "phoneNumber is required",
      });
      return;
    }
    

    const walletdetails = await getWalletByPhoneNumber(phoneNumber)
    
 const API_URL = 'http://localhost:3000/api/premium-content';
    const signature = await payment.generateSignature({
     privateKey: walletdetails.privateKey,
    payTo: "0x65e28c9c4ef1a756d8df1c507b7a84efcf606fd4",
    amount: amount,
    resourceUrl: API_URL,
  });
  
 console.log('Header:', signature.headerName);
 console.log('Value:', signature.headerValue.substring(0, 50) + '...');

 const mockReq = {
        ...req,
        headers: {
          ...req.headers,
          [signature.headerName.toLowerCase()]: signature.headerValue,
        },
        protocol: req.protocol,
        get: (header: string) => req.get(header),
        originalUrl: '/api/premium-content',
        method: 'POST',
      } as Request;
 const xPayment =
        (mockReq.headers["payment-signature"] as string) ||
        (mockReq.headers["x-payment"] as string);

        const paymentdata = await decodeSignEncode(xPayment,walletdetails.privateKey)
        console.log("The PaymentData",paymentdata)
        const v = await thirdwebFacilitator.settle({
    payload: paymentdata.payload,       
    scheme: paymentdata.scheme,
    network: paymentdata.network,
    x402Version: paymentdata.x402Version,
  },
  {
    scheme: paymentdata.accepted.scheme,
    network: paymentdata.accepted.network,
    maxAmountRequired: paymentdata.accepted.amount,  
    payTo: paymentdata.accepted.payTo,
    asset: paymentdata.accepted.asset,
    resource: paymentdata.accepted.resource,
    description: '',
    mimeType: '',
    maxTimeoutSeconds: 300,
    extra: {
      name: 'USDC',   
      version: '2',       
      verifyingContract: paymentdata.accepted.asset,
    }
  })
        console.log("The Value of v",v)
        res.status(200).json({message:"Transaction complete",data:v})

  }
);
export { AgentMcpcontroller,settlePaymentController };