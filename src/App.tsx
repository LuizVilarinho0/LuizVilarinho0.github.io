import { AnimatePresence, MotionConfig } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { IntroProvider } from './components/Loader';
import Contato from './pages/Contato';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Projeto from './pages/Projeto';
import Trabalhos from './pages/Trabalhos';

export default function App() {
  const location = useLocation();
  return (
    <MotionConfig reducedMotion="user">
      <IntroProvider>
        <a className="skip" href="#conteudo">
          Pular para o conteúdo
        </a>
        <Header />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/trabalhos" element={<Trabalhos />} />
            <Route path="/trabalhos/:slug" element={<Projeto />} />
            <Route path="/agendar" element={<Navigate to="/contato" replace />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
        <Footer />
      </IntroProvider>
    </MotionConfig>
  );
}
