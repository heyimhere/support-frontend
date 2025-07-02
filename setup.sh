#!/bin/bash

echo "Setting up Support Frontend..."

# Copy environment file
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "Created .env.local from .env.example"
  echo "Please edit .env.local with your backend API URL"
else
  echo ".env.local already exists, skipping..."
fi

# Install dependencies
echo "Installing dependencies..."
npm install

echo "Frontend setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your backend URL"
echo "2. Start the development server with: npm run dev"
echo "3. Open http://localhost:3000"
