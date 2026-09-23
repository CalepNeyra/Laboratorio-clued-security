import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { checkRBAC } from '../middlewares/rbac.middleware';
import { checkABAC } from '../middlewares/abac.middleware';
import { auditLogger } from '../middlewares/audit.middleware';
import { 
  getDocumentos, 
  crearDocumento, 
  modificarDocumento, 
  eliminarDocumento, 
  aprobarDocumento 
} from '../controllers/document.controller';

const router = Router();

router.use(authenticateToken);
router.use(auditLogger);

// Consultar (RBAC + ABAC)
router.get('/', checkRBAC('DOC_READ'), checkABAC, getDocumentos);

// Operaciones CRUD + Aprobar
router.post('/', checkRBAC('DOC_CREATE'), crearDocumento);
router.put('/:id', checkRBAC('DOC_UPDATE'), modificarDocumento);
router.delete('/:id', checkRBAC('DOC_DELETE'), eliminarDocumento);
router.patch('/:id/aprobar', checkRBAC('DOC_UPDATE'), aprobarDocumento);

export default router;