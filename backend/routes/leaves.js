const express = require('express');
const router  = express.Router();
const {
  applyLeave, getLeaves, getLeave,
  updateLeaveStatus, cancelLeave,
  getLeaveBalance, updateLeaveBalance
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../config/multer');

router.use(protect);
router.post('/',          upload.single('supportingDocument'), applyLeave);
router.get('/',           getLeaves);
router.get('/:id',        getLeave);
router.put('/:id/status', authorize('super_admin','hr_manager'), updateLeaveStatus);
router.put('/:id/cancel', cancelLeave);
router.get('/balance/:employeeId',   getLeaveBalance);
router.put('/balance/:employeeId',   authorize('super_admin','hr_manager'), updateLeaveBalance);

module.exports = router;

