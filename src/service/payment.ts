import { Address } from "viem";
import { PaymentHeader, PaymentProcessor } from "../lib/x402";



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

const getXPaymentHeader = async(details:PaymentHeader)=>{
  const result = await processor.requestHeader(details)
  return result
}

export {makePayment,getXPaymentHeader}