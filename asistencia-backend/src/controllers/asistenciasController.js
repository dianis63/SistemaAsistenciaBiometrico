import * as service from '../services/asistenciasService.js';

export async function get(req, res) {
  try {
    const { sesion_id, materia_id, fecha } = req.query;
    if (sesion_id) return res.json(await service.getPorSesion(sesion_id));
    if (materia_id && fecha) return res.json(await service.getReporte(materia_id, fecha));
    res.status(400).json({ error: 'Parámetros insuficientes' });
  } catch (e) { res.status(400).json({ error: e.message }); }
}