import { analyzeMainWeaponEfficiency } from '@/lib/main-weapon-analysis';
import { getMainWeaponParameters } from '@/lib/weapons';

export function MainWeaponEfficiencyPanel({ weaponId }: { weaponId: string }) {
  const analysis = analyzeMainWeaponEfficiency(
    getMainWeaponParameters(weaponId),
  );

  return (
    <details className="main-efficiency-panel" open={analysis !== null}>
      <summary>
        <span>主要武器效率与射击数</span>
        <b>
          {analysis
            ? `${analysis.verifiedInputCount}/3 核心字段 · 100 HP`
            : '参数待验证'}
        </b>
      </summary>
      {analysis ? (
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
              <strong>
                {analysis.splatTimeSeconds?.toFixed(2) ?? '待验证'}
              </strong>
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
      ) : (
        <div className="main-efficiency-pending">
          伤害、射击间隔或单发耗墨至少核对一项后，才会显示对应计算。
        </div>
      )}
    </details>
  );
}
