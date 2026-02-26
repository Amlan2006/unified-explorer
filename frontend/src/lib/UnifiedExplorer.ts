import { ethers } from 'ethers';
import { SUPPORTED_CHAINS } from './chains';
import { ContractInfo, SearchResult, TokenInfo } from '../types';

const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)'
];

export class UnifiedExplorer {
  private providers: Map<number, ethers.JsonRpcProvider> = new Map();

  constructor() {
    for (const chain of SUPPORTED_CHAINS) {
      this.providers.set(
        chain.chainId,
        new ethers.JsonRpcProvider(chain.rpcUrl)
      );
    }
  }

  private async getTokenInfo(
    address: string,
    chainId: number
  ): Promise<TokenInfo | null> {
    try {
      const provider = this.providers.get(chainId);
      if (!provider) return null;

      const contract = new ethers.Contract(address, ERC20_ABI, provider);
      const chain = SUPPORTED_CHAINS.find(c => c.chainId === chainId);

      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply()
      ]);

      return {
        address,
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: totalSupply.toString(),
        chain: chain?.name || 'Unknown',
        chainId
      };
    } catch (error) {
      return null;
    }
  }

  async searchByAddress(address: string): Promise<SearchResult> {
    if (!ethers.isAddress(address)) {
      return {
        found: false,
        results: [],
        searchTerm: address,
        searchType: 'address'
      };
    }

    const results: ContractInfo[] = [];
    const searchPromises = SUPPORTED_CHAINS.map(async (chain) => {
      try {
        const provider = this.providers.get(chain.chainId);
        if (!provider) return null;

        const [code, balance] = await Promise.all([
          provider.getCode(address),
          provider.getBalance(address)
        ]);

        const isContract = code !== '0x';
        let tokenInfo: TokenInfo | null = null;
        if (isContract) {
          tokenInfo = await this.getTokenInfo(address, chain.chainId);
        }

        const result: ContractInfo = {
          address,
          chain: chain.name,
          chainId: chain.chainId,
          isContract,
          balance: ethers.formatEther(balance)
        };

        if (tokenInfo) {
          result.tokenInfo = tokenInfo;
        }

        return result;
      } catch (error) {
        return null;
      }
    });

    const searchResults = await Promise.all(searchPromises);
    const validResults = searchResults.filter((r): r is ContractInfo => r !== null);
    results.push(...validResults);

    return {
      found: results.length > 0,
      results,
      searchTerm: address,
      searchType: 'address'
    };
  }

  async searchByTokenName(tokenName: string): Promise<SearchResult> {
    const results: ContractInfo[] = [];
    const searchPromises = SUPPORTED_CHAINS.map(async (chain) => {
      try {
        const tokens = await this.getPopularTokens(chain.chainId);
        const matchingTokens = tokens.filter(token =>
          token.name.toLowerCase().includes(tokenName.toLowerCase())
        );

        return matchingTokens.map(token => ({
          address: token.address,
          chain: chain.name,
          chainId: chain.chainId,
          isContract: true,
          balance: '0',
          tokenInfo: token
        }));
      } catch (error) {
        return [];
      }
    });

    const searchResults = await Promise.all(searchPromises);
    results.push(...searchResults.flat());

    return {
      found: results.length > 0,
      results,
      searchTerm: tokenName,
      searchType: 'token-name'
    };
  }

  async searchByTokenSymbol(symbol: string): Promise<SearchResult> {
    const results: ContractInfo[] = [];
    const searchPromises = SUPPORTED_CHAINS.map(async (chain) => {
      try {
        const tokens = await this.getPopularTokens(chain.chainId);
        const matchingTokens = tokens.filter(token =>
          token.symbol.toLowerCase() === symbol.toLowerCase()
        );

        return matchingTokens.map(token => ({
          address: token.address,
          chain: chain.name,
          chainId: chain.chainId,
          isContract: true,
          balance: '0',
          tokenInfo: token
        }));
      } catch (error) {
        return [];
      }
    });

    const searchResults = await Promise.all(searchPromises);
    results.push(...searchResults.flat());

    return {
      found: results.length > 0,
      results,
      searchTerm: symbol,
      searchType: 'token-symbol'
    };
  }

  private async getPopularTokens(chainId: number): Promise<TokenInfo[]> {
    const knownTokens = this.getKnownTokensByChain(chainId);
    const tokenInfoPromises = knownTokens.map(async (tokenAddress) => {
      return await this.getTokenInfo(tokenAddress, chainId);
    });

    const results = await Promise.all(tokenInfoPromises);
    return results.filter((t): t is TokenInfo => t !== null);
  }

  private getKnownTokensByChain(chainId: number): string[] {
    const tokensByChain: Record<number, string[]> = {
      1: [
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      ],
      56: [
        '0x55d398326f99059fF775485246999027B3197955',
        '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      ],
      137: [
        '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      ],
      159: [
        '0x67e67af2c0B5DAccf275F848BaFe509a71e8DAb0',
      ]
    };

    return tokensByChain[chainId] || [];
  }

  async smartSearch(queryParam: string): Promise<SearchResult> {
    const raw = String(queryParam ?? '');
    const query = raw.trim();

    // 1) Try address search first
    if (query && ethers.isAddress(query)) {
      return await this.searchByAddress(query);
    }

    if (!query) {
      return {
        found: false,
        results: [],
        searchTerm: '',
        searchType: 'token-name-or-symbol'
      };
    }

    // 2) In the frontend, also search BOTH symbol and name and merge
    const [symbolResult, nameResult] = await Promise.all([
      this.searchByTokenSymbol(query),
      this.searchByTokenName(query)
    ]);

    const seen = new Set<string>();
    const merged = [...symbolResult.results, ...nameResult.results].filter(
      r => {
        const key = `${r.chainId}:${r.address.toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }
    );

    return {
      found: merged.length > 0,
      results: merged,
      searchTerm: query,
      searchType: 'token-name-or-symbol'
    };
  }

  getSupportedChains() {
    return SUPPORTED_CHAINS;
  }
}
