const express = require('express');
const router  = express.Router();
const {
  getDocuments, getDocument, uploadDocument,
  downloadDocument, deleteDocument
} = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../config/multer');

router.use(protect);
router.get('/',            getDocuments);
router.get('/:id',         getDocument);
router.post('/',           upload.single('file'), uploadDocument);
router.get('/:id/download',downloadDocument);
router.delete('/:id',      authorize('super_admin','hr_manager'), deleteDocument);

module.exports = router;

