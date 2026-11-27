import { signaler } from '@/configuration/telemetry/serveur'
import {
  type DemandeDUsagersExternes,
  demandeNormalisee,
  type ValeurInvalideDeRdvsp,
  valeursInvalidesDeLaDemande,
} from './usager-externe.transfer'

export const valeurInvalideEnErreur = ({
  rdvUserId,
  champ,
}: ValeurInvalideDeRdvsp): Error =>
  new Error(
    `Usager RDV ${rdvUserId} : ${champ} invalide reçu de RDV Service Public, ignoré pour la fusion`,
  )

export const demandeSignalee = (demande: DemandeDUsagersExternes) => {
  valeursInvalidesDeLaDemande(demande)
    .map(valeurInvalideEnErreur)
    .forEach(signaler)
  return demandeNormalisee(demande)
}
