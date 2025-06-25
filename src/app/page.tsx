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
    <main className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 px-4">
      <div className="text-center max-w-xl p-8 rounded-2xl bg-slate-800 shadow-xl border border-slate-700">
        <h1 className="text-4xl font-extrabold text-blue-400 mb-4">Rather Airdrop</h1>
        
        <p className="mb-8 text-lg text-slate-400">
          {isConnected 
            ? address === ADMIN_ADDRESS 
              ? "You're logged in as admin." 
              : "You're eligible to claim tokens!"
            : "Connect your wallet to get started."}
        </p>

        <div className="flex justify-center">
          <ConnectButton 
            showBalance={false}
            accountStatus="full"
            chainStatus="icon"
          />
        </div>
      </div>
    </main>
  );
}