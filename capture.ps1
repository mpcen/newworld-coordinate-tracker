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
   #    "path/to/your/working/directory",
   #    ([system.drawing.imaging.imageformat]::png)
   # )

   $graphics.Dispose()
   $bmp.Dispose()

   return $stream.ToArray()
}

$bounds = [Drawing.Rectangle]::FromLTRB(1525, 20, 1920, 35)

screenshot $bounds