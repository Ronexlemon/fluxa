import { createWalletClient, Hash, Hex, http, parseUnits, publicActions } from 'viem';
import { Address, privateKeyToAccount } from "viem/accounts";
import { base,celoSepolia, sepolia } from 'viem/chains';
import { BlockchainAdapter, ERC8004Client, EthersAdapter } from 'erc-8004-js'; // Official 2026 SDK
import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import axios from 'axios';

dotenv.config();

class ViemAdapter implements BlockchainAdapter {
  constructor(
    private publicClient: any, 
    private walletClient: any, 
    private account: any
  ) {}

  async getAddress(): Promise<string> {
    return this.account.address;
  }

  async getChainId(): Promise<number> {
    return await this.publicClient.getChainId();
  }

  // Maps to Viem's readContract or simple call
  async call(contractAddress: string, abi: any, functionName: string, args: any[]): Promise<any> {
    return await this.publicClient.readContract({
      address: contractAddress as Address,
      abi,
      functionName,
      args,
    });
  }

  // Maps to Viem's writeContract (send transaction)
  async send(contractAddress: string, abi: any[], functionName: string, args: any[]): Promise<any> {
    const hash = await this.walletClient.writeContract({
      address: contractAddress as Address,
      abi,
      functionName,
      args,
      account: this.account,
    });
    // The SDK often expects the transaction to be mined for Identity/Reputation
    await this.publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  // Required for Reputation feedback and Validation proofs
  async signMessage(message: string | Uint8Array): Promise<Hex> {
    return await this.walletClient.signMessage({
      account: this.account,
      message: typeof message === 'string' ? message : { raw: message },
    });
  }

  // Required for EIP-712 structured data (standard in 2026 for trustless handshakes)
 async signTypedData(
    domain: any, 
    types: any, 
    value: any, 
    //primaryType: string
  ): Promise<string> {
    return await this.walletClient.signTypedData({
      account: this.account,
      domain,
      types,
     // primaryType,
      message: value, // In Viem, the 'value' is passed as 'message'
    });
  }
}
const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const STABLE_ABI = [{ name: 'transfer', type: 'function', inputs: [{name:'to',type:'address'},{name:'val',type:'uint256'}], outputs: [{type:'bool'}] }] as const;

class AutonomousBillAgent {
  private account;
  private client;
  private sdk;
  public agentId?: string;

  constructor(rpcUrl: string, privateKey: `0x${string}`) {
    this.account = privateKeyToAccount(privateKey);
    this.client = createWalletClient({
      account: this.account,
      chain: celoSepolia,
      transport: http(rpcUrl),
    }).extend(publicActions);

//     export interface ERC8004Config {
//   adapter: BlockchainAdapter;
//   addresses: {
//     identityRegistry: string;
//     reputationRegistry: string;
//     validationRegistry: string;
//     chainId: number;
//   };
// }
//const adapter = new ViemAdapter(this.client, this.client,this.account);
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(privateKey as string, provider);
const adapter = new EthersAdapter(provider, signer);

    this.sdk = new ERC8004Client({ adapter:adapter  ,addresses:{identityRegistry: '0x8004A818BFB912233c491871b3d84c89A494BD9e',
    reputationRegistry: '0x8004B663056A597Dffe9eCcC1965A193B7388713',
    validationRegistry: '0x8004Cb1BF31DAf7788923b405b754f57acEB4272',
    chainId: 11155111, }, });
  }

  /**
   * STEP 1: Register the Agent on ERC-8004
   */
  async register(ipfsUri: string) {
    console.log("🛠 Registering Agent on-chain...");
    const { agentId, txHash } = await this.sdk.identity.registerWithURI(ipfsUri);
    this.agentId = agentId as any;
    console.log(`✅ Registered! ID: ${agentId} | Tx: ${txHash}`);
    return agentId;
  }

   async getInfo(id: string) {
    console.log("🛠 Address Agent on-chain...");
    const CID = "bafkreiajlac5sd7dzo7li3c6jzy4dv4rqpc7d3cpxbiqn557addkrngley";
    const add = await this.sdk.getAddress()
    const b = await this.sdk.identity.getOwner(BigInt(id))
    const c = await this.sdk.identity.getTokenURI(BigInt(id))
     const dt = await this.sdk.identity.getMetadata(BigInt(id),CID)
   // const d = await this.sdk.reputation.
     console.log(`✅ owner!  Agent Address : ${b}`);
     console.log(`✅ TokenUrl!  Agent Address : ${c}`);
    console.log(`✅ Registered!  Agent Address : ${add}`);
      console.log(`✅ Agent Metadata : ${dt}`);
    return add;
  }

  async  getAgentMetadata() {
  const CID = "bafkreiajlac5sd7dzo7li3c6jzy4dv4rqpc7d3cpxbiqn557addkrngley";
  const url = `https://gateway.pinata.cloud/ipfs/${CID}`;

  try {
    const response = await axios.get(url);
    const metadata = response.data;
    
    console.log("Agent Name:", metadata.name);
    console.log("Agent MCP Endpoint:", metadata.services?.find((s:any) => s.name === 'MCP')?.endpoint);
    
    return metadata;
  } catch (error) {
    console.error("Error fetching from Pinata:", error);
  }
}

//   async setAddress(address:string){
//     await this.sdk.identity.setAgentWallet(agentId:this.agentId,newWallet:address,"4949495959",)
//   }

  /**
   * STEP 2: Process Bill Instructions
   * Example: "Pay $100 USDT to 0x123... for Electricity"
   */
  async payBill(instruction: string) {
    if (!this.agentId) throw new Error("Agent not registered.");

    // Simple parsing logic (In production, use an LLM parser)
    const amount = instruction.match(/\$(\d+)/)?.[1] || "0";
    const recipient = instruction.match(/0x[a-fA-F0-9]{40}/)?.[0];

    if (!recipient || amount === "0") throw new Error("Invalid Instruction");

    console.log(`💸 Paying ${amount} USDT to ${recipient}...`);

    // Execute Blockchain Transfer
    const hash = await this.client.writeContract({
      address: USDT_ADDRESS,
      abi: STABLE_ABI,
      functionName: 'transfer',
      args: [recipient as `0x${string}`, parseUnits(amount, 6)],
    });

    await this.client.waitForTransactionReceipt({ hash });

    // STEP 3: Submit Reputation Feedback (Self-Attestation of Success)
    await this.sdk.reputation.giveFeedback({
      agentId: this.agentId as any,
      score: 100,
      tag1: 'bill-payment',
      tag2: 'success',
      feedbackURI: `ipfs://ProofOfPayment-${hash}` as any
    });

    return hash;
  }
}

export {AutonomousBillAgent}
// --- Run ---
async function run() {
  const agent = new AutonomousBillAgent(process.env.RPC_URL!, process.env.PRIVATE_KEY as `0x${string}`);
  
  // 1. Initial Registration (Only do this once)
  // const id = await agent.register("ipfs://bafkreidl6hpbwoc2n7pf4ivedauee75rlzpeauxzyxolny2zctswnlaff4");
   //console.log("The Id",id)
   
   /****
    ✅ Registered! ID: 19 | Tx: 0xc9932a738bae10ed8c6630143d90c4a96aa8dc5d05b90df7ee9831f0c30d93ea
The Id 19n
    * 
    */
  agent.agentId = 25n as any; 
  const addre = await agent.getInfo(agent.agentId as string)
  const metadatas = await agent.getAgentMetadata()
  console.log("The metadata",metadatas)

//   // 3. Execute weekly task
//   const tx = await agent.payBill("Pay $75 USDT to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e for Weekly Internet");
//   console.log(`🎉 Task Complete. Tx Hash: ${tx}`);
}

