// App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Post from './components/Post';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Static route for the homepage */}
          <Route path="/" element={<Home />} />

          {/* Dynamic route for the blog posts */}
          <Route path="/post/:id" element={<Post />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;