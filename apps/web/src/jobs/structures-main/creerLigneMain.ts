import { entrepotPrismaClient } from '@app/web/entrepotPrismaClient'
import { identiteSirene } from '@app/web/jobs/structures-main/identiteSirene'
import {
  lierLigneLibre,
  trouverLigneLibre,
} from '@app/web/jobs/structures-main/reclamerLigneMain'

// Les DOM portent un code INSEE à trois chiffres de département (974), la métropole deux.
const departementDe = (codeInsee: string): string =>
  codeInsee.startsWith('97') ? codeInsee.slice(0, 3) : codeInsee.slice(0, 2)

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
  | { statut: 'liee'; detail: string }
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

  // Ne jamais créer quand une ligne `main` libre décrit déjà cette antenne : s'y raccrocher.
  const libre = await trouverLigneLibre(employeuse)

  if (libre !== null) {
    return lierLigneLibre(employeuse.id, libre)
  }

  const { antenne, disponible } = await choisirAntenne(employeuse)

  if (!disponible) {
    return {
      statut: 'ignoree',
      detail: 'aucun nom d’antenne disponible pour ce siret',
    }
  }

  // L'identité SIRENE fait foi. À défaut (API muette, établissement inconnu), on retombe sur
  // la donnée coop — mais jamais dans `denomination_sirene`, qui doit rester honnête : le nom
  // coop part alors dans l'antenne, déjà choisie ci-dessus.
  const identite = await identiteSirene(employeuse.siret)

  const adresse = identite?.adresse ?? {
    ...decouperAdresse(employeuse.adresse),
    repetition: null,
    codePostal: employeuse.codePostal,
    commune: employeuse.commune,
    codeInsee: employeuse.codeInsee,
    clefInterop: null,
    longitude: null,
    latitude: null,
  }

  const source = identite?.adresse ? 'sirene' : 'coop'
  const geocodee = adresse.clefInterop !== null

  return entrepotPrismaClient
    .$transaction(async (transaction) => {
      const existantes = await transaction.$queryRaw<{ id: number }[]>`
        SELECT id FROM main.adresse
        WHERE code_postal = ${adresse.codePostal}
          AND nom_commune = ${adresse.commune}
          AND nom_voie IS NOT DISTINCT FROM ${adresse.nomVoie}
          AND coalesce(numero_voie, 0) = coalesce(${adresse.numeroVoie}::smallint, 0)
          AND coalesce(repetition, '') = coalesce(${adresse.repetition}, '')
        LIMIT 1
      `

      const reutilisee = existantes.at(0)?.id ?? null

      const creees = reutilisee
        ? []
        : await transaction.$queryRaw<{ id: number }[]>`
            INSERT INTO main.adresse
              (code_postal, code_insee, nom_commune, nom_voie, numero_voie, repetition,
               clef_interop, departement, geom, created_at, updated_at)
            VALUES (${adresse.codePostal}, ${adresse.codeInsee}, ${adresse.commune},
                    ${adresse.nomVoie}, ${adresse.numeroVoie}, ${adresse.repetition},
                    ${adresse.clefInterop}, ${departementDe(adresse.codeInsee)},
                    ${
                      adresse.longitude === null || adresse.latitude === null
                        ? null
                        : `SRID=4326;POINT(${adresse.longitude} ${adresse.latitude})`
                    }::geometry,
                    now(), now())
            RETURNING id`

      const adresseId = reutilisee ?? creees.at(0)?.id ?? null

      await transaction.$executeRaw`
        INSERT INTO main.structure_administrative
          (siret, denomination_sirene, denomination_antenne, adresse_id, structure_coop_id,
           code_activite_principale, categorie_juridique, etat_administratif,
           last_sirene_enrich_at, edited_by, created_at, updated_at, updated_at_coop)
        VALUES (${employeuse.siret}, ${identite?.denomination ?? null}, ${antenne}, ${adresseId},
                ${employeuse.id}::uuid,
                ${identite?.codeActivitePrincipale ?? null},
                ${identite?.categorieJuridique ?? null},
                ${identite?.etatAdministratif ?? null},
                ${identite === null ? null : new Date()},
                'coop', now(), now(), now())`

      return {
        statut: 'creee' as const,
        antenne,
        detail:
          `adresse ${adresseId}${reutilisee ? ' (réutilisée)' : ' (créée)'}` +
          `, source ${source}${geocodee ? ' + BAN' : ''}` +
          `, antenne ${antenne === null ? 'NULL' : `« ${antenne} »`}`,
      }
    })
    .catch((error: unknown) => ({
      statut: 'echec' as const,
      detail: String(error).slice(0, 120),
    }))
}
