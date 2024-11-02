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
            Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
            Write-Host "Killed process on port $Port"
        } catch {
            Write-Host "Could not kill process on port $Port"
        }
    }
}

# Kill processes on development ports
Kill-ProcessOnPort 3000  # Web server
Kill-ProcessOnPort 3001  # API server
Kill-ProcessOnPort 3004  # WebSocket server

Write-Host "Starting development servers..."

# Change to project root directory
Set-Location $PSScriptRoot/..

# Start API server in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd packages/api; pnpm run dev"

# Wait a moment for API to initialize
Start-Sleep -Seconds 3

# Start web server in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd packages/web; pnpm run dev"

Write-Host "Development environment reset complete!"
