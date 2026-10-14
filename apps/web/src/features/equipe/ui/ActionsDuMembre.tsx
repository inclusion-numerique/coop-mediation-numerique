import BoutonRetirerUnMembre from '../abilities/retirer-un-membre/ui/BoutonRetirerUnMembre'
import BoutonSupprimerUnAncienMembre from '../abilities/supprimer-un-ancien-membre/ui/BoutonSupprimerUnAncienMembre'
import type { LigneEquipe } from '../domain'
import GererUneInvitation from './GererUneInvitation'

const nomAffiche = ({ profil, email }: LigneEquipe): string =>
  [profil?.prenom, profil?.nom].filter(Boolean).join(' ') || email

const ActionsDuMembre = ({
  ligne,
  coordinateurId,
}: {
  ligne: LigneEquipe
  coordinateurId: string
}) => {
  const { statut, mediateurId } = ligne

  if (statut.type === 'Invitation')
    return (
      <GererUneInvitation
        email={ligne.email}
        coordinateurId={coordinateurId}
        envoyeeLe={statut.envoyeeLe}
      />
    )

  if (mediateurId === null) return null

  if (statut.type === 'Actif' || statut.type === 'Inactif')
    return (
      <BoutonRetirerUnMembre
        mediateurId={mediateurId}
        coordinateurId={coordinateurId}
        nomAffiche={nomAffiche(ligne)}
      />
    )

  return statut.type === 'AncienMembre' ? (
    <BoutonSupprimerUnAncienMembre
      mediateurId={mediateurId}
      coordinateurId={coordinateurId}
      nomAffiche={nomAffiche(ligne)}
      depuis={statut.depuis}
      jusquA={statut.jusquA}
    />
  ) : null
}

export default ActionsDuMembre
