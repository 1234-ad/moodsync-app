# MoodSync API Documentation

## Overview

The MoodSync API is a comprehensive RESTful API that provides endpoints for mood detection, music recommendations, smart home control, and analytics. The API follows REST principles and uses JSON for data exchange.

**Base URL:** `https://api.moodsync.ai/v1`

**Authentication:** Bearer Token (JWT)

## Table of Contents

1. [Authentication](#authentication)
2. [Mood Detection API](#mood-detection-api)
3. [Music Intelligence API](#music-intelligence-api)
4. [Smart Home API](#smart-home-api)
5. [Analytics API](#analytics-api)
6. [User Management API](#user-management-api)
7. [Webhooks](#webhooks)
8. [Rate Limiting](#rate-limiting)
9. [Error Handling](#error-handling)
10. [SDKs](#sdks)

## Authentication

### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "preferences": {}
    },
    "expiresIn": 3600
  }
}
```

### POST /auth/oauth/google
Authenticate with Google OAuth.

**Request Body:**
```json
{
  "code": "google_auth_code",
  "redirectUri": "https://app.moodsync.ai/callback"
}
```

### POST /auth/oauth/spotify
Authenticate with Spotify OAuth.

**Request Body:**
```json
{
  "code": "spotify_auth_code",
  "redirectUri": "https://app.moodsync.ai/callback"
}
```

### POST /auth/refresh
Refresh JWT token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

## Mood Detection API

### POST /mood/detect
Detect mood from multiple input sources.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `image` (file, optional): Image file for facial emotion detection
- `audio` (file, optional): Audio file for voice emotion analysis
- `text` (string, optional): Text for sentiment analysis
- `context` (JSON string, optional): Contextual information

**Context Object:**
```json
{
  "location": "home",
  "activity": "working",
  "timeOfDay": "afternoon",
  "weather": "sunny",
  "socialContext": "alone"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "detectionId": "detection_id_123",
    "primaryMood": {
      "emotion": "happy",
      "confidence": 0.87,
      "intensity": 0.72
    },
    "secondaryMoods": [
      {
        "emotion": "excited",
        "confidence": 0.65,
        "intensity": 0.58
      }
    ],
    "modalityContributions": {
      "facial": 0.45,
      "voice": 0.35,
      "text": 0.20
    },
    "processingTime": 1250,
    "timestamp": "2023-12-01T10:30:00Z",
    "insights": {
      "authenticity": 0.82,
      "stability": 0.75,
      "triggers": []
    }
  }
}
```

### GET /mood/history
Get user's mood history with filtering options.

**Query Parameters:**
- `startDate` (ISO date): Start date for history
- `endDate` (ISO date): End date for history
- `limit` (number): Maximum number of records (default: 50)
- `offset` (number): Pagination offset (default: 0)
- `emotions` (array): Filter by specific emotions
- `minConfidence` (number): Minimum confidence threshold

**Response:**
```json
{
  "success": true,
  "data": {
    "moods": [
      {
        "id": "mood_id_123",
        "primaryMood": {
          "emotion": "happy",
          "confidence": 0.87,
          "intensity": 0.72
        },
        "timestamp": "2023-12-01T10:30:00Z",
        "context": {
          "location": "home",
          "activity": "working"
        }
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 50,
      "offset": 0,
      "hasMore": true
    },
    "analytics": {
      "averageMood": "happy",
      "moodStability": 0.78,
      "dominantEmotions": ["happy", "calm", "focused"]
    }
  }
}
```

### GET /mood/trends
Get mood trends and patterns analysis.

**Query Parameters:**
- `period` (string): Analysis period (daily, weekly, monthly)
- `days` (number): Number of days to analyze (default: 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "trends": {
      "dailyPattern": [
        {
          "hour": 9,
          "averageMood": "energetic",
          "averageValence": 0.75,
          "frequency": 25
        }
      ],
      "weeklyPattern": [
        {
          "dayOfWeek": "monday",
          "averageMood": "focused",
          "averageValence": 0.65,
          "frequency": 120
        }
      ]
    },
    "insights": [
      {
        "type": "pattern",
        "title": "Morning Energy Peak",
        "description": "You tend to be most energetic between 9-11 AM",
        "confidence": 0.89
      }
    ]
  }
}
```

## Music Intelligence API

### POST /music/recommendations
Get mood-based music recommendations.

**Request Body:**
```json
{
  "moodData": {
    "mood": "happy",
    "confidence": 0.87,
    "intensity": 0.72,
    "secondaryEmotions": ["excited"]
  },
  "context": {
    "timeOfDay": "afternoon",
    "activity": "working",
    "location": "home"
  },
  "options": {
    "limit": 50,
    "strategy": "adaptive",
    "platforms": ["spotify", "appleMusic"],
    "includeAnalysis": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendationId": "rec_id_123",
    "mood": "happy",
    "strategy": "adaptive",
    "totalTracks": 50,
    "recommendations": [
      {
        "id": "track_id_123",
        "platform": "spotify",
        "title": "Good as Hell",
        "artist": "Lizzo",
        "album": "Cuz I Love You",
        "duration": 219000,
        "popularity": 85,
        "moodScore": 0.92,
        "audioFeatures": {
          "energy": 0.89,
          "valence": 0.95,
          "danceability": 0.83,
          "tempo": 140
        },
        "preview_url": "https://preview.spotify.com/...",
        "external_urls": {
          "spotify": "https://open.spotify.com/track/..."
        }
      }
    ],
    "audioFeatures": {
      "energy": [0.7, 1.0],
      "valence": [0.7, 1.0],
      "danceability": [0.6, 1.0]
    },
    "timestamp": "2023-12-01T10:30:00Z"
  }
}
```

### POST /music/playlist/create
Create a mood-based playlist.

**Request Body:**
```json
{
  "name": "Happy Vibes",
  "description": "AI-generated playlist for happy mood",
  "moodData": {
    "mood": "happy",
    "confidence": 0.87
  },
  "platform": "spotify",
  "isPublic": false,
  "trackIds": ["track_id_1", "track_id_2"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "playlist": {
      "id": "playlist_id_123",
      "name": "Happy Vibes",
      "url": "https://open.spotify.com/playlist/...",
      "trackCount": 25,
      "platform": "spotify",
      "createdAt": "2023-12-01T10:30:00Z"
    }
  }
}
```

### POST /music/play
Start playing mood-based music.

**Request Body:**
```json
{
  "moodData": {
    "mood": "happy",
    "confidence": 0.87
  },
  "platform": "spotify",
  "deviceId": "device_id_123",
  "options": {
    "shuffle": true,
    "volume": 75
  }
}
```

### GET /music/platforms
Get available music platforms and their status.

**Response:**
```json
{
  "success": true,
  "data": {
    "platforms": [
      {
        "name": "spotify",
        "connected": true,
        "features": ["recommendations", "playback", "playlists"],
        "lastSync": "2023-12-01T10:00:00Z"
      },
      {
        "name": "appleMusic",
        "connected": false,
        "features": ["recommendations"],
        "lastSync": null
      }
    ]
  }
}
```

## Smart Home API

### GET /smarthome/devices
Get all connected smart home devices.

**Query Parameters:**
- `type` (string): Filter by device type (lighting, climate, security)
- `platform` (string): Filter by platform (philipsHue, lifx, nest)
- `status` (string): Filter by status (online, offline)

**Response:**
```json
{
  "success": true,
  "data": {
    "devices": [
      {
        "id": "hue_1",
        "platform": "philipsHue",
        "name": "Living Room Light",
        "type": "lighting",
        "subtype": "bulb",
        "capabilities": {
          "brightness": true,
          "color": true,
          "temperature": true
        },
        "state": {
          "on": true,
          "brightness": 75,
          "color": "#FFD700",
          "temperature": 3000
        },
        "lastUpdated": "2023-12-01T10:25:00Z"
      }
    ],
    "stats": {
      "total": 15,
      "online": 14,
      "byType": {
        "lighting": 8,
        "climate": 3,
        "security": 4
      }
    }
  }
}
```

### POST /smarthome/environment/apply
Apply mood-based environment changes.

**Request Body:**
```json
{
  "mood": "happy",
  "intensity": 0.8,
  "options": {
    "lighting": true,
    "climate": true,
    "entertainment": false
  },
  "customSettings": {
    "lighting": {
      "brightness": 85,
      "color": "#FFD700"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "environmentId": "env_change_123",
    "mood": "happy",
    "intensity": 0.8,
    "results": {
      "lighting": [
        {
          "deviceId": "hue_1",
          "deviceName": "Living Room Light",
          "success": true,
          "config": {
            "brightness": 85,
            "color": "#FFD700"
          }
        }
      ],
      "climate": [
        {
          "deviceId": "nest_1",
          "deviceName": "Main Thermostat",
          "success": true,
          "config": {
            "temperature": 22
          }
        }
      ]
    },
    "sceneId": "scene_123",
    "timestamp": "2023-12-01T10:30:00Z"
  }
}
```

### GET /smarthome/scenes
Get saved environment scenes.

**Response:**
```json
{
  "success": true,
  "data": {
    "scenes": [
      {
        "id": "scene_123",
        "name": "Happy Mood",
        "mood": "happy",
        "intensity": 0.8,
        "deviceCount": 5,
        "created": "2023-12-01T10:30:00Z",
        "lastUsed": "2023-12-01T15:45:00Z"
      }
    ]
  }
}
```

### POST /smarthome/scenes/{sceneId}/activate
Activate a saved scene.

**Response:**
```json
{
  "success": true,
  "data": {
    "sceneId": "scene_123",
    "activatedDevices": 5,
    "failedDevices": 0,
    "activationTime": 2500
  }
}
```

### GET /smarthome/automations
Get automation rules.

**Response:**
```json
{
  "success": true,
  "data": {
    "automations": [
      {
        "id": "auto_123",
        "name": "Automatic Mood Sync",
        "trigger": "mood_detected",
        "conditions": [
          {
            "type": "confidence",
            "operator": ">",
            "value": 0.7
          }
        ],
        "actions": [
          {
            "type": "apply_mood_environment",
            "intensity": 0.8
          }
        ],
        "enabled": true,
        "lastTriggered": "2023-12-01T14:20:00Z"
      }
    ]
  }
}
```

## Analytics API

### GET /analytics/dashboard
Get comprehensive analytics dashboard data.

**Query Parameters:**
- `period` (string): Time period (24h, 7d, 30d, 90d)
- `metrics` (array): Specific metrics to include

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalSessions": 45,
      "averageSessionDuration": 1800,
      "moodDetections": 120,
      "environmentChanges": 35,
      "wellnessScore": 78
    },
    "moodMetrics": {
      "averageMood": "happy",
      "moodStability": 0.82,
      "positiveEmotionRatio": 0.65,
      "dominantMoods": [
        {
          "emotion": "happy",
          "frequency": 35,
          "averageIntensity": 0.75
        }
      ]
    },
    "behaviorMetrics": {
      "appUsageTime": 7200,
      "musicInteractions": 25,
      "feedbackProvided": 8,
      "userEngagementScore": 0.85
    },
    "insights": [
      {
        "type": "trend",
        "title": "Improving Mood Stability",
        "description": "Your mood stability has improved by 15% this week",
        "confidence": 0.89,
        "priority": "medium"
      }
    ]
  }
}
```

### GET /analytics/wellness
Get wellness metrics and recommendations.

**Response:**
```json
{
  "success": true,
  "data": {
    "wellnessScore": 78,
    "wellnessGrade": "B+",
    "indicators": {
      "stressLevel": 3.2,
      "energyLevel": 7.8,
      "socialConnectedness": 6.5,
      "lifeSatisfaction": 7.2
    },
    "trends": {
      "weeklyChange": 5.2,
      "monthlyChange": 12.8,
      "trajectory": "improving"
    },
    "recommendations": [
      {
        "type": "activity",
        "title": "Morning Meditation",
        "description": "Try 10 minutes of meditation to improve stress levels",
        "priority": 8,
        "estimatedImpact": 0.15,
        "category": "mindfulness"
      }
    ]
  }
}
```

### GET /analytics/predictions
Get predictive analytics and forecasts.

**Query Parameters:**
- `horizon` (string): Prediction horizon (1_hour, 6_hours, 1_day, 1_week)
- `type` (string): Prediction type (mood_forecast, behavior_prediction)

**Response:**
```json
{
  "success": true,
  "data": {
    "predictionId": "pred_123",
    "type": "mood_forecast",
    "horizon": "1_day",
    "generatedAt": "2023-12-01T10:30:00Z",
    "predictions": [
      {
        "timestamp": "2023-12-01T14:00:00Z",
        "predictedMood": {
          "emotion": "focused",
          "confidence": 0.78,
          "intensity": 0.65
        },
        "probability": 0.82
      }
    ],
    "riskFactors": [
      {
        "factor": "high_workload",
        "riskLevel": 0.3,
        "description": "Increased workload may affect mood stability"
      }
    ],
    "interventions": [
      {
        "type": "music_recommendation",
        "trigger": "stress_detected",
        "action": "play_calming_music",
        "timing": "immediate"
      }
    ]
  }
}
```

## User Management API

### GET /users/profile
Get user profile information.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://avatar.url",
      "preferences": {
        "moodDetectionFrequency": "automatic",
        "musicPlatforms": ["spotify"],
        "smartHomeEnabled": true,
        "notificationsEnabled": true
      },
      "subscription": {
        "plan": "premium",
        "status": "active",
        "expiresAt": "2024-12-01T00:00:00Z"
      },
      "createdAt": "2023-01-01T00:00:00Z",
      "lastActive": "2023-12-01T10:00:00Z"
    }
  }
}
```

### PUT /users/profile
Update user profile.

**Request Body:**
```json
{
  "name": "John Smith",
  "preferences": {
    "moodDetectionFrequency": "manual",
    "notificationsEnabled": false
  }
}
```

### GET /users/settings
Get user settings and configurations.

### PUT /users/settings
Update user settings.

### DELETE /users/account
Delete user account and all associated data.

## Webhooks

### POST /webhooks/register
Register a webhook endpoint.

**Request Body:**
```json
{
  "url": "https://your-app.com/webhook",
  "events": ["mood_detected", "environment_changed", "music_played"],
  "secret": "webhook_secret"
}
```

### Webhook Events

#### mood_detected
Triggered when a new mood is detected.

**Payload:**
```json
{
  "event": "mood_detected",
  "timestamp": "2023-12-01T10:30:00Z",
  "userId": "user_123",
  "data": {
    "detectionId": "detection_123",
    "primaryMood": {
      "emotion": "happy",
      "confidence": 0.87
    }
  }
}
```

#### environment_changed
Triggered when smart home environment changes.

#### music_played
Triggered when music playback starts.

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Free Tier:** 100 requests per hour
- **Premium Tier:** 1000 requests per hour
- **Enterprise Tier:** 10000 requests per hour

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1701432000
```

## Error Handling

All API errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is invalid",
    "details": {
      "field": "email",
      "reason": "Email format is invalid"
    },
    "timestamp": "2023-12-01T10:30:00Z",
    "requestId": "req_123"
  }
}
```

### Common Error Codes

- `AUTHENTICATION_REQUIRED` (401): Authentication token required
- `INVALID_TOKEN` (401): Invalid or expired token
- `INSUFFICIENT_PERMISSIONS` (403): User lacks required permissions
- `RESOURCE_NOT_FOUND` (404): Requested resource not found
- `VALIDATION_ERROR` (400): Request validation failed
- `RATE_LIMIT_EXCEEDED` (429): Rate limit exceeded
- `INTERNAL_ERROR` (500): Internal server error
- `SERVICE_UNAVAILABLE` (503): Service temporarily unavailable

## SDKs

Official SDKs are available for:

### JavaScript/TypeScript
```bash
npm install @moodsync/sdk
```

```javascript
import { MoodSyncClient } from '@moodsync/sdk';

const client = new MoodSyncClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.moodsync.ai/v1'
});

// Detect mood
const moodResult = await client.mood.detect({
  image: imageFile,
  context: { activity: 'working' }
});

// Get recommendations
const recommendations = await client.music.getRecommendations({
  moodData: moodResult.data,
  options: { limit: 20 }
});
```

### Python
```bash
pip install moodsync-sdk
```

```python
from moodsync import MoodSyncClient

client = MoodSyncClient(api_key='your_api_key')

# Detect mood
mood_result = client.mood.detect(
    image=image_file,
    context={'activity': 'working'}
)

# Get recommendations
recommendations = client.music.get_recommendations(
    mood_data=mood_result['data'],
    options={'limit': 20}
)
```

### React Native
```bash
npm install @moodsync/react-native-sdk
```

```javascript
import { MoodSyncRN } from '@moodsync/react-native-sdk';

// Initialize
await MoodSyncRN.initialize('your_api_key');

// Detect mood from camera
const moodResult = await MoodSyncRN.detectMoodFromCamera({
  context: { activity: 'working' }
});
```

## Postman Collection

Import our Postman collection for easy API testing:
[Download Postman Collection](https://api.moodsync.ai/postman/collection.json)

## OpenAPI Specification

Full OpenAPI 3.0 specification available at:
[https://api.moodsync.ai/docs/openapi.json](https://api.moodsync.ai/docs/openapi.json)

## Support

For API support and questions:
- Email: api-support@moodsync.ai
- Documentation: https://docs.moodsync.ai
- Status Page: https://status.moodsync.ai
- Discord: https://discord.gg/moodsync