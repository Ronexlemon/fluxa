import { PRIVATE_KEY, RPC_URL, SENDIO_BASE_URL } from "../constants/constant";
import { AutonomousBillAgent } from "./agent";
import { getBalance, getCeloBalance } from "./web3";

export const createAccountViaApi = async (phoneNumber: string) => {
  const response = await fetch(`${SENDIO_BASE_URL}/api/account/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phoneNumber }),
  });

  return response.json();
};

export const getAccountDetails = async (phoneNumber: string) => {
  const response = await fetch(`${SENDIO_BASE_URL}/api/account/details`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phoneNumber }),
  });

  return response.json();
};

export const getAccountBalance = async (phoneNumber: string):Promise<string|number|bigint> => {
  const response = await fetch(`${SENDIO_BASE_URL}/api/account/details`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber }),
  });

  if (!response.ok) {
    return("Failed to fetch account details");
  }

  const result = await response.json();

  if (!result?.data?.address) {
    return("Wallet address not found");
  }

  return await getCeloBalance(result.data.address);
};

export const getCeloAccountBalance = async (phoneNumber: string):Promise<string|number|bigint> => {
  const response = await fetch(`${SENDIO_BASE_URL}/api/account/details`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber }),
  });

  if (!response.ok) {
    return("Failed to fetch account details");
  }

  const result = await response.json();

  if (!result?.data?.address) {
    return("Wallet address not found");
  }

  return await getBalance(result.data.address);
};


export async function callPaymentAPI(
  phoneNumber: string,
  amount: string,
  toAddress: string
) {
    console.log("The Address",toAddress)
  toAddress = String(toAddress).trim();

  // Remove leading slash if it exists
  if (toAddress.startsWith("/")) {
    toAddress = toAddress.slice(1);
  }
  // Basic validation for address format (Cronos/EVM)
  if (!toAddress.startsWith("0x") || toAddress.length !== 42) {
    throw new Error("Invalid toAddress. Please use a valid wallet address.");
  }

  const res = await fetch(
    `${SENDIO_BASE_URL}/api/x402/Request`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber,
        Amount: amount,
        toAddress,
      }),
    }
  );

  // Prevent JSON parse errors if API returns HTML
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`API Error: ${text}`);
  }

  return JSON.parse(text);
}


const agent = new AutonomousBillAgent(RPC_URL,PRIVATE_KEY as `0x${string}`);

export const executePayBill = async (
  phoneNumber: string,
  amount: string,
  recipientAddress: string,
  reason?: string
) => {
  console.log("PAY BILL EXEC:", { phoneNumber, amount, recipientAddress, reason });

  agent.agentId = 25n as any; 
  const metadatas = await agent.getAgentMetadata()
  const webService = metadatas.services?.find((s: any) => s.name === "web");
const endpoint = webService?.endpoint;

if (!endpoint) {
  throw new Error("Web service endpoint not found");
}


const res =  fetch(endpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    phoneNumber,
    amount,
  }),
});


  return {
    status: true,
    txHash: "Submitted"
  };
};





export const agentDetails = async () => {
  agent.agentId = 25n as any;

  const info: any = await agent.getInfo(agent.agentId as string);

  return {
    status: true,
    agent: {
      id: agent.agentId as string,
      name:"Fluxa ",
      address: info.add,
    },
  };
};


