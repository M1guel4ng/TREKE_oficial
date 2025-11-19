// apps/api/src/modules/intercambios/intercambios.controller.ts
import { Request, Response } from "express";
import * as svc from "./intercambios.service";

const num = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : null);

export const IntercambiosController = {
  iniciarPropuesta: async (req: Request, res: Response) => {
    try {
      const publicacionId = Number(req.body?.publicacion_id);
      const actorHeader   = req.header("x-user-id");
      const demandanteId  = actorHeader ? Number(actorHeader) : Number(req.body?.usuario_id);

      if (!publicacionId || !demandanteId) {
        throw new Error("publicacion_id y usuario_id son requeridos");
      }

      const data = await svc.iniciarPropuesta({
        publicacionId,
        demandanteId,
        mensaje: req.body?.mensaje,
      });

      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  aceptarPropuesta: async (req: Request, res: Response) => {
    try {
      const propuestaId = Number(req.params.id);
      const actorHeader = req.header("x-user-id");
      const actorId     = actorHeader ? Number(actorHeader) : Number(req.body?.usuario_id);
      if (!propuestaId || !actorId) throw new Error("id de propuesta y usuario_id requeridos");

      const data = await svc.aceptarPropuesta({ propuestaId, actorId });
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  confirmar: async (req: Request, res: Response) => {
    try {
      const intercambioId = Number(req.params.id);
      const actorHeader   = req.header("x-user-id");
      const actorId       = actorHeader ? Number(actorHeader) : Number(req.body?.usuario_id);
      if (!intercambioId || !actorId) throw new Error("id de intercambio y usuario_id requeridos");

      const data = await svc.confirmarIntercambio({ intercambioId, actorId });
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  cancelar: async (req: Request, res: Response) => {
    try {
      const intercambioId = Number(req.params.id);
      const actorHeader   = req.header("x-user-id");
      const actorId       = actorHeader ? Number(actorHeader) : Number(req.body?.usuario_id);
      if (!intercambioId || !actorId) throw new Error("id de intercambio y usuario_id requeridos");

      const data = await svc.cancelarIntercambio({
        intercambioId,
        actorId,
        motivo: req.body?.motivo,
      });
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  resumenUsuario: async (req: Request, res: Response) => {
    try {
      const usuarioId = Number(req.params.id);
      const page      = num(req.query.page)     ?? 1;
      const pageSize  = num(req.query.pageSize) ?? 20;

      const data = await svc.resumenUsuario(usuarioId, { page, pageSize });
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

    rechazarPropuesta: async (req: Request, res: Response) => {
  try {
    const propuestaId = Number(req.params.id);
    const actorHeader = req.header("x-user-id");
    const actorId     = actorHeader ? Number(actorHeader) : Number(req.body?.usuario_id);
    if (!propuestaId || !actorId) throw new Error("id de propuesta y usuario_id requeridos");

    const data = await svc.rechazarPropuesta({
      propuestaId,
      actorId,
      motivo: req.body?.motivo,
    });
    res.json({ ok: true, data });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message });
  }
},

contraoferta: async (req: Request, res: Response) => {
  try {
    const propuestaId   = Number(req.params.id);
    const actorHeader   = req.header("x-user-id");
    const actorId       = actorHeader ? Number(actorHeader) : Number(req.body?.usuario_id);
    const monto_ofertado = Number(req.body?.monto_ofertado);

    if (!propuestaId || !actorId) throw new Error("id de propuesta y usuario_id requeridos");

    const data = await svc.contraofertarPropuesta({
      propuestaId,
      actorId,
      monto_ofertado,
      mensaje: req.body?.mensaje,
    });

    res.json({ ok: true, data });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message });
  }
},

};


