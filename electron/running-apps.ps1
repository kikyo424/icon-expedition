param([string]$ExcludePath, [switch]$Watch)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
Add-Type -AssemblyName System.Drawing
$source = "using System.Collections.Generic; using System.Diagnostics;`n" + (Get-Content -LiteralPath (Join-Path $PSScriptRoot 'DesktopImage.cs') -Raw -Encoding UTF8) + "`n" + ((Get-Content -LiteralPath (Join-Path $PSScriptRoot 'RunningApps.cs') -Raw -Encoding UTF8) -replace '(?m)^using [^;]+;\r?\n','')
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition $source
do {
 $iconSize = 48
 try { $shell=New-Object -ComObject Shell.Application; $hwnd=0; $browser=$shell.Windows().FindWindowSW(0,0,8,[ref]$hwnd,1); $iconSize=[DesktopImage]::IconSize($browser) } catch {}
 $items = @(@([RunningApps]::Read($ExcludePath)) | ForEach-Object { $_ | Add-Member -NotePropertyName IconSize -NotePropertyValue $iconSize -PassThru })
 ConvertTo-Json -InputObject @($items) -Depth 4 -Compress
 if ($Watch) { Start-Sleep -Seconds 3 }
} while ($Watch)
