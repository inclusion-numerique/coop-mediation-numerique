import { Prisma } from '@/generated/prisma/client'
import type {
  CriteresDesStatistiques,
  PerimetreDesStatistiques,
} from '../../../domain'
import {
  filtreDesStatistiques,
  type RendezVousAuxStatuts,
} from './criteres-des-statistiques.sql'
import { dansLePerimetre } from './perimetre-des-statistiques.sql'

export type DemandeDeStatistiques = {
  readonly perimetre: PerimetreDesStatistiques
  readonly criteres: CriteresDesStatistiques
  readonly rendezVousAuxStatuts: RendezVousAuxStatuts
}

export const jointuresDesStatistiques = (
  { communes, departements, dispositif }: CriteresDesStatistiques,
  { avecLeLieu }: { readonly avecLeLieu: boolean } = { avecLeLieu: false },
): Prisma.Sql =>
  Prisma.sql`${
    avecLeLieu || communes.length > 0 || departements.length > 0
      ? Prisma.sql`LEFT JOIN lieu_inclusion str ON str.id = act.structure_id`
      : Prisma.empty
  } ${
    dispositif === null
      ? Prisma.empty
      : Prisma.sql`LEFT JOIN mediateurs med ON act.mediateur_id = med.id LEFT JOIN users u ON med.user_id = u.id`
  }`

export const activitesRetenues = ({
  perimetre,
  criteres,
  rendezVousAuxStatuts,
}: DemandeDeStatistiques): Prisma.Sql =>
  Prisma.sql`act.suppression IS NULL
    AND ${dansLePerimetre(perimetre)}
    AND ${filtreDesStatistiques(criteres, { rendezVousAuxStatuts })}`

export const personneAccompagnee = (
  demande: DemandeDeStatistiques,
): Prisma.Sql =>
  Prisma.sql`EXISTS (
    SELECT 1
    FROM accompagnements acc
      INNER JOIN activites act ON act.id = acc.activite_id
      ${jointuresDesStatistiques(demande.criteres)}
    WHERE acc.beneficiaire_id = ben.id
      AND ${activitesRetenues(demande)}
  )`
