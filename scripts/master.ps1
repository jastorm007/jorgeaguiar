$ErrorActionPreference = "Stop"

function Run-Git {
    param (
        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$Args
    )

    if ($Args.Count -eq 0) {
        throw "Run-Git called with no arguments"
    }

    Write-Host "▶ git $($Args -join ' ')" -ForegroundColor Cyan
    & git @Args

    if ($LASTEXITCODE -ne 0) {
        throw "Git command failed: git $($Args -join ' ')"
    }
}

try {
    Write-Host "`n🚀 Starting deploy merge workflow`n" -ForegroundColor Green
    Run-Git checkout development
    Run-Git merge feature/register    
    Run-Git push origin development

    Run-Git checkout main
    Run-Git merge development
    Run-Git push origin main
    npm run build
    
    Run-Git checkout feature/register

    Write-Host "`n✅ Deploy merge workflow completed successfully!" -ForegroundColor Green
}
catch {
    Write-Host "`n❌ ERROR: $($_)" -ForegroundColor Red
    Write-Host "🛑 Workflow stopped. Fix the issue and retry." -ForegroundColor Yellow
    exit 1
}
