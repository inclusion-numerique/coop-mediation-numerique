import { contratLePlusRecent } from '@app/web/features/employeuse'
import type { Prisma } from '@app/web/generated/prisma/client'

/**
 * Dates BRUTES des contrats : le domaine `Contrat` fusionne fin et rupture en un
 * seul terme, alors que Brevo les reçoit séparément (attributs posés par l'import
 * « Fins de contrat CN » du dashboard).
 */
export const contratsBrevoSelect = {
  contrats: {
    select: { dateDebut: true, dateFin: true, dateRupture: true },
  },
} satisfies Prisma.PersonneMainSelect

type ContratBrevoRow = {
  dateDebut: Date | null
  dateFin: Date | null
  dateRupture: Date | null
}

export type AttributsContratBrevo = {
  COOP_DATE_FIN_CONTRAT?: string
  COOP_DATE_RUPTURE?: string
}

// Colonnes @db.Date : minuit UTC, le slice ne décale pas le jour. Brevo ignore
// `null` sur un attribut Date : seule la chaîne vide efface une valeur.
const toBrevoDate = (date: Date | null): string =>
  date?.toISOString().slice(0, 10) ?? ''

/**
 * Contrat le plus récent de la personne, comme l'import « Fins de contrat CN ».
 *
 * Sans contrat connu, aucun attribut : l'import rapproche parfois par nom des
 * personnes que `coop_id` ne relie pas, et on n'efface pas ce qu'il a posé. Avec
 * un contrat, les deux attributs partent toujours — une date absente (CDI, pas de
 * rupture) part en chaîne vide et efface une valeur périmée, typiquement la
 * rupture d'un poste précédent après une réembauche ailleurs.
 *
 * Les lignes sans date de début (~15 % de `main.contrat`) ne portent qu'une
 * rupture : ce sont des sorties de postes antérieurs, toujours chez une autre
 * structure que le dernier contrat daté (constat sur les données, octobre 2026).
 * Les classer en dernier les écarte donc à raison.
 */
export const attributsContratBrevo = (
  personne: { contrats: readonly ContratBrevoRow[] } | null,
): AttributsContratBrevo => {
  const contrat = contratLePlusRecent(
    personne?.contrats ?? [],
    (row) => row.dateDebut,
  )
  if (!contrat) return {}

  return {
    COOP_DATE_FIN_CONTRAT: toBrevoDate(contrat.dateFin),
    COOP_DATE_RUPTURE: toBrevoDate(contrat.dateRupture),
  }
}
