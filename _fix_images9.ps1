$ErrorActionPreference = 'Stop'
$dir = 'd:\A_Footages\alpha-shop\Front\public\images\products'
$ua = @{ 'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ModShopQA/1.0' }
$bad = 'painting|drawing|engraving|lithograph|etching|woodcut|illustration|statue|sculpture|daguerre|portrait of|1870|1880|1890|19[0-5][0-9]|animal|dog|cat\b|puppy|kitten|farm|tractor|forest|windsurf|sail|kayak|costume|folk'

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

function Find-Openverse($q, $page) {
  $u = 'https://api.openverse.org/v1/images/?q=' + [uri]::EscapeDataString($q) + "&license_type=commercial&page_size=20&page=$page&extension=jpg"
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
  @{ f='long-crepe-manteau-2.jpg';  q='long coat street style woman'; sib=$null },
  @{ f='kids-knit-jacket-2.jpg';    q='toddler jacket winter clothes'; sib='kids-knit-jacket.jpg' },
  @{ f='quilted-vest-men-2.jpg';    q='mens puffer vest';             sib=$null },
  @{ f='kids-denim-overall-2.jpg';  q='baby overalls denim';          sib=$null },
  @{ f='kids-comfort-shorts-2.jpg'; q='kids summer clothes shorts';   sib='kids-comfort-shorts.jpg' }
)

$report = @()
foreach ($j in $jobs) {
  $out = Join-Path $dir $j.f
  $ok = $false
  $urls = @(Find-Openverse $j.q 1) + @(Find-Openverse $j.q 2) + @(Find-Commons "$($j.q) clothing")
  # skip first 2 results (previously failed picks), try the rest
  foreach ($u in ($urls | Select-Object -Skip 2)) {
    if (Get-Jpeg $u $out) { $ok = $true; break }
  }
  if (-not $ok -and $j.sib -and (Test-Path (Join-Path $dir $j.sib))) {
    Copy-Item (Join-Path $dir $j.sib) $out -Force
    $line = "$($j.f) : SIBLING-FALLBACK"
  } else {
    $line = "$($j.f) : $(if ($ok) {'OK'} else {'FAIL'})"
  }
  $report += $line
  Write-Host $line
  Start-Sleep -Milliseconds 1500
}
$report | Set-Content 'd:\A_Footages\alpha-shop\_fix_report8.txt'
