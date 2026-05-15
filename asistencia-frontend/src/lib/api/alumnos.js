import { apiFetch } from './base.js';
export const getAll          = ()           => apiFetch('/alumnos');
export const create          = (body)       => apiFetch('/alumnos',                    { method: 'POST',   body });
export const update          = (id, body)   => apiFetch(`/alumnos/${id}`,              { method: 'PUT',    body });
export const remove          = (id)         => apiFetch(`/alumnos/${id}`,              { method: 'DELETE' });
export const registrarHuella = (id)         => apiFetch(`/alumnos/${id}/registrar-huella`, { method: 'POST' });
export const borrarHuella    = (id)         => apiFetch(`/alumnos/${id}/borrar-huella`,    { method: 'DELETE' });