import {
  analyzeChargerEfficiency,
  analyzeMainWeaponEfficiency,
  analyzeRollerEfficiency,
  analyzeSpinnerEfficiency,
  type ChargerEfficiency,
  type MainWeaponEfficiency,
  type RollerEfficiency,
  type SpinnerEfficiency,
} from '@/lib/main-weapon-analysis';
import { getMainWeaponParameters } from '@/lib/weapons';

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
      </div>
      <p>
        按 60 帧和 100 HP
        目标计算；时间从第一发命中/射出计至最后一发，未计入瞄准、弹道飞行、伤害衰减、墨水回复或主武器省墨能力。
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
          <small>满墨挥击次数</small>
          <strong>{analysis.swingsPerTank ?? '待验证'}</strong>
          <em>
            {analysis.inkConsumptionPerSwing?.toFixed(1) ?? '待验证'}% / 次
          </em>
        </span>
        <span>
          <small>完整横挥间隔</small>
          <strong>{analysis.horizontalSwingFrames ?? '待验证'}</strong>
          <em>帧</em>
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
        滚动普通 / 加速速度为 {analysis.rollSpeedNormal ?? '待验证'} /{' '}
        {analysis.rollSpeedDash ?? '待验证'}
        （内部单位）。伤害只表示近距离最高值；滚动时长按 60 帧及每帧 0.02%–0.1%
        的耗墨范围推算，未计入起手挥击、墨水回复或主武器省墨能力。
      </p>
    </div>
  );
}

function SpinnerContent({ analysis }: { analysis: SpinnerEfficiency }) {
  return (
    <div className="main-efficiency-content">
      <div className="main-efficiency-grid">
        <span>
          <small>满蓄力伤害</small>
          <strong>{analysis.damagePerShot ?? '待验证'}</strong>
          <em>{analysis.shotsToSplat ?? '待验证'} 发击倒</em>
        </span>
        <span>
          <small>满蓄力时间</small>
          <strong>{analysis.fullChargeSeconds?.toFixed(2) ?? '待验证'}</strong>
          <em>秒 · {analysis.fullChargeFrames ?? '待验证'} 帧</em>
        </span>
        <span>
          <small>持续射击窗口</small>
          <strong>
            {analysis.firingDurationSeconds?.toFixed(2) ?? '待验证'}
          </strong>
          <em>秒 · {analysis.firingDurationFrames ?? '待验证'} 帧</em>
        </span>
        <span>
          <small>满蓄力射击数</small>
          <strong>{analysis.shotsPerFullCharge ?? '待验证'}</strong>
          <em>{analysis.fireIntervalFrames ?? '待验证'} 帧 / 发</em>
        </span>
        <span>
          <small>满墨蓄力次数</small>
          <strong>{analysis.fullChargesPerTank ?? '待验证'}</strong>
          <em>{analysis.inkConsumptionPerCharge ?? '待验证'}% / 次</em>
        </span>
        <span>
          <small>理论击倒时间</small>
          <strong>{analysis.splatTimeSeconds?.toFixed(2) ?? '待验证'}</strong>
          <em>秒 · {analysis.splatTimeFrames ?? '待验证'} 帧</em>
        </span>
      </div>
      <p>
        满蓄力定义为连续完成 48 帧第一阶段与 72 帧第二阶段；按 60 帧和 100 HP
        目标计算。40 发仅由 160 帧窗口可被 4
        帧间隔整除推导；参数文件未定义首发帧与端点，仍待实机验证。结果未计入蓄力中断、伤害衰减、弹道飞行、墨水回复或主武器省墨能力。
      </p>
    </div>
  );
}

export function MainWeaponEfficiencyPanel({ weaponId }: { weaponId: string }) {
  const record = getMainWeaponParameters(weaponId);
  const spinnerAnalysis = analyzeSpinnerEfficiency(record);
  const shooterAnalysis = spinnerAnalysis
    ? null
    : analyzeMainWeaponEfficiency(record);
  const chargerAnalysis = analyzeChargerEfficiency(record);
  const rollerAnalysis = analyzeRollerEfficiency(record);
  const analysis =
    spinnerAnalysis ?? shooterAnalysis ?? chargerAnalysis ?? rollerAnalysis;
  const verifiedInputCount =
    spinnerAnalysis?.verifiedInputCount ??
    shooterAnalysis?.verifiedInputCount ??
    chargerAnalysis?.verifiedInputCount ??
    rollerAnalysis?.verifiedInputCount;
  const coreInputCount = spinnerAnalysis
    ? 5
    : shooterAnalysis
      ? 3
      : chargerAnalysis
        ? 6
        : 9;

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
      ) : chargerAnalysis ? (
        <ChargerContent analysis={chargerAnalysis} />
      ) : rollerAnalysis ? (
        <RollerContent analysis={rollerAnalysis} />
      ) : (
        <div className="main-efficiency-pending">
          核心参数至少核对一项后，才会显示对应计算。
        </div>
      )}
    </details>
  );
}
