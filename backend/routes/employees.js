const express  = require('express');
const router   = express.Router();
const {
  getEmployees, getEmployee, createEmployee,
  updateEmployee, deleteEmployee, getEmployeeStats, exportEmployees
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../config/multer');

router.use(protect);

router.get('/stats',  authorize('super_admin','hr_manager'), getEmployeeStats);
router.get('/export', authorize('super_admin','hr_manager'), exportEmployees);
router.get('/',       getEmployees);
router.get('/:id',    getEmployee);
router.post('/',  authorize('super_admin','hr_manager'), upload.single('avatar'), createEmployee);
router.put('/:id',authorize('super_admin','hr_manager'), upload.single('avatar'), updateEmployee);
router.delete('/:id', authorize('super_admin'), deleteEmployee);

module.exports = router;

