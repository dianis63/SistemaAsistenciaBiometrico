import { Router }      from 'express';
import * as ctrl       from '../controllers/materiasController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();
router.use(requireAuth);
router.get('/',                       ctrl.getAll);
router.get('/:id',                    ctrl.getById);
router.post('/',                      ctrl.create);
router.put('/:id',                    ctrl.update);
router.delete('/:id',                 ctrl.remove);
router.get('/:id/alumnos',            ctrl.getAlumnos);
router.post('/:id/alumnos',           ctrl.inscribir);
router.delete('/:id/alumnos/:aid',    ctrl.desinscribir);
export default router;