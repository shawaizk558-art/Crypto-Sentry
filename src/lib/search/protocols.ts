/** Built-in list of popular DeFi protocols for global search. */

export type ProtocolEntry = {
  id: string;
  name: string;
  aliases: string[];
  chain: string;
  category: string;
  assetId: string | null;
};

export const PROTOCOL_CATALOG: ProtocolEntry[] = [
  {
    id: "uniswap",
    name: "Uniswap",
    aliases: ["uni", "uniswap v3", "uniswap v2"],
    chain: "Ethereum",
    category: "DEX",
    assetId: "uniswap",
  },
  {
    id: "aave",
    name: "Aave",
    aliases: ["aave v3", "aave v2"],
    chain: "Multi-chain",
    category: "Lending",
    assetId: "aave",
  },
  {
    id: "compound",
    name: "Compound",
    aliases: ["comp"],
    chain: "Ethereum",
    category: "Lending",
    assetId: "compound-governance-token",
  },
  {
    id: "curve",
    name: "Curve",
    aliases: ["curve fi", "crv"],
    chain: "Multi-chain",
    category: "DEX",
    assetId: "curve-dao-token",
  },
  {
    id: "makerdao",
    name: "MakerDAO",
    aliases: ["maker", "dai", "mkr"],
    chain: "Ethereum",
    category: "Stablecoin",
    assetId: "maker",
  },
  {
    id: "lido",
    name: "Lido",
    aliases: ["steth", "lido staked ether"],
    chain: "Ethereum",
    category: "Staking",
    assetId: "lido-dao",
  },
  {
    id: "pancakeswap",
    name: "PancakeSwap",
    aliases: ["cake", "pcs"],
    chain: "BNB Chain",
    category: "DEX",
    assetId: "pancakeswap-token",
  },
  {
    id: "gmx",
    name: "GMX",
    aliases: ["gmx protocol"],
    chain: "Arbitrum",
    category: "Perpetuals",
    assetId: "gmx",
  },
  {
    id: "dydx",
    name: "dYdX",
    aliases: ["dydx v4"],
    chain: "dYdX Chain",
    category: "Perpetuals",
    assetId: "dydx-chain",
  },
  {
    id: "opensea",
    name: "OpenSea",
    aliases: ["os"],
    chain: "Multi-chain",
    category: "NFT Marketplace",
    assetId: null,
  },
  {
    id: "chainlink",
    name: "Chainlink",
    aliases: ["link", "ccip"],
    chain: "Multi-chain",
    category: "Oracle",
    assetId: "chainlink",
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    aliases: ["arb", "arbitrum one"],
    chain: "Arbitrum",
    category: "L2",
    assetId: "arbitrum",
  },
  {
    id: "optimism",
    name: "Optimism",
    aliases: ["op", "optimism mainnet"],
    chain: "Optimism",
    category: "L2",
    assetId: "optimism",
  },
];

// Find DeFi protocols whose name, alias, or chain matches the search text.
export function searchProtocols(query: string, limit = 5): ProtocolEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const scored = PROTOCOL_CATALOG.map((entry) => {
    const haystack = [entry.name, entry.id, ...entry.aliases, entry.chain, entry.category]
      .join(" ")
      .toLowerCase();
    const nameMatch = entry.name.toLowerCase().startsWith(q);
    const idMatch = entry.id.startsWith(q);
    const aliasMatch = entry.aliases.some((a) => a.startsWith(q) || a.includes(q));
    const contains = haystack.includes(q);

    if (!nameMatch && !idMatch && !aliasMatch && !contains) return null;

    const score =
      (nameMatch ? 4 : 0) +
      (idMatch ? 3 : 0) +
      (aliasMatch ? 2 : 0) +
      (contains ? 1 : 0);

    return { entry, score };
  }).filter((row): row is { entry: ProtocolEntry; score: number } => row !== null);

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.entry);
}
