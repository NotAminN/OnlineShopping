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

function Find-Commons($query) {
  $u = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' +
       [uri]::EscapeDataString("filetype:bitmap $query") +
       '&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url%7Csize&iiurlwidth=900&format=json'
  foreach ($attempt in 1..4) {
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

function Find-Flickr($tag) {
  try {
    $f = Invoke-RestMethod -Uri "https://www.flickr.com/services/feeds/photos_public.gne?tags=$tag&tagmode=all&format=json&nojsoncallback=1" -TimeoutSec 40 -Headers $ua
    return @($f.items | ForEach-Object { $_.media.m -replace '_m\.jpg', '_b.jpg' })
  } catch { return @() }
}

# slug/file -> @{ commons = query; flickr = tag }
$jobs = @(
  @{ f='oversize-linen-coat.jpg';      c='linen coat woman fashion';      k='linencoat' },
  @{ f='oversize-linen-coat-2.jpg';    c='beige trench coat woman';       k='trenchcoat' },
  @{ f='silk-crepe-blouse.jpg';        c='silk blouse fashion';           k='blouse' },
  @{ f='silk-crepe-blouse-2.jpg';      c='white blouse woman';            k='whiteblouse' },
  @{ f='long-crepe-manteau.jpg';       c='long overcoat woman';           k='overcoat' },
  @{ f='long-crepe-manteau-2.jpg';     c='modest long coat fashion';      k='longcoat' },
  @{ f='pleated-midi-skirt.jpg';       c='pleated skirt';                 k='pleatedskirt' },
  @{ f='pleated-midi-skirt-2.jpg';     c='pleated midi skirt fashion';    k='pleatedskirt,fashion' },
  @{ f='warm-knit-coat.jpg';           c='knitted wool coat';             k='knitcoat' },
  @{ f='warm-knit-coat-2.jpg';         c='cardigan sweater knit';         k='cardigan' },
  @{ f='straight-fabric-pants-w.jpg';  c='straight trousers woman';       k='trousers,women' },
  @{ f='straight-fabric-pants-w-2.jpg';c='beige pants woman fashion';     k='trousers,fashion' },
  @{ f='crop-knit-cardigan.jpg';       c='cropped cardigan';              k='cardigan,sweater' },
  @{ f='crop-knit-cardigan-2.jpg';     c='knit cardigan clothing';        k='cardigan,knitwear' },
  @{ f='classic-leather-belt.jpg';     c='leather belt';                  k='leatherbelt' },
  @{ f='classic-leather-belt-2.jpg';   c='belt buckle leather accessory'; k='belt,leather' },
  @{ f='minimal-steel-necklace.jpg';   c='silver necklace jewelry';       k='silvernecklace' },
  @{ f='minimal-steel-necklace-2.jpg'; c='chain necklace pendant';        k='necklace' },
  @{ f='cat-eye-sunglasses.jpg';       c='cat eye sunglasses';            k='sunglasses' },
  @{ f='cat-eye-sunglasses-2.jpg';     c='sunglasses fashion accessory';  k='sunglasses,fashion' },
  @{ f='wrap-midi-dress.jpg';          c='wrap dress';                    k='wrapdress' },
  @{ f='wrap-midi-dress-2.jpg';        c='midi dress woman fashion';      k='dress,fashion' },
  @{ f='wide-leg-pants-w.jpg';         c='wide leg trousers';             k='widelegtrousers' },
  @{ f='wide-leg-pants-w-2.jpg';       c='palazzo pants woman';           k='palazzopants' },
  @{ f='satin-slip-skirt.jpg';         c='satin skirt';                   k='satinskirt' },
  @{ f='satin-slip-skirt-2.jpg';       c='slip skirt fashion';            k='silkskirt' },
  @{ f='patterned-cotton-scarf.jpg';   c='patterned scarf';               k='scarf,pattern' },
  @{ f='patterned-cotton-scarf-2.jpg'; c='printed cotton scarf';          k='scarf' },
  @{ f='kids-comfort-shorts-2.jpg';    c='children shorts clothing';      k='kidsshorts' },
  @{ f='office-laptop-bag-2.jpg';      c='laptop bag';                    k='laptopbag' },
  @{ f='simple-cotton-top-2.jpg';      c='cotton top woman clothing';     k='cottonshirt,woman' }
)

$report = @()
foreach ($j in $jobs) {
  $out = Join-Path $dir $j.f
  $ok = $false
  $urls = @(Find-Commons $j.c) + @(Find-Flickr $j.k)
  foreach ($u in $urls) {
    if (Get-Jpeg $u $out) { $ok = $true; break }
  }
  $line = "$($j.f) : $(if ($ok) {'OK'} else {'FAIL'})"
  $report += $line
  Write-Host $line
  Start-Sleep -Milliseconds 1500
}
$report | Set-Content 'd:\A_Footages\alpha-shop\_fix_report.txt'
