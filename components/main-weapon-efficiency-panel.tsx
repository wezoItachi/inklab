import {
  analyzeBlasterEfficiency,
  analyzeBrushEfficiency,
  analyzeChargerEfficiency,
  analyzeMainWeaponEfficiency,
  analyzeManeuverEfficiency,
  analyzeRollerEfficiency,
  analyzeSaberEfficiency,
  analyzeShelterEfficiency,
  analyzeSlosherEfficiency,
  analyzeSpinnerEfficiency,
  analyzeStringerEfficiency,
  type BlasterEfficiency,
  type BrushEfficiency,
  type ChargerEfficiency,
  type MainWeaponEfficiency,
  type ManeuverEfficiency,
  type RollerEfficiency,
  type SaberEfficiency,
  type ShelterEfficiency,
  type SlosherEfficiency,
  type SpinnerEfficiency,
  type StringerEfficiency,
} from '@/lib/main-weapon-analysis';
import { getMainWeaponParameters, getWeapon } from '@/lib/weapons';

function ShooterContent({ analysis }: { analysis: MainWeaponEfficiency }) {
  return (
    <div className="main-efficiency-content">
      <div className="main-efficiency-grid">
        <span>
          <small>单发伤害</small>
          <strong>{analysis.damagePerShot ?? '待验证'}</strong>
          <em>damage</em>
        </span>
        <span>
          <small>满墨射击数</small>
          <strong>{analysis.shotsPerFullTank ?? '待验证'}</strong>
          <em>发</em>
        </span>
        <span>
          <small>满墨射击窗口</small>
          <strong>
            {analysis.fullTankFiringWindowSeconds?.toFixed(2) ?? '待验证'}
          </strong>
          <em>秒</em>
        </span>
        <span>
          <small>击倒所需</small>
          <strong>{analysis.shotsToSplat ?? '待验证'}</strong>
          <em>
            发 ·{' '}
            {analysis.inkConsumptionPerSplat === null
              ? '耗墨待验证'
              : `${analysis.inkConsumptionPerSplat.toFixed(1)}% 墨`}
          </em>
        </span>
        <span>
          <small>理论击倒时间</small>
          <strong>{analysis.splatTimeSeconds?.toFixed(2) ?? '待验证'}</strong>
          <em>
            秒 ·{' '}
            {analysis.splatTimeFrames === null
              ? '射击间隔待验证'
              : `${analysis.splatTimeFrames} 帧`}
          </em>
        </span>
        <span>
          <small>伤害衰减帧</small>
          <strong>
            {analysis.damageFalloffStartFrames ?? '待验证'} →{' '}
            {analysis.damageFalloffEndFrames ?? '待验证'}
          </strong>
          <em>开始衰减 / 到达最低伤害层</em>
        </span>
        <span>
          <small>弹丸初速</small>
          <strong>{analysis.projectileSpawnSpeed ?? '待验证'}</strong>
          <em>上游内部单位 · 未换算为射程</em>
        </span>
      </div>
      <p>
        按 60 帧和 100 HP
        目标计算；时间从第一发命中/射出计至最后一发，未计入瞄准、弹道飞行、伤害衰减、墨水回复或主武器省墨能力。衰减帧与初速是可核对的射程基础证据，但在完整运动阶段尚未积分前不冒充“有效射程”。
      </p>
    </div>
  );
}

function BlasterContent({ analysis }: { analysis: BlasterEfficiency }) {
  return (
    <div className="main-efficiency-content">
      <div className="main-efficiency-grid">
        <span>
          <small>直击伤害</small>
          <strong>{analysis.directHitDamage ?? '待验证'}</strong>
          <em>{analysis.directHitsToSplat ?? '待验证'} 发击倒</em>
        </span>
        <span>
          <small>近端爆风</small>
          <strong>{analysis.nearBlastDamage ?? '待验证'}</strong>
          <em>{analysis.nearBlastHitsToSplat ?? '待验证'} 发击倒</em>
        </span>
        <span>
          <small>远端爆风</small>
          <strong>{analysis.farBlastDamage ?? '待验证'}</strong>
          <em>{analysis.farBlastHitsToSplat ?? '待验证'} 发击倒</em>
        </span>
        <span>
          <small>爆炸发生</small>
          <strong>{analysis.burstFrame ?? '待验证'}</strong>
          <em>帧 · 文件显式值</em>
        </span>
        <span>
          <small>满墨射击数</small>
          <strong>{analysis.shotsPerFullTank ?? '待验证'}</strong>
          <em>{analysis.inkConsumptionPerShot ?? '待验证'}% / 发</em>
        </span>
        <span>
          <small>直击理论击倒时间</small>
          <strong>
            {analysis.directSplatTimeSeconds?.toFixed(2) ?? '待验证'}
          </strong>
          <em>秒 · {analysis.directSplatTimeFrames ?? '待验证'} 帧</em>
        </span>
      </div>
      <p>
        标准爆风曲线的近端 / 远端距离控制点为{' '}
        {analysis.nearBlastDistance ?? '待验证'} /{' '}
        {analysis.farBlastDistance ?? '待验证'}（内部单位）。伤害按 100 HP
        目标计算；距离控制点不直接等同于完整爆炸半径，S-BLAST
        的独立跳跃爆风参数另行展示，AP 曲线仍待验证。
      </p>
    </div>
  );
}

function ChargerContent({ analysis }: { analysis: ChargerEfficiency }) {
  return (
    <div className="main-efficiency-content">
      <div className="main-efficiency-grid">
        <span>
          <small>满蓄力伤害</small>
          <strong>{analysis.fullChargeDamage ?? '待验证'}</strong>
          <em>damage</em>
        </span>
        <span>
          <small>满墨蓄力次数</small>
          <strong>{analysis.fullChargesPerTank ?? '待验证'}</strong>
          <em>次</em>
        </span>
        <span>
          <small>满蓄力时间</small>
          <strong>{analysis.fullChargeFrames ?? '待验证'}</strong>
          <em>帧</em>
        </span>
        <span>
          <small>击倒所需</small>
          <strong>{analysis.shotsToSplat ?? '待验证'}</strong>
          <em>
            发 ·{' '}
            {analysis.inkConsumptionPerSplat === null
              ? '耗墨待验证'
              : `${analysis.inkConsumptionPerSplat.toFixed(1)}% 墨`}
          </em>
        </span>
        <span>
          <small>储存满蓄力</small>
          <strong>
            {analysis.chargeHold === null
              ? '待验证'
              : analysis.chargeHold
                ? '支持'
                : '不支持'}
          </strong>
          <em>
            {analysis.chargeHoldSeconds === null
              ? '窗口待验证'
              : `${analysis.chargeHoldSeconds.toFixed(2)} 秒 · ${analysis.chargeHoldFrames} 帧`}
          </em>
        </span>
      </div>
      <p>
        满蓄力弹道距离为 {analysis.fullChargeTravelDistance ?? '待验证'}
        （内部单位）。按 100 HP
        目标计算；未计入未满蓄力、蓄力移动、墨水回复或主武器省墨能力。
      </p>
    </div>
  );
}

function RollerContent({ analysis }: { analysis: RollerEfficiency }) {
  return (
    <div className="main-efficiency-content">
      <div className="main-efficiency-grid">
        <span>
          <small>横挥最大伤害</small>
          <strong>{analysis.horizontalSwingDamageMax ?? '待验证'}</strong>
          <em>{analysis.horizontalSwingsToSplat ?? '待验证'} 发击倒</em>
        </span>
        <span>
          <small>竖挥最大伤害</small>
          <strong>{analysis.verticalSwingDamageMax ?? '待验证'}</strong>
          <em>{analysis.verticalSwingsToSplat ?? '待验证'} 发击倒</em>
        </span>
        <span>
          <small>满墨横挥次数</small>
          <strong>{analysis.horizontalSwingsPerTank ?? '待验证'}</strong>
          <em>
            {analysis.horizontalInkConsumptionPerSwing?.toFixed(1) ?? '待验证'}%
            / 次
          </em>
        </span>
        <span>
          <small>完整横挥间隔</small>
          <strong>{analysis.horizontalSwingFrames ?? '待验证'}</strong>
          <em>
            帧 · 内部阶段 {analysis.horizontalSwingPhaseFrames ?? '待验证'} 帧
          </em>
        </span>
        <span>
          <small>满墨竖挥次数</small>
          <strong>{analysis.verticalSwingsPerTank ?? '待验证'}</strong>
          <em>
            {analysis.verticalInkConsumptionPerSwing?.toFixed(1) ?? '待验证'}% /
            次
          </em>
        </span>
        <span>
          <small>碾压最大伤害</small>
          <strong>{analysis.rollDamageMax ?? '待验证'}</strong>
          <em>{analysis.rollHitsToSplat ?? '待验证'} 次击倒</em>
        </span>
        <span>
          <small>满墨连续滚动</small>
          <strong>
            {analysis.rollDurationMinSeconds === null ||
            analysis.rollDurationMaxSeconds === null
              ? '待验证'
              : `${analysis.rollDurationMinSeconds.toFixed(2)}–${analysis.rollDurationMaxSeconds.toFixed(2)}`}
          </strong>
          <em>秒 · 随速度变化</em>
        </span>
      </div>
      <p>
        竖挥内部阶段为 {analysis.verticalSwingPhaseFrames ?? '待验证'}{' '}
        帧，完整连续竖挥间隔为 {analysis.verticalSwingFrames ?? '待验证'}
        。滚动普通 / 加速速度为 {analysis.rollSpeedNormal ?? '待验证'} /{' '}
        {analysis.rollSpeedDash ?? '待验证'}
        （内部单位）。伤害只表示近距离最高值；滚动时长按 60 帧及每帧{' '}
        {analysis.rollInkConsumptionMinPerFrame ?? '待验证'}%–
        {analysis.rollInkConsumptionMaxPerFrame ?? '待验证'}%
        的耗墨范围推算，未计入起手挥击、墨水回复或主武器省墨能力。
      </p>
    </div>
  );
}

function SpinnerContent({ analysis }: { analysis: SpinnerEfficiency }) {
  const rechargeLabel =
    analysis.canRecharge === null
      ? '续蓄待验证'
      : analysis.canRecharge
        ? '支持射击中续蓄'
        : '不支持射击中续蓄';
  const storeLabel =
    analysis.canStoreCharge === null
      ? '储存待验证'
      : analysis.canStoreCharge
        ? '支持储存蓄力'
        : '不支持储存蓄力';

  return (
    <div className="main-efficiency-content">
      <div className="main-efficiency-grid">
        <span>
          <small>单发伤害层级</small>
          <strong>
            {analysis.damagePerShot ?? '待验证'} /{' '}
            {analysis.standardMaximumDamagePerShot ?? '待验证'} /{' '}
            {analysis.minimumDamagePerShot ?? '待验证'}
          </strong>
          <em>满蓄力最大 / 通常最大 / 最低</em>
          <em>{analysis.shotsToSplat ?? '待验证'} 发满蓄力击倒</em>
        </span>
        <span>
          <small>分段蓄力时间</small>
          <strong>{analysis.fullChargeSeconds?.toFixed(2) ?? '待验证'}</strong>
          <em>秒 · {analysis.fullChargeFrames ?? '待验证'} 帧</em>
          <em>
            第一段 {analysis.firstChargeStageFrames ?? '待验证'} + 第二段{' '}
            {analysis.secondChargeStageFrames ?? '待验证'} 帧
          </em>
        </span>
        <span>
          <small>第一段射击窗口</small>
          <strong>
            {analysis.firstChargeFiringWindowFrames ?? '待验证'} 帧
          </strong>
          <em>可整除估算 {analysis.firstChargeShotsEstimate ?? '待验证'} 发</em>
        </span>
        <span>
          <small>满蓄力射击窗口</small>
          <strong>
            {analysis.firingDurationSeconds?.toFixed(2) ?? '待验证'}
          </strong>
          <em>秒 · {analysis.firingDurationFrames ?? '待验证'} 帧</em>
          <em>
            {analysis.fullChargeOverrideApplied
              ? '已采用满蓄力专用覆盖值'
              : '采用第二段配置值'}
          </em>
        </span>
        <span>
          <small>满蓄力输出窗口</small>
          <strong>{analysis.shotsPerFullCharge ?? '待验证'}</strong>
          <em>
            可整除估算发数 · {analysis.fireIntervalFrames ?? '待验证'} 帧 / 发
          </em>
          <em>
            窗口 DPS {analysis.fullChargeWindowDps?.toFixed(1) ?? '待验证'}
          </em>
        </span>
        <span>
          <small>满墨蓄力次数</small>
          <strong>{analysis.fullChargesPerTank ?? '待验证'}</strong>
          <em>{analysis.inkConsumptionPerCharge ?? '待验证'}% / 次</em>
        </span>
        <span>
          <small>满蓄力击倒窗口</small>
          <strong>{analysis.splatTimeSeconds?.toFixed(2) ?? '待验证'}</strong>
          <em>秒 · {analysis.splatTimeFrames ?? '待验证'} 帧</em>
        </span>
        <span>
          <small>动作与回墨</small>
          <strong>{analysis.inkRecoveryLockFrames ?? '待验证'} 帧回墨锁</strong>
          <em>射击后摇 {analysis.postDelayFrames ?? '待验证'} 帧</em>
          <em>
            移动速度：射击 {analysis.movementSpeedWhileFiring ?? '待验证'} /{' '}
            蓄力 {analysis.movementSpeedWhileCharging ?? '待验证'}
          </em>
        </span>
        <span>
          <small>蓄力机制</small>
          <strong>{rechargeLabel}</strong>
          <em>{storeLabel}</em>
          <em>
            储存时限{' '}
            {analysis.chargeHoldSeconds === null
              ? '待验证'
              : `${analysis.chargeHoldSeconds.toFixed(2)} 秒 · ${analysis.chargeHoldFrames} 帧`}
          </em>
        </span>
        {analysis.variableDamagePerShot !== null ||
        analysis.variableFireIntervalFrames !== null ? (
          <span>
            <small>圆珠笔可变射击状态</small>
            <strong>{analysis.variableDamagePerShot ?? '待验证'}</strong>
            <em>
              {analysis.variableFireIntervalFrames ?? '待验证'} 帧 / 发 ·{' '}
              {analysis.variableWindowDps?.toFixed(1) ?? '待验证'} 窗口 DPS
            </em>
            <em>
              {analysis.variableShotsToSplat ?? '待验证'} 发击倒 · 过渡{' '}
              {analysis.variableTransitionFrames ?? '待验证'} 帧
            </em>
            <em>
              射击移动速度{' '}
              {analysis.variableMovementSpeedWhileFiring ?? '待验证'}
            </em>
          </span>
        ) : null}
      </div>
      <p>
        每把加特林使用自己的两段蓄力和射击窗口，不再套用桶装旋转枪的固定数值。射击数只在窗口能被间隔整除时作为估算展示；参数文件没有明确首发与末端是否计入，因此不宣称为精确弹数。满蓄力覆盖状态、圆珠笔可变状态、续蓄和蓄力储存均分开处理。
      </p>
    </div>
  );
}

function StringerContent({ analysis }: { analysis: StringerEfficiency }) {
  const bestDpsLabel = analysis.stages.find(
    (stage) => stage.id === analysis.bestDirectDpsStage,
  )?.label;
  const fastestSplatLabel = analysis.stages.find(
    (stage) => stage.id === analysis.fastestSplatStage,
  )?.label;

  return (
    <div className="main-efficiency-content">
      <div className="main-efficiency-grid">
        {analysis.stages.map((stage) => (
          <span key={stage.id}>
            <small>{stage.label}</small>
            <strong>
              {stage.volleyDamage === null
                ? `${stage.arrowDamage ?? '待验证'} / 箭`
                : `${stage.volleyDamage} / 轮`}
            </strong>
            <em>
              {stage.directDps === null
                ? '整轮 DPS 待验证'
                : `${stage.directDps.toFixed(1)} 动作窗口 DPS`}
            </em>
            <em>
              100 HP：{stage.volleysToSplat ?? '待验证'} 轮 · 满墨{' '}
              {stage.volleysPerTank ?? '待验证'} 轮
            </em>
            <em>
              {stage.chargeFrames ?? '待验证'} 帧蓄力 +{' '}
              {analysis.postDelayFrames ?? '待验证'} 帧后摇
            </em>
          </span>
        ))}
        <span>
          <small>三档对照</small>
          <strong>{bestDpsLabel ?? '待验证'}</strong>
          <em>全箭命中时动作窗口 DPS 最高</em>
          <em>100 HP 动作预算最短：{fastestSplatLabel ?? '待验证'}</em>
        </span>
        <span>
          <small>箭矢爆炸</small>
          <strong>{analysis.detonationDamage ?? '待验证'}</strong>
          <em>{analysis.detonationFrames ?? '待验证'} 帧后触发</em>
          <em>
            蓄力储存：
            {analysis.canStoreCharge === null
              ? '待验证'
              : analysis.canStoreCharge
                ? '支持'
                : '不支持'}
          </em>
        </span>
      </div>
      <p>
        当前是可审计的机械动作窗口模型：单轮伤害只在箭数有明确来源时计算，并假设全部箭矢直击同一目标；DPS
        使用“蓄力帧 + 射击后摇”。它不是实战持续
        DPS，尚未计入瞄准、弹道、散射、爆炸、伤害衰减、墨水回复、AP
        或最后一轮命中后的实际取消时点。
      </p>
    </div>
  );
}

function ManeuverContent({ analysis }: { analysis: ManeuverEfficiency }) {
  return (
    <div className="main-efficiency-content">
      <div className="main-efficiency-grid">
        <span>
          <small>普通射击</small>
          <strong>{analysis.normal.damagePerShot ?? '待验证'}</strong>
          <em>
            {analysis.normal.fireIntervalFrames ?? '待验证'} 帧 / 发 ·{' '}
            {analysis.normal.directDps?.toFixed(1) ?? '待验证'} 窗口 DPS
          </em>
          <em>
            100 HP：{analysis.normal.shotsToSplat ?? '待验证'} 发 ·{' '}
            {analysis.normal.splatTimeSeconds?.toFixed(2) ?? '待验证'} 秒
          </em>
        </span>
        <span>
          <small>翻滚后定点射击</small>
          <strong>{analysis.postDodge.damagePerShot ?? '待验证'}</strong>
          <em>
            {analysis.postDodge.fireIntervalFrames ?? '待验证'} 帧 / 发 ·{' '}
            {analysis.postDodge.directDps?.toFixed(1) ?? '伤害待验证'} 窗口 DPS
          </em>
          <em>
            100 HP：{analysis.postDodge.shotsToSplat ?? '待验证'} 发 ·{' '}
            {analysis.postDodge.splatTimeSeconds?.toFixed(2) ?? '待验证'} 秒
          </em>
        </span>
        <span>
          <small>一箱墨水</small>
          <strong>{analysis.shotsPerFullTank ?? '待验证'}</strong>
          <em>{analysis.inkConsumptionPerShot ?? '待验证'}% / 发</em>
          <em>先翻滚一次后：{analysis.shotsAfterOneDodge ?? '待验证'} 发</em>
        </span>
        <span>
          <small>一次翻滚成本</small>
          <strong>{analysis.dodgeInkConsumption ?? '待验证'}%</strong>
          <em>
            约等于 {analysis.dodgeEquivalentShots?.toFixed(2) ?? '待验证'}{' '}
            发耗墨
          </em>
          <em>
            移动 {analysis.dodgeMoveFrames ?? '待验证'} 帧 ·{' '}
            {analysis.dodgeMoveSeconds?.toFixed(2) ?? '待验证'} 秒
          </em>
        </span>
        <span>
          <small>扩散角对照</small>
          <strong>
            {analysis.normal.spreadDegrees ?? '待验证'}° /{' '}
            {analysis.postDodge.spreadDegrees ?? '待验证'}°
          </strong>
          <em>地面普通 / 翻滚后定点</em>
          <em>跳跃：{analysis.jumpShotSpreadDegrees ?? '待验证'}°</em>
        </span>
        <span>
          <small>射击移动速度</small>
          <strong>{analysis.movementSpeedWhileFiring ?? '待验证'}</strong>
          <em>上游内部单位 · 未叠加装备能力</em>
        </span>
      </div>
      <p>
        普通与翻滚后射击分开计算。翻滚后伤害只有参数文件显式提供
        DamageLapOverParam
        时才参与计算；缺省时不会复制普通伤害。翻滚后窗口不包含进入翻滚、硬直、连续翻滚限制或墨水回复，因此不是完整的“翻滚循环
        DPS”。
      </p>
    </div>
  );
}

function SaberContent({ analysis }: { analysis: SaberEfficiency }) {
  return (
    <div className="main-efficiency-content">
      <div className="main-efficiency-grid">
        <span>
          <small>横斩墨刃</small>
          <strong>{analysis.horizontal.projectileDamage ?? '待验证'}</strong>
          <em>
            {analysis.horizontal.projectileHitsToSplat ?? '待验证'} 次命中 100
            HP
          </em>
          <em>
            动作第 {analysis.horizontal.projectileReleaseFrame ?? '待验证'}{' '}
            帧释放
          </em>
        </span>
        <span>
          <small>横斩近身刀身</small>
          <strong>{analysis.horizontal.slashDamage ?? '待验证'}</strong>
          <em>
            {analysis.horizontal.slashHitsToSplat ?? '待验证'} 次命中 100 HP
          </em>
          <em>
            动作第 {analysis.horizontal.slashReleaseFrame ?? '待验证'} 帧判定
          </em>
        </span>
        <span>
          <small>蓄力斩墨刃</small>
          <strong>{analysis.charged.projectileDamage ?? '待验证'}</strong>
          <em>
            {analysis.charged.projectileHitsToSplat ?? '待验证'} 次命中 100 HP
          </em>
          <em>
            输入至释放{' '}
            {analysis.charged.inputToProjectileReleaseFrames ?? '待验证'} 帧
          </em>
        </span>
        <span>
          <small>蓄力斩近身刀身</small>
          <strong>{analysis.charged.slashDamage ?? '待验证'}</strong>
          <em>{analysis.charged.slashHitsToSplat ?? '待验证'} 次命中 100 HP</em>
          <em>
            输入至判定 {analysis.charged.inputToSlashReleaseFrames ?? '待验证'}{' '}
            帧
          </em>
        </span>
        <span>
          <small>满墨动作次数</small>
          <strong>
            {analysis.horizontal.actionsPerFullTank ?? '待验证'} /{' '}
            {analysis.charged.actionsPerFullTank ?? '待验证'}
          </strong>
          <em>横斩 / 满蓄力斩</em>
          <em>
            单次耗墨 {analysis.horizontal.inkConsumption ?? '待验证'}% /{' '}
            {analysis.charged.inkConsumption ?? '待验证'}%
          </em>
        </span>
        <span>
          <small>动作时间轴</small>
          <strong>
            {analysis.horizontal.swingFrames ?? '待验证'} /{' '}
            {analysis.charged.swingFrames ?? '待验证'} 帧
          </strong>
          <em>横斩阶段 / 蓄力斩阶段</em>
          <em>
            后摇 {analysis.horizontal.postDelayFrames ?? '待验证'} /{' '}
            {analysis.charged.postDelayFrames ?? '待验证'} 帧
          </em>
          <em>
            回墨锁 {analysis.horizontal.inkRecoveryLockFrames ?? '待验证'} /{' '}
            {analysis.charged.inkRecoveryLockFrames ?? '待验证'} 帧
          </em>
        </span>
      </div>
      <p>
        四种命中形态独立展示，近身刀身伤害不会与墨刃伤害自动相加。蓄力“输入至释放”只由满蓄力时间加对应释放帧得到；挥击阶段、后摇和回墨锁是同一动作时间轴中的不同控制字段，目前不相加生成连续挥击
        DPS。
      </p>
    </div>
  );
}

function ShelterContent({ analysis }: { analysis: ShelterEfficiency }) {
  const launchState =
    analysis.canLaunchCanopy === null
      ? '待验证'
      : analysis.canLaunchCanopy
        ? '支持发射'
        : '不可发射';

  return (
    <div className="main-efficiency-content">
      <div className="main-efficiency-grid">
        <span>
          <small>单次射击伤害上限</small>
          <strong>{analysis.effectiveTotalDamageCap ?? '待验证'}</strong>
          <em>{analysis.shotsToSplatAtCap ?? '待验证'} 发击倒 100 HP</em>
          <em>
            单颗最高 {analysis.maximumPelletDamage ?? '待验证'} ·{' '}
            {analysis.pelletCount ?? '待验证'} 颗
          </em>
        </span>
        <span>
          <small>满墨射击数</small>
          <strong>{analysis.shotsPerFullTank ?? '待验证'}</strong>
          <em>{analysis.inkConsumptionPerShot ?? '待验证'}% / 发</em>
          <em>射击移动速度 {analysis.movementSpeedWhileFiring ?? '待验证'}</em>
        </span>
        <span>
          <small>伞面发射</small>
          <strong>{launchState}</strong>
          {analysis.canLaunchCanopy === true ? (
            <>
              <em>
                耗墨 {analysis.canopyLaunchInkConsumption ?? '待验证'}% · 满墨{' '}
                {analysis.canopyLaunchesPerFullTank ?? '待验证'} 次
              </em>
              <em>发射阶段 {analysis.canopyLaunchFrames ?? '待验证'} 帧</em>
            </>
          ) : analysis.canLaunchCanopy === false ? (
            <em>0% 发射耗墨不表示可以免费发射</em>
          ) : (
            <em>上游省略布尔字段时不默认判定为支持</em>
          )}
        </span>
        <span>
          <small>开伞时间轴</small>
          <strong>
            {analysis.canopyChargeFrames ?? '待验证'} /{' '}
            {analysis.canopyOpenFrames ?? '待验证'} 帧
          </strong>
          <em>长按准备 / 伞面展开</em>
          <em>各阶段保持独立，不相加成完整动作周期</em>
        </span>
        <span>
          <small>伞面恢复</small>
          <strong>{analysis.canopyRecoveryFrames ?? '待验证'} 帧</strong>
          <em>
            {analysis.canopyRecoverySeconds?.toFixed(2) ?? '待验证'} 秒 · 耐久{' '}
            {analysis.canopyDurability ?? '待验证'}
          </em>
        </span>
        <span>
          <small>回墨锁</small>
          <strong>
            {analysis.shotInkRecoveryLockFrames ?? '待验证'} /{' '}
            {analysis.canopyShotInkRecoveryLockFrames ?? '待验证'} 帧
          </strong>
          <em>普通射击 / 伞面发射</em>
        </span>
      </div>
      <p>
        “有效总伤害上限”采用上游直接给出的单次射击封顶值，不把“最高单颗伤害 ×
        弹丸数”当作整轮伤害。开伞、发射、恢复和回墨锁是不同控制阶段；完整连续射击周期与有效射程仍待动作和弹道验证。
      </p>
    </div>
  );
}

function BrushContent({ analysis }: { analysis: BrushEfficiency }) {
  return (
    <div className="main-efficiency-content">
      <div className="main-efficiency-grid">
        <span>
          <small>挥击伤害区间</small>
          <strong>
            {analysis.maximumSwingDamage ?? '待验证'} /{' '}
            {analysis.minimumSwingDamage ?? '待验证'}
          </strong>
          <em>最大 / 最低单次命中</em>
          <em>
            100 HP：{analysis.maximumDamageHitsToSplat ?? '待验证'} /{' '}
            {analysis.minimumDamageHitsToSplat ?? '待验证'} 次命中
          </em>
        </span>
        <span>
          <small>满墨挥击数</small>
          <strong>{analysis.swingsPerFullTank ?? '待验证'}</strong>
          <em>{analysis.inkConsumptionPerSwing ?? '待验证'}% / 次</em>
        </span>
        <span>
          <small>连续挥击窗口</small>
          <strong>{analysis.swingRepeatFrames ?? '待验证'} 帧</strong>
          <em>
            最大伤害窗口 DPS：
            {analysis.maximumDamageRepeatWindowDps?.toFixed(1) ?? '待验证'}
          </em>
          <em>
            100 HP 窗口：
            {analysis.maximumDamageSplatWindowSeconds?.toFixed(2) ??
              '待验证'}{' '}
            秒
          </em>
        </span>
        <span>
          <small>挥击动作</small>
          <strong>{analysis.swingPhaseFrames ?? '待验证'} 帧</strong>
          <em>起手阶段；不与连续间隔直接相加</em>
          <em>回墨锁 {analysis.swingInkRecoveryLockFrames ?? '待验证'} 帧</em>
          <em>移动速度 {analysis.movementSpeedWhileSwinging ?? '待验证'}</em>
        </span>
        <span>
          <small>刷地接触</small>
          <strong>{analysis.brushContactDamage ?? '待验证'}</strong>
          <em>{analysis.contactHitsToSplat ?? '待验证'} 次接触击倒 100 HP</em>
          <em>刷地速度 {analysis.rollingSpeed ?? '待验证'}</em>
        </span>
        <span>
          <small>持续刷地预算</small>
          <strong>
            {analysis.fullTankRollingSeconds?.toFixed(2) ?? '待验证'} 秒
          </strong>
          <em>
            {analysis.rollingInkConsumptionPerFrame ?? '待验证'}% / 帧 ·{' '}
            {analysis.fullTankRollingFrames ?? '待验证'} 帧
          </em>
          <em>
            进入涂墨 {analysis.rollingPaintStartFrames ?? '待验证'} 帧 · 回墨锁{' '}
            {analysis.rollingInkRecoveryLockFrames ?? '待验证'} 帧
          </em>
        </span>
      </div>
      <p>
        挥击伤害是单次命中区间，不把多个墨滴相加成整次挥击总伤害。连续挥击窗口只在上游显式提供
        SwingRepeatFrame
        时计算，并假设每次都取得最大单次伤害；它不包含首次起手、距离衰减、散射、命中率或回墨过程，因此不是实战持续
        DPS。
      </p>
    </div>
  );
}

function SlosherContent({ analysis }: { analysis: SlosherEfficiency }) {
  return (
    <div className="main-efficiency-content">
      <div className="main-efficiency-grid">
        <span>
          <small>单个伤害单元</small>
          <strong>
            {analysis.maximumUnitDamage ?? '待验证'} /{' '}
            {analysis.minimumUnitDamage ?? '待验证'}
          </strong>
          <em>最大 / 最低伤害</em>
          <em>
            100 HP：{analysis.maximumUnitHitsToSplat ?? '待验证'} /{' '}
            {analysis.minimumUnitHitsToSplat ?? '待验证'} 次命中
          </em>
        </span>
        <span>
          <small>最大单元连续窗口</small>
          <strong>{analysis.fireIntervalFrames ?? '待验证'} 帧</strong>
          <em>
            窗口 DPS：{analysis.maximumUnitWindowDps?.toFixed(1) ?? '待验证'}
          </em>
          <em>
            100 HP：
            {analysis.maximumUnitSplatWindowSeconds?.toFixed(2) ??
              '待验证'} 秒
          </em>
        </span>
        <span>
          <small>满墨挥桶数</small>
          <strong>{analysis.swingsPerFullTank ?? '待验证'}</strong>
          <em>{analysis.inkConsumptionPerSwing ?? '待验证'}% / 次</em>
        </span>
        <span>
          <small>轨迹配置</small>
          <strong>{analysis.unitGroupCount ?? '待验证'} 组</strong>
          <em>最晚单元延迟 {analysis.maximumUnitDelayFrames ?? '待验证'} 帧</em>
          <em>组数不等同于可同时命中的弹体数</em>
        </span>
        <span>
          <small>挥桶动作</small>
          <strong>{analysis.swingLiftFrames ?? '待验证'} 帧抬桶</strong>
          <em>后摇 {analysis.postDelayFrames ?? '待验证'} 帧</em>
          <em>移动限制 {analysis.movementLimitFrames ?? '待验证'} 帧</em>
        </span>
        <span>
          <small>回墨与移动</small>
          <strong>{analysis.inkRecoveryLockFrames ?? '待验证'} 帧回墨锁</strong>
          <em>
            挥桶移动速度 {analysis.movementSpeedWhileSwinging ?? '待验证'}
          </em>
        </span>
        {analysis.blastDamage !== null ||
        analysis.blastDamageRadius !== null ? (
          <span>
            <small>爆炸泼桶独立爆风</small>
            <strong>{analysis.blastDamage ?? '待验证'}</strong>
            <em>{analysis.blastHitsToSplat ?? '待验证'} 次爆风击倒 100 HP</em>
            <em>伤害范围 {analysis.blastDamageRadius ?? '待验证'}</em>
          </span>
        ) : null}
      </div>
      <p>
        伤害结果按单个伤害单元计算，不把所有轨迹组、墨滴、泡澡泼桶反弹或爆炸泼桶直击与爆风默认相加。连续窗口使用显式
        RepeatFrame，并假设每次都取得同一最大单元伤害；抬桶、后摇、移动限制与回墨锁保持为独立控制字段。
      </p>
    </div>
  );
}

export function MainWeaponEfficiencyPanel({ weaponId }: { weaponId: string }) {
  const record = getMainWeaponParameters(weaponId);
  const family = getWeapon(weaponId).family;
  const spinnerAnalysis =
    family === '加特林' ? analyzeSpinnerEfficiency(record) : null;
  const shooterAnalysis =
    family === '射击枪' ? analyzeMainWeaponEfficiency(record) : null;
  const blasterAnalysis =
    family === '爆破枪' ? analyzeBlasterEfficiency(record) : null;
  const chargerAnalysis =
    family === '蓄力枪' ? analyzeChargerEfficiency(record) : null;
  const rollerAnalysis =
    family === '滚筒' ? analyzeRollerEfficiency(record) : null;
  const stringerAnalysis =
    family === '弓' ? analyzeStringerEfficiency(record) : null;
  const maneuverAnalysis =
    family === '双枪' ? analyzeManeuverEfficiency(record) : null;
  const saberAnalysis =
    family === '刮水刀' ? analyzeSaberEfficiency(record) : null;
  const shelterAnalysis =
    family === '伞' ? analyzeShelterEfficiency(record) : null;
  const brushAnalysis =
    family === '画笔' ? analyzeBrushEfficiency(record) : null;
  const slosherAnalysis =
    family === '泼桶' ? analyzeSlosherEfficiency(record) : null;
  const analysis =
    spinnerAnalysis ??
    shooterAnalysis ??
    blasterAnalysis ??
    chargerAnalysis ??
    rollerAnalysis ??
    stringerAnalysis ??
    maneuverAnalysis ??
    saberAnalysis ??
    shelterAnalysis ??
    brushAnalysis ??
    slosherAnalysis;
  const verifiedInputCount =
    spinnerAnalysis?.verifiedInputCount ??
    shooterAnalysis?.verifiedInputCount ??
    blasterAnalysis?.verifiedInputCount ??
    chargerAnalysis?.verifiedInputCount ??
    rollerAnalysis?.verifiedInputCount ??
    stringerAnalysis?.verifiedInputCount ??
    maneuverAnalysis?.verifiedInputCount ??
    saberAnalysis?.verifiedInputCount ??
    shelterAnalysis?.verifiedInputCount ??
    brushAnalysis?.verifiedInputCount ??
    slosherAnalysis?.verifiedInputCount;
  const coreInputCount = spinnerAnalysis
    ? 23
    : shooterAnalysis
      ? 6
      : blasterAnalysis
        ? 8
        : chargerAnalysis
          ? 6
          : rollerAnalysis
            ? 13
            : saberAnalysis
              ? 17
              : shelterAnalysis
                ? 14
                : brushAnalysis
                  ? 12
                  : slosherAnalysis
                    ? 13
                    : 11;

  return (
    <details className="main-efficiency-panel" open={analysis !== null}>
      <summary>
        <span>主要武器效率与射击数</span>
        <b>
          {analysis
            ? `${verifiedInputCount}/${coreInputCount} 核心字段 · 100 HP`
            : '参数待验证'}
        </b>
      </summary>
      {spinnerAnalysis ? (
        <SpinnerContent analysis={spinnerAnalysis} />
      ) : shooterAnalysis ? (
        <ShooterContent analysis={shooterAnalysis} />
      ) : blasterAnalysis ? (
        <BlasterContent analysis={blasterAnalysis} />
      ) : chargerAnalysis ? (
        <ChargerContent analysis={chargerAnalysis} />
      ) : rollerAnalysis ? (
        <RollerContent analysis={rollerAnalysis} />
      ) : stringerAnalysis ? (
        <StringerContent analysis={stringerAnalysis} />
      ) : maneuverAnalysis ? (
        <ManeuverContent analysis={maneuverAnalysis} />
      ) : saberAnalysis ? (
        <SaberContent analysis={saberAnalysis} />
      ) : shelterAnalysis ? (
        <ShelterContent analysis={shelterAnalysis} />
      ) : brushAnalysis ? (
        <BrushContent analysis={brushAnalysis} />
      ) : slosherAnalysis ? (
        <SlosherContent analysis={slosherAnalysis} />
      ) : (
        <div className="main-efficiency-pending">
          核心参数至少核对一项后，才会显示对应计算。
        </div>
      )}
    </details>
  );
}
