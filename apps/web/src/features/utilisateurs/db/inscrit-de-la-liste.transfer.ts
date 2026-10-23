import {
  personneConseillerNumeriqueSelect,
  personneEstConseillerNumerique,
} from '@app/web/features/employeuse/server'
import type { Prisma } from '@app/web/generated/prisma/client'
import {
  AdresseCourriel,
  CoordinateurId,
  dispositifDe,
  type InscritDeLaListe,
  MediateurId,
  Nom,
  Prenom,
  rattachements,
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
    select: { ...personneConseillerNumeriqueSelect, isCoordinateur: true },
  },
} satisfies Prisma.UserSelect

export type InscritDeLaListeRow = Prisma.UserGetPayload<{
  select: typeof inscritDeLaListeSelect
}>

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
      }
}
