import { ContractInfo } from '../types';
import { getChainById } from '../lib/chains';
import './ResultCard.css';

interface ResultCardProps {
  result: ContractInfo;
}

function ResultCard({ result }: ResultCardProps) {
  const chain = getChainById(result.chainId);
  const explorerUrl = chain ? `${chain.explorer}/address/${result.address}` : '#';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="result-card">
      <div className="card-header">
        <div className="chain-badge">
          <span className="chain-icon">⛓️</span>
          {result.chain}
        </div>
        <span className="chain-id">ID: {result.chainId}</span>
      </div>

      <div className="card-body">
        <div className="address-section">
          <label>Contract Address</label>
          <div className="address-display">
            <code>{formatAddress(result.address)}</code>
            <button 
              className="copy-btn"
              onClick={() => copyToClipboard(result.address)}
              title="Copy address"
            >
              📋
            </button>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <label>Type</label>
            <span className={result.isContract ? 'contract-badge' : 'wallet-badge'}>
              {result.isContract ? '📄 Contract' : '👤 Wallet'}
            </span>
          </div>
          <div className="info-item">
            <label>Balance</label>
            <span>{parseFloat(result.balance).toFixed(4)} {chain?.nativeCurrency.symbol}</span>
          </div>
        </div>

        {result.tokenInfo && (
          <div className="token-info">
            <h4>🪙 Token Information</h4>
            <div className="token-details">
              <div className="token-row">
                <span className="token-label">Name:</span>
                <span className="token-value">{result.tokenInfo.name}</span>
              </div>
              <div className="token-row">
                <span className="token-label">Symbol:</span>
                <span className="token-value token-symbol">{result.tokenInfo.symbol}</span>
              </div>
              <div className="token-row">
                <span className="token-label">Decimals:</span>
                <span className="token-value">{result.tokenInfo.decimals}</span>
              </div>
              <div className="token-row">
                <span className="token-label">Supply:</span>
                <span className="token-value">{result.tokenInfo.totalSupply}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card-footer">
        <a 
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="explorer-link"
        >
          View on {chain?.name} Explorer →
        </a>
      </div>
    </div>
  );
}

export default ResultCard;
