// components/nav-bar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase() || '';


export function NavBar() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const pathname = usePathname();
  const router = useRouter();

  // Redirect logic if not on home page
  useEffect(() => {
    if (pathname !== '/' && isConnected && address) {
      if (address.toLowerCase() === ADMIN_ADDRESS && !pathname.startsWith('/admin')) {
        router.push('/admin');
      } else if (address.toLowerCase() !== ADMIN_ADDRESS && !pathname.startsWith('/claim')) {
        router.push('/claim');
      }
    }
  }, [address, isConnected, pathname, router]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src="/ratherLogo.jpg" 
              alt="Rather Airdrop" 
              width={40} 
              height={40} 
              className="mr-2" 
            />
            <span className="font-bold text-lg hidden sm:inline-block">
              Rather Airdrop
            </span>
          </Link>
          
          {isConnected && address && (
            <div className="ml-10 flex items-center space-x-4">
              {address.toLowerCase() === ADMIN_ADDRESS ? (
                <>
                  <NavLink href="/admin" currentPath={pathname} label="Dashboard" />
                </>
              ) : (
                <>
                  <NavLink href="/claim" currentPath={pathname} label="Claim Airdrop" />
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ConnectButton 
            showBalance={false}
            accountStatus="address"
            chainStatus="none"
          />
          {isConnected && (
            <button 
              onClick={() => disconnect()}
              className="text-sm text-muted-foreground hover:text-primary px-2 py-1 rounded"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  currentPath,
  label,
}: {
  href: string;
  currentPath: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors px-2 py-1 rounded ${
        currentPath.startsWith(href)
          ? 'bg-primary text-primary-foreground'
          : 'hover:text-primary text-muted-foreground'
      }`}
    >
      {label}
    </Link>
  );
}