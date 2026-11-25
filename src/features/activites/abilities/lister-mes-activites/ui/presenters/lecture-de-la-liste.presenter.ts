import { lectureDeLaPagination } from '@/features/activites/ui/filtres/liste-des-activites.filtre'
import type { AdresseCourante } from '@/libraries/etat-d-url'
import {
  type CriteresDesActivites,
  contenuDeLaChronologie,
  estFiltreDesActivites,
} from '../../../../domain'
import { filtresDesRendezVousDeLaListe } from '../filtres/rendez-vous-de-la-liste.filtre'

export type ParametresDeLaListe = Readonly<
  Record<string, string | string[] | undefined>
>

export type CompteRendezVousDuMediateur = {
  readonly hasOauthTokens: boolean
  readonly includeRdvsInActivitesList: boolean
  readonly invalidWebhookOrganisationIds: readonly number[]
}

export const lectureDeLaListe = (
  parametres: ParametresDeLaListe,
  criteres: CriteresDesActivites,
) => {
  return {
    criteres,
    filtree: estFiltreDesActivites(criteres),
    voirLesRdvs:
      filtresDesRendezVousDeLaListe.charger(parametres)['voir-rdvs'] !== null,
    ...lectureDeLaPagination(parametres),
  }
}

export const compteConnecte = <C extends CompteRendezVousDuMediateur>(
  compte: C | null,
): C | null => (compte?.hasOauthTokens ? compte : null)

export const contenuDeLaListe = ({
  criteres,
  compte,
  voirLesRdvs,
}: {
  readonly criteres: CriteresDesActivites
  readonly compte: CompteRendezVousDuMediateur | null
  readonly voirLesRdvs: boolean
}) =>
  contenuDeLaChronologie(
    criteres,
    compte === null
      ? { _tag: 'NonConnecte' }
      : {
          _tag: 'Connecte',
          affichesDansLaListe: compte.includeRdvsInActivitesList || voirLesRdvs,
        },
  )

const rendezVousDemandes = (
  parametres: AdresseCourante['parametres'],
): boolean => {
  const { rdvs, 'voir-rdvs': voir } =
    filtresDesRendezVousDeLaListe.charger(parametres)
  return rdvs.length > 0 || voir !== null
}

export const basculeDesRendezVous = (
  compte: CompteRendezVousDuMediateur | null,
  adresse: AdresseCourante,
) =>
  compte === null
    ? null
    : {
        affiches:
          compte.includeRdvsInActivitesList ||
          rendezVousDemandes(adresse.parametres),
        syncDataOnLoad: compte.invalidWebhookOrganisationIds.length > 0,
        sansLesFiltresDesRendezVous:
          filtresDesRendezVousDeLaListe.sansFiltres(adresse),
      }

export const sousTitreDeMesActivites = (
  aussiCoordinateur: boolean,
): string | undefined => (aussiCoordinateur ? 'Médiation numérique' : undefined)
