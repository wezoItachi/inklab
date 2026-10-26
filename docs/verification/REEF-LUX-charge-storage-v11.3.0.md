# REEF-LUX 450 储存蓄力核对（Ver. 11.3.0）

- 核对日期：2026-10-26
- 官方来源：<https://www.nintendo.com/jp/ichikara/av5ja/index_en.html>
- 适用参数类：`WeaponStringerShort.game__GameParameterTable.json`
- 适用套装：REEF-LUX 450、REEF-LUX 450 Deco、同参数类的复制武器

Nintendo 的 REEF-LUX 450 入门说明明确说明该武器支持 Charge Storage。因此 INKLAB 将该参数类的 `canStoreCharge` 记录为 `true`，不再因 11.3.0 参数文件省略 `IsEnableChargeKeep` 而保持待验证。

该说明没有明确写出一次发射的箭数，所以 `projectileCount` 仍保持待验证；本次核对不从“缩小版 Tri-Stringer”的描述推断三箭。
