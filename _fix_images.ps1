$ErrorActionPreference = 'Stop'
$dir = "d:\A_Footages\alpha-shop\Front\public\images\products"

function Get-Jpeg($url, $out) {
  try { Invoke-WebRequest -Uri $url -OutFile $out -TimeoutSec 40 -Headers @{ 'User-Agent' = 'Mozilla/5.0' } } catch { return $false }
  $fs = [System.IO.File]::OpenRead($out); $b = New-Object byte[] 2; $fs.Read($b,0,2) | Out-Null; $fs.Close()
  if ($b[0] -eq 0xFF -and $b[1] -eq 0xD8) { return $true }
  $tmp = "$out.conv.jpg"
  ffmpeg -y -loglevel error -i $out $tmp 2>$null
  if (Test-Path $tmp) { Move-Item $tmp $out -Force; return $true }
  Remove-Item $out -Force -ErrorAction SilentlyContinue
  return $false
}

function Search-Openverse($query, $index) {
  $u = "https://api.openverse.org/v1/images/?q=$([uri]::EscapeDataString($query))&license_type=all&pageSize=20&page_size=20"
  try {
    $r = Invoke-RestMethod -Uri $u -TimeoutSec 40 -Headers @{ 'User-Agent' = 'Mozilla/5.0' }
    foreach ($res in $r.results) {
      if ($index -gt 0) { $index--; continue }
      if ($res.url -match '\.(jpe?g)($|\?)' -or $res.url -match 'pexels|flickr|wikimedia') { return $res.url }
      $index--
    }
  } catch { }
  return $null
}

# slug -> array of 2 search queries (image 1, image 2)
$map = [ordered]@{
  'oversize-linen-coat'      = @('woman long linen coat fashion', 'beige linen trench coat woman')
  'silk-crepe-blouse'        = @('silk blouse woman fashion', 'cream blouse on hanger')
  'long-crepe-manteau'       = @('modest long coat woman fashion', 'long overcoat woman street style')
  'pleated-midi-skirt'       = @('pleated midi skirt fashion', 'pleated skirt woman')
  'warm-knit-coat'           = @('knitted wool coat woman', 'long knit cardigan coat')
  'straight-fabric-pants-w'  = @('straight leg trousers woman fashion', 'beige trousers woman outfit')
  'crop-knit-cardigan'       = @('cropped knit cardigan', 'cardigan sweater folded')
  'classic-leather-belt'     = @('brown leather belt product', 'leather belt buckle')
  'minimal-steel-necklace'   = @('silver chain necklace jewelry', 'minimalist necklace pendant')
  'cat-eye-sunglasses'       = @('cat eye sunglasses', 'cat-eye sunglasses fashion')
  'wrap-midi-dress'          = @('wrap midi dress woman', 'wrap dress fashion model')
  'wide-leg-pants-w'         = @('wide leg pants woman fashion', 'wide leg trousers outfit')
  'satin-slip-skirt'         = @('satin slip skirt', 'satin midi skirt fashion')
  'patterned-cotton-scarf'   = @('patterned scarf fabric', 'cotton scarf pattern')
  'kids-comfort-shorts-2'    = @('kids shorts clothing', 'children shorts beige')
  'office-laptop-bag-2'      = @('laptop bag office', 'briefcase laptop bag')
  'simple-cotton-top-2'      = @('white cotton top woman', 'casual cotton shirt woman')
}

$report = @()
foreach ($slug in $map.Keys) {
  for ($i = 0; $i -lt 2; $i++) {
    $fname = if ($i -eq 0) { "$slug.jpg" } else { "$slug-2.jpg" }
    if ($slug -match '-2$') { $fname = "$slug.jpg"; if ($i -eq 1) { continue } }
    $out = Join-Path $dir $fname
    $ok = $false
    for ($try = 0; $try -lt 4 -and -not $ok; $try++) {
      $url = Search-Openverse $map[$slug][$i] ($try * 2)
      if ($url) { $ok = Get-Jpeg $url $out }
    }
    $report += "$fname : $(if ($ok) {'OK'} else {'FAIL'})"
    Write-Host $report[-1]
  }
}
$report | Set-Content "d:\A_Footages\alpha-shop\_fix_report.txt"
