import * as service from '../services/alumnosService.js';

export const getAll  = async (req, res) => res.json(await service.getAll());
export const getById = async (req, res) => res.json(await service.getById(req.params.id));

export async function create(req, res) {
  try {
    const { nombre, carnet } = req.body;
    const alumno = await service.create(nombre, carnet);
    res.status(201).json(alumno);
  } catch (e) { res.status(400).json({ error: e.message }); }
}

export async function update(req, res) {
  try {
    const { nombre, carnet } = req.body;
    const alumno = await service.update(req.params.id, nombre, carnet);
    res.json(alumno);
  } catch (e) { res.status(400).json({ error: e.message }); }
}

export async function remove(req, res) {
  try {
    await service.remove(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
}

export async function registrarHuella(req, res) {
  try {
    const result = await service.solicitarRegistroHuella(req.params.id);
    res.json(result);
  } catch (e) { res.status(400).json({ error: e.message }); }
}

export async function borrarHuella(req, res) {
  try {
    const result = await service.solicitarBorrarHuella(req.params.id);
    res.json(result);
  } catch (e) { res.status(400).json({ error: e.message }); }
}