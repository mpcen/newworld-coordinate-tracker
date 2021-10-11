[Reflection.Assembly]::LoadWithPartialName("System.Drawing")
[Reflection.Assembly]::LoadWithPartialName("System.IO")

function screenshot([Drawing.Rectangle]$bounds) {
   $bmp = New-Object Drawing.Bitmap $bounds.width, $bounds.height
   $graphics = [Drawing.Graphics]::FromImage($bmp)

   $graphics.CopyFromScreen($bounds.Location, [Drawing.Point]::Empty, $bounds.size)

   $stream = New-Object IO.MemoryStream
   $bmp.Save($stream, ([system.drawing.imaging.imageformat]::png))
   
   # Uncomment this to see the actual screenshot being used for OCR
   # $bmp.Save(
   #    "./capture.png",
   #    ([system.drawing.imaging.imageformat]::png)
   # )

   $graphics.Dispose()
   $bmp.Dispose()

   return $stream.ToArray()
}

$vc = Get-WmiObject -class "Win32_VideoController"
$mainMonitor = [PSCustomObject]@{
   monitorWidth = $vc.CurrentHorizontalResolution[0] #primary monitor
   monitorHeight = $vc.CurrentVerticalResolution[0] #primary monitor
}

$posOffset = [PSCustomObject]@{
   x = $mainMonitor.monitorWidth
   y = 20
   w = -395
   h = 15
}

$bounds = [Drawing.Rectangle]::FromLTRB(
      $posOffset.x + $posOffset.w, 
      $posOffset.y, 
      $posOffset.x, 
      $posOffset.y + $posOffset.h
   )

screenshot $bounds