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
  slot: EquipSlot | EquipSlot[]; icon: string; stats: ItemStats;
  rarity: 'common' | 'uncommon' | 'rare';
}
export interface EquipmentDialogData { dexMod: number; strScore: number; }

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const I: Record<string, string> = {
  dagger:      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 110"><polygon points="25,5 22,72 25,78 28,72" fill="#c8d8e8" stroke="#8899aa" stroke-width="0.8"/><rect x="14" y="70" width="22" height="6" rx="2" fill="#c8a040"/><rect x="21" y="76" width="8" height="22" rx="3" fill="#7B4A2A"/><circle cx="25" cy="101" r="5" fill="#c8a040"/></svg>`,
  shortsword:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 130"><polygon points="25,5 22,85 25,92 28,85" fill="#c8d8e8" stroke="#8899aa" stroke-width="0.8"/><rect x="10" y="83" width="30" height="7" rx="2" fill="#c8a040"/><rect x="21" y="90" width="8" height="26" rx="3" fill="#7B4A2A"/><circle cx="25" cy="120" r="5.5" fill="#c8a040"/></svg>`,
  longsword:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 150"><polygon points="25,5 22,100 25,108 28,100" fill="#c8d8e8" stroke="#8899aa" stroke-width="0.8"/><rect x="8" y="98" width="34" height="8" rx="2" fill="#c8a040"/><rect x="21" y="106" width="8" height="30" rx="3" fill="#7B4A2A"/><circle cx="25" cy="140" r="6" fill="#c8a040"/></svg>`,
  greatsword:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 160"><polygon points="32,4 27,108 32,116 37,108" fill="#c8d8e8" stroke="#8899aa" stroke-width="0.8"/><rect x="6" y="106" width="52" height="10" rx="2" fill="#c8a040"/><rect x="27" y="116" width="10" height="34" rx="4" fill="#7B4A2A"/><circle cx="32" cy="154" r="7" fill="#c8a040"/></svg>`,
  rapier:      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 150"><polygon points="25,5 24,105 25,110 26,105" fill="#c8d8e8" stroke="#8899aa" stroke-width="0.8"/><ellipse cx="25" cy="106" rx="17" ry="6" fill="#c8a040"/><path d="M10,100 Q25,112 40,100" fill="none" stroke="#c8a040" stroke-width="2"/><rect x="22" y="112" width="6" height="26" rx="3" fill="#7B4A2A"/><circle cx="25" cy="142" r="5" fill="#c8a040"/></svg>`,
  scimitar:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 130"><path d="M30,10 Q50,30 55,70 Q58,90 40,110 Q30,100 28,80 Q26,55 22,30 Z" fill="#c8d8e8" stroke="#8899aa" stroke-width="0.8"/><rect x="8" y="95" width="26" height="7" rx="2" fill="#c8a040"/><rect x="18" y="102" width="8" height="22" rx="3" fill="#7B4A2A"/><circle cx="22" cy="127" r="5" fill="#c8a040"/></svg>`,
  handaxe:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 120"><path d="M48,12 Q70,8 72,24 Q74,44 54,52 L38,54 L36,18 Z" fill="#c8d8e8" stroke="#8899aa" stroke-width="0.8"/><rect x="18" y="48" width="22" height="8" rx="2" fill="#c8a040"/><rect x="32" y="18" width="8" height="68" rx="4" fill="#7B4A2A"/><circle cx="36" cy="90" r="5" fill="#7B4A2A"/></svg>`,
  battleaxe:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130"><path d="M56,8 Q88,4 90,26 Q92,52 64,60 L50,62 L48,12 Z" fill="#c8d8e8" stroke="#8899aa" stroke-width="0.8"/><path d="M54,8 Q22,4 20,26 Q18,52 46,60 L50,62 L48,12 Z" fill="#c0c8d4" stroke="#8899aa" stroke-width="0.8"/><rect x="44" y="12" width="10" height="92" rx="5" fill="#7B4A2A"/><circle cx="49" cy="110" r="6" fill="#7B4A2A"/></svg>`,
  greataxe:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 140"><path d="M60,5 Q102,2 106,26 Q110,56 76,66 L56,70 L53,10 Z" fill="#c8d8e8" stroke="#8899aa" stroke-width="0.8"/><path d="M58,5 Q16,2 12,26 Q8,56 42,66 L56,70 L53,10 Z" fill="#c0c8d4" stroke="#8899aa" stroke-width="0.8"/><rect x="50" y="10" width="10" height="102" rx="5" fill="#7B4A2A"/><circle cx="55" cy="118" r="7" fill="#7B4A2A"/></svg>`,
  mace:        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 130"><circle cx="30" cy="22" r="16" fill="#b0b8c8" stroke="#8899aa" stroke-width="0.8"/><g fill="#9aa8b8"><polygon points="30,6 28,14 32,14"/><polygon points="46,22 38,20 38,24"/><polygon points="30,38 28,30 32,30"/><polygon points="14,22 22,20 22,24"/><polygon points="43,11 35,17 37,21"/><polygon points="43,33 35,27 37,23"/><polygon points="17,11 25,17 23,21"/><polygon points="17,33 25,27 23,23"/></g><rect x="26" y="36" width="8" height="78" rx="4" fill="#7B4A2A"/><circle cx="30" cy="120" r="6" fill="#7B4A2A"/></svg>`,
  quarterstaff:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 160"><rect x="9" y="5" width="6" height="150" rx="3" fill="#7B4A2A"/><rect x="8" y="4" width="8" height="12" rx="4" fill="#c8a040"/><rect x="8" y="144" width="8" height="12" rx="4" fill="#c8a040"/><circle cx="12" cy="82" r="5" fill="#8B5A2B"/><circle cx="12" cy="82" r="2.5" fill="#c8a040"/></svg>`,
  warhammer:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 130"><rect x="14" y="5" width="52" height="34" rx="4" fill="#b0b8c8" stroke="#8899aa" stroke-width="0.8"/><rect x="22" y="2" width="14" height="12" rx="2" fill="#9aa8b8"/><line x1="14" y1="22" x2="66" y2="22" stroke="#778899" stroke-width="1"/><rect x="35" y="37" width="10" height="80" rx="4" fill="#7B4A2A"/><circle cx="40" cy="122" r="7" fill="#7B4A2A"/></svg>`,
  shortbow:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 120"><path d="M18,8 Q4,60 18,112" fill="none" stroke="#7B4A2A" stroke-width="5" stroke-linecap="round"/><path d="M62,8 Q76,60 62,112" fill="none" stroke="#7B4A2A" stroke-width="5" stroke-linecap="round"/><path d="M18,8 Q40,2 62,8" fill="none" stroke="#7B4A2A" stroke-width="4"/><path d="M18,112 Q40,118 62,112" fill="none" stroke="#7B4A2A" stroke-width="4"/><line x1="40" y1="8" x2="40" y2="112" stroke="#e8d8a0" stroke-width="1.5"/><line x1="40" y1="18" x2="40" y2="102" stroke="#c8a040" stroke-width="2"/><polygon points="40,10 37,22 43,22" fill="#c8a040"/></svg>`,
  longbow:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 160"><path d="M14,5 Q2,80 14,155" fill="none" stroke="#5a3018" stroke-width="5" stroke-linecap="round"/><path d="M46,5 Q58,80 46,155" fill="none" stroke="#5a3018" stroke-width="5" stroke-linecap="round"/><path d="M14,5 Q30,2 46,5" fill="none" stroke="#5a3018" stroke-width="4"/><path d="M14,155 Q30,158 46,155" fill="none" stroke="#5a3018" stroke-width="4"/><line x1="30" y1="5" x2="30" y2="155" stroke="#e8d8a0" stroke-width="1.5"/><line x1="30" y1="14" x2="30" y2="146" stroke="#c8a040" stroke-width="2.5"/><polygon points="30,6 27,18 33,18" fill="#c8a040"/></svg>`,
  spear:       `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 160"><polygon points="15,4 10,30 20,30" fill="#c8d8e8" stroke="#8899aa" stroke-width="0.8"/><rect x="13" y="28" width="4" height="6" fill="#c8a040"/><rect x="12" y="34" width="6" height="114" rx="3" fill="#7B4A2A"/><circle cx="15" cy="155" r="5" fill="#c8a040"/></svg>`,
  leather:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 100"><path d="M15,20 L5,36 L10,80 L70,80 L75,36 L65,20 Z" fill="#8B5A2B" stroke="#5a3018" stroke-width="1"/><ellipse cx="15" cy="22" rx="14" ry="10" fill="#6B4020"/><ellipse cx="65" cy="22" rx="14" ry="10" fill="#6B4020"/><ellipse cx="40" cy="18" rx="13" ry="7" fill="#1a1020"/><rect x="33" y="18" width="4" height="30" fill="#5a3018"/><rect x="43" y="18" width="4" height="30" fill="#5a3018"/><rect x="10" y="65" width="60" height="8" rx="2" fill="#5a3018"/><rect x="37" y="63" width="6" height="12" rx="1" fill="#c8a040"/></svg>`,
  studded:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 100"><path d="M15,20 L5,36 L10,80 L70,80 L75,36 L65,20 Z" fill="#7a4a22" stroke="#4a2810" stroke-width="1"/><ellipse cx="15" cy="22" rx="14" ry="10" fill="#5B3016"/><ellipse cx="65" cy="22" rx="14" ry="10" fill="#5B3016"/><ellipse cx="40" cy="18" rx="13" ry="7" fill="#1a1020"/><g fill="#c8a040"><circle cx="20" cy="35" r="2.2"/><circle cx="30" cy="32" r="2.2"/><circle cx="40" cy="30" r="2.2"/><circle cx="50" cy="32" r="2.2"/><circle cx="60" cy="35" r="2.2"/><circle cx="18" cy="48" r="2.2"/><circle cx="28" cy="45" r="2.2"/><circle cx="40" cy="44" r="2.2"/><circle cx="52" cy="45" r="2.2"/><circle cx="62" cy="48" r="2.2"/><circle cx="16" cy="62" r="2.2"/><circle cx="30" cy="60" r="2.2"/><circle cx="40" cy="58" r="2.2"/><circle cx="50" cy="60" r="2.2"/><circle cx="64" cy="62" r="2.2"/></g><rect x="10" y="68" width="60" height="8" rx="2" fill="#4a2810"/><rect x="37" y="66" width="6" height="12" rx="1" fill="#c8a040"/></svg>`,
  chainshirt:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 100"><path d="M15,20 L5,36 L10,80 L70,80 L75,36 L65,20 Z" fill="#9aa8b8" stroke="#667788" stroke-width="1"/><g fill="none" stroke="#556677" stroke-width="0.8" opacity="0.9"><circle cx="22" cy="36" r="3"/><circle cx="32" cy="36" r="3"/><circle cx="42" cy="36" r="3"/><circle cx="52" cy="36" r="3"/><circle cx="62" cy="36" r="3"/><circle cx="27" cy="44" r="3"/><circle cx="37" cy="44" r="3"/><circle cx="47" cy="44" r="3"/><circle cx="57" cy="44" r="3"/><circle cx="22" cy="52" r="3"/><circle cx="32" cy="52" r="3"/><circle cx="42" cy="52" r="3"/><circle cx="52" cy="52" r="3"/><circle cx="62" cy="52" r="3"/><circle cx="27" cy="60" r="3"/><circle cx="37" cy="60" r="3"/><circle cx="47" cy="60" r="3"/><circle cx="57" cy="60" r="3"/><circle cx="22" cy="68" r="3"/><circle cx="32" cy="68" r="3"/><circle cx="42" cy="68" r="3"/><circle cx="52" cy="68" r="3"/><circle cx="62" cy="68" r="3"/></g><ellipse cx="15" cy="22" rx="13" ry="9" fill="#888898"/><ellipse cx="65" cy="22" rx="13" ry="9" fill="#888898"/><ellipse cx="40" cy="18" rx="13" ry="7" fill="#1a1020"/></svg>`,
  breastplate: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 100"><path d="M15,20 L5,36 L10,80 L70,80 L75,36 L65,20 Z" fill="#9aa8b8" stroke="#778899" stroke-width="1"/><path d="M24,26 L18,56 L62,56 L56,26 Z" fill="#b0bcc8" stroke="#8899aa" stroke-width="1"/><path d="M18,56 L22,74 L58,74 L62,56 Z" fill="#a0acb8" stroke="#8899aa" stroke-width="0.8"/><line x1="40" y1="26" x2="40" y2="56" stroke="#778899" stroke-width="1"/><ellipse cx="15" cy="22" rx="14" ry="10" fill="#8899a8"/><ellipse cx="65" cy="22" rx="14" ry="10" fill="#8899a8"/><ellipse cx="40" cy="18" rx="13" ry="7" fill="#1a1020"/><rect x="10" y="74" width="60" height="5" rx="2" fill="#778899"/><rect x="37" y="72" width="6" height="10" rx="1" fill="#c8a040"/></svg>`,
  halfplate:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 108"><path d="M18,20 L6,38 L10,88 L78,88 L82,38 L70,20 Z" fill="#9aa8b8" stroke="#778899" stroke-width="1"/><path d="M26,28 L20,58 L68,58 L62,28 Z" fill="#b0bcc8" stroke="#8899aa" stroke-width="1"/><path d="M20,58 L24,72 L64,72 L68,58 Z" fill="#a0acb8" stroke="#8899aa" stroke-width="0.8"/><path d="M24,72 L26,82 L62,82 L64,72 Z" fill="#909cb0" stroke="#8899aa" stroke-width="0.8"/><line x1="44" y1="28" x2="44" y2="58" stroke="#778899" stroke-width="1.5"/><ellipse cx="18" cy="24" rx="16" ry="11" fill="#8090a0"/><ellipse cx="70" cy="24" rx="16" ry="11" fill="#8090a0"/><ellipse cx="44" cy="18" rx="14" ry="8" fill="#1a1020"/><rect x="10" y="82" width="68" height="5" rx="2" fill="#778899"/></svg>`,
  chainmail:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 100"><path d="M10,18 L4,38 L8,85 L72,85 L76,38 L70,18 Z" fill="#8090a0" stroke="#556677" stroke-width="1"/><g fill="none" stroke="#445566" stroke-width="0.9" opacity="0.9"><circle cx="18" cy="30" r="3.5"/><circle cx="28" cy="30" r="3.5"/><circle cx="38" cy="30" r="3.5"/><circle cx="48" cy="30" r="3.5"/><circle cx="58" cy="30" r="3.5"/><circle cx="68" cy="30" r="3.5"/><circle cx="23" cy="40" r="3.5"/><circle cx="33" cy="40" r="3.5"/><circle cx="43" cy="40" r="3.5"/><circle cx="53" cy="40" r="3.5"/><circle cx="63" cy="40" r="3.5"/><circle cx="18" cy="50" r="3.5"/><circle cx="28" cy="50" r="3.5"/><circle cx="38" cy="50" r="3.5"/><circle cx="48" cy="50" r="3.5"/><circle cx="58" cy="50" r="3.5"/><circle cx="68" cy="50" r="3.5"/><circle cx="23" cy="60" r="3.5"/><circle cx="33" cy="60" r="3.5"/><circle cx="43" cy="60" r="3.5"/><circle cx="53" cy="60" r="3.5"/><circle cx="63" cy="60" r="3.5"/><circle cx="18" cy="70" r="3.5"/><circle cx="28" cy="70" r="3.5"/><circle cx="38" cy="70" r="3.5"/><circle cx="48" cy="70" r="3.5"/><circle cx="58" cy="70" r="3.5"/><circle cx="68" cy="70" r="3.5"/></g><ellipse cx="14" cy="22" rx="13" ry="9" fill="#687888"/><ellipse cx="66" cy="22" rx="13" ry="9" fill="#687888"/><ellipse cx="40" cy="17" rx="13" ry="7" fill="#1a1020"/></svg>`,
  splint:      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 108"><path d="M16,18 L6,38 L10,90 L78,90 L82,38 L72,18 Z" fill="#8090a0" stroke="#556677" stroke-width="1"/><rect x="16" y="30" width="10" height="55" rx="2" fill="#687888" stroke="#445566" stroke-width="0.8"/><rect x="30" y="30" width="10" height="55" rx="2" fill="#778899" stroke="#445566" stroke-width="0.8"/><rect x="44" y="30" width="10" height="55" rx="2" fill="#687888" stroke="#445566" stroke-width="0.8"/><rect x="58" y="30" width="10" height="55" rx="2" fill="#778899" stroke="#445566" stroke-width="0.8"/><rect x="14" y="42" width="60" height="6" rx="1" fill="#556677" opacity="0.6"/><rect x="14" y="62" width="60" height="6" rx="1" fill="#556677" opacity="0.6"/><ellipse cx="16" cy="22" rx="14" ry="10" fill="#607080"/><ellipse cx="72" cy="22" rx="14" ry="10" fill="#607080"/><ellipse cx="44" cy="17" rx="14" ry="8" fill="#1a1020"/></svg>`,
  plate:       `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 110"><path d="M18,18 L6,40 L10,92 L80,92 L84,40 L72,18 Z" fill="#b0bcc8" stroke="#778899" stroke-width="1.5"/><path d="M28,28 L22,60 L68,60 L62,28 Z" fill="#c0ccda" stroke="#8899aa" stroke-width="1"/><path d="M22,60 L26,76 L64,76 L68,60 Z" fill="#b0bcc8" stroke="#8899aa" stroke-width="0.8"/><path d="M26,76 L28,88 L62,88 L64,76 Z" fill="#a0acb8" stroke="#8899aa" stroke-width="0.8"/><line x1="45" y1="28" x2="45" y2="60" stroke="#778899" stroke-width="1.5"/><ellipse cx="18" cy="24" rx="16" ry="12" fill="#a0acb8"/><ellipse cx="72" cy="24" rx="16" ry="12" fill="#a0acb8"/><ellipse cx="45" cy="17" rx="14" ry="8" fill="#1a1020"/><rect x="10" y="88" width="70" height="6" rx="2" fill="#8899aa"/><rect x="42" y="86" width="7" height="12" rx="1" fill="#c8a040"/></svg>`,
  shield:      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 96"><path d="M40,5 L75,20 L75,55 Q75,78 40,93 Q5,78 5,55 L5,20 Z" fill="#8B5A2B" stroke="#5a3018" stroke-width="1.5"/><path d="M40,13 L68,26 L68,53 Q68,72 40,84 Q12,72 12,53 L12,26 Z" fill="#c8a040" stroke="#a07820" stroke-width="1"/><circle cx="40" cy="49" r="11" fill="#8B5A2B" stroke="#5a3018" stroke-width="1.5"/><circle cx="40" cy="49" r="7" fill="#c8a040"/><circle cx="40" cy="49" r="3" fill="#8B5A2B"/><line x1="40" y1="16" x2="40" y2="82" stroke="#8B5A2B" stroke-width="2"/><line x1="14" y1="44" x2="66" y2="44" stroke="#8B5A2B" stroke-width="2"/></svg>`,
  helmet:      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 82"><path d="M40,6 Q70,6 72,30 L70,56 L10,56 L8,30 Q10,6 40,6 Z" fill="#9aa8b8" stroke="#778899" stroke-width="1.5"/><path d="M40,10 Q67,10 69,30 L67,50 L13,50 L11,30 Q13,10 40,10 Z" fill="#b0bcc8"/><path d="M18,38 L62,38 L60,52 L20,52 Z" fill="#1a1020"/><rect x="37" y="30" width="6" height="22" rx="3" fill="#8899aa"/><path d="M8,30 Q6,36 8,44 L14,44 L12,30 Z" fill="#9aa8b8"/><path d="M72,30 Q74,36 72,44 L66,44 L68,30 Z" fill="#9aa8b8"/><path d="M36,6 Q40,0 44,6" fill="none" stroke="#c83030" stroke-width="4" stroke-linecap="round"/></svg>`,
  cloak:       `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 120"><path d="M12,16 L6,105 L40,118 L74,105 L68,16 Q58,5 40,5 Q22,5 12,16 Z" fill="#1a1a3a" stroke="#2a2a4a" stroke-width="1"/><path d="M25,12 L18,102 L40,114 L62,102 L55,12 Q50,6 40,6 Q30,6 25,12 Z" fill="#22224a"/><circle cx="40" cy="18" r="9" fill="#c8a040" stroke="#a07820" stroke-width="1"/><circle cx="40" cy="18" r="5.5" fill="#8B4513"/><circle cx="40" cy="18" r="2.5" fill="#c8a040"/><path d="M24,32 Q40,38 56,32" fill="none" stroke="#2a2a5a" stroke-width="1.5" opacity="0.7"/><path d="M20,52 Q40,58 60,52" fill="none" stroke="#2a2a5a" stroke-width="1.5" opacity="0.6"/><path d="M16,72 Q40,78 64,72" fill="none" stroke="#2a2a5a" stroke-width="1.5" opacity="0.5"/></svg>`,
  amulet:      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 80"><path d="M10,6 Q30,6 50,6" fill="none" stroke="#c8a040" stroke-width="2"/><path d="M10,6 Q10,34 30,50 Q50,34 50,6" fill="none" stroke="#c8a040" stroke-width="2"/><polygon points="30,46 22,63 30,59 38,63" fill="#c8a040" stroke="#a07820" stroke-width="1"/><circle cx="30" cy="44" r="11" fill="#1a1a3a" stroke="#c8a040" stroke-width="1.5"/><polygon points="30,38 24,44 30,50 36,44" fill="#4a90d9" stroke="#2a60a9" stroke-width="0.5"/><circle cx="30" cy="44" r="8" fill="none" stroke="#c8a040" stroke-width="0.5" opacity="0.6"/></svg>`,
  ring:        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 52"><circle cx="25" cy="28" r="19" fill="none" stroke="#c8a040" stroke-width="7"/><circle cx="25" cy="10" r="8" fill="#1a1a3a" stroke="#c8a040" stroke-width="1.5"/><polygon points="25,5 19,10 25,15 31,10" fill="#e86030" stroke="#c03010" stroke-width="0.5"/></svg>`,
  boots:       `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 90"><path d="M38,8 L44,8 L50,70 L62,70 L64,82 L28,82 L26,70 L36,70 Z" fill="#4a3020" stroke="#2a1810" stroke-width="1" opacity="0.5"/><path d="M28,5 L38,5 L44,68 L60,68 L62,80 L18,80 L16,68 L28,68 Z" fill="#6b4a30" stroke="#4a2810" stroke-width="1"/><path d="M16,68 Q40,72 62,68" stroke="#4a2810" stroke-width="2" fill="none"/><rect x="20" y="33" width="18" height="5" rx="1.5" fill="#c8a040"/><rect x="26" y="31" width="6" height="9" rx="1" fill="#c8a040"/><path d="M28,8 Q33,4 38,8" fill="none" stroke="#d8c8a8" stroke-width="3"/></svg>`,
  gloves:      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 82"><path d="M25,72 L20,30 Q20,20 30,18 L52,18 Q62,20 62,30 L57,72 Z" fill="#6b4a30" stroke="#4a2810" stroke-width="1"/><path d="M28,18 L26,5 Q29,2 33,5 L35,18" fill="#5a3a20" stroke="#3a2010" stroke-width="1"/><path d="M35,16 L33,3 Q36,0 40,3 L41,16" fill="#5a3a20" stroke="#3a2010" stroke-width="1"/><path d="M41,16 L41,3 Q44,0 48,3 L47,16" fill="#5a3a20" stroke="#3a2010" stroke-width="1"/><path d="M47,17 L47,5 Q51,3 54,7 L54,17" fill="#5a3a20" stroke="#3a2010" stroke-width="1"/><path d="M20,30 L12,26 Q10,20 15,16 L22,20" fill="#5a3a20" stroke="#3a2010" stroke-width="1"/><line x1="20" y1="58" x2="62" y2="58" stroke="#c8a040" stroke-width="1.5"/><line x1="20" y1="66" x2="62" y2="66" stroke="#c8a040" stroke-width="1.5"/></svg>`,
};

// ─── Item Catalogue ──────────────────────────────────────────────────────────

const ALL_ITEMS: DndItem[] = [
  { id:'dagger',       nameCz:'Dýka',              nameEn:'Dagger',          category:'weapon',    slot:['mainHand','offHand'], icon:I['dagger'],      rarity:'common',   stats:{kind:'weapon',  damage:'1k4',  damageType:'Bodné',  properties:['Jemná','Lehká','Hování 20/60']} },
  { id:'handaxe',      nameCz:'Ruční sekyrka',     nameEn:'Handaxe',         category:'weapon',    slot:['mainHand','offHand'], icon:I['handaxe'],     rarity:'common',   stats:{kind:'weapon',  damage:'1k6',  damageType:'Sečné',  properties:['Lehká','Hování 20/60']} },
  { id:'mace',         nameCz:'Palcát',            nameEn:'Mace',            category:'weapon',    slot:'mainHand',             icon:I['mace'],        rarity:'common',   stats:{kind:'weapon',  damage:'1k6',  damageType:'Drtivé', properties:[]} },
  { id:'quarterstaff', nameCz:'Čtvrtpalice',       nameEn:'Quarterstaff',    category:'weapon',    slot:'mainHand',             icon:I['quarterstaff'],rarity:'common',   stats:{kind:'weapon',  damage:'1k6',  damageType:'Drtivé', properties:['Všestranná'], versatile:'1k8'} },
  { id:'spear',        nameCz:'Kopí',              nameEn:'Spear',           category:'weapon',    slot:'mainHand',             icon:I['spear'],       rarity:'common',   stats:{kind:'weapon',  damage:'1k6',  damageType:'Bodné',  properties:['Hování 20/60','Všestranná'], versatile:'1k8'} },
  { id:'shortbow',     nameCz:'Krátký luk',        nameEn:'Shortbow',        category:'weapon',    slot:'mainHand',             icon:I['shortbow'],    rarity:'common',   stats:{kind:'weapon',  damage:'1k6',  damageType:'Bodné',  properties:['Munice','Obouruční'], range:'80/320'} },
  { id:'shortsword',   nameCz:'Krátký meč',        nameEn:'Shortsword',      category:'weapon',    slot:['mainHand','offHand'], icon:I['shortsword'],  rarity:'common',   stats:{kind:'weapon',  damage:'1k6',  damageType:'Bodné',  properties:['Jemná','Lehká']} },
  { id:'longsword',    nameCz:'Dlouhý meč',        nameEn:'Longsword',       category:'weapon',    slot:'mainHand',             icon:I['longsword'],   rarity:'common',   stats:{kind:'weapon',  damage:'1k8',  damageType:'Sečné',  properties:['Všestranná'], versatile:'1k10'} },
  { id:'rapier',       nameCz:'Rapír',             nameEn:'Rapier',          category:'weapon',    slot:'mainHand',             icon:I['rapier'],      rarity:'common',   stats:{kind:'weapon',  damage:'1k8',  damageType:'Bodné',  properties:['Jemná']} },
  { id:'scimitar',     nameCz:'Šavle',             nameEn:'Scimitar',        category:'weapon',    slot:['mainHand','offHand'], icon:I['scimitar'],    rarity:'common',   stats:{kind:'weapon',  damage:'1k6',  damageType:'Sečné',  properties:['Jemná','Lehká']} },
  { id:'battleaxe',    nameCz:'Válečná sekera',    nameEn:'Battleaxe',       category:'weapon',    slot:'mainHand',             icon:I['battleaxe'],   rarity:'common',   stats:{kind:'weapon',  damage:'1k8',  damageType:'Sečné',  properties:['Všestranná'], versatile:'1k10'} },
  { id:'warhammer',    nameCz:'Válečné kladivo',   nameEn:'Warhammer',       category:'weapon',    slot:'mainHand',             icon:I['warhammer'],   rarity:'common',   stats:{kind:'weapon',  damage:'1k8',  damageType:'Drtivé', properties:['Všestranná'], versatile:'1k10'} },
  { id:'greatsword',   nameCz:'Obouruční meč',     nameEn:'Greatsword',      category:'weapon',    slot:'mainHand',             icon:I['greatsword'],  rarity:'common',   stats:{kind:'weapon',  damage:'2k6',  damageType:'Sečné',  properties:['Těžká','Obouruční']} },
  { id:'greataxe',     nameCz:'Velká sekera',      nameEn:'Greataxe',        category:'weapon',    slot:'mainHand',             icon:I['greataxe'],    rarity:'common',   stats:{kind:'weapon',  damage:'1k12', damageType:'Sečné',  properties:['Těžká','Obouruční']} },
  { id:'longbow',      nameCz:'Dlouhý luk',        nameEn:'Longbow',         category:'weapon',    slot:'mainHand',             icon:I['longbow'],     rarity:'common',   stats:{kind:'weapon',  damage:'1k8',  damageType:'Bodné',  properties:['Munice','Těžká','Obouruční'], range:'150/600'} },
  { id:'leather',      nameCz:'Kožená zbroj',      nameEn:'Leather',         category:'armor',     slot:'chest',                icon:I['leather'],     rarity:'common',   stats:{kind:'armor',   armorKind:'light',  baseAC:11, maxDex:null} },
  { id:'studded',      nameCz:'Pobíjená kůže',     nameEn:'Studded Leather', category:'armor',     slot:'chest',                icon:I['studded'],     rarity:'common',   stats:{kind:'armor',   armorKind:'light',  baseAC:12, maxDex:null} },
  { id:'chainshirt',   nameCz:'Kroužková košile',  nameEn:'Chain Shirt',     category:'armor',     slot:'chest',                icon:I['chainshirt'],  rarity:'common',   stats:{kind:'armor',   armorKind:'medium', baseAC:13, maxDex:2} },
  { id:'breastplate',  nameCz:'Kyrys',             nameEn:'Breastplate',     category:'armor',     slot:'chest',                icon:I['breastplate'], rarity:'common',   stats:{kind:'armor',   armorKind:'medium', baseAC:14, maxDex:2} },
  { id:'halfplate',    nameCz:'Polodesková',       nameEn:'Half Plate',      category:'armor',     slot:'chest',                icon:I['halfplate'],   rarity:'common',   stats:{kind:'armor',   armorKind:'medium', baseAC:15, maxDex:2,  stealth:true} },
  { id:'chainmail',    nameCz:'Kroužková zbroj',   nameEn:'Chain Mail',      category:'armor',     slot:'chest',                icon:I['chainmail'],   rarity:'common',   stats:{kind:'armor',   armorKind:'heavy',  baseAC:16, maxDex:0,  stealth:true, strReq:13} },
  { id:'splint',       nameCz:'Dlanicová zbroj',   nameEn:'Splint',          category:'armor',     slot:'chest',                icon:I['splint'],      rarity:'common',   stats:{kind:'armor',   armorKind:'heavy',  baseAC:17, maxDex:0,  stealth:true, strReq:15} },
  { id:'plate',        nameCz:'Plná desková',      nameEn:'Plate',           category:'armor',     slot:'chest',                icon:I['plate'],       rarity:'uncommon', stats:{kind:'armor',   armorKind:'heavy',  baseAC:18, maxDex:0,  stealth:true, strReq:15} },
  { id:'shield',       nameCz:'Štít',              nameEn:'Shield',          category:'shield',    slot:'offHand',              icon:I['shield'],      rarity:'common',   stats:{kind:'shield',  acBonus:2} },
  { id:'helmet',       nameCz:'Přilba',            nameEn:'Helmet',          category:'accessory', slot:'head',                 icon:I['helmet'],      rarity:'common',   stats:{kind:'accessory', description:'Ochrana hlavy'} },
  { id:'cloak',        nameCz:'Plášť',             nameEn:'Cloak',           category:'accessory', slot:'back',                 icon:I['cloak'],       rarity:'common',   stats:{kind:'accessory', description:'Ochrana a utajení'} },
  { id:'amulet',       nameCz:'Amulet',            nameEn:'Amulet',          category:'accessory', slot:'neck',                 icon:I['amulet'],      rarity:'uncommon', stats:{kind:'accessory', description:'Magický přívěsek'} },
  { id:'ringitem',     nameCz:'Prsten',            nameEn:'Ring',            category:'accessory', slot:['ring1','ring2'],      icon:I['ring'],        rarity:'uncommon', stats:{kind:'accessory', description:'Magický prsten'} },
  { id:'boots',        nameCz:'Boty',              nameEn:'Boots',           category:'accessory', slot:'feet',                 icon:I['boots'],       rarity:'common',   stats:{kind:'accessory', description:'Ochrana nohou'} },
  { id:'gloves',       nameCz:'Rukavice',          nameEn:'Gloves',          category:'accessory', slot:'hands',                icon:I['gloves'],      rarity:'common',   stats:{kind:'accessory', description:'Ochrana rukou'} },
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
    .slot-thumb svg { width:100%; height:100%; }

    /* AC box */
    .ac-box { border:1px solid rgba(200,160,60,.35); border-radius:6px; padding:10px 12px; text-align:center; background:rgba(15,12,28,.9); margin-top:4px; }
    .ac-number { font-size:40px; color:#e8c96a; line-height:1; text-shadow:0 0 24px rgba(200,160,60,.55); }
    .ac-title  { font-size:8.5px; letter-spacing:.15em; text-transform:uppercase; color:rgba(200,160,60,.4); margin-top:2px; }
    .ac-formula{ font-size:9.5px; color:rgba(200,160,60,.5); margin-top:4px; font-style:italic; line-height:1.4; }

    /* ── Right panel ── */
    .panel-catalog { flex:1; min-width:0; display:flex; flex-direction:column; background:rgba(8,6,18,.85); }

    .cat-tabs { display:flex; border-bottom:1px solid rgba(200,160,60,.2); flex-shrink:0; }
    .cat-tab { flex:1; padding:11px 4px; font-size:10px; letter-spacing:.12em; text-transform:uppercase; border:none; background:none; cursor:pointer; color:rgba(200,160,60,.4); font-family:'Mikadan',sans-serif; border-bottom:2px solid transparent; transition:all .18s; display:flex; align-items:center; justify-content:center; gap:5px; }
    .cat-tab:hover { color:rgba(200,160,60,.7); background:rgba(200,160,60,.04); }
    .cat-tab.active { color:#e8c96a; border-bottom-color:#c8a03c; background:rgba(200,160,60,.07); }
    .cat-tab mat-icon { font-size:14px; width:14px; height:14px; }

    .item-grid { flex:1; overflow-y:auto; padding:12px; display:grid; grid-template-columns:repeat(auto-fill,minmax(124px,1fr)); gap:9px; align-content:start; }

    .item-card { border:1px solid rgba(200,160,60,.18); border-radius:6px; background:rgba(20,16,36,.82); cursor:pointer; transition:all .22s; display:flex; flex-direction:column; overflow:hidden; position:relative; }
    .item-card:hover { border-color:rgba(200,160,60,.55); background:rgba(200,160,60,.08); transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,.5),0 0 14px rgba(200,160,60,.1); }
    .item-card.equipped { border-color:rgba(200,160,60,.7); background:rgba(200,160,60,.12); box-shadow:0 0 18px rgba(200,160,60,.22); }
    .item-card.equipped::after { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,#c8a03c,transparent); }

    .rarity-uncommon .card-img { background:rgba(30,80,30,.2); }
    .rarity-rare     .card-img { background:rgba(30,50,120,.2); }
    .card-img { height:80px; display:flex; align-items:center; justify-content:center; padding:8px; background:rgba(0,0,0,.3); }
    .card-img svg { height:72px; width:auto; max-width:80px; filter:drop-shadow(0 2px 8px rgba(0,0,0,.9)); }
    .card-body { padding:7px 8px 8px; flex:1; display:flex; flex-direction:column; gap:2px; }
    .card-name { font-size:11px; color:#d4c9a0; font-weight:bold; line-height:1.2; }
    .card-en   { font-size:8.5px; color:rgba(200,160,60,.3); font-style:italic; }
    .card-stat { font-size:10px; color:rgba(210,210,170,.75); margin-top:1px; }
    .card-props { display:flex; flex-wrap:wrap; gap:3px; margin-top:4px; }
    .prop-tag { font-size:8px; padding:1px 5px; border-radius:10px; background:rgba(200,160,60,.1); border:1px solid rgba(200,160,60,.2); color:rgba(200,160,60,.65); white-space:nowrap; }
    .prop-tag.warn { background:rgba(200,60,30,.12); border-color:rgba(200,60,30,.3); color:rgba(230,100,60,.8); }
    .equipped-badge { position:absolute; top:5px; right:5px; background:rgba(200,160,60,.9); border-radius:50%; width:17px; height:17px; display:flex; align-items:center; justify-content:center; }
    .equipped-badge mat-icon { font-size:11px; width:11px; height:11px; color:#1a1020; }

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
                 [matTooltip]="'Klikni pro vybavení: ' + item.nameCz">
              <div class="card-img" [innerHTML]="item.icon"></div>
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
            <div class="slot-thumb" [innerHTML]="itemById(id)!.icon"></div>
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

  visibleItems = computed(() => ALL_ITEMS.filter(i => i.category === this.tab()));

  // ── Helpers ──────────────────────────────────────────────────────────────

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

