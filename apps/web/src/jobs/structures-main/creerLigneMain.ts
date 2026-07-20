import { entrepotPrismaClient } from '@app/web/entrepotPrismaClient'

// Création d'une ligne `main.structure_administrative` (et de son adresse) à partir d'une
// employeuse coop. Partagé par `appliquer-plan-couverture` et `couvrir-employeuses-restantes`
// pour que les deux écrivent dans `main` exactement de la même façon.
//
// Trois pièges, tous constatés en exécution réelle sur copie de prod :
//
//   1. `main.adresse` est UNIQUE sur (code_postal, nom_commune, nom_voie, numero_voie,
//      repetition). Insérer une adresse déjà présente échoue : on réutilise l'existante.
//   2. `main.structure_administrative` est UNIQUE sur (siret, denomination_antenne) en
//      NULLS NOT DISTINCT : un seul enregistrement par siret peut porter une antenne nulle.
//      On prend cette place si elle est libre — c'est la ligne de l'identité légale —
//      sinon on nomme l'antenne d'après la structure coop.
//   3. Les deux écritures sont dans UNE transaction : sans cela, un échec sur la structure
//      laisse une adresse orpheline (constaté, 2 lignes à nettoyer à la main).

export type EmployeuseACreer = {
  id: string
  siret: string | null
  nom: string
  adresse: string
  commune: string
  codePostal: string
  codeInsee: string | null
}

export type ResultatCreation =
  | { statut: 'creee'; detail: string; antenne: string | null }
  | { statut: 'ignoree'; detail: string }
  | { statut: 'echec'; detail: string }

// L'adresse coop est une chaîne libre : le numéro de voie s'il ouvre la chaîne, le reste
// devient le libellé. Pas de géocodage — `main` n'en exige pas pour une employeuse.
export const decouperAdresse = (adresse: string) => {
  const correspondance = /^(\d+)\s+(.*)$/.exec(adresse.trim())
  return {
    numeroVoie: correspondance ? Number(correspondance[1]) : null,
    nomVoie: correspondance ? correspondance[2] : adresse.trim() || null,
  }
}

// Antenne à poser : la place nulle si elle est libre, sinon le nom de la structure, sinon
// « nom (commune) ». `null` en second membre signale que les trois sont prises.
export const choisirAntenne = async (
  employeuse: EmployeuseACreer,
): Promise<{ antenne: string | null; disponible: boolean }> => {
  const prises = await entrepotPrismaClient.$queryRaw<
    { denomination_antenne: string | null }[]
  >`
    SELECT denomination_antenne FROM main.structure_administrative
    WHERE siret = ${employeuse.siret}
  `

  const nulleLibre = !prises.some(
    ({ denomination_antenne }) => denomination_antenne === null,
  )
  if (nulleLibre) {
    return { antenne: null, disponible: true }
  }

  const nommees = new Set(
    prises
      .map(({ denomination_antenne }) => denomination_antenne)
      .filter((nom): nom is string => nom !== null),
  )

  const antenne =
    [employeuse.nom, `${employeuse.nom} (${employeuse.commune})`].find(
      (candidat) => !nommees.has(candidat),
    ) ?? null

  return { antenne, disponible: antenne !== null }
}

export const creerLigneMain = async (
  employeuse: EmployeuseACreer,
): Promise<ResultatCreation> => {
  if (employeuse.siret === null || employeuse.codeInsee === null) {
    return { statut: 'ignoree', detail: 'siret ou code INSEE absent côté coop' }
  }

  const { antenne, disponible } = await choisirAntenne(employeuse)

  if (!disponible) {
    return {
      statut: 'ignoree',
      detail: 'aucun nom d’antenne disponible pour ce siret',
    }
  }

  const { numeroVoie, nomVoie } = decouperAdresse(employeuse.adresse)

  return entrepotPrismaClient
    .$transaction(async (transaction) => {
      const existantes = await transaction.$queryRaw<{ id: number }[]>`
        SELECT id FROM main.adresse
        WHERE code_postal = ${employeuse.codePostal}
          AND nom_commune = ${employeuse.commune}
          AND nom_voie IS NOT DISTINCT FROM ${nomVoie}
          AND coalesce(numero_voie, 0) = coalesce(${numeroVoie}::smallint, 0)
          AND coalesce(repetition, '') = ''
        LIMIT 1
      `

      const reutilisee = existantes.at(0)?.id ?? null

      const creees = reutilisee
        ? []
        : await transaction.$queryRaw<{ id: number }[]>`
            INSERT INTO main.adresse
              (code_postal, code_insee, nom_commune, nom_voie, numero_voie, created_at, updated_at)
            VALUES (${employeuse.codePostal}, ${employeuse.codeInsee}, ${employeuse.commune},
                    ${nomVoie}, ${numeroVoie}, now(), now())
            RETURNING id`

      const adresseId = reutilisee ?? creees.at(0)?.id ?? null

      await transaction.$executeRaw`
        INSERT INTO main.structure_administrative
          (siret, denomination_sirene, denomination_antenne, adresse_id, structure_coop_id,
           edited_by, created_at, updated_at, updated_at_coop)
        VALUES (${employeuse.siret}, ${employeuse.nom}, ${antenne}, ${adresseId},
                ${employeuse.id}::uuid, 'coop', now(), now(), now())`

      return {
        statut: 'creee' as const,
        antenne,
        detail:
          `adresse ${adresseId}${reutilisee ? ' (réutilisée)' : ' (créée)'}` +
          `, antenne ${antenne === null ? 'NULL' : `« ${antenne} »`}`,
      }
    })
    .catch((error: unknown) => ({
      statut: 'echec' as const,
      detail: String(error).slice(0, 120),
    }))
}
