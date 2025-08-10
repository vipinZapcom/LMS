const mongoose = require('mongoose');

const courseAssignmentSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  assignedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CourseAssignment', courseAssignmentSchema);
