$files = Get-ChildItem -Path "src\app\services" -Filter "*.ts" -Recurse
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $content = $content -replace "from '../models/", "from '../shared/models/"
    Set-Content -Path $file.FullName -Value $content -NoNewline
}

$guardFiles = Get-ChildItem -Path "src\app\shared\guards" -Filter "*.ts" -Recurse
foreach ($file in $guardFiles) {
    $content = Get-Content $file.FullName -Raw
    $content = $content -replace "from '../services/", "from '../../services/"
    Set-Content -Path $file.FullName -Value $content -NoNewline
}

Write-Host "Imports actualizados correctamente"
