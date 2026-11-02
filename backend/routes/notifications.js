const express = require('express');
const router  = express.Router();
const {
  getNotifications, markAsRead, markOneRead,
  deleteNotification, createAnnouncement
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/',                 getNotifications);
router.put('/mark-all-read',    markAsRead);
router.put('/:id/read',         markOneRead);
router.delete('/:id',           deleteNotification);
router.post('/announcement',    authorize('super_admin','hr_manager'), createAnnouncement);

module.exports = router;

