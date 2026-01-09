import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import Home from './pages/Home';
import { Reference } from './pages/Reference';
import { Checker } from './pages/Checker';
import { QuickTools } from './pages/QuickTools';

// Placeholder components for routes not yet implemented
const Search = () => <div className="p-8">Search Coming Soon</div>;
const Settings = () => <div className="p-8">Settings Coming Soon</div>;

export default function App() {
  return (
    <Router>
      <div className="flex h-screen bg-background text-foreground font-sans antialiased overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-muted/20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/checker" element={<Checker />} />
            <Route path="/reference" element={<Reference />} />
            <Route path="/search" element={<Search />} />
            <Route path="/tools" element={<QuickTools />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}