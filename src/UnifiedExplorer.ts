import { ethers } from 'ethers';
import axios from 'axios';
import { SUPPORTED_CHAINS } from './chains';
import { ContractInfo, SearchResult, TokenInfo } from './types';

const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)'
];

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

const PLATFORM_CHAIN_IDS: Record<string, number> = {
  ethereum: 1,
  'binance-smart-chain': 56,
  'polygon-pos': 137,
  'arbitrum-one': 42161,
  optimism: 10,
  avalanche: 43114,
  fantom: 250,
  base: 8453
};

export class UnifiedExplorer {
  private providers: Map<number, ethers.JsonRpcProvider> = new Map();

  constructor() {
    // Initialize providers for all chains
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
    console.log(`🔍 Searching for address: ${address} across all chains...`);
    
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

        return {
          address,
          chain: chain.name,
          chainId: chain.chainId,
          isContract,
          balance: ethers.formatEther(balance),
          code: isContract ? code.slice(0, 100) + '...' : undefined,
          tokenInfo: tokenInfo || undefined
        };
      } catch (error) {
        return null;
      }
    });

    const searchResults = await Promise.all(searchPromises);
    results.push(...searchResults.filter((r): r is ContractInfo => r !== null));

    return {
      found: results.length > 0,
      results,
      searchTerm: address,
      searchType: 'address'
    };
  }

  async searchByTokenName(tokenName: string): Promise<SearchResult> {
    console.log(`🔍 Searching for token name: "${tokenName}" across all chains...`);
    
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
    console.log(`🔍 Searching for token symbol: "${symbol}" across all chains...`);
    
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
    // This is a simplified version. In production, you'd want to:
    // 1. Use a token list API (like CoinGecko, 1inch, Uniswap token lists)
    // 2. Cache results
    // 3. Have a comprehensive database of tokens
    
    const knownTokens = this.getKnownTokensByChain(chainId);
    const tokenInfoPromises = knownTokens.map(async (tokenAddress) => {
      return await this.getTokenInfo(tokenAddress, chainId);
    });

    const results = await Promise.all(tokenInfoPromises);
    return results.filter((t): t is TokenInfo => t !== null);
  }

  private getKnownTokensByChain(chainId: number): string[] {
    const tokensByChain: Record<number, string[]> = {
      1: [ // Ethereum
        '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
        '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
        '0x514910771AF9Ca656af840dff83E8264EcF986CA', // LINK
        '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', // AAVE
        '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // UNI
      ],
      56: [ // BSC
        '0x55d398326f99059fF775485246999027B3197955', // USDT
        '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // USDC
        '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', // BUSD
        '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', // ETH
      ],
      137: [ // Polygon
        '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT
        '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
        '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', // DAI
        '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH
      ],
      42161: [ // Arbitrum
        '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // USDT
        '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', // USDC
        '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', // DAI
      ],
      10: [ // Optimism
        '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', // USDT
        '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', // USDC
        '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', // DAI
      ],
      159: [ // Roburna Testnet
        '0x67e67af2c0B5DAccf275F848BaFe509a71e8DAb0', // Amlan Test Token (ATT)
      ]
    };

    return tokensByChain[chainId] || [];
  }

  async smartSearch(query: string): Promise<SearchResult> {
    // 1) Address search always wins if valid
    if (ethers.isAddress(query)) {
      return await this.searchByAddress(query);
    }

    const trimmed = query.trim();
    if (!trimmed) {
      return {
        found: false,
        results: [],
        searchTerm: query,
        searchType: 'token-name-or-symbol'
      };
    }

    // 2) Use external token index (CoinGecko) to discover tokens
    //    by name or symbol across supported EVM chains.
    const externalResults = await this.searchTokensByNameOrSymbolExternal(
      trimmed
    );

    return {
      found: externalResults.length > 0,
      results: externalResults,
      searchTerm: query,
      searchType: 'token-name-or-symbol'
    };
  }

  private async searchTokensByNameOrSymbolExternal(
    query: string
  ): Promise<ContractInfo[]> {
    try {
      const searchResponse = await axios.get(`${COINGECKO_API}/search`, {
        params: { query }
      });

      const coins: any[] = Array.isArray(searchResponse.data?.coins)
        ? searchResponse.data.coins
        : [];

      // Limit to a reasonable number of matches to avoid API spam
      const topCoins = coins.slice(0, 8);

      const results: ContractInfo[] = [];

      for (const coin of topCoins) {
        try {
          const detailResponse = await axios.get(
            `${COINGECKO_API}/coins/${coin.id}`,
            {
              params: {
                localization: false,
                tickers: false,
                market_data: false,
                community_data: false,
                developer_data: false,
                sparkline: false
              }
            }
          );

          const platforms: Record<string, string> =
            detailResponse.data?.platforms || {};

          for (const [platform, address] of Object.entries(platforms)) {
            const chainId = PLATFORM_CHAIN_IDS[platform];
            if (!chainId || !address) continue;

            const chain = SUPPORTED_CHAINS.find(
              c => c.chainId === Number(chainId)
            );
            if (!chain) continue;

            const tokenInfo = await this.getTokenInfo(address, chainId);
            if (!tokenInfo) continue;

            results.push({
              address,
              chain: chain.name,
              chainId,
              isContract: true,
              balance: '0',
              tokenInfo
            });
          }
        } catch {
          // Ignore individual coin failures and continue
          continue;
        }
      }

      // Dedupe by chainId + address
      const seen = new Set<string>();
      return results.filter(result => {
        const key = `${result.chainId}:${result.address.toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    } catch {
      return [];
    }
  }

  getSupportedChains() {
    return SUPPORTED_CHAINS;
  }
}
