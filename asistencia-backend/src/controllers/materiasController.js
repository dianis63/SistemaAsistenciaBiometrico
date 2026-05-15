import * as service from '../services/materiasService.js';

export const getAll   = async (req, res) => res.json(await service.getAll());
export const getById  = async (req, res) => res.json(await service.getById(req.params.id));
export const getAlumnos = async (req, res) => res.json(await service.getAlumnos(req.params.id));

export async function create(req, res) {
  try {
    res.status(201).json(await service.create(req.body.nombre, req.body.codigo));
  } catch (e) { res.status(400).json({ error: e.message }); }
}

export async function update(req, res) {
  try {
    res.json(await service.update(req.params.id, req.body.nombre, req.body.codigo));
  } catch (e) { res.status(400).json({ error: e.message }); }
}

export async function remove(req, res) {
  try {
    await service.remove(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
}

export async function inscribir(req, res) {
  try {
    res.json(await service.inscribir(req.body.alumno_id, req.params.id));
  } catch (e) { res.status(400).json({ error: e.message }); }
}

export async function desinscribir(req, res) {
  try {
    await service.desinscribir(req.params.aid, req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
}