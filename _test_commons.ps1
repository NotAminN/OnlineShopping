$ErrorActionPreference = 'Continue'
Start-Sleep -Seconds 8
$u = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=filetype:bitmap%20pleated%20skirt&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url%7Csize&iiurlwidth=800&format=json'
try {
  $r = Invoke-RestMethod -Uri $u -TimeoutSec 40 -Headers @{ 'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ModShopQA/1.0' }
  foreach ($p in $r.query.pages.PSObject.Properties.Value) {
    $ii = $p.imageinfo[0]
    Write-Host ("{0} | {1}x{2}" -f $p.title, $ii.width, $ii.height)
    Write-Host $ii.thumburl
  }
} catch { Write-Host ("COMMONS ERR: " + $_.Exception.Message) }

Write-Host '--- FLICKR ---'
try {
  $f = Invoke-RestMethod -Uri 'https://www.flickr.com/services/feeds/photos_public.gne?tags=pleatedskirt&tagmode=all&format=json&nojsoncallback=1' -TimeoutSec 40 -Headers @{ 'User-Agent' = 'Mozilla/5.0' }
  foreach ($item in $f.items) { Write-Host $item.media.m }
} catch { Write-Host ("FLICKR ERR: " + $_.Exception.Message) }

