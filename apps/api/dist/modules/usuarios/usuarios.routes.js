"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usuarios_controller_1 = require("./usuarios.controller");
const r = (0, express_1.Router)();
// Registro + Bono
r.post('/usuarios/register', usuarios_controller_1.UsuariosController.register);
// Login mínimo
r.post('/auth/login', usuarios_controller_1.UsuariosController.login);
// Perfil
r.post('/usuarios/register', usuarios_controller_1.UsuariosController.register);
r.post('/auth/login', usuarios_controller_1.UsuariosController.login);
r.get('/usuarios/:id/perfil', usuarios_controller_1.UsuariosController.getPerfil);
r.put('/usuarios/:id/perfil', usuarios_controller_1.UsuariosController.updatePerfil);
r.patch('/usuarios/:id/email', usuarios_controller_1.UsuariosController.updateEmail);
r.patch('/usuarios/:id/foto', usuarios_controller_1.UsuariosController.updateFoto);
// Admin (por ahora abierto)
r.get('/admin/usuarios', usuarios_controller_1.UsuariosController.listar);
r.patch('/admin/usuarios/:id/rol', usuarios_controller_1.UsuariosController.cambiarRol);
r.patch('/admin/usuarios/:id/suspender', usuarios_controller_1.UsuariosController.suspender);
r.delete('/admin/usuarios/:id', usuarios_controller_1.UsuariosController.eliminar);
//perfil
r.get('/usuarios/:id/panel', usuarios_controller_1.UsuariosController.panel);
exports.default = r;
