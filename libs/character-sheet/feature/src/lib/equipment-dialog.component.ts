import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { NgTemplateOutlet } from '@angular/common';
import { Observable } from 'rxjs';

// ─── Types ───────────────────────────────────────────────────────────────────

export type EquipSlot =
  | 'head' | 'neck' | 'chest' | 'hands' | 'feet'
  | 'ring1' | 'ring2' | 'back' | 'mainHand' | 'offHand';

type ArmorKind = 'light' | 'medium' | 'heavy';
type Category = 'weapon' | 'armor' | 'shield' | 'accessory';

interface WeaponStats  { kind: 'weapon';    damage: string; damageType: string; versatile?: string; properties: string[]; range?: string; }
interface ArmorStats   { kind: 'armor';     armorKind: ArmorKind; baseAC: number; maxDex: number | null; stealth?: boolean; strReq?: number; }
interface ShieldStats  { kind: 'shield';    acBonus: number; }
interface AccessStats  { kind: 'accessory'; description: string; }
type ItemStats = WeaponStats | ArmorStats | ShieldStats | AccessStats;

interface DndItem {
  id: string; nameCz: string; nameEn: string; category: Category;
  slot: EquipSlot | EquipSlot[]; stats: ItemStats;
  rarity: 'common' | 'uncommon' | 'rare';
}
export interface EquipmentDialogData { dexMod: number; strScore: number; }

// ─── Item Images ─────────────────────────────────────────────────────────────
// Real images downloaded from Wikimedia Commons (CC-licensed)

const ITEM_IMAGES: Record<string, string> = {
  dagger:       'items/dagger.jpg',
  shortsword:   'items/shortsword.jpg',
  longsword:    'items/longsword.jpg',
  greatsword:   'items/greatsword.jpg',
  rapier:       'items/rapier.jpg',
  scimitar:     'items/scimitar.jpg',
  handaxe:      'items/handaxe.png',
  battleaxe:    'items/battleaxe.jpg',
  greataxe:     'items/greataxe.jpg',
  mace:         'items/mace.jpg',
  quarterstaff: 'items/quarterstaff.jpg',
  warhammer:    'items/warhammer.png',
  shortbow:     'items/shortbow.jpg',
  longbow:      'items/longbow.jpg',
  spear:        'items/spear.png',
  leather:      'items/leather.jpg',
  studded:      'items/studded.jpg',
  chainshirt:   'items/chainshirt.jpg',
  breastplate:  'items/breastplate.jpg',
  halfplate:    'items/halfplate.jpg',
  chainmail:    'items/chainmail.jpg',
  splint:       'items/splint.jpg',
  plate:        'items/plate.jpg',
  shield:       'items/shield.jpg',
  helmet:       'items/helmet.jpg',
  cloak:        'items/cloak.jpg',
  amulet:       'items/amulet.jpg',
  ringitem:     'items/ringitem.jpg',
  boots:        'items/boots.jpg',
  gloves:       'items/gloves.jpg',
};

// ─── Item Catalogue ──────────────────────────────────────────────────────────

const ALL_ITEMS: DndItem[] = [
  { id:'dagger',       nameCz:'Dýka',              nameEn:'Dagger',          category:'weapon',    slot:['mainHand','offHand'], rarity:'common',   stats:{kind:'weapon',  damage:'1k4',  damageType:'Bodné',  properties:['Jemná','Lehká','Hování 20/60']} },
  { id:'handaxe',      nameCz:'Ruční sekyrka',     nameEn:'Handaxe',         category:'weapon',    slot:['mainHand','offHand'], rarity:'common',   stats:{kind:'weapon',  damage:'1k6',  damageType:'Sečné',  properties:['Lehká','Hování 20/60']} },
  { id:'mace',         nameCz:'Palcát',            nameEn:'Mace',            category:'weapon',    slot:'mainHand',             rarity:'common',   stats:{kind:'weapon',  damage:'1k6',  damageType:'Drtivé', properties:[]} },
  { id:'quarterstaff', nameCz:'Čtvrtpalice',       nameEn:'Quarterstaff',    category:'weapon',    slot:'mainHand',             rarity:'common',   stats:{kind:'weapon',  damage:'1k6',  damageType:'Drtivé', properties:['Všestranná'], versatile:'1k8'} },
  { id:'spear',        nameCz:'Kopí',              nameEn:'Spear',           category:'weapon',    slot:'mainHand',             rarity:'common',   stats:{kind:'weapon',  damage:'1k6',  damageType:'Bodné',  properties:['Hování 20/60','Všestranná'], versatile:'1k8'} },
  { id:'shortbow',     nameCz:'Krátký luk',        nameEn:'Shortbow',        category:'weapon',    slot:'mainHand',             rarity:'common',   stats:{kind:'weapon',  damage:'1k6',  damageType:'Bodné',  properties:['Munice','Obouruční'], range:'80/320'} },
  { id:'shortsword',   nameCz:'Krátký meč',        nameEn:'Shortsword',      category:'weapon',    slot:['mainHand','offHand'], rarity:'common',   stats:{kind:'weapon',  damage:'1k6',  damageType:'Bodné',  properties:['Jemná','Lehká']} },
  { id:'longsword',    nameCz:'Dlouhý meč',        nameEn:'Longsword',       category:'weapon',    slot:'mainHand',             rarity:'common',   stats:{kind:'weapon',  damage:'1k8',  damageType:'Sečné',  properties:['Všestranná'], versatile:'1k10'} },
  { id:'rapier',       nameCz:'Rapír',             nameEn:'Rapier',          category:'weapon',    slot:'mainHand',             rarity:'common',   stats:{kind:'weapon',  damage:'1k8',  damageType:'Bodné',  properties:['Jemná']} },
  { id:'scimitar',     nameCz:'Šavle',             nameEn:'Scimitar',        category:'weapon',    slot:['mainHand','offHand'], rarity:'common',   stats:{kind:'weapon',  damage:'1k6',  damageType:'Sečné',  properties:['Jemná','Lehká']} },
  { id:'battleaxe',    nameCz:'Válečná sekera',    nameEn:'Battleaxe',       category:'weapon',    slot:'mainHand',             rarity:'common',   stats:{kind:'weapon',  damage:'1k8',  damageType:'Sečné',  properties:['Všestranná'], versatile:'1k10'} },
  { id:'warhammer',    nameCz:'Válečné kladivo',   nameEn:'Warhammer',       category:'weapon',    slot:'mainHand',             rarity:'common',   stats:{kind:'weapon',  damage:'1k8',  damageType:'Drtivé', properties:['Všestranná'], versatile:'1k10'} },
  { id:'greatsword',   nameCz:'Obouruční meč',     nameEn:'Greatsword',      category:'weapon',    slot:'mainHand',             rarity:'common',   stats:{kind:'weapon',  damage:'2k6',  damageType:'Sečné',  properties:['Těžká','Obouruční']} },
  { id:'greataxe',     nameCz:'Velká sekera',      nameEn:'Greataxe',        category:'weapon',    slot:'mainHand',             rarity:'common',   stats:{kind:'weapon',  damage:'1k12', damageType:'Sečné',  properties:['Těžká','Obouruční']} },
  { id:'longbow',      nameCz:'Dlouhý luk',        nameEn:'Longbow',         category:'weapon',    slot:'mainHand',             rarity:'common',   stats:{kind:'weapon',  damage:'1k8',  damageType:'Bodné',  properties:['Munice','Těžká','Obouruční'], range:'150/600'} },
  { id:'leather',      nameCz:'Kožená zbroj',      nameEn:'Leather',         category:'armor',     slot:'chest',                rarity:'common',   stats:{kind:'armor',   armorKind:'light',  baseAC:11, maxDex:null} },
  { id:'studded',      nameCz:'Pobíjená kůže',     nameEn:'Studded Leather', category:'armor',     slot:'chest',                rarity:'common',   stats:{kind:'armor',   armorKind:'light',  baseAC:12, maxDex:null} },
  { id:'chainshirt',   nameCz:'Kroužková košile',  nameEn:'Chain Shirt',     category:'armor',     slot:'chest',                rarity:'common',   stats:{kind:'armor',   armorKind:'medium', baseAC:13, maxDex:2} },
  { id:'breastplate',  nameCz:'Kyrys',             nameEn:'Breastplate',     category:'armor',     slot:'chest',                rarity:'common',   stats:{kind:'armor',   armorKind:'medium', baseAC:14, maxDex:2} },
  { id:'halfplate',    nameCz:'Polodesková',       nameEn:'Half Plate',      category:'armor',     slot:'chest',                rarity:'common',   stats:{kind:'armor',   armorKind:'medium', baseAC:15, maxDex:2,  stealth:true} },
  { id:'chainmail',    nameCz:'Kroužková zbroj',   nameEn:'Chain Mail',      category:'armor',     slot:'chest',                rarity:'common',   stats:{kind:'armor',   armorKind:'heavy',  baseAC:16, maxDex:0,  stealth:true, strReq:13} },
  { id:'splint',       nameCz:'Dlanicová zbroj',   nameEn:'Splint',          category:'armor',     slot:'chest',                rarity:'common',   stats:{kind:'armor',   armorKind:'heavy',  baseAC:17, maxDex:0,  stealth:true, strReq:15} },
  { id:'plate',        nameCz:'Plná desková',      nameEn:'Plate',           category:'armor',     slot:'chest',                rarity:'uncommon', stats:{kind:'armor',   armorKind:'heavy',  baseAC:18, maxDex:0,  stealth:true, strReq:15} },
  { id:'shield',       nameCz:'Štít',              nameEn:'Shield',          category:'shield',    slot:'offHand',              rarity:'common',   stats:{kind:'shield',  acBonus:2} },
  { id:'helmet',       nameCz:'Přilba',            nameEn:'Helmet',          category:'accessory', slot:'head',                 rarity:'common',   stats:{kind:'accessory', description:'Ochrana hlavy'} },
  { id:'cloak',        nameCz:'Plášť',             nameEn:'Cloak',           category:'accessory', slot:'back',                 rarity:'common',   stats:{kind:'accessory', description:'Ochrana a utajení'} },
  { id:'amulet',       nameCz:'Amulet',            nameEn:'Amulet',          category:'accessory', slot:'neck',                 rarity:'uncommon', stats:{kind:'accessory', description:'Magický přívěsek'} },
  { id:'ringitem',     nameCz:'Prsten',            nameEn:'Ring',            category:'accessory', slot:['ring1','ring2'],      rarity:'uncommon', stats:{kind:'accessory', description:'Magický prsten'} },
  { id:'boots',        nameCz:'Boty',              nameEn:'Boots',           category:'accessory', slot:'feet',                 rarity:'common',   stats:{kind:'accessory', description:'Ochrana nohou'} },
  { id:'gloves',       nameCz:'Rukavice',          nameEn:'Gloves',          category:'accessory', slot:'hands',                rarity:'common',   stats:{kind:'accessory', description:'Ochrana rukou'} },
];

const SLOT_LABELS: Record<EquipSlot, string> = {
  head:'Hlava', neck:'Krk', chest:'Hruď', hands:'Ruce', feet:'Boty',
  ring1:'Prsten L', ring2:'Prsten P', back:'Plášť', mainHand:'Zbraň', offHand:'Štít / Zbraň 2',
};
const SLOT_ICON: Record<EquipSlot, string> = {
  head:'military_tech', neck:'diamond', chest:'shield', hands:'pan_tool', feet:'hiking',
  ring1:'radio_button_unchecked', ring2:'radio_button_unchecked', back:'layers',
  mainHand:'gavel', offHand:'security',
};

// ─── Component ───────────────────────────────────────────────────────────────

@Component({
  selector: 'equipment-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatTooltip, NgTemplateOutlet],
  styles: `
    :host { font-family:'Mikadan',sans-serif; display:block; }
    * { scrollbar-width:thin; scrollbar-color:rgba(200,160,60,.4) rgba(10,8,20,.6); }

    .dlg { display:flex; flex-direction:column; height:85vh; max-height:820px; background:#0d0b1a; color:#d4c9a0; overflow:hidden; }

    .dlg-header { display:flex; align-items:center; justify-content:space-between; padding:14px 20px 12px; flex-shrink:0; border-bottom:1px solid rgba(200,160,60,.25); background:linear-gradient(180deg,rgba(28,18,4,.9) 0%,rgba(10,8,20,.9) 100%); }
    .dlg-title  { display:flex; align-items:center; gap:10px; font-size:20px; letter-spacing:.14em; text-transform:uppercase; color:#e8c96a; text-shadow:0 0 20px rgba(200,160,60,.5); }
    .dlg-title mat-icon { font-size:26px; width:26px; height:26px; color:#c8a03c; }
    .dlg-close  { background:none; border:1px solid rgba(200,160,60,.25); border-radius:4px; color:rgba(200,160,60,.6); cursor:pointer; width:32px; height:32px; display:flex; align-items:center; justify-content:center; transition:all .18s; }
    .dlg-close:hover { border-color:rgba(200,160,60,.7); color:#e8c96a; background:rgba(200,160,60,.1); }

    .dlg-body { display:flex; flex:1; min-height:0; overflow:hidden; }

    /* ── Left panel ── */
    .panel-equip { width:272px; flex-shrink:0; display:flex; flex-direction:column; padding:14px 12px; border-right:1px solid rgba(200,160,60,.15); background:rgba(5,4,12,.6); overflow-y:auto; gap:6px; }
    .panel-equip-title { font-size:9px; letter-spacing:.16em; text-transform:uppercase; color:rgba(200,160,60,.4); text-align:center; margin-bottom:2px; }

    .equip-row { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
    .equip-row.single { grid-template-columns:1fr; }

    .slot-btn { width:100%; display:flex; align-items:center; gap:7px; padding:7px 9px; border-radius:5px; cursor:pointer; transition:all .2s; border:1px solid rgba(200,160,60,.18); background:rgba(20,16,36,.7); font-family:'Mikadan',sans-serif; font-size:10px; color:rgba(200,160,60,.6); text-align:left; min-height:48px; }
    .slot-btn:hover { border-color:rgba(200,160,60,.5); background:rgba(200,160,60,.07); color:#e8c96a; }
    .slot-btn.has-item { border-color:rgba(200,160,60,.45); background:rgba(200,160,60,.07); }
    .slot-btn.has-item .slot-label { color:#d4a840; }
    .slot-ico { font-size:16px; width:16px; height:16px; opacity:.45; flex-shrink:0; }
    .slot-ico.filled { opacity:1; color:#c8a03c; }
    .slot-info { display:flex; flex-direction:column; gap:1px; flex:1; min-width:0; }
    .slot-label { font-size:8.5px; letter-spacing:.1em; text-transform:uppercase; color:rgba(200,160,60,.4); }
    .slot-item-name { font-size:10.5px; color:#d4c9a0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .slot-empty-txt { font-size:10px; color:rgba(200,160,60,.22); font-style:italic; }
    .slot-remove { margin-left:auto; background:none; border:none; cursor:pointer; color:rgba(200,90,50,.45); display:flex; align-items:center; flex-shrink:0; border-radius:3px; padding:2px; transition:color .15s; }
    .slot-remove:hover { color:rgba(220,70,30,.9); }
    .slot-thumb { width:26px; height:26px; flex-shrink:0; }
    .slot-thumb img { width:100%; height:100%; object-fit:contain; }

    /* AC box */
    .ac-box { border:1px solid rgba(200,160,60,.35); border-radius:6px; padding:10px 12px; text-align:center; background:rgba(15,12,28,.9); margin-top:4px; }
    .ac-number { font-size:40px; color:#e8c96a; line-height:1; text-shadow:0 0 24px rgba(200,160,60,.55); }
    .ac-title  { font-size:8.5px; letter-spacing:.15em; text-transform:uppercase; color:rgba(200,160,60,.4); margin-top:2px; }
    .ac-formula{ font-size:9.5px; color:rgba(200,160,60,.5); margin-top:4px; font-style:italic; line-height:1.4; }

    /* ── Right panel ── */
    .panel-catalog { flex:1; min-width:0; display:flex; flex-direction:column; background:rgba(8,6,18,.85); position:relative; }

    .cat-tabs { display:flex; border-bottom:1px solid rgba(200,160,60,.2); flex-shrink:0; }
    .cat-tab { flex:1; padding:11px 4px; font-size:10px; letter-spacing:.12em; text-transform:uppercase; border:none; background:none; cursor:pointer; color:rgba(200,160,60,.4); font-family:'Mikadan',sans-serif; border-bottom:2px solid transparent; transition:all .18s; display:flex; align-items:center; justify-content:center; gap:5px; }
    .cat-tab:hover { color:rgba(200,160,60,.7); background:rgba(200,160,60,.04); }
    .cat-tab.active { color:#e8c96a; border-bottom-color:#c8a03c; background:rgba(200,160,60,.07); }
    .cat-tab mat-icon { font-size:14px; width:14px; height:14px; }

    .item-grid { flex:1; overflow-y:auto; padding:12px; display:grid; grid-template-columns:repeat(auto-fill,minmax(128px,1fr)); gap:9px; align-content:start; }

    .item-card { border:1px solid rgba(200,160,60,.18); border-radius:6px; background:rgba(20,16,36,.82); cursor:pointer; transition:all .22s; display:flex; flex-direction:column; overflow:hidden; position:relative; }
    .item-card:hover { border-color:rgba(200,160,60,.55); background:rgba(200,160,60,.08); transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,.5),0 0 14px rgba(200,160,60,.1); }
    .item-card.equipped { border-color:rgba(200,160,60,.7); background:rgba(200,160,60,.12); box-shadow:0 0 18px rgba(200,160,60,.22); }
    .item-card.equipped::after { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,#c8a03c,transparent); }

    .rarity-uncommon .card-img { background:radial-gradient(ellipse at center,rgba(30,80,30,.25) 0%,rgba(0,0,0,.3) 100%); }
    .rarity-rare     .card-img { background:radial-gradient(ellipse at center,rgba(30,50,120,.25) 0%,rgba(0,0,0,.3) 100%); }
    .card-img { height:86px; display:flex; align-items:center; justify-content:center; padding:6px; background:radial-gradient(ellipse at center,rgba(20,15,40,.8) 0%,rgba(5,3,12,.95) 100%); border-bottom:1px solid rgba(200,160,60,.1); }
    .card-img img { height:74px; width:auto; max-width:86px; object-fit:contain; filter:drop-shadow(0 2px 10px rgba(0,0,0,.95)) sepia(0.15); transition:transform .2s; }
    .item-card:hover .card-img img { transform:scale(1.08); }
    .card-body { padding:7px 8px 8px; flex:1; display:flex; flex-direction:column; gap:2px; }
    .card-name { font-size:11px; color:#d4c9a0; font-weight:bold; line-height:1.2; }
    .card-en   { font-size:8.5px; color:rgba(200,160,60,.3); font-style:italic; }
    .card-stat { font-size:10px; color:rgba(210,210,170,.75); margin-top:1px; }
    .card-props { display:flex; flex-wrap:wrap; gap:3px; margin-top:4px; }
    .prop-tag { font-size:8px; padding:1px 5px; border-radius:10px; background:rgba(200,160,60,.1); border:1px solid rgba(200,160,60,.2); color:rgba(200,160,60,.65); white-space:nowrap; }
    .prop-tag.warn { background:rgba(200,60,30,.12); border-color:rgba(200,60,30,.3); color:rgba(230,100,60,.8); }
    .equipped-badge { position:absolute; top:5px; right:5px; background:rgba(200,160,60,.9); border-radius:50%; width:17px; height:17px; display:flex; align-items:center; justify-content:center; }
    .equipped-badge mat-icon { font-size:11px; width:11px; height:11px; color:#1a1020; }

    /* ── Hover Preview Panel ── */
    .item-preview { position:absolute; top:8px; right:8px; width:210px; background:linear-gradient(160deg,rgba(18,14,34,.98) 0%,rgba(10,8,22,.98) 100%); border:1px solid rgba(200,160,60,.45); border-radius:10px; z-index:10; overflow:hidden; pointer-events:none; animation:fadeIn .15s ease; box-shadow:0 8px 32px rgba(0,0,0,.8), 0 0 20px rgba(200,160,60,.12); }
    @keyframes fadeIn { from { opacity:0; transform:translateY(-6px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }
    .preview-img-wrap { height:150px; display:flex; align-items:center; justify-content:center; background:radial-gradient(ellipse at center,rgba(25,18,50,.9) 0%,rgba(8,5,18,.95) 100%); border-bottom:1px solid rgba(200,160,60,.2); padding:12px; }
    .preview-img-wrap img { height:130px; width:auto; max-width:180px; object-fit:contain; filter:drop-shadow(0 4px 16px rgba(0,0,0,1)); }
    .preview-body { padding:10px 12px 12px; }
    .preview-name { font-size:14px; color:#e8c96a; letter-spacing:.06em; line-height:1.2; }
    .preview-en   { font-size:9.5px; color:rgba(200,160,60,.4); font-style:italic; margin-bottom:6px; }
    .preview-stat { font-size:11px; color:#d4c9a0; margin-bottom:4px; }
    .preview-props { display:flex; flex-wrap:wrap; gap:3px; margin-top:4px; }

    /* Stats panel */
    .stats-panel { border-top:1px solid rgba(200,160,60,.2); padding:11px 16px; background:rgba(5,4,12,.92); flex-shrink:0; }
    .stats-title { font-size:8.5px; letter-spacing:.16em; text-transform:uppercase; color:rgba(200,160,60,.4); margin-bottom:7px; }
    .stats-rows { display:flex; flex-wrap:wrap; gap:12px; }
    .stat-row { display:flex; align-items:center; gap:6px; }
    .stat-ico  { font-size:16px; width:16px; height:16px; color:#c8a03c; }
    .stat-txt  { font-size:11px; color:#d4c9a0; }
    .stat-warn { color:rgba(230,100,50,.85) !important; }
    .stats-empty { font-size:11px; color:rgba(200,160,60,.22); font-style:italic; }
  `,
  template: `
  <div class="dlg">

    <div class="dlg-header">
      <div class="dlg-title"><mat-icon>auto_awesome</mat-icon>Výbava postavy</div>
      <button class="dlg-close" (click)="close()"><mat-icon>close</mat-icon></button>
    </div>

    <div class="dlg-body">

      <!-- ── Left: Equipment Slots ── -->
      <div class="panel-equip">
        <div class="panel-equip-title">Vybavené předměty</div>

        <!-- head -->
        <div class="equip-row single">
          <ng-container *ngTemplateOutlet="slotTmpl; context:{slot:'head'}"/>
        </div>
        <!-- neck + back -->
        <div class="equip-row">
          <ng-container *ngTemplateOutlet="slotTmpl; context:{slot:'neck'}"/>
          <ng-container *ngTemplateOutlet="slotTmpl; context:{slot:'back'}"/>
        </div>
        <!-- chest -->
        <div class="equip-row single">
          <ng-container *ngTemplateOutlet="slotTmpl; context:{slot:'chest'}"/>
        </div>
        <!-- hands + ring1 -->
        <div class="equip-row">
          <ng-container *ngTemplateOutlet="slotTmpl; context:{slot:'hands'}"/>
          <ng-container *ngTemplateOutlet="slotTmpl; context:{slot:'ring1'}"/>
        </div>
        <!-- feet + ring2 -->
        <div class="equip-row">
          <ng-container *ngTemplateOutlet="slotTmpl; context:{slot:'feet'}"/>
          <ng-container *ngTemplateOutlet="slotTmpl; context:{slot:'ring2'}"/>
        </div>
        <!-- weapons -->
        <div class="equip-row">
          <ng-container *ngTemplateOutlet="slotTmpl; context:{slot:'mainHand'}"/>
          <ng-container *ngTemplateOutlet="slotTmpl; context:{slot:'offHand'}"/>
        </div>

        <!-- AC -->
        <div class="ac-box">
          <div class="ac-number">{{ totalAC() }}</div>
          <div class="ac-title">Obranné číslo (OČ)</div>
          <div class="ac-formula">{{ acFormula() }}</div>
        </div>
      </div>

      <!-- ── Right: Catalogue ── -->
      <div class="panel-catalog">

        <div class="cat-tabs">
          <button class="cat-tab" [class.active]="tab()==='weapon'"    (click)="tab.set('weapon')">    <mat-icon>gavel</mat-icon>   Zbraně  </button>
          <button class="cat-tab" [class.active]="tab()==='armor'"     (click)="tab.set('armor')">     <mat-icon>shield</mat-icon>  Zbroje  </button>
          <button class="cat-tab" [class.active]="tab()==='shield'"    (click)="tab.set('shield')">    <mat-icon>security</mat-icon>Štíty   </button>
          <button class="cat-tab" [class.active]="tab()==='accessory'" (click)="tab.set('accessory')"> <mat-icon>diamond</mat-icon> Doplňky </button>
        </div>

        <div class="item-grid">
          @for (item of visibleItems(); track item.id) {
            <div class="item-card rarity-{{item.rarity}}" [class.equipped]="isEquipped(item.id)"
                 (click)="onCardClick(item)"
                 (mouseenter)="hoveredItem.set(item)"
                 (mouseleave)="hoveredItem.set(null)"
                 [matTooltip]="'Klikni pro vybavení: ' + item.nameCz">
              <div class="card-img">
                <img [src]="imgSrc(item.id)" [alt]="item.nameEn" (error)="onImgError($event)"/>
              </div>
              <div class="card-body">
                <div class="card-name">{{ item.nameCz }}</div>
                <div class="card-en">{{ item.nameEn }}</div>
                <div class="card-stat">{{ cardStat(item) }}</div>
                <div class="card-props">
                  @for (p of cardProps(item); track p.label) {
                    <span class="prop-tag" [class.warn]="p.warn">{{ p.label }}</span>
                  }
                </div>
              </div>
              @if (isEquipped(item.id)) {
                <div class="equipped-badge"><mat-icon>check</mat-icon></div>
              }
            </div>
          }
        </div>

        <!-- ── Hover Preview ── -->
        @if (hoveredItem()) {
          <div class="item-preview">
            <div class="preview-img-wrap">
              <img [src]="imgSrc(hoveredItem()!.id)" [alt]="hoveredItem()!.nameEn" (error)="onImgError($event)"/>
            </div>
            <div class="preview-body">
              <div class="preview-name">{{ hoveredItem()!.nameCz }}</div>
              <div class="preview-en">{{ hoveredItem()!.nameEn }}</div>
              <div class="preview-stat">{{ cardStat(hoveredItem()!) }}</div>
              <div class="preview-props">
                @for (p of cardProps(hoveredItem()!); track p.label) {
                  <span class="prop-tag" [class.warn]="p.warn">{{ p.label }}</span>
                }
              </div>
            </div>
          </div>
        }

        <div class="stats-panel">
          <div class="stats-title">Statistiky výbavy</div>
          @if (statsLines().length) {
            <div class="stats-rows">
              @for (ln of statsLines(); track ln.label) {
                <div class="stat-row">
                  <mat-icon class="stat-ico">{{ ln.icon }}</mat-icon>
                  <span class="stat-txt" [class.stat-warn]="ln.warn" [innerHTML]="ln.text"></span>
                </div>
              }
            </div>
          } @else {
            <div class="stats-empty">Vyber předmět nebo vybav postavu pro zobrazení statistik…</div>
          }
        </div>
      </div>
    </div>

    <!-- Slot template -->
    <ng-template #slotTmpl let-slot="slot">
      <button class="slot-btn" [class.has-item]="equippedAt(slot)" (click)="openSlot(slot)">
        <mat-icon class="slot-ico" [class.filled]="equippedAt(slot)">{{ slotIcon(slot) }}</mat-icon>
        <div class="slot-info">
          <span class="slot-label">{{ slotLabel(slot) }}</span>
          @if (equippedAt(slot); as id) {
            <span class="slot-item-name">{{ itemById(id)!.nameCz }}</span>
            <div class="slot-thumb"><img [src]="imgSrc(id)" [alt]="itemById(id)!.nameEn" (error)="onImgError($event)"/></div>
          } @else {
            <span class="slot-empty-txt">— prázdné —</span>
          }
        </div>
        @if (equippedAt(slot)) {
          <button class="slot-remove" (click)="unequip(slot, $event)">
            <mat-icon style="font-size:15px;width:15px;height:15px;">close</mat-icon>
          </button>
        }
      </button>
    </ng-template>

  </div>
  `,
})
export class EquipmentDialogComponent {
  private readonly ref = inject(MatDialogRef<EquipmentDialogComponent>);
  readonly data: EquipmentDialogData = inject(MAT_DIALOG_DATA) ?? { dexMod: 0, strScore: 10 };

  tab        = signal<Category>('weapon');
  activeSlot = signal<EquipSlot | null>(null);
  equipped   = signal<Partial<Record<EquipSlot, string>>>({});
  hoveredItem = signal<DndItem | null>(null);

  visibleItems = computed(() => ALL_ITEMS.filter(i => i.category === this.tab()));

  // ── Helpers ──────────────────────────────────────────────────────────────

  imgSrc(id: string): string { return ITEM_IMAGES[id] ?? `items/${id}.jpg`; }
  onImgError(e: Event) {
    const img = e.target as HTMLImageElement;
    if (!img.src.startsWith('data:')) {
      img.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23140c28' rx='6'/%3E%3Ctext x='32' y='44' font-size='36' text-anchor='middle' fill='%23c8a03c'%3E%3F%3C/text%3E%3C/svg%3E`;
      img.style.opacity = '0.4';
    }
  }
  itemById(id: string)    { return ALL_ITEMS.find(i => i.id === id); }
  slotLabel(s: EquipSlot) { return SLOT_LABELS[s]; }
  slotIcon(s: EquipSlot)  { return SLOT_ICON[s]; }
  isEquipped(id: string)  { return Object.values(this.equipped()).includes(id); }
  equippedAt(slot: unknown): string | undefined { return this.equipped()[slot as EquipSlot]; }

  cardStat(item: DndItem): string {
    const s = item.stats;
    if (s.kind === 'weapon')    return `${s.damage} ${s.damageType}${s.versatile ? ` (všestr. ${s.versatile})` : ''}`;
    if (s.kind === 'armor')     return `OČ ${s.baseAC}${this._dexStr(s as ArmorStats)}`;
    if (s.kind === 'shield')    return `+${(s as ShieldStats).acBonus} OČ`;
    return (s as AccessStats).description;
  }

  private _dexStr(s: ArmorStats): string {
    if (s.maxDex === null) return ' + Obr';
    if (s.maxDex === 0)    return '';
    return ` + Obr (max +${s.maxDex})`;
  }

  cardProps(item: DndItem): { label: string; warn: boolean }[] {
    const s = item.stats; const out: { label: string; warn: boolean }[] = [];
    if (s.kind === 'weapon') {
      (s as WeaponStats).properties.forEach(p => out.push({ label: p, warn: false }));
      if ((s as WeaponStats).range) out.push({ label: `Dosah ${(s as WeaponStats).range}`, warn: false });
    }
    if (s.kind === 'armor') {
      const a = s as ArmorStats;
      out.push({ label: { light:'Lehká', medium:'Střední', heavy:'Těžká' }[a.armorKind], warn: false });
      if (a.stealth) out.push({ label: '⚠ Plížení', warn: true });
      if (a.strReq)  out.push({ label: `STR ${a.strReq}+`, warn: this.data.strScore < a.strReq });
    }
    return out;
  }

  // ── AC ────────────────────────────────────────────────────────────────────

  totalAC = computed((): number => {
    const dex = this.data.dexMod;
    const armorId  = this.equipped()['chest'];
    const shieldId = this.equipped()['offHand'];
    let ac = 10 + dex;
    if (armorId) {
      const it = this.itemById(armorId);
      if (it?.stats.kind === 'armor') {
        const a = it.stats as ArmorStats;
        const d = a.maxDex === null ? dex : a.maxDex === 0 ? 0 : Math.min(dex, a.maxDex);
        ac = a.baseAC + Math.max(0, d);
      }
    }
    if (shieldId) {
      const sh = this.itemById(shieldId);
      if (sh?.stats.kind === 'shield') ac += (sh.stats as ShieldStats).acBonus;
    }
    return ac;
  });

  acFormula = computed((): string => {
    const dex = this.data.dexMod; const sign = dex >= 0 ? '+' : '';
    const armorId = this.equipped()['chest'];
    if (!armorId) return `10 + Oprava Obr (${sign}${dex})`;
    const it = this.itemById(armorId);
    if (!it || it.stats.kind !== 'armor') return '';
    const a = it.stats as ArmorStats;
    if (a.maxDex === 0)    return `${a.baseAC} (bez Obratnosti)`;
    if (a.maxDex === null) return `${a.baseAC} + Oprava Obr (${sign}${dex})`;
    return `${a.baseAC} + Obr max +${a.maxDex} (aplikováno: +${Math.max(0, Math.min(dex, a.maxDex))})`;
  });

  // ── Stats lines ───────────────────────────────────────────────────────────

  statsLines = computed(() => {
    const lines: { icon: string; text: string; label: string; warn: boolean }[] = [];
    const e = this.equipped();
    const armorId = e['chest'];
    if (armorId) {
      const it = this.itemById(armorId);
      if (it?.stats.kind === 'armor') {
        const a = it.stats as ArmorStats;
        const kind = { light:'Lehká', medium:'Střední', heavy:'Těžká' }[a.armorKind];
        lines.push({ icon:'shield',        label:'armor',  text:`<strong>${it.nameCz}</strong> — ${kind}, OČ <strong>${this.totalAC()}</strong>`, warn: false });
        lines.push({ icon:'calculate',     label:'ac',     text:this.acFormula(), warn: false });
        if (a.stealth) lines.push({ icon:'warning',       label:'stealth', text:'Nevýhoda na plížení', warn: true });
        if (a.strReq && this.data.strScore < a.strReq)
          lines.push({ icon:'priority_high', label:'str',  text:`Vyžaduje SÍL ${a.strReq} (tvoje: ${this.data.strScore})`, warn: true });
      }
    } else {
      lines.push({ icon:'shield', label:'noarmor', text:`Bez zbroje — OČ <strong>${this.totalAC()}</strong> (10 + Oprava Obr)`, warn: false });
    }
    const shieldId = e['offHand'];
    if (shieldId) {
      const sh = this.itemById(shieldId);
      if (sh?.stats.kind === 'shield')
        lines.push({ icon:'security', label:'shield', text:`<strong>${sh.nameCz}</strong> — +${(sh.stats as ShieldStats).acBonus} OČ`, warn: false });
    }
    const mainId = e['mainHand'];
    if (mainId) {
      const w = this.itemById(mainId);
      if (w?.stats.kind === 'weapon') {
        const s = w.stats as WeaponStats;
        lines.push({ icon:'gavel', label:'weapon', text:`<strong>${w.nameCz}</strong> — ${s.damage} ${s.damageType}${s.versatile ? ` / ${s.versatile} (2R)` : ''}`, warn: false });
        if (s.range) lines.push({ icon:'my_location', label:'range', text:`Dostřel: <strong>${s.range}</strong> stop`, warn: false });
      }
    }
    const offId = e['offHand'];
    if (offId && offId !== shieldId) {
      const w = this.itemById(offId);
      if (w?.stats.kind === 'weapon') {
        const s = w.stats as WeaponStats;
        lines.push({ icon:'gavel', label:'offhand', text:`<strong>${w.nameCz} (2. ruka)</strong> — ${s.damage} ${s.damageType}`, warn: false });
      }
    }
    return lines;
  });

  // ── Actions ───────────────────────────────────────────────────────────────

  openSlot(slot: EquipSlot) {
    const catMap: Record<EquipSlot, Category> = {
      head:'accessory', neck:'accessory', chest:'armor', hands:'accessory',
      feet:'accessory', ring1:'accessory', ring2:'accessory', back:'accessory',
      mainHand:'weapon', offHand:'shield',
    };
    this.tab.set(catMap[slot]);
    this.activeSlot.set(slot);
  }

  onCardClick(item: DndItem) {
    const slots = Array.isArray(item.slot) ? item.slot : [item.slot];
    // Unequip if already equipped
    const curSlot = (Object.entries(this.equipped()) as [EquipSlot, string][]).find(([, id]) => id === item.id)?.[0];
    if (curSlot) { this.unequip(curSlot); return; }
    // Find target slot
    const preferred = this.activeSlot();
    let target: EquipSlot | undefined =
      (preferred && slots.includes(preferred) && !this.equipped()[preferred]) ? preferred : undefined;
    if (!target) target = slots.find(s => !this.equipped()[s]);
    if (!target) target = slots[0];
    this.equipped.update(e => ({ ...e, [target!]: item.id }));
    this.activeSlot.set(null);
  }

  unequip(slot: EquipSlot, e?: Event) {
    e?.stopPropagation();
    this.equipped.update(eq => { const n = { ...eq }; delete n[slot]; return n; });
  }

  close() { this.ref.close(this.equipped()); }
}

export function openEquipmentDialog(
  dialog: MatDialog,
  data: EquipmentDialogData,
): Observable<Partial<Record<EquipSlot, string>>> {
  return dialog.open(EquipmentDialogComponent, {
    data,
    minWidth: '860px',
    maxWidth: '1100px',
    width: '92vw',
    maxHeight: '90vh',
    panelClass: 'dnd-dialog',
  }).afterClosed();
}

