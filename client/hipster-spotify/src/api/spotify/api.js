// Basic functions to interact with the Spotify API

import axios from 'axios';

// Obtener las playlists del usuario
export async function getUserPlaylists(token) {
  const playlists = [];
  let offset = 0;
  const limit = 50;

  try {
    while (true) {
      const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          limit,
          offset,
          fields: 'items(id,name,tracks.total,images),next'
        }
      });

      const items = response.data.items.map(playlist => ({
        id: playlist.id,
        name: playlist.name,
        total: playlist.tracks.total,
        images: playlist.images
      }));
      
      playlists.push(...items);

      if (!response.data.next) {
        break;
      }
      
      offset += limit;
    }

    console.log(`✅ Obtenidas ${playlists.length} playlists del usuario`);
    return playlists;
  } catch (error) {
    console.error("❌ Error al obtener playlists del usuario:", error.response?.data || error.message);
    throw error;
  }
}

// Obtener información de una playlist
export async function getPlaylistInfo(token, playlistId) {
  try {
    const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        fields: 'id,name,images,tracks.total'
      }
    });
    
    return {
      id: response.data.id,
      name: response.data.name,
      images: response.data.images,
      total: response.data.tracks.total
    };
  } catch (error) {
    console.error("❌ Error al obtener información de la playlist:", error.response?.data || error.message);
    throw error;
  }
}

// Obtener todas las canciones de una playlist
export async function getPlaylistTracks(token, playlistId) {
  const tracks = [];
  let offset = 0;
  const limit = 100;

  try {
    while (true) {
      const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          limit,
          offset,
          fields: 'items(track(id,name,uri,artists,album,duration_ms,preview_url)),next'
        }
      });

      const items = response.data.items
        .filter(item => item.track && item.track.id) // Filtrar tracks nulos
        .map(item => item.track);
      
      tracks.push(...items);

      if (!response.data.next) {
        break;
      }
      
      offset += limit;
    }

    console.log(`✅ Obtenidas ${tracks.length} canciones de la playlist ${playlistId}`);
    return tracks;
  } catch (error) {
    console.error("❌ Error al obtener canciones de la playlist:", error.response?.data || error.message);
    throw error;
  }
}

// Obtener canciones aleatorias de múltiples playlists
export async function getRandomTracksFromPlaylists(token, playlistIds) {
  if (!playlistIds || playlistIds.length === 0) {
    console.warn("⚠️ No hay playlists configuradas");
    return [];
  }

  const allTracks = [];

  try {
    // Obtener canciones de todas las playlists
    for (const playlistId of playlistIds) {
      const tracks = await getPlaylistTracks(token, playlistId);
      allTracks.push(...tracks);
    }

    // Eliminar duplicados por id
    const uniqueTracks = allTracks.filter(
      (t, i, self) => self.findIndex(x => x.id === t.id) === i
    );

    // Mezclar aleatoriamente
    const shuffled = uniqueTracks.sort(() => Math.random() - 0.5);

    console.log(`✅ Total: ${shuffled.length} canciones únicas de ${playlistIds.length} playlists`);
    return shuffled;
  } catch (error) {
    console.error("❌ Error al obtener canciones de las playlists:", error);
    throw error;
  }
}
