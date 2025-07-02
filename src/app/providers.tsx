'use client'

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  sepolia
} from 'wagmi/chains';

import { anvil } from '../chains/anvil';


const config = getDefaultConfig({
  appName: 'Rather Airdrop',
  projectId: '052975ce93bb9660848050292e1a682f', // Get this from https://cloud.walletconnect.com
  chains: [mainnet, polygon, optimism, arbitrum, sepolia, anvil],
  ssr: true,//only for server side rendering
});

const queryClient = new QueryClient();


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
