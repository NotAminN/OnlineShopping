$ErrorActionPreference = 'Stop'
$dir = 'd:\A_Footages\alpha-shop\Front\public\images\products'
$ua = @{ 'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ModShopQA/1.0' }
$blacklist = 'painting|drawing|engraving|LCCN|poster|illustration|statue|sculpture|automobile|clergy|bishop|priest|horse|carnival|map|church|cosplay'

function Get-Jpeg($url, $out) {
  try { Invoke-WebRequest -Uri $url -OutFile $out -TimeoutSec 60 -Headers $ua } catch { return $false }
  $fs = [System.IO.File]::OpenRead($out); $b = New-Object byte[] 2; $fs.Read($b,0,2) | Out-Null; $fs.Close()
  if ($b[0] -eq 0xFF -and $b[1] -eq 0xD8) { return $true }
  $tmp = "$out.conv.jpg"
  ffmpeg -y -loglevel error -i $out $tmp 2>$null
  if ((Test-Path $tmp) -and ((Get-Item $tmp).Length -gt 5000)) { Move-Item $tmp $out -Force; return $true }
  Remove-Item $tmp, $out -Force -ErrorAction SilentlyContinue
  return $false
}

function Find-Commons($query) {
  $u = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' +
       [uri]::EscapeDataString("filetype:bitmap $query") +
       '&gsrnamespace=6&gsrlimit=14&prop=imageinfo&iiprop=url%7Csize&iiurlwidth=900&format=json'
  foreach ($attempt in 1..3) {
    try {
      $r = Invoke-RestMethod -Uri $u -TimeoutSec 40 -Headers $ua
      $urls = @()
      foreach ($p in $r.query.pages.PSObject.Properties.Value) {
        $ii = $p.imageinfo[0]
        if ($ii.width -ge 500 -and $ii.height -ge 500 -and $p.title -match '\.jpe?g$' -and $p.title -notmatch $blacklist) { $urls += $ii.thumburl }
      }
      return $urls
    } catch {
      if ($_.Exception.Message -match '429') { Start-Sleep -Seconds (10 * $attempt) } else { return @() }
    }
  }
  return @()
}

$jobs = @(
  @{ f='oversize-linen-coat.jpg';   q1='duster coat';        q2='beige coat woman' },
  @{ f='kids-knit-jacket-2.jpg';    q1='cardigan girl';      q2='children clothing boutique' },
  @{ f='kids-summer-hat.jpg';       q1='straw hat child';    q2='panama hat girl' }
)

$report = @()
foreach ($j in $jobs) {
  $out = Join-Path $dir $j.f
  $ok = $false
  foreach ($u in (@(Find-Commons $j.q1) + @(Find-Commons $j.q2))) {
    if (Get-Jpeg $u $out) { $ok = $true; break }
  }
  $line = "$($j.f) : $(if ($ok) {'OK'} else {'FAIL'})"
  $report += $line
  Write-Host $line
  Start-Sleep -Milliseconds 1500
}
$report | Set-Content 'd:\A_Footages\alpha-shop\_fix_report5.txt'
