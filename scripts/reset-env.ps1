# Kill processes on development ports
Write-Host "Killing processes on development ports..."

# Function to kill process on a port
function Kill-ProcessOnPort {
    param (
        [int]$Port
    )
    $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | 
                Where-Object OwningProcess -ne 0 |
                Select-Object -ExpandProperty OwningProcess -Unique
    
    foreach ($process in $processes) {
        try {
            $processName = (Get-Process -Id $process).ProcessName
            Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
            Write-Host "Killed process '$processName' on port $Port"
        } catch {
            Write-Host "Could not kill process on port $Port"
        }
    }
}

# Kill processes on development ports
Write-Host "Cleaning up existing processes..."
Kill-ProcessOnPort 3000  # Web server
Kill-ProcessOnPort 3001  # API server
Kill-ProcessOnPort 3004  # WebSocket server

# Change to project root directory
Set-Location $PSScriptRoot/..

# Build infrastructure package
Write-Host "Building infrastructure package..."
try {
    pnpm build:infrastructure
    if ($LASTEXITCODE -ne 0) {
        throw "Infrastructure build failed"
    }
} catch {
    Write-Host "Error building infrastructure: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Starting development servers..."

# Start API server in a new window
Write-Host "Starting API server..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd packages/api; pnpm run dev" -WindowStyle Normal

# Wait for API to initialize
Write-Host "Waiting for API to initialize..."
Start-Sleep -Seconds 3

# Start web server in a new window
Write-Host "Starting web server..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd packages/web; pnpm run dev" -WindowStyle Normal

Write-Host "Development environment reset complete!" -ForegroundColor Green
Write-Host "API server running on http://localhost:3001"
Write-Host "Web server running on http://localhost:3000"
Write-Host "WebSocket server running on ws://localhost:3004"