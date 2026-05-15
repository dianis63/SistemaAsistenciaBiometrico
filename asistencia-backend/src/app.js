import express  from 'express';
import cors     from 'cors';
import session  from 'express-session';
import dotenv   from 'dotenv';

import authRoutes        from './routes/authRoutes.js';
import alumnosRoutes     from './routes/alumnosRoutes.js';
import materiasRoutes    from './routes/materiasRoutes.js';
import sesionesRoutes    from './routes/sesionesRoutes.js';
import asistenciasRoutes from './routes/asistenciasRoutes.js';
import arduinoRoutes     from './routes/arduinoRoutes.js';

dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(session({
  secret:            process.env.SESSION_SECRET || 'secreto123',
  resave:            false,
  saveUninitialized: false,
  cookie:            { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 8 },
}));

app.get('/', (req, res) => res.json({ ok: true, mensaje: 'API funcionando' }));

app.use('/api/auth',        authRoutes);
app.use('/api/alumnos',     alumnosRoutes);
app.use('/api/materias',    materiasRoutes);
app.use('/api/sesiones',    sesionesRoutes);
app.use('/api/asistencias', asistenciasRoutes);
app.use('/api/arduino',     arduinoRoutes);

app.listen(process.env.PORT || 3000, () =>
  console.log(`API corriendo en http://localhost:${process.env.PORT || 3000}`)
);