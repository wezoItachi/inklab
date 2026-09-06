import {type WeaponParameterSnapshot, verificationStatusLabels} from '@/lib/weapon-parameter-status';

export function ParameterStatusStrip({snapshot}: {snapshot: WeaponParameterSnapshot}) {
  return <section className="parameter-status" aria-label={`Ver. ${snapshot.gameVersion} 参数验证状态`}>
    <div className="parameter-status-head">
      <b>参数可信度</b>
      <span>游戏 {snapshot.gameVersion} · 上游结构化快照暂至 {snapshot.upstreamSnapshotVersion}</span>
    </div>
    <div className="parameter-status-fields">
      {snapshot.fields.map(field=><div className={`parameter-field ${field.status}`} key={field.label} title={field.note}>
        <span>{field.label}</span><b>{verificationStatusLabels[field.status]}</b>
      </div>)}
    </div>
  </section>;
}
