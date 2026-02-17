import AsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { WasenderClient } from "../lib/whatsapp";
import { WASENDER_API_KEY } from "../constants/constant";
import { agentDetails, callPaymentAPI, createAccountViaApi, executePayBill, getAccountBalance, getAccountDetails } from "../lib/apiclients";
import { getBalance } from "../lib/web3";

const wasender = new WasenderClient(WASENDER_API_KEY);

const webhook_receive = AsyncHandler(async (req: Request, res: Response) => {
  try {
    const messageData = req.body?.data?.messages;

    if (!messageData?.remoteJid || !messageData?.messageBody) {
      res.status(200).json({ ignored: true });
      return;
    }

    const lid = messageData.remoteJid;
    const incomingMessage = messageData.messageBody.trim().toLowerCase();


  const phoneNumber = lid.split("@")[0];
    console.log("Incoming LID:", lid);
    console.log("Incoming Message:", incomingMessage);

    // 🔹 HELP MENU
    if (incomingMessage === "/help") {
      await wasender.sendMessageFromLid({
        lid,
  message:
`✨ *SENDIO WALLET* ✨

What would you like to do?

0️⃣ Create / Get Wallet  
1️⃣ Send Funds  
2️⃣ Check Balance  
3️⃣ Delete Wallet  
4️⃣ Pay Bill  
5️⃣ Check Agent Details

📩 *Reply with a number*  
Example: 1`

      });
    }

    else if (incomingMessage === "0") {

  // 1. Check if wallet exists
  const detailsResult = await getAccountDetails(phoneNumber);
  if (detailsResult.status) {
    await wasender.sendMessageFromLid({
     lid,
  message:
`✅ *Wallet Found*

🔐 *Your Address:*
${detailsResult.data.address}

💡 You can now send or receive funds.
Type /help to continue.`
    });
    res.status(200).json({ status: "ok" });
    return;
  }

  // 3. If wallet does not exist, create it
  const result = await createAccountViaApi(phoneNumber);

  if (!result.status) {
    await wasender.sendMessageFromLid({
      lid,
      message: `❌ ${result.message}`,
    });
    res.status(200).json({ status: "ok" });
    return;
  }

  await wasender.sendMessageFromLid({
    lid,
  message:
`🎉 *Wallet Created Successfully!*

🔐 *Address:*  
${result.data.address}

⚠️ *Keep your keys safe*
Never share your private key with anyone.

Type /help to continue 🚀`
  });
}


    // 🔹 1: Send
    else if (incomingMessage === "1") {
      await wasender.sendMessageFromLid({
        lid,
  message:
`📤 *SEND FUNDS*

Send crypto using this format:

/address,/amount

📝 *Example:*  
/0xabc123...,/10

💡 Amount is in USDC`
      });
    }

    // 🔹 2: Check Balance
    else if (incomingMessage === "2") {
      const result = await getAccountBalance(phoneNumber)
      await wasender.sendMessageFromLid({
        lid,
  message:
`💰 *Your Wallet Balance*

🔹 ${result} USDC

Type /help to continue`
      });
    }

    // 🔹 3: Delete Account
    else if (incomingMessage === "3") {
      await wasender.sendMessageFromLid({
       lid,
  message:
`⚠️ *DELETE WALLET*

This action is *permanent* and cannot be undone.

To confirm, reply with:
❗ /confirm delete

To cancel, type /help`
      });
    }else if (incomingMessage.startsWith("/paybill")) {
  const parts = incomingMessage.split(",");

  const amount = parts[1];
  const billNumber = parts[2];
  const reason = parts[3] || "Bill Payment";

  if (!amount || !billNumber) {
    await wasender.sendMessageFromLid({
      lid,
      message:
`❌ Invalid PayBill format

Use:
/paybill,/amount,/billNumber,/reason

Example:
/paybill,50,838383...,Electricity`
    });

     res.status(200).json({ status: "ok" });
     return
  }

  const result = await executePayBill(phoneNumber, amount, billNumber, reason);

  if (!result.status) {
    await wasender.sendMessageFromLid({
      lid,
      message: `❌ PayBill Failed`
    });

     res.status(200).json({ status: "ok" });
     return
  }

  await wasender.sendMessageFromLid({
    lid,
    message:
`💳 *Bill Payment Update*

Amount: *${amount} USDC*  
Bill Number: ${billNumber}  
Reason: ${reason}  

Status: ⏳ *Processing*  
You’ll be notified once confirmed.
`
  });

   res.status(200).json({ status: "ok" });
   return
}
    else if (incomingMessage.includes("/")) {
    const [toAddress, amount] = incomingMessage.split(",");

    if (!toAddress || !amount) {
      await wasender.sendMessageFromLid({
        lid,
  message:
`❌ *Invalid Format*

Use this format:
/address,/amount

📝 Example:
/0xabc123...,/50`
      });
      res.status(200).json({ status: "ok" });
      return;
    }

    // Call your payment API
    const result = await callPaymentAPI(phoneNumber, amount.replace("/", ""), toAddress);

    if (!result.status) {
      await wasender.sendMessageFromLid({
        lid,
        message: `❌ Payment Failed: ${result.message}`,
      });
      res.status(200).json({ status: "ok" });
      return;
    }

   await wasender.sendMessageFromLid({
  lid,
  message:
    "🎉 *Payment Successful!* 🎉\n\n" +
    `🔹 *Tx Hash:* ${result.data.txHash || "N/A"}\n` +
    `🔹 *From:* ${result.data.from || "N/A"}\n` +
    `🔹 *To:* ${result.data.to || "N/A"}\n` +
    `🔹 *Amount:* ${result.data.value || "N/A"}\n` +
    `🔹 *Block:* ${result.data.blockNumber || "N/A"}\n\n` +
    `🧭 *Track it here:* https://explorer.cronos.org/testnet/tx/${result.data.txHash || ""}\n\n` +
    `🕒 *Time:* ${result.data.timestamp || "N/A"}\n` +
    `🌐 *Network:* ${result.data.network || "N/A"}\n\n` +
    "✅ *Thank you for using Sendio!*"
});


    res.status(200).json({ status: "ok" });
    return;
  }else if (incomingMessage === "4") {
  await wasender.sendMessageFromLid({
    lid,
    message:
`💳 *Pay a Bill (Fluxa Agent Assisted)*

Send your bill payment in this format:

👉 /paybill,amount,billNumber,reason

📝 *Example:*
/paybill,50,808989,Electricity bill

📌 *Supported Bills:*
• Rent  
• Electricity  
• Water  
• Internet  
• Subscriptions  

Type /help to go back`

  });

  res.status(200).json({ status: "ok" });
  return;
} else if (incomingMessage === "5") {
  const result = await agentDetails();

  await wasender.sendMessageFromLid({
    lid,
    message: 
`🤖 *Agent Details*

🆔 ID: ${result.agent.id}
📡 Address: ${result.agent.address}
👤 Owner: ${result.agent.owner}

Type /help to continue`
  });
}


    // 🔹 Unknown command
    else {
      await wasender.sendMessageFromLid({
       lid,
  message:
`❓ *Unknown Command*

Type /help to see all available options.`
      });
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(200).json({ status: "error_logged" });
  }
});

export { webhook_receive };
