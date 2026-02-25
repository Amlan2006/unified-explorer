import { SearchResult } from '../types';
import ResultCard from './ResultCard';
import './ResultsDisplay.css';

interface ResultsDisplayProps {
  results: SearchResult;
}

function ResultsDisplay({ results }: ResultsDisplayProps) {
  if (!results.found || results.results.length === 0) {
    return (
      <div className="no-results">
        <span className="no-results-icon">🔍</span>
        <h3>No results found</h3>
        <p>Try searching with a different term or contract address</p>
      </div>
    );
  }

  return (
    <div className="results-display">
      <div className="results-header">
        <h2>
          <span className="results-icon">✅</span>
          Found {results.results.length} result{results.results.length !== 1 ? 's' : ''}
        </h2>
        <div className="search-info">
          <span className="search-term">"{results.searchTerm}"</span>
          <span className="search-type-badge">{results.searchType}</span>
        </div>
      </div>

      <div className="results-grid">
        {results.results.map((result, index) => (
          <ResultCard key={`${result.chainId}-${result.address}-${index}`} result={result} />
        ))}
      </div>
    </div>
  );
}

export default ResultsDisplay;
