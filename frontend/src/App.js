import React from 'react';
import HomePage from './pages/Home';
import LeaderboardPage from "./pages/Leaderboard";
import NotFoundPage from "./pages/NotFound";
import { BrowserRouter, Routes, Route } from 'react-router';

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route index element={<HomePage/>} />

                <Route path="leaderboard" element={<LeaderboardPage/>} />

                <Route path="*" element={<NotFoundPage />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;