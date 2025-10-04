import React, { createContext, useContext, useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth0Config } from '../config/auth0.config';
import { ApiService } from '../services/api';
import { makeRedirectUri } from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: any;
    accessToken: string | null;
    login: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth0 = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth0 must be used within Auth0Provider');
    }
    return context;
};

export const Auth0Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    const redirectUri = makeRedirectUri({
        scheme: 'com.clutter2cash',
        path: 'auth',
    });

    console.log('🔗 Redirect URI:', redirectUri);

    const discovery = AuthSession.useAutoDiscovery(`https://${auth0Config.domain}`);

    const [request, result, promptAsync] = AuthSession.useAuthRequest(
        {
            clientId: auth0Config.clientId,
            redirectUri,
            scopes: ['openid', 'profile', 'email'],
            extraParams: {
                audience: auth0Config.audience,
            },
            usePKCE: true,
            responseType: AuthSession.ResponseType.Code,
        },
        discovery
    );

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        console.log('Auth result changed:', result);
        if (result?.type === 'success') {
            console.log('Success! Calling handleAuthResponse');
            handleAuthResponse(result.params);
        } else if (result?.type === 'error') {
            console.error('Auth error result:', result.error);
        } else if (result?.type === 'dismiss' || result?.type === 'cancel') {
            console.log('User dismissed/cancelled login');
        }
    }, [result]);

    useEffect(() => {
        if (accessToken) {
            ApiService.setAccessToken(accessToken);
        }
    }, [accessToken]);

    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem('@auth_token');
            const userData = await AsyncStorage.getItem('@user_data');

            if (token && userData) {
                setAccessToken(token);
                setUser(JSON.parse(userData));
                setIsAuthenticated(true);
                ApiService.setAccessToken(token);
            }
        } catch (error) {
            console.error('Error checking auth:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAuthResponse = async (params: any) => {
        try {
            console.log('Auth params received:', params);
            console.log('Code verifier available:', !!request?.codeVerifier);

            const { code } = params;

            if (!code) {
                console.error('No authorization code received');
                return;
            }

            if (!request?.codeVerifier) {
                console.error('No code verifier available');
                return;
            }

            console.log('Exchanging code for tokens...');

            const tokenResponse = await fetch(`https://${auth0Config.domain}/oauth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    grant_type: 'authorization_code',
                    client_id: auth0Config.clientId,
                    code,
                    redirect_uri: redirectUri,
                    code_verifier: request.codeVerifier,
                }),
            });

            const tokens = await tokenResponse.json();
            console.log('Token exchange response:', tokens);

            if (tokens.error) {
                console.error('Token error:', tokens.error_description);
                return;
            }

            if (tokens.access_token) {
                console.log('Got access token, fetching user info...');

                const userResponse = await fetch(`https://${auth0Config.domain}/userinfo`, {
                    headers: {
                        Authorization: `Bearer ${tokens.access_token}`,
                    },
                });

                const userInfo = await userResponse.json();
                console.log('User info:', userInfo);

                await AsyncStorage.setItem('@auth_token', tokens.access_token);
                await AsyncStorage.setItem('@user_data', JSON.stringify(userInfo));

                setAccessToken(tokens.access_token);
                setUser(userInfo);
                setIsAuthenticated(true);
                ApiService.setAccessToken(tokens.access_token);
            }
        } catch (error) {
            console.error('Auth error:', error);
        }
    };

    const login = async () => {
        try {
            console.log('Starting login...');
            console.log('Request object:', request);
            console.log('Redirect URI:', redirectUri);
            const authResult = await promptAsync();
            console.log('Prompt result:', authResult);
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('@auth_token');
            await AsyncStorage.removeItem('@user_data');

            setAccessToken(null);
            setUser(null);
            setIsAuthenticated(false);

            const logoutUrl = `https://${auth0Config.domain}/v2/logout?client_id=${auth0Config.clientId}&returnTo=${encodeURIComponent(redirectUri)}`;
            await WebBrowser.openAuthSessionAsync(logoutUrl, redirectUri);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading,
                user,
                accessToken,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};