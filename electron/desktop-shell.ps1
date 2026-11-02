$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition (Get-Content -LiteralPath (Join-Path $PSScriptRoot 'DesktopImage.cs') -Raw -Encoding UTF8)
$shell = New-Object -ComObject Shell.Application
$desktop = $shell.Namespace(0)
$iconSize = 48
$iconSizeSource = 'default'
try {
 $hwnd = 0
 $browser = $shell.Windows().FindWindowSW(0, 0, 8, [ref]$hwnd, 1)
 $iconSize = [DesktopImage]::IconSize($browser)
 $iconSizeSource = 'live-desktop'
} catch {
 $stored = Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\Shell\Bags\1\Desktop' -Name IconSize -ErrorAction SilentlyContinue
 if ($stored -and $stored.IconSize) { $iconSize = [int]$stored.IconSize; $iconSizeSource = 'desktop-setting' }
}
$iconSize = [Math]::Max(16, [Math]::Min(256, $iconSize))
$results = @()
$desktopPaths = @([Environment]::GetFolderPath('DesktopDirectory'), [Environment]::GetFolderPath('CommonDesktopDirectory'))
$hiddenIcons = Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\HideDesktopIcons\NewStartPanel' -ErrorAction SilentlyContinue
$visibleItems = @($desktop.Items()) | Where-Object {
 $parent = [IO.Path]::GetDirectoryName($_.Path)
 if ($desktopPaths -contains $parent) { $true }
 elseif ($_.Path -match '\{[0-9A-Fa-f-]{36}\}') {
  $id = $Matches[0]
  $setting = if ($hiddenIcons) { $hiddenIcons.PSObject.Properties[$id] } else { $null }
  ($setting -and $setting.Value -eq 0) -or (-not $setting -and $id -eq '{645FF040-5081-101B-9F08-00AA002F954E}')
 } else { $false }
} | Sort-Object @{Expression={ if ($_.Path.StartsWith('::')) {1} else {0} }}, Name
foreach ($item in $visibleItems) {
 if ($results.Count -ge 60) { break }
 if ($item.Name -eq 'desktop.ini') { continue }
 $image = $null
 try { $image = [DesktopImage]::Read($item.Path, $iconSize) } catch { }
 $results += [pscustomobject]@{ path=$item.Path; name=$item.Name; isDirectory=[bool]$item.IsFolder; image=$image; iconSize=$iconSize; iconSizeSource=$iconSizeSource }
}
ConvertTo-Json -InputObject @($results) -Depth 4 -Compress
