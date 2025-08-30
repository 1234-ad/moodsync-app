import SpotifyWebApi from 'spotify-web-api-node';
import axios from 'axios';
import { Audio } from 'expo-av';
import * as tf from '@tensorflow/tfjs';

/**
 * Advanced Music Intelligence Service
 * Combines multiple music platforms with AI-driven recommendations
 */
class AdvancedMusicService {
  constructor() {
    this.platforms = {
      spotify: null,
      appleMusic: null,
      youtubeMusic: null,
      soundcloud: null,
      lastfm: null,
      genius: null
    };
    
    this.audioAnalyzer = null;
    this.recommendationEngine = null;
    this.playbackHistory = [];
    this.userPreferences = {};
    this.moodMusicMappings = new Map();
    
    // Advanced mood-music correlation matrix
    this.moodMusicMatrix = {
      happy: {
        genres: ['pop', 'dance', 'funk', 'reggae', 'indie-pop'],
        audioFeatures: {
          energy: [0.7, 1.0],
          valence: [0.7, 1.0],
          danceability: [0.6, 1.0],
          tempo: [120, 180],
          acousticness: [0.0, 0.4],
          instrumentalness: [0.0, 0.3]
        },
        keywords: ['upbeat', 'cheerful', 'positive', 'energetic', 'feel-good']
      },
      sad: {
        genres: ['indie', 'folk', 'acoustic', 'blues', 'alternative'],
        audioFeatures: {
          energy: [0.1, 0.5],
          valence: [0.0, 0.4],
          danceability: [0.0, 0.4],
          tempo: [60, 120],
          acousticness: [0.3, 1.0],
          instrumentalness: [0.0, 0.7]
        },
        keywords: ['melancholy', 'emotional', 'introspective', 'heartbreak', 'contemplative']
      },
      angry: {
        genres: ['rock', 'metal', 'punk', 'hardcore', 'industrial'],
        audioFeatures: {
          energy: [0.7, 1.0],
          valence: [0.0, 0.4],
          danceability: [0.3, 0.8],
          tempo: [140, 200],
          acousticness: [0.0, 0.2],
          instrumentalness: [0.0, 0.5]
        },
        keywords: ['aggressive', 'intense', 'powerful', 'rebellious', 'raw']
      },
      calm: {
        genres: ['ambient', 'classical', 'new-age', 'meditation', 'lo-fi'],
        audioFeatures: {
          energy: [0.0, 0.4],
          valence: [0.3, 0.7],
          danceability: [0.0, 0.3],
          tempo: [60, 100],
          acousticness: [0.5, 1.0],
          instrumentalness: [0.3, 1.0]
        },
        keywords: ['peaceful', 'relaxing', 'serene', 'meditative', 'tranquil']
      },
      energetic: {
        genres: ['electronic', 'house', 'techno', 'drum-and-bass', 'edm'],
        audioFeatures: {
          energy: [0.8, 1.0],
          valence: [0.5, 1.0],
          danceability: [0.7, 1.0],
          tempo: [128, 200],
          acousticness: [0.0, 0.2],
          instrumentalness: [0.2, 0.8]
        },
        keywords: ['high-energy', 'driving', 'motivational', 'workout', 'pumping']
      },
      romantic: {
        genres: ['r-n-b', 'soul', 'jazz', 'bossa-nova', 'love-songs'],
        audioFeatures: {
          energy: [0.2, 0.7],
          valence: [0.4, 0.8],
          danceability: [0.3, 0.7],
          tempo: [70, 130],
          acousticness: [0.2, 0.8],
          instrumentalness: [0.0, 0.4]
        },
        keywords: ['romantic', 'sensual', 'intimate', 'smooth', 'passionate']
      },
      focused: {
        genres: ['instrumental', 'post-rock', 'minimal', 'study', 'concentration'],
        audioFeatures: {
          energy: [0.3, 0.7],
          valence: [0.3, 0.7],
          danceability: [0.0, 0.4],
          tempo: [80, 140],
          acousticness: [0.2, 0.8],
          instrumentalness: [0.5, 1.0]
        },
        keywords: ['focus', 'concentration', 'productivity', 'minimal', 'background']
      }
    };
    
    // Contextual factors that influence music selection
    this.contextualFactors = {
      timeOfDay: {
        morning: { energyBoost: 0.2, valenceBoost: 0.1 },
        afternoon: { energyBoost: 0.0, valenceBoost: 0.0 },
        evening: { energyBoost: -0.1, valenceBoost: 0.1 },
        night: { energyBoost: -0.3, valenceBoost: -0.1 }
      },
      weather: {
        sunny: { valenceBoost: 0.2, energyBoost: 0.1 },
        rainy: { valenceBoost: -0.1, acousticnessBoost: 0.2 },
        cloudy: { valenceBoost: -0.05, energyBoost: -0.05 },
        snowy: { valenceBoost: 0.1, acousticnessBoost: 0.3 }
      },
      activity: {
        working: { instrumentalnessBoost: 0.3, energyBoost: 0.1 },
        exercising: { energyBoost: 0.4, danceabilityBoost: 0.3 },
        relaxing: { energyBoost: -0.3, acousticnessBoost: 0.2 },
        socializing: { valenceBoost: 0.2, danceabilityBoost: 0.2 }
      }
    };
  }

  /**
   * Initialize all music platforms and AI models
   */
  async initialize() {
    try {
      console.log('Initializing AdvancedMusicService...');
      
      // Initialize music platforms
      await Promise.all([
        this.initializeSpotify(),
        this.initializeAppleMusic(),
        this.initializeYouTubeMusic(),
        this.initializeSoundCloud(),
        this.initializeLastFM(),
        this.initializeGenius()
      ]);
      
      // Initialize AI components
      await this.initializeAudioAnalyzer();
      await this.initializeRecommendationEngine();
      
      // Load user preferences and history
      await this.loadUserData();
      
      console.log('AdvancedMusicService initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize AdvancedMusicService:', error);
      throw error;
    }
  }

  /**
   * Initialize Spotify integration
   */
  async initializeSpotify() {
    try {
      this.platforms.spotify = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        redirectUri: process.env.SPOTIFY_REDIRECT_URI
      });
      
      console.log('Spotify initialized');
    } catch (error) {
      console.error('Failed to initialize Spotify:', error);
    }
  }

  /**
   * Initialize Apple Music integration
   */
  async initializeAppleMusic() {
    try {
      const developerToken = process.env.APPLE_MUSIC_DEVELOPER_TOKEN;
      
      if (!developerToken) {
        console.log('Apple Music token not provided, skipping...');
        return;
      }
      
      this.platforms.appleMusic = {
        baseURL: 'https://api.music.apple.com/v1',
        headers: {
          'Authorization': `Bearer ${developerToken}`,
          'Music-User-Token': '' // Will be set after user authentication
        }
      };
      
      console.log('Apple Music initialized');
    } catch (error) {
      console.error('Failed to initialize Apple Music:', error);
    }
  }

  /**
   * Initialize YouTube Music integration
   */
  async initializeYouTubeMusic() {
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      
      if (!apiKey) {
        console.log('YouTube API key not provided, skipping...');
        return;
      }
      
      this.platforms.youtubeMusic = {
        baseURL: 'https://www.googleapis.com/youtube/v3',
        apiKey: apiKey
      };
      
      console.log('YouTube Music initialized');
    } catch (error) {
      console.error('Failed to initialize YouTube Music:', error);
    }
  }

  /**
   * Initialize SoundCloud integration
   */
  async initializeSoundCloud() {
    try {
      const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
      
      if (!clientId) {
        console.log('SoundCloud client ID not provided, skipping...');
        return;
      }
      
      this.platforms.soundcloud = {
        baseURL: 'https://api.soundcloud.com',
        clientId: clientId
      };
      
      console.log('SoundCloud initialized');
    } catch (error) {
      console.error('Failed to initialize SoundCloud:', error);
    }
  }

  /**
   * Initialize Last.fm integration
   */
  async initializeLastFM() {
    try {
      const apiKey = process.env.LASTFM_API_KEY;
      
      if (!apiKey) {
        console.log('Last.fm API key not provided, skipping...');
        return;
      }
      
      this.platforms.lastfm = {
        baseURL: 'https://ws.audioscrobbler.com/2.0/',
        apiKey: apiKey
      };
      
      console.log('Last.fm initialized');
    } catch (error) {
      console.error('Failed to initialize Last.fm:', error);
    }
  }

  /**
   * Initialize Genius integration for lyrics
   */
  async initializeGenius() {
    try {
      const accessToken = process.env.GENIUS_ACCESS_TOKEN;
      
      if (!accessToken) {
        console.log('Genius access token not provided, skipping...');
        return;
      }
      
      this.platforms.genius = {
        baseURL: 'https://api.genius.com',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      };
      
      console.log('Genius initialized');
    } catch (error) {
      console.error('Failed to initialize Genius:', error);
    }
  }

  /**
   * Initialize audio analysis AI model
   */
  async initializeAudioAnalyzer() {
    try {
      // Load pre-trained audio feature extraction model
      const modelUrl = 'https://cdn.moodsync.ai/models/audio-analyzer-v2.json';
      this.audioAnalyzer = await tf.loadLayersModel(modelUrl);
      
      console.log('Audio analyzer initialized');
    } catch (error) {
      console.error('Failed to initialize audio analyzer:', error);
    }
  }

  /**
   * Initialize recommendation engine
   */
  async initializeRecommendationEngine() {
    try {
      // Load collaborative filtering + content-based recommendation model
      const modelUrl = 'https://cdn.moodsync.ai/models/music-recommender-v3.json';
      this.recommendationEngine = await tf.loadLayersModel(modelUrl);
      
      console.log('Recommendation engine initialized');
    } catch (error) {
      console.error('Failed to initialize recommendation engine:', error);
    }
  }

  /**
   * Load user preferences and listening history
   */
  async loadUserData() {
    try {
      // In a real implementation, this would load from database
      this.userPreferences = {
        favoriteGenres: [],
        dislikedGenres: [],
        preferredAudioFeatures: {},
        listeningPatterns: {},
        moodPreferences: {}
      };
      
      this.playbackHistory = [];
      
      console.log('User data loaded');
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }

  /**
   * Get comprehensive mood-based music recommendations
   */
  async getMoodBasedRecommendations(moodData, context = {}, options = {}) {
    try {
      const {
        mood,
        confidence,
        secondaryEmotions = [],
        intensity = 1.0
      } = moodData;
      
      const {
        limit = 50,
        strategy = 'adaptive', // 'match', 'contrast', 'adaptive'
        platforms = ['spotify'],
        includeAnalysis = true
      } = options;
      
      console.log(`Generating ${strategy} recommendations for ${mood} mood`);
      
      // Get base mood configuration
      const moodConfig = this.moodMusicMatrix[mood];
      if (!moodConfig) {
        throw new Error(`Unknown mood: ${mood}`);
      }
      
      // Apply contextual adjustments
      const adjustedConfig = this.applyContextualAdjustments(moodConfig, context, intensity);
      
      // Apply strategy-specific modifications
      const strategyConfig = this.applyStrategy(adjustedConfig, strategy, confidence);
      
      // Get recommendations from multiple platforms
      const recommendations = await this.getMultiPlatformRecommendations(
        strategyConfig,
        platforms,
        limit
      );
      
      // Apply AI-based filtering and ranking
      const rankedRecommendations = await this.rankRecommendations(
        recommendations,
        moodData,
        context
      );
      
      // Add audio analysis if requested
      if (includeAnalysis) {
        await this.addAudioAnalysis(rankedRecommendations);
      }
      
      // Update user preferences based on selection
      this.updateUserPreferences(moodData, rankedRecommendations);
      
      return {
        mood: mood,
        strategy: strategy,
        confidence: confidence,
        totalTracks: rankedRecommendations.length,
        recommendations: rankedRecommendations,
        context: context,
        audioFeatures: strategyConfig.audioFeatures,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Failed to get mood-based recommendations:', error);
      throw error;
    }
  }

  /**
   * Apply contextual adjustments to mood configuration
   */
  applyContextualAdjustments(moodConfig, context, intensity) {
    const adjusted = JSON.parse(JSON.stringify(moodConfig)); // Deep clone
    
    // Apply time of day adjustments
    if (context.timeOfDay) {
      const timeAdjustments = this.contextualFactors.timeOfDay[context.timeOfDay];
      if (timeAdjustments) {
        Object.entries(timeAdjustments).forEach(([feature, boost]) => {
          const featureName = feature.replace('Boost', '');
          if (adjusted.audioFeatures[featureName]) {
            adjusted.audioFeatures[featureName] = adjusted.audioFeatures[featureName].map(
              value => Math.max(0, Math.min(1, value + boost))
            );
          }
        });
      }
    }
    
    // Apply weather adjustments
    if (context.weather) {
      const weatherAdjustments = this.contextualFactors.weather[context.weather];
      if (weatherAdjustments) {
        Object.entries(weatherAdjustments).forEach(([feature, boost]) => {
          const featureName = feature.replace('Boost', '');
          if (adjusted.audioFeatures[featureName]) {
            adjusted.audioFeatures[featureName] = adjusted.audioFeatures[featureName].map(
              value => Math.max(0, Math.min(1, value + boost))
            );
          }
        });
      }
    }
    
    // Apply activity adjustments
    if (context.activity) {
      const activityAdjustments = this.contextualFactors.activity[context.activity];
      if (activityAdjustments) {
        Object.entries(activityAdjustments).forEach(([feature, boost]) => {
          const featureName = feature.replace('Boost', '');
          if (adjusted.audioFeatures[featureName]) {
            adjusted.audioFeatures[featureName] = adjusted.audioFeatures[featureName].map(
              value => Math.max(0, Math.min(1, value + boost))
            );
          }
        });
      }
    }
    
    // Apply intensity scaling
    Object.keys(adjusted.audioFeatures).forEach(feature => {
      if (feature === 'energy' || feature === 'valence') {
        adjusted.audioFeatures[feature] = adjusted.audioFeatures[feature].map(
          value => Math.max(0, Math.min(1, value * intensity))
        );
      }
    });
    
    return adjusted;
  }

  /**
   * Apply recommendation strategy
   */
  applyStrategy(config, strategy, confidence) {
    const strategyConfig = JSON.parse(JSON.stringify(config));
    
    switch (strategy) {
      case 'match':
        // Keep configuration as-is for mood matching
        break;
        
      case 'contrast':
        // Invert some features for mood contrast/improvement
        if (strategyConfig.audioFeatures.valence) {
          const [min, max] = strategyConfig.audioFeatures.valence;
          strategyConfig.audioFeatures.valence = [1 - max, 1 - min];
        }
        if (strategyConfig.audioFeatures.energy) {
          const [min, max] = strategyConfig.audioFeatures.energy;
          strategyConfig.audioFeatures.energy = [Math.max(0.3, min), Math.min(1, max + 0.2)];
        }
        break;
        
      case 'adaptive':
        // Blend match and contrast based on confidence
        if (confidence < 0.7) {
          // Low confidence: lean towards mood matching
          // Keep original configuration
        } else {
          // High confidence: gradually introduce contrasting elements
          const contrastFactor = (confidence - 0.7) / 0.3; // 0 to 1
          
          if (strategyConfig.audioFeatures.valence) {
            const [min, max] = strategyConfig.audioFeatures.valence;
            const contrastMin = 1 - max;
            const contrastMax = 1 - min;
            
            strategyConfig.audioFeatures.valence = [
              min + (contrastMin - min) * contrastFactor * 0.3,
              max + (contrastMax - max) * contrastFactor * 0.3
            ];
          }
        }
        break;
    }
    
    return strategyConfig;
  }

  /**
   * Get recommendations from multiple platforms
   */
  async getMultiPlatformRecommendations(config, platforms, limit) {
    const allRecommendations = [];
    const limitPerPlatform = Math.ceil(limit / platforms.length);
    
    const promises = platforms.map(async (platform) => {
      try {
        switch (platform) {
          case 'spotify':
            return await this.getSpotifyRecommendations(config, limitPerPlatform);
          case 'appleMusic':
            return await this.getAppleMusicRecommendations(config, limitPerPlatform);
          case 'youtubeMusic':
            return await this.getYouTubeMusicRecommendations(config, limitPerPlatform);
          case 'soundcloud':
            return await this.getSoundCloudRecommendations(config, limitPerPlatform);
          default:
            return [];
        }
      } catch (error) {
        console.error(`Failed to get recommendations from ${platform}:`, error);
        return [];
      }
    });
    
    const results = await Promise.all(promises);
    results.forEach(platformResults => {
      allRecommendations.push(...platformResults);
    });
    
    return allRecommendations;
  }

  /**
   * Get Spotify recommendations
   */
  async getSpotifyRecommendations(config, limit) {
    try {
      if (!this.platforms.spotify) {
        return [];
      }
      
      const seedGenres = config.genres.slice(0, 5); // Spotify limit
      const audioFeatures = config.audioFeatures;
      
      const recommendations = await this.platforms.spotify.getRecommendations({
        seed_genres: seedGenres,
        limit: limit,
        target_energy: this.getTargetValue(audioFeatures.energy),
        target_valence: this.getTargetValue(audioFeatures.valence),
        target_danceability: this.getTargetValue(audioFeatures.danceability),
        target_tempo: this.getTargetValue(audioFeatures.tempo),
        target_acousticness: this.getTargetValue(audioFeatures.acousticness),
        target_instrumentalness: this.getTargetValue(audioFeatures.instrumentalness),
        min_energy: audioFeatures.energy[0],
        max_energy: audioFeatures.energy[1],
        min_valence: audioFeatures.valence[0],
        max_valence: audioFeatures.valence[1]
      });
      
      return recommendations.body.tracks.map(track => ({
        id: track.id,
        platform: 'spotify',
        title: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        album: track.album.name,
        duration: track.duration_ms,
        popularity: track.popularity,
        preview_url: track.preview_url,
        external_urls: track.external_urls,
        uri: track.uri,
        images: track.album.images,
        explicit: track.explicit,
        release_date: track.album.release_date,
        genres: seedGenres // Approximate
      }));
      
    } catch (error) {
      console.error('Failed to get Spotify recommendations:', error);
      return [];
    }
  }

  /**
   * Get Apple Music recommendations
   */
  async getAppleMusicRecommendations(config, limit) {
    try {
      if (!this.platforms.appleMusic) {
        return [];
      }
      
      // Apple Music API implementation
      const searchTerms = config.keywords.join(' OR ');
      const response = await axios.get(
        `${this.platforms.appleMusic.baseURL}/catalog/us/search`,
        {
          headers: this.platforms.appleMusic.headers,
          params: {
            term: searchTerms,
            types: 'songs',
            limit: limit
          }
        }
      );
      
      const songs = response.data.results?.songs?.data || [];
      
      return songs.map(song => ({
        id: song.id,
        platform: 'appleMusic',
        title: song.attributes.name,
        artist: song.attributes.artistName,
        album: song.attributes.albumName,
        duration: song.attributes.durationInMillis,
        preview_url: song.attributes.previews?.[0]?.url,
        external_urls: { appleMusic: song.attributes.url },
        images: song.attributes.artwork ? [{
          url: song.attributes.artwork.url.replace('{w}x{h}', '640x640'),
          width: 640,
          height: 640
        }] : [],
        explicit: song.attributes.contentRating === 'explicit',
        release_date: song.attributes.releaseDate,
        genres: song.attributes.genreNames || []
      }));
      
    } catch (error) {
      console.error('Failed to get Apple Music recommendations:', error);
      return [];
    }
  }

  /**
   * Get YouTube Music recommendations
   */
  async getYouTubeMusicRecommendations(config, limit) {
    try {
      if (!this.platforms.youtubeMusic) {
        return [];
      }
      
      const searchQuery = `${config.keywords.join(' ')} music`;
      const response = await axios.get(`${this.platforms.youtubeMusic.baseURL}/search`, {
        params: {
          part: 'snippet',
          q: searchQuery,
          type: 'video',
          videoCategoryId: '10', // Music category
          maxResults: limit,
          key: this.platforms.youtubeMusic.apiKey
        }
      });
      
      const videos = response.data.items || [];
      
      return videos.map(video => ({
        id: video.id.videoId,
        platform: 'youtubeMusic',
        title: video.snippet.title,
        artist: video.snippet.channelTitle,
        duration: null, // Would need additional API call
        preview_url: null,
        external_urls: { youtube: `https://www.youtube.com/watch?v=${video.id.videoId}` },
        images: [video.snippet.thumbnails.high],
        explicit: false,
        release_date: video.snippet.publishedAt,
        description: video.snippet.description
      }));
      
    } catch (error) {
      console.error('Failed to get YouTube Music recommendations:', error);
      return [];
    }
  }

  /**
   * Get SoundCloud recommendations
   */
  async getSoundCloudRecommendations(config, limit) {
    try {
      if (!this.platforms.soundcloud) {
        return [];
      }
      
      const searchQuery = config.keywords.join(' ');
      const response = await axios.get(`${this.platforms.soundcloud.baseURL}/tracks`, {
        params: {
          q: searchQuery,
          client_id: this.platforms.soundcloud.clientId,
          limit: limit,
          linked_partitioning: 1
        }
      });
      
      const tracks = response.data.collection || [];
      
      return tracks.map(track => ({
        id: track.id,
        platform: 'soundcloud',
        title: track.title,
        artist: track.user.username,
        duration: track.duration,
        preview_url: track.stream_url ? `${track.stream_url}?client_id=${this.platforms.soundcloud.clientId}` : null,
        external_urls: { soundcloud: track.permalink_url },
        images: track.artwork_url ? [{ url: track.artwork_url }] : [],
        explicit: false,
        release_date: track.created_at,
        genre: track.genre,
        description: track.description
      }));
      
    } catch (error) {
      console.error('Failed to get SoundCloud recommendations:', error);
      return [];
    }
  }

  /**
   * Rank recommendations using AI
   */
  async rankRecommendations(recommendations, moodData, context) {
    try {
      if (!this.recommendationEngine || recommendations.length === 0) {
        return recommendations;
      }
      
      // Prepare features for ranking model
      const rankedTracks = [];
      
      for (const track of recommendations) {
        try {
          // Extract features for ranking
          const features = await this.extractTrackFeatures(track, moodData, context);
          
          // Get ranking score from AI model
          const featureTensor = tf.tensor2d([features]);
          const scorePrediction = await this.recommendationEngine.predict(featureTensor);
          const score = await scorePrediction.data();
          
          rankedTracks.push({
            ...track,
            moodScore: score[0],
            features: features
          });
          
          // Cleanup
          featureTensor.dispose();
          scorePrediction.dispose();
          
        } catch (error) {
          console.error(`Failed to rank track ${track.title}:`, error);
          rankedTracks.push({
            ...track,
            moodScore: 0.5, // Default score
            features: []
          });
        }
      }
      
      // Sort by mood score (descending)
      rankedTracks.sort((a, b) => b.moodScore - a.moodScore);
      
      return rankedTracks;
      
    } catch (error) {
      console.error('Failed to rank recommendations:', error);
      return recommendations;
    }
  }

  /**
   * Extract features for track ranking
   */
  async extractTrackFeatures(track, moodData, context) {
    const features = [];
    
    // Basic track features
    features.push(track.popularity || 50); // Popularity (0-100)
    features.push(track.duration ? Math.min(track.duration / 300000, 1) : 0.5); // Duration normalized
    features.push(track.explicit ? 1 : 0); // Explicit content
    
    // Platform preference (based on user history)
    const platformPreference = this.userPreferences.platformPreferences?.[track.platform] || 0.5;
    features.push(platformPreference);
    
    // Genre matching
    const genreMatch = this.calculateGenreMatch(track.genres || [], moodData.mood);
    features.push(genreMatch);
    
    // Artist familiarity
    const artistFamiliarity = this.calculateArtistFamiliarity(track.artist);
    features.push(artistFamiliarity);
    
    // Contextual features
    features.push(this.getTimeOfDayFeature(context.timeOfDay));
    features.push(this.getWeatherFeature(context.weather));
    features.push(this.getActivityFeature(context.activity));
    
    // Mood confidence
    features.push(moodData.confidence || 0.5);
    
    // User preference alignment
    const preferenceAlignment = this.calculatePreferenceAlignment(track, moodData.mood);
    features.push(preferenceAlignment);
    
    return features;
  }

  /**
   * Add audio analysis to recommendations
   */
  async addAudioAnalysis(recommendations) {
    try {
      if (!this.audioAnalyzer) {
        return;
      }
      
      for (const track of recommendations) {
        try {
          if (track.preview_url) {
            const audioFeatures = await this.analyzeAudioPreview(track.preview_url);
            track.audioAnalysis = audioFeatures;
          }
        } catch (error) {
          console.error(`Failed to analyze audio for ${track.title}:`, error);
        }
      }
      
    } catch (error) {
      console.error('Failed to add audio analysis:', error);
    }
  }

  /**
   * Analyze audio preview using AI
   */
  async analyzeAudioPreview(previewUrl) {
    try {
      // Download and process audio preview
      const audioBuffer = await this.downloadAudioPreview(previewUrl);
      const audioFeatures = await this.extractAudioFeatures(audioBuffer);
      
      // Run through AI model
      const featureTensor = tf.tensor2d([audioFeatures]);
      const analysis = await this.audioAnalyzer.predict(featureTensor);
      const analysisData = await analysis.data();
      
      // Cleanup
      featureTensor.dispose();
      analysis.dispose();
      
      return {
        energy: analysisData[0],
        valence: analysisData[1],
        danceability: analysisData[2],
        acousticness: analysisData[3],
        instrumentalness: analysisData[4],
        tempo: analysisData[5] * 200, // Denormalize tempo
        loudness: analysisData[6] * 60 - 60 // Denormalize loudness
      };
      
    } catch (error) {
      console.error('Failed to analyze audio preview:', error);
      return null;
    }
  }

  /**
   * Download audio preview
   */
  async downloadAudioPreview(url) {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      return response.data;
    } catch (error) {
      console.error('Failed to download audio preview:', error);
      throw error;
    }
  }

  /**
   * Extract audio features from buffer
   */
  async extractAudioFeatures(audioBuffer) {
    // This would typically use a library like librosa.js or Web Audio API
    // For now, return mock features
    return Array(128).fill(0).map(() => Math.random());
  }

  /**
   * Create and manage playlists
   */
  async createMoodPlaylist(moodData, recommendations, options = {}) {
    try {
      const {
        name = `${moodData.mood.charAt(0).toUpperCase() + moodData.mood.slice(1)} Mood`,
        description = `AI-generated playlist for ${moodData.mood} mood`,
        platform = 'spotify',
        isPublic = false
      } = options;
      
      switch (platform) {
        case 'spotify':
          return await this.createSpotifyPlaylist(name, description, recommendations, isPublic);
        case 'appleMusic':
          return await this.createAppleMusicPlaylist(name, description, recommendations);
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
      
    } catch (error) {
      console.error('Failed to create mood playlist:', error);
      throw error;
    }
  }

  /**
   * Create Spotify playlist
   */
  async createSpotifyPlaylist(name, description, recommendations, isPublic) {
    try {
      // Get current user
      const user = await this.platforms.spotify.getMe();
      
      // Create playlist
      const playlist = await this.platforms.spotify.createPlaylist(user.body.id, {
        name: name,
        description: description,
        public: isPublic
      });
      
      // Add tracks
      const spotifyTracks = recommendations
        .filter(track => track.platform === 'spotify' && track.uri)
        .map(track => track.uri);
      
      if (spotifyTracks.length > 0) {
        await this.platforms.spotify.addTracksToPlaylist(
          playlist.body.id,
          spotifyTracks
        );
      }
      
      return {
        id: playlist.body.id,
        name: playlist.body.name,
        url: playlist.body.external_urls.spotify,
        trackCount: spotifyTracks.length,
        platform: 'spotify'
      };
      
    } catch (error) {
      console.error('Failed to create Spotify playlist:', error);
      throw error;
    }
  }

  /**
   * Play mood-based music
   */
  async playMoodMusic(moodData, context = {}, options = {}) {
    try {
      const {
        platform = 'spotify',
        deviceId = null,
        shuffle = true,
        volume = null
      } = options;
      
      // Get recommendations
      const recommendations = await this.getMoodBasedRecommendations(
        moodData,
        context,
        { platforms: [platform], limit: 50 }
      );
      
      if (recommendations.recommendations.length === 0) {
        throw new Error('No recommendations found');
      }
      
      // Play music based on platform
      switch (platform) {
        case 'spotify':
          return await this.playSpotifyMusic(recommendations.recommendations, {
            deviceId,
            shuffle,
            volume
          });
        default:
          throw new Error(`Playback not supported for platform: ${platform}`);
      }
      
    } catch (error) {
      console.error('Failed to play mood music:', error);
      throw error;
    }
  }

  /**
   * Play Spotify music
   */
  async playSpotifyMusic(tracks, options = {}) {
    try {
      const { deviceId, shuffle, volume } = options;
      
      const trackUris = tracks
        .filter(track => track.platform === 'spotify' && track.uri)
        .map(track => track.uri);
      
      if (trackUris.length === 0) {
        throw new Error('No Spotify tracks available');
      }
      
      const playOptions = {
        uris: trackUris
      };
      
      if (deviceId) {
        playOptions.device_id = deviceId;
      }
      
      // Start playback
      await this.platforms.spotify.play(playOptions);
      
      // Set shuffle if requested
      if (shuffle !== undefined) {
        await this.platforms.spotify.setShuffle(shuffle);
      }
      
      // Set volume if requested
      if (volume !== null) {
        await this.platforms.spotify.setVolume(volume);
      }
      
      // Record playback in history
      this.recordPlayback(tracks[0], 'spotify');
      
      return {
        success: true,
        tracksCount: trackUris.length,
        currentTrack: tracks[0],
        platform: 'spotify'
      };
      
    } catch (error) {
      console.error('Failed to play Spotify music:', error);
      throw error;
    }
  }

  /**
   * Get lyrics for a track
   */
  async getLyrics(track) {
    try {
      if (!this.platforms.genius) {
        return null;
      }
      
      // Search for song on Genius
      const searchResponse = await axios.get(`${this.platforms.genius.baseURL}/search`, {
        headers: this.platforms.genius.headers,
        params: {
          q: `${track.artist} ${track.title}`
        }
      });
      
      const hits = searchResponse.data.response.hits;
      if (hits.length === 0) {
        return null;
      }
      
      const song = hits[0].result;
      
      // Get song details (Genius doesn't provide lyrics directly via API)
      const songResponse = await axios.get(`${this.platforms.genius.baseURL}/songs/${song.id}`, {
        headers: this.platforms.genius.headers
      });
      
      return {
        title: song.title,
        artist: song.primary_artist.name,
        url: song.url,
        thumbnail: song.song_art_image_thumbnail_url,
        // Note: Actual lyrics would need to be scraped from the web page
        lyricsUrl: song.url
      };
      
    } catch (error) {
      console.error('Failed to get lyrics:', error);
      return null;
    }
  }

  /**
   * Record playback for learning
   */
  recordPlayback(track, platform) {
    const playbackRecord = {
      track: track,
      platform: platform,
      timestamp: new Date().toISOString(),
      context: {} // Would include current mood, time, etc.
    };
    
    this.playbackHistory.push(playbackRecord);
    
    // Keep only last 1000 records
    if (this.playbackHistory.length > 1000) {
      this.playbackHistory = this.playbackHistory.slice(-1000);
    }
  }

  /**
   * Update user preferences based on interactions
   */
  updateUserPreferences(moodData, recommendations) {
    // This would implement learning algorithms to update user preferences
    // based on their interactions with recommendations
    
    const mood = moodData.mood;
    
    if (!this.userPreferences.moodPreferences[mood]) {
      this.userPreferences.moodPreferences[mood] = {
        preferredGenres: [],
        preferredAudioFeatures: {},
        platformPreferences: {}
      };
    }
    
    // Update genre preferences
    recommendations.forEach(track => {
      if (track.genres) {
        track.genres.forEach(genre => {
          if (!this.userPreferences.moodPreferences[mood].preferredGenres.includes(genre)) {
            this.userPreferences.moodPreferences[mood].preferredGenres.push(genre);
          }
        });
      }
    });
  }

  /**
   * Utility functions
   */
  
  getTargetValue(range) {
    return (range[0] + range[1]) / 2;
  }

  calculateGenreMatch(trackGenres, mood) {
    const moodGenres = this.moodMusicMatrix[mood]?.genres || [];
    const intersection = trackGenres.filter(genre => moodGenres.includes(genre));
    return intersection.length / Math.max(moodGenres.length, 1);
  }

  calculateArtistFamiliarity(artist) {
    const playedArtists = this.playbackHistory
      .map(record => record.track.artist)
      .filter(a => a === artist);
    
    return Math.min(playedArtists.length / 10, 1); // Normalize to 0-1
  }

  calculatePreferenceAlignment(track, mood) {
    const moodPrefs = this.userPreferences.moodPreferences[mood];
    if (!moodPrefs) return 0.5;
    
    let alignment = 0.5;
    
    // Check genre alignment
    if (track.genres && moodPrefs.preferredGenres) {
      const genreMatch = this.calculateGenreMatch(track.genres, mood);
      alignment = (alignment + genreMatch) / 2;
    }
    
    return alignment;
  }

  getTimeOfDayFeature(timeOfDay) {
    const timeMap = { morning: 0.25, afternoon: 0.5, evening: 0.75, night: 1.0 };
    return timeMap[timeOfDay] || 0.5;
  }

  getWeatherFeature(weather) {
    const weatherMap = { sunny: 1.0, cloudy: 0.6, rainy: 0.3, snowy: 0.8 };
    return weatherMap[weather] || 0.5;
  }

  getActivityFeature(activity) {
    const activityMap = {
      working: 0.3,
      exercising: 1.0,
      relaxing: 0.2,
      socializing: 0.8,
      commuting: 0.6
    };
    return activityMap[activity] || 0.5;
  }

  /**
   * Get service statistics
   */
  getServiceStats() {
    return {
      platforms: Object.keys(this.platforms).filter(p => this.platforms[p]),
      playbackHistory: this.playbackHistory.length,
      userPreferences: Object.keys(this.userPreferences.moodPreferences || {}).length,
      moodMappings: this.moodMusicMappings.size,
      isInitialized: this.platforms.spotify !== null
    };
  }

  /**
   * Cleanup resources
   */
  dispose() {
    if (this.audioAnalyzer) {
      this.audioAnalyzer.dispose();
    }
    
    if (this.recommendationEngine) {
      this.recommendationEngine.dispose();
    }
    
    this.platforms = {};
    this.playbackHistory = [];
    this.userPreferences = {};
    
    console.log('AdvancedMusicService disposed');
  }
}

export default AdvancedMusicService;