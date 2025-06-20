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

const AIRDROP_CONTRACT_ADDRESS = getAddress(process.env.NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS || '') as `0x${string}`;

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
      const res = await fetch('/api/merkle');
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
      const claimed = await publicClient.readContract({ //add parameters 
        address: AIRDROP_CONTRACT_ADDRESS,
        abi: airdropAbi,
        functionName: 's_hasClaimed',
        args: [normalized],
      })as [bigint, bigint];

      setAlreadyClaimed(formatEther(claimed[1] ?? 0n));
    } catch (err) {
      console.error('Error verifying eligibility:', err);
      setMerkleEntry(null);
    }
  };

  const handleClaim = async () => {
    if (!claimAmount || !address || !walletClient || !merkleEntry) {
      console.warn('Missing input:', {
        claimAmount,
        address,
        walletClientExists: !!walletClient,
        merkleEntry,
      });
      return;
    }

    try {
      setIsLoading(true);

      const normalized = getAddress(address);

      console.log('[1] Normalized address:', normalized);

      const totalAmount = BigInt(merkleEntry.inputs[1]);
      const claimAmountWei = parseEther(claimAmount);

///////////////////////////
      console.log('[2] Total allocation (from proof):', merkleEntry.inputs[1]);
      console.log('[2.1] Total allocation (parsed):', totalAmount.toString());
    console.log('[3] Claim Amount (wei):', claimAmountWei.toString());

    console.log('[4] walletClient.account:', walletClient.account?.address);
    console.log('[4.1] passed account (normalized):', normalized);
    console.log('[5] Sending claim transaction...'); 

/////////////////////////////////////7

      const txHash = await walletClient.writeContract({
        address: AIRDROP_CONTRACT_ADDRESS,
        abi: airdropAbi,
        functionName: 'claim',
        args: [normalized, totalAmount, claimAmountWei, merkleEntry.proof],
        //account: walletClient.account,
      });

      console.log('[6] Tx Hash:', txHash);

      if (!publicClient) {
        throw new Error('publicClient not ready');
      }
  
      // Wait for the transaction to be mined

      console.log('[7] Waiting for transaction receipt...');

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log('[8] Receipt:', receipt);
      if (receipt.status !== 'success') {
        console.error('[9] Transaction failed:', receipt);
        alert('Transaction failed');
        return;
      }

      alert(`Claimed ${claimAmount} tokens!`);

      // Refresh state
      verifyEligibility(address);
      setClaimAmount('');
    } catch (err: unknown) {
      console.error('[10] Claim failed:', err);
      if (err instanceof Error) {
        alert(`Claim failed: ${err.message}`);
      } else {
        alert('Claim failed: unknown error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="max-w-xl mx-auto bg-card rounded-lg border p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-6">Claim Your Airdrop</h1>

        <div className="flex justify-center mb-6">
          <ConnectButton 
            showBalance={false}
            accountStatus="address"
            chainStatus="none"
          />
        </div>

        {isConnected && (
          <div className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Connected wallet: <span className="font-mono">{address}</span>
              </p>
            </div>

            {merkleEntry ? (
              <>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Allocation:</span>
                    <span className="font-medium">
                    {formatEther(BigInt(merkleEntry.inputs[1]))} RT tokens
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Already Claimed:</span>
                    <span className="font-medium">{alreadyClaimed} tokens</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="claimAmount" className="text-sm font-medium">
                    Amount to claim
                  </label>
                  <input
                    id="claimAmount"
                    type="number"
                    placeholder="Enter amount to claim"
                    className="w-full px-4 py-2 border border-input rounded-md bg-background"
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(e.target.value)}
                  />
  <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">RT</span>                  
                </div>

                <button
                  onClick={handleClaim}
                  disabled={isLoading || !claimAmount}
                  className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                    isLoading
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  {isLoading ? 'Processing...' : 'Claim Tokens'}
                </button>
              </>
            ) : (
              <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/30">
                <p className="text-destructive text-center">
                  Your address is not eligible for this airdrop
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
