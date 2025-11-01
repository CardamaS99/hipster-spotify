import { useState, useEffect, useRef } from 'react';

export function useSpotifyPlayer(token) {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef(null);
  const progressInterval = useRef(null);

  useEffect(() => {
    if (!token) return;

    const initializePlayer = () => {
      if (!window.Spotify) {
        console.error('Spotify SDK no está cargado');
        return;
      }

      console.log('Inicializando reproductor de Spotify...');

      const spotifyPlayer = new window.Spotify.Player({
        name: 'Hipster Spotify Player',
        getOAuthToken: cb => { cb(token); },
        volume: 0.5
      });

      // Error handling
      spotifyPlayer.addListener('initialization_error', ({ message }) => {
        console.error('Initialization error:', message);
      });

      spotifyPlayer.addListener('authentication_error', ({ message }) => {
        console.error('Authentication error:', message);
      });

      spotifyPlayer.addListener('account_error', ({ message }) => {
        console.error('Account error:', message);
      });

      spotifyPlayer.addListener('playback_error', ({ message }) => {
        console.error('Playback error:', message);
      });

      // Ready
      spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('✅ Player listo con Device ID:', device_id);
        setDeviceId(device_id);
        setIsReady(true);
      });

      // Not Ready
      spotifyPlayer.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
        setIsReady(false);
      });

      // Player state changed
      spotifyPlayer.addListener('player_state_changed', state => {
        if (!state) return;
        
        setCurrentTrack(state.track_window.current_track);
        setIsPaused(state.paused);
        setPosition(state.position);
        setDuration(state.duration);
      });

      // Connect to the player
      spotifyPlayer.connect().then(success => {
        if (success) {
          console.log('🎵 Conectado al reproductor de Spotify');
        }
      });

      playerRef.current = spotifyPlayer;
      setPlayer(spotifyPlayer);
    };

    // Esperar a que el SDK esté disponible usando la señal del index.html
    const checkSpotifySDK = setInterval(() => {
      if (window.Spotify && window.spotifySDKReady) {
        clearInterval(checkSpotifySDK);
        initializePlayer();
      }
    }, 100);

    // Timeout de seguridad de 10 segundos
    const timeout = setTimeout(() => {
      clearInterval(checkSpotifySDK);
      if (!window.Spotify) {
        console.error('⏱️ Timeout: Spotify SDK no se cargó en 10 segundos');
      }
    }, 10000);

    // Cleanup
    return () => {
      clearInterval(checkSpotifySDK);
      clearTimeout(timeout);
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
    };
  }, [token]);

  const transferPlayback = async () => {
    if (!deviceId || !token) {
      return false;
    }

    try {
      await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      return true;
    } catch (error) {
      console.error('Error al transferir reproducción:', error);
      return false;
    }
  };

  const play = async (trackUri) => {
    if (!deviceId || !token) {
      console.error('Player no está listo');
      return;
    }

    try {
      // Primero, transferir la reproducción a este dispositivo
      await transferPlayback();
      
      // Esperar un momento para que el dispositivo esté listo
      await new Promise(resolve => setTimeout(resolve, 500));

      // Ahora reproducir la canción
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        body: JSON.stringify({ uris: [trackUri] }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
    } catch (error) {
      console.error('Error al reproducir:', error);
    }
  };

  const togglePlay = () => {
    if (player) {
      player.togglePlay();
    }
  };

  const nextTrack = () => {
    if (player) {
      player.nextTrack();
    }
  };

  const previousTrack = () => {
    if (player) {
      player.previousTrack();
    }
  };

  const seek = async (positionMs) => {
    if (!player) return;
    
    try {
      await player.seek(positionMs);
      setPosition(positionMs);
    } catch (error) {
      console.error('Error al buscar posición:', error);
    }
  };

  // Actualizar posición cada segundo cuando está reproduciendo
  useEffect(() => {
    if (!isPaused && duration > 0) {
      progressInterval.current = setInterval(() => {
        setPosition(prev => {
          const next = prev + 1000;
          return next >= duration ? duration : next;
        });
      }, 1000);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPaused, duration]);

  return {
    player,
    deviceId,
    isReady,
    isPaused,
    currentTrack,
    position,
    duration,
    play,
    togglePlay,
    nextTrack,
    previousTrack,
    seek
  };
}
