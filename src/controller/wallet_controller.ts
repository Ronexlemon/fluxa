import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { createWallet, getWalletByPhoneNumber, isWalletExits } from "../service/wallet/wallet";



const CreateAccount = asyncHandler(async(req:Request,res:Response)=>{

    const {phoneNumber} = req.body ||  {}
    try{
        if(!phoneNumber){
            res.status(400).json({status:false,message:"phoneNumber is required"})
            return
        }
        const walletExists = await isWalletExits(phoneNumber)
       if (walletExists) {
  res.status(400).json({
    status: false,
    message: "Wallet with this phone number already exists",
  });
  return;
}

        const accountDetails = await createWallet(phoneNumber);
        const { privateKey, ...safeAccountDetails } = accountDetails;
        res.status(201).json({
      status: true,
      message: "Wallet created successfully",
      data: safeAccountDetails,
    });


    }catch(err:any){
        res.status(500).json({
      status: true,
      message: "Failed to create Account",
      
    });


    }

})


const getAccountdetails = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { phoneNumber } = req.body || {};

      if (!phoneNumber) {
        res.status(400).json({
          status: false,
          message: "phoneNumber is required",
        });
        return;
      }

      const details = await getWalletByPhoneNumber(phoneNumber);

      if (!details) {
        res.status(404).json({
          status: false,
          message: "Wallet account not found",
        });
        return;
      }

      res.status(200).json({
        status: true,
        message: "Wallet details fetched successfully",
        data: details,
      });
    } catch (error) {
      console.error("getAccountdetails error:", error);

      res.status(500).json({
        status: false,
        message: "Internal server error",
      });
    }
  }
);



export {getAccountdetails,CreateAccount}