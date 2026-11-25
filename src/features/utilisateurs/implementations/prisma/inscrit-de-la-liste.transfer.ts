import type { Prisma } from '@/generated/prisma/client'
import { telephoneEnregistrable } from '@/libraries/telephone'
import {
  AdresseCourriel,
  CoordinateurId,
  type DatesDeContrat,
  dispositifDe,
  estEnPoste,
  type InscritDeLaListe,
  MediateurId,
  Nom,
  Prenom,
  rattachements,
  SANS_CONTRAT,
  situationDansLeDispositif,
  UtilisateurId,
} from '../../domain'
import { enPosteSelect } from './conseiller-numerique-en-poste.where'

export const inscritDeLaListeSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  mediateur: { select: { id: true } },
  coordinateur: { select: { id: true } },
  personneMain: {
    select: {
      ...enPosteSelect,
      isCoordinateur: true,
      // Fin et rupture séparées : Brevo a un attribut pour chacune.
      contrats: {
        select: { id: true, dateDebut: true, dateFin: true, dateRupture: true },
      },
    },
  },
} satisfies Prisma.UserSelect

export type InscritDeLaListeRow = Prisma.UserGetPayload<{
  select: typeof inscritDeLaListeSelect
}>

type ContratRow = NonNullable<
  InscritDeLaListeRow['personneMain']
>['contrats'][number]

const departageAEgaliteDeDebut = (a: ContratRow, b: ContratRow): number =>
  Number(b.dateRupture !== null) - Number(a.dateRupture !== null) || b.id - a.id

const plusRecentEnPremier = (a: ContratRow, b: ContratRow): number =>
  (b.dateDebut?.getTime() ?? 0) - (a.dateDebut?.getTime() ?? 0)

export const datesDuContratLePlusRecent = (
  contrats: readonly ContratRow[],
): DatesDeContrat => {
  const contrat = contrats
    .toSorted(departageAEgaliteDeDebut)
    .toSorted(plusRecentEnPremier)
    .at(0)
  return contrat === undefined
    ? SANS_CONTRAT
    : { fin: contrat.dateFin, rupture: contrat.dateRupture }
}

export const inscritDeLaListeToDomain = (
  row: InscritDeLaListeRow,
): InscritDeLaListe | null => {
  const courriel = AdresseCourriel.safe(row.email)

  return courriel === null
    ? null
    : {
        id: UtilisateurId(row.id),
        courriel,
        prenom: Prenom.safe(row.firstName ?? ''),
        nom: Nom.safe(row.lastName ?? ''),
        telephone: telephoneEnregistrable(row.phone),
        rattachements: rattachements(
          row.mediateur === null ? null : MediateurId(row.mediateur.id),
          row.coordinateur === null
            ? null
            : CoordinateurId(row.coordinateur.id),
        ),
        dispositif: situationDansLeDispositif(
          dispositifDe(estEnPoste(row.personneMain)),
          row.personneMain?.isCoordinateur ?? false,
        ),
        contrat: datesDuContratLePlusRecent(row.personneMain?.contrats ?? []),
      }
}
