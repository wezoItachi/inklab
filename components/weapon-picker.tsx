'use client';

import {useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {Check,ChevronDown,Search,X} from 'lucide-react';
import {filterWeaponPickerItems,getWeaponPickerFamilies,type WeaponPickerItem} from '@/lib/weapon-picker';

type WeaponPickerProps={
 items:readonly WeaponPickerItem[];
 value:string;
 onChange:(id:string)=>void;
 title:string;
 description?:string;
 trigger:ReactNode;
 triggerClassName?:string;
 triggerLabel:string;
};

export function WeaponPicker({items,value,onChange,title,description,trigger,triggerClassName='',triggerLabel}:WeaponPickerProps){
 const[open,setOpen]=useState(false),[family,setFamily]=useState('全部'),[query,setQuery]=useState('');
 const searchRef=useRef<HTMLInputElement>(null),triggerRef=useRef<HTMLButtonElement>(null);
 const families=useMemo(()=>getWeaponPickerFamilies(items),[items]);
 const shown=useMemo(()=>filterWeaponPickerItems(items,family,query),[family,items,query]);
 const selected=items.find(item=>item.id===value);
 const close=()=>{setOpen(false);setQuery('');requestAnimationFrame(()=>triggerRef.current?.focus())};
 const choose=(id:string)=>{onChange(id);close()};
 useEffect(()=>{
  if(!open)return;
  searchRef.current?.focus();
  const handleKey=(event:KeyboardEvent)=>{if(event.key==='Escape')close()};
  window.addEventListener('keydown',handleKey);
  return()=>window.removeEventListener('keydown',handleKey);
 },[open]);
 return <>
  <button ref={triggerRef} type="button" className={`weapon-picker-trigger ${triggerClassName}`} aria-haspopup="dialog" aria-expanded={open} aria-label={triggerLabel} onClick={()=>setOpen(true)}>{trigger}<ChevronDown size={17}/></button>
  {open&&createPortal(<div className="weapon-picker-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)close()}}><dialog open className="weapon-picker-dialog" aria-labelledby="weapon-picker-title">
   <header><div><small>WEAPON SELECT</small><h2 id="weapon-picker-title">{title}</h2><p>{description??`当前选择：${selected?.name??'未选择'}`}</p></div><button type="button" className="weapon-picker-close" aria-label="关闭武器选择" onClick={close}><X size={19}/></button></header>
   <div className="weapon-picker-tools"><label><Search size={16}/><input ref={searchRef} value={query} onChange={event=>setQuery(event.target.value)} placeholder="搜索武器、种类或标签"/></label><b>{shown.length} / {items.length}</b></div>
   <div className="weapon-picker-families" role="tablist" aria-label="武器种类"><button role="tab" aria-selected={family==='全部'} className={family==='全部'?'active':''} onClick={()=>setFamily('全部')}>全部</button>{families.map(item=><button role="tab" aria-selected={family===item} className={family===item?'active':''} onClick={()=>setFamily(item)} key={item}>{item}</button>)}</div>
   <div className="weapon-picker-results">{shown.map(item=><button type="button" className={item.id===value?'selected':''} aria-pressed={item.id===value} onClick={()=>choose(item.id)} key={item.id}><span>{item.badge??item.name.slice(0,1)}</span><div><b>{item.name}</b><small>{item.family}{item.meta?` · ${item.meta}`:''}</small>{item.tags?.length?<em>{item.tags.join(' · ')}</em>:null}</div>{item.id===value?<Check size={17}/>:null}</button>)}{shown.length===0&&<div className="weapon-picker-empty"><b>没有符合条件的武器</b><span>更换种类或搜索词后再试。</span></div>}</div>
  </dialog></div>,document.body)}
 </>;
}
