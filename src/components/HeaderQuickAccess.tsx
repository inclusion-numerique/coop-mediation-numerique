'use client'

import * as Popover from '@radix-ui/react-popover'
import { useState } from 'react'
import { Pictogram } from '@/features/pictograms/pictogram'
import { AbcDiagLogo } from '@/features/pictograms/services/AbcDiagLogo'
import { AidantsConnectLogo } from '@/features/pictograms/services/AidantsConnectLogo'
import { CartographieLogo } from '@/features/pictograms/services/CartographieLogo'
import { LesBasesLogo } from '@/features/pictograms/services/LesBasesLogo'
import { PixOrgaLogo } from '@/features/pictograms/services/PixOrgaLogo'
import { RDVServicePublicLogo } from '@/features/pictograms/services/RDVServicePublicLogo'
import styles from './HeaderQuickAccess.module.css'

const tools: { label: string; href: string; icon: Pictogram }[] = [
  {
    label: 'RDV Service Public',
    href: 'https://rdv.anct.gouv.fr/agents/sign_in',
    icon: RDVServicePublicLogo,
  },
  {
    label: 'Les Bases',
    href: 'https://lesbases.anct.gouv.fr/connexion',
    icon: LesBasesLogo,
  },
  {
    label: 'Cartographie',
    href: 'https://cartographie.societenumerique.gouv.fr',
    icon: CartographieLogo,
  },
  {
    label: 'Aidants Connect',
    href: 'https://aidantsconnect.beta.gouv.fr/accounts/login/',
    icon: AidantsConnectLogo,
  },
  {
    label: 'Pix Orga',
    href: 'https://orga.pix.fr/connexion',
    icon: PixOrgaLogo,
  },
  {
    label: 'ABC Diag',
    href: 'https://pix.fr/abc-diag',
    icon: AbcDiagLogo,
  },
]

export const HeaderQuickAccess = () => {
  const [open, setOpen] = useState(false)

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className="fr-btn icon-only fr-btn--no-after"
          type="button"
          title="Accès rapide à mes outils"
        >
          <span className="ri-apps-2-line" aria-hidden />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className={styles.popoverContent}
        >
          <p className="fr-text--bold fr-text--sm fr-text--uppercase fr-mb-3w fr-text-label--blue-france fr-text--center">
            Accès rapide à mes outils
          </p>
          <div className={styles.grid}>
            {tools.map((tool) => (
              <a
                key={tool.label}
                href={tool.href}
                target="_blank"
                rel="noreferrer"
                className={styles.toolItem}
              >
                <div className={styles.iconContainer}>
                  <tool.icon width={40} height={40} />
                </div>
                <span className={styles.toolLabel}>{tool.label}</span>
              </a>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
