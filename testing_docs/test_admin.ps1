$body = @{
    name = "Admin User"
    email = "admin@test.com"
    password = "adminpass123"
    phone = "9999999999"
} | ConvertTo-Json

try {
    Write-Host "=== Testing SEED ADMIN ===" 
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/seed-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)"
    $data = $response.Content | ConvertFrom-Json
    Write-Host "Message: $($data.message)"
    Write-Host ""
    Write-Host "Now verify with OTP (shown in server logs). Email: admin@test.com"
} catch {
    Write-Host "Error: $($_.Exception.Response.StatusCode.Value)"
    Write-Host "Message: $($_.Exception.Message)"
}
