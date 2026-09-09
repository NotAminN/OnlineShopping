$ErrorActionPreference = 'Continue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$u = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=10&gsrsearch=' + [uri]::EscapeDataString('white tshirt model') + '&prop=imageinfo&iiprop=url|size'
$r = Invoke-RestMethod -Uri $u -TimeoutSec 25
if ($r.query.pages) {
  foreach ($p in $r.query.pages.PSObject.Properties.Value) {
    $ii = $p.imageinfo[0]
    if ($ii.width -lt 800 -or $ii.url -match '\.pdf|\.svg') { continue }
    Write-Output ('  ' + $ii.width + 'x' + $ii.height + ' | ' + $p.title)
    Write-Output ('    ' + ($ii.url -replace '\?.*$',''))
  }
}



