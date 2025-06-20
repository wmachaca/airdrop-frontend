# 🪂 Airdrop Frontend

This is the frontend interface for interacting with an ERC20 airdrop smart contract. It allows users to verify eligibility using a Merkle proof and claim their allocated tokens directly from the browser.

---

## 🚀 Features

- 🔐 Merkle proof-based eligibility verification
- 💸 Token claim interface
- 🔗 Wallet connection (via RainbowKit + wagmi)
- 📊 Admin page for viewing contract claim status

---

## 📁 Project Structure

```bash
.
├── public/
│   └──
├── src/
│   ├── abi/                   # Contract ABI
│   ├── app/
│   │   ├── claim/             # Claim page (for eligible users)
│   │   ├── admin/             # Admin dashboard (optional)
│   │   ├── api/merkle/        # Merkle endpoint (serves `output.json`)
│   │   ├── layout.tsx         # App layout
│   │   ├── page.tsx           # Homepage
│   │   └── providers.tsx      # wagmi / RainbowKit providers
│   ├── chains/                # Network config (e.g., Anvil, Goerli, etc.)
│   └── components/            # Shared components (e.g., nav-bar)
│   └── merkle/output.json     # Merkle tree data (leaf + proof + root)


```

## Installation

```
git clone https://github.com/wmachaca/airdrop-frontend.git

cd airdrop-frontend

npm install

# Copy the Merkle tree output (typically a .json with leaf, proof, and root):

/src/merkle/output.json


# Set up your environment variables:


NEXT_PUBLIC_ADMIN_ADDRESS=

NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS=


# Run the development server:

npm run dev
```
