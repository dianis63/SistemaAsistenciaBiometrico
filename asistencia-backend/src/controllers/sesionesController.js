import * as service from '../services/sesionesService.js';

export const getAll    = async (req, res) => res.json(await service.getAll());
export const getActiva = async (req, res) => res.json(await service.getActiva());

export async function iniciar(req, res) {
  try {
    const { materia_id, minutos_tolerancia } = req.body;
    res.status(201).json(await service.iniciar(materia_id, minutos_tolerancia));
  } catch (e) { res.status(400).json({ error: e.message }); }
}

export async function cerrar(req, res) {
  try {
    res.json(await service.cerrar(req.params.id));
  } catch (e) { res.status(400).json({ error: e.message }); }
}