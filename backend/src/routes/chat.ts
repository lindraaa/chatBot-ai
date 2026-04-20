import { Router } from 'express';
import * as chatController from '../controllers/chatController';

const router: Router = Router();

// Chat Endpoints
router.post('/session', chatController.createSession);
router.post('/message', chatController.sendMessage);
router.post('/contact', chatController.submitContact);

export default router;
