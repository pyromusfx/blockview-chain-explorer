
// Use ethers.js to create a wallet
import { Wallet } from 'ethers';

interface WalletData {
  address: string;
  privateKey: string;
  mnemonic: string;
}

/**
 * Creates a new Ethereum wallet
 * @param password Optional password to encrypt the wallet
 * @returns Wallet data including address, private key, and mnemonic phrase
 */
export const createWallet = async (password?: string): Promise<WalletData> => {
  try {
    // Create a random mnemonic (uses crypto.randomBytes under the hood)
    const wallet = Wallet.createRandom();
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase || "",
    };
  } catch (error) {
    console.error("Error creating wallet:", error);
    throw new Error("Failed to create wallet");
  }
};

/**
 * Import a wallet from a private key
 * @param privateKey The private key to import
 * @returns Wallet data
 */
export const importFromPrivateKey = (privateKey: string): WalletData => {
  try {
    const wallet = new Wallet(privateKey);
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: "", // No mnemonic when importing from private key
    };
  } catch (error) {
    console.error("Error importing wallet:", error);
    throw new Error("Invalid private key");
  }
};

/**
 * Import a wallet from a mnemonic phrase
 * @param mnemonic The mnemonic phrase to import
 * @returns Wallet data
 */
export const importFromMnemonic = (mnemonic: string): WalletData => {
  try {
    const wallet = Wallet.fromPhrase(mnemonic);
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: mnemonic,
    };
  } catch (error) {
    console.error("Error importing wallet:", error);
    throw new Error("Invalid mnemonic phrase");
  }
};
