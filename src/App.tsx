import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from './pages/Home/Home';

import NavBar from './components/NavBar/NavBar';
import Footer from './components/Footer/Footer';

import './App.css';

// Search 페이지는 /search로 이동할 때만 별도 청크로 내려받습니다.
// Home은 첫 진입 페이지라 lazy 처리하지 않습니다(추가 요청 왕복이 LCP를 늦추기 때문).
const Search = lazy(async () => await import('./pages/Search/Search'));

const App = () => {
  return (
    <Router basename={'/perf-basecamp'}>
      <NavBar />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
        </Routes>
      </Suspense>
      <Footer />
    </Router>
  );
};

export default App;
