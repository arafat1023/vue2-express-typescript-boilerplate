import { Schema } from 'mongoose';

export default new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'non-admin'],
    default: 'non-admin',
  },
  socialLogins: [{
    name: String,
    token: String,
    meta: Object,
  }],
  isVerified: {
    type: Boolean,
    default: false,
  },
  isFirstLogin: {
    type: Boolean,
    default: false,
  },
  /**
   * `referralCode` is attached to each invitation a user makes
   * to identify the invitor.
   */
  referralCode: {
    type: String,
    required: true,
  },

  /**
   * If this user created this account while accepting
   * an invitation of another user, then `referredCode`
   * will hold the `referralCode` of the other user.
   */
  referredCode: String,
  profileImage: String,
  password: String, // password hash
  resetPasswordToken: String,
  verificationToken: String,
}, { timestamps: true });
