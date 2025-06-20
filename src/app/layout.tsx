import './globals.css'
import { Providers } from './providers'
import { NavBar } from '@/components/nav-bar'

export const metadata = {
  title: 'Rather Airdrop',
  description: 'Admin dashboard for Rather airdrop',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
      <Providers>
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
