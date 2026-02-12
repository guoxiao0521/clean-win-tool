# clean-win-tool

> 一个基于 Electron + Vue + TypeScript 的 Windows 磁盘清理桌面工具。  
> 可视化执行 `CleanUp.ps1`，实时展示清理日志与状态。

---

## ✨ 功能亮点

- 🧹 一键清理常见系统垃圾（临时文件、回收站、DNS 缓存等）
- 📋 可视化展示 12 项清理任务状态（进行中 / 成功 / 跳过 / 警告）
- 🖥️ 实时日志输出，便于确认每一步执行结果
- 📦 支持 `electron-builder` 打包安装包（Windows / macOS / Linux）
- 🔁 已预置自动更新发布配置（generic provider）

## 🧩 当前清理项

- 用户临时文件 `%TEMP%`
- 系统临时文件 `C:\Windows\Temp`
- 预读取缓存 `C:\Windows\Prefetch`
- 回收站
- Windows 更新缓存
- 缩略图缓存
- Windows 日志（CBS / DISM）
- Windows 错误报告
- 字体缓存
- Edge 浏览器缓存
- `Windows.old` 检测提示
- DNS 缓存刷新

## 🚀 快速开始

### 1) 安装依赖

```bash
npm install
```

### 2) 本地开发

```bash
npm run dev
```

### 3) 类型检查与构建

```bash
npm run typecheck
npm run build
```

## 📦 打包发布

```bash
# Windows 安装包
npm run build:win

# macOS 安装包
npm run build:mac

# Linux 安装包
npm run build:linux

# 仅产出未打包目录
npm run build:unpack
```

默认输出目录：`dist/`

## 🛠️ 常用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发环境 |
| `npm run start` | 预览构建产物 |
| `npm run lint` | 运行 ESLint |
| `npm run format` | 使用 Prettier 格式化 |
| `npm run typecheck` | Node + Web 类型检查 |
| `npm run build` | 生产构建 |

## 🗂️ 项目结构

```text
clean-win-tool/
├─ src/
│  ├─ main/        # Electron 主进程（窗口、IPC、PowerShell 启动）
│  ├─ preload/     # 安全桥接 API（startCleanup / log / complete）
│  └─ renderer/    # Vue 界面
├─ CleanUp.ps1     # 实际清理脚本
├─ electron-builder.yml
└─ package.json
```

## 🔐 权限与安全说明

- 清理系统目录时，建议以管理员权限运行应用，以获得更完整的清理能力。
- 项目通过 IPC 从主进程调用 PowerShell，脚本路径在开发和生产环境均有明确区分。
- 若公司策略限制脚本执行，可检查 PowerShell 执行策略与终端权限。

## 🧱 技术栈

- Electron
- Vue 3
- TypeScript
- electron-vite
- electron-builder

## 📄 License

本项目基于 [MIT License](./LICENSE) 开源。
