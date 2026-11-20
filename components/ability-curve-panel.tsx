import {
  getAbilityCurveDefinition,
  getAbilityCurveSample,
} from '@/lib/ability-curves';

const samplePoints = [0, 3, 10, 20, 30, 57] as const;

export function AbilityCurvePanel({ abilityId }: { abilityId: string }) {
  const curve = getAbilityCurveDefinition(abilityId);

  if (curve.status === 'not-applicable') {
    return (
      <section className="ability-curve ability-curve-fixed">
        <div className="ability-curve-head">
          <div>
            <small>FIXED ABILITY / 固定能力</small>
            <h3>{curve.title}</h3>
          </div>
          <span>{curve.formulaLabel}</span>
        </div>
        <p>{curve.sourceNote}</p>
      </section>
    );
  }

  if (curve.status === 'pending') {
    return (
      <section className="ability-curve ability-curve-pending">
        <div className="ability-curve-head">
          <div>
            <small>AP CURVE / 待核验</small>
            <h3>{curve.title}</h3>
          </div>
          <span>不输出数值</span>
        </div>
        <p>{curve.sourceNote}</p>
      </section>
    );
  }

  const samples = samplePoints.flatMap((ap) => {
    const sample = getAbilityCurveSample(abilityId, ap);
    return sample ? [sample] : [];
  });

  return (
    <section className="ability-curve">
      <div className="ability-curve-head">
        <div>
          <small>AP CURVE / 已核对</small>
          <h3>{curve.title}</h3>
        </div>
        <span>{curve.formulaLabel}</span>
      </div>
      <div className="ability-curve-bars" aria-label="AP 效果曲线取样">
        {samples.map((sample) => (
          <div key={sample.ap}>
            <i
              style={{
                height: `${Math.max(4, sample.benefitPercent * 1.55)}px`,
              }}
            />
            <b>{sample.benefitPercent.toFixed(1)}%</b>
            <small>{sample.ap}AP</small>
          </div>
        ))}
      </div>
      <div className="ability-curve-rule">
        <b>本站最小有效值：{curve.minimumEffectiveAp}AP</b>
        <p>{curve.minimumEffectiveRule}</p>
      </div>
      <p className="ability-curve-note">
        {curve.sourceNote}
        {curve.thresholdScope === 'weapon-specific'
          ? ' 完整动作次数等关键临界点需结合具体武器，统一在实验室计算。'
          : ''}
      </p>
    </section>
  );
}
