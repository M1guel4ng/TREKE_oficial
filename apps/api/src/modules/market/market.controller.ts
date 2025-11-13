import * as svc from "./market.service";
import { Request, Response } from "express";

const num = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : null);

export const MarketController = {
  list: async (req: Request, res: Response) => {
    try {
      const data = await svc.list({
        q: (req.query.q as string) ?? null,
        categoria_id: num(req.query.categoria_id),
        min_cred: num(req.query.min_cred),
        max_cred: num(req.query.max_cred),
        estado_id: num(req.query.estado_id),
        lat: req.query.lat ? Number(req.query.lat) : null,
        lng: req.query.lng ? Number(req.query.lng) : null,
        radio_km: req.query.radio_km ? Number(req.query.radio_km) : null,
        sort: (req.query.sort as any) ?? "recent",
        limit: req.query.limit ? Number(req.query.limit) : 12,
        offset: req.query.offset ? Number(req.query.offset) : 0,
      });
      res.json({ ok: true, data });
    } catch (e:any) {
      res.status(400).json({ ok:false, error: e.message });
    }
  },

  detail: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const viewer = req.header("x-user-id") ? Number(req.header("x-user-id")) : null;
      const data = await svc.detail(id, viewer);
      res.json({ ok: true, data });
    } catch (e:any) {
      res.status(400).json({ ok:false, error: e.message });
    }
  },

  favAdd: async (req: Request, res: Response) => {
    try {
      const pubId = Number(req.params.id);
      const userId = req.header("x-user-id") ? Number(req.header("x-user-id")) : Number(req.body?.usuario_id);
      if (!userId) throw new Error("usuario_id requerido (header x-user-id o body)");
      const data = await svc.favAdd(userId, pubId);
      res.json({ ok: true, data });
    } catch (e:any) {
      res.status(400).json({ ok:false, error: e.message });
    }
  },

  favRemove: async (req: Request, res: Response) => {
    try {
      const pubId = Number(req.params.id);
      const userId = req.header("x-user-id") ? Number(req.header("x-user-id")) : Number(req.body?.usuario_id);
      if (!userId) throw new Error("usuario_id requerido (header x-user-id o body)");
      const data = await svc.favRemove(userId, pubId);
      res.json({ ok: true, data });
    } catch (e:any) {
      res.status(400).json({ ok:false, error: e.message });
    }
  },

  categorias: async (_: Request, res: Response) => {
    const data = await svc.categorias();
    res.json({ ok: true, data });
  },
  estados: async (_: Request, res: Response) => {
    const data = await svc.estadosPublicacion();
    res.json({ ok: true, data });
  },
};
