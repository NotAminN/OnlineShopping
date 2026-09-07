$ErrorActionPreference = 'Stop'
$dir = 'd:\A_Footages\alpha-shop\Front\public\images\products'
$ua = @{ 'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ModShopQA/1.0' }
$bad = 'painting|drawing|engraving|illustration|statue|sculpture|daguerre|portrait of|1870|1880|1890|19[0-5][0-9]|animal|dog|cat\b|puppy|kitten'

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

function Find-Openverse($q) {
  $u = 'https://api.openverse.org/v1/images/?q=' + [uri]::EscapeDataString($q) + '&license_type=commercial&page_size=20&extension=jpg'
  try {
    $r = Invoke-RestMethod -Uri $u -TimeoutSec 40 -Headers $ua
    $urls = @()
    foreach ($it in $r.results) {
      $t = "$($it.title) $($it.tags.name -join ' ')"
      if ($it.width -ge 500 -and $t -notmatch $bad) { $urls += $it.url }
    }
    return $urls
  } catch { return @() }
}

function Find-Commons($query) {
  $u = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' +
       [uri]::EscapeDataString("filetype:bitmap $query") +
       '&gsrnamespace=6&gsrlimit=14&prop=imageinfo&iiprop=url%7Csize&iiurlwidth=900&format=json'
  try {
    $r = Invoke-RestMethod -Uri $u -TimeoutSec 40 -Headers $ua
    $urls = @()
    foreach ($p in $r.query.pages.PSObject.Properties.Value) {
      $ii = $p.imageinfo[0]
      if ($ii.width -ge 500 -and $ii.height -ge 500 -and $p.title -match '\.jpe?g$' -and $p.title -notmatch $bad) { $urls += $ii.thumburl }
    }
    return $urls
  } catch { return @() }
}

$jobs = @(
  @{ f='kids-knit-jacket-2.jpg';    o1='baby cardigan knit';      o2='kids jacket clothing';   c='children jacket';       sib='kids-knit-jacket.jpg' },
  @{ f='quilted-vest-men-2.jpg';    o1='puffer vest man';         o2='waistcoat man fashion';  c='mans gilet jacket';     sib='quilted-vest-men.jpg' },
  @{ f='kids-denim-overall-2.jpg';  o1='denim dungarees';         o2='overalls jeans child';   c='dungarees';             sib='kids-denim-overall.jpg' },
  @{ f='cat-eye-sunglasses-2.jpg';  o1='sunglasses retro eyewear';o2='sunglasses fashion';     c='sunglasses';            sib='cat-eye-sunglasses.jpg' }
)

$report = @()
foreach ($j in $jobs) {
  $out = Join-Path $dir $j.f
  $ok = $false
  $urls = @(Find-Openverse $j.o1) + @(Find-Openverse $j.o2) + @(Find-Commons $j.c)
  foreach ($u in $urls) {
    if (Get-Jpeg $u $out) { $ok = $true; break }
  }
  if (-not $ok -and (Test-Path (Join-Path $dir $j.sib))) {
    Copy-Item (Join-Path $dir $j.sib) $out -Force
    $ok = $true
    $line = "$($j.f) : SIBLING-FALLBACK"
  } else {
    $line = "$($j.f) : $(if ($ok) {'OK'} else {'FAIL'})"
  }
  $report += $line
  Write-Host $line
  Start-Sleep -Milliseconds 1500
}
$report | Set-Content 'd:\A_Footages\alpha-shop\_fix_report7.txt'
