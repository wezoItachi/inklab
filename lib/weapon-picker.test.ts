import assert from 'node:assert/strict';
import test from 'node:test';
import {filterWeaponPickerItems,getWeaponPickerFamilies,type WeaponPickerItem} from './weapon-picker.ts';

const items:WeaponPickerItem[]=[
  {id:'a',name:'测试射击枪',family:'射击枪',meta:'机器人炸弹',tags:['短手']},
  {id:'b',name:'测试滚筒',family:'滚筒',meta:'涂地',tags:['高机动']},
];

void test('weapon picker exposes stable family choices',()=>{
  assert.deepEqual(getWeaponPickerFamilies(items),['射击枪','滚筒']);
});

void test('weapon picker combines family and searchable metadata',()=>{
  assert.deepEqual(filterWeaponPickerItems(items,'全部','机器人').map(({id})=>id),['a']);
  assert.deepEqual(filterWeaponPickerItems(items,'滚筒','高机动').map(({id})=>id),['b']);
  assert.deepEqual(filterWeaponPickerItems(items,'射击枪','高机动'),[]);
});
