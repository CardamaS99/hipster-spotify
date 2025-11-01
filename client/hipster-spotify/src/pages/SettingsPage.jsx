import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { getPlaylistInfo } from '../api/spotify/api';
import AudioBackground from '../components/AudioBackground';

export default function SettingsPage({ token, onBack, tokenExpiry, onRefreshToken }) {
  const { settings, addPlaylist, removePlaylist } = useSettings();
  const [playlistInput, setPlaylistInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const extractPlaylistId = (input) => {
    // Puede ser una URL o un ID directo
    // URL: https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
    // ID: 37i9dQZF1DXcBWIGoYBM5M
    const match = input.match(/playlist\/([a-zA-Z0-9]+)/);
    if (match) return match[1];
    
    // Si no hay match, asumir que es un ID directo
    return input.trim();
  };

  const handleAddPlaylist = async () => {
    if (!playlistInput.trim()) return;

    setLoading(true);
    setError('');

    try {
      const playlistId = extractPlaylistId(playlistInput);
      
      // Verificar si ya está añadida
      if (settings.playlists && settings.playlists.some(p => p.id === playlistId)) {
        setError('Esta playlist ya está añadida');
        setLoading(false);
        return;
      }

      // Obtener información de la playlist
      const playlistInfo = await getPlaylistInfo(token, playlistId);
      
      // Añadir la playlist
      addPlaylist({
        id: playlistInfo.id,
        name: playlistInfo.name,
        total: playlistInfo.total
      });

      setPlaylistInput('');
    } catch (err) {
      console.error('Error al añadir playlist:', err);
      setError('No se pudo encontrar la playlist. Verifica el ID o URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePlaylist = (playlistId) => {
    removePlaylist(playlistId);
  };

  const calculateTimeRemaining = () => {
    if (!tokenExpiry) return 'Desconocido';
    
    const now = Date.now();
    const remaining = tokenExpiry - now;
    
    if (remaining <= 0) return 'Expirado';
    
    const minutes = Math.floor(remaining / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}min`;
    }
    return `${minutes} minutos`;
  };

  return (
    <>
      <AudioBackground isPaused={true} />
      
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={onBack} style={styles.backButton}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          <h1 style={styles.title}>⚙️ Ajustes</h1>
        </div>

        <div style={styles.content}>
          {/* Token Status */}
          <div style={styles.section}>
            <div style={styles.tokenCard}>
              <div style={styles.tokenIcon}>🔑</div>
              <div style={{ flex: 1 }}>
                <div style={styles.tokenLabel}>Tiempo de sesión restante</div>
                <div style={styles.tokenTime}>{calculateTimeRemaining()}</div>
              </div>
            </div>
          </div>

          {/* Playlists */}
          <div style={styles.section}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>🎵</span>
              Playlists de Spotify
            </label>
            
            <div style={styles.playlistInput}>
              <input
                type="text"
                value={playlistInput}
                onChange={(e) => setPlaylistInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddPlaylist()}
                style={styles.input}
                placeholder="Pega aquí la URL o ID de la playlist..."
                disabled={loading}
              />
              <button 
                onClick={handleAddPlaylist} 
                style={{...styles.addButton, opacity: loading ? 0.6 : 1}}
                disabled={loading}
                title="Añadir playlist"
              >
                {loading ? '⏳' : '+'}
              </button>
            </div>
            
            {error && (
              <div style={styles.errorMessage}>
                ⚠️ {error}
              </div>
            )}
            
            <div style={styles.playlistHint}>
              💡 Puedes añadir tantas playlists como quieras. Las canciones se escogerán aleatoriamente de todas ellas.
            </div>

            <div style={styles.playlistList}>
              {(!settings.playlists || settings.playlists.length === 0) ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>📭</div>
                  <div>No hay playlists añadidas</div>
                  <div style={styles.emptyHint}>
                    Añade al menos una playlist para poder jugar
                  </div>
                </div>
              ) : (
                settings.playlists.map(playlist => (
                  <div key={playlist.id} style={styles.playlistItem}>
                    <div style={styles.playlistInfo}>
                      <div style={styles.playlistName}>{playlist.name}</div>
                      <div style={styles.playlistMeta}>
                        {playlist.total} canciones
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemovePlaylist(playlist.id)}
                      style={styles.removeButton}
                      title="Eliminar playlist"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    padding: '20px',
    position: 'relative',
    zIndex: 1,
    maxWidth: '800px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '40px',
    paddingTop: '20px'
  },
  backButton: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease'
  },
  title: {
    color: 'white',
    fontSize: '36px',
    fontWeight: 'bold',
    margin: 0,
    textShadow: '0 2px 20px rgba(0,0,0,0.5)'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  section: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    padding: '25px',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  tokenCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '10px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))',
    borderRadius: '15px',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  tokenIcon: {
    fontSize: '40px'
  },
  tokenLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '14px',
    marginBottom: '5px'
  },
  tokenTime: {
    color: 'white',
    fontSize: '24px',
    fontWeight: 'bold',
    textShadow: '0 2px 10px rgba(0,0,0,0.3)'
  },
  label: {
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textShadow: '0 2px 10px rgba(0,0,0,0.5)'
  },
  labelIcon: {
    fontSize: '24px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  input: {
    padding: '12px 20px',
    fontSize: '16px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    color: 'white',
    outline: 'none',
    transition: 'all 0.3s ease'
  },
  inputHint: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '13px',
    fontStyle: 'italic'
  },
  slider: {
    width: '100%',
    height: '8px',
    borderRadius: '4px',
    background: 'rgba(255, 255, 255, 0.2)',
    outline: 'none',
    WebkitAppearance: 'none',
    appearance: 'none',
    cursor: 'pointer'
  },
  popularityDisplay: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: '5px',
    marginTop: '10px'
  },
  refreshButton: {
    padding: '10px 20px',
    fontSize: '14px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    transition: 'all 0.3s ease'
  },
  playlistInput: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
  },
  addButton: {
    padding: '12px 24px',
    fontSize: '16px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    transition: 'all 0.3s ease'
  },
  errorMessage: {
    color: '#ff6b6b',
    fontSize: '14px',
    padding: '8px 12px',
    background: 'rgba(255, 107, 107, 0.1)',
    border: '1px solid rgba(255, 107, 107, 0.3)',
    borderRadius: '8px',
    marginBottom: '10px'
  },
  playlistHint: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '13px',
    fontStyle: 'italic',
    marginBottom: '15px',
    padding: '8px 12px',
    background: 'rgba(102, 126, 234, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(102, 126, 234, 0.2)'
  },
  playlistList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '400px',
    overflowY: 'auto',
    padding: '5px'
  },
  playlistItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '15px 20px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15))',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'all 0.3s ease'
  },
  playlistInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  playlistName: {
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  playlistMeta: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '13px'
  },
  removeButton: {
    background: 'rgba(255, 100, 100, 0.3)',
    border: '1px solid rgba(255, 100, 100, 0.5)',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'white',
    fontSize: '20px',
    lineHeight: '1',
    transition: 'all 0.2s ease',
    fontWeight: 'bold'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
    fontSize: '14px',
    padding: '40px 20px',
    textAlign: 'center'
  },
  emptyIcon: {
    fontSize: '48px',
    opacity: 0.5
  },
  emptyHint: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.4)'
  }
};
