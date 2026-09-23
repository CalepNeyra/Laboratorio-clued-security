import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { checkRBAC } from '../middlewares/rbac.middleware';
import { registrarUsuario, modificarUsuario, cambiarEstadoUsuario } from '../controllers/user.controller';

const router = Router();

router.use(authenticateToken); // Requiere token para todas las operaciones

router.post('/', checkRBAC('USER_CREATE'), registrarUsuario);
router.put('/:id', checkRBAC('USER_UPDATE'), modificarUsuario);
router.patch('/:id/estado', checkRBAC('USER_UPDATE'), cambiarEstadoUsuario);

export default router;