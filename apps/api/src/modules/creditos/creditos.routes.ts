import { Router } from "express";
import { CreditosController as C } from "./creditos.controller";

const r = Router();

// listar paquetes de créditos
r.get("/creditos/paquetes", C.paquetes);

// saldo de billetera
r.get("/creditos/saldo", C.saldo);

// comprar paquete (usa x-user-id o body.usuario_id)
r.post("/creditos/comprar", C.comprar);

export default r;
