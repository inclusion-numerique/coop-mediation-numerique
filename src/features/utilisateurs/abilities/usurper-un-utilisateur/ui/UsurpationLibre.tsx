'use client'

import AdministrationInfoCard from '@app/web/libs/ui/administration/AdministrationInfoCard'
import { useState } from 'react'
import { BoutonUsurper } from './BoutonUsurper'

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
        <BoutonUsurper
          desactive={utilisateurId === ''}
          utilisateurId={utilisateurId}
        />
      </div>
    </AdministrationInfoCard>
  )
}
