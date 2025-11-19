// apps/api/src/modules/intercambios/intercambios.routes.ts
import { Router } from "express";
import { IntercambiosController as C } from "./intercambios.controller";

const r = Router();

// RF-18
r.post("/intercambios/propuestas", C.iniciarPropuesta);

// RF-19, RF-20
r.post("/intercambios/propuestas/:id/aceptar", C.aceptarPropuesta);

// RF-21, RF-22
r.post("/intercambios/:id/confirmar", C.confirmar);

// RF-23
r.post("/intercambios/:id/cancelar", C.cancelar);

// RF-24 – resumen para la página propia de intercambios
r.get("/usuarios/:id/intercambios", C.resumenUsuario);

r.post("/intercambios/propuestas/:id/aceptar",   C.aceptarPropuesta);
r.post("/intercambios/propuestas/:id/rechazar",  C.rechazarPropuesta);   // 👈 nuevo
r.post("/intercambios/propuestas/:id/contraoferta", C.contraoferta);     // 👈 nuevo


export default r;
