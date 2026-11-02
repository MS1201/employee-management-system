const Notification = require('../models/Notification');

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort('-createdAt')
      .limit(50);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.status(200).json({ success: true, count: notifications.length, unreadCount, data: notifications });
  } catch (error) { next(error); }
};

exports.markAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) { next(error); }
};

exports.markOneRead = async (req, res, next) => {
  try {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!n) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.status(200).json({ success: true, data: n });
  } catch (error) { next(error); }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) { next(error); }
};

exports.createAnnouncement = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const { title, message, targetRole } = req.body;
    const query = targetRole ? { role: targetRole } : {};
    const users = await User.find(query).select('_id');
    await Notification.insertMany(users.map(u => ({
      recipient: u._id,
      type: 'announcement',
      title,
      message
    })));
    res.status(201).json({ success: true, message: 'Announcement sent to all users' });
  } catch (error) { next(error); }
};

