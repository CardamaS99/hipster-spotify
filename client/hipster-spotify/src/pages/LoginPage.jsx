import React from 'react';
import { getAuthURL } from '../api/spotify/auth';
import AudioBackground from '../components/AudioBackground';

export default function LoginPage() {
    const handleLogin = () => {
        window.location.href = getAuthURL();
    };

    return (
        <>
            <AudioBackground isPaused={true} />
            
            <div style={styles.container}>
                <div style={styles.content}>
                    {/* Logo y título */}
                    <div style={styles.logoSection}>
                        <div style={styles.musicNote}>🎵</div>
                        <h1 style={styles.title}>Hipster Spotify</h1>
                        <p style={styles.subtitle}>Descubre música de forma única</p>
                    </div>

                    {/* Descripción */}
                    <div style={styles.description}>
                        <div style={styles.feature}>
                            <span style={styles.featureIcon}>🎮</span>
                            <span style={styles.featureText}>Juega adivinando canciones</span>
                        </div>
                        <div style={styles.feature}>
                            <span style={styles.featureIcon}>🎨</span>
                            <span style={styles.featureText}>Interfaz moderna y fluida</span>
                        </div>
                        <div style={styles.feature}>
                            <span style={styles.featureIcon}>⚙️</span>
                            <span style={styles.featureText}>Personaliza tus filtros</span>
                        </div>
                    </div>

                    {/* Botón de login */}
                    <button 
                        onClick={handleLogin} 
                        style={styles.loginButton}
                        className="spotify-login-btn"
                    >
                        <svg 
                            style={styles.spotifyIcon} 
                            viewBox="0 0 24 24" 
                            width="28" 
                            height="28"
                        >
                            <path 
                                fill="currentColor" 
                                d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"
                            />
                        </svg>
                        <span style={styles.buttonText}>Conectar con Spotify</span>
                    </button>

                    {/* Nota informativa */}
                    <p style={styles.note}>
                        ℹ️ Necesitas una cuenta de Spotify Premium
                    </p>
                </div>

                {/* Footer */}
                <div style={styles.footer}>
                    <p style={styles.footerText}>
                        Powered by <span style={styles.spotifyText}>Spotify Web API</span>
                    </p>
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
    content: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '40px',
        maxWidth: '500px',
        width: '100%'
    },
    logoSection: {
        textAlign: 'center',
        animation: 'fadeIn 1s ease'
    },
    musicNote: {
        fontSize: '80px',
        marginBottom: '20px',
        animation: 'pulse 2s ease-in-out infinite',
        display: 'inline-block'
    },
    title: {
        color: 'white',
        fontSize: '56px',
        fontWeight: 'bold',
        margin: '0 0 15px 0',
        textShadow: '0 4px 20px rgba(0,0,0,0.5)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        lineHeight: '1.2'
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '20px',
        margin: 0,
        textShadow: '0 2px 10px rgba(0,0,0,0.5)'
    },
    description: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        padding: '30px',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    feature: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    },
    featureIcon: {
        fontSize: '28px',
        minWidth: '40px',
        textAlign: 'center'
    },
    featureText: {
        color: 'white',
        fontSize: '16px',
        textShadow: '0 2px 8px rgba(0,0,0,0.5)'
    },
    loginButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '20px 40px',
        fontSize: '18px',
        fontWeight: 'bold',
        borderRadius: '50px',
        background: '#1DB954',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 10px 30px rgba(29, 185, 84, 0.4)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
    },
    spotifyIcon: {
        color: 'white'
    },
    buttonText: {
        fontSize: '18px'
    },
    note: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '14px',
        margin: 0,
        textAlign: 'center',
        textShadow: '0 2px 8px rgba(0,0,0,0.5)'
    },
    footer: {
        position: 'absolute',
        bottom: '30px',
        textAlign: 'center'
    },
    footerText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '14px',
        margin: 0
    },
    spotifyText: {
        color: '#1DB954',
        fontWeight: 'bold'
    }
};