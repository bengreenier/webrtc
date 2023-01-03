
$ErrorActionPreference = "Stop"
$ProgressPreference = 'SilentlyContinue'

# It's truely a fucking nightmare out here in CI land
# now the issue on circle is, too many deps - probably fucked because VS is already installed
Get-WmiObject -Class Win32_Product

(New-Object Net.WebClient).DownloadFile("https://nodejs.org/dist/v18.12.1/node-v18.12.1-x64.msi", "$env:TEMP\node-install.msi")
(New-Object Net.WebClient).DownloadFile("https://github.com/git-for-windows/git/releases/download/v2.39.0.windows.2/Git-2.39.0.2-64-bit.exe", "$env:TEMP\git-install.exe")
(New-Object Net.WebClient).DownloadFile("https://aka.ms/vs/17/release/channel", "$env:TEMP\VisualStudio.chman")
(New-Object Net.WebClient).DownloadFile("https://aka.ms/vs/17/release/vs_buildtools.exe", "$env:TEMP\vs_buildtools.exe")
Start-Process -FilePath "msiexec.exe" -ArgumentList "/i $env:TEMP\node-install.msi /qn ADDLOCAL=ALL" -Wait
Start-Process -FilePath "$env:TEMP\git-install.exe" -ArgumentList "/norestart /sp- /verysilent" -Wait
Start-Process -FilePath "$env:TEMP\vs_buildtools.exe" -ArgumentList "--quiet --wait --norestart --nocache --channelUri $env:TEMP\VisualStudio.chman --installChannelUri $env:TEMP\VisualStudio.chman --add Microsoft.VisualStudio.Workload.NativeDesktop --add Microsoft.VisualStudio.Component.VC.ATLMFC --add Microsoft.VisualStudio.Component.Windows10SDK.20348 --includeRecommended --installPath C:\BuildTools" -Wait
Write-Output "Dependencies installed"
