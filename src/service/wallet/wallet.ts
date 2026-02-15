
import crypto from "crypto";
import { prisma } from "../../config/prisma";
import { generateWallet } from "../../hooks/wallet";

const createWallet = async (phoneNumber: string) => {

  const { address, private_Key } = generateWallet();

  const wallet = await prisma.wallet.create({
    data: {
      phoneNumber:phoneNumber.toLowerCase(),
      address:address.toLowerCase(),
      privateKey:private_Key.toLowerCase(),
    },
  });

  return wallet;
};

const isWalletExits = async(phoneNumber:string)=>{
  const existing = await prisma.wallet.findUnique({
    where: { phoneNumber },
  });
  return !!existing


}


const getWalletByPhoneNumber = async (phoneNumber: string) => {
  const wallet = await prisma.wallet.findUnique({
    where: { phoneNumber },
  });

  if (!wallet) {
    throw new Error(`Wallet not found for ${phoneNumber}`);
  }

  return wallet;
};


 const deleteWalletByPhoneNumber = async (phoneNumber: string) => {
  const wallet = await prisma.wallet.delete({
    where: { phoneNumber },
  });

  return wallet;
};

export {createWallet,getWalletByPhoneNumber,deleteWalletByPhoneNumber,isWalletExits}