# Changelog

## Unreleased

- 完成第二条正式 AP 曲线“提升墨汁效率（次要武器）”：核对 14 种副武器的基础耗墨、Lv0–Lv4 曲线档位与运行时默认值，实验室按当前副武器和墨水槽容量计算单次耗墨、完整使用次数及下一临界点；能力百科展示 Lv2 标准档。同步把快速炸弹的旧 40% 记录纠正为 Ver. 12.0.0 显式值 45%。
- 让实验室“主武基础型”建议真正读取武器族与已复核的目录定位：前线、支援、中后卫和长射程方向会形成不同的可编辑起点；定位待验证的武器继续回退到族别模型，并明确不把对局胜率或玩家采用率冒充为系统证据。
- 将通用装备规划从三把写死武器、固定匹配率和虚构碎片成本的静态演示，升级为基于 174 把武器及现有系统建议的实时比较工具；支持同时选择 2–5 把武器，按共通槽、主能力冲突或已核验曲线排序三个装备部位，并明确区分完整通用装备与仅可复用的小技能模板。
- 统一单套实验室的能力状态：限定主能力不再显示“曲线待验证”，副武省墨与副武增强移除未经核验的 3/6/10/12AP 试投档位；主武省墨的正式曲线试算则明确标注只更新右侧结果、不会修改左侧 57AP 配装，并可一键恢复当前配装 AP。
- 建立能力百科与实验室共用的 AP 曲线协议：主武器省墨的公式、可装备 AP 点、来源状态和最小有效值现在只有一份定义；百科展示标准曲线与 3AP 判定依据，实验室继续按具体武器计算完整动作次数及下一临界点，未核验能力不生成数值，固定部位主能力则明确标为“AP 曲线不适用”。
- 将鲑鱼跑当期轮换从浏览器跨站直连升级为站内校验接口，增加五分钟共享缓存、最近成功结果的浏览器回退、数据更新时间与缓存状态提示；补齐 N-ZAP85、斯普拉旋转枪和 14 式竹筒枪·甲等英文日程名称匹配，不引入上游图片。
- 将当期鲑鱼跑地图与武器显示转换为 Leanny Ver. 12.0.0 已核对的官方简体中文名称，并显示本地时区的轮换起止时间；未知新名称继续保留上游原文。
- 从固定 Leanny Ver. 12.0.0 英文／简中语言表生成全部 63 把常规打工武器的轮换名称对照，替代只覆盖本期武器的手写别名，降低换班后无法自动带入的风险。
- 鲑鱼跑页面会按当前轮换结束时间自动重新读取日程，长时间打开页面时不再停留在上一班配置。
- 将首页实验室的五个占位分析区替换为由当前武器套装与已装备 AP 驱动的上下文分析，分别呈现次要武器、特殊武器、移动返场、生存抗性与其他能力；尚未核验的效果曲线继续明确标为待验证，不推算伪精确收益。
- 将非主武省墨能力的通用占位说明升级为能力语义面板，按当前 AP、实验分类、生效条件与作用对象解释配装；特殊武器增强会随当前套装联动，未核验曲线不输出推荐投入量。
- 接入 Ver. 12.0.0 完整对战武器图片集：174 张主武器、14 张副武器与 19 张特殊武器由首页套装卡联动显示；逐文件保存 Leanny 来源路径、字节数和 SHA-256，并保留缺图文字回退与 Nintendo 权利边界。
- 在共享武器选择弹窗中为对战目录显示真实主武器缩略图，同时保留文字徽标回退；搜索、武器族筛选、键盘导航与鲑鱼跑无图目录保持原有行为。
- 将主武器、副武器和特殊武器图片接入玩家方案卡片与本地配装 PNG；导出图保留图片来源署名，图片加载失败时仍使用文字徽标和既有配装信息完成导出。
- 修正真实武器图片与旧占位徽标叠加的问题：首页、玩家方案卡片和导出 PNG 仅在图片加载失败时显示占位徽标。
- 将鲑鱼跑的 AABC 职能重复码降为开发诊断，新增“优势编成／编成均衡／存在短板／高压编成”系统初评与冲分建议；为狂潮、烤架鱼进发、寻找金鲑鱼、走私鱼来袭、大胖鱼大量出现、雾、泥鲑鱼喷发和巨型龙卷风分别展示武器适配难度倾向及模型边界，并优先采用游戏内简体中文名称。
- 将当前游戏数据迁移到 Splatoon 3 Ver. 12.0.0：固定 Nintendo 更新公告与 Leanny 上游提交，重新导入 174 把对战武器和 71 把鲑鱼跑武器的来源字段，并保留 Ver. 11.3.0 历史快照。
- 接入 12.0.0 已能由现有模型表达的平衡变化，并新增射击枪涂墨半径、爆破枪玩家移动影响、滚筒横挥回墨锁及弓三档涂墨半径字段；尚未建模的副武器、特殊武器和特殊武器必要点数变化只记录在版本迁移说明中，不伪装成已实现。
- 将 12.0.0 的完整参数表从首页核心脚本拆到按需分析模块，首页脚本由约 1,013 kB 降至约 130 kB，并为三组参数模块增加分包回归检查。
- 将 React、React DOM 与 React Server Components 升级到 19.2.9，修复 `GHSA-xqc2-xf4c-x3h3` 报告的严重远程代码执行漏洞；生产依赖审计恢复为零已知漏洞。
- 将仅在 PVP 规划模式使用的通用装备规划拆为独立按需模块；为全部 Web 按钮补齐显式类型，并启用静态规则阻止意外表单提交回归。
- 移除玩家方案库中无实际行为的伪按钮语义，并将首页脚本体积预算进一步收紧至 980 kB / gzip 70 kB。
- 将玩家方案库和鱿鱼滚行练习器拆为独立按需模块，进入对应分区时才加载筛选数据、手柄轮询与轨迹逻辑；同时收紧首页脚本预算并增加两项分包回归检查。
- 将生产依赖漏洞审计加入每次质量检查，并启用 JavaScript／TypeScript CodeQL 扩展安全扫描与每周复查。
- 将间接依赖 `fast-uri` 与 `esbuild` 固定到已修复版本，清除 npm 生产依赖审计中的 2 条中危与 3 条低危告警。
- 为共享武器选择弹窗补齐焦点封闭、关闭后焦点恢复、方向键／Home／End 导航、搜索直达结果与背景滚动锁定。
- 为浏览器本地保存、分享链接复制、PNG 导出和鲑鱼跑日程读取增加可感知的成功／失败状态，不再把失败静默伪装成成功。
- 将鲑鱼跑实验室改为按需加载，未进入该分区时不再把整套打工分析代码放入首页首屏脚本。
- 公开检查固定项目 pnpm store 的工作区相对路径，防止依赖流程再次回退到磁盘根目录。
- 为五个 Web 分区增加稳定哈希地址与浏览器前进／后退同步，并把不可点击的“系统在线”伪按钮修正为只读状态。
- 修正能力百科中尚无数据支撑的筛选与通用阈值文案：未核验标签明确禁用，限定能力槽位说明按真实规则显示，并让“进入实验室”成为可用操作。
- 为所有 Web 分区增加本地错误边界；按需模块或页面渲染失败时提供明确说明与重新载入入口，且不上传错误详情。
- 为首页客户端脚本建立原始体积与 gzip 体积预算，并在 CI 中确认鲑鱼跑实验室仍保持独立按需模块。
- 将能力百科拆为独立按需模块，未进入百科分区时不加载其搜索、筛选与说明界面。
- 增加 GitHub Actions、Dependabot 与公开内容扫描器，公开源码前可自动检查测试、构建、敏感文件名和常见凭据／本机路径。
- 完成 2026-10-18 生产依赖漏洞与许可证复核，并记录旧 Git 历史仍需清理的本机路径阻塞项。
- 建立鲑鱼跑回墨／墨锁证据表：确认打工三角雷 70% 耗墨与继承的 60 帧墨锁，同时把普通回墨曲线的打工适用性和鱿鱼滚行回墨保持为待验证门禁。
- 将鲑鱼跑自由目标的 14 组生命值移入版本化数据表，固定到 Inkipedia 修订版并记录 Leanny 上游敌人内部身份；页面不再维护一份无来源的硬编码副本。
- 为全部 40 把射击枪接入伤害开始／结束衰减帧和弹丸初速，在实验室展示可审计的射程基础证据，同时继续把未经积分和定义的“有效射程”留作待验证。
- 建立全武器统一射程证据层：分开呈现射击枪衰减时间轴、爆破枪爆风控制点、蓄力枪满蓄力弹道和爆炸泼桶爆风范围，并为 174 把武器生成可重复的待验证／缺省继承审计报告。
- 完成全部 32 组缺省／继承候选的固定上游来源核对，覆盖 29 个参数文件和 244 次字段出现；仍无法由快照证明的运行时默认值继续保留待验证，不用同类常识补值。
- 将 28 把武器上 117 个依赖于不存在可选机制对象的数值字段明确标为“不适用”，把全库真实待验证字段从 452 个收敛到 335 个。
- 依据 Nintendo 官方 REEF-LUX 450 入门说明，将同参数类三套武器的储存蓄力能力转为已核验；全库剩余待验证字段进一步降至 332 个。
- 为剩余 332 次待验证字段生成可重复的证据队列，归并为 8 类、36 组任务；87 个上游省略字段已分流为逐帧、机制观察或标定测量路线，页面同时显示当前武器的主要待验证路线。
- 为 11 个武器族建立独立射程定义和受控测量协议，不把内部单位伪装成训练场格数；参数状态也不再把“部分已核对”误标为整体待验证。
- 为滚筒横挥／竖挥和伞连续主武射击的 39 个动作周期建立释放到释放的逐帧口径；实验室展示输入与排除条件，不再把内部动作阶段误称为完整周期。
- 生成轻量的逐武器待验证摘要供浏览器使用，完整证据队列继续留在仓库审计层，避免把大型队列 JSON 打进客户端。
- 为 9 个加特林续蓄和 6 个伞面发射省略开关建立正／负实机观察协议；实验室明确显示省略不等于 false 及失败结论的排除条件。

- 接入首条正式 AP 效果曲线：主武器省墨现在按当前武器的已核对基础耗墨计算倍率、满墨完整动作次数和下一个可实现临界点。

- Recorded Leanny's permission condition and added the required “Data provided by Lean” repository attribution in the app and project documentation.
- Recorded Sendouc's response permitting the requested 26-icon repository and website use without attribution to him, while preserving the separate Nintendo-rights boundary and `Leanny/splat3` source note.
- Adopted AGPL-3.0-only for INKLAB-owned code before the first public release, added an in-product source/license notice, and kept third-party data and assets outside that code license.
- Removed the archived starter UI files after validation; recovery remains available from `dev-2026-09-06`.
- Split the representative game data into versioned main-weapon, sub-weapon, special-weapon, and weapon-kit tables with cross-reference validation.
- Added tested editor restoration rules for URL-first loading, local fallback, custom builds, and weapon changes.
- Added the first-party main-weapon parameter schema for the six representative weapons; unverified values remain empty and explicitly pending.
- Added a development-only main-weapon parameter audit table; production keeps only a concise verification notice.
- Verified the first six N-ZAP89 fields against the fixed 11.3.0 upstream snapshot, with field-level provenance and normalization notes; effective range remains pending.
- Added a verified N-ZAP89 main-weapon efficiency panel for full-tank shots, firing duration, shots to splat, ink per splat, and theoretical splat time.
- Verified five explicit Splattershot fields and made the efficiency panel reveal partial results without guessing its omitted firing interval.
- Corrected the third representative shooter from a mismatched Neo Splash-o-matic identity to the base Splash-o-matic, migrated legacy saved IDs, and verified six explicit fields.
- Added partial Splat Charger analysis from five verified fields, including full-charge damage, tank efficiency, charge storage, and travel distance without guessing the omitted charge time.
- Added Splat Roller analysis from eight verified fields, preserving separate swing, rolling-damage, speed, and variable per-frame ink-consumption semantics.
- Completed the six-weapon representative verification loop with Heavy Splatling charge stages, firing window, repeat interval, ink consumption, and a dedicated analysis panel.
- Fixed narrow-screen analysis layouts so all primary pages remain within a 390 px viewport instead of pushing the analysis column off-screen.
- Pinned the pnpm version used by the existing install and added a reproducible type-check script.
- Replaced the static player-build mockup with a validated example library, search, share links, and one-click editing in the lab.
- Imported the complete 174-weapon Ver. 11.3.0 catalog with all 14 sub weapons, 19 special weapons, and kit relationships, preserving existing verified records and leaving untouched classes explicitly pending.
- Imported explicit source-backed fields for all 40 shooter weapons from 14 shared Ver. 11.3.0 parameter classes, while leaving omitted defaults and range definitions pending.
- Imported explicit fields for all 17 blasters from 7 shared parameter classes and added a dedicated direct-hit/blast analysis panel, including separate S-BLAST jump-blast provenance.
- Fixed full-catalog analysis routing so newly imported shooters cannot be rendered with charger, roller, or splatling terminology merely because their field names overlap.
- Imported explicit fields for all 14 rollers from 5 shared parameter classes, separating horizontal and vertical swing ink costs and keeping complete repeat intervals pending.
- Imported explicit fields for all 19 chargers from 8 shared parameter classes, preserving omitted charge-time and charge-storage defaults as pending instead of borrowing values across weapon classes.
- Imported explicit source-backed fields for the remaining 83 pending battle weapons across Brush, Slosher, Spinner, Maneuver, Shelter, Stringer, and Saber families; the 84 processed records include the previously reviewed Heavy Splatling, now normalized with its shared class.
- Audited all 174 battle-weapon display names against the fixed Simplified Chinese localization and an independent current catalog, then added import and test guards against placeholder or non-normalized names.
- Replaced the three global quick-build templates in the lab with deterministic per-weapon system suggestions for main, sub, and special directions, including visible evidence and an explicit boundary from future external and beta samples.
- Added a second-level recommendation source switch for system suggestions and future player samples, including honest empty states and 20/50/100 unique-player confidence thresholds.
- Reorganized the ability-fragment picker into gear-part tabs and ability-category filters, while hiding part-exclusive abilities from invalid gear and additional slots.
- Replaced weapon dropdowns with a shared searchable picker and added text-first weapon-kit presentation so unlicensed images can remain absent without blocking the interface.
- Added the 71-weapon Salmon Run laboratory, live rotation names, first three traceable `_Coop` DPS samples, synchronized/staggered refill models, and a custom-health target experiment with explicit model boundaries.
- Documented the work that can reach public-readiness without new images and separated future Lean data/image questions from community, platform, and Nintendo rights.
- Removed the unintended player-scheme rarity, brand, and equipped-ability facets while preserving the combined scheme-tag, battle-mode, and weapon filters.
- Confirmed Web-only as the permanent product scope: desktop and mobile browsers share one responsive site, with native apps, desktop wrappers, PWA packaging, and installers removed from the roadmap.
- Recorded the permanent free/open-source principle: future sponsorship may only support operating resources and will not unlock features, quotas, data access, ranking, or review privileges.
- Split Salmon Run pressure testing into verified theoretical-limit and explicit routine-action baselines, using Tri-Stringer's one-ring charge as the first nontrivial maximum-DPS case and excluding sub/special weapons.
- Removed the unverified two-second Salmon Run refill assumption from displayed results; target experiments now show fractional damage equivalents and real discrete action counts while sustained DPS waits for recovery and ink-lock verification.
- Added public-release, privacy, security, disclaimer, and design-language documentation for the Web-only open-source launch path.

## 2026-09-06 — Local Data & Export UI

- Added a version-controlled INKLAB data registry with provenance and authorization status.
- Moved weapon records out of the UI layer and added schema validation.
- Moved optional PNG metadata to a collapsible panel on the analysis side.
- Added custom loadout slot replacement, local autosave, and share links.
- Added local PNG export and parameter verification states.
- Added automated coverage for abilities, loadouts, weapon context, sharing, export, and motion input.
- Archived unused starter components without permanently deleting them.

## 2026-09-01 — Initial Prototype

- Added the first INKLAB laboratory, ability index, player build sample, and motion experiment.
