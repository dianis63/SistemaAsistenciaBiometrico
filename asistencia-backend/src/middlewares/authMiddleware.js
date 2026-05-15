export function requireAuth(req, res, next) {
  if (!req.session?.usuario) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
}

export function requireArduino(req, res, next) {
  const token = req.headers['x-arduino-token'];
  if (token !== process.env.ARDUINO_TOKEN) {
    return res.status(401).json({ error: 'Token inválido' });
  }
  next();
}