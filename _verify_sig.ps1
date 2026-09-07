$dir = 'd:\A_Footages\alpha-shop\Front\public\images\products'
$slugs = @('oversize-linen-coat','silk-crepe-blouse','long-crepe-manteau','pleated-midi-skirt','warm-knit-coat','straight-fabric-pants-w','crop-knit-cardigan','classic-leather-belt','minimal-steel-necklace','cat-eye-sunglasses','wrap-midi-dress','wide-leg-pants-w','satin-slip-skirt','patterned-cotton-scarf','kids-comfort-shorts-2','office-laptop-bag-2','simple-cotton-top-2')
$files = @()
foreach ($s in $slugs) {
  $files += "$s.jpg"
  if ($s -notmatch '-2$') { $files += "$s-2.jpg" }
}
foreach ($f in $files) {
  $p = Join-Path $dir $f
  if (Test-Path $p) {
    $b = [System.IO.File]::ReadAllBytes($p)[0..1]
    $sz = (Get-Item $p).Length
    Write-Host ("{0} : {1:X2}{2:X2} : {3}" -f $f, $b[0], $b[1], $sz)
  } else { Write-Host "$f : MISSING" }
}
