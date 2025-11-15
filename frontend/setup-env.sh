#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Interview Report - Environment Setup${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local file already exists!${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Keeping existing .env.local file${NC}"
        echo -e "${YELLOW}If you want to update your keys, edit .env.local manually${NC}"
        exit 0
    fi
fi

echo -e "${GREEN}Let's set up your API keys!${NC}"
echo ""

# Get ElevenLabs API Key
echo -e "${BLUE}📝 ElevenLabs API Key${NC}"
echo "Get it from: https://elevenlabs.io/ (Profile Settings)"
read -p "Enter your ElevenLabs API key: " ELEVEN_LABS_KEY

# Get Anthropic API Key
echo ""
echo -e "${BLUE}📝 Anthropic API Key${NC}"
echo "Get it from: https://console.anthropic.com/ (API Keys)"
read -p "Enter your Anthropic API key: " ANTHROPIC_KEY

# Validate inputs
if [ -z "$ELEVEN_LABS_KEY" ] || [ -z "$ANTHROPIC_KEY" ]; then
    echo -e "${RED}❌ Error: Both API keys are required!${NC}"
    exit 1
fi

# Create .env.local file
echo "# ElevenLabs API Key for fetching conversation transcripts" > .env.local
echo "ELEVEN_LABS_API_KEY=$ELEVEN_LABS_KEY" >> .env.local
echo "" >> .env.local
echo "# Anthropic API Key for generating interview reports with Claude" >> .env.local
echo "ANTHROPIC_API_KEY=$ANTHROPIC_KEY" >> .env.local

echo ""
echo -e "${GREEN}✅ .env.local file created successfully!${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Next steps:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. Test the API integration:"
echo -e "   ${YELLOW}node test-apis.js${NC}"
echo ""
echo "2. Start the development server:"
echo -e "   ${YELLOW}npm run dev${NC}"
echo ""
echo "3. Open your browser:"
echo -e "   ${YELLOW}http://localhost:3000${NC}"
echo ""
echo "4. Conduct an interview and click 'Finish Interview'!"
echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"

