import { UnifiedExplorer } from './src';

const colors = {
  dim: (text: string) => `\x1b[2m${text}\x1b[0m`,
  gray: (text: string) => `\x1b[90m${text}\x1b[0m`,
  cyan: (text: string) => `\x1b[36m${text}\x1b[0m`,
  magenta: (text: string) => `\x1b[35m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  bold: (text: string) => `\x1b[1m${text}\x1b[0m`,
};

function sectionTitle(label: string) {
  console.log(colors.magenta(colors.bold(label)));
  console.log(colors.gray('─'.repeat(60)));
}

async function examples() {
  const explorer = new UnifiedExplorer();

  console.log(colors.cyan(colors.bold('🚀 Unified EVM Explorer - Examples\n')));

  // Example 1: Search for USDT across all chains
  sectionTitle('Example 1: Search for USDT token');
  const usdtResults = await explorer.smartSearch('USDT');
  console.log(
    colors.yellow(`Found USDT on ${usdtResults.results.length} chains:`)
  );
  usdtResults.results.forEach(r => {
    console.log(colors.green(`  • ${r.chain}: ${r.address}`));
    if (r.tokenInfo) {
      console.log(
        colors.dim(`    ${r.tokenInfo.name} (${r.tokenInfo.symbol})`)
      );
    }
  });

  // Example 2: Search by specific address
  console.log();
  console.log();
  sectionTitle('Example 2: Search by address');
  const addressResults = await explorer.searchByAddress(
    '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  );
  console.log(
    colors.yellow(
      `Address found on ${addressResults.results.length} chain(s):`
    )
  );
  addressResults.results.forEach(r => {
    console.log(colors.green(`  • ${r.chain}`));
    console.log(colors.gray(`    Contract: ${r.isContract ? 'Yes' : 'No'}`));
    console.log(colors.gray(`    Balance: ${r.balance}`));
    if (r.tokenInfo) {
      console.log(
        colors.dim(`    Token: ${r.tokenInfo.name} (${r.tokenInfo.symbol})`)
      );
    }
  });

  // Example 3: Search by token name
  console.log();
  console.log();
  sectionTitle('Example 3: Search by token name');
  const nameResults = await explorer.searchByTokenName('Tether');
  console.log(
    colors.yellow(
      `Found ${nameResults.results.length} tokens matching "Tether":`
    )
  );
  nameResults.results.forEach(r => {
    console.log(colors.green(`  • ${r.chain}: ${r.tokenInfo?.name}`));
  });

  // Example 4: Get all supported chains
  console.log();
  console.log();
  sectionTitle('Example 4: Supported chains');
  const chains = explorer.getSupportedChains();
  console.log(colors.yellow(`Total supported chains: ${chains.length}`));
  chains.forEach(chain => {
    console.log(
      colors.green(`  • ${chain.name} (Chain ID: ${chain.chainId})`)
    );
    console.log(colors.gray(`    Native: ${chain.nativeCurrency.symbol}`));
    console.log(colors.dim(`    Explorer: ${chain.explorer}`));
  });
}

examples().catch(console.error);
