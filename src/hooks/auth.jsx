import React, { createContext, useContext, useState } from 'react';
import api, { useExceptionNotification } from '../services/api';

const AuthContext = createContext({});
export const project = "@Project";

export const AuthProvider = ({ children }) => {
    const exceptionNotificationAPI = useExceptionNotification();

    const [user, setUser] = useState(() => {
        const token = localStorage.getItem(`${project}:token`);
        const user = localStorage.getItem(`${project}:user`);
        const userJson = JSON.parse(user);

        if (token && user) {
            api.defaults.headers.authorization = `Bearer ${token}`;
            return { token, user: userJson };
        }
        return null;
    });

    const signIn = async ({ username, password }) => {
        try {
            const response = await api.post('/signin', { username, password });
            const { accessToken, user } = response.data.response;
            setSignInDataOnLocalStorage(response, false);
            localStorage.setItem(`${project}:userName`, username);
            setUser({ token: accessToken, user });
            api.defaults.headers.authorization = `Bearer ${accessToken}`;
            return response;
        } catch (error) {
            exceptionNotificationAPI(error);
        }
    }

    const signOut = () => {
        api.defaults.headers.authorization = '';
        localStorage.removeItem(`${project}:token`);
        localStorage.removeItem(`${project}:user`);
        localStorage.removeItem(`${project}:userName`);
        setUser(null);
    }

    const setSignInDataOnLocalStorage = (result) => {
        if (result.data.response) {
            const token = result.data.response.accessToken;
            const user = result.data.response.user;
            const userRoles = result.data.response.roles;

            sessionStorage.clear();
            localStorage.removeItem(`${project}:token`);
            localStorage.removeItem(`${project}:user`);
            localStorage.removeItem(`${project}:userRoles`);
            localStorage.removeItem(`${project}:userName`);

            localStorage.setItem(`${project}:token`, token);
            localStorage.setItem(`${project}:user`, JSON.stringify(user));
            localStorage.setItem(`${project}:userRoles`, JSON.stringify(userRoles));

            api.defaults.headers.authorization = `Bearer ${token}`;

            setUser({ token, user, userRoles });
        }
    }

    return (
        <AuthContext.Provider value={{ user: user?.user, signIn, signOut }}        >
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    return useContext(AuthContext);
}
