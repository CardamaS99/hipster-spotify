import React from 'react';
import AudioBackground from '../components/AudioBackground';

export default function MainMenu({ onStart, onSettings }) {
  return (
    <>
      <AudioBackground isPaused={true} />
      
      <div style={styles.container}>
        <div style={styles.logoContainer}>
          <div style={styles.musicIcon}>🎵</div>
          <h1 style={styles.title}>Hipster Spotify</h1>
          <p style={styles.subtitle}>Descubre música de forma única</p>
        </div>

        <div style={styles.menuButtons}>
          <button 
            style={{...styles.button, ...styles.startButton}} 
            onClick={onStart}
            className="menu-button start-btn"
          >
            <span style={styles.buttonIcon}>▶️</span>
            <div style={styles.buttonContent}>
              <div style={styles.buttonTitle}>Jugar</div>
              <div style={styles.buttonSubtitle}>Adivina la canción</div>
            </div>
          </button>

          <button 
            style={{...styles.button, ...styles.settingsButton}} 
            onClick={onSettings}
            className="menu-button settings-btn"
          >
            <span style={styles.buttonIcon}>⚙️</span>
            <div style={styles.buttonContent}>
              <div style={styles.buttonTitle}>Ajustes</div>
              <div style={styles.buttonSubtitle}>Configura tus preferencias</div>
            </div>
          </button>
        </div>

        <div style={styles.footer}>
          <div style={styles.footerText}>
            Powered by <span style={styles.spotifyText}>Spotify</span>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '40px 20px',
    position: 'relative',
    zIndex: 1
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: '60px',
    animation: 'fadeIn 1s ease'
  },
  musicIcon: {
    fontSize: '80px',
    marginBottom: '20px',
    animation: 'pulse 2s ease-in-out infinite'
  },
  title: {
    color: 'white',
    fontSize: '48px',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    textShadow: '0 4px 20px rgba(0,0,0,0.5)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '18px',
    margin: 0,
    textShadow: '0 2px 10px rgba(0,0,0,0.5)'
  },
  menuButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
    maxWidth: '400px'
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '25px 30px',
    fontSize: '18px',
    borderRadius: '20px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    position: 'relative',
    overflow: 'hidden'
  },
  startButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  },
  settingsButton: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white'
  },
  buttonIcon: {
    fontSize: '32px',
    minWidth: '40px',
    textAlign: 'center'
  },
  buttonContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '4px'
  },
  buttonTitle: {
    fontSize: '22px',
    fontWeight: 'bold'
  },
  buttonSubtitle: {
    fontSize: '14px',
    opacity: 0.8
  },
  footer: {
    position: 'absolute',
    bottom: '30px',
    textAlign: 'center'
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '14px'
  },
  spotifyText: {
    color: '#1DB954',
    fontWeight: 'bold'
  }
};
