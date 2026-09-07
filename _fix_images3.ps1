$ErrorActionPreference = 'Stop'
$dir = 'd:\A_Footages\alpha-shop\Front\public\images\products'
$ua = @{ 'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ModShopQA/1.0' }

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
       '&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url%7Csize&iiurlwidth=900&format=json'
  foreach ($attempt in 1..3) {
    try {
      $r = Invoke-RestMethod -Uri $u -TimeoutSec 40 -Headers $ua
      $urls = @()
      foreach ($p in $r.query.pages.PSObject.Properties.Value) {
        $ii = $p.imageinfo[0]
        if ($ii.width -ge 500 -and $p.title -match '\.jpe?g$') { $urls += $ii.thumburl }
      }
      return $urls
    } catch {
      if ($_.Exception.Message -match '429') { Start-Sleep -Seconds (10 * $attempt) } else { return @() }
    }
  }
  return @()
}

# flickr-first; tag chosen for modern product/outfit photos
$jobs = @(
  @{ f='oversize-linen-coat.jpg';      k='linencoat';          c='linen coat clothing' },
  @{ f='oversize-linen-coat-2.jpg';    k='trenchcoat,woman';   c='trench coat woman fashion' },
  @{ f='silk-crepe-blouse.jpg';        k='blouse,fashion';     c='blouse clothing fashion' },
  @{ f='silk-crepe-blouse-2.jpg';      k='whiteblouse';        c='white blouse clothing' },
  @{ f='long-crepe-manteau-2.jpg';     k='coat,fashion,woman'; c='long coat woman fashion' },
  @{ f='pleated-midi-skirt-2.jpg';     k='pleatedskirt';       c='pleated skirt fashion' },
  @{ f='warm-knit-coat.jpg';           k='woolcoat,woman';     c='wool coat woman' },
  @{ f='straight-fabric-pants-w.jpg';  k='trousers,woman';     c='trousers woman fashion' },
  @{ f='straight-fabric-pants-w-2.jpg';k='pants,fashion,woman';c='pants woman clothing' },
  @{ f='crop-knit-cardigan-2.jpg';     k='croppedcardigan';    c='cropped cardigan clothing' },
  @{ f='minimal-steel-necklace.jpg';   k='silvernecklace';     c='silver necklace jewelry' },
  @{ f='minimal-steel-necklace-2.jpg'; k='necklace,chain';     c='silver chain necklace' },
  @{ f='cat-eye-sunglasses-2.jpg';     k='cateyesunglasses';   c='cat eye sunglasses' },
  @{ f='wrap-midi-dress-2.jpg';        k='wrapdress';          c='wrap dress fashion' },
  @{ f='wide-leg-pants-w.jpg';         k='widelegpants';       c='wide leg trousers woman' },
  @{ f='wide-leg-pants-w-2.jpg';       k='palazzopants';       c='palazzo pants woman' },
  @{ f='satin-slip-skirt.jpg';         k='satinskirt';         c='satin skirt clothing' },
  @{ f='office-laptop-bag-2.jpg';      k='laptopbag';          c='laptop bag briefcase' },
  @{ f='simple-cotton-top-2.jpg';      k='cotton,top,woman';   c='cotton top woman clothing' },
  @{ f='kids-denim-overall.jpg';       k='denimoveralls,kids'; c='children overalls denim' },
  @{ f='kids-denim-overall-2.jpg';     k='overalls,children';  c='kids dungarees' },
  @{ f='kids-summer-hat.jpg';          k='sunhat,child';       c='children sun hat' },
  @{ f='kids-summer-hat-2.jpg';        k='sunhat,kids';        c='kid straw hat' }
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
$report | Set-Content 'd:\A_Footages\alpha-shop\_fix_report2.txt'
