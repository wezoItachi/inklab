# INKLAB 本地数据仓库

这里是网站内置、可版本控制的数据源，不是账号或社区数据库。

- `manifest.json`：数据版本、文件索引与授权沟通状态。
- `sources.json`：来源、核对日期与使用状态。
- `main-weapons.v11.3.0.json`：174 把对战主武器的身份、类别与定位。
- `main-weapon-parameters.v11.3.0.json`：按武器类别定义的主武器参数字段与核验状态。
- `sub-weapons.v11.3.0.json`：副武器基础耗墨与副武增强语境。
- `special-weapons.v11.3.0.json`：特殊武器身份表。
- `weapon-kits.v11.3.0.json`：主武器与副武器、特殊武器的套装关系。
- `import-report.v11.3.0.json`：上游输入路径、文件哈希、导入日期与输出计数。
- `parameter-import-report.v11.3.0.json`：射击枪参数输入文件、固定提交、哈希与核验计数。
- `blaster-parameter-import-report.v11.3.0.json`：爆破枪参数输入文件、固定提交、哈希与核验计数。
- `roller-parameter-import-report.v11.3.0.json`：滚筒参数输入文件、固定提交、哈希与核验计数。
- `charger-parameter-import-report.v11.3.0.json`：蓄力枪参数输入文件、固定提交、哈希与核验计数。
- `remaining-family-parameter-import-report.v11.3.0.json`：画笔、泼桶、加特林、双枪、伞、弓和刮水刀的参数输入文件、固定提交、哈希与核验计数。
- `schema.ts`：数据结构与运行前校验。

全量目录由 `scripts/import-leanny-weapons.mjs` 离线生成。脚本需要显式传入包含 `WeaponInfoMain.json` 与 `CNzh.json` 的本地目录，例如：

```bash
pnpm data:import-weapons -- --source-dir <本地上游文件目录>
```

当前目录包含完整的 Ver. 11.3.0 武器身份与套装关系。全部 174 把对战武器都已按共享参数文件导入上游明确给出的字段，并至少含一个已核验主武字段；没有显式来源或含义仍有歧义的值继续保持 `pending`，不会借用同类武器的缺省值。副武器耗墨、增强对象和快速配装建议也只在已经核验时提供。

射击枪参数可通过以下命令重复生成；输入目录必须来自报告记录的固定提交：

```bash
pnpm data:import-shooter-parameters -- --source-dir <1130/weapon 参数目录>
pnpm data:import-blaster-parameters -- --source-dir <1130/weapon 参数目录>
pnpm data:import-roller-parameters -- --source-dir <1130/weapon 参数目录>
pnpm data:import-charger-parameters -- --source-dir <1130/weapon 参数目录>
pnpm data:import-remaining-parameters -- --source-dir <1130/weapon 参数目录>
```

第三方授权标记为 `pending` 时，只能保留人工独立核对的数据和来源记录，不批量镜像上游数据库。新增正式参数必须记录来源、游戏版本和核对日期，并通过测试后才能在界面标为“已核对”。

“已核对”描述字段准确性，不代表 INKLAB 拥有第三方数据。当前参数采用逐字段人工核对与规范化记录；Leanny 已同意按 **Data provided by Lean** 并链接其仓库的方式使用所需数据。仓库仅保留当前产品需要的规范化武器目录、套装关系和核验字段，不包含完整上游数据库镜像。

账号、投稿和社区功能开放前，再评估把对应用户数据迁移到服务端 D1；配装草稿与 PNG 导出目前仍只保存在玩家本机。
