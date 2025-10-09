# 🪂 Airdrop Frontend

This is the frontend interface for interacting with an ERC20 airdrop smart contract. It allows users to verify eligibility using a Merkle proof and claim their allocated tokens directly from the browser.

**Live Demo**: [airdrop-frontend.vercel.app](https://airdrop-frontend-rlks5f1ir-williams-projects-f220df19.vercel.app/)

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
│   │   ├── api/merkle/        # Serves Merkle proofs (via output.json)
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

# Run the setup script:

chmod +x setup.sh
./setup.sh
```

This script will:

1. Install the dependencies: `npm install`.
2. Copy the Merkle tree output from `../airdop-project/script/target/output.json` to `src/merkle/output.json`.
3. Copy the ABI from `../airdop-project/abi/AirdropAbi.json` to `src/abi/airdrop.json`.
4. Create the `.env` file from `.env.test` if it does not already exist.

After running the script, replace the placeholders in `.env` with the actual values.

## Run the development server:

npm run dev
