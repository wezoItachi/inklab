# 弃用区

这里保存当前阶段确认未被 INKLAB 业务代码引用、但暂不永久删除的脚手架文件。

## `starter-ui/`

- 移入日期：2026-09-06
- 内容：59 个未使用的 `components/ui` 模板组件，以及只被其中 `sidebar.tsx` 使用的 `hooks/use-mobile.ts`
- 原因：当前页面只使用 `components/ui/native-select.tsx`。其余模板会增加代码审计与全量 lint 噪声，但现阶段先保留以便回退。
- 状态：不参与 TypeScript 检查、lint 或生产构建，不属于可用产品代码。

## `ASSET_SOURCES.md`

- 移入日期：2026-09-06
- 原因：内容已由 `docs/DATA_AND_ASSETS.md` 合并取代，避免维护两份相互漂移的正式来源记录。
- 状态：仅供历史追溯，当前唯一正式来源记录为 `docs/DATA_AND_ASSETS.md`。

需要恢复时，把目标文件移回原来的 `components/ui/` 或 `hooks/` 路径，并重新运行测试、lint 和生产构建。不要直接从弃用区导入组件。

只有在当前开发阶段完成、功能验证稳定并经维护者再次确认后，才批量删除本目录。
