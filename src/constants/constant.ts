import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`

const PassWaordHash = `${process.env.PASSWORDHASH}`
const WASENDER_API_KEY = `${process.env.WASENDER_API_KEY}`
const SENDIO_BASE_URL = `${process.env.SENDIO_BASE_URL}`
const  BUSDCE_ADDRESS ="0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0"

export {connectionString,PassWaordHash,WASENDER_API_KEY,SENDIO_BASE_URL,BUSDCE_ADDRESS}