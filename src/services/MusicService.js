import SpotifyWebApi from 'spotify-web-api-node';

class MusicService {
  constructor() {
    this.spotify = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI
    });
    
    this.moodPlaylists = {
      happy: ['upbeat', 'pop', 'dance', 'feel-good'],
      sad: ['melancholy', 'acoustic', 'indie', 'emotional'],
      angry: ['rock', 'metal', 'punk', 'aggressive'],
      calm: ['ambient', 'classical', 'meditation', 'chill'],
      energetic: ['electronic', 'workout', 'high-energy', 'motivational'],
      romantic: ['love-songs', 'r&b', 'romantic', 'slow-jams'],
      neutral: ['popular', 'mixed', 'variety', 'mainstream']
    };
  }

  async authenticateUser() {
    try {
      const authUrl = this.spotify.createAuthorizeURL([
        'user-read-playback-state',
        'user-modify-playback-state',
        'user-read-currently-playing',
        'playlist-read-private',
        'playlist-read-collaborative'
      ], 'moodsync-state');
      
      return authUrl;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  async setAccessToken(token) {
    this.spotify.setAccessToken(token);
  }

  async getMoodBasedRecommendations(mood, limit = 20) {
    try {
      const genres = this.moodPlaylists[mood] || this.moodPlaylists.neutral;
      const seedGenres = genres.slice(0, 5); // Spotify allows max 5 seed genres
      
      const recommendations = await this.spotify.getRecommendations({
        seed_genres: seedGenres,
        limit: limit,
        target_energy: this.getEnergyLevel(mood),
        target_valence: this.getValenceLevel(mood),
        target_danceability: this.getDanceabilityLevel(mood)
      });

      return recommendations.body.tracks;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }

  async playMoodPlaylist(mood, deviceId = null) {
    try {
      const tracks = await this.getMoodBasedRecommendations(mood);
      const trackUris = tracks.map(track => track.uri);
      
      const playOptions = {
        uris: trackUris
      };
      
      if (deviceId) {
        playOptions.device_id = deviceId;
      }
      
      await this.spotify.play(playOptions);
      
      return {
        success: true,
        tracksCount: tracks.length,
        mood: mood
      };
    } catch (error) {
      console.error('Error playing mood playlist:', error);
      throw error;
    }
  }

  async getCurrentPlayback() {
    try {
      const playback = await this.spotify.getMyCurrentPlaybackState();
      return playback.body;
    } catch (error) {
      console.error('Error getting current playback:', error);
      return null;
    }
  }

  async adjustVolumeForMood(mood) {
    try {
      const volumeMap = {
        happy: 75,
        energetic: 80,
        angry: 70,
        sad: 50,
        calm: 40,
        romantic: 60,
        neutral: 65
      };
      
      const volume = volumeMap[mood] || 65;
      await this.spotify.setVolume(volume);
      
      return volume;
    } catch (error) {
      console.error('Error adjusting volume:', error);
      throw error;
    }
  }

  getEnergyLevel(mood) {
    const energyMap = {
      happy: 0.8,
      energetic: 0.9,
      angry: 0.7,
      sad: 0.3,
      calm: 0.2,
      romantic: 0.5,
      neutral: 0.6
    };
    return energyMap[mood] || 0.6;
  }

  getValenceLevel(mood) {
    const valenceMap = {
      happy: 0.9,
      energetic: 0.8,
      angry: 0.2,
      sad: 0.1,
      calm: 0.5,
      romantic: 0.7,
      neutral: 0.5
    };
    return valenceMap[mood] || 0.5;
  }

  getDanceabilityLevel(mood) {
    const danceabilityMap = {
      happy: 0.8,
      energetic: 0.9,
      angry: 0.6,
      sad: 0.3,
      calm: 0.2,
      romantic: 0.6,
      neutral: 0.5
    };
    return danceabilityMap[mood] || 0.5;
  }
}

export default new MusicService();