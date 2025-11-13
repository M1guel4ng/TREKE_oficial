"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const usuarios_routes_1 = __importDefault(require("./modules/usuarios/usuarios.routes"));
const market_routes_1 = __importDefault(require("./modules/market/market.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: ["http://localhost:5173"], credentials: true }));
app.use(express_1.default.json());
app.use('/api', usuarios_routes_1.default);
app.use("/api", market_routes_1.default);
// 🔹 Sirve un HTML simple en la raíz
app.get("/", (_req, res) => {
    res.send(`
    <html>
      <head>
        <title>Servidor TREKE 🌱</title>
        <style>
          body { font-family: sans-serif; text-align: center; background: #f3f4f6; margin-top: 100px; }
          h1 { color: #22c55e; }
          .box { background: white; padding: 20px; border-radius: 10px; display: inline-block; box-shadow: 0 2px 10px rgba(0,0,0,0.1);}
          a { color: #2563eb; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="box">
          <h1>Servidor TREKE 🌱</h1>
          <p>Tu backend Express + PostgreSQL está funcionando correctamente.</p>
          <p>✅ API activa en <code>/api/prueba</code></p>
          <p>🔗 <a href="/api/health">Probar endpoint de salud</a></p>
        </div>
      </body>
    </html>
  `);
});
// Endpoint de prueba JSON
app.get("/api/prueba", (_req, res) => {
    res.json({ ok: true, service: "TREKE API", time: new Date().toISOString() });
});
exports.default = app;
