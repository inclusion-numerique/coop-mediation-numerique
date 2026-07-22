import { writeFile } from 'node:fs/promises'
import { searchAdresse } from '@app/web/external-apis/apiAdresse'
import { banFeatureToAdresseBanData } from '@app/web/external-apis/ban/banFeatureToAdresseBanData'
import { fetchSiretApiData } from '@app/web/features/structures/siret/fetchSiretData'
import {
  parseSireneIdentityForCompletion,
  type SireneIdentity,
  throttleApiEntreprise,
} from '@app/web/features/structures/siret/siretIdentity'
import { getAuditOutputPath } from '@app/web/jobs/audit-output'
import { prismaClient } from '@app/web/prismaClient'
import type { JobExecutor } from '../jobExecutors'
import { output } from '../output'

// Complète, dans `main` (Entrepôt), les lignes `structure_administrative` liées à une employeuse
// coop (`structure_coop_id`) mais incomplètes — SANS jamais faire confiance aux données coop (jadis
// portées par la table `structure` des lieux, modifiables sans garde-fou), à l'exception du SIRET.
// Prérequis de la bascule des clés étrangères (ADR-002 étape 5) :
//   - identité : SIRET -> API Recherche d'entreprises. Le nom vient de `nom_complet` (raison sociale,
//     ou nom+prénom pour une EI). Recopié dans `denomination_antenne` quand la ligne n'a aucun nom.
//   - adresse : l'adresse de l'API Entreprise est géocodée via la BAN. Si le score BAN dépasse le
//     seuil, on enregistre le résultat BAN (structuré + `code_ban` + coordonnées `geom`) ; sinon on
//     garde l'adresse de l'API Entreprise. On réutilise une `main.adresse` existante ou on la crée.
//
// Écrit dans une base partagée : dry-run par défaut (voir CompleterStructuresMainJobValidation).
// Chaque exécution produit un CSV détaillé (une ligne par structure ciblée) pour relire les
// décisions avant / après application.

// Au-dessus de ce score, on considère que la BAN a trouvé la bonne adresse et on l'utilise.
const BAN_SCORE_THRESHOLD = 0.9

type ResolvedAdresse = {
  nomVoie: string
  codePostal: string
  codeInsee: string
  nomCommune: string
  codeBan: string | null
  longitude: number | null
  latitude: number | null
  banScore: number | null
  source: 'ban' | 'api-entreprise'
}

// Détail par structure ciblée, exporté en CSV pour expliquer le rattrapage.
type DetailRow = {
  id: number
  structureCoopId: string
  siret: string
  statut: 'ok' | 'erreur-api'
  erreur: string
  etatAdministratif: string
  nomComplet: string
  denomination: 'complétée' | 'nom-vide' | 'non-requise' | ''
  adresse: 'à-créer' | 'réutilisée' | 'non-requise' | ''
  adresseSource: 'ban' | 'api-entreprise' | ''
  banScore: string
  adNomVoie: string
  adCodePostal: string
  adCodeInsee: string
  adNomCommune: string
  codeBan: string
  coords: string
}

const adresseKey = ({ codePostal, nomCommune, nomVoie }: ResolvedAdresse) =>
  `${codePostal}__${nomCommune}__${nomVoie}`

// Géocode l'adresse de l'API Entreprise via la BAN et retient le meilleur des deux selon le score.
const resolveAdresse = async (
  identity: SireneIdentity,
): Promise<ResolvedAdresse> => {
  const feature = await searchAdresse(
    `${identity.adresse}, ${identity.codePostal} ${identity.commune}`,
  )
  const banScore = feature?.properties.score ?? null

  if (feature && feature.properties.score > BAN_SCORE_THRESHOLD) {
    const ban = banFeatureToAdresseBanData(feature)
    return {
      nomVoie: ban.nom,
      codePostal: ban.codePostal,
      codeInsee: ban.codeInsee,
      nomCommune: ban.commune,
      codeBan: ban.id,
      longitude: ban.longitude,
      latitude: ban.latitude,
      banScore,
      source: 'ban',
    }
  }

  return {
    nomVoie: identity.adresse,
    codePostal: identity.codePostal,
    codeInsee: identity.codeInsee,
    nomCommune: identity.commune,
    codeBan: null,
    longitude: null,
    latitude: null,
    banScore,
    source: 'api-entreprise',
  }
}

const findAdresseId = (resolved: ResolvedAdresse) =>
  prismaClient.adresseMain.findFirst({
    where: {
      codePostal: resolved.codePostal,
      nomCommune: resolved.nomCommune,
      nomVoie: resolved.nomVoie,
      numeroVoie: null,
      repetition: null,
    },
    select: { id: true },
  })

// Crée une `main.adresse` en SQL brut : `geom` (postgis) n'est pas écrivable par le client typé.
// `ST_MakePoint` reçoit des `NULL` quand la BAN n'a pas tranché -> `geom` NULL (adresse API).
const insertAdresse = async (resolved: ResolvedAdresse): Promise<number> => {
  const [created] = await prismaClient.$queryRaw<{ id: number }[]>`
    INSERT INTO main.adresse (code_postal, code_insee, nom_commune, nom_voie, code_ban, geom)
    VALUES (
      ${resolved.codePostal}, ${resolved.codeInsee}, ${resolved.nomCommune}, ${resolved.nomVoie},
      ${resolved.codeBan}::uuid,
      ST_SetSRID(ST_MakePoint(${resolved.longitude}::float8, ${resolved.latitude}::float8), 4326)
    )
    RETURNING id`
  return created.id
}

const escapeCsvField = (value: string): string =>
  /[";\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value

const csvHeader = [
  'id',
  'structure_coop_id',
  'siret',
  'statut',
  'erreur',
  'etat_administratif',
  'nom_complet',
  'denomination',
  'adresse',
  'adresse_source',
  'ban_score',
  'ad_nom_voie',
  'ad_code_postal',
  'ad_code_insee',
  'ad_nom_commune',
  'code_ban',
  'coords_lng_lat',
].join(';')

const detailToCsv = (detail: DetailRow): string =>
  [
    String(detail.id),
    detail.structureCoopId,
    detail.siret,
    detail.statut,
    escapeCsvField(detail.erreur),
    detail.etatAdministratif,
    escapeCsvField(detail.nomComplet),
    detail.denomination,
    detail.adresse,
    detail.adresseSource,
    detail.banScore,
    escapeCsvField(detail.adNomVoie),
    detail.adCodePostal,
    detail.adCodeInsee,
    escapeCsvField(detail.adNomCommune),
    detail.codeBan,
    detail.coords,
  ].join(';')

export const executeCompleterStructuresMain: JobExecutor<
  'completer-structures-main'
> = async (job) => {
  const dryRun = job.payload?.dryRun ?? true

  const cibles = await prismaClient.structureAdministrativeMain.findMany({
    where: {
      structureCoopId: { not: null },
      siret: { not: null },
      NOT: { siret: '' },
      OR: [
        { denominationSirene: null, denominationAntenne: null },
        { adresseId: null },
      ],
    },
    select: {
      id: true,
      structureCoopId: true,
      siret: true,
      denominationSirene: true,
      denominationAntenne: true,
      adresseId: true,
    },
  })

  // Cache local des adresses résolues cette exécution, pour ne pas recréer un doublon quand
  // plusieurs structures partagent la même adresse.
  const adresseIdByKey = new Map<string, number>()

  // Séquentiel + throttle : l'API Recherche d'entreprises est limitée en débit. Renvoie le détail
  // de la ligne (pour le CSV), et applique les écritures hors dry-run.
  const process = async (
    cible: (typeof cibles)[number],
  ): Promise<DetailRow> => {
    const base: DetailRow = {
      id: cible.id,
      structureCoopId: cible.structureCoopId ?? '',
      siret: cible.siret ?? '',
      statut: 'ok',
      erreur: '',
      etatAdministratif: '',
      nomComplet: '',
      denomination: '',
      adresse: '',
      adresseSource: '',
      banScore: '',
      adNomVoie: '',
      adCodePostal: '',
      adCodeInsee: '',
      adNomCommune: '',
      codeBan: '',
      coords: '',
    }

    if (!cible.siret) return base

    await throttleApiEntreprise()
    const apiResult = await fetchSiretApiData(cible.siret)
    if ('error' in apiResult) {
      return { ...base, statut: 'erreur-api', erreur: apiResult.error.message }
    }

    const identity = parseSireneIdentityForCompletion(apiResult)

    const besoinDenomination =
      cible.denominationSirene === null && cible.denominationAntenne === null
    const denomination: DetailRow['denomination'] = besoinDenomination
      ? identity.nom.trim() === ''
        ? 'nom-vide'
        : 'complétée'
      : 'non-requise'

    if (denomination === 'complétée' && !dryRun) {
      await prismaClient.structureAdministrativeMain.update({
        where: { id: cible.id },
        data: { denominationAntenne: identity.nom },
      })
    }

    if (cible.adresseId !== null) {
      return {
        ...base,
        etatAdministratif: identity.etatAdministratif,
        nomComplet: identity.nom,
        denomination,
        adresse: 'non-requise',
      }
    }

    const resolved = await resolveAdresse(identity)
    const existant =
      adresseIdByKey.get(adresseKey(resolved)) ??
      (await findAdresseId(resolved))?.id ??
      null

    if (!dryRun) {
      const adresseId = existant ?? (await insertAdresse(resolved))
      adresseIdByKey.set(adresseKey(resolved), adresseId)
      await prismaClient.structureAdministrativeMain.update({
        where: { id: cible.id },
        data: { adresseId },
      })
    }

    return {
      ...base,
      etatAdministratif: identity.etatAdministratif,
      nomComplet: identity.nom,
      denomination,
      adresse: existant ? 'réutilisée' : 'à-créer',
      adresseSource: resolved.source,
      banScore: resolved.banScore === null ? '' : resolved.banScore.toFixed(2),
      adNomVoie: resolved.nomVoie,
      adCodePostal: resolved.codePostal,
      adCodeInsee: resolved.codeInsee,
      adNomCommune: resolved.nomCommune,
      codeBan: resolved.codeBan ?? '',
      coords:
        resolved.longitude === null || resolved.latitude === null
          ? ''
          : `${resolved.longitude},${resolved.latitude}`,
    }
  }

  // `reduce` pour enchaîner les traitements séquentiellement (respect du throttle API).
  const details = await cibles.reduce<Promise<DetailRow[]>>(
    async (previous, cible) => {
      const accumulated = await previous
      return [...accumulated, await process(cible)]
    },
    Promise.resolve([]),
  )

  const filePath = getAuditOutputPath(
    `completer-structures-main-${dryRun ? 'dry-run' : 'apply'}.csv`,
  )
  await writeFile(
    filePath,
    [csvHeader, ...details.map(detailToCsv)].join('\n'),
    'utf-8',
  )

  const count = (predicate: (detail: DetailRow) => boolean) =>
    details.filter(predicate).length

  const results = {
    dryRun,
    csv: filePath,
    ciblesSiret: details.length,
    denominationsCompletees: count((d) => d.denomination === 'complétée'),
    adressesACreer: count((d) => d.adresse === 'à-créer'),
    adressesReutilisees: count((d) => d.adresse === 'réutilisée'),
    adresseViaBan: count((d) => d.adresseSource === 'ban'),
    adresseViaApiEntreprise: count((d) => d.adresseSource === 'api-entreprise'),
    echecsApi: count((d) => d.statut === 'erreur-api'),
    fermesCompletes: count((d) => d.etatAdministratif === 'F'),
  }

  output.log(
    `completer-structures-main: ${dryRun ? 'DRY RUN — ' : ''}${
      results.ciblesSiret
    } cibles ; dénominations ${results.denominationsCompletees} ; adresses ${
      results.adressesACreer + results.adressesReutilisees
    } (${results.adresseViaBan} BAN, ${
      results.adresseViaApiEntreprise
    } API Entreprise ; ${results.adressesReutilisees} réutilisées, ${
      results.adressesACreer
    } à créer) ; échecs API ${results.echecsApi} ; dont fermés complétés ${
      results.fermesCompletes
    } ; CSV ${filePath}`,
  )

  return results
}
