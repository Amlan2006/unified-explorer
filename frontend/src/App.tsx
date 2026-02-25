import { useState } from 'react';
import SearchBar from './components/SearchBar';
import ResultsDisplay from './components/ResultsDisplay';
import ChainList from './components/ChainList';
import { UnifiedExplorer } from './lib/UnifiedExplorer';
import { SearchResult } from './types';
import './App.css';

const explorer = new UnifiedExplorer();

function App() {
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const searchResults = await explorer.smartSearch(query);
      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1 className="title">
            <span className="icon">🔍</span>
            Unified EVM Explorer
          </h1>
          <p className="subtitle">
            Search tokens and contracts across all EVM chains
          </p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <SearchBar onSearch={handleSearch} loading={loading} />
          
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Searching across all chains...</p>
            </div>
          )}

          {results && !loading && (
            <ResultsDisplay results={results} />
          )}

          {!results && !loading && !error && (
            <div className="welcome">
              <div className="welcome-content">
                <h2>Welcome to Unified EVM Explorer</h2>
                <p>Search for any token or contract across multiple chains:</p>
                <ul>
                  <li>🔍 Search by token symbol (e.g., USDT, USDC)</li>
                  <li>📝 Search by token name (e.g., Tether, Wrapped Bitcoin)</li>
                  <li>📍 Search by contract address</li>
                </ul>
                <ChainList chains={explorer.getSupportedChains()} />
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>Powered by Ethers.js • Searches across {explorer.getSupportedChains().length} EVM chains</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
