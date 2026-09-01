'use client';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {Check,Copy,Footprints,Gamepad2,Layers,Lock,Pause,Play,Plus,RotateCcw,Search,Shirt,Sparkles,TrendingUp,Zap} from 'lucide-react';
type A={id:string;name:string;short:string;group:string;color:string};
const abilities:A[]=[
['ssu','提升鱿鱼冲刺速度','游速','机动','#8B5CF6'],['rsu','提升人类移动速度','走速','机动','#14B8A6'],['qsj','缩短超级跳跃时间','快跳','机动','#38BDF8'],['ia','行动强化','行动','机动','#6366F1'],['ism','提升墨汁效率（主要武器）','主省','续航','#F97316'],['iss','提升墨汁效率（次要武器）','副省','续航','#F59E0B'],['iru','提升墨汁回复力','回墨','续航','#84CC16'],['subp','提升次要武器性能','副强','副武','#10B981'],['scu','提升特殊武器增加量','大招增','特殊','#EC4899'],['ss','降低特殊武器减少量','大招减','特殊','#F43F5E'],['spu','提升特殊武器性能','大招强','特殊','#D946EF'],['qr','缩短复活时间','复活','生存','#EF4444'],['inkres','减轻对手墨汁影响','粘脚','生存','#22C55E'],['subr','减轻次要武器影响','副防','生存','#06B6D4'],
['og','最初冲刺','开局','头部限定','#A3E635'],['lde','最后冲刺','末冲','头部限定','#FACC15'],['tenacity','逆境强化','逆境','头部限定','#FB923C'],['comeback','回归','回归','头部限定','#2DD4BF'],
['ninja','鱿鱼忍者','隐游','服装限定','#7C3AED'],['haunt','复仇','复仇','服装限定','#E11D48'],['thermal','热力墨汁','热墨','服装限定','#F97316'],['rp','提升复活惩罚','死惩','服装限定','#991B1B'],['doubler','追加装备能力增倍','倍增','服装限定','#65A30D'],
['stealth','隐身跳跃','隐跳','鞋子限定','#0EA5E9'],['object','提升对物体攻击力','对物','鞋子限定','#F59E0B'],['drop','受身术','受身','鞋子限定','#EC4899']
].map(([id,name,short,group,color])=>({id,name,short,group,color}));
const groups=['全部','机动','续航','副武','特殊','生存','头部限定','服装限定','鞋子限定'];
const abilityAliases:Record<string,string>={inkres:'安全鞋 粘脚 粘脚抗性',subr:'副防',subp:'副武增强 副强',ninja:'隐游',rp:'死惩',stealth:'隐跳',object:'对物',lde:'末冲',og:'开局强化'};
const abilityAssetCodes:Record<string,string>={ssu:'SSU',rsu:'RSU',qsj:'QSJ',ia:'IA',ism:'ISM',iss:'ISS',iru:'IRU',subp:'BRU',scu:'SCU',ss:'SS',spu:'SPU',qr:'QR',inkres:'RES',subr:'SRU',og:'OG',lde:'LDE',tenacity:'T',comeback:'CB',ninja:'NS',haunt:'H',thermal:'TI',rp:'RP',doubler:'AD',stealth:'SJ',object:'OS',drop:'DR'};
const presets=[
 {name:'前线缠斗',desc:'强调机动与快速返场',ids:['ssu','qsj','inkres'],slots:[['ssu',10],['ssu',3],['qsj',3],['inkres',3],['ism',10],['ism',3],['iru',3],['ssu',3],['qsj',10],['qsj',3],['subr',3],['ss',3]]},
 {name:'副武器压制',desc:'机器人双投关键配置',ids:['iss','iru','subr'],slots:[['iss',10],['iss',3],['iss',3],['iss',3],['iru',10],['iss',3],['iru',3],['subr',3],['qsj',10],['qsj',3],['inkres',3],['ss',3]]},
 {name:'大招循环',desc:'稳定积攒并保护大招槽',ids:['scu','ss','spu'],slots:[['scu',10],['scu',3],['ss',3],['qsj',3],['spu',10],['spu',3],['scu',3],['inkres',3],['qsj',10],['ss',3],['subr',3],['ssu',3]]}
] as const;
const initialSlots=presets[0].slots.map(x=>[...x]) as [string,number][];
function Icon({a,small=false}:{a?:A;small?:boolean}){const code=a?abilityAssetCodes[a.id]:undefined;return <span className={'ink-icon '+(small?'small':'')}>{code?<img src={`/assets/abilities/${code}.avif`} alt=""/>:a?.short.slice(0,1)||'+'}</span>}
export default function Home(){
 const[page,setPage]=useState<'lab'|'wiki'|'library'|'motion'>('lab'),[labMode,setLabMode]=useState<'planner'|'single'>('single');
 const[group,setGroup]=useState('全部'),[query,setQuery]=useState(''),[selected,setSelected]=useState(['ssu','qsj','inkres','ism']),[copied,setCopied]=useState(false);
 const[slots,setSlots]=useState<[string,number][]>(initialSlots),[focus,setFocus]=useState('iss'),[activePreset,setActivePreset]=useState(0);
 const filtered=abilities.filter(a=>(group==='全部'||a.group===group)&&(a.name.includes(query)||a.short.includes(query)||(abilityAliases[a.id]||'').includes(query)));
 const totals=useMemo(()=>{const m=new Map<string,number>();slots.forEach(([id,ap])=>m.set(id,(m.get(id)||0)+ap));return [...m].map(([id,ap])=>({a:abilities.find(x=>x.id===id),ap})).sort((a,b)=>b.ap-a.ap)},[slots]);
 const currentAp=totals.find(x=>x.a?.id===focus)?.ap||0;
 const applyPreset=(i:number)=>{setActivePreset(i);setSelected([...presets[i].ids]);setSlots(presets[i].slots.map(x=>[...x]) as [string,number][]);setFocus(presets[i].ids[0])};
 const toggle=(id:string)=>{setFocus(id);setSelected(s=>s.includes(id)?s:[...s,id])};
 const setSubAp=(id:string,ap:number)=>{const mains=slots.filter(x=>x[1]===10);const subs=slots.filter(x=>x[1]===3&&x[0]!==id);const count=Math.min(9,Math.round(ap/3));while(subs.length>9-count)subs.pop();while(subs.length<9-count)subs.push(['qsj',3]);setSlots([...mains,...subs,...Array.from({length:count},()=>[id,3] as [string,number])]);setSelected(s=>s.includes(id)?s:[...s,id])};
 return <main><header className="topbar"><div className="brand"><span>S3</span>INKLAB <b>配装实验室</b></div><nav><button className={page==='lab'?'active':''} onClick={()=>{setPage('lab');setLabMode('single')}}>实验室</button><button className={page==='wiki'?'active':''} onClick={()=>setPage('wiki')}>能力百科</button><button className={page==='library'?'active':''} onClick={()=>setPage('library')}>玩家方案</button><button className={page==='motion'?'active':''} onClick={()=>setPage('motion')}>操作实验</button></nav><button className="ghost"><Sparkles size={15}/> 原型模式</button></header>
 {page==='wiki'?<AbilityWiki focus={focus} setFocus={setFocus}/>:page==='library'?<SchemeLibrary/>:page==='motion'?<MotionLab/>:<>
 <div className="lab-switch"><button className={labMode==='single'?'active':''} onClick={()=>setLabMode('single')}><Zap size={15}/> 单套配装分析</button><button className={labMode==='planner'?'active':''} onClick={()=>setLabMode('planner')}><Layers size={15}/> 通用装备规划</button></div>
 {labMode==='planner'?<UniversalPlanner/>:<section className="workspace analyzer-workspace"><div className="intro"><div><em>WEAPON LAB / 001</em><h1>武器配装分析器</h1><p>左侧调整实验条件，右侧读取与当前武器绑定的实际收益。</p></div><button className="primary compact" onClick={()=>{setCopied(true);setTimeout(()=>setCopied(false),1400)}}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'已复制':'分享方案'}</button></div>
 <div className="layout analyzer-layout"><section className="builder control-column">
  <Title n="01" text="要分析的武器"><button><Search size={14}/>搜索</button></Title><div className="weapon"><div className="weapon-pic">89</div><div><small>副武器：机器人炸弹 · 特殊：诱饵烟花</small><h2>N-ZAP89</h2><p>射击枪 · 支援 / 前中卫</p></div><button>更换</button></div>
  <Title n="02" text="快速配装"><button onClick={()=>applyPreset(0)}><RotateCcw size={14}/>重置</button></Title><div className="presets vertical">{presets.map((p,i)=><button className={activePreset===i?'picked':''} key={p.name} onClick={()=>applyPreset(i)}><b>0{i+1}</b><div><strong>{p.name}</strong><small>{p.desc}</small></div>{activePreset===i?<Check size={17}/>:<Plus size={17}/>}</button>)}</div>
  <div className="loadout-title"><h3>配装 1</h3><b>57 / 57 AP</b></div><div className="gear-stack compact-gears">{['头部','服装','鞋子'].map((g,r)=><div className="gear" key={g}><div><span>{['帽','衣','鞋'][r]}</span><small>{g}</small></div><section>{slots.slice(r*4,r*4+4).map(([id,ap],i)=><button className={i===0?'main':''} key={i} onClick={()=>setFocus(id)}><Icon small a={abilities.find(a=>a.id===id)}/><em>{ap}</em></button>)}</section></div>)}</div>
  <Title n="03" text="石头池"><small>点击查看右侧分析</small></Title><div className="filter mini-filter"><div>{groups.map(g=><button key={g} className={group===g?'active':''} onClick={()=>setGroup(g)}>{g}</button>)}</div><label><Search size={14}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索"/></label></div>
  <div className="stone-pool">{filtered.map(a=><button title={a.name} key={a.id} className={focus===a.id?'focused':''} onClick={()=>toggle(a.id)}><Icon a={a}/><small>{a.short}</small></button>)}</div>
 </section>
 <aside className="analysis-column"><div className="analysis-head"><div><small>LIVE WEAPON ANALYSIS</small><h2>N-ZAP89 的配装结果</h2></div><span>游戏版本 11.3</span></div>
  <div className="context-strip"><div><b>主要武器</b><span>N-ZAP89</span></div><div><b>次要武器</b><span>机器人炸弹</span></div><div><b>特殊武器</b><span>诱饵烟花</span></div></div>
  <EffectPanel id={focus} ap={currentAp} setAp={ap=>setSubAp(focus,ap)}/>
  <div className="analysis-summary"><h3>当前能力构成</h3><div>{totals.map(x=><button key={x.a?.id} onClick={()=>setFocus(x.a?.id||'iss')}><Icon small a={x.a}/><span>{x.a?.short}</span><b>{x.ap}AP</b></button>)}</div></div>
  <div className="accordions">{['主要武器效率与射击数','次要武器实际影响','特殊武器循环','移动与返场','生存与抗性','其他能力'].map((x,i)=><details open={i===1} key={x}><summary><span>{x}</span><b>{i===1?'机器人炸弹 · 关键节点':''}</b></summary><div>{i===1?'已根据当前副武器自动筛选：副省影响耗墨量；副武增强影响投掷距离与相关性能。选择左侧石头即可更新这里的结论。':'展开后将展示与当前武器相关的数值、关键阈值、边际收益和机会成本。'}</div></details>)}</div>
  <div className="notice"><Check size={15}/><p><b>分析上下文已锁定</b><br/>所有描述均以 N-ZAP89 当前套装与 57AP 配装为前提。</p></div><p className="note">效果数值为原型演示 · 正式版将绑定当前版本数据</p>
 </aside></div></section>}</>}<footer className="legal-footer"><b>INKLAB 是非官方玩家工具</b><span>Splatoon 及游戏内能力图标的商标与版权归 Nintendo 所有。本站使用官方图标仅用于能力辨认，与 Nintendo 无隶属、授权或合作关系。</span><a href="https://github.com/sendou-ink/assets" target="_blank" rel="noreferrer">图标来源</a><span className="weapon-data-credit"><a href="https://leanny.github.io/splat3/" target="_blank" rel="noreferrer">武器数据：Leanny</a><em>Ver. 11.3.0</em></span></footer></main>
}
function Title({n,text,children}:{n:string;text:string;children:React.ReactNode}){return <div className="title"><div><span>{n}</span><h3>{text}</h3></div>{children}</div>}
function EffectPanel({id,ap,setAp}:{id:string;ap:number;setAp:(ap:number)=>void}){
 const a=abilities.find(x=>x.id===id);
 const isSub=id==='iss';
 const isSubPower=id==='subp';
 return <section className="effect-panel"><div className="effect-head"><div><span>03</span><h3>{a?.short} 对当前武器有什么用？</h3></div><b><Zap size={13}/> 武器上下文</b></div>
 {isSub?<><div className="effect-main"><Icon a={a}/><div><small>N-ZAP89 · 机器人炸弹</small><strong>降低每次投掷的墨水消耗</strong><p>当前 {ap}AP：从基础 55% 降至约 {ap>=12?'49.6':ap>=6?'51.9':ap>=3?'53.4':'55.0'}%，{ap>=12?'已解锁满墨连续投掷 2 个。':'尚未达到连续投掷 2 个的关键点。'}</p></div><span className={ap>=12?'hit':''}>{ap>=12?'阈值达成':'距阈值 '+Math.max(0,12-ap)+'AP'}</span></div><div className="breakpoints">{[3,6,12].map(n=><button className={ap===n?'active':''} onClick={()=>setAp(n)} key={n}><b>{n}AP</b><small>{n===3?'轻量续航':n===6?'频繁探路':'机器人双投'}</small></button>)}</div><p className="judgement"><TrendingUp size={14}/><b>科研结论：</b>3AP 的机会成本最低；如果目标是连续投掷两个机器人，直接规划到 12AP，中间档位主要改善投掷后的主武器余墨。</p></>:isSubPower?<SubPowerPanel a={a} ap={ap} setAp={setAp}/>:<div className="effect-main generic"><Icon a={a}/><div><small>当前配置 · {ap}AP</small><strong>{a?.name}</strong><p>正式版会在这里显示与 N-ZAP89 主武器、副武器和特殊武器绑定的实际数值、下一个关键节点及边际收益。</p></div></div>}
 </section>
}

function SubPowerPanel({a,ap,setAp}:{a?:A;ap:number;setAp:(ap:number)=>void}){
 return <><div className="effect-main sub-context"><Icon a={a}/><div><small>N-ZAP89 · 当前副武器：机器人炸弹</small><strong>让机器人炸弹投得更远</strong><p>副武增强提高投掷初速度，因此落点距离增加；它不会强化机器人锁敌、追踪移动或爆炸伤害。</p></div><span>影响 1 项参数</span></div>
 <div className="impact-matrix"><div className="yes"><Check size={14}/><span><b>投掷距离</b><small>提升 · 更容易越过掩体布置机器人</small></span></div><div><b>—</b><span><strong>索敌与追踪</strong><small>不变 · 发现范围和追踪速度不增加</small></span></div><div><b>—</b><span><strong>爆炸范围</strong><small>不变</small></span></div><div><b>—</b><span><strong>爆炸伤害</strong><small>不变 · 不改变确杀线</small></span></div></div>
 <div className="breakpoints">{[3,6,10].map(n=><button className={ap===n?'active':''} onClick={()=>setAp(n)} key={n}><b>{n}AP</b><small>{n===3?'轻量延伸':n===6?'常用试投':'主技能投入'}</small></button>)}</div>
 <div className="sub-compare"><b>同主武器分支</b><span><strong>N-ZAP85 · 吸盘炸弹</strong></span><span><Check size={13}/> 投掷距离提升</span><span>— 爆炸范围与伤害不变</span></div>
 <p className="judgement"><TrendingUp size={14}/><b>配装建议：</b>机器人炸弹的副武增强属于“落点与施压角度”投资，不是伤害投资。是否值得带，应结合地图掩体和你常用的投掷位置判断。</p></>
}

const planningWeapons=[
 {id:'zap',name:'N-ZAP89',role:'副武压制',accent:'#f1c40f',needs:['副省 12AP','游速 6AP','快跳 3AP']},
 {id:'shot',name:'斯普拉射击枪',role:'前线泛用',accent:'#8b5cf6',needs:['游速 6AP','快跳 3AP','安全鞋 3AP']},
 {id:'leaf',name:'枫叶射击枪',role:'骚扰续航',accent:'#22c55e',needs:['副省 9AP','游速 6AP','快跳 3AP']},
];
function UniversalPlanner(){
 const[chosen,setChosen]=useState(['zap','shot','leaf']),[goal,setGoal]=useState('省石头'),[applied,setApplied]=useState(false);
 const toggle=(id:string)=>setChosen(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
 return <section className="workspace planner-page"><div className="intro"><div><em>SHARED GEAR / 002</em><h1>多武器通用装备规划</h1><p>把共同需求放进同一件装备，减少重复制作和能力碎片消耗。</p></div><span className="version-pill">规划草案 · 3把武器</span></div>
 <div className="planner-grid"><section className="planner-controls">
  <Title n="01" text="选择你常用的配装"><button><Plus size={14}/>添加武器</button></Title>
  <div className="weapon-list">{planningWeapons.map((w,i)=><button key={w.id} className={chosen.includes(w.id)?'selected':''} onClick={()=>toggle(w.id)}><span className="weapon-dot" style={{background:w.accent}}>{i===0?'89':i===1?'枪':'叶'}</span><div><b>{w.name}</b><small>{w.role}</small><em>{w.needs.join(' · ')}</em></div><span className="tick">{chosen.includes(w.id)?<Check size={14}/>:<Plus size={14}/>}</span></button>)}</div>
  <Title n="02" text="这次优先考虑什么"><small>可随时重新计算</small></Title>
  <div className="goal-pills">{['省石头','最少妥协','容易购买'].map(x=><button className={goal===x?'active':''} onClick={()=>setGoal(x)} key={x}>{x}</button>)}</div>
  <Title n="03" text="固定条件"><small>锁定后不会被方案替换</small></Title>
  <div className="locks"><button className="on"><Lock size={14}/><span><b>头部与服装保持可变</b><small>允许不同武器使用专属大技能</small></span></button><button><Lock size={14}/><span><b>至少保留 3AP 快跳</b><small>作为所有前线配装的安全垫</small></span></button></div>
 </section>
 <aside className="planner-result"><div className="result-kicker">RECOMMENDATION / {goal}</div><div className="recommend-title"><div className="gear-symbol"><Footprints/></div><div><small>最适合固定为通用件</small><h2>优先制作一双通用鞋</h2></div><b>匹配度 92%</b></div>
  <div className="why-grid"><div><span>共同需求</span><b>游速 6AP</b><b>快跳 3AP</b></div><div><span>部位冲突</span><b className="good">鞋子最低</b><small>头、服装需要随玩法变化</small></div><div><span>预计节省</span><b className="big">≈ 36</b><small>能力碎片 · 原型估算</small></div></div>
  <div className="decision"><h3>为什么是鞋子？</h3><p>三套配装都需要少量游速和快跳；而头部可能在最后冲刺、回归之间切换，服装还要考虑隐游。把共同的小技能固定在鞋子，换武器时只需调整头和服装。</p><div className="trade"><Check size={15}/><span><b>N-ZAP89</b> 保留副武压制核心，鞋子负责通用机动</span></div><div className="trade"><Check size={15}/><span><b>斯普拉射击枪</b> 无需重复制作 6AP 游速</span></div><div className="trade"><Check size={15}/><span><b>枫叶射击枪</b> 只需在头、服装补足副省</span></div></div>
  <h3 className="candidate-title">装备参考 <small>根据原始大技能与改造成本排序</small></h3><div className="gear-candidates"><button className="best"><span className="shoe-art">鞋</span><div><b>通用鞋胚 A</b><small>原始大技能：隐形跳跃</small><em>推荐 · 只需制作 3 个小槽</em></div><Check/></button><button><span className="shoe-art alt">鞋</span><div><b>通用鞋胚 B</b><small>原始大技能：受身术</small><em>备选 · 适合回场倾向</em></div><Plus/></button></div>
  <button className="primary plan-action" onClick={()=>setApplied(true)}>{applied?<Check size={16}/>:<Layers size={16}/>} {applied?'已保存为实验分支':'用此鞋生成三套实验分支'}</button><p className="note">装备名称与碎片成本暂为交互示例，正式版将绑定玩家库存与版本数据。</p>
 </aside></div></section>
}

function AbilityWiki({focus,setFocus}:{focus:string;setFocus:(id:string)=>void}){
 const[filters,setFilters]=useState<string[]>([]),[q,setQ]=useState('');
 const tags=['全部','头部限定','服装限定','鞋子限定','副武器','墨水续航','机动','少量投入有效','关键临界点'];
 const toggle=(t:string)=>setFilters(t==='全部'?[]:s=>s.includes(t)?s.filter(x=>x!==t):[...s,t]);
 const shown=abilities.filter(a=>(!q||a.name.includes(q)||a.short.includes(q)||(abilityAliases[a.id]||'').includes(q))&&(!filters.includes('副武器')||['iss','subp','subr'].includes(a.id))&&(!filters.includes('墨水续航')||a.group==='续航')&&(!filters.includes('机动')||a.group==='机动')&&(!filters.includes('头部限定')||a.group==='头部限定')&&(!filters.includes('服装限定')||a.group==='服装限定')&&(!filters.includes('鞋子限定')||a.group==='鞋子限定'));
 const current=abilities.find(a=>a.id===focus)||abilities[0];
 return <section className="workspace wiki-page"><div className="intro"><div><em>ABILITY INDEX / 003</em><h1>能力百科</h1><p>先按玩法与装备规则缩小范围，再查看它对具体武器的实际意义。</p></div><label className="wiki-search"><Search size={15}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="搜索能力名称"/></label></div>
 <div className="tag-board">{tags.map(t=><button key={t} className={(t==='全部'&&!filters.length)||filters.includes(t)?'active':''} onClick={()=>toggle(t)}>{t}</button>)}</div>
 <div className="wiki-grid"><section><div className="wiki-count"><b>{shown.length}</b> 个能力符合条件 <span>可组合多个标签</span></div><div className="wiki-abilities">{shown.map(a=><button className={focus===a.id?'active':''} onClick={()=>setFocus(a.id)} key={a.id}><Icon a={a}/><div><b>{a.short}</b><small>{a.name}</small></div><Plus size={14}/></button>)}</div></section>
 <aside className="ability-detail"><div className="ability-name"><Icon a={current}/><div><small>{current.group} / 当前选中</small><h2>{current.name}</h2></div></div><div className="detail-tags"><span>可作为小技能</span><span>{current.group}</span><span>存在边际收益</span></div><div className="wiki-callout"><b>对 N-ZAP89 的意义</b><p>{current.id==='iss'?'降低机器人炸弹耗墨，并增加投掷后可以继续射击的次数。若目标是双投，需要直接规划到关键 AP 档位。':'选择武器后，这里将转换成实际动作、阈值与机会成本，而不只显示抽象参数。'}</p></div><h3>常见投入方式</h3><div className="ap-recipes"><button><b>3AP</b><span>轻量投入</span><small>占用一颗小石头</small></button><button className="active"><b>6AP</b><span>平衡投入</span><small>适合通用装备</small></button><button><b>专项</b><span>围绕临界点</span><small>按武器计算</small></button></div><button className="primary"><Zap size={15}/>围绕此能力进入实验室</button></aside></div></section>
}

function SchemeLibrary(){
 const sampleSlots=[['iss','iss','subp','subp'],['ssu','iru','subr','subr'],['stealth','qsj','qsj','inkres']];
 return <section className="workspace library-page"><div className="intro"><div><em>PLAYER BUILDS / SAMPLE</em><h1>玩家方案</h1><p>先看玩法标签，再判断这套思路是否值得带回实验室微调。</p></div><button className="primary compact"><Plus size={15}/> 投稿配装</button></div>
 <div className="library-toolbar"><div><button className="active">最新投稿</button><button>适合微调</button><button>省碎片方案</button></div><label><Search size={14}/><input placeholder="搜索武器或玩法标签"/></label></div>
 <div className="build-gallery"><article className="build-card">
  <div className="build-card-title"><div><span>副武压制</span><span>前中卫</span><span>个人手感</span></div><small>标签自动组成标题</small></div>
  <div className="build-meta"><b>@墨鱼实验员</b><span>方案 #0042</span><time>2026/09/01</time></div>
  <div className="build-weapon"><span className="weapon-badge">89</span><div><small>使用武器</small><b>N-ZAP89</b><em>机器人炸弹 · 诱饵烟花</em></div></div>
  <div className="submitted-gears">{['头部','服装','鞋子'].map((part,row)=><div className="submitted-gear" key={part}><div className={'gear-reference '+(row===2?'with-reference':'')}><span>{row===0?'帽':row===1?'衣':'鞋'}</span><small>{row===2?'附装备参考':part+'外观未选择'}</small></div><section>{sampleSlots[row].map((id,i)=><div className={i===0?'main':''} key={i}><Icon a={abilities.find(a=>a.id===id)} small/><em>{i===0?10:3}</em></div>)}</section></div>)}</div>
  <div className="author-note"><b>作者实测</b><p>习惯补一点人速来调整横向拉枪；核心仍是机器人炸弹的压制与续航，鞋子作为我的通用单件。</p></div>
  <div className="build-actions"><button><Copy size={14}/> 复制结构</button><button className="lab-action"><Zap size={14}/> 打开实验室微调</button></div>
 </article>
 <aside className="card-anatomy"><small>卡片阅读顺序</small><ol><li><b>01 标签标题</b><span>先说明玩法，不依赖自由文字翻译</span></li><li><b>02 ID / 日期</b><span>用于追溯版本与审核记录</span></li><li><b>03 武器</b><span>显示当前主、副、特殊武器上下文</span></li><li><b>04 配装</b><span>外观可选，能力结构始终完整</span></li></ol><div><Sparkles size={15}/><p>与展示型配装站不同，这张卡片的最终动作是进入实验室，继续比较和微调。</p></div></aside>
 </div></section>}

type MotionPoint={x:number;y:number};
function MotionLab(){
 const[stick,setStick]=useState({x:0,y:0}),stickRef=useRef({x:0,y:0});
 const[trail,setTrail]=useState<MotionPoint[]>([{x:50,y:78}]),posRef=useRef({x:50,y:78});
 const[running,setRunning]=useState(true),runningRef=useRef(true);
 const[controller,setController]=useState('未连接'),[status,setStatus]=useState('先保持一个方向，再快速反向');
 const[stats,setStats]=useState({angle:0,strength:0,reverse:0,delay:0,attempts:0,success:0});
 const previousRef=useRef({x:0,y:-1,time:0}),reverseAtRef=useRef(0),sourceRef=useRef('键鼠');
 const setInput=useCallback((rawX:number,rawY:number,source='键鼠')=>{
  const length=Math.hypot(rawX,rawY),scale=length>1?1/length:1;
  const x=rawX*scale,y=rawY*scale,magnitude=Math.min(1,length);
  stickRef.current={x,y};setStick({x,y});sourceRef.current=source;
  if(magnitude>.5){
   const prev=previousRef.current,prevLength=Math.hypot(prev.x,prev.y)||1;
   const difference=Math.acos(Math.max(-1,Math.min(1,(x*prev.x+y*prev.y)/(magnitude*prevLength))))*180/Math.PI;
   if(difference>=120&&Date.now()-prev.time<900){reverseAtRef.current=Date.now();setStatus('反向完成：现在按跳跃');}
   previousRef.current={x,y,time:Date.now()};
   setStats(s=>({...s,angle:(Math.atan2(x,-y)*180/Math.PI+360)%360,strength:magnitude*100,reverse:difference}));
  }else setStats(s=>({...s,strength:magnitude*100}));
 },[]);
 const jump=useCallback(()=>{
  const delay=reverseAtRef.current?Date.now()-reverseAtRef.current:0,success=delay>0&&delay<=350;
  setStats(s=>({...s,delay,attempts:s.attempts+1,success:s.success+(success?1:0)}));
  setStatus(success?'滚行时机命中！继续尝试稳定复现':'未命中：先快速反向，再于 350ms 内跳跃');reverseAtRef.current=0;
 },[]);
 useEffect(()=>{runningRef.current=running},[running]);
 useEffect(()=>{
  let frame=0,lastButton=false;
  const tick=()=>{
   const pads=navigator.getGamepads?.()||[],pad=Array.from(pads).find(Boolean);
   if(pad){setController(pad.id);const x=Math.abs(pad.axes[0]||0)>.07?(pad.axes[0]||0):0,y=Math.abs(pad.axes[1]||0)>.07?(pad.axes[1]||0):0;if(x||y||sourceRef.current==='手柄')setInput(x,y,'手柄');const pressed=!!pad.buttons[0]?.pressed;if(pressed&&!lastButton)jump();lastButton=pressed;}
   if(runningRef.current&&++frame%3===0){const v=stickRef.current;if(Math.hypot(v.x,v.y)>.08){const next={x:Math.max(3,Math.min(97,posRef.current.x+v.x*1.05)),y:Math.max(4,Math.min(96,posRef.current.y+v.y*1.05))};posRef.current=next;setTrail(t=>[...t.slice(-179),next]);}}
   id=requestAnimationFrame(tick);
  };let id=requestAnimationFrame(tick);return()=>cancelAnimationFrame(id);
 },[jump,setInput]);
 useEffect(()=>{
  const keys=new Set<string>();const update=()=>setInput((keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0),'键盘');
  const down=(e:KeyboardEvent)=>{if(['input','textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase()))return;const key=e.key.toLowerCase();if(key===' '){e.preventDefault();jump();return}keys.add(key);update()};
  const up=(e:KeyboardEvent)=>{keys.delete(e.key.toLowerCase());update()};window.addEventListener('keydown',down);window.addEventListener('keyup',up);return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up)};
 },[jump,setInput]);
 const pointer=(e:React.PointerEvent<HTMLDivElement>)=>{const r=e.currentTarget.getBoundingClientRect();setInput((e.clientX-r.left-r.width/2)/(r.width*.42),(e.clientY-r.top-r.height/2)/(r.height*.42),'触摸 / 鼠标')};
 const reset=()=>{posRef.current={x:50,y:78};setTrail([{x:50,y:78}]);setStats({angle:0,strength:0,reverse:0,delay:0,attempts:0,success:0});setStatus('先保持一个方向，再快速反向')};
 const points=trail.map(p=>`${p.x},${p.y}`).join(' ');
 return <section className="workspace motion-page"><div className="intro"><div><em>CONTROL LAB / EXPERIMENT 01</em><h1>鱿鱼滚行练习器</h1><p>观察摇杆反向与跳跃时机，把操作手感转换成可以复盘的轨迹。</p></div><span className="version-pill">独立实验原型</span></div>
 <div className="motion-grid"><section className="motion-controls"><Title n="01" text="输入设备"><small>三种方式任选</small></Title><div className="device-card"><Gamepad2/><div><b>{controller==='未连接'?'连接 PC 手柄即可自动识别':'手柄已连接'}</b><small title={controller}>{controller==='未连接'?'也可直接使用 WASD / 方向键':controller}</small></div><span>{sourceRef.current}</span></div>
 <Title n="02" text="模拟摇杆"><small>拖动圆盘，Space / 手柄 A 跳跃</small></Title><div className="stick-zone" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);pointer(e)}} onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))pointer(e)}} onPointerUp={e=>{e.currentTarget.releasePointerCapture(e.pointerId);setInput(0,0,'触摸 / 鼠标')}}><i/><b style={{transform:`translate(calc(-50% + ${stick.x*82}px),calc(-50% + ${stick.y*82}px))`}}><span/></b></div>
 <div className={'motion-status '+(status.startsWith('滚行时机命中')?'success':status.startsWith('未命中')?'error':'')}><span>{status.startsWith('滚行时机命中')?'✓':status.startsWith('未命中')?'×':'→'}</span><div><b>{status}</b><small>建议：先向前推住，再在一次干净动作中反拉并跳跃</small></div></div><button className="primary jump-button" onClick={jump}>模拟跳跃 <kbd>Space</kbd></button></section>
 <aside className="motion-result"><div className="motion-head"><div><small>ESTIMATED MOVEMENT PATH</small><h2>行动轨迹</h2></div><div><button onClick={()=>setRunning(v=>!v)}>{running?<Pause size={14}/>:<Play size={14}/>} {running?'暂停':'继续'}</button><button onClick={reset}><RotateCcw size={14}/> 重置</button></div></div>
 <div className="path-board"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="估算行动轨迹"><defs><pattern id="motion-grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth=".18"/></pattern></defs><rect width="100" height="100" fill="url(#motion-grid)"/><line x1="50" y1="0" x2="50" y2="100"/><line x1="0" y1="50" x2="100" y2="50"/><polyline points={points} fill="none"/><circle cx={posRef.current.x} cy={posRef.current.y} r="1.8"/></svg><span>起点</span><b>当前朝向 {Math.round(stats.angle)}°</b></div>
 <div className="motion-metrics"><div><span>摇杆力度</span><b>{Math.round(stats.strength)}%</b><i><em style={{width:`${stats.strength}%`}}/></i></div><div><span>本次反向角</span><b>{Math.round(stats.reverse)}°</b><small>目标 ≥ 120°</small></div><div><span>反向 → 跳跃</span><b>{stats.delay?stats.delay+'ms':'—'}</b><small>练习窗 ≤ 350ms</small></div><div><span>命中次数</span><b>{stats.success} / {stats.attempts}</b><small>仅为练习判定</small></div></div>
 <div className="motion-disclaimer"><Sparkles size={16}/><p><b>原型边界</b>　摇杆输入来自浏览器 Gamepad API；右侧角色路径是二维估算，不读取 Nintendo Switch、游戏画面或游戏物理。后续可接入武器重量、游速 AP 与动作阶段模型。</p></div></aside></div></section>
}
