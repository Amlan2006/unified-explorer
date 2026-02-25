# Unified EVM Explorer

A powerful tool to search for tokens and contracts across all major EVM chains from a single interface. No need to check multiple block explorers!

## Features

- 🔍 Search by token name, symbol, or contract address
- 🌐 Searches across 8+ major EVM chains simultaneously
- 📊 Retrieves token information (name, symbol, decimals, supply)
- ⚡ Fast parallel searches across all chains
- 🎯 Smart search detection (auto-detects address vs name vs symbol)

## Supported Chains

- Ethereum Mainnet
- BNB Smart Chain
- Polygon
- Arbitrum One
- Optimism
- Avalanche C-Chain
- Fantom
- Base

## Installation

```bash
cd unified-explorer
npm install
npm run build
```

## Usage

### Command Line Interface

```bash
# Search by token symbol
npm run search USDT

# Search by token name
npm run search "Tether"

# Search by contract address
npm run search 0xdAC17F958D2ee523a2206206994597C13D831ec7
```

### Programmatic Usage

```typescript
import { UnifiedExplorer } from './src';

const explorer = new UnifiedExplorer();

// Smart search (auto-detects type)
const result = await explorer.smartSearch('USDT');

// Search by specific type
const byAddress = await explorer.searchByAddress('0x...');
const byName = await explorer.searchByTokenName('Tether');
const bySymbol = await explorer.searchByTokenSymbol('USDT');

// Display results
console.log(`Found ${result.results.length} results`);
result.results.forEach(item => {
  console.log(`${item.chain}: ${item.address}`);
  if (item.tokenInfo) {
    console.log(`  Token: ${item.tokenInfo.name} (${item.tokenInfo.symbol})`);
  }
});
```

## API Reference

### UnifiedExplorer

#### Methods

- `smartSearch(query: string)` - Automatically detects search type and searches
- `searchByAddress(address: string)` - Search for a specific address across all chains
- `searchByTokenName(name: string)` - Search for tokens by name
- `searchByTokenSymbol(symbol: string)` - Search for tokens by symbol
- `getSupportedChains()` - Get list of all supported chains

#### Response Format

```typescript
{
  found: boolean;
  results: ContractInfo[];
  searchTerm: string;
  searchType: 'address' | 'token-name' | 'token-symbol';
}
```

## Examples

### Example 1: Find USDT on all chains

```bash
npm run search USDT
```

Output:
```
✅ Found 5 result(s) for "USDT"

📍 Result #1
   Chain: Ethereum (Chain ID: 1)
   Address: 0xdAC17F958D2ee523a2206206994597C13D831ec7
   📊 Token Information:
      Name: Tether USD
      Symbol: USDT
      Decimals: 6

📍 Result #2
   Chain: BNB Smart Chain (Chain ID: 56)
   Address: 0x55d398326f99059fF775485246999027B3197955
   ...
```

### Example 2: Check if an address exists on multiple chains

```bash
npm run search 0xYourAddress
```

### Example 3: Find all tokens with "Wrapped" in the name

```bash
npm run search "Wrapped"
```

## Extending the Explorer

### Add More Chains

Edit `src/chains.ts`:

```typescript
export const SUPPORTED_CHAINS: ChainConfig[] = [
  // ... existing chains
  {
    chainId: 324,
    name: 'zkSync Era',
    rpcUrl: 'https://mainnet.era.zksync.io',
    explorer: 'https://explorer.zksync.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
  }
];
```

### Add Token Lists

For production use, integrate with token list APIs:

- CoinGecko API
- 1inch Token List
- Uniswap Token Lists
- Custom token database

## Performance Tips

- Results are fetched in parallel across all chains
- Consider caching token information for frequently searched tokens
- Use specific search methods when you know the search type
- For production, implement rate limiting and request batching

## Limitations

- Currently uses a curated list of popular tokens per chain
- Some chains may have slower RPC response times
- Token name searches are limited to known tokens

## Future Enhancements

- [ ] Integration with token list APIs
- [ ] NFT contract detection and metadata
- [ ] Transaction history lookup
- [ ] Web interface
- [ ] Caching layer for faster searches
- [ ] Support for testnets
- [ ] Advanced filtering options

## License

MIT
