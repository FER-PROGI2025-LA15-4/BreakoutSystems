import React, { createContext, useContext, useState, useEffect } from "react";
import { useSearchParams } from "react-router";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// use for fetching protected resources (handles session expiration)
export async function authFetch(url, options = {}) {
    const response = await fetch(url, {...options});

    if (response.status === 401) {
        window.dispatchEvent(new Event('session-expired'));
    }

    return response;
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        // check for auth_error in URL params
        const auth_error = searchParams.get("auth_error");
        if (auth_error !== null) {
            setAuthError(auth_error);  // save auth error message
            // remove auth_error from URL after reading it
            searchParams.delete("auth_error");
            setSearchParams(searchParams, { replace: true });
        }
        // check if user is already logged in
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                } else {
                    setUser(null);
                }
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // session expiration handler
    useEffect(() => {
        const handleSessionExpired = () => {
            setUser(null);
        };

        window.addEventListener('session-expired', handleSessionExpired);

        return () => {
            window.removeEventListener('session-expired', handleSessionExpired);
        };
    }, []);

    // login function
    const login = () => {
        window.location.href = "/api/auth/login";
    };

    // logout function
    const logout = async () => {
        try {
            await fetch('/api/auth/logout');
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            authError,
            clearAuthError: () => setAuthError(null),
            login,
            logout }}>
            {children}
        </AuthContext.Provider>
    );
};
