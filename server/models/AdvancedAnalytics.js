const mongoose = require('mongoose');

/**
 * Advanced Analytics Schema for comprehensive mood and behavior tracking
 */

// User Session Schema
const userSessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number // in milliseconds
  },
  deviceInfo: {
    platform: String, // iOS, Android, Web
    version: String,
    model: String,
    os: String,
    screenResolution: String,
    timezone: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    city: String,
    country: String,
    accuracy: Number
  },
  context: {
    weather: {
      condition: String,
      temperature: Number,
      humidity: Number,
      pressure: Number
    },
    timeOfDay: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night']
    },
    dayOfWeek: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    isWeekend: Boolean,
    isHoliday: Boolean
  },
  activities: [{
    type: String,
    timestamp: Date,
    duration: Number,
    metadata: mongoose.Schema.Types.Mixed
  }],
  moodDetections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MoodDetection'
  }],
  musicInteractions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MusicInteraction'
  }],
  environmentChanges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnvironmentChange'
  }]
}, {
  timestamps: true
});

// Mood Detection Schema
const moodDetectionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  primaryMood: {
    emotion: {
      type: String,
      required: true,
      enum: ['happy', 'sad', 'angry', 'fearful', 'surprised', 'disgusted', 'neutral', 'excited', 'calm', 'anxious', 'confident', 'frustrated', 'content', 'melancholic']
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    intensity: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    }
  },
  secondaryMoods: [{
    emotion: String,
    confidence: Number,
    intensity: Number
  }],
  detectionMethods: {
    facial: {
      used: Boolean,
      confidence: Number,
      features: {
        eyeMovement: Number,
        mouthCurvature: Number,
        eyebrowPosition: Number,
        facialTension: Number
      },
      processingTime: Number
    },
    voice: {
      used: Boolean,
      confidence: Number,
      features: {
        pitch: Number,
        tone: Number,
        pace: Number,
        volume: Number,
        clarity: Number
      },
      processingTime: Number
    },
    text: {
      used: Boolean,
      confidence: Number,
      sentiment: {
        positive: Number,
        negative: Number,
        neutral: Number
      },
      keywords: [String],
      processingTime: Number
    },
    biometric: {
      used: Boolean,
      heartRate: Number,
      skinConductance: Number,
      bodyTemperature: Number,
      bloodPressure: {
        systolic: Number,
        diastolic: Number
      }
    }
  },
  fusionMetrics: {
    overallConfidence: Number,
    modalityAgreement: Number,
    processingTime: Number,
    modelVersion: String
  },
  contextualFactors: {
    location: String,
    activity: String,
    socialContext: String,
    environmentalNoise: Number,
    lightingConditions: String,
    timeContext: {
      hour: Number,
      dayOfWeek: String,
      isWorkingHours: Boolean
    }
  },
  personalityInfluence: {
    openness: Number,
    conscientiousness: Number,
    extraversion: Number,
    agreeableness: Number,
    neuroticism: Number,
    adjustmentFactor: Number
  },
  userFeedback: {
    providedAt: Date,
    accuracy: {
      type: Number,
      min: 1,
      max: 5
    },
    actualMood: String,
    comments: String,
    helpfulness: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  triggers: [{
    type: String,
    description: String,
    timestamp: Date,
    severity: {
      type: Number,
      min: 1,
      max: 10
    }
  }]
}, {
  timestamps: true
});

// Music Interaction Schema
const musicInteractionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true
  },
  moodDetectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MoodDetection'
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  interactionType: {
    type: String,
    required: true,
    enum: ['recommendation_generated', 'track_played', 'track_skipped', 'track_liked', 'track_disliked', 'playlist_created', 'volume_changed', 'platform_switched']
  },
  track: {
    id: String,
    platform: String,
    title: String,
    artist: String,
    album: String,
    genre: [String],
    duration: Number,
    popularity: Number,
    audioFeatures: {
      energy: Number,
      valence: Number,
      danceability: Number,
      acousticness: Number,
      instrumentalness: Number,
      tempo: Number,
      loudness: Number,
      speechiness: Number,
      liveness: Number
    },
    moodScore: Number,
    recommendationRank: Number
  },
  playlist: {
    id: String,
    name: String,
    platform: String,
    trackCount: Number,
    totalDuration: Number,
    averageMoodScore: Number
  },
  playbackDetails: {
    startTime: Date,
    endTime: Date,
    duration: Number,
    completionPercentage: Number,
    volume: Number,
    shuffle: Boolean,
    repeat: String, // 'off', 'track', 'playlist'
    device: String
  },
  userAction: {
    action: String, // 'play', 'pause', 'skip', 'like', 'dislike', 'add_to_playlist'
    timestamp: Date,
    context: String
  },
  recommendation: {
    strategy: String, // 'match', 'contrast', 'adaptive'
    confidence: Number,
    moodAlignment: Number,
    personalizedScore: Number,
    contextualRelevance: Number,
    novelty: Number,
    diversity: Number
  },
  feedback: {
    explicit: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      relevance: {
        type: Number,
        min: 1,
        max: 5
      },
      moodMatch: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: String
    },
    implicit: {
      playTime: Number,
      skipTime: Number,
      repeatCount: Number,
      shareCount: Number,
      addToPlaylistCount: Number
    }
  }
}, {
  timestamps: true
});

// Environment Change Schema
const environmentChangeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true
  },
  moodDetectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MoodDetection'
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  changeType: {
    type: String,
    required: true,
    enum: ['lighting', 'climate', 'audio', 'scene', 'automation']
  },
  devices: [{
    id: String,
    platform: String,
    type: String,
    name: String,
    previousState: mongoose.Schema.Types.Mixed,
    newState: mongoose.Schema.Types.Mixed,
    changeSuccess: Boolean,
    responseTime: Number,
    errorMessage: String
  }],
  scene: {
    id: String,
    name: String,
    mood: String,
    intensity: Number,
    deviceCount: Number,
    activationTime: Number
  },
  automation: {
    id: String,
    name: String,
    trigger: String,
    conditions: [mongoose.Schema.Types.Mixed],
    actions: [mongoose.Schema.Types.Mixed],
    executionTime: Number
  },
  environmentMetrics: {
    before: {
      averageBrightness: Number,
      averageTemperature: Number,
      averageVolume: Number,
      colorTemperature: Number,
      ambientNoise: Number
    },
    after: {
      averageBrightness: Number,
      averageTemperature: Number,
      averageVolume: Number,
      colorTemperature: Number,
      ambientNoise: Number
    },
    changeEffectiveness: Number
  },
  userResponse: {
    satisfactionRating: {
      type: Number,
      min: 1,
      max: 5
    },
    adjustmentsMade: [{
      device: String,
      adjustment: String,
      timestamp: Date
    }],
    timeToAdjustment: Number,
    overallFeedback: String
  },
  energyImpact: {
    estimatedConsumption: Number,
    costImpact: Number,
    efficiencyScore: Number,
    sustainabilityRating: Number
  }
}, {
  timestamps: true
});

// Wellness Metrics Schema
const wellnessMetricsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  period: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly'],
    index: true
  },
  moodMetrics: {
    averageMood: {
      emotion: String,
      valence: Number,
      arousal: Number
    },
    moodStability: Number,
    moodDiversity: Number,
    positiveEmotionRatio: Number,
    negativeEmotionRatio: Number,
    neutralEmotionRatio: Number,
    moodSwings: Number,
    emotionalRange: Number,
    dominantMoods: [{
      emotion: String,
      frequency: Number,
      averageIntensity: Number
    }]
  },
  behaviorMetrics: {
    appUsageTime: Number,
    sessionCount: Number,
    averageSessionDuration: Number,
    moodDetectionCount: Number,
    musicInteractionCount: Number,
    environmentChangeCount: Number,
    feedbackProvidedCount: Number,
    userEngagementScore: Number
  },
  wellnessIndicators: {
    overallWellnessScore: {
      type: Number,
      min: 0,
      max: 100
    },
    stressLevel: {
      type: Number,
      min: 0,
      max: 10
    },
    energyLevel: {
      type: Number,
      min: 0,
      max: 10
    },
    socialConnectedness: {
      type: Number,
      min: 0,
      max: 10
    },
    sleepQuality: {
      type: Number,
      min: 0,
      max: 10
    },
    productivityLevel: {
      type: Number,
      min: 0,
      max: 10
    },
    lifeSatisfaction: {
      type: Number,
      min: 0,
      max: 10
    }
  },
  patterns: {
    dailyMoodPattern: [{
      hour: Number,
      averageMood: String,
      averageValence: Number,
      frequency: Number
    }],
    weeklyMoodPattern: [{
      dayOfWeek: String,
      averageMood: String,
      averageValence: Number,
      frequency: Number
    }],
    contextualTriggers: [{
      trigger: String,
      frequency: Number,
      averageImpact: Number,
      associatedMoods: [String]
    }],
    musicPreferences: [{
      mood: String,
      preferredGenres: [String],
      averageAudioFeatures: mongoose.Schema.Types.Mixed,
      satisfactionScore: Number
    }],
    environmentPreferences: [{
      mood: String,
      preferredSettings: mongoose.Schema.Types.Mixed,
      effectivenessScore: Number
    }]
  },
  insights: [{
    type: String, // 'trend', 'anomaly', 'recommendation', 'achievement'
    title: String,
    description: String,
    confidence: Number,
    actionable: Boolean,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    category: String,
    generatedAt: Date,
    validUntil: Date
  }],
  goals: [{
    id: String,
    type: String,
    description: String,
    targetValue: Number,
    currentValue: Number,
    progress: Number,
    deadline: Date,
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'cancelled']
    }
  }],
  recommendations: [{
    type: String,
    title: String,
    description: String,
    category: String,
    priority: Number,
    estimatedImpact: Number,
    difficulty: Number,
    timeToImplement: Number,
    personalizedScore: Number,
    evidenceBased: Boolean,
    sources: [String]
  }]
}, {
  timestamps: true
});

// Predictive Analytics Schema
const predictiveAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  predictionType: {
    type: String,
    required: true,
    enum: ['mood_forecast', 'behavior_prediction', 'wellness_trend', 'risk_assessment', 'recommendation_optimization']
  },
  timeHorizon: {
    type: String,
    required: true,
    enum: ['1_hour', '6_hours', '1_day', '3_days', '1_week', '1_month']
  },
  generatedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: true
  },
  modelVersion: {
    type: String,
    required: true
  },
  inputFeatures: {
    historicalMoods: [mongoose.Schema.Types.Mixed],
    contextualFactors: mongoose.Schema.Types.Mixed,
    behaviorPatterns: mongoose.Schema.Types.Mixed,
    personalityProfile: mongoose.Schema.Types.Mixed,
    externalFactors: mongoose.Schema.Types.Mixed
  },
  predictions: [{
    timestamp: Date,
    predictedMood: {
      emotion: String,
      confidence: Number,
      intensity: Number,
      valence: Number,
      arousal: Number
    },
    predictedBehavior: {
      appUsageProbability: Number,
      musicListeningProbability: Number,
      environmentChangeProbability: Number,
      socialInteractionProbability: Number
    },
    riskFactors: [{
      factor: String,
      riskLevel: Number,
      description: String,
      mitigation: String
    }],
    opportunities: [{
      type: String,
      description: String,
      probability: Number,
      potentialImpact: Number
    }]
  }],
  accuracy: {
    overallAccuracy: Number,
    moodPredictionAccuracy: Number,
    behaviorPredictionAccuracy: Number,
    confidenceCalibration: Number,
    lastValidated: Date
  },
  interventions: [{
    type: String,
    trigger: String,
    action: String,
    timing: String,
    expectedOutcome: String,
    priority: Number
  }]
}, {
  timestamps: true
});

// A/B Testing Schema
const abTestingSchema = new mongoose.Schema({
  testId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  status: {
    type: String,
    required: true,
    enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  targetMetric: {
    type: String,
    required: true
  },
  variants: [{
    id: String,
    name: String,
    description: String,
    configuration: mongoose.Schema.Types.Mixed,
    trafficAllocation: Number,
    participants: [{
      userId: String,
      assignedAt: Date,
      interactions: Number,
      conversions: Number,
      metricValue: Number
    }]
  }],
  results: {
    totalParticipants: Number,
    conversionRate: mongoose.Schema.Types.Mixed,
    statisticalSignificance: Number,
    confidenceInterval: mongoose.Schema.Types.Mixed,
    effectSize: Number,
    winner: String,
    insights: [String]
  },
  segmentation: [{
    segment: String,
    criteria: mongoose.Schema.Types.Mixed,
    results: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Indexes for performance optimization
userSessionSchema.index({ userId: 1, startTime: -1 });
userSessionSchema.index({ 'location.coordinates': '2dsphere' });

moodDetectionSchema.index({ userId: 1, timestamp: -1 });
moodDetectionSchema.index({ 'primaryMood.emotion': 1, timestamp: -1 });
moodDetectionSchema.index({ sessionId: 1 });

musicInteractionSchema.index({ userId: 1, timestamp: -1 });
musicInteractionSchema.index({ interactionType: 1, timestamp: -1 });
musicInteractionSchema.index({ 'track.platform': 1 });

environmentChangeSchema.index({ userId: 1, timestamp: -1 });
environmentChangeSchema.index({ changeType: 1, timestamp: -1 });

wellnessMetricsSchema.index({ userId: 1, date: -1, period: 1 });
wellnessMetricsSchema.index({ date: -1, period: 1 });

predictiveAnalyticsSchema.index({ userId: 1, predictionType: 1, generatedAt: -1 });
predictiveAnalyticsSchema.index({ validUntil: 1 });

abTestingSchema.index({ status: 1, startDate: -1 });
abTestingSchema.index({ testId: 1 });

// Static methods for analytics queries
userSessionSchema.statics.getActiveUsers = function(timeframe = '24h') {
  const startTime = new Date();
  if (timeframe === '24h') {
    startTime.setHours(startTime.getHours() - 24);
  } else if (timeframe === '7d') {
    startTime.setDate(startTime.getDate() - 7);
  } else if (timeframe === '30d') {
    startTime.setDate(startTime.getDate() - 30);
  }
  
  return this.distinct('userId', {
    startTime: { $gte: startTime }
  });
};

moodDetectionSchema.statics.getMoodTrends = function(userId, days = 30) {
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
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp'
            }
          },
          mood: '$primaryMood.emotion'
        },
        count: { $sum: 1 },
        avgConfidence: { $avg: '$primaryMood.confidence' },
        avgIntensity: { $avg: '$primaryMood.intensity' }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);
};

musicInteractionSchema.statics.getListeningPatterns = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        userId: userId,
        timestamp: { $gte: startDate },
        interactionType: 'track_played'
      }
    },
    {
      $group: {
        _id: {
          hour: { $hour: '$timestamp' },
          genre: '$track.genre'
        },
        count: { $sum: 1 },
        avgDuration: { $avg: '$playbackDetails.duration' },
        avgCompletion: { $avg: '$playbackDetails.completionPercentage' }
      }
    },
    {
      $sort: { '_id.hour': 1, count: -1 }
    }
  ]);
};

wellnessMetricsSchema.statics.getWellnessTrend = function(userId, period = 'daily', limit = 30) {
  return this.find({
    userId: userId,
    period: period
  })
  .sort({ date: -1 })
  .limit(limit)
  .select('date wellnessIndicators.overallWellnessScore moodMetrics.averageMood');
};

// Virtual fields
wellnessMetricsSchema.virtual('wellnessGrade').get(function() {
  const score = this.wellnessIndicators.overallWellnessScore;
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
});

// Pre-save middleware
userSessionSchema.pre('save', function(next) {
  if (this.endTime && this.startTime) {
    this.duration = this.endTime - this.startTime;
  }
  next();
});

moodDetectionSchema.pre('save', function(next) {
  // Set time context
  const hour = this.timestamp.getHours();
  this.contextualFactors.timeContext = {
    hour: hour,
    dayOfWeek: this.timestamp.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
    isWorkingHours: hour >= 9 && hour <= 17
  };
  next();
});

// Export models
module.exports = {
  UserSession: mongoose.model('UserSession', userSessionSchema),
  MoodDetection: mongoose.model('MoodDetection', moodDetectionSchema),
  MusicInteraction: mongoose.model('MusicInteraction', musicInteractionSchema),
  EnvironmentChange: mongoose.model('EnvironmentChange', environmentChangeSchema),
  WellnessMetrics: mongoose.model('WellnessMetrics', wellnessMetricsSchema),
  PredictiveAnalytics: mongoose.model('PredictiveAnalytics', predictiveAnalyticsSchema),
  ABTesting: mongoose.model('ABTesting', abTestingSchema)
};