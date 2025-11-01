import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LoginPage from './pages/LoginPage';
import MainMenu from './pages/MainMenu';
import GameScreen from './pages/GameScreen';
import SettingsPage from './pages/SettingsPage';
import { SettingsProvider } from './contexts/SettingsContext';
import { extractCodeAndState } from './api/spotify/auth';
import { getTokenURL } from './api/api';

export default function App() {
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [screen, setScreen] = useState('login');

  const handleRefreshToken = async () => {
    const savedRefreshToken = localStorage.getItem("spotify_refresh_token");
    
    if (!savedRefreshToken) {
      console.error("No hay refresh token disponible");
      return;
    }

    try {
      const response = await axios.post(getTokenURL().replace('/token', '/refresh'), { 
        refresh_token: savedRefreshToken 
      });
      
      const newToken = response.data.access_token;
      const expiryTime = Date.now() + (3600 * 1000);
      
      localStorage.setItem("spotify_token", newToken);
      localStorage.setItem("token_expiry", expiryTime.toString());
      
      setToken(newToken);
      setTokenExpiry(expiryTime);
      
      console.log("✅ Token refrescado exitosamente");
    } catch (error) {
      console.error("❌ Error al refrescar token:", error);
      // Si falla, limpiar todo y volver al login
      localStorage.removeItem("spotify_token");
      localStorage.removeItem("spotify_refresh_token");
      localStorage.removeItem("token_expiry");
      setToken(null);
      setRefreshToken(null);
      setScreen('login');
    }
  };

  useEffect(() => {
    const { code } = extractCodeAndState();

    if (code) {
      axios.post(getTokenURL(), { code })
        .then(res => {
          localStorage.setItem("spotify_token", res.data.access_token);
          
          // Guardar refresh token si viene en la respuesta
          if (res.data.refresh_token) {
            localStorage.setItem("spotify_refresh_token", res.data.refresh_token);
            setRefreshToken(res.data.refresh_token);
          }
          
          // Los tokens de Spotify expiran en 1 hora
          const expiryTime = Date.now() + (3600 * 1000);
          localStorage.setItem("token_expiry", expiryTime.toString());
          setTokenExpiry(expiryTime);
          
          window.history.replaceState({}, document.title, "/"); // Limpia la URL
          setToken(res.data.access_token);
          setScreen("menu");
        })
        .catch(err => console.error("Token exchange failed", err));
    } else {
      const saved = localStorage.getItem("spotify_token");
      const savedExpiry = localStorage.getItem("token_expiry");
      const savedRefresh = localStorage.getItem("spotify_refresh_token");
      
      if (saved && savedExpiry) {
        const expiry = parseInt(savedExpiry);
        
        // Verificar si el token ha expirado
        if (Date.now() < expiry) {
          setToken(saved);
          setTokenExpiry(expiry);
          setRefreshToken(savedRefresh);
          setScreen("menu");
        } else {
          // Token expirado, limpiar
          localStorage.removeItem("spotify_token");
          localStorage.removeItem("token_expiry");
        }
      }
    }
  }, []);

  if (!token) return <LoginPage />;

  return (
    <SettingsProvider>
      {screen === 'menu' && (
        <MainMenu 
          onStart={() => setScreen('game')} 
          onSettings={() => setScreen('settings')} 
        />
      )}
      {screen === 'settings' && (
        <SettingsPage 
          token={token}
          onBack={() => setScreen('menu')}
          tokenExpiry={tokenExpiry}
          onRefreshToken={handleRefreshToken}
        />
      )}
      {screen === 'game' && <GameScreen token={token} onBack={() => setScreen('menu')} />}
    </SettingsProvider>
  );
}
