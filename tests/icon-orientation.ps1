$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition (Get-Content -LiteralPath (Join-Path $PSScriptRoot '../electron/DesktopImage.cs') -Raw -Encoding UTF8)
[DesktopImage]::TestOrientation()
Write-Output 'PASS: top-down and bottom-up bitmaps retain orientation and transparent/semitransparent pixels.'
