import {
  type CriteresDesActivites,
  contenuDeLaChronologie,
  estFiltreDesActivites,
  ordreChronologiqueLu,
  paginationLue,
} from '../../../../domain'

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
    voirLesRdvs: parametres['voir-rdvs'] === '1',
    pagination: paginationLue(parametres),
    ordre: ordreChronologiqueLu(parametres.ordre),
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

export const basculeDesRendezVous = (
  compte: CompteRendezVousDuMediateur | null,
) =>
  compte === null
    ? null
    : {
        includeRdvsInActivitesList: compte.includeRdvsInActivitesList,
        syncDataOnLoad: compte.invalidWebhookOrganisationIds.length > 0,
      }

export const sousTitreDeMesActivites = (
  aussiCoordinateur: boolean,
): string | undefined => (aussiCoordinateur ? 'Médiation numérique' : undefined)
