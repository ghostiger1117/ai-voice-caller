#!/bin/bash

# Get the new version from package.json
VERSION=$(node -p "require('./package.json').version")

# Check if tag exists
if git rev-parse "v$VERSION" >/dev/null 2>&1; then
  echo "Version v$VERSION already exists. Please update version in package.json"
  exit 1
fi

# Create and push new tag
git tag "v$VERSION"
git push origin "v$VERSION"

# Create GitHub release
gh release create "v$VERSION" \
  --title "v$VERSION" \
  --notes "Release v$VERSION" \
  --draft=false \
  --prerelease=false

# Build and publish SDK
cd packages/ai-voice-sdk
npm version $VERSION --no-git-tag-version
npm run build
npm publish --access public

echo "Released version $VERSION successfully" 