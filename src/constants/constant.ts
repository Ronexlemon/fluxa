import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`

const PassWaordHash = `${process.env.PASSWORDHASH}`
const WASENDER_API_KEY = `${process.env.WASENDER_API_KEY}`
const SENDIO_BASE_URL = `${process.env.SENDIO_BASE_URL}`
const  BUSDCE_ADDRESS ="0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0"
const THIRDWEB_SECRET_KEY =`${process.env.THIRDWEB_SECRET_KEY}`
const RPC_URL =`${process.env.RPC_URL}`
const PRIVATE_KEY =`${process.env.PRIVATE_KEY}`

export {connectionString,PassWaordHash,WASENDER_API_KEY,SENDIO_BASE_URL,BUSDCE_ADDRESS,THIRDWEB_SECRET_KEY,RPC_URL,PRIVATE_KEY}