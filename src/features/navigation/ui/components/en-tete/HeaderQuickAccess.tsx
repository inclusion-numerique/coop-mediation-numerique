'use client'

import { Popover } from 'radix-ui'
import { useState } from 'react'
import styles from '@/features/navigation/ui/components/en-tete/HeaderQuickAccess.module.css'
import { Pictogram } from '@/libraries/pictograms/pictogram'
import { AbcDiagLogo } from '@/libraries/pictograms/services/AbcDiagLogo'
import { AidantsConnectLogo } from '@/libraries/pictograms/services/AidantsConnectLogo'
import { CartographieLogo } from '@/libraries/pictograms/services/CartographieLogo'
import { LesBasesLogo } from '@/libraries/pictograms/services/LesBasesLogo'
import { PixOrgaLogo } from '@/libraries/pictograms/services/PixOrgaLogo'
import { RDVServicePublicLogo } from '@/libraries/pictograms/services/RDVServicePublicLogo'

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
