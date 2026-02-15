import { Address } from "viem";
import { PaymentProcessor } from "../lib/x402";



export type reqDetails = {
  payTo: string,
  amount: string,
  description_order_Number: string
};

export type headerDetails = {
  to: string,
  value: string,
  private_key: string
};

const processor = new PaymentProcessor();

const makePayment = async(req_details:reqDetails,header_Details:headerDetails)=>{

    const result = await processor.verifyResponse(req_details,header_Details);

console.log(result);
return result
}

export {makePayment}