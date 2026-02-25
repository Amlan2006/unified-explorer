import { ChainConfig } from '../types';
import './ChainList.css';

interface ChainListProps {
  chains: ChainConfig[];
}

function ChainList({ chains }: ChainListProps) {
  return (
    <div className="chain-list">
      <h3>Supported Chains ({chains.length})</h3>
      <div className="chains-grid">
        {chains.map((chain) => (
          <div key={chain.chainId} className="chain-item">
            <span className="chain-name">{chain.name}</span>
            <span className="chain-currency">{chain.nativeCurrency.symbol}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChainList;
