import { Request, Response } from "express";
import * as svc from "./creditos.service";

function toInt(raw: any): number | null {
  const n = Number(raw);
  return Number.isInteger(n) ? n : null;
}

export const CreditosController = {
  paquetes: async (_: Request, res: Response) => {
    try {
      const data = await svc.listarPaquetesActivos();
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },


      saldo: async (req: Request, res: Response) => {
    try {
      const userIdHeader = req.header("x-user-id");
      const userIdQuery = req.query.usuario_id;
      const userIdBody = (req.body as any)?.usuario_id;

      const usuarioId = toInt(userIdHeader ?? userIdQuery ?? userIdBody);

      if (!usuarioId) {
        throw new Error(
          "usuario_id requerido (header x-user-id, query ?usuario_id= o body.usuario_id)"
        );
      }

      const billetera = await svc.obtenerBilletera(usuarioId);
      res.json({ ok: true, data: billetera });
    } catch (e: any) {
      console.error("Error saldo billetera:", e);
      res.status(400).json({ ok: false, error: e.message });
    }
  },


  comprar: async (req: Request, res: Response) => {
    try {
      const userIdHeader = req.header("x-user-id");
      const userIdBody = req.body?.usuario_id;
      const usuarioId = toInt(userIdHeader ?? userIdBody);

      if (!usuarioId) {
        throw new Error(
          "usuario_id requerido (header x-user-id o body.usuario_id)"
        );
      }

      const paqueteId = toInt(req.body?.paquete_id);
      if (!paqueteId) {
        throw new Error("paquete_id debe ser un entero válido");
      }

      const data = await svc.comprarPaquete(usuarioId, paqueteId);
      res.status(201).json({ ok: true, data });
    } catch (e: any) {
      console.error("Error comprar paquete:", e);
      res.status(400).json({ ok: false, error: e.message });
    }
  },
};
