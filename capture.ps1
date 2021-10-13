[Reflection.Assembly]::LoadWithPartialName("System.Drawing")
[Reflection.Assembly]::LoadWithPartialName("System.IO")

function screenshot([Drawing.Rectangle]$bounds) {
   $bmp = New-Object Drawing.Bitmap $bounds.width, $bounds.height
   $graphics = [Drawing.Graphics]::FromImage($bmp)

   $graphics.CopyFromScreen($bounds.Location, [Drawing.Point]::Empty, $bounds.size)
   # Applying color adjustmnet
   $graphics.DrawImage($bmp,$drawingParallelogram,$drawingRectangle,[System.Drawing.GraphicsUnit]::Pixel , $attributes)

   $stream = New-Object IO.MemoryStream
   $bmp.Save($stream, ([system.drawing.imaging.imageformat]::png))
   
   # Uncomment this to see the actual screenshot being used for OCR
   $bmp.Save(
      "./capture.png",
      ([system.drawing.imaging.imageformat]::png)
   )

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
   
# simple Color adjustment to try and isolate the coordinates to improve OCR success
$drawingRectangle = new-object Drawing.Rectangle 0, 0, $bounds.Width, $bounds.Height
# need to make this because the parameter sets for DrawImage requires them when using the color matrix
$drawingParallelogram = @(
   [Drawing.Point]::new(0, 0),
   [Drawing.Point]::new($bounds.Width, 0),
   [Drawing.Point]::new(0, $bounds.Height))
[single[][]] $ColorCorrectionMatrix = 
   (1.8, 1.8, 1.8, 0, 0),
   (1.8,1.8, 1.8, 0, 0),
   (3.0,3.0, 3.0, 0, 0),
   (-0.45, -0.45, -0.45, 1, 0),
   (-3.0,-3.0, -3.0, 0, 1)
$colorMatrix = [System.Drawing.Imaging.ColorMatrix]::new($ColorCorrectionMatrix)
$attributes  = [System.Drawing.Imaging.ImageAttributes]::new()
$attributes.SetColorMatrix($colorMatrix)

screenshot $bounds