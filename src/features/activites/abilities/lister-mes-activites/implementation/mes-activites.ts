import type { RendezVousLies } from '../../../db/rendez-vous-fournis'
import { type MediateurId, parametresDesActivitesDe } from '../../../domain'
import { filtresDeLaListe } from '../../../ui/filtres/filtres-de-la-liste'
import {
  basculeDesRendezVous,
  type CompteRendezVousDuMediateur,
  compteConnecte,
  contenuDeLaListe,
  lectureDeLaListe,
  type ParametresDeLaListe,
} from '../ui/lecture-de-la-liste.presenter'
import {
  decompteDeLaListe,
  joursDeLaListe,
  lignesDuTableau,
  titreDuDecompte,
} from '../ui/mes-activites.presenter'
import {
  parametresDeNavigation,
  rendezVousFiltrablesDansLaListe,
  rendezVousFiltrablesDansLeTableau,
} from '../ui/navigation.presenter'
import {
  listerMesActivites,
  type RendezVousALister,
} from './prisma/chronologie.query'

type CompteRendezVous = CompteRendezVousDuMediateur & { readonly id: number }

type DemandeDeMesActivites = {
  readonly mediateurId: MediateurId
  readonly parametres: ParametresDeLaListe
  readonly compteRdv: CompteRendezVous | null
  readonly timezone: string
  readonly rendezVousLies: RendezVousLies
}

export const maListeDActivites = ({
  mediateurId,
  parametres,
  compteRdv,
  timezone,
  rendezVous,
  rendezVousLies,
}: DemandeDeMesActivites & {
  readonly rendezVous: Omit<RendezVousALister, 'comptes'>
}) => {
  const { criteres, filtree, voirLesRdvs, pagination, ordre } =
    lectureDeLaListe(parametres)
  const compte = compteConnecte(compteRdv)

  const chronologie = listerMesActivites({
    mediateurId,
    criteres,
    pagination,
    ordre,
    contenu: contenuDeLaListe({ criteres, compte, voirLesRdvs }),
    rendezVous:
      compteRdv === null ? null : { comptes: [compteRdv.id], ...rendezVous },
    rendezVousLies,
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
  rendezVousLies,
}: DemandeDeMesActivites) => {
  const { criteres, filtree, voirLesRdvs, pagination, ordre } =
    lectureDeLaListe(parametres)

  const chronologie = listerMesActivites({
    mediateurId,
    criteres,
    pagination,
    ordre,
    contenu: 'ActivitesSeules',
    rendezVous: null,
    rendezVousLies,
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
