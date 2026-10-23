import {
  personneConseillerNumeriqueSelect,
  personneEmployeuseSelect,
  personneEstConseillerNumerique,
} from '@app/web/features/employeuse/server'
import type { Prisma } from '@app/web/generated/prisma/client'

export const acteurCoordinationSelect = {
  creation: true,
  coordinateur: {
    select: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          name: true,
          // Employeuse courante du coordinateur en PUR MAIN (ADR-002 échange final) : plus de
          // lecture `coop.employes_structures`. On lit `personneMain` ; le consommateur dérive le
          // codeInsee via `personneToSessionEmplois` (getDepartementCodeForActeur).
          personneMain: { select: personneEmployeuseSelect },
        },
      },
    },
  },
} satisfies Prisma.MediateurCoordonneSelect

export const acteurSelectForList = {
  id: true,
  firstName: true,
  lastName: true,
  name: true,
  email: true,
  phone: true,
  personneMain: { select: personneConseillerNumeriqueSelect },
  coordinateur: {
    select: {
      id: true,
    },
  },
  mediateur: {
    select: {
      id: true,
      coordinations: {
        where: { suppression: null },
        select: acteurCoordinationSelect,
      },
      _count: {
        select: { enActivite: { where: { suppression: null, fin: null } } },
      },
    },
  },
} satisfies Prisma.UserSelect

export type ActeurForList = Prisma.UserGetPayload<{
  select: typeof acteurSelectForList
}>

export type ActeurCoordinateurType =
  | 'coordinateur_dans_dispositif'
  | 'coordinateur_hors_dispositif'
  | null

export const getActeurCoordinateurType = ({
  coordinateur,
  personneMain,
}: Pick<
  ActeurForList,
  'coordinateur' | 'personneMain'
>): ActeurCoordinateurType => {
  if (coordinateur == null) {
    return null
  }

  // Dispositif dérivé de l'affectation `idposte` active (ADR-002), au lieu de la colonne recopiée.
  return personneEstConseillerNumerique(personneMain)
    ? 'coordinateur_dans_dispositif'
    : 'coordinateur_hors_dispositif'
}
