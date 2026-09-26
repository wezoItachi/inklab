import {
  getMainWeaponParameters,
  summarizeMainWeaponParameters,
} from '@/lib/weapons';
import { verificationStatusLabels } from '@/lib/weapon-parameter-status';

export function MainWeaponParameterAudit({ weaponId }: { weaponId: string }) {
  const record = getMainWeaponParameters(weaponId);
  const summary = summarizeMainWeaponParameters(weaponId);
  const hasPendingParameters = summary.pending > 0;

  if (process.env.NODE_ENV === 'production') {
    return hasPendingParameters ? (
      <p className="parameter-public-note">
        部分主武器参数仍在核验中，暂不提供精确攻略结论。
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
          {summary.verified}/{summary.total} 已核对
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
              {parameter.value === null ? '待录入' : String(parameter.value)}
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
