import {Wallet} from "ethers"

interface WalletDetails{
    address :string,
    private_Key: string
}


const generateWallet = ():WalletDetails=>{
    const result = Wallet.createRandom()
    return {address:result.address,private_Key:result.privateKey}
    
}


export {generateWallet}