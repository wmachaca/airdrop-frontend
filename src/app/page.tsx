'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase() || '';

export default function Home() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected && address) {
      if (address.toLowerCase() === ADMIN_ADDRESS) {
        router.push('/admin');
      } else {
        router.push('/claim');
      }
    }
  }, [address, isConnected, router]);

  return (
    <main className="flex flex-col items-center justify-center h-[calc(100vh-64px)]">
      <div className="text-center max-w-md p-6 rounded-lg bg-background border">
        <h1 className="text-2xl font-bold mb-4">Rather Airdrop</h1>
        <p className="mb-6 text-muted-foreground">
          {isConnected 
            ? address === ADMIN_ADDRESS 
              ? "You're logged in as admin" 
              : "Connect your wallet to claim your airdrop"
            : "Connect your wallet to get started"}
        </p>
        <ConnectButton 
          showBalance={false}
          accountStatus="full"
          chainStatus="full"
        />
      </div>
    </main>
  );
}
