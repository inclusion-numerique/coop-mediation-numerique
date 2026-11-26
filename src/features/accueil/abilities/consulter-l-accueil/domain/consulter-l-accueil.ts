import { failure, type Result, success } from '@/libraries/result'
import type { Accueil, ProfilDAccueil, Visiteur } from './accueil'
import {
  type EchecDeConsulterLAccueil,
  SansProfilDAccueil,
  VisiteurIntrouvable,
} from './errors'
import type { ConsulterLAccueilPorts } from './ports'
import { salutation } from './salutation'
import type { UtilisateurId } from './utilisateur-id'

const profilDe = ({
  coordinateurId,
  mediateurId,
  presentationVue,
}: Visiteur): ProfilDAccueil | null => {
  if (coordinateurId !== null) return { _tag: 'Coordinateur', coordinateurId }
  if (mediateurId !== null)
    return { _tag: 'Mediateur', mediateurId, bienvenue: !presentationVue }
  return null
}

export const consulterLAccueil =
  ({ lireLeVisiteur }: ConsulterLAccueilPorts) =>
  async ({
    utilisateurId,
  }: {
    readonly utilisateurId: UtilisateurId
  }): Promise<Result<Accueil, EchecDeConsulterLAccueil>> => {
    const visiteur = await lireLeVisiteur({ utilisateurId })
    if (visiteur === null) return failure(VisiteurIntrouvable())

    const profil = profilDe(visiteur)
    if (profil === null) return failure(SansProfilDAccueil())

    return success({ salutation: salutation(visiteur), profil })
  }
