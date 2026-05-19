import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';

export const saveToken = (t: string) => SecureStore.setItemAsync(TOKEN_KEY, t);
export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY);
export const clearToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);
