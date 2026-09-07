$ErrorActionPreference = 'Continue'
try {
  $r = Invoke-RestMethod -Uri 'https://api.openverse.org/v1/images/?q=leather%20belt&page_size=5' -TimeoutSec 40 -Headers @{ 'User-Agent' = 'Mozilla/5.0' }
  Write-Host "COUNT: $($r.result_count)"
  $r.results | ForEach-Object { Write-Host $_.url }
} catch { Write-Host "API ERR: $($_.Exception.Message)" }
try {
  Invoke-WebRequest -Uri 'https://images.pexels.com/photos/1035682/pexels-photo-1035682.jpeg?auto=compress&cs=tinysrgb&w=800' -OutFile 'd:\A_Footages\alpha-shop\_t.jpg' -TimeoutSec 40 -Headers @{ 'User-Agent' = 'Mozilla/5.0' }
  $b = [System.IO.File]::ReadAllBytes('d:\A_Footages\alpha-shop\_t.jpg')[0..1]
  Write-Host "DL BYTES: $($b[0]) $($b[1])"
} catch { Write-Host "DL ERR: $($_.Exception.Message)" }
