#!/bin/bash

set -e 
# Define paths
MERKLE_OUTPUT_PATH="../airdop-project/script/target/output.json"
ABI_SOURCE_PATH="../airdop-project/abi/airdropAbi.json"
ABI_DEST_PATH="./src/abi/airdrop.json"
ENV_FILE="./.env"
ENV_TEMPLATE="./.env.test"

# Step 1: Install dependencies
echo "Installing dependencies..."
npm install

# Step 2: Copy Merkle tree output
echo "Copying Merkle tree output to src/merkle/output.json..."
cp "$MERKLE_OUTPUT_PATH" "./src/merkle/output.json"

# Step 3: Copy ABI
echo "Copying ABI to src/abi/airdrop.json..."
cp "$ABI_SOURCE_PATH" "$ABI_DEST_PATH"

# Step 4: Set up environment variables
if [ ! -f "$ENV_FILE" ]; then
  echo "Creating .env file from .env.test..."
  cp "$ENV_TEMPLATE" "$ENV_FILE"
else
  echo ".env file already exists. Skipping creation."
fi

echo "Setup complete. Please replace placeholders in .env with actual values."
