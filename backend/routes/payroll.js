const express = require('express');
const router  = express.Router();
const {
  getPayrolls, getPayroll, createPayroll,
  updatePayroll, deletePayroll, getPayrollSummary
} = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/summary', authorize('super_admin','hr_manager'), getPayrollSummary);
router.get('/',        getPayrolls);
router.get('/:id',     getPayroll);
router.post('/',   authorize('super_admin','hr_manager'), createPayroll);
router.put('/:id', authorize('super_admin','hr_manager'), updatePayroll);
router.delete('/:id', authorize('super_admin'), deletePayroll);

module.exports = router;

