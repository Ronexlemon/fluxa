import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { getAccountdetails } from "./wallet_controller";
import { getWalletByPhoneNumber } from "../service/wallet/wallet";
import { headerDetails, makePayment, reqDetails } from "../service/payment";

const x40PaymentRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { phoneNumber,Amount,toAddress } = req.body ||  {};

    if (!phoneNumber || !Amount || !toAddress) {
      res.status(402).json({
        status: false,
        message: "phoneNumber and Amount is required",
      });
      return;
    }
    const x402Data = {
        phoneNumber:phoneNumber,
        Amount:Amount,
        toAddress:toAddress
    }

    const walletdetails = await getWalletByPhoneNumber(phoneNumber)

    const requirementDetails: reqDetails ={
        payTo:toAddress,
        amount:Amount,
        description_order_Number:"sending usdce"
    }

    const header_Details:headerDetails={
        private_key:walletdetails.privateKey,
        value:Amount,
        to:toAddress
    }

    const result = await makePayment(requirementDetails,header_Details)

    


    res.status(200).json({
      status: true,
      message: "PaymentRequest Successful",
      data: result,
    });
  }
);


export {x40PaymentRequest}