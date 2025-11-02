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
        console.log('⚠️ Device ID has gone offline', device_id);
        setIsReady(false);
        // Intentar reconectar después de un momento
        setTimeout(() => {
          if (spotifyPlayer) {
            console.log('Intentando reconectar...');
            spotifyPlayer.connect();
          }
        }, 2000);
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

    // Cleanup cuando el componente se desmonta
    return () => {
      console.log('🧹 Limpiando reproductor...');
      clearInterval(checkSpotifySDK);
      clearTimeout(timeout);
      
      // Limpiar interval de progreso
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      
      // Desconectar el player
      if (playerRef.current) {
        try {
          console.log('⏸️ Pausando reproducción...');
          playerRef.current.pause();
          
          console.log('🔌 Desconectando player de Spotify...');
          playerRef.current.disconnect();
          
          // Limpiar referencias
          playerRef.current = null;
          setPlayer(null);
          setDeviceId(null);
          setIsReady(false);
          setIsPaused(true);
          setCurrentTrack(null);
          setPosition(0);
          setDuration(0);
          
          console.log('✅ Reproductor limpiado correctamente');
        } catch (error) {
          console.error('Error al limpiar reproductor:', error);
        }
      }
    };
  }, [token]);

  const transferPlayback = async (retries = 3) => {
    if (!deviceId || !token) {
      console.error('No hay deviceId o token disponible');
      return false;
    }

    for (let i = 0; i < retries; i++) {
      try {
        console.log(`Intentando transferir reproducción (intento ${i + 1}/${retries})...`);
        const response = await fetch('https://api.spotify.com/v1/me/player', {
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

        if (response.status === 204 || response.status === 200) {
          console.log('✅ Reproducción transferida correctamente');
          return true;
        } else if (response.status === 404) {
          console.warn('Device no encontrado, esperando...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        } else {
          console.warn(`Status inesperado: ${response.status}`);
        }
      } catch (error) {
        console.error(`Error en intento ${i + 1}:`, error);
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    console.error('❌ No se pudo transferir la reproducción después de varios intentos');
    return false;
  };

  const play = async (trackUri, retries = 2) => {
    if (!deviceId || !token) {
      console.error('Player no está listo - deviceId:', deviceId, 'token:', !!token);
      return false;
    }

    if (!trackUri) {
      console.error('No hay trackUri para reproducir');
      return false;
    }

    console.log('🎵 Intentando reproducir:', trackUri);

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        // Verificar y asegurar que el device está activo
        const isActive = await ensureDeviceActive();
        
        if (!isActive) {
          console.warn(`Intento ${attempt + 1}: Device no está activo`);
          if (attempt < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            continue;
          }
          return false;
        }
        
        // Esperar un momento para que el dispositivo esté completamente listo
        await new Promise(resolve => setTimeout(resolve, 500));

        // Ahora reproducir la canción
        const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
          method: 'PUT',
          body: JSON.stringify({ uris: [trackUri] }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (response.status === 204 || response.status === 200) {
          console.log('✅ Canción reproduciendo correctamente');
          return true;
        } else if (response.status === 404) {
          console.error('Device no encontrado:', await response.text());
          if (attempt < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            continue;
          }
        } else {
          console.error('Error al reproducir:', response.status, await response.text());
        }
      } catch (error) {
        console.error(`Error en intento ${attempt + 1} de reproducción:`, error);
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          continue;
        }
      }
    }
    
    console.error('❌ No se pudo reproducir después de varios intentos');
    return false;
  };

  const ensureDeviceActive = async () => {
    if (!deviceId || !token || !isReady) {
      console.log('Device no está listo, esperando...');
      return false;
    }

    try {
      // Verificar el estado actual del player
      const response = await fetch('https://api.spotify.com/v1/me/player', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        const data = await response.json();
        if (data.device && data.device.id === deviceId && data.device.is_active) {
          console.log('✅ Device ya está activo');
          return true;
        }
      }

      // Si no está activo o no hay player activo, transferir
      console.log('Reactivando device...');
      return await transferPlayback();
    } catch (error) {
      console.error('Error al verificar device:', error);
      return false;
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
    seek,
    ensureDeviceActive
  };
}
