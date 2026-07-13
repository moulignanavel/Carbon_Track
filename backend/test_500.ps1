try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"swathi29rd@gmail.com","password":"password123"}'
    $token = $loginResponse.token
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $body = @{
        mealType = "Meat Meal"
        quantity = 1
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/activity-logs/food" -Method Post -Headers $headers -Body $body
    Write-Output $response
} catch {
    Write-Output "Error:"
    Write-Output $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.ReadToEnd()
    }
}
