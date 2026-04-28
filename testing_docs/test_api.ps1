$body = @{
    name = "Test Cashier"
    email = "cashier@test.com"
    password = "password123"
    role = "cashier"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "=== REGISTER SUCCESS ===" 
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Token: $($data.token)"
    Write-Host "User Email: $($data.user.email)"
    if ($data.token) {
        $ENV:TOKEN = $data.token
        Write-Host "Token stored in ENV:TOKEN"
    }
} catch {
    Write-Host "=== REGISTER FAILED ==="
    Write-Host "Error: $($_.Exception.Message)"
}
