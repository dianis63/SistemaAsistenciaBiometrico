import { Router }          from 'express';
import * as ctrl           from '../controllers/arduinoController.js';
import { requireArduino }  from '../middlewares/authMiddleware.js';

const router = Router();
router.use(requireArduino);
router.get('/sesion-activa',           ctrl.getSesionActiva);
router.get('/comando-pendiente',       ctrl.getComando);
router.post('/asistencia',             ctrl.postAsistencia);
router.post('/huella-registrada',      ctrl.huellaRegistrada);
router.put('/comando/:id/ejecutado',   ctrl.marcarEjecutado);
export default router;