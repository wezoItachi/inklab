'use client';

import { useState, type ReactNode } from 'react';
import { Check, Footprints, Layers, Lock, Plus } from 'lucide-react';

const planningWeapons = [
  {
    id: 'zap',
    name: 'N-ZAP89',
    role: '副武压制',
    accent: '#f1c40f',
    needs: ['副省 12AP', '游速 6AP', '快跳 3AP'],
  },
  {
    id: 'shot',
    name: '斯普拉射击枪',
    role: '前线泛用',
    accent: '#8b5cf6',
    needs: ['游速 6AP', '快跳 3AP', '安全鞋 3AP'],
  },
  {
    id: 'leaf',
    name: '枫叶射击枪',
    role: '骚扰续航',
    accent: '#22c55e',
    needs: ['副省 9AP', '游速 6AP', '快跳 3AP'],
  },
];
export function UniversalPlanner() {
  const [chosen, setChosen] = useState(['zap', 'shot', 'leaf']),
    [goal, setGoal] = useState('省碎片'),
    [applied, setApplied] = useState(false);
  const toggle = (id: string) =>
    setChosen((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  return (
    <section className="workspace planner-page">
      <div className="intro">
        <div>
          <em>SHARED GEAR / 002</em>
          <h1>多武器通用装备规划</h1>
          <p>把共同需求放进同一件装备，减少重复制作和能力碎片消耗。</p>
        </div>
        <span className="version-pill">规划草案 · 3把武器</span>
      </div>
      <div className="planner-grid">
        <section className="planner-controls">
          <Title n="01" text="选择你常用的配装">
            <button type="button">
              <Plus size={14} />
              添加武器
            </button>
          </Title>
          <div className="weapon-list">
            {planningWeapons.map((w, i) => (
              <button
                type="button"
                key={w.id}
                className={chosen.includes(w.id) ? 'selected' : ''}
                onClick={() => toggle(w.id)}
              >
                <span className="weapon-dot" style={{ background: w.accent }}>
                  {i === 0 ? '89' : i === 1 ? '枪' : '叶'}
                </span>
                <div>
                  <b>{w.name}</b>
                  <small>{w.role}</small>
                  <em>{w.needs.join(' · ')}</em>
                </div>
                <span className="tick">
                  {chosen.includes(w.id) ? (
                    <Check size={14} />
                  ) : (
                    <Plus size={14} />
                  )}
                </span>
              </button>
            ))}
          </div>
          <Title n="02" text="这次优先考虑什么">
            <small>可随时重新计算</small>
          </Title>
          <div className="goal-pills">
            {['省碎片', '最少妥协', '容易购买'].map((x) => (
              <button
                type="button"
                className={goal === x ? 'active' : ''}
                onClick={() => setGoal(x)}
                key={x}
              >
                {x}
              </button>
            ))}
          </div>
          <Title n="03" text="固定条件">
            <small>锁定后不会被方案替换</small>
          </Title>
          <div className="locks">
            <button type="button" className="on">
              <Lock size={14} />
              <span>
                <b>头部与服装保持可变</b>
                <small>允许不同武器使用专属大技能</small>
              </span>
            </button>
            <button type="button">
              <Lock size={14} />
              <span>
                <b>至少保留 3AP 快跳</b>
                <small>作为所有前线配装的安全垫</small>
              </span>
            </button>
          </div>
        </section>
        <aside className="planner-result">
          <div className="result-kicker">RECOMMENDATION / {goal}</div>
          <div className="recommend-title">
            <div className="gear-symbol">
              <Footprints />
            </div>
            <div>
              <small>最适合固定为通用件</small>
              <h2>优先制作一双通用鞋</h2>
            </div>
            <b>匹配度 92%</b>
          </div>
          <div className="why-grid">
            <div>
              <span>共同需求</span>
              <b>游速 6AP</b>
              <b>快跳 3AP</b>
            </div>
            <div>
              <span>部位冲突</span>
              <b className="good">鞋子最低</b>
              <small>头、服装需要随玩法变化</small>
            </div>
            <div>
              <span>预计节省</span>
              <b className="big">≈ 36</b>
              <small>能力碎片 · 原型估算</small>
            </div>
          </div>
          <div className="decision">
            <h3>为什么是鞋子？</h3>
            <p>
              三套配装都需要少量游速和快跳；而头部可能在最后冲刺、回归之间切换，服装还要考虑隐游。把共同的小技能固定在鞋子，换武器时只需调整头和服装。
            </p>
            <div className="trade">
              <Check size={15} />
              <span>
                <b>N-ZAP89</b> 保留副武压制核心，鞋子负责通用机动
              </span>
            </div>
            <div className="trade">
              <Check size={15} />
              <span>
                <b>斯普拉射击枪</b> 无需重复制作 6AP 游速
              </span>
            </div>
            <div className="trade">
              <Check size={15} />
              <span>
                <b>枫叶射击枪</b> 只需在头、服装补足副省
              </span>
            </div>
          </div>
          <h3 className="candidate-title">
            装备参考 <small>根据原始大技能与改造成本排序</small>
          </h3>
          <div className="gear-candidates">
            <button type="button" className="best">
              <span className="shoe-art">鞋</span>
              <div>
                <b>通用鞋胚 A</b>
                <small>原始大技能：隐形跳跃</small>
                <em>推荐 · 只需制作 3 个小槽</em>
              </div>
              <Check />
            </button>
            <button type="button">
              <span className="shoe-art alt">鞋</span>
              <div>
                <b>通用鞋胚 B</b>
                <small>原始大技能：受身术</small>
                <em>备选 · 适合回场倾向</em>
              </div>
              <Plus />
            </button>
          </div>
          <button
            type="button"
            className="primary plan-action"
            onClick={() => setApplied(true)}
          >
            {applied ? <Check size={16} /> : <Layers size={16} />}{' '}
            {applied ? '已保存为实验分支' : '用此鞋生成三套实验分支'}
          </button>
          <p className="note">
            装备名称与碎片成本暂为交互示例，正式版将绑定玩家库存与版本数据。
          </p>
        </aside>
      </div>
    </section>
  );
}

function Title({
  n,
  text,
  children,
}: {
  n: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <div className="title">
      <div>
        <span>{n}</span>
        <h3>{text}</h3>
      </div>
      {children}
    </div>
  );
}
