import mongoose from 'mongoose';
import { ACTIVITY_ACTIONS } from '../constants/index.js';

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    action: {
      type: String,
      required: true,
      enum: Object.values(ACTIVITY_ACTIONS),
      index: true
    },
    resourceType: {
      type: String,
      enum: ['USER', 'POST', 'COMMENT', 'AUTH'],
      required: true
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    ipAddress: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

activityLogSchema.index({ createdAt: -1 });

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
