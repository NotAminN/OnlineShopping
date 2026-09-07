$ErrorActionPreference = 'Stop'
$dir = 'd:\A_Footages\alpha-shop\Front\public\images\products'
$ua = @{ 'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ModShopQA/1.0' }
$blacklist = 'painting|portrait|drawing|engraving|LCCN|poster|illustration|statue|sculpture|1870|1880|1890|19[0-6][0-9]|album'

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

function Find-Flickr($tag) {
  try {
    $f = Invoke-RestMethod -Uri "https://www.flickr.com/services/feeds/photos_public.gne?tags=$tag&tagmode=all&format=json&nojsoncallback=1" -TimeoutSec 40 -Headers $ua
    return @($f.items | ForEach-Object { $_.media.m -replace '_m\.jpg', '_b.jpg' })
  } catch { return @() }
}

function Find-Commons($query) {
  $u = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' +
       [uri]::EscapeDataString("filetype:bitmap $query") +
       '&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url%7Csize&iiurlwidth=900&format=json'
  foreach ($attempt in 1..3) {
    try {
      $r = Invoke-RestMethod -Uri $u -TimeoutSec 40 -Headers $ua
      $urls = @()
      foreach ($p in $r.query.pages.PSObject.Properties.Value) {
        $ii = $p.imageinfo[0]
        if ($ii.width -ge 500 -and $p.title -match '\.jpe?g$' -and $p.title -notmatch $blacklist) { $urls += $ii.thumburl }
      }
      return $urls
    } catch {
      if ($_.Exception.Message -match '429') { Start-Sleep -Seconds (10 * $attempt) } else { return @() }
    }
  }
  return @()
}

$jobs = @(
  @{ f='oversize-linen-coat.jpg';       k='coat,woman,style';    c='coat fashion woman clothing' },
  @{ f='long-crepe-manteau-2.jpg';      k='coat,fashion';        c='long coat clothing fashion' },
  @{ f='straight-fabric-pants-w.jpg';   k='trousers,fashion';    c='women trousers fashion clothing' },
  @{ f='simple-cotton-top-2.jpg';       k='tshirt,woman,casual'; c='woman t-shirt casual clothing' },
  @{ f='crop-knit-cardigan-2.jpg';      k='knitwear,sweater';    c='cardigan clothing knitwear' },
  @{ f='kids-knit-jacket-2.jpg';        k='kidsweater';          c='children sweater clothing' },
  @{ f='satin-slip-skirt-2.jpg';        k='midiskirt';           c='satin skirt fashion clothing' },
  @{ f='quilted-vest-men-2.jpg';        k='bodywarmer';          c='quilted vest clothing' },
  @{ f='kids-denim-overall-2.jpg';      k='dungarees';           c='children overalls denim clothing' },
  @{ f='kids-summer-hat.jpg';           k='sunhat,girl';         c='child sun hat summer' }
)

$report = @()
foreach ($j in $jobs) {
  $out = Join-Path $dir $j.f
  $ok = $false
  $urls = @(Find-Flickr $j.k) + @(Find-Commons $j.c)
  foreach ($u in $urls) {
    if (Get-Jpeg $u $out) { $ok = $true; break }
  }
  $line = "$($j.f) : $(if ($ok) {'OK'} else {'FAIL'})"
  $report += $line
  Write-Host $line
  Start-Sleep -Milliseconds 1200
}
$report | Set-Content 'd:\A_Footages\alpha-shop\_fix_report3.txt'
