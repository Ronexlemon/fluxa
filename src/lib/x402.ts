import { Facilitator,CronosNetwork } from "@crypto.com/facilitator-client";
import { getSigner } from "./web3";


interface PaymentRequirements{
    payTo: string,
    amount:string,
    description_order_Number?:string
}
interface PaymentHeader{
    to:string,
    value:string,
    private_key:string
}
const facilitator = new Facilitator({
    network:CronosNetwork.CronosTestnet
})


const generateRequirements = (details:PaymentRequirements)=>{
    const requirements = facilitator.generatePaymentRequirements({
        payTo:details.payTo,
        description:`Payment for Order #: ${details.description_order_Number}`,
        maxAmountRequired:details.amount
    })
    return requirements
}


const requestHeader =async (details:PaymentHeader)=>{
    const signer = getSigner(details.private_key);
    const header = await facilitator.generatePaymentHeader({
        to: details.to,
        value: details.value,
        signer:signer,
        validBefore: Math.floor(Date.now()/ 1000) + 600,
    })

    return header;

}

const getBody =async(requirementDetails:PaymentRequirements,headerDetails:PaymentHeader)=>{

    const require_ments = generateRequirements(requirementDetails)

    const header_response = await requestHeader(headerDetails)
    return facilitator.buildVerifyRequest(header_response,require_ments)

}


const verifyResponse = async(requirementDetails:PaymentRequirements,headerDetails:PaymentHeader)=>{
    const body = await getBody(requirementDetails,headerDetails)
    const response  = await facilitator.verifyPayment(body)
    return response;
}


const settlePayment = async(requirementDetails:PaymentRequirements,headerDetails:PaymentHeader)=>{
   const body = await getBody(requirementDetails,headerDetails)
   const settlementResponse = await facilitator.settlePayment(body)

   return settlePayment

    
}





class PaymentProcessor {
  facilitator: Facilitator;

  constructor() {
    this.facilitator = new Facilitator({
      network: CronosNetwork.CronosTestnet,
    });
  }

  generateRequirements(details: PaymentRequirements) {
    return this.facilitator.generatePaymentRequirements({
      payTo: details.payTo,
      description: `Payment for Order #: ${details.description_order_Number}`,
      maxAmountRequired: details.amount,
    });
  }

  async requestHeader(details: PaymentHeader) {
    const signer = getSigner(details.private_key);
    return await this.facilitator.generatePaymentHeader({
      to: details.to,
      value: details.value,
      signer,
      validBefore: Math.floor(Date.now() / 1000) + 600,
    });
  }

  async getBody(
    requirementDetails: PaymentRequirements,
    headerDetails: PaymentHeader
  ) {
    const requirements = this.generateRequirements(requirementDetails);
    const header = await this.requestHeader(headerDetails);

    return this.facilitator.buildVerifyRequest(header, requirements);
  }

  async verifyResponse(
    requirementDetails: PaymentRequirements,
    headerDetails: PaymentHeader
  ) {
    const body = await this.getBody(requirementDetails, headerDetails);
    const response = await this.facilitator.verifyPayment(body);

    if (response.isValid) {
      return await this.settlePayment(requirementDetails, headerDetails);
    }

    return response;
  }

  async settlePayment(
    requirementDetails: PaymentRequirements,
    headerDetails: PaymentHeader
  ) {
    const body = await this.getBody(requirementDetails, headerDetails);
    const settlementResponse = await this.facilitator.settlePayment(body);

    return settlementResponse;
  }
}

export  {PaymentProcessor};
