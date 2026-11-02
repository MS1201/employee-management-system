const express = require('express');
const router  = express.Router();
const {
  getDepartments, getDepartment,
  createDepartment, updateDepartment, deleteDepartment
} = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/',     getDepartments);
router.get('/:id',  getDepartment);
router.post('/',    authorize('super_admin','hr_manager'), createDepartment);
router.put('/:id',  authorize('super_admin','hr_manager'), updateDepartment);
router.delete('/:id',authorize('super_admin'), deleteDepartment);

module.exports = router;

