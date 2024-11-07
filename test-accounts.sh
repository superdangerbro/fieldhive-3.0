#!/bin/bash

# Base URL
API_URL="http://localhost:3001"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Testing Accounts API..."

# Test GET /accounts
echo -e "\n${GREEN}Testing GET /accounts${NC}"
curl -s -X GET "$API_URL/accounts" | jq '.'

# Test GET /settings/accounts/types
echo -e "\n${GREEN}Testing GET /settings/accounts/types${NC}"
curl -s -X GET "$API_URL/settings/accounts/types" | jq '.'

# Test GET /settings/accounts/statuses
echo -e "\n${GREEN}Testing GET /settings/accounts/statuses${NC}"
curl -s -X GET "$API_URL/settings/accounts/statuses" | jq '.'

# Create a test account
echo -e "\n${GREEN}Testing POST /accounts${NC}"
ACCOUNT_DATA='{
    "name": "Test Account",
    "type": "client",
    "status": "active",
    "contact_name": "John Doe",
    "contact_email": "john@example.com",
    "contact_phone": "123-456-7890",
    "billingAddress": {
        "address1": "123 Test St",
        "city": "Test City",
        "province": "Test Province",
        "postal_code": "12345",
        "country": "Canada"
    }
}'
RESPONSE=$(curl -s -X POST "$API_URL/accounts" \
    -H "Content-Type: application/json" \
    -d "$ACCOUNT_DATA")
echo $RESPONSE | jq '.'

# Get the account ID from the response
ACCOUNT_ID=$(echo $RESPONSE | jq -r '.account_id')

# Test GET /accounts/:id
echo -e "\n${GREEN}Testing GET /accounts/$ACCOUNT_ID${NC}"
curl -s -X GET "$API_URL/accounts/$ACCOUNT_ID" | jq '.'

# Test PUT /accounts/:id
echo -e "\n${GREEN}Testing PUT /accounts/$ACCOUNT_ID${NC}"
UPDATE_DATA='{
    "name": "Updated Test Account",
    "contact_name": "Jane Doe",
    "billingAddress": {
        "address1": "456 Update St",
        "city": "Update City",
        "province": "Update Province",
        "postal_code": "54321",
        "country": "Canada"
    }
}'
curl -s -X PUT "$API_URL/accounts/$ACCOUNT_ID" \
    -H "Content-Type: application/json" \
    -d "$UPDATE_DATA" | jq '.'

# Verify the update
echo -e "\n${GREEN}Verifying update...${NC}"
curl -s -X GET "$API_URL/accounts/$ACCOUNT_ID" | jq '.'

# Test DELETE /accounts/:id
echo -e "\n${GREEN}Testing DELETE /accounts/$ACCOUNT_ID${NC}"
curl -s -X DELETE "$API_URL/accounts/$ACCOUNT_ID" | jq '.'

# Verify deletion
echo -e "\n${GREEN}Verifying deletion...${NC}"
curl -s -X GET "$API_URL/accounts/$ACCOUNT_ID" | jq '.'
