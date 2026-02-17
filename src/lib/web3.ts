import { ethers } from "ethers";
import { createPublicClient, formatUnits, http } from 'viem'
import { celoSepolia, cronosTestnet } from 'viem/chains'
import { erc20Abi } from "viem";
import { BUSDCE_ADDRESS } from "../constants/constant";
 
export const publicClient = createPublicClient({
  chain: cronosTestnet,
  transport: http()
})

export const celoPublicClient = createPublicClient({
  chain: celoSepolia,
  transport: http()
})

const CELOUSDCAddress = "0x01C5C0122039549AD1493B8220cABEdD739BC44E"

const getBalance = async(address:`0x${string}`)=>{
    const data = await publicClient.readContract({
  address: BUSDCE_ADDRESS,
  abi: erc20Abi,
  functionName: 'balanceOf',
  args: [address]
})
return formatUnits(data,6)
}


const getCeloBalance = async(address:`0x${string}`)=>{
    const data = await celoPublicClient.readContract({
  address: CELOUSDCAddress,
  abi: erc20Abi,
  functionName: 'balanceOf',
  args: [address]
})
return formatUnits(data,6)
}


const getSigner = (private_Key:string)=>{

    return new ethers.Wallet(private_Key,new ethers.JsonRpcProvider("https://evm-t3.cronos.org"))

}


export {getSigner,getBalance,getCeloBalance}