$ErrorActionPreference = 'Stop'
Push-Location (Join-Path $PSScriptRoot '..\zasshealth-api')
try {
    & docker compose up -d --build
    if ($LASTEXITCODE -ne 0) { throw 'API services failed to start.' }
} finally {
    Pop-Location
}
Push-Location $PSScriptRoot
try {
    & npm run dev
} finally {
    Pop-Location
}
