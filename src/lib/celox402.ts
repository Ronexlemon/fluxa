// import { settlePayment, facilitator } from "thirdweb/x402";
// import { createThirdwebClient } from "thirdweb";
// import { celo } from "thirdweb/chains";
// import { Request, Response } from "express";
// //sa_adm_B4XG_O2K2_DXWR_FMMK_UTKD_PXAQ_b0d0f644-75c0-4253-8c44-7cef7922f6f1
// const client = createThirdwebClient({
//   secretKey: "Q_WODmjjIJ3Pxt6pzrK6KNeG9zjskGhKPQMc_T7NUesgParpmK1yBx1AnZbZ3nFV0jXoj0Gx86aXJ6BjaFrSog" as string,
// });

// const thirdwebFacilitator = facilitator({
//   client,
//   serverWalletAddress: "0x1234567890123456789012345678901234567890"  //"0xd0Cc0Af5fD30392614560f406C67Efc4D5339c25",
// });

// /**
//  * Handles x402 payment settlement for premium content
//  */
// export const handlePremiumPayment = async (toAddress:string,price?:string) => {
//   try {
//    // const paymentData = req.headers["payment-signature"] || req.headers["x-payment"];
    
//     // Construct the full URL for verification
//     const resourceUrl = "https://api.example.com/premium-content"


//     const result = await settlePayment({
//       resourceUrl,
//       method: "POST", // Dynamic method based on the request
//       //paymentData: paymentData as any,
//       payTo: toAddress,
//       network: celo,
//       price: "$0.05",
//       facilitator: thirdwebFacilitator,
//     });
//     console.log("Resukt",result)

//    return result

    

//   } catch (error) {
//     console.error("Payment settlement error:", error);
    
//   }
// };



//handlePremiumPayment("0x65e28c9c4ef1a756d8df1c507b7a84efcf606fd4")


/**
 * CeloX402Payment - Complete Payment Handler Class
 * 
 * Handles both client-side signature generation and server-side settlement
 * in a single unified class for Celo network x402 payments
 * 
 * Features:
 * - Generate payment signatures from private keys
 * - Settle and validate payments on server
 * - Support for both v1 and v2 protocols
 * - Dynamic pricing support
 * - Multi-network support (Alfajores testnet & Mainnet)
 */

import { ethers } from "ethers";
import { createThirdwebClient,signAuthorization } from "thirdweb";
import { settlePayment, facilitator, verifyPayment } from "thirdweb/x402";
import { celo, celoSepoliaTestnet } from "thirdweb/chains";
import { Request } from "express";
import { privateKeyToAccount } from "viem/accounts";

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface NetworkConfig {
  chainId: number;
  name: string;
  usdcAddress: string;
  rpcUrl: string;
  network: string;
  chain: any; // Thirdweb chain object
}

interface SignatureConfig {
  privateKey: string;
  payTo: string;
  amount: string;
  resourceUrl: string;
  validitySeconds?: number;
}

interface SettlementConfig {
  req: Request;
  price: string;
  scheme?: "exact" | "upto";
  customResourceUrl?: string;
}

interface PaymentSignature {
  headerName: string;
  headerValue: string;
  payload: any;
  signature: string;
  authorization: any;
}

interface SettlementResult {
  success: boolean;
  status: number;
  transactionHash?: string;
  responseBody?: any;
  responseHeaders?: any;
  error?: string;
}

// ============================================================================
// MAIN CLASS
// ============================================================================

 class CeloX402Payment {
  private thirdwebClient: any;
  private facilitatorInstance: any;
  private serverWalletAddress: string;
  private networkConfig: NetworkConfig;
  private isTestnet: boolean;

  // Network configurations
  private static readonly NETWORKS = {
    mainnet: {
      chainId: 42220,
      name: "Celo Mainnet",
      usdcAddress: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
      rpcUrl: "https://forno.celo.org",
      network: "eip155:42220",
      chain: celo,
    },
    celoSepolia: {
      chainId: 11142220,
      name: "Celo Alfajores Testnet",
      usdcAddress: "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
      rpcUrl: "https://forno.celo-sepolia.celo-testnet.org",
      network: "eip155:11142220",
      chain: celoSepoliaTestnet,
    },
  };

  /**
   * Initialize the CeloX402Payment handler
   * 
   * @param config - Configuration object
   * @param config.thirdwebSecretKey - Your Thirdweb secret key (for server-side)
   * @param config.serverWalletAddress - Server wallet that receives payments
   * @param config.isTestnet - Use Alfajores testnet (default: true)
   * @param config.waitUntil - Wait behavior: 'simulated', 'submitted', or 'confirmed'
   */
  constructor(config: {
    thirdwebSecretKey: string;
    serverWalletAddress: string;
    isTestnet?: boolean;
    waitUntil?: "simulated" | "submitted" | "confirmed";
  }) {
    const {
      thirdwebSecretKey,
      serverWalletAddress,
      isTestnet = true,
      waitUntil = "confirmed",
    } = config;

    // Validate inputs
    if (!thirdwebSecretKey) {
      throw new Error("thirdwebSecretKey is required");
    }
    if (!serverWalletAddress || !ethers.isAddress(serverWalletAddress)) {
      throw new Error("Valid serverWalletAddress is required");
    }

    this.serverWalletAddress = serverWalletAddress;
    this.isTestnet = isTestnet;
    this.networkConfig = isTestnet
      ? CeloX402Payment.NETWORKS.celoSepolia
      : CeloX402Payment.NETWORKS.mainnet;

    // Initialize Thirdweb client
    this.thirdwebClient = createThirdwebClient({
      secretKey: thirdwebSecretKey,
    });

    // Initialize facilitator for server-side settlement
    this.facilitatorInstance = facilitator({
      client: this.thirdwebClient,
      serverWalletAddress: this.serverWalletAddress,
      waitUntil,
    });

    console.log(`✅ CeloX402Payment initialized`);
    console.log(`   Network: ${this.networkConfig.name}`);
    console.log(`   Server Wallet: ${this.serverWalletAddress}`);
  }

  // ==========================================================================
  // CLIENT-SIDE: SIGNATURE GENERATION
  // ==========================================================================

  /**
   * Generate payment signature from client's private key
   * This is called by the client (payer) to create a payment signature
   * 
   * @param config - Signature configuration
   * @returns Payment signature to include in request headers
   */
  async generateSignature(config: SignatureConfig): Promise<PaymentSignature> {
    const {
      privateKey,
      payTo,
      amount,
      resourceUrl,
      validitySeconds = 300, // 5 minutes default
    } = config;

    // Validate inputs
    if (!privateKey || !privateKey.startsWith("0x")) {
      throw new Error("Valid private key is required (must start with 0x)");
    }
    if (!payTo || !ethers.isAddress(payTo)) {
      throw new Error("Valid payTo address is required");
    }
    if (!amount || isNaN(Number(amount))) {
      throw new Error("Valid amount is required");
    }
    if (!resourceUrl) {
      throw new Error("Resource URL is required");
    }

    console.log("🔐 Generating payment signature...");

    // Create wallet from private key
    const wallet = new ethers.Wallet(privateKey);
    const payerAddress = wallet.address;

    console.log(`   Payer: ${payerAddress}`);
    console.log(`   Recipient: ${payTo}`);
    console.log(`   Amount: ${amount} (${this.formatCusd(amount)})`);

    // Create authorization object (EIP-3009 format)
    const now = Math.floor(Date.now() / 1000);
    const authorization = {
      from: payerAddress,
      to: payTo,
      value: amount,
      validAfter: "0",
      validBefore: (now + validitySeconds).toString(),
      nonce: ethers.hexlify(ethers.randomBytes(32)),
    };

    // EIP-712 Domain (usdc contract)
    const domain = {
      name: "USDC",
      version: "2",
      chainId: this.networkConfig.chainId,
      verifyingContract: this.networkConfig.usdcAddress,
    };

    // EIP-712 Types (EIP-3009 TransferWithAuthorization)
    const types = {
      TransferWithAuthorization: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "validAfter", type: "uint256" },
        { name: "validBefore", type: "uint256" },
        { name: "nonce", type: "bytes32" },
      ],
    };

    // Sign the typed data (EIP-712)
    const signature = await wallet.signTypedData(domain, types, authorization);

    console.log(`   Signature: ${signature.substring(0, 20)}...`);

    // Create V2 payment payload
    const paymentPayload = {
      x402Version: 1,
      scheme: "exact",
      network: this.networkConfig.network,
      accepted: {
        scheme: "exact",
        network: this.networkConfig.network,
        amount: amount,
        asset: this.networkConfig.usdcAddress,
        payTo: payTo,
        resource: resourceUrl,
      },
      payload: {
        signature: signature,
        authorization: authorization,
      },
    };

    // Base64 encode the payload
    const base64Payload = Buffer.from(JSON.stringify(paymentPayload)).toString(
      "base64"
    );

    console.log("✅ Payment signature generated successfully");

    return {
      headerName: "PAYMENT-SIGNATURE",
      headerValue: base64Payload,
      payload: paymentPayload,
      signature,
      authorization,
    };
  }

  /**
   * Generate signature from dollar amount (convenience method)
   * Automatically converts dollars to cUSD amount
   */
  async generateSignatureFromDollars(config: {
    privateKey: string;
    payTo: string;
    dollars: number;
    resourceUrl: string;
    validitySeconds?: number;
  }): Promise<PaymentSignature> {
    const amount = this.dollarsToCusd(config.dollars);
    return this.generateSignature({
      ...config,
      amount,
    });
  }

  

  // ==========================================================================
  // SERVER-SIDE: PAYMENT SETTLEMENT
  // ==========================================================================

  /**
   * Settle payment from Express request
   * This is called by the server to validate and settle a payment
   * 
   * @param config - Settlement configuration
   * @returns Settlement result
   */
  async settlePayment(config: SettlementConfig): Promise<SettlementResult> {
    const { req, price, scheme = "exact", customResourceUrl } = config;

    console.log("💳 Processing payment settlement...");

    try {
      // Extract payment data from headers (v2 first, then v1)
      const paymentData =
        (req.headers["payment-signature"] as string) ||
        (req.headers["x-payment"] as string);

        console.log("The PaymentData",paymentData)

      if (!paymentData) {
        console.log("❌ No payment signature provided");
        return {
          success: false,
          status: 400,
          error: "Missing payment signature header",
          responseBody: {
            error: "Missing payment signature",
            message: "Include PAYMENT-SIGNATURE or X-PAYMENT header",
          },
        };
      }

      // Construct resource URL
      const protocol = req.protocol;
      const host = req.get("host");
      const path = req.originalUrl;
      const resourceUrl = customResourceUrl || `${protocol}://${host}${path}`;

      console.log(`   Resource: ${resourceUrl}`);
      console.log(`   Method: ${req.method}`);
      console.log(`   Price: ${price}`);
      console.log(`   Scheme: ${scheme}`);

      // Settle the payment using Thirdweb facilitator
      const result = await settlePayment({
        resourceUrl,
        method: req.method.toUpperCase(),
        paymentData,
        payTo: this.serverWalletAddress,
        network: this.networkConfig.chain,
        price,
        facilitator: this.facilitatorInstance,
        scheme,
      });

      console.log(`   Settlement Status: ${result.status}`);

      if (result.status === 200) {
        console.log("✅ Payment settled successfully");
        if (result.paymentReceipt?.transaction) {
          console.log(`   Transaction: ${result.paymentReceipt?.transaction}`);
        }

        return {
          success: true,
          status: 200,
          transactionHash: result.paymentReceipt?.transaction,
          responseBody: result.paymentReceipt?.success,
          responseHeaders: result.responseHeaders,
        };
      }

      // Payment failed or not provided (402)
      console.log("❌ Payment settlement failed");
      return {
        success: false,
        status: result.status,
        responseBody: result.responseBody,
        responseHeaders: result.responseHeaders,
        error: result.responseBody?.error || "Payment failed",
      };
    } catch (error) {
      console.error("❌ Settlement error:", error);
      return {
        success: false,
        status: 500,
        error: error instanceof Error ? error.message : "Unknown error",
        responseBody: {
          error: "Payment processing failed",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Verify payment without settling (for dynamic pricing)
   * Checks if payment is valid without executing the transfer
   */
  async verifyPayment(config: SettlementConfig): Promise<SettlementResult> {
    const { req, price, scheme = "upto", customResourceUrl } = config;

    console.log("🔍 Verifying payment...");

    try {
      const paymentData =
        (req.headers["payment-signature"] as string) ||
        (req.headers["x-payment"] as string);

      if (!paymentData) {
        return {
          success: false,
          status: 400,
          error: "Missing payment signature",
        };
      }

      const protocol = req.protocol;
      const host = req.get("host");
      const path = req.originalUrl;
      const resourceUrl = customResourceUrl || `${protocol}://${host}${path}`;

      const result = await verifyPayment({
        resourceUrl,
        method: req.method.toUpperCase(),
        paymentData,
        payTo: this.serverWalletAddress,
        network: this.networkConfig.chain,
        price,
        facilitator: this.facilitatorInstance,
        scheme,
      });

      console.log(`   Verification Status: ${result.status}`);

      return {
        success: result.status === 200,
        status: result.status,
        responseBody: result.status,
        responseHeaders: result.status,
      };
    } catch (error) {
      console.error("❌ Verification error:", error);
      return {
        success: false,
        status: 500,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Dynamic pricing workflow: verify -> work -> settle
   */
  async dynamicPricing(config: {
    req: Request;
    maxPrice: string;
    calculateActualPrice: () => Promise<string>;
    customResourceUrl?: string;
  }): Promise<SettlementResult> {
    const { req, maxPrice, calculateActualPrice, customResourceUrl } = config;

    console.log("⚡ Dynamic pricing workflow...");

    // Step 1: Verify payment up to max price
    const verification = await this.verifyPayment({
      req,
      price: maxPrice,
      scheme: "upto",
      customResourceUrl,
    });

    if (!verification.success) {
      console.log("❌ Verification failed");
      return verification;
    }

    console.log("✅ Payment verified");

    // Step 2: Do the work and calculate actual price
    const actualPrice = await calculateActualPrice();
    console.log(`   Actual price: ${actualPrice}`);

    // Step 3: Settle with actual price
    const settlement = await this.settlePayment({
      req,
      price: actualPrice,
      scheme: "upto",
      customResourceUrl,
    });

    return settlement;
  }

  // ==========================================================================
  // COMPLETE PAYMENT FLOW (CLIENT-SIDE)
  // ==========================================================================

  /**
   * Complete payment flow from client perspective
   * Makes initial request, generates signature, retries with payment
   */
  async makePayment(config: {
    url: string;
    privateKey: string;
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  }): Promise<any> {
    const { url, privateKey, method = "GET", body, headers = {} } = config;

    console.log(`\n💸 Making x402 payment to: ${url}\n`);

    try {
      // Step 1: Initial request (will get 402)
      console.log("Step 1: Requesting resource...");
      const initialResponse = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      // If not 402, no payment needed
      if (initialResponse.status !== 402) {
        console.log("✅ No payment required");
        return await initialResponse.json();
      }

      console.log("📋 Received 402 Payment Required");

      // Step 2: Parse payment requirements
      const paymentRequiredHeader =
        initialResponse.headers.get("PAYMENT-REQUIRED") ||
        initialResponse.headers.get("X-PAYMENT-REQUIRED");

      if (!paymentRequiredHeader) {
        throw new Error("No payment requirements in 402 response");
      }

      const paymentRequired = JSON.parse(
        Buffer.from(paymentRequiredHeader, "base64").toString("utf-8")
      );

      const requirement = paymentRequired.accepts?.[0] || paymentRequired;

      console.log("Payment details:");
      console.log(`   Pay to: ${requirement.payTo}`);
      console.log(`   Amount: ${requirement.amount || requirement.maxAmountRequired}`);
      console.log(`   Scheme: ${requirement.scheme}`);

      // Step 3: Generate signature
      const { headerName, headerValue } = await this.generateSignature({
        privateKey,
        payTo: requirement.payTo,
        amount: requirement.amount || requirement.maxAmountRequired,
        resourceUrl: url,
      });

      // Step 4: Retry with payment
      console.log("\nStep 2: Submitting payment...");
      const paidResponse = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          [headerName]: headerValue,
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (paidResponse.status === 200) {
        console.log("✅ Payment successful!\n");

        // Check for settlement details
        const paymentResponseHeader =
          paidResponse.headers.get("PAYMENT-RESPONSE") ||
          paidResponse.headers.get("X-PAYMENT-RESPONSE");

        if (paymentResponseHeader) {
          const settlement = JSON.parse(
            Buffer.from(paymentResponseHeader, "base64").toString("utf-8")
          );
          console.log("Transaction Hash:", settlement.transactionHash);
        }

        return await paidResponse.json();
      } else {
        const error = await paidResponse.text();
        throw new Error(`Payment failed (${paidResponse.status}): ${error}`);
      }
    } catch (error) {
      console.error("❌ Payment failed:", error);
      throw error;
    }
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Convert dollars to cUSD amount (6 decimals)
   */
  dollarsToCusd(dollars: number): string {
    return Math.floor(dollars * 1_000_000).toString();
  }

  /**
   * Convert cUSD amount to dollars
   */
  cusdToDollars(amount: string): string {
    const dollars = parseInt(amount) / 1_000_000;
    return `$${dollars.toFixed(2)}`;
  }

  /**
   * Format cUSD amount for display
   */
  private formatCusd(amount: string): string {
    return this.cusdToDollars(amount);
  }

  /**
   * Parse dollar string to cUSD amount
   */
  parseDollars(priceString: string): string {
    const dollars = parseFloat(priceString.replace("$", ""));
    return this.dollarsToCusd(dollars);
  }

  /**
   * Get network configuration
   */
  getNetworkConfig(): NetworkConfig {
    return this.networkConfig;
  }

  /**
   * Get server wallet address
   */
  getServerWallet(): string {
    return this.serverWalletAddress;
  }

  /**
   * Switch network (testnet/mainnet)
   */
  switchNetwork(isTestnet: boolean): void {
    this.isTestnet = isTestnet;
    this.networkConfig = isTestnet
      ? CeloX402Payment.NETWORKS.celoSepolia
      : CeloX402Payment.NETWORKS.mainnet;

    console.log(`✅ Switched to ${this.networkConfig.name}`);
  }

  /**
   * Validate Celo address
   */
  static isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  /**
   * Get explorer URL for transaction
   */
  getExplorerUrl(transactionHash: string): string {
    const baseUrl = this.isTestnet
      ? "https://alfajores.celoscan.io"
      : "https://celoscan.io";
    return `${baseUrl}/tx/${transactionHash}`;
  }
}

// ============================================================================
// EXPORT
// ============================================================================





 class CeloPaymentService {
  private client: any;
  private thirdwebFacilitator: any;
  private serverWallet: string;

  constructor(secretKey: string, serverWalletAddress: string) {
    this.serverWallet = serverWalletAddress;
    this.client = createThirdwebClient({ secretKey });
    
    this.thirdwebFacilitator = facilitator({
      client: this.client,
      serverWalletAddress: this.serverWallet,
    });
  }

  /**
   * Directly settles a payment using provided x-payment data.
   * Use this inside your existing route logic.
   */
  async processPayment(options: {
    paymentData: string;
    resourceUrl: string;
    price: string;
    method?: string;
  }) {
    const { paymentData, resourceUrl, price, method = "GET" } = options;

    const result = await settlePayment({
      resourceUrl,
      method,
      paymentData,
      payTo: this.serverWallet,
      network: celo,
      price: price,
      facilitator: this.thirdwebFacilitator,
    });

    return {
      isAuthorized: result.status === 200,
      status: result.status,
      headers: result.responseHeaders,
      body: result,
    };
  }
}

export {CeloX402Payment,CeloPaymentService};