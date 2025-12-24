#!/bin/bash
set -e

echo "=== EAS Pre-Install Hook ==="
echo "Copying shared package..."

# Create the shared package directory in node_modules
mkdir -p node_modules/@mentalspace/shared

# Copy the shared package from the monorepo
if [ -d "../../packages/shared" ]; then
  cp -r ../../packages/shared/* node_modules/@mentalspace/shared/
  echo "Shared package copied from ../../packages/shared"
elif [ -d "../../../packages/shared" ]; then
  cp -r ../../../packages/shared/* node_modules/@mentalspace/shared/
  echo "Shared package copied from ../../../packages/shared"
else
  echo "ERROR: Could not find shared package"
  exit 1
fi

echo "Shared package setup complete!"
