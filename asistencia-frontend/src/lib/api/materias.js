import { apiFetch } from './base.js';
export const getAll       = ()              => apiFetch('/materias');
export const create       = (body)          => apiFetch('/materias',                   { method: 'POST',   body });
export const update       = (id, body)      => apiFetch(`/materias/${id}`,             { method: 'PUT',    body });
export const remove       = (id)            => apiFetch(`/materias/${id}`,             { method: 'DELETE' });
export const getAlumnos   = (id)            => apiFetch(`/materias/${id}/alumnos`);
export const inscribir    = (id, alumno_id) => apiFetch(`/materias/${id}/alumnos`,     { method: 'POST',   body: { alumno_id } });
export const desinscribir = (id, aid)       => apiFetch(`/materias/${id}/alumnos/${aid}`, { method: 'DELETE' });