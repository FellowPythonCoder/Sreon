$ErrorActionPreference = 'Stop'

cargo build --release --manifest-path native/Cargo.toml
New-Item -ItemType Directory -Force -Path release | Out-Null
Copy-Item native/target/release/sreon.exe release/Sreon.exe -Force

if (Get-Command makensis -ErrorAction SilentlyContinue) {
    Push-Location native/packaging
    makensis sreon.nsi
    Pop-Location
    Write-Host 'Created release/Sreon-Setup.exe'
} else {
    Write-Host 'Created release/Sreon.exe'
    Write-Host 'Install NSIS and rerun this script to create release/Sreon-Setup.exe.'
}
