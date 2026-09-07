$src      = 'D:\A_Footages\alpha-shop\Front\public\images\products'
$destDir  = 'D:\A_Footages\alpha-shop\_qa_sheets'
$thumbW   = 280; $thumbH = 373
$cols     = 4;   $rows   = 5
$cellPad  = 14;  $labelH = 26
$cellW    = $thumbW * 2 + $cellPad * 3
$cellH    = $thumbH + $labelH + $cellPad * 2
Add-Type -AssemblyName System.Drawing

$slugs = Select-String -Path 'D:\A_Footages\alpha-shop\Front\src\js\data\products.js' -Pattern "slug:\s*'([^']+)'" |
  ForEach-Object { $_.Matches[0].Groups[1].Value } | Select-Object -Unique
Write-Host "Total products: $($slugs.Count)"

if (Test-Path $destDir) { Remove-Item "$destDir\sheet*.png" -Force }
New-Item -ItemType Directory -Force -Path $destDir | Out-Null

$perSheet = $cols * $rows
$sheets = [Math]::Ceiling($slugs.Count / $perSheet)
Write-Host "Sheets: $sheets in $destDir"

for ($s = 0; $s -lt $sheets; $s++) {
  $W = $cols * $cellW + $cellPad
  $H = $rows * $cellH + $cellPad
  $bmp = New-Object System.Drawing.Bitmap($W, $H)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::White)
  $font = New-Object System.Drawing.Font('Arial', 13, [System.Drawing.FontStyle]::Bold)
  $red = [System.Drawing.Brushes]::Red
  $gray = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230,230,230))
  $pen = [System.Drawing.Pens]::LightGray

  for ($i = 0; $i -lt $perSheet; $i++) {
    $idx = $s * $perSheet + $i
    if ($idx -ge $slugs.Count) { break }
    $slug = $slugs[$idx]
    $cx = $cellPad + ($i % $cols) * $cellW
    $cy = $cellPad + [Math]::Floor($i / $cols) * $cellH
    $g.DrawRectangle($pen, $cx, $cy, $cellW - 1, $cellH - 1)
    $g.DrawString($slug, $font, $red, $cx + 6, $cy + 4)
    for ($k = 0; $k -lt 2; $k++) {
      $f = Join-Path $src ("$slug{0}.jpg" -f $(if ($k) {'-2'} else {''}))
      $tx = $cx + $cellPad + $k * ($thumbW + $cellPad)
      $ty = $cy + $labelH + $cellPad
      $ok = $false
      if (Test-Path $f) {
        $fs = [System.IO.File]::OpenRead($f)
        $b = New-Object byte[] 3; [void]$fs.Read($b, 0, 3); $fs.Close()
        $ok = ($b[0] -eq 0xFF -and $b[1] -eq 0xD8)
      }
      if ($ok) {
        $img = [System.Drawing.Image]::FromFile($f)
        $g.DrawImage($img, $tx, $ty, $thumbW, $thumbH)
        $img.Dispose()
      } else {
        $g.FillRectangle($gray, $tx, $ty, $thumbW, $thumbH)
        $g.DrawString('NOT-JPG', $font, $red, $tx + 60, $ty + 160)
      }
    }
  }
  $g.Dispose()
  $bmp.Save((Join-Path $destDir ("sheet{0}.png" -f ($s + 1))), [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}
Write-Host 'Done.'