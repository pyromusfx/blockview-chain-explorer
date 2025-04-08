
import { toast } from "@/components/ui/use-toast";

const API_URL = "http://134.209.225.50:8545";

interface JsonRpcRequest {
  jsonrpc: string;
  method: string;
  params: any[];
  id: number;
}

export interface Block {
  number: string;
  hash: string;
  parentHash: string;
  nonce: string;
  sha3Uncles: string;
  logsBloom: string;
  transactionsRoot: string;
  stateRoot: string;
  receiptsRoot: string;
  miner: string;
  difficulty: string;
  totalDifficulty: string;
  extraData: string;
  size: string;
  gasLimit: string;
  gasUsed: string;
  timestamp: string;
  transactions: Transaction[] | string[];
  uncles: string[];
}

export interface Transaction {
  hash: string;
  nonce: string;
  blockHash: string;
  blockNumber: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  input: string;
}

export interface TransactionReceipt {
  blockHash: string;
  blockNumber: string;
  contractAddress: string | null;
  cumulativeGasUsed: string;
  effectiveGasPrice: string;
  from: string;
  gasUsed: string;
  logs: any[];
  logsBloom: string;
  status: string;
  to: string;
  transactionHash: string;
  transactionIndex: string;
  type: string;
}

class BlockchainService {
  private requestId = 1;

  async sendRequest<T>(method: string, params: any[] = []): Promise<T> {
    const request: JsonRpcRequest = {
      jsonrpc: "2.0",
      method,
      params,
      id: this.requestId++,
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || "Unknown error occurred");
      }

      return data.result;
    } catch (error) {
      console.error("API request failed:", error);
      toast({
        title: "Error",
        description: `Failed to fetch blockchain data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      throw error;
    }
  }

  async getBlockNumber(): Promise<string> {
    return this.sendRequest<string>("eth_blockNumber");
  }

  async getBlockByNumber(blockNumber: string, includeTransactions = true): Promise<Block> {
    return this.sendRequest<Block>("eth_getBlockByNumber", [blockNumber, includeTransactions]);
  }

  async getLatestBlocks(count = 10): Promise<Block[]> {
    const blockNumber = await this.getBlockNumber();
    const blockNumberInt = parseInt(blockNumber, 16);
    
    const blocks: Block[] = [];
    for (let i = 0; i < count; i++) {
      if (blockNumberInt - i < 0) break;
      const blockHex = "0x" + (blockNumberInt - i).toString(16);
      const block = await this.getBlockByNumber(blockHex, false);
      blocks.push(block);
    }
    
    return blocks;
  }

  async getTransaction(txHash: string): Promise<Transaction> {
    return this.sendRequest<Transaction>("eth_getTransactionByHash", [txHash]);
  }

  async getTransactionReceipt(txHash: string): Promise<TransactionReceipt> {
    return this.sendRequest<TransactionReceipt>("eth_getTransactionReceipt", [txHash]);
  }

  async getBalance(address: string, blockNumber = "latest"): Promise<string> {
    return this.sendRequest<string>("eth_getBalance", [address, blockNumber]);
  }

  async getCode(address: string, blockNumber = "latest"): Promise<string> {
    return this.sendRequest<string>("eth_getCode", [address, blockNumber]);
  }

  async getTransactionCount(address: string, blockNumber = "latest"): Promise<string> {
    return this.sendRequest<string>("eth_getTransactionCount", [address, blockNumber]);
  }
}

export const blockchainService = new BlockchainService();
