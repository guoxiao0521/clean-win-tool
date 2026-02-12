# Windows 11 垃圾清理脚本
# 以管理员身份运行可清理更多内容

$ErrorActionPreference = "SilentlyContinue"

function Get-Size($path) {
    if (Test-Path $path) {
        $size = (Get-ChildItem $path -Recurse -Force | Measure-Object -Property Length -Sum).Sum
        return [math]::Round($size / 1MB, 2)
    }
    return 0
}

function Remove-Junk($path, $label) {
    if (Test-Path $path) {
        $size = Get-Size $path
        Remove-Item "$path\*" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "[OK] $label - 清理了 ${size} MB" -ForegroundColor Green
    } else {
        Write-Host "[--] $label - 目录不存在，跳过" -ForegroundColor DarkGray
    }
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "       Windows 11 垃圾清理工具" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$totalBefore = (Get-PSDrive C).Free

# 1. 用户临时文件
Remove-Junk $env:TEMP "用户临时文件 (%TEMP%)"

# 2. 系统临时文件
Remove-Junk "C:\Windows\Temp" "系统临时文件 (Windows\Temp)"

# 3. Windows 预读取文件
Remove-Junk "C:\Windows\Prefetch" "预读取缓存 (Prefetch)"

# 4. 回收站
Write-Host "[..] 正在清空回收站..." -ForegroundColor Yellow
Clear-RecycleBin -Force -ErrorAction SilentlyContinue
Write-Host "[OK] 回收站已清空" -ForegroundColor Green

# 5. Windows 更新缓存
Remove-Junk "C:\Windows\SoftwareDistribution\Download" "Windows 更新缓存"

# 6. 缩略图缓存
$thumbCache = "$env:LOCALAPPDATA\Microsoft\Windows\Explorer"
if (Test-Path $thumbCache) {
    $size = Get-Size $thumbCache
    Get-ChildItem "$thumbCache\thumbcache_*.db" -Force | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "[OK] 缩略图缓存 - 已清理" -ForegroundColor Green
}

# 7. Windows 日志文件
$logPaths = @(
    "C:\Windows\Logs\CBS",
    "C:\Windows\Logs\DISM"
)
foreach ($logPath in $logPaths) {
    if (Test-Path $logPath) {
        Get-ChildItem "$logPath\*.log" -Force | Remove-Item -Force -ErrorAction SilentlyContinue
    }
}
Write-Host "[OK] Windows 日志文件" -ForegroundColor Green

# 8. 旧的错误报告
Remove-Junk "C:\ProgramData\Microsoft\Windows\WER\ReportQueue" "Windows 错误报告"

# 9. 字体缓存
Remove-Junk "$env:LOCALAPPDATA\FontCache" "字体缓存"

# 10. 浏览器缓存 (Edge)
$edgeCache = "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Cache"
Remove-Junk $edgeCache "Edge 浏览器缓存"

# 11. 旧的 Windows 安装文件 (Windows.old)
if (Test-Path "C:\Windows.old") {
    $size = Get-Size "C:\Windows.old"
    Write-Host "[!!] 发现 Windows.old 文件夹 (${size} MB) - 建议通过磁盘清理工具删除" -ForegroundColor Yellow
}

# 12. 清理 DNS 缓存
ipconfig /flushdns | Out-Null
Write-Host "[OK] DNS 缓存已刷新" -ForegroundColor Green

# 计算释放空间
$totalAfter = (Get-PSDrive C).Free
$freed = [math]::Round(($totalAfter - $totalBefore) / 1MB, 2)

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  清理完成！共释放约 $freed MB 磁盘空间" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
