import { Router } from "express";
import { MarketController as C } from "./market.controller";

const r = Router();

r.get("/market/list", C.list);
r.get("/market/:id", C.detail);
r.post("/market/:id/fav", C.favAdd);
r.delete("/market/:id/fav", C.favRemove);

// catálogos
r.get("/catalogo/categorias", C.categorias);
r.get("/catalogo/estados-publicacion", C.estados);

export default r;
