import { Router } from 'express';
import multer from 'multer';
import * as adminController from '../controllers/adminController';

const router: Router = Router();
const upload = multer({ dest: 'uploads/' });

// Admin Endpoints
router.post('/upload-pdf', upload.single('file'), adminController.uploadPdf);
router.get('/pdf-status', adminController.getPdfStatus);
// Stream endpoint MUST come before /stats to match first
router.get('/stats/stream', adminController.streamStats);
router.get('/stats', adminController.getStats);

export default router;


