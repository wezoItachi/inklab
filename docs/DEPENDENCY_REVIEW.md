# 依赖检查记录

- 最近复核：2026-10-18
- 范围：`pnpm audit --prod`
- 结果：从 30 项（1 critical、13 high、12 moderate、4 low）降低为 2 项（1 high、1 low）。

## 已处理

- `shadcn` CLI 从生产依赖移到开发依赖，避免把不参与网站运行的工具链计入生产部署。
- React、React DOM 与 React Server DOM 升级到 19.2.8。
- vinext 升级到 1.0.1，Vite 升级到 8.3.3，并采用 vinext 要求的 `@vitejs/plugin-rsc` 0.5.34。
- 对已有兼容补丁的 `fast-uri`、`fflate`、`source-map-js` 和 PostCSS 统一锁定安全版本。

## 尚未消除

1. `braces`（high，GHSA-vfj7-8cjw-p6xm）：来自 `vinext > vite-plugin-commonjs > vite-plugin-dynamic-import > fast-glob > micromatch`。漏洞记录要求 `>=3.0.4`，但检查时 npm registry 最新版本仍为 3.0.3，无法锁定尚未发布的修复版。
2. `esbuild`（low，GHSA-g7r4-m6w7-qqqr）：影响 Windows 开发服务器的任意文件读取场景，记录要求 `>=0.28.1`；当前链路仍由 React Server DOM 的 webpack 工具固定到 0.27.3。公开网站不应暴露开发服务器，但仍需跟随上游更新。

## 公开前处理建议

- 保持本地开发服务器只监听回环地址，不向公网开放。
- 在首次公开和每次部署前重跑生产依赖审计。
- 关注 vinext、vite-plugin-commonjs、React Server DOM / webpack 的补丁更新；补丁发布后先更新锁文件，再完成测试、类型检查、lint 和生产构建。
- 依赖许可证清单仍需单独导出并人工检查；本记录不把漏洞审计误写成许可证审计。

## 2026-10-18 复核

- `pnpm audit --prod` 仍报告相同的 2 项：`braces` 1 项 high、`esbuild` 1 项 low；没有出现新的生产依赖漏洞。
- `braces` 公告仍未提供已发布的修复版本，项目不使用其处理不受信任 glob 输入。
- `esbuild` 风险仍限于开发服务器暴露场景；本地服务继续只监听回环地址，公开仓库不等于公开开发服务器。
- 已导出并人工分类生产依赖许可证，结果见[生产依赖许可证检查](THIRD_PARTY_LICENSES.md)。未发现缺失许可证字段或明显阻止公开源码的条款。
