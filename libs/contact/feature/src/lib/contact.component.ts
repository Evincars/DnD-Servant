import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

interface ContactCard {
  icon: string;
  label: string;
  value: string;
  href?: string;
  tooltip: string;
  color: string;
}

interface Skill {
  name: string;
  level: number; // 1–5
  color: string;
}

const CONTACT_CARDS: ContactCard[] = [
  {
    icon: 'alternate_email',
    label: 'E-mail',
    value: 'lasak.ad@gmail.com',
    href: 'mailto:lasak.ad@gmail.com',
    tooltip: 'Napsat e-mail',
    color: '#c8a03c',
  },
  {
    icon: 'code_blocks',
    label: 'GitHub',
    value: 'github.com/Evincars',
    href: 'https://github.com/Evincars',
    tooltip: 'Otevřít GitHub profil',
    color: '#8b6caf',
  },
  {
    icon: 'business',
    label: 'LinkedIn',
    value: 'linkedin.com/in/adam-lasak',
    href: 'https://www.linkedin.com/in/adam-lasak/',
    tooltip: 'Otevřít LinkedIn profil',
    color: '#8b6caf',
  },
  {
    icon: 'language',
    label: 'Web',
    value: 'lasak.netlify.app',
    href: 'https://lasak.netlify.app/',
    tooltip: 'Otevřít web',
    color: '#4a8c5c',
  },
  {
    icon: 'place',
    label: 'Obchodní rejstřík',
    value: 'Obchodní rejstřík',
    href: 'https://www.podnikatel.cz/rejstrik/adam-lasak-04258584/',
    tooltip: 'Otevřít web',
    color: '#4a8c5c',
  },
  {
    icon: 'place',
    label: 'Lokace',
    value: 'Ostrava Výškovice',
    tooltip: 'Ostrava Výškovice',
    color: '#af5555',
  },
];

const SKILLS: Skill[] = [
  { name: 'Angular', level: 5, color: '#c8a03c' },
  { name: 'TypeScript', level: 5, color: '#8b6caf' },
  { name: 'RxJS / Signals', level: 4, color: '#c8a03c' },
  { name: 'Firebase', level: 3, color: '#af8040' },
  { name: 'SCSS / Tailwind', level: 4, color: '#4a8c5c' },
  { name: 'D&D 5e Rules', level: 5, color: '#af5555' },
];

@Component({
  selector: 'contact-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatTooltip],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  readonly cards = CONTACT_CARDS;
  readonly skills = SKILLS;
  readonly copiedCard = signal<string | null>(null);

  copyToClipboard(card: ContactCard): void {
    if (card.href) return;
    navigator.clipboard.writeText(card.value).then(() => {
      this.copiedCard.set(card.label);
    });
  }

  readonly skillDots = Array.from({ length: 5 }, (_, i) => i + 1);
}

