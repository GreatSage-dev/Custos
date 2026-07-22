import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import {
  rabbyWallet,
  okxWallet,
  metaMaskWallet,
  rainbowWallet,
  coinbaseWallet,
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { defineChain } from 'viem';
import { type ReactNode } from 'react';

const xlayerTestnet = defineChain({
  id: 1952,
  name: 'X Layer Testnet',
  nativeCurrency: { name: 'OKB', symbol: 'OKB', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testrpc.xlayer.tech', 'https://xlayertestrpc.okx.com'] },
  },
  blockExplorers: {
    default: { name: 'OKLink', url: 'https://www.oklink.com/xlayer-testnet' },
  },
  testnet: true,
});

const config = getDefaultConfig({
  appName: 'Custos',
  projectId: 'custos_okx_hackathon_2024',
  chains: [xlayerTestnet],
  wallets: [
    {
      groupName: 'Recommended',
      wallets: [rabbyWallet, okxWallet, metaMaskWallet, rainbowWallet, coinbaseWallet, injectedWallet],
    },
  ],
});

const queryClient = new QueryClient();

export default function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: '#8b5cf6',
          accentColorForeground: 'white',
          borderRadius: 'medium'
        })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
