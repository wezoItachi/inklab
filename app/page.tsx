'use client';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {Check,Copy,Download,Footprints,Gamepad2,Layers,Lock,Pause,Play,Plus,RotateCcw,Search,Sparkles,TrendingUp,Zap} from 'lucide-react';
import {NativeSelect,NativeSelectOption} from '@/components/ui/native-select';
import {DATA_VERSION,getWeapon,weapons,type Weapon} from '@/lib/weapons';
import {calculateAbilityTotals,clonePresetSlots,presets,replaceLoadoutSlot,type LoadoutSlot} from '@/lib/loadouts';
import {angleDifferenceDegrees,isRollJumpTiming,isRollReverse} from '@/lib/analysis';
import {exportLoadoutPng,normalizeTags} from '@/lib/export-loadout-png';
import {abilities,abilityAliases,abilityGroups,getAbilityAssetUrl,type Ability} from '@/lib/abilities';
import {AbilityIcon} from '@/components/ability-icon';
import {getWeaponParameterSnapshot} from '@/lib/weapon-parameter-status';
import {ParameterStatusStrip} from '@/components/parameter-status-strip';
import {MainWeaponParameterAudit} from '@/components/main-weapon-parameter-audit';
import {encodeLoadoutQuery,LOCAL_LOADOUT_KEY} from '@/lib/loadout-share';
import {resolveInitialEditorState} from '@/lib/editor-state';
const initialSlots=clonePresetSlots(0);
export default function Home(){
 const[page,setPage]=useState<'lab'|'wiki'|'library'|'motion'>('lab'),[labMode,setLabMode]=useState<'planner'|'single'>('single');
 const[weaponId,setWeaponId]=useState(weapons[0].id);
 const[group,setGroup]=useState('全部'),[query,setQuery]=useState('');
 const[cardTitle,setCardTitle]=useState(''),[cardAuthor,setCardAuthor]=useState(''),[cardTags,setCardTags]=useState(''),[cardNote,setCardNote]=useState('');
 const[exportStatus,setExportStatus]=useState<'idle'|'working'|'saved'|'error'>('idle');
 const[slots,setSlots]=useState<LoadoutSlot[]>(initialSlots),[focus,setFocus]=useState('iss'),[activePreset,setActivePreset]=useState(0);
 const[selectedSlot,setSelectedSlot]=useState(0);
 const[analysisApPreview,setAnalysisApPreview]=useState<number|null>(null);
 const[shareStatus,setShareStatus]=useState<'idle'|'copied'|'error'>('idle');
 const[localReady,setLocalReady]=useState(false);
 const filtered=abilities.filter(a=>(group==='全部'||a.group===group)&&(a.name.includes(query)||a.short.includes(query)||(abilityAliases[a.id]||'').includes(query)));
 const totals=useMemo(()=>calculateAbilityTotals(slots).map(({id,ap})=>({a:abilities.find(x=>x.id===id),ap})),[slots]);
 const currentAp=analysisApPreview??totals.find(x=>x.a?.id===focus)?.ap??0;
 const weapon=getWeapon(weaponId);
 const parameterSnapshot=getWeaponParameterSnapshot(weapon);
 const currentPresetName=presets[activePreset]?.name??'自定义配装';
 useEffect(()=>{
  const timer=window.setTimeout(()=>{
   const weaponIds=new Set(weapons.map(({id})=>id)),abilityIds=new Set(abilities.map(({id})=>id));
   let saved:string|null=null;
   try{saved=localStorage.getItem(LOCAL_LOADOUT_KEY)}catch{/* Browser storage can be unavailable in privacy modes. */}
   const restored=resolveInitialEditorState({urlSearch:window.location.search,savedSearch:saved,defaultWeaponId:weapons[0].id,weaponIds,abilityIds});
   if(restored.source!=='default'){setWeaponId(restored.state.weaponId);setSlots(restored.state.slots);setActivePreset(restored.state.activePreset);setFocus(restored.state.focus);setSelectedSlot(restored.state.selectedSlot)}
   setLocalReady(true);
  },0);
  return()=>window.clearTimeout(timer);
 },[]);
 useEffect(()=>{if(localReady)try{localStorage.setItem(LOCAL_LOADOUT_KEY,encodeLoadoutQuery({weaponId,slots}))}catch{/* Keep the editor usable when storage is unavailable. */}},[localReady,slots,weaponId]);
 const applyPreset=(i:number)=>{setActivePreset(i);setSlots(clonePresetSlots(i));setSelectedSlot(0);setFocus(presets[i].ids[0]);setAnalysisApPreview(null)};
 const selectAnalysis=(id:string)=>{setFocus(id);setAnalysisApPreview(null)};
 const replaceSelectedSlot=(id:string)=>{setSlots(current=>replaceLoadoutSlot(current,selectedSlot,id));setActivePreset(-1)};
 const copyShareLink=async()=>{const query=encodeLoadoutQuery({weaponId,slots}),url=`${window.location.origin}${window.location.pathname}?${query}`;window.history.replaceState(null,'',url);try{await navigator.clipboard.writeText(url);setShareStatus('copied');setTimeout(()=>setShareStatus('idle'),1800)}catch{setShareStatus('error')}};
 const savePng=async()=>{
  setExportStatus('working');
  const title=cardTitle.trim()||`${weapon.name} · ${currentPresetName}`;
  const tags=normalizeTags(cardTags);if(!tags.length)tags.push(weapon.family,currentPresetName,'57AP');
  try{await exportLoadoutPng({title,author:cardAuthor.trim()||'匿名玩家',tags,note:cardNote.trim()||`围绕 ${weapon.name} 的 ${currentPresetName} 方向继续微调。`,version:DATA_VERSION,weapon:{name:weapon.name,badge:weapon.badge,family:weapon.family,sub:weapon.sub.name,special:weapon.special},slots:slots.map(([id,ap])=>{const ability=abilities.find(item=>item.id===id);return{short:ability?.short||id,ap,iconUrl:getAbilityAssetUrl(id)}}),totals:totals.map(({a,ap})=>({short:a?.short||'未知',ap,iconUrl:a?getAbilityAssetUrl(a.id):undefined}))});setExportStatus('saved');setTimeout(()=>setExportStatus('idle'),1800)}catch{setExportStatus('error')}
 };
 return <main><header className="topbar"><div className="brand"><span>S3</span>INKLAB <b>配装实验室</b></div><nav><button className={page==='lab'?'active':''} onClick={()=>{setPage('lab');setLabMode('single')}}>实验室</button><button className={page==='wiki'?'active':''} onClick={()=>setPage('wiki')}>能力百科</button><button className={page==='library'?'active':''} onClick={()=>setPage('library')}>玩家方案</button><button className={page==='motion'?'active':''} onClick={()=>setPage('motion')}>操作实验</button></nav><button className="ghost"><Sparkles size={15}/> 原型模式</button></header>
 {page==='wiki'?<AbilityWiki focus={focus} setFocus={setFocus}/>:page==='library'?<SchemeLibrary/>:page==='motion'?<MotionLab/>:<>
 <div className="lab-switch"><button className={labMode==='single'?'active':''} onClick={()=>setLabMode('single')}><Zap size={15}/> 单套配装分析</button><button className={labMode==='planner'?'active':''} onClick={()=>setLabMode('planner')}><Layers size={15}/> 通用装备规划</button></div>
 {labMode==='planner'?<UniversalPlanner/>:<section className="workspace analyzer-workspace"><div className="intro"><div><em>WEAPON LAB / 001</em><h1>武器配装分析器</h1><p>左侧调整实验条件，右侧读取与当前武器绑定的实际收益。</p></div><button className="primary compact" disabled={exportStatus==='working'} onClick={savePng}>{exportStatus==='saved'?<Check size={15}/>:<Download size={15}/>} {exportStatus==='working'?'正在生成':exportStatus==='saved'?'已保存 PNG':exportStatus==='error'?'重试保存':'保存配装图'}</button></div>
 <div className="layout analyzer-layout"><section className="builder control-column">
  <Title n="01" text="要分析的武器"><small>6 把代表武器</small></Title><div className="weapon"><div className="weapon-pic">{weapon.badge}</div><div><small>副武器：{weapon.sub.name} · 特殊：{weapon.special}</small><h2>{weapon.name}</h2><p>{weapon.family} · {weapon.role}</p></div><NativeSelect className="weapon-select" value={weaponId} onChange={event=>setWeaponId(event.target.value)} aria-label="更换武器">{weapons.map(item=><NativeSelectOption key={item.id} value={item.id}>{item.name}</NativeSelectOption>)}</NativeSelect></div>
  <Title n="02" text="快速配装"><button onClick={()=>applyPreset(weapon.recommendedPreset)}><RotateCcw size={14}/>应用当前武器建议</button></Title><div className="presets vertical">{presets.map((p,i)=><button className={activePreset===i?'picked':''} key={p.name} onClick={()=>applyPreset(i)}><b>0{i+1}</b><div><strong>{p.name}{weapon.recommendedPreset===i?' · 推荐':''}</strong><small>{p.desc}</small></div>{activePreset===i?<Check size={17}/>:<Plus size={17}/>}</button>)}</div>
  <div className="loadout-title"><div><h3>{activePreset<0?'自定义配装':'配装 1'}</h3><small>{localReady?'已自动保存在此浏览器':'正在读取本机配装'}</small></div><div className="loadout-actions"><button onClick={copyShareLink}><Copy size={13}/>{shareStatus==='copied'?'链接已复制':shareStatus==='error'?'复制失败':'复制分享链接'}</button><b>57 / 57 AP</b></div></div><div className="gear-stack compact-gears">{['头部','服装','鞋子'].map((g,r)=><div className="gear" key={g}><div><span>{['帽','衣','鞋'][r]}</span><small>{g}</small></div><section>{slots.slice(r*4,r*4+4).map(([id,ap],i)=>{const index=r*4+i;return <button aria-pressed={selectedSlot===index} title={`选择${g}${i===0?'主技能':'小技能'}槽位`} className={`${i===0?'main ':''}${selectedSlot===index?'selected-slot':''}`} key={index} onClick={()=>setSelectedSlot(index)}><AbilityIcon small ability={abilities.find(a=>a.id===id)}/><em>{ap}</em></button>})}</section></div>)}</div>
  <Title n="03" text="石头池"><small>已选第 {selectedSlot+1} 槽 · 点击石头直接替换</small></Title><div className="filter mini-filter"><div>{abilityGroups.map(g=><button key={g} className={group===g?'active':''} onClick={()=>setGroup(g)}>{g}</button>)}</div><label><Search size={14}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索"/></label></div>
  <div className="stone-pool">{filtered.map(a=><button title={`用${a.name}替换第 ${selectedSlot+1} 槽`} key={a.id} onClick={()=>replaceSelectedSlot(a.id)}><AbilityIcon ability={a}/><small>{a.short}</small></button>)}</div>
 </section>
 <aside className="analysis-column"><div className="analysis-head"><div><small>LIVE WEAPON ANALYSIS</small><h2>{weapon.name} 的配装结果</h2></div><span>游戏版本 {DATA_VERSION}</span></div>
  <div className="context-strip"><div><b>主要武器</b><span>{weapon.name}</span></div><div><b>次要武器</b><span>{weapon.sub.name}</span></div><div><b>特殊武器</b><span>{weapon.special}</span></div></div>
  <ParameterStatusStrip snapshot={parameterSnapshot}/>
  <MainWeaponParameterAudit weaponId={weapon.id}/>
  <details className="export-settings export-settings-collapsible"><summary><div><Download size={16}/><span><b>配装图片信息</b><small>可选 · 留空会自动生成</small></span></div><em>展开填写</em></summary><div className="export-fields"><label>标题<input maxLength={30} value={cardTitle} onChange={e=>setCardTitle(e.target.value)} placeholder={`${weapon.name} · ${currentPresetName}`}/></label><label>作者<input maxLength={18} value={cardAuthor} onChange={e=>setCardAuthor(e.target.value)} placeholder="匿名玩家"/></label><label className="wide">标签<input maxLength={40} value={cardTags} onChange={e=>setCardTags(e.target.value)} placeholder={`${weapon.family}，${currentPresetName}，57AP`}/></label><label className="wide">一句话<textarea maxLength={70} rows={2} value={cardNote} onChange={e=>setCardNote(e.target.value)} placeholder={`围绕 ${weapon.name} 的 ${currentPresetName} 方向继续微调。`}/></label><p>这些内容只用于生成本机 PNG，不会上传服务器。</p></div></details>
  <div className="analysis-summary"><h3>选择要分析的能力 <small>仅影响右侧说明，不修改配装</small></h3><div>{totals.map(x=><button aria-pressed={focus===x.a?.id} className={focus===x.a?.id?'selected-analysis':''} key={x.a?.id} onClick={()=>selectAnalysis(x.a?.id||'iss')}><AbilityIcon small ability={x.a}/><span>{x.a?.short}</span><b>{x.ap}AP</b></button>)}</div></div>
  <EffectPanel weapon={weapon} id={focus} ap={currentAp} setAp={setAnalysisApPreview}/>
  <div className="accordions">{['主要武器效率与射击数','次要武器实际影响','特殊武器循环','移动与返场','生存与抗性','其他能力'].map((x,i)=><details open={i===1} key={x}><summary><span>{x}</span><b>{i===1?weapon.sub.name+' · 当前套装':''}</b></summary><div>{i===1?`已根据 ${weapon.sub.name} 自动筛选：副省以基础耗墨 ${weapon.sub.baseInkCost}% 为计算入口；副武增强影响${weapon.sub.subPowerEffect}。`:'正式参数导入后，将在这里展示当前武器的数值、关键阈值、边际收益和机会成本。'}</div></details>)}</div>
  <div className="notice"><Check size={15}/><p><b>分析上下文已由 weaponId 驱动</b><br/>当前结论以 {weapon.name}、{weapon.sub.name}、{weapon.special} 与现有 57AP 配装为前提。</p></div><p className="note">套装关系已核对 · AP 效果曲线仍为原型，未验证处不提供攻略结论</p>
 </aside></div></section>}</>}<footer className="legal-footer"><b>INKLAB 是非官方玩家工具</b><span>Splatoon 及游戏内能力图标的商标与版权归 Nintendo 所有。本站使用官方图标仅用于能力辨认，与 Nintendo 无隶属、授权或合作关系。</span><a href="https://github.com/sendou-ink/assets" target="_blank" rel="noreferrer">图标来源</a><span className="weapon-data-credit"><a href="https://leanny.github.io/splat3/" target="_blank" rel="noreferrer">武器数据：Leanny</a><em>Ver. 11.3.0</em></span></footer></main>
}
function Title({n,text,children}:{n:string;text:string;children:React.ReactNode}){return <div className="title"><div><span>{n}</span><h3>{text}</h3></div>{children}</div>}
function EffectPanel({weapon,id,ap,setAp}:{weapon:Weapon;id:string;ap:number;setAp:(ap:number)=>void}){
 const a=abilities.find(x=>x.id===id);
 const isSub=id==='iss';
 const isSubPower=id==='subp';
 return <section className="effect-panel"><div className="effect-head"><div><span>03</span><h3>{a?.short} 对当前武器有什么用？</h3></div><b><Zap size={13}/> 武器上下文</b></div>
 {isSub?<><div className="effect-main"><AbilityIcon ability={a}/><div><small>{weapon.name} · {weapon.sub.name}</small><strong>降低每次使用副武器的墨水消耗</strong><p>当前 {ap}AP；{weapon.sub.name} 的基础耗墨为 {weapon.sub.baseInkCost}%。精确曲线与连续使用阈值将在参数层验证后显示。</p></div><span>曲线待验证</span></div><div className="breakpoints">{[3,6,12].map(n=><button className={ap===n?'active':''} onClick={()=>setAp(n)} key={n}><b>{n}AP</b><small>{n===3?'轻量投入':n===6?'平衡投入':'专项投入'}</small></button>)}</div><p className="judgement"><TrendingUp size={14}/><b>当前结论：</b>武器切换已经更新基础耗墨与副武语境；在公式和字段完成双重核对前，不把演示档位写成正式攻略。</p></>:isSubPower?<SubPowerPanel weapon={weapon} a={a} ap={ap} setAp={setAp}/>:<div className="effect-main generic"><AbilityIcon ability={a}/><div><small>{weapon.name} · 当前 {ap}AP</small><strong>{a?.name}</strong><p>当前分析上下文已绑定 {weapon.sub.name} 与 {weapon.special}；此能力的正式参数仍待导入。</p></div></div>}
 </section>
}

function SubPowerPanel({weapon,a,ap,setAp}:{weapon:Weapon;a?:Ability;ap:number;setAp:(ap:number)=>void}){
 return <><div className="effect-main sub-context"><AbilityIcon ability={a}/><div><small>{weapon.name} · 当前副武器：{weapon.sub.name}</small><strong>提升{weapon.sub.subPowerEffect}</strong><p>副武器性能提升的作用会随副武器改变；切换武器后，本面板不会沿用机器人炸弹的说明。</p></div><span>套装已联动</span></div>
 <div className="impact-matrix"><div className="yes"><Check size={14}/><span><b>{weapon.sub.subPowerEffect}</b><small>提升 · 具体幅度待参数层验证</small></span></div>{weapon.sub.subPowerDoesNotChange.map(item=><div key={item}><b>—</b><span><strong>{item}</strong><small>不变</small></span></div>)}</div>
 <div className="breakpoints">{[3,6,10].map(n=><button className={ap===n?'active':''} onClick={()=>setAp(n)} key={n}><b>{n}AP</b><small>{n===3?'轻量延伸':n===6?'常用试投':'主技能投入'}</small></button>)}</div>
 <div className="sub-compare"><b>当前套装</b><span><strong>{weapon.name} · {weapon.sub.name}</strong></span><span><Check size={13}/> {weapon.sub.subPowerEffect}</span><span>— {weapon.sub.subPowerDoesNotChange.join('、')}</span></div>
 <p className="judgement"><TrendingUp size={14}/><b>配装建议：</b>先根据你实际使用 {weapon.sub.name} 的频率判断是否投入；精确 AP 收益将在版本参数通过测试后补充。</p></>
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
 <div className="wiki-grid"><section><div className="wiki-count"><b>{shown.length}</b> 个能力符合条件 <span>可组合多个标签</span></div><div className="wiki-abilities">{shown.map(a=><button className={focus===a.id?'active':''} onClick={()=>setFocus(a.id)} key={a.id}><AbilityIcon ability={a}/><div><b>{a.short}</b><small>{a.name}</small></div><Plus size={14}/></button>)}</div></section>
 <aside className="ability-detail"><div className="ability-name"><AbilityIcon ability={current}/><div><small>{current.group} / 当前选中</small><h2>{current.name}</h2></div></div><div className="detail-tags"><span>可作为小技能</span><span>{current.group}</span><span>存在边际收益</span></div><div className="wiki-callout"><b>对 N-ZAP89 的意义</b><p>{current.id==='iss'?'降低机器人炸弹耗墨，并增加投掷后可以继续射击的次数。若目标是双投，需要直接规划到关键 AP 档位。':'选择武器后，这里将转换成实际动作、阈值与机会成本，而不只显示抽象参数。'}</p></div><h3>常见投入方式</h3><div className="ap-recipes"><button><b>3AP</b><span>轻量投入</span><small>占用一颗小石头</small></button><button className="active"><b>6AP</b><span>平衡投入</span><small>适合通用装备</small></button><button><b>专项</b><span>围绕临界点</span><small>按武器计算</small></button></div><button className="primary"><Zap size={15}/>围绕此能力进入实验室</button></aside></div></section>
}

function SchemeLibrary(){
 const sampleSlots=[['iss','iss','subp','subp'],['ssu','iru','subr','subr'],['stealth','qsj','qsj','inkres']];
 return <section className="workspace library-page"><div className="intro"><div><em>PLAYER BUILDS / SAMPLE</em><h1>玩家方案</h1><p>先看玩法标签，再判断这套思路是否值得带回实验室微调。</p></div><button className="primary compact"><Plus size={15}/> 投稿配装</button></div>
 <div className="library-toolbar"><div><button className="active">最新投稿</button><button>适合微调</button><button>省碎片方案</button></div><label><Search size={14}/><input placeholder="搜索武器或玩法标签"/></label></div>
 <div className="build-gallery"><article className="build-card">
  <div className="build-card-title"><div><span>副武压制</span><span>前中卫</span><span>个人手感</span></div><small>标签自动组成标题</small></div>
  <div className="build-meta"><b>@墨鱼实验员</b><span>方案 #0042</span><time>2026/09/01</time></div>
  <div className="build-weapon"><span className="weapon-badge">89</span><div><small>使用武器</small><b>N-ZAP89</b><em>机器人炸弹 · 诱饵烟花</em></div></div>
 <div className="submitted-gears">{['头部','服装','鞋子'].map((part,row)=><div className="submitted-gear" key={part}><div className={'gear-reference '+(row===2?'with-reference':'')}><span>{row===0?'帽':row===1?'衣':'鞋'}</span><small>{row===2?'附装备参考':part+'外观未选择'}</small></div><section>{sampleSlots[row].map((id,i)=><div className={i===0?'main':''} key={i}><AbilityIcon ability={abilities.find(a=>a.id===id)} small/><em>{i===0?10:3}</em></div>)}</section></div>)}</div>
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
 const[controller,setController]=useState('未连接'),[status,setStatus]=useState('先保持一个方向，再快速反向'),[source,setSource]=useState('键鼠');
 const[stats,setStats]=useState({angle:0,strength:0,reverse:0,delay:0,attempts:0,success:0});
 const previousRef=useRef({x:0,y:-1,time:0}),reverseAtRef=useRef(0),sourceRef=useRef('键鼠');
 const setInput=useCallback((rawX:number,rawY:number,source='键鼠')=>{
  const length=Math.hypot(rawX,rawY),scale=length>1?1/length:1;
  const x=rawX*scale,y=rawY*scale,magnitude=Math.min(1,length);
  stickRef.current={x,y};setStick({x,y});sourceRef.current=source;setSource(source);
  if(magnitude>.5){
   const prev=previousRef.current;
   const difference=angleDifferenceDegrees(prev,{x,y});
   if(isRollReverse(difference,Date.now()-prev.time)){reverseAtRef.current=Date.now();setStatus('反向完成：现在按跳跃');}
   previousRef.current={x,y,time:Date.now()};
   setStats(s=>({...s,angle:(Math.atan2(x,-y)*180/Math.PI+360)%360,strength:magnitude*100,reverse:difference}));
  }else setStats(s=>({...s,strength:magnitude*100}));
 },[]);
 const jump=useCallback(()=>{
   const delay=reverseAtRef.current?Date.now()-reverseAtRef.current:0,success=isRollJumpTiming(delay);
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
 const currentPosition=trail.at(-1)??{x:50,y:78};
 return <section className="workspace motion-page"><div className="intro"><div><em>CONTROL LAB / EXPERIMENT 01</em><h1>鱿鱼滚行练习器</h1><p>观察摇杆反向与跳跃时机，把操作手感转换成可以复盘的轨迹。</p></div><span className="version-pill">独立实验原型</span></div>
 <div className="motion-grid"><section className="motion-controls"><Title n="01" text="输入设备"><small>三种方式任选</small></Title><div className="device-card"><Gamepad2/><div><b>{controller==='未连接'?'连接 PC 手柄即可自动识别':'手柄已连接'}</b><small title={controller}>{controller==='未连接'?'也可直接使用 WASD / 方向键':controller}</small></div><span>{source}</span></div>
 <Title n="02" text="模拟摇杆"><small>拖动圆盘，Space / 手柄 A 跳跃</small></Title><div className="stick-zone" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);pointer(e)}} onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))pointer(e)}} onPointerUp={e=>{e.currentTarget.releasePointerCapture(e.pointerId);setInput(0,0,'触摸 / 鼠标')}}><i/><b style={{transform:`translate(calc(-50% + ${stick.x*82}px),calc(-50% + ${stick.y*82}px))`}}><span/></b></div>
 <div className={'motion-status '+(status.startsWith('滚行时机命中')?'success':status.startsWith('未命中')?'error':'')}><span>{status.startsWith('滚行时机命中')?'✓':status.startsWith('未命中')?'×':'→'}</span><div><b>{status}</b><small>建议：先向前推住，再在一次干净动作中反拉并跳跃</small></div></div><button className="primary jump-button" onClick={jump}>模拟跳跃 <kbd>Space</kbd></button></section>
 <aside className="motion-result"><div className="motion-head"><div><small>ESTIMATED MOVEMENT PATH</small><h2>行动轨迹</h2></div><div><button onClick={()=>setRunning(v=>!v)}>{running?<Pause size={14}/>:<Play size={14}/>} {running?'暂停':'继续'}</button><button onClick={reset}><RotateCcw size={14}/> 重置</button></div></div>
 <div className="path-board"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="估算行动轨迹"><defs><pattern id="motion-grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth=".18"/></pattern></defs><rect width="100" height="100" fill="url(#motion-grid)"/><line x1="50" y1="0" x2="50" y2="100"/><line x1="0" y1="50" x2="100" y2="50"/><polyline points={points} fill="none"/><circle cx={currentPosition.x} cy={currentPosition.y} r="1.8"/></svg><span>起点</span><b>当前朝向 {Math.round(stats.angle)}°</b></div>
 <div className="motion-metrics"><div><span>摇杆力度</span><b>{Math.round(stats.strength)}%</b><i><em style={{width:`${stats.strength}%`}}/></i></div><div><span>本次反向角</span><b>{Math.round(stats.reverse)}°</b><small>目标 ≥ 120°</small></div><div><span>反向 → 跳跃</span><b>{stats.delay?stats.delay+'ms':'—'}</b><small>练习窗 ≤ 350ms</small></div><div><span>命中次数</span><b>{stats.success} / {stats.attempts}</b><small>仅为练习判定</small></div></div>
 <div className="motion-disclaimer"><Sparkles size={16}/><p><b>原型边界</b>　摇杆输入来自浏览器 Gamepad API；右侧角色路径是二维估算，不读取 Nintendo Switch、游戏画面或游戏物理。后续可接入武器重量、游速 AP 与动作阶段模型。</p></div></aside></div></section>
}
