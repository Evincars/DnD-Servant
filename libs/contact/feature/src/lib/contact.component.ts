import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

interface ContactCard {
  icon: string;
  label: string;
  value: string;
  href?: string;
  tooltip: string;
}

const CONTACT_CARDS: ContactCard[] = [
  {
    icon: 'alternate_email',
    label: 'E-mail',
    value: 'lasak.ad@gmail.com',
    href: 'mailto:lasak.ad@gmail.com',
    tooltip: 'Napsat e-mail',
  },
  {
    icon: 'code_blocks',
    label: 'GitHub',
    value: 'github.com/Evincars',
    href: 'https://github.com/Evincars',
    tooltip: 'Otevřít GitHub profil',
  },
  {
    icon: 'business',
    label: 'LinkedIn',
    value: 'linkedin.com/in/adam-lasak',
    href: 'https://www.linkedin.com/in/adam-lasak/',
    tooltip: 'Otevřít LinkedIn profil',
  },
  {
    icon: 'language',
    label: 'Web',
    value: 'lasak.netlify.app',
    href: 'https://lasak.netlify.app/',
    tooltip: 'Otevřít web',
  },
  {
    icon: 'account_balance',
    label: 'Obchodní rejstřík',
    value: 'Obchodní rejstřík',
    href: 'https://www.podnikatel.cz/rejstrik/adam-lasak-04258584/',
    tooltip: 'Otevřít web',
  },
  {
    icon: 'place',
    label: 'Lokace',
    value: 'Ostrava Výškovice',
    tooltip: 'Zkopírovat',
  },
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
  readonly copiedCard = signal<string | null>(null);

  copyToClipboard(card: ContactCard): void {
    navigator.clipboard.writeText(card.value).then(() => {
      this.copiedCard.set(card.label);
    });
  }
}
