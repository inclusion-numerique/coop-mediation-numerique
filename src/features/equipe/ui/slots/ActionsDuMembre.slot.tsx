import type { ReactNode } from 'react'
import type { LigneEquipe } from '../../domain'
import GererUneInvitation from '../components/GererUneInvitation'
import { nomAffiche } from './membre.presenter'

export type MembreAGerer = {
  mediateurId: string
  coordinateurId: string
  nomAffiche: string
}

export type AncienMembreAGerer = MembreAGerer & {
  depuis: Date
  jusquA: Date
}

const ActionsDuMembre = ({
  ligne,
  coordinateurId,
  retirer,
  supprimer,
}: {
  ligne: LigneEquipe
  coordinateurId: string
  retirer: (membre: MembreAGerer) => ReactNode
  supprimer: (ancienMembre: AncienMembreAGerer) => ReactNode
}) => {
  const { statut, personne } = ligne

  if (statut.type === 'Invitation')
    return (
      <GererUneInvitation
        email={ligne.email}
        coordinateurId={coordinateurId}
        envoyeeLe={statut.envoyeeLe}
      />
    )

  if (personne.type === 'SansCompte') return null

  if (statut.type === 'Actif' || statut.type === 'Inactif')
    return retirer({
      mediateurId: personne.mediateurId,
      coordinateurId,
      nomAffiche: nomAffiche(ligne),
    })

  return statut.type === 'AncienMembre'
    ? supprimer({
        mediateurId: personne.mediateurId,
        coordinateurId,
        nomAffiche: nomAffiche(ligne),
        depuis: statut.depuis,
        jusquA: statut.jusquA,
      })
    : null
}

export default ActionsDuMembre
