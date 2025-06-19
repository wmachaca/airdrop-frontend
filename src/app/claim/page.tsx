'use client';

import { useEffect, useState } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import airdropAbi from '../../abi/airdrop.json'; //add my abi from my contract-project
import {
  getAddress,
  parseEther,
  formatEther,
} from 'viem';
import { readContract, writeContract } from '@wagmi/core'; // read carefully

const AIRDROP_CONTRACT_ADDRESS = '0xYourAirdropContractAddress'; // Update

type MerkleEntry = {
  inputs: [string, string]; // [address, amount]
  proof: string[];
  root: string;
  leaf: string;
};

export default function ClaimPage() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [merkleEntry, setMerkleEntry] = useState<MerkleEntry | null>(null);
  const [alreadyClaimed, setAlreadyClaimed] = useState<string>('0');
  const [claimAmount, setClaimAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      verifyEligibility(address);
    }
  }, [address, isConnected]);

  const verifyEligibility = async (userAddress: string) => {
    try {
      const res = await fetch('/merkle/output.json');
      const json: MerkleEntry[] = await res.json();
      const normalized = getAddress(userAddress);

      const entry = json.find(
        (e) => getAddress(e.inputs[0]) === normalized
      );

      if (!entry) {
        setMerkleEntry(null);
        return;
      }
  if (!publicClient) {
    console.error('publicClient not ready');
    return;
  }

      setMerkleEntry(entry);

      // Get claimed amount from contract
      const claimed: any = await readContract({ //add parameters 
        address: AIRDROP_CONTRACT_ADDRESS,
        abi: airdropAbi,
        functionName: 's_hasClaimed',
        args: [normalized],
      });

      setAlreadyClaimed(formatEther(claimed.claimedAmount));
    } catch (err) {
      console.error('Error verifying eligibility:', err);
      setMerkleEntry(null);
    }
  };

  const handleClaim = async () => {
    if (!claimAmount || !address || !walletClient || !merkleEntry) return;

    try {
      setIsLoading(true);

      const normalized = getAddress(address);
      const totalAmount = parseEther(merkleEntry.inputs[1]);
      const claimAmountWei = parseEther(claimAmount);

      const { hash } = await writeContract({
        address: AIRDROP_CONTRACT_ADDRESS,
        abi: airdropAbi,
        functionName: 'claim',
        args: [normalized, totalAmount, claimAmountWei, merkleEntry.proof],
        account: walletClient.account,
      });

      await publicClient.waitForTransactionReceipt({ hash });

      alert(`Claimed ${claimAmount} tokens!`);

      // Refresh state
      verifyEligibility(address);
      setClaimAmount('');
    } catch (err: any) {
      console.error('Claim failed:', err);
      alert(`Claim failed: ${err.message || 'unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Claim Your Airdrop</h1>

      <ConnectButton />

      {isConnected && (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-gray-600">Connected: {address}</p>

          {merkleEntry ? (
            <>
              <div className="bg-gray-100 p-4 rounded">
                <p>
                  <strong>Total Allocation:</strong>{' '}
                  {formatEther(merkleEntry.inputs[1])} tokens
                </p>
                <p>
                  <strong>Already Claimed:</strong> {alreadyClaimed} tokens
                </p>
              </div>

              <input
                type="number"
                placeholder="Enter amount to claim"
                className="w-full px-4 py-2 border border-gray-300 rounded"
                value={claimAmount}
                onChange={(e) => setClaimAmount(e.target.value)}
              />

              <button
                onClick={handleClaim}
                disabled={isLoading || !claimAmount}
                className={`w-full px-4 py-2 rounded text-white ${
                  isLoading ? 'bg-gray-500' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isLoading ? 'Claiming...' : 'Claim Tokens'}
              </button>
            </>
          ) : (
            <p className="text-red-500 mt-4">
              🚫 Your address is not eligible for the airdrop.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
