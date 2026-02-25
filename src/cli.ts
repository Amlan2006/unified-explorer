import { UnifiedExplorer } from './UnifiedExplorer';

function displayResults(result: any) {
  console.log('\n' + '='.repeat(80));
  
  if (!result.found || result.results.length === 0) {
    console.log('❌ No results found');
    return;
  }

  console.log(`✅ Found ${result.results.length} result(s) for "${result.searchTerm}"`);
  console.log(`Search Type: ${result.searchType}\n`);

  result.results.forEach((item: any, index: number) => {
    console.log(`\n📍 Result #${index + 1}`);
    console.log(`   Chain: ${item.chain} (Chain ID: ${item.chainId})`);
    console.log(`   Address: ${item.address}`);
    console.log(`   Is Contract: ${item.isContract ? 'Yes' : 'No'}`);
    console.log(`   Balance: ${item.balance} ${item.chain === 'Ethereum' ? 'ETH' : 'native'}`);
    
    if (item.tokenInfo) {
      console.log(`\n   📊 Token Information:`);
      console.log(`      Name: ${item.tokenInfo.name}`);
      console.log(`      Symbol: ${item.tokenInfo.symbol}`);
      console.log(`      Decimals: ${item.tokenInfo.decimals}`);
      console.log(`      Total Supply: ${item.tokenInfo.totalSupply}`);
    }
    
    console.log('   ' + '-'.repeat(76));
  });
  
  console.log('\n' + '='.repeat(80) + '\n');
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🔍 Unified EVM Explorer - Search across all EVM chains

Usage:
  npm run search <query>

Examples:
  npm run search USDT                                    # Search by token symbol
  npm run search "Tether"                                # Search by token name
  npm run search 0xdAC17F958D2ee523a2206206994597C13D831ec7  # Search by address

Supported Chains:
  • Ethereum
  • BNB Smart Chain
  • Polygon
  • Arbitrum One
  • Optimism
  • Avalanche C-Chain
  • Fantom
  • Base
    `);
    return;
  }

  const query = args.join(' ');
  const explorer = new UnifiedExplorer();

  console.log(`\n🚀 Starting search for: "${query}"\n`);
  console.log('⏳ Searching across all EVM chains...');

  try {
    const result = await explorer.smartSearch(query);
    displayResults(result);
  } catch (error) {
    console.error('❌ Error during search:', error);
  }
}

main().catch(console.error);
