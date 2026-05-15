import { Router }      from 'express';
import * as ctrl       from '../controllers/sesionesController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();
router.use(requireAuth);
router.get('/',           ctrl.getAll);
router.get('/activa',     ctrl.getActiva);
router.post('/iniciar',   ctrl.iniciar);
router.put('/:id/cerrar', ctrl.cerrar);
export default router;