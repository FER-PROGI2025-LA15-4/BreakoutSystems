import React from 'react';
import MyButton from './components/MyButton';
import { BrowserRouter as Router, Routes, Route } from 'react-router';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MyButton/>} />
            </Routes>
        </Router>
    );
}

export default App;