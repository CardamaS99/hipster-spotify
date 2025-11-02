import React from 'react';

export default function PlayerControls({ 
  isPaused, 
  onTogglePlay, 
  onNext, 
  onDiscover,
  showDiscover,
  position, 
  duration,
  onSeek 
}) {
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newPosition = percentage * duration;
    onSeek(newPosition);
  };

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <div style={styles.container}>
      {/* Botón de descubrir (izquierda) */}
      {showDiscover && (
        <button 
          onClick={onDiscover}
          style={styles.discoverButton}
          className="discover-btn"
        >
          <svg 
            style={{ width: '45%', height: '45%' }} 
            viewBox="0 0 24 24" 
            fill="white"
          >
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </button>
      )}
      
      {/* Botón de Play/Pause circular */}
      <button 
        onClick={onTogglePlay}
        style={styles.playButton}
        className="play-pause-btn"
      >
        {isPaused ? (
          // Play icon
          <svg 
            style={{ width: '50%', height: '50%' }} 
            viewBox="0 0 24 24" 
            fill="white"
          >
            <path d="M8 5v14l11-7z"/>
          </svg>
        ) : (
          // Pause icon
          <svg 
            style={{ width: '50%', height: '50%' }} 
            viewBox="0 0 24 24" 
            fill="white"
          >
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
          </svg>
        )}
      </button>

      {/* Barra de progreso */}
      <div style={styles.progressContainer}>
        <span style={styles.time}>{formatTime(position)}</span>
        
        <div 
          style={styles.progressBar}
          onClick={handleSeek}
        >
          <div style={{...styles.progressFill, width: `${progress}%`}}>
            <div style={styles.progressHandle} />
          </div>
        </div>

        <span style={styles.time}>{formatTime(duration)}</span>
      </div>

      {/* Botón de siguiente (derecha) */}
      {showDiscover && (
        <button 
          onClick={onNext}
          style={styles.nextButton}
          className="next-btn"
        >
          <svg 
            style={{ width: '45%', height: '45%' }} 
            viewBox="0 0 24 24" 
            fill="white"
          >
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    bottom: 'max(20px, 3vh)',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'clamp(12px, 2vh, 20px)',
    zIndex: 100,
    width: '90%',
    maxWidth: '600px',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)'
  },
  playButton: {
    width: 'clamp(70px, 12vh, 100px)',
    height: 'clamp(70px, 12vh, 100px)',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 40px rgba(102, 126, 234, 0.5)',
    transition: 'all 0.3s ease',
    position: 'relative'
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 'clamp(8px, 2vw, 15px)',
    width: '100%'
  },
  progressBar: {
    flex: 1,
    height: 'clamp(6px, 1vh, 8px)',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '4px',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'visible',
    backdropFilter: 'blur(10px)'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '4px',
    position: 'relative',
    transition: 'width 0.1s ease'
  },
  progressHandle: {
    position: 'absolute',
    right: 'clamp(-6px, -1vh, -8px)',
    top: '50%',
    transform: 'translateY(-50%)',
    width: 'clamp(12px, 2vh, 16px)',
    height: 'clamp(12px, 2vh, 16px)',
    borderRadius: '50%',
    background: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    cursor: 'pointer'
  },
  time: {
    color: 'white',
    fontSize: 'clamp(11px, 2vh, 14px)',
    fontWeight: '500',
    minWidth: 'clamp(38px, 8vw, 45px)',
    textAlign: 'center',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
  },
  discoverButton: {
    position: 'absolute',
    left: 'clamp(5px, 2vw, 20px)',
    top: '0',
    width: 'clamp(50px, 9vh, 60px)',
    height: 'clamp(50px, 9vh, 60px)',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 20px rgba(245, 87, 108, 0.4)',
    transition: 'all 0.3s ease'
  },
  nextButton: {
    position: 'absolute',
    right: 'clamp(5px, 2vw, 20px)',
    top: '0',
    width: 'clamp(50px, 9vh, 60px)',
    height: 'clamp(50px, 9vh, 60px)',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 20px rgba(79, 172, 254, 0.4)',
    transition: 'all 0.3s ease'
  }
};
