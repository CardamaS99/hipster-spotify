import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('music_game_settings');
    const defaultSettings = { 
      playlists: [
        {
          id: '0JiVp7Z0pYKI8diUV6HJyQ',
          name: 'Playlist por defecto',
          total: 0
        }
      ] 
    };
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Asegurar que siempre tenga la estructura correcta
        return {
          playlists: Array.isArray(parsed.playlists) ? parsed.playlists : defaultSettings.playlists
        };
      } catch (error) {
        console.error('Error al parsear settings guardados:', error);
        return defaultSettings;
      }
    }
    
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('music_game_settings', JSON.stringify(settings));
  }, [settings]);

  const addPlaylist = (playlist) => {
    setSettings(prev => ({
      ...prev,
      playlists: [...prev.playlists, playlist]
    }));
  };

  const removePlaylist = (playlistId) => {
    setSettings(prev => ({
      ...prev,
      playlists: prev.playlists.filter(p => p.id !== playlistId)
    }));
  };

  const resetSettings = () => {
    const defaultSettings = {
      playlists: [
        {
          id: '0JiVp7Z0pYKI8diUV6HJyQ',
          name: 'Playlist por defecto',
          total: 0
        }
      ]
    };
    setSettings(defaultSettings);
    localStorage.setItem('music_game_settings', JSON.stringify(defaultSettings));
  };

  return (
    <SettingsContext.Provider value={{ settings, addPlaylist, removePlaylist, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
