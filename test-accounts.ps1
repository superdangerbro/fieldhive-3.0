# Base URL
$API_URL = "http://localhost:3001"

Write-Host "Testing Accounts API..."

# Test GET /accounts
Write-Host "`nTesting GET /accounts"
$accounts = Invoke-RestMethod -Uri "$API_URL/accounts" -Method Get
$accounts | ConvertTo-Json -Depth 10

# Test GET /settings/accounts/types
Write-Host "`nTesting GET /settings/accounts/types"
$types = Invoke-RestMethod -Uri "$API_URL/settings/accounts/types" -Method Get
$types | ConvertTo-Json -Depth 10

# Test GET /settings/accounts/statuses
Write-Host "`nTesting GET /settings/accounts/statuses"
$statuses = Invoke-RestMethod -Uri "$API_URL/settings/accounts/statuses" -Method Get
$statuses | ConvertTo-Json -Depth 10

# Create a test account
Write-Host "`nTesting POST /accounts"
$accountData = @{
    name = "Test Account"
    type = "client"
    status = "active"
    contact_name = "John Doe"
    contact_email = "john@example.com"
    contact_phone = "123-456-7890"
    billingAddress = @{
        address1 = "123 Test St"
        city = "Test City"
        province = "Test Province"
        postal_code = "12345"
        country = "Canada"
    }
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "$API_URL/accounts" -Method Post -Body $accountData -ContentType "application/json"
$accountId = $response.account_id
$response | ConvertTo-Json -Depth 10

# Test GET /accounts/:id
Write-Host "`nTesting GET /accounts/$accountId"
$account = Invoke-RestMethod -Uri "$API_URL/accounts/$accountId" -Method Get
$account | ConvertTo-Json -Depth 10

# Test PUT /accounts/:id
Write-Host "`nTesting PUT /accounts/$accountId"
$updateData = @{
    name = "Updated Test Account"
    contact_name = "Jane Doe"
    billingAddress = @{
        address1 = "456 Update St"
        city = "Update City"
        province = "Update Province"
        postal_code = "54321"
        country = "Canada"
    }
} | ConvertTo-Json

$updatedAccount = Invoke-RestMethod -Uri "$API_URL/accounts/$accountId" -Method Put -Body $updateData -ContentType "application/json"
$updatedAccount | ConvertTo-Json -Depth 10

# Verify the update
Write-Host "`nVerifying update..."
$verifyUpdate = Invoke-RestMethod -Uri "$API_URL/accounts/$accountId" -Method Get
$verifyUpdate | ConvertTo-Json -Depth 10

# Test DELETE /accounts/:id
Write-Host "`nTesting DELETE /accounts/$accountId"
$deleteResponse = Invoke-RestMethod -Uri "$API_URL/accounts/$accountId" -Method Delete
$deleteResponse | ConvertTo-Json -Depth 10

# Verify deletion
Write-Host "`nVerifying deletion..."
try {
    $verifyDelete = Invoke-RestMethod -Uri "$API_URL/accounts/$accountId" -Method Get
    $verifyDelete | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Account successfully deleted (404 Not Found)"
}
