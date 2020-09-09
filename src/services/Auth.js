/* eslint-disable strict */
'use strict';

export const TOKEN_KEY = '@edigital-evolution-react:token';
export const REFRESH_TOKEN_KEY = '@edigital-evolution-react:refresh_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const logout = () => { localStorage.removeItem(TOKEN_KEY) };
export const geRefreshtToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
export const setToken = (token) => { localStorage.setItem(TOKEN_KEY, token) };
export const isAuthenticated = () => localStorage.getItem(TOKEN_KEY) !== null;
export const setRefreshtToken = (token) => { localStorage.setItem(REFRESH_TOKEN_KEY, token) };


