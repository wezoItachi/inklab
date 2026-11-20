# INKLAB 本地数据仓库

这里是网站内置、可版本控制的数据源，不是账号或社区数据库。

- `manifest.json`：数据版本、文件索引与授权沟通状态。
- `sources.json`：来源、核对日期与使用状态。
- `*.v12.0.0.json`：当前 174 把对战武器、14 个副武器、19 个特殊武器、套装关系、主武参数、71 把鲑鱼跑武器参数及可重复生成的审计／导入报告。
- `weapon-image-assets.v12.0.0.json`：当前页面实际使用的 207 张对战武器图片清单，逐文件记录来源路径、字节数与 SHA-256；二进制文件位于 `public/assets/weapons/`。
- `*.v11.3.0.json`：上一个游戏版本的历史快照；保留用于差异核对，不参与当前界面运行。
- `battle-parameter-verification-queue.v12.0.0.json`：为剩余 332 次待验证字段逐项指定所需证据，并归并为 8 类、36 组可执行核验任务。
- `schema.ts`：数据结构与运行前校验。

全量目录由 `scripts/import-leanny-weapons.mjs` 离线生成。脚本需要显式传入包含 `WeaponInfoMain.json` 与 `CNzh.json` 的本地目录，例如：

```bash
pnpm data:import-weapons -- --source-dir <本地上游文件目录>
```

已获授权的对战武器图片可由下列命令从记录的正式路径重新导入；它只下载当前 174／14／19 条目录实际引用的文件，不镜像其他上游素材：

```bash
pnpm assets:import-weapon-images
```

当前目录包含完整的 Ver. 12.0.0 武器身份与套装关系。全部 174 把对战武器都已按共享参数文件导入上游明确给出的字段，并至少含一个已核验主武字段；没有显式来源或含义仍有歧义的值继续保持 `pending`，不会借用同类武器的缺省值。副武器耗墨、增强对象和快速配装建议也只在已经核验时提供。

射击枪参数可通过以下命令重复生成；输入目录必须来自报告记录的固定提交：

```bash
pnpm data:import-shooter-parameters -- --source-dir <1200/weapon 参数目录>
pnpm data:import-blaster-parameters -- --source-dir <1200/weapon 参数目录>
pnpm data:import-roller-parameters -- --source-dir <1200/weapon 参数目录>
pnpm data:import-charger-parameters -- --source-dir <1200/weapon 参数目录>
pnpm data:import-remaining-parameters -- --source-dir <1200/weapon 参数目录>
pnpm data:import-salmon-ink-cycle -- --source-dir <1200 参数目录>
pnpm data:audit-battle-gaps
```

第三方授权标记为 `pending` 时，只能保留人工独立核对的数据和来源记录，不批量镜像上游数据库。新增正式参数必须记录来源、游戏版本和核对日期，并通过测试后才能在界面标为“已核对”。

“已核对”描述字段准确性，不代表 INKLAB 拥有第三方数据。当前参数采用逐字段人工核对与规范化记录；Leanny 已同意按 **Data provided by Lean** 并链接其仓库的方式使用所需数据。仓库仅保留当前产品需要的规范化武器目录、套装关系和核验字段，不包含完整上游数据库镜像。

账号、投稿和社区功能开放前，再评估把对应用户数据迁移到服务端 D1；配装草稿与 PNG 导出目前仍只保存在玩家本机。
