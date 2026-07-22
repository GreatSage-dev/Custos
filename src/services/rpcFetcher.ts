import { ethers } from 'ethers';
import { CONFIG } from '../config';

export interface RpcWalletInfo {
  address: string;
  txCount: number;
  balanceOkb: number;
  latestBlock: number;
}

export class RpcFetcher {
  private provider: ethers.JsonRpcProvider;

  constructor(rpcUrl: string = CONFIG.XLAYER_RPC_URL) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  async getWalletRpcInfo(address: string): Promise<RpcWalletInfo> {
    try {
      const [txCountHex, balanceHex, blockNumberHex] = await Promise.all([
        this.provider.send('eth_getTransactionCount', [address, 'latest']),
        this.provider.send('eth_getBalance', [address, 'latest']),
        this.provider.send('eth_blockNumber', []),
      ]);

      const txCount = parseInt(txCountHex, 16);
      const balanceWei = BigInt(balanceHex);
      const balanceOkb = parseFloat(ethers.formatEther(balanceWei));
      const latestBlock = parseInt(blockNumberHex, 16);

      return {
        address: ethers.getAddress(address),
        txCount,
        balanceOkb,
        latestBlock,
      };
    } catch (error) {
      console.warn(`RPC fetch warning for ${address}:`, error);
      return {
        address,
        txCount: 0,
        balanceOkb: 0,
        latestBlock: 0,
      };
    }
  }

  async getLatestBlockTimestamp(): Promise<number> {
    try {
      const block = await this.provider.getBlock('latest');
      return block ? block.timestamp : Math.floor(Date.now() / 1000);
    } catch {
      return Math.floor(Date.now() / 1000);
    }
  }
}
