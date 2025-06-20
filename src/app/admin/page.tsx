'use client';

import { useEffect, useState } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatEther, getAddress } from 'viem';
import airdropAbi from '../../abi/airdrop.json'; // Paste your ABI here

const AIRDROP_CONTRACT_ADDRESS = getAddress(process.env.NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS || '') as `0x${string}`;
type Claimer = {
  address: string;
  amount: string;
};

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [isOwner, setIsOwner] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState({
    totalTokens: '0',
    claimedTokens: '0',
    remainingTokens: '0',
  });
  const [recentClaimers, setRecentClaimers] = useState<Claimer[]>([]);
  const [loading, setLoading] = useState({
    pause: false,
    recover: false,
    general: false,
  });

  useEffect(() => {
    if (!isConnected || !address) return;
    loadContractData();
  }, [address, isConnected]);

  const loadContractData = async () => {
    if (!publicClient) {
      console.error('publicClient is not ready');
      return;
    }
    try {
      setLoading(prev => ({ ...prev, general: true }));
      const normalized = getAddress(address!);

      const [owner, [distributed, claimed, remaining, paused], [addresses, amounts]] =
        await Promise.all([
          publicClient.readContract({
            address: AIRDROP_CONTRACT_ADDRESS,
            abi: airdropAbi,
            functionName: 'owner',
          }) as Promise<string>,
          publicClient.readContract({
            address: AIRDROP_CONTRACT_ADDRESS,
            abi: airdropAbi,
            functionName: 'getAirdropStatus',
          })as Promise<[bigint, bigint, bigint, boolean]>,
          publicClient.readContract({
            address: AIRDROP_CONTRACT_ADDRESS,
            abi: airdropAbi,
            functionName: 'getRecentClaimers',
            args: [10],
          }) as Promise<[string[], bigint[]]>,
        ]);

      setIsOwner(getAddress(owner as string) === normalized);
      setIsPaused(paused as boolean);

      setStats({
        totalTokens: formatEther(distributed),
        claimedTokens: formatEther(claimed),
        remainingTokens: formatEther(remaining),
      });

      const claimers: Claimer[] = addresses.map((addr, i) => ({
        address: addr,
        amount: formatEther(amounts[i]),
      }));
      setRecentClaimers(claimers);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(prev => ({ ...prev, general: false }));
    }
  };

  const togglePause = async () => {
    if (!walletClient) return;
    if (!publicClient) {
      console.error('publicClient is not ready');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, pause: true }));
      const { request } = await publicClient.simulateContract({
        address: AIRDROP_CONTRACT_ADDRESS,
        abi: airdropAbi,
        functionName: 'pauseAirdrop',
        args: [!isPaused],
        account: walletClient.account,
      });

      const hash = await walletClient.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash });
      setIsPaused(!isPaused);
    } catch (err) {
      console.error('Pause toggle failed:', err);
    } finally {
      setLoading(prev => ({ ...prev, pause: false }));
    }
  };

  const recoverTokens = async () => {
    if (!walletClient || !isPaused) return;
    if (!publicClient) {
      console.error('publicClient is not ready');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, recover: true }));
      const { request } = await publicClient.simulateContract({
        address: AIRDROP_CONTRACT_ADDRESS,
        abi: airdropAbi,
        functionName: 'recoverUnclaimedTokens',
        account: walletClient.account,
      });

      const hash = await walletClient.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash });
      await loadContractData();
    } catch (err) {
      console.error('Recovery failed:', err);
    } finally {
      setLoading(prev => ({ ...prev, recover: false }));
    }
  };

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto bg-card rounded-lg border p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-6">Airdrop Admin Dashboard</h1>

        <div className="flex justify-center mb-6">
          <ConnectButton showBalance={false} accountStatus="address" chainStatus="none" />
        </div>

        {isConnected && (
          <div className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Connected wallet: <span className="font-mono">{address}</span>
              </p>
            </div>

            {isOwner ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="text-sm text-muted-foreground">Total Tokens</h3>
                    <p className="text-xl font-bold">{stats.totalTokens}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="text-sm text-muted-foreground">Claimed</h3>
                    <p className="text-xl font-bold">{stats.claimedTokens}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="text-sm text-muted-foreground">Remaining</h3>
                    <p className="text-xl font-bold">{stats.remainingTokens}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={togglePause}
                    disabled={loading.pause || loading.general}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      loading.pause
                        ? 'bg-gray-500 cursor-not-allowed'
                        : isPaused
                          ? 'bg-green-600 text-primary-foreground hover:bg-green-600/90'
                          : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    }`}
                  >
                    {loading.pause
                      ? 'Processing...'
                      : isPaused
                        ? 'Unpause Airdrop'
                        : 'Pause Airdrop'}
                  </button>

                  <button
                    onClick={recoverTokens}
                    disabled={!isPaused || loading.recover || loading.general}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      loading.recover
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-yellow-600 text-primary-foreground hover:bg-yellow-600/90'
                    }`}
                  >
                    {loading.recover ? 'Processing...' : 'Recover Unclaimed Tokens'}
                  </button>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Recent Claimers</h2>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                            Address
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-background">
                        {recentClaimers.map((claimer, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm font-mono">{claimer.address}</td>
                            <td className="px-4 py-3 text-sm">{claimer.amount} tokens</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/30">
                <p className="text-destructive text-center">
                  You are not authorized to access this page
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
