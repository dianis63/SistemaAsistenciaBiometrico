import * as service from '../services/arduinoService.js';

export const getSesionActiva = async (req, res) =>
  res.json(await service.getSesionActiva());

export const getComando = async (req, res) =>
  res.json(await service.getComando());

export async function postAsistencia(req, res) {
  try {
    res.json(await service.procesarAsistencia(req.body.huella_id));
  } catch (e) { res.status(400).json({ error: e.message }); }
}

export async function huellaRegistrada(req, res) {
  try {
    await service.registrarHuella(req.body.alumno_id, req.body.huella_id);
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
}

export async function marcarEjecutado(req, res) {
  try {
    await service.marcarEjecutado(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
}