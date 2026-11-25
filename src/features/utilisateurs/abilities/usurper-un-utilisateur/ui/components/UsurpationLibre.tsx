'use client'

import { useState } from 'react'
import { AdministrationInfoCard } from '@/libraries/ui/components'
import { BoutonDUsurpation } from './BoutonDUsurpation'

export const UsurpationLibre = () => {
  const [utilisateurId, setUtilisateurId] = useState('')

  return (
    <AdministrationInfoCard title="Sudo usurpation">
      <div className="fr-flex fr-flex-row fr-flex-gap-4v fr-align-items-center">
        <label className="fr-sr-only" htmlFor="usurpation-libre">
          Identifiant de l’utilisateur
        </label>
        <input
          id="usurpation-libre"
          placeholder="User id"
          className="fr-input fr-mb-0"
          value={utilisateurId}
          onChange={(event) => setUtilisateurId(event.target.value)}
        />
        <BoutonDUsurpation
          desactive={utilisateurId === ''}
          utilisateurId={utilisateurId}
        />
      </div>
    </AdministrationInfoCard>
  )
}
