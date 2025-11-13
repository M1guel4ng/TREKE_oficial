"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.withTx = withTx;
exports.testConnection = testConnection;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pg_1 = __importDefault(require("pg"));
const { Pool } = pg_1.default;
exports.pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});
async function withTx(fn) {
    const client = await exports.pool.connect();
    try {
        await client.query("BEGIN");
        const out = await fn(client);
        await client.query("COMMIT");
        return out;
    }
    catch (e) {
        await client.query("ROLLBACK");
        throw e;
    }
    finally {
        client.release();
    }
}
async function testConnection() {
    const res = await exports.pool.query("SELECT NOW() as now");
    console.log("✅ Conectado a PostgreSQL:", res.rows[0].now);
}
