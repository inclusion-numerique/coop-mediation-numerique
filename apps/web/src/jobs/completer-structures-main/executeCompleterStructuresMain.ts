import { writeFile } from 'node:fs/promises'
import {
  adresseMainKey,
  findAdresseMainId,
  insertAdresseMain,
  resolveAdresseMain,
  resolveIdentiteFromSiret,
} from '@app/web/features/employeuse'
import { throttleApiEntreprise } from '@app/web/features/structures/siret/siretIdentity'
import { getAuditOutputPath } from '@app/web/jobs/audit-output'
import { prismaClient } from '@app/web/prismaClient'
import type { JobExecutor } from '../jobExecutors'
import { output } from '../output'

// Complète, dans `main` (Entrepôt), les lignes `structure_administrative` liées à une employeuse
// coop (`structure_coop_id`) mais incomplètes — SANS jamais faire confiance aux données coop (jadis
// portées par la table `structure` des lieux, modifiables sans garde-fou), à l'exception du SIRET.
// Prérequis de la bascule des clés étrangères (ADR-002 étape 5). L'identité et l'adresse viennent du
// SIRET (API Recherche d'entreprises + géocodage BAN) : voir `features/structures/main`.
//
// Écrit dans une base partagée : dry-run par défaut (voir CompleterStructuresMainJobValidation).
// Chaque exécution produit un CSV détaillé (une ligne par structure ciblée) pour relire les
// décisions avant / après application.

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
    const resolved = await resolveIdentiteFromSiret(cible.siret)
    if ('erreur' in resolved) {
      return { ...base, statut: 'erreur-api', erreur: resolved.erreur }
    }

    const { identite } = resolved

    const besoinDenomination =
      cible.denominationSirene === null && cible.denominationAntenne === null
    const denomination: DetailRow['denomination'] = besoinDenomination
      ? identite.nom.trim() === ''
        ? 'nom-vide'
        : 'complétée'
      : 'non-requise'

    if (denomination === 'complétée' && !dryRun) {
      await prismaClient.structureAdministrativeMain.update({
        where: { id: cible.id },
        data: { denominationAntenne: identite.nom },
      })
    }

    if (cible.adresseId !== null) {
      return {
        ...base,
        etatAdministratif: identite.etatAdministratif,
        nomComplet: identite.nom,
        denomination,
        adresse: 'non-requise',
      }
    }

    const adresse = await resolveAdresseMain(identite)
    const existant =
      adresseIdByKey.get(adresseMainKey(adresse)) ??
      (await findAdresseMainId(adresse))?.id ??
      null

    if (!dryRun) {
      const adresseId = existant ?? (await insertAdresseMain(adresse))
      adresseIdByKey.set(adresseMainKey(adresse), adresseId)
      await prismaClient.structureAdministrativeMain.update({
        where: { id: cible.id },
        data: { adresseId },
      })
    }

    return {
      ...base,
      etatAdministratif: identite.etatAdministratif,
      nomComplet: identite.nom,
      denomination,
      adresse: existant ? 'réutilisée' : 'à-créer',
      adresseSource: adresse.source,
      banScore: adresse.banScore === null ? '' : adresse.banScore.toFixed(2),
      adNomVoie: adresse.nomVoie,
      adCodePostal: adresse.codePostal,
      adCodeInsee: adresse.codeInsee,
      adNomCommune: adresse.nomCommune,
      codeBan: adresse.codeBan ?? '',
      coords:
        adresse.longitude === null || adresse.latitude === null
          ? ''
          : `${adresse.longitude},${adresse.latitude}`,
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
