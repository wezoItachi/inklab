import {
  COMMUNITY_SAMPLE_THRESHOLDS,
  getCommunitySampleSummary,
} from '@/lib/community-samples';

export function CommunitySamplePanel({ weaponId }: { weaponId: string }) {
  const summary = getCommunitySampleSummary(weaponId);
  const progress = Math.min(
    100,
    (summary.uniquePlayerCount / COMMUNITY_SAMPLE_THRESHOLDS.preview) * 100,
  );

  return <section className="community-sample-panel">
    <div className="community-sample-head"><div><b>玩家样本尚未开放</b><span>{summary.uniquePlayerCount} 位不同玩家 · {summary.sampleCount} 份有效配装</span></div><em>{summary.uniquePlayerCount} / {COMMUNITY_SAMPLE_THRESHOLDS.preview}</em></div>
    <div className="community-sample-progress"><i style={{width:`${progress}%`}}/></div>
    <p>达到 20 位不同玩家后显示“早期样本”。未来会按相似 AP 结构聚类，再提取最多 3 套代表模板，而不是直接挑三份投稿。</p>
    <div className="community-template-slots">{[1,2,3].map(index=><div key={index}><b>0{index}</b><span><strong>社区模板待形成</strong><small>需要足够的同版本有效样本</small></span></div>)}</div>
    <div className="community-thresholds"><span><b>20+</b>早期样本</span><span><b>50+</b>常见方向</span><span><b>100+</b>稳定样本</span></div>
    <small>外部样本与 INKLAB 内测样本会分别记录来源，不与系统建议混合计数。</small>
  </section>;
}
