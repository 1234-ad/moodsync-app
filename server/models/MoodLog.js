const mongoose = require('mongoose');

const moodLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  mood: {
    type: String,
    required: true,
    enum: ['happy', 'sad', 'angry', 'calm', 'energetic', 'romantic', 'neutral', 'surprised', 'fearful', 'disgusted']
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  detectionMethod: {
    type: String,
    enum: ['facial', 'voice', 'manual', 'combined'],
    default: 'facial'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  context: {
    location: String,
    activity: String,
    weather: String,
    timeOfDay: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night']
    }
  },
  environmentSync: {
    musicPlayed: {
      trackId: String,
      trackName: String,
      artist: String,
      genre: String
    },
    lightingAdjusted: {
      brightness: Number,
      color: String,
      temperature: Number
    },
    deviceSettings: {
      volume: Number,
      screenBrightness: Number,
      theme: String
    }
  },
  userFeedback: {
    accuracy: {
      type: Number,
      min: 1,
      max: 5
    },
    satisfaction: {
      type: Number,
      min: 1,
      max: 5
    },
    notes: String
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
moodLogSchema.index({ userId: 1, timestamp: -1 });
moodLogSchema.index({ mood: 1, timestamp: -1 });
moodLogSchema.index({ userId: 1, mood: 1 });

// Static methods for analytics
moodLogSchema.statics.getMoodTrends = function(userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        userId: userId,
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          mood: '$mood',
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp'
            }
          }
        },
        count: { $sum: 1 },
        avgConfidence: { $avg: '$confidence' }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);
};

moodLogSchema.statics.getDailyMoodPattern = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        userId: userId,
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          hour: { $hour: '$timestamp' },
          mood: '$mood'
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.hour': 1 }
    }
  ]);
};

moodLogSchema.statics.getMoodCorrelations = function(userId) {
  return this.aggregate([
    {
      $match: { userId: userId }
    },
    {
      $group: {
        _id: {
          mood: '$mood',
          weather: '$context.weather',
          timeOfDay: '$context.timeOfDay',
          activity: '$context.activity'
        },
        count: { $sum: 1 },
        avgConfidence: { $avg: '$confidence' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Instance methods
moodLogSchema.methods.getTimeOfDay = function() {
  const hour = this.timestamp.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

moodLogSchema.methods.isHighConfidence = function() {
  return this.confidence >= 0.7;
};

// Pre-save middleware to set timeOfDay
moodLogSchema.pre('save', function(next) {
  if (!this.context.timeOfDay) {
    this.context.timeOfDay = this.getTimeOfDay();
  }
  next();
});

module.exports = mongoose.model('MoodLog', moodLogSchema);