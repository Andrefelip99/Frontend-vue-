export const getUser = () => null;
export const setUser = () => undefined;
export const clearUser = () => undefined;
export const setAuthToken = (value) => localStorage.setItem('macedo-farias-auth-token', value);
export const getAuthToken = () => localStorage.getItem('macedo-farias-auth-token');
