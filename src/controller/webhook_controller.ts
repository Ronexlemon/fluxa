import AsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { WasenderClient } from "../lib/whatsapp";
import { WASENDER_API_KEY } from "../constants/constant";
import { callPaymentAPI, createAccountViaApi, getAccountBalance, getAccountDetails } from "../lib/apiclients";
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

💡 Amount is in USDCe`
      });
    }

    // 🔹 2: Check Balance
    else if (incomingMessage === "2") {
      const result = await getAccountBalance(phoneNumber)
      await wasender.sendMessageFromLid({
        lid,
  message:
`💰 *Your Wallet Balance*

🔹 ${result} USDCe

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
    }else if (incomingMessage.includes("/")) {
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
