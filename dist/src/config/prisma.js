"use strict";
// import { PrismaPg } from "@prisma/adapter-pg"
// import { PrismaClient } from "../generated/prisma/"
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
//  const prisma = new PrismaClient()
// // const connectionString = `${process.env.DATABASE_URL}`
// // const adapter = new PrismaPg({ connectionString })
// // const prisma = new PrismaClient({ adapter })
// export {prisma}
require("dotenv/config");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("../generated/prisma/client");
const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new adapter_pg_1.PrismaPg({ connectionString });
const prisma = new client_1.PrismaClient({ adapter });
exports.prisma = prisma;
