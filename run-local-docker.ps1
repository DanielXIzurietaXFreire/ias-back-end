param(
  [string]$EnvFile = ".env.test"
)

if (-not (Test-Path $EnvFile)) {
  Write-Host "File $EnvFile not found. Copy .env.test.example to .env.test and fill the values before running." -ForegroundColor Red
  exit 1
}

Write-Host "Building Docker image ias-backend:local..."
docker build -t ias-backend:local .

if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Running container (port 3000) using $EnvFile..."
docker run --rm -it -p 3000:3000 --env-file $EnvFile --name ias-backend-local ias-backend:local
