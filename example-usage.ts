import { UnifiedExplorer } from './src';

async function examples() {
  const explorer = new UnifiedExplorer();

  console.log('🚀 Unified EVM Explorer - Examples\n');

  // Example 1: Search for USDT across all chains
  console.log('Example 1: Search for USDT token');
  console.log('='.repeat(60));
  const usdtResults = await explorer.smartSearch('USDT');
  console.log(`Found USDT on ${usdtResults.results.length} chains:`);
  usdtResults.results.forEach(r => {
    console.log(`  • ${r.chain}: ${r.address}`);
    if (r.tokenInfo) {
      console.log(`    ${r.tokenInfo.name} (${r.tokenInfo.symbol})`);
    }
  });

  // Example 2: Search by specific address
  console.log('\n\nExample 2: Search by address');
  console.log('='.repeat(60));
  const addressResults = await explorer.searchByAddress(
    '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  );
  console.log(`Address found on ${addressResults.results.length} chain(s):`);
  addressResults.results.forEach(r => {
    console.log(`  • ${r.chain}`);
    console.log(`    Contract: ${r.isContract ? 'Yes' : 'No'}`);
    console.log(`    Balance: ${r.balance}`);
    if (r.tokenInfo) {
      console.log(`    Token: ${r.tokenInfo.name} (${r.tokenInfo.symbol})`);
    }
  });

  // Example 3: Search by token name
  console.log('\n\nExample 3: Search by token name');
  console.log('='.repeat(60));
  const nameResults = await explorer.searchByTokenName('Tether');
  console.log(`Found ${nameResults.results.length} tokens matching "Tether":`);
  nameResults.results.forEach(r => {
    console.log(`  • ${r.chain}: ${r.tokenInfo?.name}`);
  });

  // Example 4: Get all supported chains
  console.log('\n\nExample 4: Supported chains');
  console.log('='.repeat(60));
  const chains = explorer.getSupportedChains();
  console.log(`Total supported chains: ${chains.length}`);
  chains.forEach(chain => {
    console.log(`  • ${chain.name} (Chain ID: ${chain.chainId})`);
    console.log(`    Native: ${chain.nativeCurrency.symbol}`);
    console.log(`    Explorer: ${chain.explorer}`);
  });
}

examples().catch(console.error);
