import {
  getMainWeaponParameters,
  summarizeMainWeaponParameters,
} from '@/lib/weapons';
import { getWeaponVerificationRouteSummary } from '@/lib/battle-verification-queue';
import { verificationStatusLabels } from '@/lib/weapon-parameter-status';

export function MainWeaponParameterAudit({ weaponId }: { weaponId: string }) {
  const record = getMainWeaponParameters(weaponId);
  const summary = summarizeMainWeaponParameters(weaponId);
  const hasPendingParameters = summary.pending > 0;
  const applicableTotal = summary.total - summary['not-applicable'];
  const verifiedPercent =
    applicableTotal === 0
      ? 100
      : Math.round((summary.verified / applicableTotal) * 100);
  const verificationRoutes = getWeaponVerificationRouteSummary(weaponId);
  const coveragePanel = hasPendingParameters ? (
    <section className="parameter-public-audit" aria-label="主武器参数核验进度">
      <header>
        <span>
          <b>主武参数覆盖</b>
          <small>
            {summary.verified}/{applicableTotal} 项已核对
          </small>
        </span>
        <strong>{verifiedPercent}%</strong>
      </header>
      <progress
        className="parameter-coverage-track"
        aria-label="主武参数已核对比例"
        value={verifiedPercent}
        max={100}
      />
      <p>
        仍有 {summary.pending} 项待验证
        {summary['not-applicable'] > 0
          ? `；另有 ${summary['not-applicable']} 项机制不适用`
          : ''}
        。待验证字段不用于精确攻略结论。
      </p>
      {verificationRoutes.breakdown.length > 0 ? (
        <details>
          <summary>
            查看剩余证据路线
            <em>{verificationRoutes.total} 项</em>
          </summary>
          <div className="parameter-route-list">
            {verificationRoutes.breakdown.map((route) => (
              <article key={route.category}>
                <span>
                  <b>{route.label}</b>
                  <em>×{route.count}</em>
                </span>
                <p>{route.note}</p>
              </article>
            ))}
          </div>
        </details>
      ) : null}
    </section>
  ) : null;

  if (process.env.NODE_ENV === 'production') {
    return coveragePanel;
  }

  return (
    <>
      {coveragePanel}
      <details className="parameter-audit">
        <summary>
          <span>
            <b>主武器参数核验表</b>
            <small>开发者诊断 · 正式构建隐藏完整表格</small>
          </span>
          <em>
            {summary.verified}/{applicableTotal} 已核对 · {verifiedPercent}%
            {summary['not-applicable'] > 0
              ? ` · ${summary['not-applicable']} 不适用`
              : ''}
          </em>
        </summary>
        <div className="parameter-audit-table">
          {record.parameters.map((parameter) => (
            <div
              className={`parameter-audit-row ${parameter.status}`}
              key={parameter.key}
            >
              <span>
                <b>{parameter.label}</b>
                <code>{parameter.key}</code>
              </span>
              <strong>
                {parameter.status === 'not-applicable'
                  ? '不适用'
                  : parameter.value === null
                    ? '待录入'
                    : String(parameter.value)}
              </strong>
              <small>{parameter.unit ?? '—'}</small>
              <em>{verificationStatusLabels[parameter.status]}</em>
              <p>{parameter.note}</p>
            </div>
          ))}
        </div>
      </details>
    </>
  );
}
