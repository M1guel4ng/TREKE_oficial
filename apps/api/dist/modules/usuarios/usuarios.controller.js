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
exports.UsuariosController = void 0;
const svc = __importStar(require("./usuarios.service"));
exports.UsuariosController = {
    register: async (req, res) => {
        try {
            const { email, password, full_name, acepta_terminos, rol_id } = req.body;
            const data = await svc.registrarUsuario({ email, password, full_name, acepta_terminos, rol_id });
            res.json({ ok: true, ...data });
        }
        catch (e) {
            res.status(400).json({ ok: false, error: e.message });
        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const data = await svc.loginPlano(email, password);
            res.json(data);
        }
        catch (e) {
            res.status(400).json({ ok: false, error: e.message });
        }
    },
    getPerfil: async (req, res) => {
        try {
            const id = +req.params.id;
            const data = await svc.getPerfil(id);
            res.json({ ok: true, data });
        }
        catch (e) {
            res.status(404).json({ ok: false, error: e.message });
        }
    },
    updatePerfil: async (req, res) => {
        try {
            const id = +req.params.id;
            const data = await svc.actualizarPerfil(id, req.body);
            res.json({ ok: true, data, message: 'Perfil actualizado' });
        }
        catch (e) {
            res.status(400).json({ ok: false, error: e.message });
        }
    },
    updateFoto: async (req, res) => {
        try {
            const id = +req.params.id;
            const { foto } = req.body;
            const data = await svc.actualizarFoto(id, foto);
            res.json({ ok: true, data, message: 'Foto actualizada' });
        }
        catch (e) {
            res.status(400).json({ ok: false, error: e.message });
        }
    },
    updateEmail: async (req, res) => {
        try {
            const id = +req.params.id;
            const { email } = req.body;
            const data = await svc.actualizarEmail(id, email);
            res.json({ ok: true, data, message: 'Email actualizado: confirmar para activar' });
        }
        catch (e) {
            res.status(400).json({ ok: false, error: e.message });
        }
    },
    // Admin base
    listar: async (req, res) => {
        try {
            const data = await svc.listarUsuarios({ ...req.query });
            res.json({ ok: true, data });
        }
        catch (e) {
            res.status(400).json({ ok: false, error: e.message });
        }
    },
    cambiarRol: async (req, res) => {
        try {
            const usuarioId = +req.params.id;
            const { nuevoRolId } = req.body;
            const data = await svc.cambiarRol(0, usuarioId, +nuevoRolId);
            res.json({ ok: true, data });
        }
        catch (e) {
            res.status(400).json({ ok: false, error: e.message });
        }
    },
    suspender: async (req, res) => {
        try {
            const usuarioId = +req.params.id;
            const data = await svc.suspenderUsuario(0, usuarioId);
            res.json({ ok: true, data });
        }
        catch (e) {
            res.status(400).json({ ok: false, error: e.message });
        }
    },
    eliminar: async (req, res) => {
        try {
            const usuarioId = Number(req.params.id);
            const data = await svc.eliminarUsuario(0, usuarioId); // <- hard delete
            return res.json({ ok: true, data });
        }
        catch (e) {
            return res.status(400).json({ ok: false, error: e.message });
        }
    },
    panel: async (req, res) => {
        try {
            const id = Number(req.params.id);
            const pubsLimit = Number(req.query.pubs_limit ?? 12);
            const pubsOffset = Number(req.query.pubs_offset ?? 0);
            const movsLimit = Number(req.query.movs_limit ?? 20);
            const movsOffset = Number(req.query.movs_offset ?? 0);
            const data = await svc.getPanel(id, pubsLimit, pubsOffset, movsLimit, movsOffset);
            return res.json({ ok: true, data });
        }
        catch (e) {
            return res.status(400).json({ ok: false, error: e.message });
        }
    },
};
