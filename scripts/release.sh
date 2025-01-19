#!/bin/bash

# Get version from package.json
VERSION=$(node -p "require('./packages/ai-voice-sdk/package.json').version")

# Create git tag
git tag -a "v$VERSION" -m "Release v$VERSION"

# Push tag
git push origin "v$VERSION"

# Create GitHub release using gh cli
gh release create "v$VERSION" \
  --title "Release v$VERSION" \
  --notes "## Changes in this release:
  
- Feature: Added support for real-time call status updates
- Feature: Added multi-language support
- Bug fixes and improvements" 