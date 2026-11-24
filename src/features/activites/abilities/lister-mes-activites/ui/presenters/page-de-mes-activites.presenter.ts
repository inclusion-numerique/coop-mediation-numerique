import {
  type ChronologieDesActivites,
  type ContenuDeLaChronologie,
  type CriteresDesActivites,
  type MediateurId,
  type OrdreChronologique,
  type Pagination,
} from '../../../../domain'
import {
  basculeDesRendezVous,
  type CompteRendezVousDuMediateur,
  compteConnecte,
  contenuDeLaListe,
  lectureDeLaListe,
  type ParametresDeLaListe,
} from './lecture-de-la-liste.presenter'
import { CHEMIN_DE_MES_ACTIVITES } from './liens-vers-mes-rendez-vous.presenter'
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
  readonly criteres: CriteresDesActivites
  readonly parametresDesFiltres: Readonly<Record<string, string>>
  readonly compteRdv: CompteRendezVous | null
  readonly timezone: string
  readonly chronologie: LireLaChronologie
}

export const maListeDActivites = ({
  mediateurId,
  parametres,
  criteres,
  parametresDesFiltres,
  compteRdv,
  timezone,
  chronologie: lireLaChronologie,
}: DemandeDeMesActivites) => {
  const { filtree, voirLesRdvs, pagination, ordre } = lectureDeLaListe(
    parametres,
    criteres,
  )
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
      lignesParPage: pagination.pageSize,
      aucuneActivite: lue.elements.length === 0 && !filtree,
    })),
    parametres: {
      ...parametresDesFiltres,
      ...parametresDeNavigation(parametres),
    },
    bascule: basculeDesRendezVous(compte, {
      chemin: CHEMIN_DE_MES_ACTIVITES,
      parametres,
    }),
  }
}

export const monTableauDActivites = ({
  mediateurId,
  parametres,
  criteres,
  parametresDesFiltres,
  compteRdv,
  timezone,
  chronologie: lireLaChronologie,
}: DemandeDeMesActivites) => {
  const { filtree, voirLesRdvs, pagination, ordre } = lectureDeLaListe(
    parametres,
    criteres,
  )

  const chronologie = lireLaChronologie({
    mediateurId,
    criteres,
    pagination,
    ordre,
    contenu: 'ActivitesSeules',
    comptesRendezVous: null,
  })

  return {
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
      lignesParPage: pagination.pageSize,
    })),
    parametres: {
      ...parametresDesFiltres,
      ...parametresDeNavigation(parametres),
    },
  }
}
