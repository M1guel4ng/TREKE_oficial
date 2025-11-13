"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const market_controller_1 = require("./market.controller");
const r = (0, express_1.Router)();
r.get("/market/list", market_controller_1.MarketController.list);
r.get("/market/:id", market_controller_1.MarketController.detail);
r.post("/market/:id/fav", market_controller_1.MarketController.favAdd);
r.delete("/market/:id/fav", market_controller_1.MarketController.favRemove);
// catálogos
r.get("/catalogo/categorias", market_controller_1.MarketController.categorias);
r.get("/catalogo/estados-publicacion", market_controller_1.MarketController.estados);
exports.default = r;
