import {
  contratLePlusRecent,
  personneConseillerNumeriqueSelect,
  personneEstConseillerNumerique,
} from '@app/web/features/employeuse/server'
import type { Prisma } from '@app/web/generated/prisma/client'
import {
  AdresseCourriel,
  CoordinateurId,
  type DatesDeContrat,
  dispositifDe,
  type InscritDeLaListe,
  MediateurId,
  Nom,
  Prenom,
  rattachements,
  SANS_CONTRAT,
  situationDansLeDispositif,
  telephoneEnregistrable,
  UtilisateurId,
} from '../domain'

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
      ...personneConseillerNumeriqueSelect,
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

export const datesDuContratLePlusRecent = (
  contrats: readonly ContratRow[],
): DatesDeContrat => {
  const contrat = contratLePlusRecent(
    contrats.toSorted(departageAEgaliteDeDebut),
    (row) => row.dateDebut,
  )
  return contrat === null
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
          dispositifDe(personneEstConseillerNumerique(row.personneMain)),
          row.personneMain?.isCoordinateur ?? false,
        ),
        contrat: datesDuContratLePlusRecent(row.personneMain?.contrats ?? []),
      }
}
