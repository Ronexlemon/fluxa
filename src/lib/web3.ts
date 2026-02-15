import { ethers } from "ethers";
import { createPublicClient, formatUnits, http } from 'viem'
import { cronosTestnet } from 'viem/chains'
import { erc20Abi } from "viem";
import { BUSDCE_ADDRESS } from "../constants/constant";
 
export const publicClient = createPublicClient({
  chain: cronosTestnet,
  transport: http()
})

const getBalance = async(address:`0x${string}`)=>{
    const data = await publicClient.readContract({
  address: BUSDCE_ADDRESS,
  abi: erc20Abi,
  functionName: 'balanceOf',
  args: [address]
})
return formatUnits(data,6)
}


const getSigner = (private_Key:string)=>{

    return new ethers.Wallet(private_Key,new ethers.JsonRpcProvider("https://evm-t3.cronos.org"))

}


export {getSigner,getBalance}