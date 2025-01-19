#!/bin/bash

# Create .husky directory if it doesn't exist
mkdir -p .husky

# Create pre-commit hook
cat > .husky/pre-commit << 'EOF'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm run type-check
cd packages/ai-voice-sdk && npm run test
EOF

# Make it executable
chmod +x .husky/pre-commit 