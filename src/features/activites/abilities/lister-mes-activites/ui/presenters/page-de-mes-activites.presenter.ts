import {
  type ChronologieDesActivites,
  type ContenuDeLaChronologie,
  type CriteresDesActivites,
  type MediateurId,
  type OrdreChronologique,
  type Pagination,
  parametresDesActivitesDe,
} from '../../../../domain'
import { filtresDeLaListe } from '../../../../ui/presenters/filtres/filtres-de-la-liste.search-params'
import {
  basculeDesRendezVous,
  type CompteRendezVousDuMediateur,
  compteConnecte,
  contenuDeLaListe,
  lectureDeLaListe,
  type ParametresDeLaListe,
} from './lecture-de-la-liste.presenter'
import {
  decompteDeLaListe,
  joursDeLaListe,
  lignesDuTableau,
  titreDuDecompte,
} from './mes-activites.presenter'
import {
  parametresDeNavigation,
  rendezVousFiltrablesDansLaListe,
  rendezVousFiltrablesDansLeTableau,
} from './navigation.presenter'

type LireLaChronologie = (demande: {
  readonly mediateurId: MediateurId
  readonly criteres: CriteresDesActivites
  readonly pagination: Pagination
  readonly ordre: OrdreChronologique
  readonly contenu: ContenuDeLaChronologie
  readonly comptesRendezVous: readonly number[] | null
}) => Promise<ChronologieDesActivites>

type CompteRendezVous = CompteRendezVousDuMediateur & { readonly id: number }

type DemandeDeMesActivites = {
  readonly mediateurId: MediateurId
  readonly parametres: ParametresDeLaListe
  readonly compteRdv: CompteRendezVous | null
  readonly timezone: string
  readonly chronologie: LireLaChronologie
}

export const maListeDActivites = ({
  mediateurId,
  parametres,
  compteRdv,
  timezone,
  chronologie: lireLaChronologie,
}: DemandeDeMesActivites) => {
  const { criteres, filtree, voirLesRdvs, pagination, ordre } =
    lectureDeLaListe(parametres)
  const compte = compteConnecte(compteRdv)

  const chronologie = lireLaChronologie({
    mediateurId,
    criteres,
    pagination,
    ordre,
    contenu: contenuDeLaListe({ criteres, compte, voirLesRdvs }),
    comptesRendezVous: compteRdv === null ? null : [compteRdv.id],
  })

  return {
    filtres: filtresDeLaListe(criteres),
    rendezVousFiltrables: rendezVousFiltrablesDansLaListe({
      compte,
      voirLesRdvs,
      statutsDemandes: criteres.statutsDeRendezVous.length,
    }),
    nombreDAccompagnements: chronologie.then(
      ({ total }) => total.accompagnements,
    ),
    contenu: chronologie.then((lue) => ({
      decompte: decompteDeLaListe(lue, filtree),
      jours: joursDeLaListe(lue.elements, timezone),
      total: lue.total.activites + lue.total.rendezVous,
      lignesParPage: pagination.lignesParPage,
      aucuneActivite: lue.elements.length === 0 && !filtree,
    })),
    parametres: {
      ...parametresDesActivitesDe(criteres),
      ...parametresDeNavigation(parametres),
    },
    bascule: basculeDesRendezVous(compte),
  }
}

export const monTableauDActivites = ({
  mediateurId,
  parametres,
  compteRdv,
  timezone,
  chronologie: lireLaChronologie,
}: DemandeDeMesActivites) => {
  const { criteres, filtree, voirLesRdvs, pagination, ordre } =
    lectureDeLaListe(parametres)

  const chronologie = lireLaChronologie({
    mediateurId,
    criteres,
    pagination,
    ordre,
    contenu: 'ActivitesSeules',
    comptesRendezVous: null,
  })

  return {
    filtres: filtresDeLaListe(criteres),
    rendezVousFiltrables: rendezVousFiltrablesDansLeTableau({
      compte: compteConnecte(compteRdv),
      voirLesRdvs,
    }),
    nombreDAccompagnements: chronologie.then(
      ({ total }) => total.accompagnements,
    ),
    contenu: chronologie.then((lue) => ({
      decompte: titreDuDecompte(lue.total.activites, filtree),
      lignes: lignesDuTableau(lue, timezone),
      total: lue.total.activites + lue.total.rendezVous,
      lignesParPage: pagination.lignesParPage,
    })),
    parametres: {
      ...parametresDesActivitesDe(criteres),
      ...parametresDeNavigation(parametres),
    },
  }
}
