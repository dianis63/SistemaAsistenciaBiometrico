import { Router }       from 'express';
import * as ctrl        from '../controllers/alumnosController.js';
import { requireAuth }  from '../middlewares/authMiddleware.js';

const router = Router();
router.use(requireAuth);
router.get('/',                    ctrl.getAll);
router.get('/:id',                 ctrl.getById);
router.post('/',                   ctrl.create);
router.put('/:id',                 ctrl.update);
router.delete('/:id',              ctrl.remove);
router.post('/:id/registrar-huella', ctrl.registrarHuella);
router.delete('/:id/borrar-huella',  ctrl.borrarHuella);
export default router;