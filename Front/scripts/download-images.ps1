param(
  [switch]$Overwrite
)

# Downloads curated Unsplash fashion imagery into public/images.
# Run once during project setup; assets are self-hosted afterwards.
# Product images come from product-images.map.json (one primary + one
# secondary shot per product slug, matched to the item type).
$ErrorActionPreference = 'SilentlyContinue'
$base = Join-Path $PSScriptRoot '..\public\images'
$dirs = @('hero','categories','collections','editorial','products','products\secondary')
foreach ($d in $dirs) { New-Item -ItemType Directory -Force -Path (Join-Path $base $d) | Out-Null }

function U($id, $w) { "https://images.unsplash.com/${id}?q=85&w=${w}&auto=format&fit=crop" }

$images = [ordered]@{
  # ---- Hero ----
  'hero\hero-1.jpg' = U 'photo-1490481651871-ab68de25d43d' 2000
  'hero\hero-2.jpg' = U 'photo-1445205170230-053b83016050' 2000
  'hero\hero-3.jpg' = U 'photo-1469334031218-e382a71b716b' 2000
  'hero\hero-4.jpg' = U 'photo-1483985988355-763728e1935b' 2000
  'hero\hero-5.jpg' = U 'photo-1485968579580-b6d095142e6e' 2000
  # ---- Categories ----
  'categories\cat-women.jpg'       = U 'photo-1509631179647-0177331693ae' 1100
  'categories\cat-men.jpg'         = U 'photo-1520975954732-35dd22299614' 1100
  'categories\cat-kids.jpg'        = U 'photo-1503919545889-aef636e10ad4' 1100
  'categories\cat-shoes.jpg'       = U 'photo-1543163521-1bf539c55dd2' 1100
  'categories\cat-bags.jpg'        = U 'photo-1548036328-c9fa89d128fa' 1100
  'categories\cat-accessories.jpg' = U 'photo-1511499767150-a48a237f0083' 1100
  # ---- Collections ----
  'collections\col-minimal.jpg' = U 'photo-1490481651871-ab68de25d43d' 1300
  'collections\col-urban.jpg'   = U 'photo-1551028719-00167b16eac5' 1300
  'collections\col-classic.jpg' = U 'photo-1594938298603-c8148c4dae35' 1300
  'collections\col-weekend.jpg' = U 'photo-1469334031218-e382a71b716b' 1300
  'collections\col-season.jpg'  = U 'photo-1539533018447-63fcce2678e3' 1300
  # ---- Editorial ----
  'editorial\ed-1.jpg' = U 'photo-1558769132-cb1aea458c5e' 1400
  'editorial\ed-2.jpg' = U 'photo-1551232864-3f0890e580d9' 1400
  'editorial\ed-3.jpg' = U 'photo-1517841905240-472988babdf9' 1400
  'editorial\ed-4.jpg' = U 'photo-1489987707025-afc232f7bdaf' 1400
}

# ---- Per-product shots (primary + secondary), matched to each item ----
$mapPath = Join-Path $PSScriptRoot 'product-images.map.json'
if (Test-Path $mapPath) {
  $map = Get-Content $mapPath -Raw | ConvertFrom-Json
  foreach ($prop in $map.PSObject.Properties) {
    $slug = $prop.Name
    $urls = $prop.Value
    for ($i = 0; $i -lt $urls.Count; $i++) {
      $suffix = if ($i -eq 0) { "" } else { "-$($i+1)" }
      $images["products\$slug$suffix.jpg"] = $urls[$i]
    }
  }
}

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$failed = @()
$done = 0
foreach ($k in $images.Keys) {
  $dest = Join-Path $base $k
  if (-not $Overwrite -and (Test-Path $dest) -and (Get-Item $dest).Length -gt 20000) { $done++; continue }
  for ($attempt = 1; $attempt -le 3; $attempt++) {
    try {
      Invoke-WebRequest -Uri $images[$k] -OutFile $dest -UseBasicParsing -TimeoutSec 60
      break
    } catch { Start-Sleep -Milliseconds 800 }
  }
  if (-not (Test-Path $dest) -or (Get-Item $dest).Length -lt 4000) { $failed += $k } else { $done++ }
}
Write-Output "TOTAL: $($images.Count)  OK: $done"
if ($failed.Count) { Write-Output "FAILED:"; $failed | ForEach-Object { Write-Output " $_" } }
else { Write-Output "FAILED: none" }
