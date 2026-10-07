# INKLAB｜Splatoon 3 配装实验室

INKLAB 是一个面向《Splatoon 3》玩家的非官方配装研究工具，帮助玩家理解装备能力收益和配装取舍。它不只展示配装结果，也支持从现有方案出发继续比较、微调和规划通用装备。

> 当前项目处于公开源码预览准备阶段，Public Alpha 仍在开发中，网站尚未正式上线。部分数值和武器数据仅用于验证体验，不应作为正式游戏攻略使用。

## 项目维护者

- GitHub：[`wezoItachi`](https://github.com/wezoItachi)
- 项目仓库：[`wezoItachi/inklab`](https://github.com/wezoItachi/inklab)（公开源码预览准备中）

## 项目目标

- 用受控标签表达玩法，减少自由标题带来的翻译和审核成本。
- 把能力效果转换为与当前主武器、副武器和特殊武器相关的实际描述。
- 显示关键 AP 档位、边际收益和配装取舍。
- 从单套配装继续规划可跨武器使用的通用装备。
- 允许玩家把社区方案带回实验室继续微调，而不是只能照抄成品。

## 当前原型

- 单套配装分析与快速配装方向
- 26 种装备能力池
- 副武器实际影响说明样板
- 通用装备规划
- 标签式能力百科
- 玩家方案卡片样板
- 手柄／键鼠输入与鱿鱼滚行路径练习原型
- 本地版本化武器数据仓库与字段验证状态

开发更新记录见 [Changelog](CHANGELOG.md)。

## 本地运行

```bash
pnpm install
pnpm dev
```

启动后访问 `http://localhost:3000/`。

## 开发状态

当前正在完成只读 Public Alpha；账号、投稿、审核和社区统计计划在后续 Beta 阶段实现。当前数据仅覆盖六把代表武器，字段级“已核对 / 待验证 / 原型演示”状态以界面和核对记录为准。详情见 [路线图](docs/ROADMAP.md)。

## 数据、素材与版权

INKLAB 是非官方玩家工具，与 Nintendo 无隶属、授权或合作关系。Splatoon、游戏名称、游戏内图标和其他相关素材的商标与版权归 Nintendo 及相应权利人所有。详细来源和使用范围见 [数据与素材来源](docs/DATA_AND_ASSETS.md)。

武器参数上游来源为 [`Leanny/splat3`](https://github.com/Leanny/splat3)，按维护者要求标注：**Data provided by Lean**。INKLAB 仅维护当前功能所需的版本化字段与来源记录，不镜像完整上游数据库。

## 许可证

INKLAB 自有代码采用 [MIT License](LICENSE)。第三方数据、游戏图标及其他第三方素材不包含在 INKLAB 自有代码的 MIT 授权范围内，其来源和使用边界见 [数据与素材来源](docs/DATA_AND_ASSETS.md)。

提交问题或建议前，请阅读 [参与指南](CONTRIBUTING.md)。
