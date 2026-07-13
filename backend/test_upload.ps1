$registerResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method Post -ContentType "application/json" -Body '{"username":"testuser_avatar","email":"test_avatar@example.com","password":"password123"}' -ErrorAction SilentlyContinue

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"test_avatar@example.com","password":"password123"}'
    $token = $loginResponse.accessToken
} catch {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "Login error:" $reader.ReadToEnd()
    exit
}

$body = "------WebKitFormBoundary7MA4YWxkTrZu0gW`r`nContent-Disposition: form-data; name=`"file`"; filename=`"test.txt`"`r`nContent-Type: text/plain`r`n`r`nHello`r`n------WebKitFormBoundary7MA4YWxkTrZu0gW--`r`n"
try {
    $resp = Invoke-RestMethod -Uri "http://localhost:8080/api/users/me/avatar" -Method Post -Body $body -ContentType "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW" -Headers @{ Authorization = "Bearer $token" }
    Write-Host "Success:" $resp
} catch {
    Write-Host "Upload Error!"
    $_.Exception.Response | fl *
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $reader.ReadToEnd()
}
