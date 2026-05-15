import { loginService } from '../services/authService.js';

export async function login(req, res) {
  try {
    const { correo, contrasena } = req.body;
    const usuario = await loginService(correo, contrasena);
    req.session.usuario = usuario;
    console.log('sesion guardada:', req.session.usuario);
    res.json({ ok: true, usuario });
  } catch (e) {
    console.log('error login:', e.message);
    res.status(401).json({ error: e.message });
  }
}

export async function logout(req, res) {
  req.session.destroy();
  res.json({ ok: true });
}

export async function me(req, res) {
  res.json({ usuario: req.session.usuario || null });
}