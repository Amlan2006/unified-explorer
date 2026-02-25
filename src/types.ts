export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  explorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  chain: string;
  chainId: number;
}

export interface ContractInfo {
  address: string;
  chain: string;
  chainId: number;
  isContract: boolean;
  balance: string;
  code?: string;
  tokenInfo?: TokenInfo;
}

export interface SearchResult {
  found: boolean;
  results: ContractInfo[];
  searchTerm: string;
  searchType: 'address' | 'token-name' | 'token-symbol';
}
