param($l)

$scope = $l

[Reflection.Assembly]::LoadWithPartialName("System.Drawing")
[Reflection.Assembly]::LoadWithPartialName("System.IO")

function screenshot([Drawing.Rectangle]$bounds) {
   $bmp = New-Object Drawing.Bitmap $bounds.width, $bounds.height
   $graphics = [Drawing.Graphics]::FromImage($bmp)

   $graphics.CopyFromScreen($bounds.Location, [Drawing.Point]::Empty, $bounds.size)

   $stream = New-Object IO.MemoryStream
   $bmp.Save($stream, ([system.drawing.imaging.imageformat]::png))

   $graphics.Dispose()
   $bmp.Dispose()

   return $stream.ToArray()
}

$boundsLat = [Drawing.Rectangle]::FromLTRB(1760, 20, 1800, 35)
$boundsLng = [Drawing.Rectangle]::FromLTRB(1670, 20, 1710, 35)

if($scope -eq "lat") {
   screenshot $boundsLat
} else {
   screenshot $boundsLng
}
