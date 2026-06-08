export type DetectedTransaction = {
  hash: string;
  chain: string;
  explorerUrl: string;
};

const ETH_TX = /^0x[a-fA-F0-9]{64}$/;
const BTC_TX = /^[a-fA-F0-9]{64}$/;

export function detectTransaction(query: string): DetectedTransaction | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  if (ETH_TX.test(trimmed)) {
    return {
      hash: trimmed,
      chain: "Ethereum",
      explorerUrl: `https://etherscan.io/tx/${trimmed}`,
    };
  }

  if (BTC_TX.test(trimmed)) {
    return {
      hash: trimmed,
      chain: "Bitcoin",
      explorerUrl: `https://mempool.space/tx/${trimmed}`,
    };
  }

  return null;
}
