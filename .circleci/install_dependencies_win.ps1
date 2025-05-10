
$ErrorActionPreference = "Stop"
$ProgressPreference = 'SilentlyContinue'

Write-Output "Downloading SDK"
(New-Object Net.WebClient).DownloadFile("https://go.microsoft.com/fwlink/?linkid=2164145", "$env:TEMP\sdk_install.exe")
Write-Output "Downloading Node 22"
(New-Object Net.WebClient).DownloadFile("https://nodejs.org/dist/v22.15.0/node-v22.15.0-x64.msi", "$env:TEMP\node-install.msi")
Write-Output "Downloading VS Installer"
(New-Object Net.WebClient).DownloadFile("https://aka.ms/vs/17/release/channel", "$env:TEMP\VisualStudio.chman")
Write-Output "Downloading VS"
(New-Object Net.WebClient).DownloadFile("https://aka.ms/vs/17/release/vs_buildtools.exe", "$env:TEMP\vs_buildtools.exe")
Write-Output "Installing SDK"
Start-Process -FilePath "$env:TEMP\sdk_install.exe" -ArgumentList "/features + /quiet /norestart" -Wait
Write-Output "Uninstalling Chocolately node"
Start-Process -FilePath "choco" -ArgumentList "uninstall nodejs -y -x" -Wait
Write-Output "Installing Node"
Start-Process -FilePath "msiexec.exe" -ArgumentList "/i $env:TEMP\node-install.msi /qn ADDLOCAL=ALL" -Wait
Write-Output "Installing VS"
Start-Process -FilePath "$env:TEMP\vs_buildtools.exe" -ArgumentList "--quiet --wait --norestart --nocache --channelUri $env:TEMP\VisualStudio.chman --installChannelUri $env:TEMP\VisualStudio.chman --add Microsoft.VisualStudio.Workload.NativeDesktop --add Microsoft.VisualStudio.Component.VC.ATLMFC --add Microsoft.VisualStudio.Component.Windows11SDK.26100 --includeRecommended --installPath C:\BuildTools" -Wait
Write-Output "Dependencies installed"
