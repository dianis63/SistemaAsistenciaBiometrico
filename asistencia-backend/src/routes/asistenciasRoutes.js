import { Router }      from 'express';
import { get }         from '../controllers/asistenciasController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();
router.use(requireAuth);
router.get('/', get);
export default router;