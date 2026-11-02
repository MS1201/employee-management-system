const express = require('express');
const router  = express.Router();
const {
  getPerformances, getPerformance,
  createPerformance, updatePerformance, deletePerformance
} = require('../controllers/performanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/',      getPerformances);
router.get('/:id',   getPerformance);
router.post('/',   authorize('super_admin','hr_manager'), createPerformance);
router.put('/:id', authorize('super_admin','hr_manager'), updatePerformance);
router.delete('/:id', authorize('super_admin'), deletePerformance);

module.exports = router;

