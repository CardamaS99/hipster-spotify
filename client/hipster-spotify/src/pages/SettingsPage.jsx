import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { getPlaylistInfo, getUserPlaylists } from '../api/spotify/api';
import AudioBackground from '../components/AudioBackground';

export default function SettingsPage({ token, onBack, tokenExpiry, onRefreshToken }) {
  const { settings, addPlaylist, removePlaylist } = useSettings();
  const [playlistInput, setPlaylistInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [previewPlaylist, setPreviewPlaylist] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const extractPlaylistId = (input) => {
    // Puede ser una URL o un ID directo
    // URL: https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
    // ID: 37i9dQZF1DXcBWIGoYBM5M
    const match = input.match(/playlist\/([a-zA-Z0-9]+)/);
    if (match) return match[1];
    
    // Si no hay match, asumir que es un ID directo
    return input.trim();
  };

  const handleLoadPreview = async () => {
    if (!playlistInput.trim()) return;

    setLoadingPreview(true);
    setError('');
    setPreviewPlaylist(null);

    try {
      const playlistId = extractPlaylistId(playlistInput);
      
      // Verificar si ya está añadida
      if (settings.playlists && settings.playlists.some(p => p.id === playlistId)) {
        setError('Esta playlist ya está añadida');
        setLoadingPreview(false);
        return;
      }

      // Obtener información de la playlist
      const playlistInfo = await getPlaylistInfo(token, playlistId);
      
      // Mostrar preview en lugar de añadir directamente
      setPreviewPlaylist({
        id: playlistInfo.id,
        name: playlistInfo.name,
        total: playlistInfo.total,
        images: playlistInfo.images
      });
    } catch (err) {
      console.error('Error al cargar playlist:', err);
      setError('No se pudo encontrar la playlist. Verifica el ID o URL.');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleAddFromPreview = () => {
    if (!previewPlaylist) return;

    addPlaylist({
      id: previewPlaylist.id,
      name: previewPlaylist.name,
      total: previewPlaylist.total
    });

    setPlaylistInput('');
    setPreviewPlaylist(null);
    setError('');
  };

  const handleCancelPreview = () => {
    setPreviewPlaylist(null);
    setPlaylistInput('');
    setError('');
  };

  const handleRemovePlaylist = (playlistId) => {
    removePlaylist(playlistId);
  };

  const loadUserPlaylists = async () => {
    setLoadingPlaylists(true);
    try {
      const playlists = await getUserPlaylists(token);
      setUserPlaylists(playlists);
      setShowDropdown(true);
    } catch (err) {
      console.error('Error al cargar playlists del usuario:', err);
      setError('No se pudieron cargar tus playlists');
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const handleAddFromDropdown = (playlist) => {
    // Verificar si ya está añadida
    if (settings.playlists && settings.playlists.some(p => p.id === playlist.id)) {
      setError('Esta playlist ya está añadida');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Añadir la playlist
    addPlaylist({
      id: playlist.id,
      name: playlist.name,
      total: playlist.total
    });

    setError('');
    setShowDropdown(false);
  };

  // Cargar playlists del usuario al montar el componente
  useEffect(() => {
    if (token) {
      loadUserPlaylists();
    }
  }, [token]);

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
      
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          border-color: rgba(79, 172, 254, 0.5) !important;
          transform: translateX(5px);
        }

        .dropdown-item:not([style*="cursor: default"]):hover .add-icon {
          transform: scale(1.3);
          color: rgba(79, 172, 254, 1);
        }

        .dropdown-button:hover {
          background: linear-gradient(135deg, rgba(79, 172, 254, 0.4), rgba(0, 242, 254, 0.4)) !important;
          border-color: rgba(79, 172, 254, 0.7) !important;
          transform: translateY(-2px);
        }

        .dropdown-list::-webkit-scrollbar {
          width: 8px;
        }

        .dropdown-list::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        .dropdown-list::-webkit-scrollbar-thumb {
          background: rgba(79, 172, 254, 0.5);
          border-radius: 4px;
        }

        .dropdown-list::-webkit-scrollbar-thumb:hover {
          background: rgba(79, 172, 254, 0.7);
        }

        .confirm-button:hover {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%) !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(74, 222, 128, 0.4) !important;
        }

        .cancel-button:hover {
          background: rgba(255, 100, 100, 0.5) !important;
          border-color: rgba(255, 100, 100, 0.7) !important;
          transform: translateY(-2px);
        }
      `}</style>
      
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

            {/* Botón para mostrar desplegable de playlists del usuario */}
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={styles.dropdownButton}
              className="dropdown-button"
              disabled={loadingPlaylists}
            >
              <span style={styles.dropdownButtonIcon}>📚</span>
              {loadingPlaylists ? 'Cargando tus playlists...' : 'Seleccionar de mis playlists'}
              <span style={{
                ...styles.dropdownArrow,
                transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
              }}>
                ▼
              </span>
            </button>

            {/* Desplegable con las playlists del usuario */}
            {showDropdown && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownHeader}>
                  Tus playlists {userPlaylists.length > 0 && `(${userPlaylists.length})`}
                </div>
                <div style={styles.dropdownList} className="dropdown-list">
                  {userPlaylists.length === 0 ? (
                    <div style={styles.emptyDropdownState}>
                      <div style={styles.emptyDropdownIcon}>🎵</div>
                      <div>No se encontraron playlists</div>
                      <div style={styles.emptyDropdownHint}>
                        Crea algunas playlists en Spotify primero
                      </div>
                    </div>
                  ) : (
                    userPlaylists.map(playlist => {
                      const isAdded = settings.playlists && settings.playlists.some(p => p.id === playlist.id);
                      return (
                        <div
                          key={playlist.id}
                          className="dropdown-item"
                          style={{
                            ...styles.dropdownItem,
                            opacity: isAdded ? 0.5 : 1,
                            cursor: isAdded ? 'default' : 'pointer'
                          }}
                          onClick={() => !isAdded && handleAddFromDropdown(playlist)}
                        >
                          <div style={styles.dropdownItemImageContainer}>
                            {playlist.images && playlist.images[0] ? (
                              <img
                                src={playlist.images[0].url}
                                alt={playlist.name}
                                style={styles.dropdownItemImage}
                              />
                            ) : (
                              <div style={styles.dropdownItemImagePlaceholder}>
                                🎵
                              </div>
                            )}
                          </div>
                          <div style={styles.dropdownItemInfo}>
                            <div style={styles.dropdownItemName}>{playlist.name}</div>
                            <div style={styles.dropdownItemMeta}>{playlist.total} canciones</div>
                          </div>
                          {isAdded && <span style={styles.addedBadge}>✓ Añadida</span>}
                          {!isAdded && <span style={styles.addIcon} className="add-icon">+</span>}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* O añadir manualmente */}
            <div style={styles.orDivider}>
              <span style={styles.orText}>o añadir manualmente por URL</span>
            </div>
            
            <div style={styles.playlistInput}>
              <input
                type="text"
                value={playlistInput}
                onChange={(e) => setPlaylistInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLoadPreview()}
                style={styles.input}
                placeholder="Pega la URL de Spotify y presiona Enter..."
                disabled={loadingPreview || previewPlaylist !== null}
              />
              <button 
                onClick={handleLoadPreview} 
                style={{...styles.addButton, opacity: (loadingPreview || previewPlaylist) ? 0.6 : 1}}
                disabled={loadingPreview || previewPlaylist !== null}
                title="Buscar playlist"
              >
                {loadingPreview ? '⏳' : '→'}
              </button>
            </div>

            {/* Preview de la playlist cargada manualmente */}
            {previewPlaylist && (
              <div style={styles.previewContainer}>
                <div style={styles.previewHeader}>
                  Vista previa de la playlist
                </div>
                <div style={styles.previewContent}>
                  <div
                    style={styles.previewItem}
                    className="dropdown-item"
                  >
                    <div style={styles.dropdownItemImageContainer}>
                      {previewPlaylist.images && previewPlaylist.images[0] ? (
                        <img
                          src={previewPlaylist.images[0].url}
                          alt={previewPlaylist.name}
                          style={styles.dropdownItemImage}
                        />
                      ) : (
                        <div style={styles.dropdownItemImagePlaceholder}>
                          🎵
                        </div>
                      )}
                    </div>
                    <div style={styles.dropdownItemInfo}>
                      <div style={styles.dropdownItemName}>{previewPlaylist.name}</div>
                      <div style={styles.dropdownItemMeta}>{previewPlaylist.total} canciones</div>
                    </div>
                  </div>
                  <div style={styles.previewActions}>
                    <button
                      onClick={handleAddFromPreview}
                      style={styles.confirmButton}
                      className="confirm-button"
                    >
                      ✓ Añadir playlist
                    </button>
                    <button
                      onClick={handleCancelPreview}
                      style={styles.cancelButton}
                      className="cancel-button"
                    >
                      × Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div style={styles.errorMessage}>
                ⚠️ {error}
              </div>
            )}
            
            {!previewPlaylist && !error && (
              <div style={styles.playlistHint}>
                💡 Puedes añadir tantas playlists como quieras. Las canciones se escogerán aleatoriamente de todas ellas.
              </div>
            )}

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
  dropdownButton: {
    width: '100%',
    padding: '15px 20px',
    fontSize: '16px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.3), rgba(0, 242, 254, 0.3))',
    color: 'white',
    border: '2px solid rgba(79, 172, 254, 0.5)',
    cursor: 'pointer',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    transition: 'all 0.3s ease',
    marginBottom: '15px'
  },
  dropdownButtonIcon: {
    fontSize: '20px'
  },
  dropdownArrow: {
    fontSize: '12px',
    transition: 'transform 0.3s ease'
  },
  dropdown: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    borderRadius: '12px',
    border: '2px solid rgba(79, 172, 254, 0.3)',
    marginBottom: '15px',
    overflow: 'hidden',
    animation: 'slideDown 0.3s ease'
  },
  dropdownHeader: {
    padding: '12px 20px',
    background: 'rgba(79, 172, 254, 0.2)',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },
  dropdownList: {
    maxHeight: '300px',
    overflowY: 'auto',
    padding: '5px'
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 15px',
    margin: '5px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  },
  dropdownItemImageContainer: {
    flexShrink: 0
  },
  dropdownItemImage: {
    width: '50px',
    height: '50px',
    borderRadius: '6px',
    objectFit: 'cover',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  dropdownItemImagePlaceholder: {
    width: '50px',
    height: '50px',
    borderRadius: '6px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3))',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px'
  },
  dropdownItemInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  dropdownItemName: {
    color: 'white',
    fontSize: '15px',
    fontWeight: '600',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  dropdownItemMeta: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '12px'
  },
  addedBadge: {
    padding: '4px 12px',
    fontSize: '12px',
    background: 'rgba(79, 209, 197, 0.3)',
    border: '1px solid rgba(79, 209, 197, 0.5)',
    borderRadius: '12px',
    color: '#4fd1c5',
    fontWeight: 'bold',
    whiteSpace: 'nowrap'
  },
  addIcon: {
    fontSize: '24px',
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: 'bold'
  },
  orDivider: {
    position: 'relative',
    textAlign: 'center',
    margin: '20px 0',
    height: '1px',
    background: 'rgba(255, 255, 255, 0.1)'
  },
  orText: {
    position: 'relative',
    top: '-10px',
    background: 'rgba(0, 0, 0, 0.5)',
    padding: '0 15px',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '13px',
    fontStyle: 'italic'
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
  },
  emptyDropdownState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '14px',
    padding: '30px 20px',
    textAlign: 'center'
  },
  emptyDropdownIcon: {
    fontSize: '36px',
    opacity: 0.5
  },
  emptyDropdownHint: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.4)',
    fontStyle: 'italic'
  },
  previewContainer: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    borderRadius: '12px',
    border: '2px solid rgba(102, 126, 234, 0.5)',
    marginTop: '15px',
    overflow: 'hidden',
    animation: 'slideDown 0.3s ease'
  },
  previewHeader: {
    padding: '12px 20px',
    background: 'rgba(102, 126, 234, 0.2)',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },
  previewContent: {
    padding: '15px'
  },
  previewItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 15px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    marginBottom: '15px'
  },
  previewActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center'
  },
  confirmButton: {
    flex: 1,
    padding: '12px 20px',
    fontSize: '15px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(74, 222, 128, 0.3)'
  },
  cancelButton: {
    flex: 1,
    padding: '12px 20px',
    fontSize: '15px',
    borderRadius: '10px',
    background: 'rgba(255, 100, 100, 0.3)',
    color: 'white',
    border: '1px solid rgba(255, 100, 100, 0.5)',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s ease'
  }
};
