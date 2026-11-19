Add-Type -AssemblyName System.Drawing

function New-Bitmap($w, $h) {
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    return @($bmp, $g)
}

function Draw-Icon($g, $x, $y, $size) {
    $bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF($x, $y)),
        (New-Object System.Drawing.PointF(($x + $size), ($y + $size))),
        [System.Drawing.Color]::FromArgb(255, 18, 12, 38),
        [System.Drawing.Color]::FromArgb(255, 45, 15, 78)
    )
    $g.FillRectangle($bg, $x, $y, $size, $size)

    $gridPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(70, 168, 85, 247), 1)
    $step = $size / 8
    for ($i = 1; $i -lt 8; $i++) {
        $p = $x + $i * $step
        $g.DrawLine($gridPen, $p, $y, $p, $y + $size)
        $g.DrawLine($gridPen, $x, $p, $x + $size, $p)
    }

    $glow = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 255, 70, 210), ([Math]::Max(6, $size / 28)))
    $mag = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 255, 70, 210), ([Math]::Max(3, $size / 48)))
    $cyan = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 110, 245, 255), ([Math]::Max(2, $size / 90)))

    $a = New-Object System.Drawing.PointF(($x + $size * 0.21), ($y + $size * 0.30))
    $b = New-Object System.Drawing.PointF(($x + $size * 0.36), ($y + $size * 0.72))
    $c = New-Object System.Drawing.PointF(($x + $size * 0.50), ($y + $size * 0.43))
    $d = New-Object System.Drawing.PointF(($x + $size * 0.64), ($y + $size * 0.72))
    $e = New-Object System.Drawing.PointF(($x + $size * 0.79), ($y + $size * 0.30))

    $g.DrawLines($glow, @($a, $b, $c, $d, $e))
    $g.DrawLines($mag, @($a, $b, $c, $d, $e))
    $g.DrawLines($cyan, @($a, $b, $c, $d, $e))

    $border = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 255, 90, 220), 2)
    $g.DrawRectangle($border, $x + 1, $y + 1, $size - 3, $size - 3)
}

$out = Join-Path $PSScriptRoot 'assets-new'
New-Item -ItemType Directory -Force -Path $out | Out-Null

$bmp, $g = New-Bitmap 512 512
Draw-Icon $g 0 0 512
$bmp.Save((Join-Path $out 'logo-mark.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()

$bmp, $g = New-Bitmap 1254 1254
Draw-Icon $g 90 315 624

$font = New-Object System.Drawing.Font('Segoe UI', 118, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$brush1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 78, 214))
$brush2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 245, 245, 255))
$g.DrawString('Wicked', $font, $brush1, 770, 470)
$g.DrawString('ImGui', $font, $brush2, 770, 600)
$g.DrawString('Maker', $font, $brush2, 770, 730)

$subFont = New-Object System.Drawing.Font('Segoe UI', 34, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(200, 180, 190, 220))
$g.DrawString('BUILD BETTER INTERFACES', $subFont, $subBrush, 775, 865)

$bmp.Save((Join-Path $out 'logo.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
$font.Dispose(); $subFont.Dispose(); $brush1.Dispose(); $brush2.Dispose(); $subBrush.Dispose()

Write-Output "Generated logos in $out"
