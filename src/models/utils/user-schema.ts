import mongoose from 'mongoose';
import UserDTO from '../../dtos/utils/user.dto';

const userSchema = new mongoose.Schema({
  created: {
    at: {
      default: Date.now,
      required: true,
      type: Date,
    },
    by: {
      required: true,
      type: String,
    },
  },
  email: {
    match: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
    required: true,
    trim: true,
    type: String,
    unique: true,
  },
  firstName: {
    trim: true,
    type: String,
  },
  hasPassword: {
    type: Boolean,
    default: true
  },
  hasSecurityQuestions: {
    type: Boolean,
    default: false
  },
  lastFailureTime: {
    type: Date,
  },
  lastLoginTime: {
    type: Date,
  },
  lastLogoutTime: {
    type: Date,
  },
  lastName: {
    trim: true,
    type: String,
  },
  loginFailureAttempts: {
    default: 0,
    type: Number,
  },
  modified: {
    at: {
      type: Date,
    },
    by: {
      type: String,
    },
  },
  password: {
    trim: true,
    type: String,
  },
  passwordExpiryDate: {
    type: Date,
  },
  passwordSecret: {
    trim: true,
    type: String,
  },
  resetPassword: {
    default: false,
    type: Boolean,
  },
  securityAnswer1: {
    type: String,
  },
  securityAnswer2: {
    type: String,
  },
  securityQuestion1: {
    type: String,
  },
  securityQuestion2: {
    type: String,
  },
  userType: {
    required: true,
    trim: true,
    type: String,
  },
  userStatus: {
    required: true,
    type: String
  }
});

export const userModel = mongoose.model<UserDTO & mongoose.Document>(
  'users',
  userSchema,
);
