import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { checkRBAC } from '../middlewares/rbac.middleware';
import { getAuditLogs } from '../controllers/audit.controller';

const router = Router();

// Solo el rol AUDITOR o ADMINISTRADOR accede según RBAC
router.get('/', authenticateToken, checkRBAC('READ'), getAuditLogs);

export default router;