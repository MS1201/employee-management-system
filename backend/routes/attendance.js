const express = require('express');
const router  = express.Router();
const {
  checkIn, checkOut, getAttendance,
  updateAttendance, markAbsent, getMonthlyReport
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.post('/checkin',   checkIn);
router.post('/checkout',  checkOut);
router.post('/absent',    authorize('super_admin','hr_manager'), markAbsent);
router.get('/',           getAttendance);
router.get('/monthly-report', authorize('super_admin','hr_manager'), getMonthlyReport);
router.put('/:id',        authorize('super_admin','hr_manager'), updateAttendance);

module.exports = router;

