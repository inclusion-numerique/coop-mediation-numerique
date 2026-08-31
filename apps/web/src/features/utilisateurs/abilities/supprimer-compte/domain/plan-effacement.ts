import type { RattachementsDuCompte } from '@app/web/features/utilisateurs/domain'
import {
  coordinateurDe,
  mediateurDe,
} from '@app/web/features/utilisateurs/domain'
import { NomCharge } from './constat-effacement'

type ChargePlanifiable = {
  readonly charge: NomCharge
  readonly due: (rattachements: RattachementsDuCompte) => boolean
}

const porteUnMediateur = (rattachements: RattachementsDuCompte): boolean =>
  mediateurDe(rattachements) !== null

const porteUnCoordinateur = (rattachements: RattachementsDuCompte): boolean =>
  coordinateurDe(rattachements) !== null

const porteUneEquipe = (rattachements: RattachementsDuCompte): boolean =>
  porteUnMediateur(rattachements) || porteUnCoordinateur(rattachements)

const toujours = (): boolean => true

/**
 * L'ORDRE de cette table est un invariant, pas une préférence d'écriture.
 *
 * Le portefeuille précède l'empreinte RDV parce que c'est son anonymisation qui
 * détache `rdvUserId` : sans elle, aucun usager n'est orphelin et le balayage
 * RDV ne supprimerait rien. Inverser les deux ne casse rien de visible — ça
 * n'efface simplement pas.
 *
 * Les listes de diffusion viennent en dernier : l'appel sort du réseau, et rien
 * n'oblige à l'attendre avant d'avoir effacé ce qui est chez nous.
 */
const CHARGES_ORDONNEES: readonly ChargePlanifiable[] = [
  { charge: NomCharge('PortefeuilleBeneficiaires'), due: porteUnMediateur },
  { charge: NomCharge('EmpreinteRdv'), due: toujours },
  { charge: NomCharge('NotesAccompagnements'), due: porteUneEquipe },
  { charge: NomCharge('AppartenancesEquipe'), due: porteUneEquipe },
  { charge: NomCharge('LieuxActivite'), due: porteUnMediateur },
  { charge: NomCharge('PartageStatistiques'), due: porteUneEquipe },
  { charge: NomCharge('ListesDeDiffusion'), due: toujours },
]

/**
 * Les charges dues pour ce compte, dans l'ordre où elles doivent s'exécuter.
 *
 * Un compte sans rattachement ne déclenche que ce qui pend à l'utilisateur
 * lui-même — son compte RDV et ses listes de diffusion.
 */
export const planEffacement = (
  rattachements: RattachementsDuCompte,
): readonly NomCharge[] =>
  CHARGES_ORDONNEES.filter(({ due }) => due(rattachements)).map(
    ({ charge }) => charge,
  )
