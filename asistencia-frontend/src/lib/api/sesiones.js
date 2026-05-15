import { apiFetch } from './base.js';
export const getAll    = ()       => apiFetch('/sesiones');
export const getActiva = ()       => apiFetch('/sesiones/activa');
export const iniciar   = (body)   => apiFetch('/sesiones/iniciar',    { method: 'POST', body });
export const cerrar    = (id)     => apiFetch(`/sesiones/${id}/cerrar`, { method: 'PUT' });