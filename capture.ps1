param($l)

$scope = $l

[Reflection.Assembly]::LoadWithPartialName("System.Drawing")
[Reflection.Assembly]::LoadWithPartialName("System.IO")

$vc = Get-WmiObject -class "Win32_VideoController"
$mainMonitor = [PSCustomObject]@{
   monitorWidth = $vc.CurrentHorizontalResolution
   monitorHeight = $vc.CurrentVerticalResolution
}

$latPosOffset = [PSCustomObject]@{
   x = $mainMonitor.monitorWidth - 167
   y = $mainMonitor.monitorHeight + 20
   w = 37
   h = 14
}

$lonPosOffset = [PSCustomObject]@{
   x = $mainMonitor.monitorWidth - 257
   y = $mainMonitor.monitorHeight + 20
   w = 37
   h = 14
}

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

$boundsLat = [Drawing.Rectangle]::FromLTRB(
      $latPosOffset.x, 
      $latPosOffset.y, 
      $latPosOffset.x + $latPosOffset.w, 
      $latPosOffset.y + $latPosOffset.h
   )
$boundsLng = [Drawing.Rectangle]::FromLTRB(
      $lonPosOffset.x, 
      $lonPosOffset.y, 
      $lonPosOffset.x + $lonPosOffset.w, 
      $lonPosOffset.y + $lonPosOffset.h
   )

if($scope -eq "lat") {
   screenshot $boundsLat
} else {
   screenshot $boundsLng
}
