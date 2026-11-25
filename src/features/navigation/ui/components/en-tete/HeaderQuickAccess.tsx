'use client'

import { Popover } from 'radix-ui'
import { useState } from 'react'
import { Pictogram } from '@/libraries/pictograms'
import {
  AbcDiagLogo,
  AidantsConnectLogo,
  CartographieLogo,
  LesBasesLogo,
  PixOrgaLogo,
  RDVServicePublicLogo,
} from '@/libraries/pictograms/services'

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
        <Popover.Content align="end" sideOffset={8} className="acces-rapide">
          <p className="fr-text--bold fr-text--sm fr-text--uppercase fr-mb-3w fr-text-label--blue-france fr-text--center">
            Accès rapide à mes outils
          </p>
          <div className="acces-rapide__grille fr-display-grid fr-grid-cols-3">
            {tools.map((tool) => (
              <a
                key={tool.label}
                href={tool.href}
                target="_blank"
                rel="noreferrer"
                className="acces-rapide__outil"
              >
                <div className="acces-rapide__icone">
                  <tool.icon width={40} height={40} />
                </div>
                <span className="acces-rapide__libelle">{tool.label}</span>
              </a>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
