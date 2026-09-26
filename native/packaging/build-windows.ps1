$ErrorActionPreference = 'Stop'

cargo build --release --manifest-path native/Cargo.toml
New-Item -ItemType Directory -Force -Path release | Out-Null
Copy-Item native/target/release/sreon.exe release/Sreon.exe -Force
Write-Host 'Created release/Sreon.exe'
Write-Host 'Use WiX or NSIS to wrap release/Sreon.exe as Sreon-Setup.exe.'
