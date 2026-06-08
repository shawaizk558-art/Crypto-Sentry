export type SearchAssetResult = {
  type: "asset";
  id: string;
  name: string;
  symbol: string;
  image: string | null;
  price: number | null;
  marketCapRank: number | null;
};

export type SearchProtocolResult = {
  type: "protocol";
  id: string;
  name: string;
  chain: string;
  category: string;
  assetId: string | null;
};

export type SearchTransactionResult = {
  type: "transaction";
  hash: string;
  chain: string;
  explorerUrl: string;
};

export type SearchResult =
  | SearchAssetResult
  | SearchProtocolResult
  | SearchTransactionResult;

export type SearchResponse = {
  query: string;
  results: SearchResult[];
};
