import { apiFetch } from './base.js';
export const login  = (correo, contrasena) => apiFetch('/auth/login',  { method: 'POST', body: { correo, contrasena } });
export const logout = ()                   => apiFetch('/auth/logout', { method: 'POST' });
export const me     = ()                   => apiFetch('/auth/me');