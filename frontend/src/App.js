import React from 'react';
import { HashRouter as BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import EscapeRoomsPage from './pages/EscapeRooms';
import LeaderboardPage from './pages/Leaderboard';
import NotFoundPage from './pages/NotFound';

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* početna stranica */}
                <Route index element={<HomePage />} />

                {/* escape rooms stranica */}
                <Route path="rooms" element={<EscapeRoomsPage />} />

                {/* leaderboard stranica */}
                <Route path="leaderboard" element={<LeaderboardPage />} />

                {/* stranica 404 */}
                <Route path="*" element={<NotFoundPage />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;