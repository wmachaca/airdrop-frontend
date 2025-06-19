'use client'

import { useEffect, useState } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatEther, getAddress } from 'viem';
import { readContract, writeContract } from '@wagmi/core';
import airdropAbi from '../../abi/airdrop.json'; // Paste your ABI here

const AIRDROP_CONTRACT_ADDRESS = '0xYourAirdropContractAddress';

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isConnected || !address) return;
    loadContractData();
  }, [address, isConnected]);


      const loadContractData = async () => {
    try {
      const normalized = getAddress(address!);

      const [owner, [distributed, claimed, remaining, paused], [addresses, amounts]] =
        await Promise.all([
          readContract({
            address: AIRDROP_CONTRACT_ADDRESS,
            abi: airdropAbi,
            functionName: 'owner',
          }),
          readContract({
            address: AIRDROP_CONTRACT_ADDRESS,
            abi: airdropAbi,
            functionName: 'getAirdropStatus',
          }),
          readContract({
            address: AIRDROP_CONTRACT_ADDRESS,
            abi: airdropAbi,
            functionName: 'getRecentClaimers',
            args: [10],
          }),
        ]);

      setIsOwner(getAddress(owner as string) === normalized);
      setIsPaused(paused as boolean);

      setStats({
        totalTokens: formatEther(distributed as bigint),
        claimedTokens: formatEther(claimed as bigint),
        remainingTokens: formatEther(remaining as bigint),
      });

      const claimers: Claimer[] = (addresses as string[]).map((addr, i) => ({
        address: addr,
        amount: formatEther(amounts[i] as bigint),
      }));
      setRecentClaimers(claimers);
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
  };

  const togglePause = async () => {
    if (!walletClient) return;

    try {
      setLoading(true);
      const { request } = await publicClient.simulateContract({
        address: AIRDROP_CONTRACT_ADDRESS,
        abi: airdropAbi,
        functionName: isPaused ? 'unpauseAirdrop' : 'pauseAirdrop',
        account: walletClient.account,
      });

      const hash = await walletClient.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash });
      setIsPaused(!isPaused);
    } catch (err) {
      console.error('Pause toggle failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const recoverTokens = async () => {
    if (!walletClient || !isPaused) return;

    try {
      setLoading(true);
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
      setLoading(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Airdrop Admin Dashboard</h1>

      <ConnectButton />

      {isConnected && (
        <>
          <p className="text-gray-600 mt-4">Connected: {address}</p>

          {isOwner ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
                <div className="bg-gray-100 p-4 rounded">
                  <h3 className="text-sm font-medium">Total Tokens</h3>
                  <p className="text-xl font-bold">{stats.totalTokens}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded">
                  <h3 className="text-sm font-medium">Claimed</h3>
                  <p className="text-xl font-bold">{stats.claimedTokens}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded">
                  <h3 className="text-sm font-medium">Remaining</h3>
                  <p className="text-xl font-bold">{stats.remainingTokens}</p>
                </div>
              </div>

              <button
                onClick={togglePause}
                className="bg-red-500 text-white px-4 py-2 rounded mb-4"
              >
                {isPaused ? 'Unpause Airdrop' : 'Pause Airdrop'}
              </button>

              <button
                onClick={recoverTokens}
                className="bg-yellow-500 text-white px-4 py-2 rounded ml-2"
                disabled={!isPaused}
              >
                Recover Unclaimed Tokens
              </button>

              <h2 className="text-2xl font-semibold mt-8 mb-2">Recent Claimers</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border">
                  <thead>
                    <tr>
                      <th className="border px-4 py-2">Address</th>
                      <th className="border px-4 py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentClaimers.map((claimer, index) => (
                      <tr key={index}>
                        <td className="border px-4 py-2">{claimer.address}</td>
                        <td className="border px-4 py-2">{claimer.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-red-600 mt-4">You are not the owner.</p>
          )}
        </>
      )}
    </div>
  );
}
