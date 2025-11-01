import React, { useState, useEffect } from 'react';
import { getRandomTracksFromPlaylists } from '../api/spotify/api';
import { useSpotifyPlayer } from '../hooks/useSpotifyPlayer';
import { useSettings } from '../contexts/SettingsContext';
import AudioBackground from '../components/AudioBackground';
import PlayerControls from '../components/PlayerControls';
import MysteryAlbumCover from '../components/MysteryAlbumCover';

export default function GameScreen({ token, onBack }) {
  const [tracks, setTracks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { settings } = useSettings();
  
  // Inicializar el reproductor de Spotify
  const { isReady, isPaused, play, togglePlay, position, duration, seek } = useSpotifyPlayer(token);

  const loadTracks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Verificar que haya playlists configuradas
      if (!settings.playlists || settings.playlists.length === 0) {
        setError('No hay playlists configuradas. Ve a Ajustes para añadir playlists.');
        setLoading(false);
        return;
      }

      // Obtener IDs de las playlists
      const playlistIds = settings.playlists.map(p => p.id);
      
      // Obtener canciones de todas las playlists
      const fetchedTracks = await getRandomTracksFromPlaylists(token, playlistIds);
      
      if (Array.isArray(fetchedTracks) && fetchedTracks.length > 0) {
        setTracks(fetchedTracks);
        setCurrentIndex(0);
      } else {
        setError('No se encontraron canciones en las playlists configuradas.');
      }
    } catch (error) {
      console.error('Error al cargar canciones:', error);
      setError('Error al cargar canciones. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const nextTrack = () => {
    setShowInfo(false);
    setCurrentIndex((prev) => {
      const next = prev + 1;
      // Si llegamos al final, recarga más canciones
      if (next >= tracks.length) {
        loadTracks();
        return 0;
      }
      return next;
    });
  };

  useEffect(() => {
    loadTracks();
  }, []);

  const currentTrack = tracks[currentIndex];

  // Reproducir la canción actual cuando cambia el índice o cuando el player está listo
  useEffect(() => {
    if (currentTrack && isReady && currentTrack.uri) {
      // Pequeño delay para asegurar que todo esté listo
      const timer = setTimeout(() => {
        play(currentTrack.uri);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [currentIndex, isReady, currentTrack?.uri]);

  if (loading || !isReady) {
    return (
      <>
        <AudioBackground isPaused={true} />
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner} />
          <h3 style={styles.loadingText}>
            {loading ? '⏳ Cargando canciones...' : '🎵 Inicializando reproductor...'}
          </h3>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AudioBackground isPaused={true} />
        <div style={styles.loadingContainer}>
          <div style={styles.errorIcon}>⚠️</div>
          <h3 style={styles.loadingText}>{error}</h3>
          <div style={styles.errorButtons}>
            {onBack && (
              <button onClick={onBack} style={styles.retryButton}>
                Volver al menú
              </button>
            )}
            <button onClick={loadTracks} style={styles.retryButton}>
              Reintentar
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!currentTrack) {
    return (
      <>
        <AudioBackground isPaused={true} />
        <div style={styles.loadingContainer}>
          <h3 style={styles.loadingText}>❌ No se pudieron cargar canciones</h3>
          <button onClick={loadTracks} style={styles.retryButton}>
            Reintentar
          </button>
        </div>
      </>
    );
  }

  const handleDiscovery = () => {
    if (!showInfo) {
      setShowInfo(true);
    }
  };

  return (
    <>
      <AudioBackground isPaused={isPaused} />
      
      <div style={styles.container}>
        {/* Botón de volver */}
        {onBack && (
          <button onClick={onBack} style={styles.backButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
        )}
        
        {/* Indicador de progreso */}
        <div style={styles.trackCounter}>
          Canción {currentIndex + 1} de {tracks.length}
        </div>

        {/* Carátula del álbum */}
        <div style={styles.albumContainer}>
          <div style={{
            ...styles.albumFlipContainer,
            animation: showInfo ? 'flipReveal 0.8s ease-in-out' : 'none'
          }}>
            {!showInfo ? (
              // Mostrar el placeholder con interrogación antes de descubrir
              <div style={{
                ...styles.albumArt,
                animation: isPaused ? 'none' : 'rotate 20s linear infinite',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent'
              }}>
                <MysteryAlbumCover size={260} />
              </div>
            ) : (
              // Mostrar la carátula real después de descubrir
              currentTrack.album?.images?.[0] && (
                <img 
                  src={currentTrack.album.images[0].url} 
                  alt={currentTrack.name}
                  style={{
                    ...styles.albumArt,
                    animation: isPaused ? 'none' : 'rotate 20s linear infinite'
                  }}
                />
              )
            )}
            
            {/* Overlay con efecto de vinilo */}
            <div style={styles.vinylOverlay} />
          </div>
        </div>

        {/* Información de la canción (solo si se descubrió) */}
        {showInfo && (
          <div style={styles.infoBox}>
            <h2 style={{
              ...styles.trackTitle,
              fontSize: `${Math.max(16, Math.min(24, 400 / currentTrack.name.length))}px`
            }}>
              {currentTrack.name}
            </h2>
            <p style={styles.artistName}>{currentTrack.artists[0].name}</p>
            <p style={styles.albumInfo}>
              {currentTrack.album.name} • {currentTrack.album.release_date.slice(0, 4)}
            </p>
          </div>
        )}

      </div>

      {/* Controles del reproductor */}
      <PlayerControls
        isPaused={isPaused}
        onTogglePlay={togglePlay}
        onNext={nextTrack}
        onDiscover={handleDiscovery}
        showDiscover={true}
        position={position}
        duration={duration}
        onSeek={seek}
      />

      <style>{keyframes}</style>
    </>
  );
}

const keyframes = `
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes flipReveal {
    0% { transform: rotateY(0deg) scale(1); }
    50% { transform: rotateY(90deg) scale(1.1); }
    100% { transform: rotateY(0deg) scale(1); }
  }
`;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    maxHeight: '100vh',
    padding: '20px',
    position: 'relative',
    zIndex: 1,
    overflow: 'hidden'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '20px'
  },
  loadingSpinner: {
    width: '60px',
    height: '60px',
    border: '4px solid rgba(255, 255, 255, 0.2)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    animation: 'rotate 1s linear infinite'
  },
  loadingText: {
    color: 'white',
    fontSize: '20px',
    textAlign: 'center',
    textShadow: '0 2px 10px rgba(0,0,0,0.5)',
    maxWidth: '500px',
    padding: '0 20px'
  },
  errorIcon: {
    fontSize: '64px'
  },
  errorButtons: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  retryButton: {
    padding: '12px 30px',
    fontSize: '16px',
    borderRadius: '25px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    transition: 'transform 0.2s'
  },
  backButton: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    zIndex: 10
  },
  trackCounter: {
    position: 'absolute',
    top: '20px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '500',
    textShadow: '0 2px 10px rgba(0,0,0,0.5)',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    padding: '6px 16px',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  albumContainer: {
    position: 'relative',
    marginBottom: '20px',
    perspective: '1000px',
    marginTop: '10px'
  },
  albumFlipContainer: {
    position: 'relative',
    transformStyle: 'preserve-3d'
  },
  albumArt: {
    width: '260px',
    height: '260px',
    borderRadius: '50%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    border: '6px solid rgba(255, 255, 255, 0.1)',
    objectFit: 'cover'
  },
  vinylOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '65px',
    height: '65px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,0,0,0.8) 30%, transparent 70%)',
    pointerEvents: 'none'
  },
  infoBox: {
    textAlign: 'center',
    marginBottom: '15px',
    animation: 'fadeIn 0.5s ease',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    padding: '15px 20px',
    borderRadius: '15px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    maxWidth: '90%',
    width: '100%',
    boxSizing: 'border-box'
  },
  trackTitle: {
    color: 'white',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
    textShadow: '0 2px 10px rgba(0,0,0,0.5)',
    lineHeight: '1.2',
    wordBreak: 'break-word'
  },
  artistName: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '16px',
    margin: '0 0 6px 0',
    textShadow: '0 2px 8px rgba(0,0,0,0.5)'
  },
  albumInfo: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '13px',
    margin: '0',
    textShadow: '0 2px 6px rgba(0,0,0,0.5)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
};
