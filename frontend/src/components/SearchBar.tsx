import { useState, FormEvent } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading: boolean;
}

function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Search by token name, symbol, or contract address..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />
        <button 
          type="submit" 
          className="search-button"
          disabled={loading || !query.trim()}
        >
          {loading ? '⏳' : '🔍'} Search
        </button>
      </div>
      <div className="search-examples">
        <span>Try:</span>
        <button type="button" onClick={() => setQuery('USDT')} className="example-btn">USDT</button>
        <button type="button" onClick={() => setQuery('Wrapped Bitcoin')} className="example-btn">Wrapped Bitcoin</button>
        <button type="button" onClick={() => setQuery('0xdAC17F958D2ee523a2206206994597C13D831ec7')} className="example-btn">Address</button>
      </div>
    </form>
  );
}

export default SearchBar;
