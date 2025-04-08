
import { blockchainService } from "./blockchainService";
import { toast } from "@/components/ui/use-toast";

export interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  balance?: string;
}

// Common ERC20 token addresses on Ethereum networks
const commonTokens: Token[] = [
  {
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    name: "Tether USD",
    symbol: "USDT",
    decimals: 6,
    totalSupply: "0"
  },
  {
    address: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
    name: "BNB",
    symbol: "BNB",
    decimals: 18,
    totalSupply: "0"
  },
  {
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    totalSupply: "0"
  },
  {
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    name: "Dai Stablecoin",
    symbol: "DAI",
    decimals: 18,
    totalSupply: "0"
  },
  {
    address: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
    name: "SHIBA INU",
    symbol: "SHIB",
    decimals: 18,
    totalSupply: "0"
  },
  {
    address: "0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39",
    name: "HEX",
    symbol: "HEX",
    decimals: 8,
    totalSupply: "0"
  },
  {
    address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    name: "ChainLink Token",
    symbol: "LINK",
    decimals: 18,
    totalSupply: "0"
  },
  {
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    name: "Uniswap",
    symbol: "UNI",
    decimals: 18,
    totalSupply: "0"
  }
];

// ERC20 Methods for interacting with tokens
// These are standard method signatures for ERC20 tokens
const ERC20_ABI = {
  name: "0x06fdde03",       // keccak256("name()")
  symbol: "0x95d89b41",     // keccak256("symbol()")
  decimals: "0x313ce567",   // keccak256("decimals()")
  totalSupply: "0x18160ddd", // keccak256("totalSupply()")
  balanceOf: "0x70a08231",  // keccak256("balanceOf(address)")
};

class TokenService {
  private async callTokenMethod(
    tokenAddress: string,
    methodSignature: string,
    params: string[] = []
  ): Promise<string> {
    try {
      const data = methodSignature + params.map(p => p.replace("0x", "").padStart(64, "0")).join("");
      
      const result = await blockchainService.sendRequest<string>("eth_call", [
        {
          to: tokenAddress,
          data: data
        },
        "latest"
      ]);
      
      return result;
    } catch (error) {
      console.error(`Error calling token method on ${tokenAddress}:`, error);
      return "0x";
    }
  }

  private hexToUtf8(hex: string): string {
    try {
      // Remove 0x prefix and methodId (first 4 bytes) 
      hex = hex.startsWith("0x") ? hex.slice(2) : hex;
      
      // If the response is for a string, the first 32 bytes (64 chars) represent the location
      // The next 32 bytes represent the length of the string
      // The actual string data follows
      
      // For strings, extract length from the second 32 bytes 
      const lengthHex = hex.slice(64, 128);
      const length = parseInt(lengthHex, 16);
      
      if (length === 0 || isNaN(length)) return "";
      
      // Extract the string data, convert each byte to a character
      const stringData = hex.slice(128, 128 + length * 2);
      
      let result = "";
      for (let i = 0; i < stringData.length; i += 2) {
        const charCode = parseInt(stringData.substr(i, 2), 16);
        if (charCode !== 0) { // Skip null bytes
          result += String.fromCharCode(charCode);
        }
      }
      
      return result;
    } catch (error) {
      console.error("Error converting hex to utf8:", error);
      return "";
    }
  }

  private hexToNumber(hex: string): number {
    try {
      if (!hex || hex === "0x") return 0;
      
      return parseInt(hex.slice(2), 16);
    } catch (error) {
      console.error("Error converting hex to number:", error);
      return 0;
    }
  }

  private hexToBigInt(hex: string): string {
    try {
      if (!hex || hex === "0x") return "0";
      
      return BigInt(hex).toString();
    } catch (error) {
      console.error("Error converting hex to bigint:", error);
      return "0";
    }
  }

  async getTokenInfo(tokenAddress: string): Promise<Token | null> {
    try {
      const [nameResult, symbolResult, decimalsResult, totalSupplyResult] = await Promise.all([
        this.callTokenMethod(tokenAddress, ERC20_ABI.name),
        this.callTokenMethod(tokenAddress, ERC20_ABI.symbol),
        this.callTokenMethod(tokenAddress, ERC20_ABI.decimals),
        this.callTokenMethod(tokenAddress, ERC20_ABI.totalSupply)
      ]);
      
      const name = this.hexToUtf8(nameResult);
      const symbol = this.hexToUtf8(symbolResult);
      const decimals = this.hexToNumber(decimalsResult);
      const totalSupply = this.hexToBigInt(totalSupplyResult);
      
      if (!name || !symbol) {
        throw new Error("Not a valid ERC20 token");
      }
      
      return {
        address: tokenAddress,
        name,
        symbol,
        decimals,
        totalSupply
      };
    } catch (error) {
      console.error(`Error getting token info for ${tokenAddress}:`, error);
      return null;
    }
  }

  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string> {
    try {
      // Prepare the address parameter by removing 0x and padding to 32 bytes (64 chars)
      const addressParam = walletAddress.replace("0x", "").padStart(64, "0");
      
      const result = await this.callTokenMethod(
        tokenAddress,
        ERC20_ABI.balanceOf,
        [addressParam]
      );
      
      return this.hexToBigInt(result);
    } catch (error) {
      console.error(`Error getting token balance for ${tokenAddress}:`, error);
      return "0";
    }
  }

  async getCommonTokens(): Promise<Token[]> {
    return commonTokens;
  }
}

export const tokenService = new TokenService();
