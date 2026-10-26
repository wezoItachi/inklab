import {
  getMainWeaponParameters,
  summarizeMainWeaponParameters,
} from '@/lib/weapons';
import { verificationStatusLabels } from '@/lib/weapon-parameter-status';

export function MainWeaponParameterAudit({ weaponId }: { weaponId: string }) {
  const record = getMainWeaponParameters(weaponId);
  const summary = summarizeMainWeaponParameters(weaponId);
  const hasPendingParameters = summary.pending > 0;
  const applicableTotal = summary.total - summary['not-applicable'];

  if (process.env.NODE_ENV === 'production') {
    return hasPendingParameters ? (
      <p className="parameter-public-note">
        主武参数已核验 {summary.verified}/{applicableTotal} 项，仍有{' '}
        {summary.pending} 项待验证
        {summary['not-applicable'] > 0
          ? `；另有 ${summary['not-applicable']} 项机制不适用`
          : ''}
        。待验证字段不用于精确攻略结论。
      </p>
    ) : null;
  }

  return (
    <details className="parameter-audit">
      <summary>
        <span>
          <b>主武器参数核验表</b>
          <small>开发者诊断 · 正式构建隐藏完整表格</small>
        </span>
        <em>
          {summary.verified}/{applicableTotal} 已核对
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
  );
}
