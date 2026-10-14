import BoutonRetirerUnMembre from '../abilities/retirer-un-membre/ui/BoutonRetirerUnMembre'
import BoutonSupprimerUnAncienMembre from '../abilities/supprimer-un-ancien-membre/ui/BoutonSupprimerUnAncienMembre'
import type { LigneEquipe } from '../domain'
import GererUneInvitation from './GererUneInvitation'
import { nomAffiche } from './membre.presenter'

const ActionsDuMembre = ({
  ligne,
  coordinateurId,
}: {
  ligne: LigneEquipe
  coordinateurId: string
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
    return (
      <BoutonRetirerUnMembre
        mediateurId={personne.mediateurId}
        coordinateurId={coordinateurId}
        nomAffiche={nomAffiche(ligne)}
      />
    )

  return statut.type === 'AncienMembre' ? (
    <BoutonSupprimerUnAncienMembre
      mediateurId={personne.mediateurId}
      coordinateurId={coordinateurId}
      nomAffiche={nomAffiche(ligne)}
      depuis={statut.depuis}
      jusquA={statut.jusquA}
    />
  ) : null
}

export default ActionsDuMembre
