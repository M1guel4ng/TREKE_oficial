"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketController = void 0;
const svc = __importStar(require("./market.service"));
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);
exports.MarketController = {
    list: async (req, res) => {
        try {
            const data = await svc.list({
                q: req.query.q ?? null,
                categoria_id: num(req.query.categoria_id),
                min_cred: num(req.query.min_cred),
                max_cred: num(req.query.max_cred),
                estado_id: num(req.query.estado_id),
                lat: req.query.lat ? Number(req.query.lat) : null,
                lng: req.query.lng ? Number(req.query.lng) : null,
                radio_km: req.query.radio_km ? Number(req.query.radio_km) : null,
                sort: req.query.sort ?? "recent",
                limit: req.query.limit ? Number(req.query.limit) : 12,
                offset: req.query.offset ? Number(req.query.offset) : 0,
            });
            res.json({ ok: true, data });
        }
        catch (e) {
            res.status(400).json({ ok: false, error: e.message });
        }
    },
    detail: async (req, res) => {
        try {
            const id = Number(req.params.id);
            const viewer = req.header("x-user-id") ? Number(req.header("x-user-id")) : null;
            const data = await svc.detail(id, viewer);
            res.json({ ok: true, data });
        }
        catch (e) {
            res.status(400).json({ ok: false, error: e.message });
        }
    },
    favAdd: async (req, res) => {
        try {
            const pubId = Number(req.params.id);
            const userId = req.header("x-user-id") ? Number(req.header("x-user-id")) : Number(req.body?.usuario_id);
            if (!userId)
                throw new Error("usuario_id requerido (header x-user-id o body)");
            const data = await svc.favAdd(userId, pubId);
            res.json({ ok: true, data });
        }
        catch (e) {
            res.status(400).json({ ok: false, error: e.message });
        }
    },
    favRemove: async (req, res) => {
        try {
            const pubId = Number(req.params.id);
            const userId = req.header("x-user-id") ? Number(req.header("x-user-id")) : Number(req.body?.usuario_id);
            if (!userId)
                throw new Error("usuario_id requerido (header x-user-id o body)");
            const data = await svc.favRemove(userId, pubId);
            res.json({ ok: true, data });
        }
        catch (e) {
            res.status(400).json({ ok: false, error: e.message });
        }
    },
    categorias: async (_, res) => {
        const data = await svc.categorias();
        res.json({ ok: true, data });
    },
    estados: async (_, res) => {
        const data = await svc.estadosPublicacion();
        res.json({ ok: true, data });
    },
};
