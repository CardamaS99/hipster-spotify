export const getAuthURL = () => {
    const scopes = [
        'user-read-private',
        'user-read-email',
        'user-read-playback-state',
        'user-modify-playback-state',
        'streaming'
    ];

    const params = new URLSearchParams({
        client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
        scope: scopes.join(' ')
    });
    
    return `${import.meta.env.VITE_SPOTIFY_AUTH_URL}?${params.toString()}`;
}

export const extractCodeAndState = () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error'); // check if Spotify returned an error instead of a code
    return { code, state, error };
};

export const extractTokenFromUrl = () => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return params.get('access_token');
}