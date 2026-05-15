import { apiFetch } from './base.js';
export const getPorSesion = (sesion_id)          => apiFetch(`/asistencias?sesion_id=${sesion_id}`);
export const getReporte   = (materia_id, fecha)  => apiFetch(`/asistencias?materia_id=${materia_id}&fecha=${fecha}`);