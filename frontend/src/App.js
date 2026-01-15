import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import HomePage from './pages/Home';
import EscapeRoomsPage from './pages/EscapeRooms';
import LeaderboardPage from './pages/Leaderboard';
import NotFoundPage from './pages/NotFound';
import ProfilePage from "./pages/Profile";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import RoomPage from "./pages/Room";
import {AuthProvider} from "./context/AuthContext";
import { createTheme, MantineProvider } from '@mantine/core';

function App() {
    return (
        <MantineProvider theme={createTheme({})}>
            <BrowserRouter>
                <AuthProvider>
                    <Routes>

                        {/* početna stranica */}
                        <Route index element={<HomePage />} />

                        {/* escape rooms stranica */}
                        <Route path="escape-rooms" element={<EscapeRoomsPage />} />

                        {/* stranica za pojedini escape room */}
                        <Route path={"escape-rooms/:room_id"} element={<RoomPage/>} />

                        {/* leaderboard stranica */}
                        <Route path="leaderboard" element={<LeaderboardPage />} />

                        {/* profil stranica */}
                        <Route path="profile" element={<ProfilePage />} />

                        {/* login stranica */}
                        <Route path="login" element={<LoginPage />} />

                        {/* register stranica */}
                        <Route path="register" element={<RegisterPage />} />

                        {/* stranica 404 */}
                        <Route path="*" element={<NotFoundPage />} />

                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </MantineProvider>
    );
}

export default App;
