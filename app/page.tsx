'use client';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {Check,Copy,Download,Eraser,Footprints,Gamepad2,Layers,Lock,Pause,Play,Plus,RotateCcw,Search,Sparkles,TrendingUp,Zap} from 'lucide-react';
import {DATA_VERSION,PARAMETER_VERIFIED_WEAPON_COUNT,getWeapon,weapons,type Weapon} from '@/lib/weapons';
import {calculateAbilityTotals,clearLoadout,clearLoadoutSlot,getNextLoadoutSlotIndex,replaceLoadoutSlot,totalAp,type EditableLoadoutSlot} from '@/lib/loadouts';
import {getSystemRecommendations} from '@/lib/system-recommendations';
import {angleDifferenceDegrees,isRollJumpTiming,isRollReverse} from '@/lib/analysis';
import {exportLoadoutPng,normalizeTags} from '@/lib/export-loadout-png';
import {abilities,abilityAliases,abilityFilterGroups,abilityParts,canPlaceAbilityInSlot,filterAbilitiesForSlot,filterExclusiveAbilitiesForPart,getAbilityAssetUrl,getAbilityPartForSlot,toggleSelectedPart,type Ability,type AbilityFilterGroup} from '@/lib/abilities';
import {AbilityIcon} from '@/components/ability-icon';
import {getWeaponParameterSnapshot} from '@/lib/weapon-parameter-status';
import {ParameterStatusStrip} from '@/components/parameter-status-strip';
import {MainWeaponParameterAudit} from '@/components/main-weapon-parameter-audit';
import {MainWeaponEfficiencyPanel} from '@/components/main-weapon-efficiency-panel';
import {CommunitySamplePanel} from '@/components/community-sample-panel';
import {encodeLoadoutQuery,LOCAL_LOADOUT_KEY} from '@/lib/loadout-share';
import {resolveInitialEditorState} from '@/lib/editor-state';
import {cloneSchemeSlots,exampleSchemes,gameModes,schemeMatchesFilters,schemeMatchesQuery,type ExampleScheme,type SchemeFilters} from '@/lib/schemes';
import {SalmonRunLab} from '@/components/salmon-run-lab';
import {WeaponPicker} from '@/components/weapon-picker';
import type {WeaponPickerItem} from '@/lib/weapon-picker';
const initialRecommendations=getSystemRecommendations(getWeapon(weapons[0].id));
const initialSlots=initialRecommendations[0].slots.map(slot=>[...slot] as EditableLoadoutSlot);
const mainWeaponPickerItems:readonly WeaponPickerItem[]=weapons.map(weapon=>({id:weapon.id,name:weapon.name,family:weapon.family,badge:weapon.badge,meta:`${weapon.sub.name} · ${weapon.special}`,tags:[weapon.role]}));
export default function Home(){
 const[page,setPage]=useState<'lab'|'salmon'|'wiki'|'library'|'motion'>('lab'),[labMode,setLabMode]=useState<'planner'|'single'>('single');
 const[weaponId,setWeaponId]=useState(weapons[0].id);
 const[group,setGroup]=useState<AbilityFilterGroup>('全部'),[query,setQuery]=useState('');
 const[cardTitle,setCardTitle]=useState(''),[cardAuthor,setCardAuthor]=useState(''),[cardTags,setCardTags]=useState(''),[cardNote,setCardNote]=useState('');
 const[exportStatus,setExportStatus]=useState<'idle'|'working'|'saved'|'error'>('idle');
 const[slots,setSlots]=useState<EditableLoadoutSlot[]>(initialSlots),[focus,setFocus]=useState('iss'),[activePreset,setActivePreset]=useState(0);
 const[recommendationSource,setRecommendationSource]=useState<'system'|'community'>('system');
 const[selectedSlot,setSelectedSlot]=useState<number|null>(0);
 const[draggedAbilityId,setDraggedAbilityId]=useState<string|null>(null);
 const[analysisApPreview,setAnalysisApPreview]=useState<number|null>(null);
 const[shareStatus,setShareStatus]=useState<'idle'|'copied'|'error'>('idle');
 const[localReady,setLocalReady]=useState(false);
 const selectedPart=selectedSlot===null?null:getAbilityPartForSlot(selectedSlot);
 const filtered=selectedSlot===null?[]:filterAbilitiesForSlot({slotIndex:selectedSlot,filterGroup:group,query}).filter(({group:abilityGroup})=>!abilityGroup.endsWith('限定'));
 const exclusiveAbilities=selectedPart===null?[]:filterExclusiveAbilitiesForPart({partId:selectedPart.id,filterGroup:group,query});
 const totals=useMemo(()=>calculateAbilityTotals(slots).map(({id,ap})=>({a:abilities.find(x=>x.id===id),ap})),[slots]);
 const equippedAp=totalAp(slots);
 const currentAp=analysisApPreview??totals.find(x=>x.a?.id===focus)?.ap??0;
 const weapon=getWeapon(weaponId);
 const recommendations=useMemo(()=>getSystemRecommendations(weapon),[weapon]);
 const parameterSnapshot=getWeaponParameterSnapshot(weapon);
 const currentPresetName=recommendations[activePreset]?.name??'自定义配装';
 useEffect(()=>{
  const timer=window.setTimeout(()=>{
   const weaponIds=new Set(weapons.map(({id})=>id)),abilityIds=new Set(abilities.map(({id})=>id));
   let saved:string|null=null;
   try{saved=localStorage.getItem(LOCAL_LOADOUT_KEY)}catch{/* Browser storage can be unavailable in privacy modes. */}
   const restored=resolveInitialEditorState({urlSearch:window.location.search,savedSearch:saved,defaultWeaponId:weapons[0].id,weaponIds,abilityIds});
   if(restored.source!=='default'){setWeaponId(restored.state.weaponId);setSlots(restored.state.slots);setActivePreset(-1);setFocus(restored.state.focus);setSelectedSlot(restored.state.selectedSlot)}
   setLocalReady(true);
  },0);
  return()=>window.clearTimeout(timer);
 },[]);
 useEffect(()=>{if(localReady)try{localStorage.setItem(LOCAL_LOADOUT_KEY,encodeLoadoutQuery({weaponId,slots}))}catch{/* Keep the editor usable when storage is unavailable. */}},[localReady,slots,weaponId]);
 const applyRecommendation=(i:number)=>{const recommendation=recommendations[i];if(!recommendation)return;setActivePreset(i);setSlots(recommendation.slots.map(slot=>[...slot] as EditableLoadoutSlot));setSelectedSlot(0);setFocus(recommendation.focusAbilityId);setAnalysisApPreview(null)};
 const selectWeapon=(nextWeaponId:string)=>{setWeaponId(nextWeaponId);setActivePreset(-1);setAnalysisApPreview(null)};
 const openScheme=(scheme:ExampleScheme)=>{const nextSlots=cloneSchemeSlots(scheme);setWeaponId(scheme.weaponId);setSlots(nextSlots);setActivePreset(-1);setSelectedSlot(0);setFocus(nextSlots[0][0]);setAnalysisApPreview(null);setPage('lab');setLabMode('single')};
 const selectAnalysis=(id:string)=>{setFocus(id);setAnalysisApPreview(null)};
 const selectLoadoutSlot=(index:number)=>{if(selectedSlot===index){setSlots(current=>clearLoadoutSlot(current,index));setActivePreset(-1);setAnalysisApPreview(null);return}setSelectedSlot(index);if(index%4!==0&&group==='限定')setGroup('全部')};
 const selectAbilityPart=(firstSlot:number)=>{setSelectedSlot(current=>toggleSelectedPart(current,firstSlot))};
 const selectAbilityGroup=(nextGroup:AbilityFilterGroup)=>{setGroup(nextGroup);if(nextGroup==='限定'&&selectedSlot!==null&&selectedSlot%4!==0)setSelectedSlot(getAbilityPartForSlot(selectedSlot).firstSlot)};
 const placeAbility=(id:string,index:number,advance:boolean)=>{if(!canPlaceAbilityInSlot(id,index))return;setSlots(current=>replaceLoadoutSlot(current,index,id));setActivePreset(-1);setFocus(id);setAnalysisApPreview(null);const next=advance?getNextLoadoutSlotIndex(index):index;setSelectedSlot(next);if(next%4!==0&&group==='限定')setGroup('全部')};
 const replaceSelectedSlot=(id:string)=>{if(selectedSlot!==null)placeAbility(id,selectedSlot,true)};
 const resetLoadout=()=>{setSlots(current=>clearLoadout(current));setActivePreset(-1);setSelectedSlot(0);setAnalysisApPreview(null)};
 const copyShareLink=async()=>{const query=encodeLoadoutQuery({weaponId,slots}),url=`${window.location.origin}${window.location.pathname}?${query}`;window.history.replaceState(null,'',url);try{await navigator.clipboard.writeText(url);setShareStatus('copied');setTimeout(()=>setShareStatus('idle'),1800)}catch{setShareStatus('error')}};
 const savePng=async()=>{
  setExportStatus('working');
  const title=cardTitle.trim()||`${weapon.name} · ${currentPresetName}`;
  const tags=normalizeTags(cardTags);if(!tags.length)tags.push(weapon.family,currentPresetName,`${equippedAp}AP`);
  try{await exportLoadoutPng({title,author:cardAuthor.trim()||'匿名玩家',tags,note:cardNote.trim()||`围绕 ${weapon.name} 的 ${currentPresetName} 方向继续微调。`,version:DATA_VERSION,weapon:{name:weapon.name,badge:weapon.badge,family:weapon.family,sub:weapon.sub.name,special:weapon.special},slots:slots.map(([id,ap])=>{const ability=abilities.find(item=>item.id===id);return{short:ability?.short||'空槽',ap,iconUrl:id?getAbilityAssetUrl(id):undefined}}),totals:totals.map(({a,ap})=>({short:a?.short||'未知',ap,iconUrl:a?getAbilityAssetUrl(a.id):undefined}))});setExportStatus('saved');setTimeout(()=>setExportStatus('idle'),1800)}catch{setExportStatus('error')}
 };
 const pageMeta={lab:{code:'LAB-01',label:'配装实验区',zone:'city'},salmon:{code:'FIELD-02',label:'鲑鱼跑压力实验区',zone:'field'},wiki:{code:'INDEX-03',label:'能力资料索引',zone:'city'},library:{code:'ARCHIVE-04',label:'玩家样本档案',zone:'city'},motion:{code:'RIG-05',label:'操作校准区',zone:'field'}}[page];
 return <main className={`lab-surface zone-${pageMeta.zone}`}><header className="topbar"><div className="brand"><span>S3</span><div>INKLAB <b>墨水研究与配装实验室</b></div></div><nav><button data-code="01" className={page==='lab'?'active':''} onClick={()=>{setPage('lab');setLabMode('single')}}>实验室</button><button data-code="02" className={page==='salmon'?'active':''} onClick={()=>setPage('salmon')}>鲑鱼跑实验室</button><button data-code="03" className={page==='wiki'?'active':''} onClick={()=>setPage('wiki')}>能力百科</button><button data-code="04" className={page==='library'?'active':''} onClick={()=>setPage('library')}>玩家方案</button><button data-code="05" className={page==='motion'?'active':''} onClick={()=>setPage('motion')}>操作实验</button></nav><button className="ghost lab-system-status"><i/> 系统在线 <small>LOCAL</small></button></header><div className="lab-telemetry" aria-label="当前实验室状态"><span><i/> INKLAB RESEARCH SYSTEM</span><b>{pageMeta.code} / {pageMeta.label}</b><span>DATASET / VER.{DATA_VERSION}</span><span>SESSION / LOCAL</span></div>
 {page==='salmon'?<SalmonRunLab/>:page==='wiki'?<AbilityWiki focus={focus} setFocus={setFocus}/>:page==='library'?<SchemeLibrary onOpen={openScheme}/>:page==='motion'?<MotionLab/>:<>
 <div className="lab-switch"><button className={labMode==='single'?'active':''} onClick={()=>setLabMode('single')}><Zap size={15}/> 单套配装分析</button><button className={labMode==='planner'?'active':''} onClick={()=>setLabMode('planner')}><Layers size={15}/> 通用装备规划</button></div>
 {labMode==='planner'?<UniversalPlanner/>:<section className="workspace analyzer-workspace"><div className="intro"><div><em>WEAPON LAB / EXP-001</em><h1>武器配装分析器</h1><p>左侧调整实验条件，右侧读取与当前武器绑定的实际收益。</p><div className="lab-protocol"><span><i/> 实验运行中</span><b>PROTOCOL / LOADOUT-ANALYSIS</b><small>输入可随时修改</small></div></div><button className="primary compact" disabled={exportStatus==='working'} onClick={savePng}>{exportStatus==='saved'?<Check size={15}/>:<Download size={15}/>} {exportStatus==='working'?'正在生成':exportStatus==='saved'?'已保存 PNG':exportStatus==='error'?'重试保存':'保存配装图'}</button></div>
 <div className="layout analyzer-layout"><section className="builder control-column">
  <Title n="01" text="要分析的武器"><small>{weapons.length} 把可选 · {PARAMETER_VERIFIED_WEAPON_COUNT} 把已有核验字段</small></Title><div className="weapon-kit-card"><div className="specimen-meta"><span>SAMPLE / WPN-{String(weapon.upstreamId).padStart(4,'0')}</span><b><i/> 数据样本已装载</b></div><header className="weapon-kit-title"><WeaponPicker items={mainWeaponPickerItems} value={weaponId} onChange={selectWeapon} title="选择要分析的武器" description="按武器种类浏览，或搜索名称、副武器、特殊武器与定位标签。" triggerClassName="weapon-title-picker" triggerLabel={`更换武器，当前为${weapon.name}`} trigger={<span>{weapon.name}</span>}/></header><div className="weapon-kit-visual"><div className="weapon-main-visual" aria-label={`主武器：${weapon.name}`}><div className="weapon-image-placeholder"><span>MAIN WEAPON / 主武器大图</span><strong>{weapon.badge}</strong><em>图像通道待接入</em></div><p><b>{weapon.family}</b><span>{weapon.role}</span></p></div><div className="weapon-side-visuals"><div aria-label={`副武器：${weapon.sub.name}`}><span>SUB / 副武器</span><strong>{weapon.sub.name}</strong><small>图像通道待接入</small></div><div aria-label={`特殊武器：${weapon.special}`}><span>SPECIAL / 特殊武器</span><strong>{weapon.special}</strong><small>图像通道待接入</small></div></div></div></div>
  <Title n="02" text="推荐配装">{recommendationSource==='system'?<button onClick={()=>applyRecommendation(0)}><RotateCcw size={14}/>应用主武基础型</button>:<small>社区模块预留</small>}</Title><div className="recommendation-source-tabs" role="tablist" aria-label="推荐来源"><button role="tab" aria-selected={recommendationSource==='system'} className={recommendationSource==='system'?'active':''} onClick={()=>setRecommendationSource('system')}>系统建议<small>规则生成</small></button><button role="tab" aria-selected={recommendationSource==='community'} className={recommendationSource==='community'?'active':''} onClick={()=>setRecommendationSource('community')}>玩家样本<small>投稿聚类</small></button></div>{recommendationSource==='system'?<><div className="system-recommendation-note"><b>原型推断</b><span>仅使用武器族与已核对套装，不含外部或内测样本</span></div><div className="presets vertical system-presets">{recommendations.map((recommendation,i)=><button className={activePreset===i?'picked':''} key={recommendation.id} onClick={()=>applyRecommendation(i)}><b>0{i+1}</b><div><strong>{recommendation.name}</strong><small>{recommendation.desc}</small><em>{recommendation.rationale}</em></div>{activePreset===i?<Check size={17}/>:<Plus size={17}/>}</button>)}</div>{activePreset>=0&&<div className="system-evidence"><b>这套建议为什么出现</b>{recommendations[activePreset].evidence.map(item=><span key={item}>· {item}</span>)}<small>建议强度尚未由对局或玩家样本验证</small></div>}</>:<CommunitySamplePanel weaponId={weapon.id}/>}
  <div className="loadout-title"><div><h3>{currentPresetName}</h3><small>{localReady?'已自动保存在此浏览器':'正在读取本机配装'}</small></div><div className="loadout-actions"><button onClick={resetLoadout}><Eraser size={13}/>清空配装</button><button onClick={copyShareLink}><Copy size={13}/>{shareStatus==='copied'?'链接已复制':shareStatus==='error'?'复制失败':'复制分享链接'}</button><b>{equippedAp} / 57 AP</b></div></div><div className="gear-stack compact-gears">{['头部','服装','鞋子'].map((g,r)=><div className="gear" key={g}><div><span>{['帽','衣','鞋'][r]}</span><small>{g}</small></div><section>{slots.slice(r*4,r*4+4).map(([id,ap],i)=>{const index=r*4+i,isSelected=selectedSlot===index,canDrop=draggedAbilityId!==null&&canPlaceAbilityInSlot(draggedAbilityId,index);return <button data-slot-index={index} aria-label={`${g}${i===0?'主技能':'小技能'}槽位${id?'，当前已装备':'，当前为空'}`} aria-pressed={isSelected} title={isSelected&&id?`再次点击移除${g}${i===0?'主技能':'小技能'}`:`选择${g}${i===0?'主技能':'小技能'}槽位`} className={`${i===0?'main ':''}${isSelected?'selected-slot ':''}${id===null?'empty-slot ':''}${canDrop?'drag-available':''}`} key={index} onClick={()=>selectLoadoutSlot(index)} onDragOver={event=>{if(canDrop){event.preventDefault();event.dataTransfer.dropEffect='copy'}}} onDrop={event=>{event.preventDefault();const abilityId=event.dataTransfer.getData('text/plain');if(abilityId)placeAbility(abilityId,index,false);setDraggedAbilityId(null)}}><AbilityIcon small ability={abilities.find(a=>a.id===id)}/>{id!==null&&<em>{ap}</em>}</button>})}</section></div>)}</div>
  <Title n="03" text="装备能力碎片"><small>{selectedPart&&selectedSlot!==null?`${selectedPart.label} · 第 ${selectedSlot%4+1} 槽 · 点击连续填装，或拖到任意槽位`:'未选择槽位 · 点击配装槽或装备部位开始'}</small></Title><div className="ability-part-tabs" role="tablist" aria-label="装备部位">{abilityParts.map(part=>{const active=selectedPart?.id===part.id;return <button role="tab" aria-selected={active} className={active?'active':''} key={part.id} onClick={()=>selectAbilityPart(part.firstSlot)}><b>{part.label}</b><small>{part.id==='head'?'头':part.id==='clothes'?'身':'脚'}</small></button>})}</div><div className="filter mini-filter ability-category-filter"><div>{abilityFilterGroups.map(filterGroup=><button key={filterGroup} className={group===filterGroup?'active':''} onClick={()=>selectAbilityGroup(filterGroup)}>{filterGroup}</button>)}</div><label><Search size={14}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索碎片"/></label></div>
  {selectedSlot===null?<div className="stone-pool-empty"><b>当前没有选中槽位</b><span>选择上方头部、服装、鞋子，或直接点击配装中的能力槽。</span></div>:<div className="stone-pool-groups">{exclusiveAbilities.length>0&&<section className="exclusive-ability-shelf"><header><b>{selectedPart?.label}限定能力</b><span>仅可装入对应部位的主技能格</span></header><div className="stone-pool stone-pool-exclusive">{exclusiveAbilities.map(a=><button draggable aria-label={a.name} title={`${a.name}：点击装入${selectedPart?.label}主技能格，或拖动放入`} key={a.id} onClick={()=>selectedPart&&placeAbility(a.id,selectedPart.firstSlot,true)} onDragStart={event=>{event.dataTransfer.setData('text/plain',a.id);event.dataTransfer.effectAllowed='copy';setDraggedAbilityId(a.id)}} onDragEnd={()=>setDraggedAbilityId(null)}><AbilityIcon ability={a}/><small>{a.name}</small></button>)}</div></section>}{exclusiveAbilities.length>0&&filtered.length>0&&<div className="stone-pool-divider"><span>通用能力碎片</span></div>}{filtered.length>0&&<div className="stone-pool">{filtered.map(a=><button draggable aria-label={a.name} title={`${a.name}：点击填入第 ${selectedSlot+1} 槽，或拖到其他槽位`} key={a.id} onClick={()=>replaceSelectedSlot(a.id)} onDragStart={event=>{event.dataTransfer.setData('text/plain',a.id);event.dataTransfer.effectAllowed='copy';setDraggedAbilityId(a.id)}} onDragEnd={()=>setDraggedAbilityId(null)}><AbilityIcon ability={a}/><small>{a.name}</small></button>)}</div>}{exclusiveAbilities.length===0&&filtered.length===0&&<div className="stone-pool-empty"><b>没有符合条件的碎片</b><span>切换分类或清除搜索词后再试。</span></div>}</div>}
 </section>
 <aside className="analysis-column"><div className="analysis-head"><div><small>MEASUREMENT CONSOLE / LIVE</small><h2>{weapon.name} 的配装结果</h2></div><span><i/> 游戏版本 {DATA_VERSION}</span></div>
  <div className="context-strip"><div><b>主要武器</b><span>{weapon.name}</span></div><div><b>次要武器</b><span>{weapon.sub.name}</span></div><div><b>特殊武器</b><span>{weapon.special}</span></div></div>
  <ParameterStatusStrip snapshot={parameterSnapshot}/>
  <MainWeaponParameterAudit weaponId={weapon.id}/>
  <details className="export-settings export-settings-collapsible"><summary><div><Download size={16}/><span><b>配装图片信息</b><small>可选 · 留空会自动生成</small></span></div><em>展开填写</em></summary><div className="export-fields"><label>标题<input maxLength={30} value={cardTitle} onChange={e=>setCardTitle(e.target.value)} placeholder={`${weapon.name} · ${currentPresetName}`}/></label><label>作者<input maxLength={18} value={cardAuthor} onChange={e=>setCardAuthor(e.target.value)} placeholder="匿名玩家"/></label><label className="wide">标签<input maxLength={40} value={cardTags} onChange={e=>setCardTags(e.target.value)} placeholder={`${weapon.family}，${currentPresetName}，${equippedAp}AP`}/></label><label className="wide">一句话<textarea maxLength={70} rows={2} value={cardNote} onChange={e=>setCardNote(e.target.value)} placeholder={`围绕 ${weapon.name} 的 ${currentPresetName} 方向继续微调。`}/></label><p>这些内容只用于生成本机 PNG，不会上传服务器。</p></div></details>
  <div className="analysis-summary"><h3>选择要分析的能力 <small>仅影响右侧说明，不修改配装</small></h3><div>{totals.map(x=><button aria-pressed={focus===x.a?.id} className={focus===x.a?.id?'selected-analysis':''} key={x.a?.id} onClick={()=>selectAnalysis(x.a?.id||'iss')}><AbilityIcon small ability={x.a}/><span>{x.a?.short}</span><b>{x.ap}AP</b></button>)}</div></div>
  <EffectPanel weapon={weapon} id={focus} ap={currentAp} setAp={setAnalysisApPreview}/>
  <div className="accordions"><MainWeaponEfficiencyPanel weaponId={weapon.id}/>{['次要武器实际影响','特殊武器循环','移动与返场','生存与抗性','其他能力'].map((x,i)=><details open={i===0} key={x}><summary><span>{x}</span><b>{i===0?weapon.sub.name+' · 当前套装':''}</b></summary><div>{i===0?`已根据 ${weapon.sub.name} 自动筛选：${weapon.sub.baseInkCost===null?'基础耗墨待验证':`基础耗墨 ${weapon.sub.baseInkCost}%`}；${weapon.sub.subPowerEffect===null?'副武增强对象待验证':`副武增强影响${weapon.sub.subPowerEffect}`}。`:'正式参数导入后，将在这里展示当前武器的数值、关键阈值、边际收益和机会成本。'}</div></details>)}</div>
  <div className="notice"><Check size={15}/><p><b>分析上下文已由 weaponId 驱动</b><br/>当前结论以 {weapon.name}、{weapon.sub.name}、{weapon.special} 与现有 {equippedAp}AP 配装为前提。</p></div><p className="note">套装关系已核对 · AP 效果曲线仍为原型，未验证处不提供攻略结论</p>
 </aside></div></section>}</>}<footer className="legal-footer"><b>INKLAB 是非官方玩家工具</b><span>© 2026 wezoItachi 与 INKLAB 贡献者。Splatoon 及游戏内能力图标的商标与版权归 Nintendo 所有。本站使用官方图标仅用于能力辨认，与 Nintendo 无隶属、授权或合作关系。</span><a href="https://github.com/sendou-ink/assets" target="_blank" rel="noreferrer">图标来源</a><a href="https://github.com/wezoItachi/inklab" target="_blank" rel="noreferrer">源代码</a><a href="https://github.com/wezoItachi/inklab/blob/main/LICENSE" target="_blank" rel="noreferrer">AGPL-3.0 · 不提供担保</a><span className="weapon-data-credit"><a href="https://github.com/Leanny/splat3" target="_blank" rel="noreferrer">Data provided by Lean</a><em>Ver. 11.3.0</em></span></footer></main>
}
function Title({n,text,children}:{n:string;text:string;children:React.ReactNode}){return <div className="title"><div><span>{n}</span><h3>{text}</h3></div>{children}</div>}
function EffectPanel({weapon,id,ap,setAp}:{weapon:Weapon;id:string;ap:number;setAp:(ap:number)=>void}){
 const a=abilities.find(x=>x.id===id);
 const isSub=id==='iss';
 const isSubPower=id==='subp';
 return <section className="effect-panel"><div className="effect-head"><div><span>03</span><h3>{a?.short} 对当前武器有什么用？</h3></div><b><Zap size={13}/> 武器上下文</b></div>
 {isSub?<><div className="effect-main"><AbilityIcon ability={a}/><div><small>{weapon.name} · {weapon.sub.name}</small><strong>降低每次使用副武器的墨水消耗</strong><p>当前 {ap}AP；{weapon.sub.name} 的基础耗墨{weapon.sub.baseInkCost===null?'尚未核对':`为 ${weapon.sub.baseInkCost}%`}。精确曲线与连续使用阈值将在参数层验证后显示。</p></div><span>曲线待验证</span></div><div className="breakpoints">{[3,6,12].map(n=><button className={ap===n?'active':''} onClick={()=>setAp(n)} key={n}><b>{n}AP</b><small>{n===3?'轻量投入':n===6?'平衡投入':'专项投入'}</small></button>)}</div><p className="judgement"><TrendingUp size={14}/><b>当前结论：</b>武器切换已经更新副武器身份；在耗墨、公式和字段完成双重核对前，不把演示档位写成正式攻略。</p></>:isSubPower?<SubPowerPanel weapon={weapon} a={a} ap={ap} setAp={setAp}/>:<div className="effect-main generic"><AbilityIcon ability={a}/><div><small>{weapon.name} · 当前 {ap}AP</small><strong>{a?.name}</strong><p>当前分析上下文已绑定 {weapon.sub.name} 与 {weapon.special}；此能力的正式参数仍待导入。</p></div></div>}
 </section>
}
function SubPowerPanel({weapon,a,ap,setAp}:{weapon:Weapon;a?:Ability;ap:number;setAp:(ap:number)=>void}){
 return <><div className="effect-main sub-context"><AbilityIcon ability={a}/><div><small>{weapon.name} · 当前副武器：{weapon.sub.name}</small><strong>{weapon.sub.subPowerEffect?`提升${weapon.sub.subPowerEffect}`:'作用对象待验证'}</strong><p>副武器性能提升的作用会随副武器改变；未核对的副武器不会沿用其他副武器的说明。</p></div><span>套装已联动</span></div>
 <div className="impact-matrix"><div className="yes"><Check size={14}/><span><b>{weapon.sub.subPowerEffect??'待验证'}</b><small>具体对象与幅度以字段核验为准</small></span></div>{weapon.sub.subPowerDoesNotChange.map(item=><div key={item}><b>—</b><span><strong>{item}</strong><small>不变</small></span></div>)}</div>
 <div className="breakpoints">{[3,6,10].map(n=><button className={ap===n?'active':''} onClick={()=>setAp(n)} key={n}><b>{n}AP</b><small>{n===3?'轻量延伸':n===6?'常用试投':'主技能投入'}</small></button>)}</div>
 <div className="sub-compare"><b>当前套装</b><span><strong>{weapon.name} · {weapon.sub.name}</strong></span><span><Check size={13}/> {weapon.sub.subPowerEffect??'作用对象待验证'}</span><span>— {weapon.sub.subPowerDoesNotChange.length?weapon.sub.subPowerDoesNotChange.join('、'):'不变项待验证'}</span></div>
 <p className="judgement"><TrendingUp size={14}/><b>配装建议：</b>先根据你实际使用 {weapon.sub.name} 的频率判断是否投入；精确 AP 收益将在版本参数通过测试后补充。</p></>
}

const planningWeapons=[
 {id:'zap',name:'N-ZAP89',role:'副武压制',accent:'#f1c40f',needs:['副省 12AP','游速 6AP','快跳 3AP']},
 {id:'shot',name:'斯普拉射击枪',role:'前线泛用',accent:'#8b5cf6',needs:['游速 6AP','快跳 3AP','安全鞋 3AP']},
 {id:'leaf',name:'枫叶射击枪',role:'骚扰续航',accent:'#22c55e',needs:['副省 9AP','游速 6AP','快跳 3AP']},
];
function UniversalPlanner(){
 const[chosen,setChosen]=useState(['zap','shot','leaf']),[goal,setGoal]=useState('省碎片'),[applied,setApplied]=useState(false);
 const toggle=(id:string)=>setChosen(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
 return <section className="workspace planner-page"><div className="intro"><div><em>SHARED GEAR / 002</em><h1>多武器通用装备规划</h1><p>把共同需求放进同一件装备，减少重复制作和能力碎片消耗。</p></div><span className="version-pill">规划草案 · 3把武器</span></div>
 <div className="planner-grid"><section className="planner-controls">
  <Title n="01" text="选择你常用的配装"><button><Plus size={14}/>添加武器</button></Title>
  <div className="weapon-list">{planningWeapons.map((w,i)=><button key={w.id} className={chosen.includes(w.id)?'selected':''} onClick={()=>toggle(w.id)}><span className="weapon-dot" style={{background:w.accent}}>{i===0?'89':i===1?'枪':'叶'}</span><div><b>{w.name}</b><small>{w.role}</small><em>{w.needs.join(' · ')}</em></div><span className="tick">{chosen.includes(w.id)?<Check size={14}/>:<Plus size={14}/>}</span></button>)}</div>
  <Title n="02" text="这次优先考虑什么"><small>可随时重新计算</small></Title>
  <div className="goal-pills">{['省碎片','最少妥协','容易购买'].map(x=><button className={goal===x?'active':''} onClick={()=>setGoal(x)} key={x}>{x}</button>)}</div>
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
 <aside className="ability-detail"><div className="ability-name"><AbilityIcon ability={current}/><div><small>{current.group} / 当前选中</small><h2>{current.name}</h2></div></div><div className="detail-tags"><span>可作为小技能</span><span>{current.group}</span><span>存在边际收益</span></div><div className="wiki-callout"><b>对 N-ZAP89 的意义</b><p>{current.id==='iss'?'降低机器人炸弹耗墨，并增加投掷后可以继续射击的次数。若目标是双投，需要直接规划到关键 AP 档位。':'选择武器后，这里将转换成实际动作、阈值与机会成本，而不只显示抽象参数。'}</p></div><h3>常见投入方式</h3><div className="ap-recipes"><button><b>3AP</b><span>轻量投入</span><small>占用 1 个追加能力槽</small></button><button className="active"><b>6AP</b><span>平衡投入</span><small>适合通用装备</small></button><button><b>专项</b><span>围绕临界点</span><small>按武器计算</small></button></div><button className="primary"><Zap size={15}/>围绕此能力进入实验室</button></aside></div></section>
}

function SchemeLibrary({onOpen}:{onOpen:(scheme:ExampleScheme)=>void}){
 const[query,setQuery]=useState(''),[copyStatus,setCopyStatus]=useState<string|null>(null);
 const[filters,setFilters]=useState<SchemeFilters>({tags:[],modes:[],weaponIds:[]});
 const allTags=[...new Set(exampleSchemes.flatMap(scheme=>scheme.tags))];
 const schemeWeapons=[...new Set(exampleSchemes.map(scheme=>scheme.weaponId))].map(getWeapon);
 const activeFilterCount=Object.values(filters).reduce((total,values)=>total+values.length,0);
 const toggleFilter=(key:keyof SchemeFilters,value:string)=>setFilters(current=>{const values=current[key] as readonly string[];return{...current,[key]:values.includes(value)?values.filter(item=>item!==value):[...values,value]} as SchemeFilters});
 const clearFilters=()=>setFilters({tags:[],modes:[],weaponIds:[]});
 const visibleSchemes=exampleSchemes.filter(scheme=>schemeMatchesFilters(scheme,filters)&&schemeMatchesQuery(scheme,getWeapon(scheme.weaponId).name,query));
 const copyScheme=async(scheme:ExampleScheme)=>{const url=`${window.location.origin}${window.location.pathname}?${encodeLoadoutQuery({weaponId:scheme.weaponId,slots:cloneSchemeSlots(scheme)})}`;try{await navigator.clipboard.writeText(url);setCopyStatus(scheme.id);setTimeout(()=>setCopyStatus(null),1800)}catch{setCopyStatus('error:'+scheme.id)}};
 return <section className="workspace library-page"><div className="intro"><div><em>PLAYER BUILDS / SAMPLE</em><h1>玩家方案示例库</h1><p>选择一套完整的 57AP 示例，再带回实验室继续比较和微调。</p></div><button className="primary compact" disabled title="账号与投稿将在 Community Beta 开放"><Plus size={15}/> 投稿暂未开放</button></div>
 <div className="library-toolbar"><div><button className="active">全部示例</button><span>{visibleSchemes.length} / {exampleSchemes.length}</span></div><label><Search size={14}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="搜索武器、标签或说明"/></label></div>
 <section className="scheme-filter-board"><header><div><b>组合标签筛选</b><span>同组内任一符合 · 不同组同时符合</span></div><button onClick={clearFilters} disabled={activeFilterCount===0}>清除筛选 {activeFilterCount>0?`(${activeFilterCount})`:''}</button></header>
  <FilterRow label="方案标签">{allTags.map(tag=><button className={filters.tags.includes(tag)?'active':''} key={tag} onClick={()=>toggleFilter('tags',tag)}>{tag}</button>)}</FilterRow>
  <FilterRow label="对战模式">{gameModes.map(mode=><button className={filters.modes.includes(mode.id)?'active':''} key={mode.id} onClick={()=>toggleFilter('modes',mode.id)}>{mode.label}</button>)}</FilterRow>
  <FilterRow label="使用武器">{schemeWeapons.map(weapon=><button className={filters.weaponIds.includes(weapon.id)?'active':''} key={weapon.id} onClick={()=>toggleFilter('weaponIds',weapon.id)}><span>{weapon.badge}</span>{weapon.name}</button>)}</FilterRow>
 </section>
 <div className="build-gallery"><div className="build-list">{visibleSchemes.map(scheme=>{const schemeWeapon=getWeapon(scheme.weaponId);return <article className="build-card" key={scheme.id}>
  <div className="build-card-title"><div>{scheme.tags.map(tag=><button className={filters.tags.includes(tag)?'active':''} onClick={()=>toggleFilter('tags',tag)} key={tag}>{tag}</button>)}</div><div className="build-card-side"><div className="build-modes">{scheme.modes.map(modeId=><button className={`build-mode mode-${modeId} ${filters.modes.includes(modeId)?'active':''}`} onClick={()=>toggleFilter('modes',modeId)} key={modeId}>{gameModes.find(({id})=>id===modeId)?.label}</button>)}</div><small>内置示例 · 非攻略结论</small></div></div>
  <div className="build-meta"><b>INKLAB 示例</b><span>{scheme.id.replace('sample-','方案 #')}</span><time>Ver. {DATA_VERSION}</time></div>
  <div className="build-weapon"><span className="weapon-badge">{schemeWeapon.badge}</span><div><small>使用武器</small><button className={filters.weaponIds.includes(schemeWeapon.id)?'active':''} onClick={()=>toggleFilter('weaponIds',schemeWeapon.id)}>{schemeWeapon.name}</button><em>{schemeWeapon.sub.name} · {schemeWeapon.special}</em></div></div>
  <div className="submitted-gears">{['头部','服装','鞋子'].map((part,row)=><div className="submitted-gear" key={part}><div className={'gear-reference '+(row===2?'with-reference':'')}><span>{row===0?'帽':row===1?'衣':'鞋'}</span><small>{row===2?'可作为微调起点':part+' · 57AP 结构'}</small></div><section>{scheme.slots.slice(row*4,row*4+4).map(([id,ap],i)=><div className={i===0?'main':''} key={`${id}-${i}`}><AbilityIcon ability={abilities.find(a=>a.id===id)} small/><em>{ap}</em></div>)}</section></div>)}</div>
  <div className="author-note"><b>示例边界</b><p>{scheme.note}</p></div>
  <div className="build-actions"><button onClick={()=>copyScheme(scheme)}><Copy size={14}/> {copyStatus===scheme.id?'链接已复制':copyStatus==='error:'+scheme.id?'复制失败':'复制分享链接'}</button><button className="lab-action" onClick={()=>onOpen(scheme)}><Zap size={14}/> 打开实验室微调</button></div>
 </article>})}{visibleSchemes.length===0?<div className="library-empty"><Search size={20}/><b>没有匹配的示例</b><span>换一个武器名称或玩法标签试试。</span></div>:null}</div>
 <aside className="card-anatomy"><small>真实可用的示例流程</small><ol><li><b>01 搜索与标签</b><span>按武器、玩法标签和说明筛选</span></li><li><b>02 完整结构</b><span>每套都包含 3 个主技能和 9 个小技能</span></li><li><b>03 分享链接</b><span>复制后可直接恢复武器与 57AP 配装</span></li><li><b>04 带回实验室</b><span>一键载入为自定义配装并继续替换能力</span></li></ol><div><Sparkles size={15}/><p>这里暂时只提供经过结构校验的内置示例；账号、投稿和审核仍留在 Community Beta。</p></div></aside>
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

function FilterRow({label,children}:{label:string;children:React.ReactNode}){return <div className="scheme-filter-row"><b>{label}</b><div>{children}</div></div>}
