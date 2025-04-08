
export const shortenAddress = (address: string, chars = 4): string => {
  if (!address) return '';
  return `${address.substring(0, chars + 2)}...${address.substring(42 - chars)}`;
};

export const shortenHash = (hash: string, chars = 6): string => {
  if (!hash) return '';
  return `${hash.substring(0, chars + 2)}...${hash.substring(hash.length - chars)}`;
};

export const hexToNumber = (hex: string): number => {
  if (!hex) return 0;
  return parseInt(hex, 16);
};

export const formatTimestamp = (timestamp: string): string => {
  if (!timestamp) return '';
  const date = new Date(hexToNumber(timestamp) * 1000);
  return date.toLocaleString();
};

export const formatGas = (gas: string): string => {
  if (!gas) return '0';
  return hexToNumber(gas).toLocaleString();
};

export const formatGwei = (wei: string): string => {
  if (!wei) return '0';
  const gwei = hexToNumber(wei) / 1e9;
  return gwei.toLocaleString();
};

export const formatEther = (wei: string): string => {
  if (!wei) return '0';
  const ether = hexToNumber(wei) / 1e18;
  return ether.toLocaleString(undefined, { maximumFractionDigits: 18 });
};

export const formatBlockNumber = (blockNumber: string): string => {
  if (!blockNumber) return '';
  return hexToNumber(blockNumber).toLocaleString();
};
