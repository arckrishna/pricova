const mongoose = require('mongoose');

const platformSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide shopping platform name'],
      unique: true,
      trim: true,
    },
    logo: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      required: [true, 'Please provide platform website URL'],
      trim: true,
    },
    color: {
      type: String,
      default: '#4f46e5',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Platform', platformSchema);
