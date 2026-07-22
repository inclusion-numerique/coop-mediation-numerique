import { searchAdresse } from '@app/web/external-apis/apiAdresse'
import { banFeatureToAdresseBanData } from '@app/web/external-apis/ban/banFeatureToAdresseBanData'
import { fetchSiretApiData } from '@app/web/features/structures/siret/fetchSiretData'
import {
  parseSireneIdentityForCompletion,
  type SireneIdentity,
  throttleApiEntreprise,
} from '@app/web/features/structures/siret/siretIdentity'
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
  source: 'ban' | 'api-entreprise'
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
      siret: true,
      denominationSirene: true,
      denominationAntenne: true,
      adresseId: true,
    },
  })

  const results = {
    dryRun,
    ciblesSiret: cibles.length,
    denominationsCompletees: 0,
    adressesLiees: 0,
    adressesReutilisees: 0,
    adressesCreees: 0,
    adresseViaBan: 0,
    adresseViaApiEntreprise: 0,
    echecsApi: 0,
    etablissementsFermes: 0,
  }

  // Cache local des adresses résolues cette exécution, pour ne pas recréer un doublon quand
  // plusieurs structures partagent la même adresse.
  const adresseIdByKey = new Map<string, number>()

  // Séquentiel + throttle : l'API Recherche d'entreprises est limitée en débit.
  const process = async (cible: (typeof cibles)[number]) => {
    if (!cible.siret) return

    await throttleApiEntreprise()
    const apiResult = await fetchSiretApiData(cible.siret)
    if ('error' in apiResult) {
      results.echecsApi++
      return
    }

    const identity = parseSireneIdentityForCompletion(apiResult)
    // On complète aussi les établissements fermés (donnée historique) ; on les compte pour info.
    if (identity.etatAdministratif === 'F') {
      results.etablissementsFermes++
    }

    const besoinDenomination =
      cible.denominationSirene === null && cible.denominationAntenne === null
    if (besoinDenomination && identity.nom.trim() !== '') {
      if (!dryRun) {
        await prismaClient.structureAdministrativeMain.update({
          where: { id: cible.id },
          data: { denominationAntenne: identity.nom },
        })
      }
      results.denominationsCompletees++
    }

    if (cible.adresseId === null) {
      const resolved = await resolveAdresse(identity)
      results[
        resolved.source === 'ban' ? 'adresseViaBan' : 'adresseViaApiEntreprise'
      ]++

      const existant =
        adresseIdByKey.get(adresseKey(resolved)) ??
        (await findAdresseId(resolved))?.id ??
        null

      if (existant) {
        results.adressesReutilisees++
      } else {
        results.adressesCreees++
      }

      if (!dryRun) {
        const adresseId = existant ?? (await insertAdresse(resolved))
        adresseIdByKey.set(adresseKey(resolved), adresseId)
        await prismaClient.structureAdministrativeMain.update({
          where: { id: cible.id },
          data: { adresseId },
        })
        results.adressesLiees++
      }
    }
  }

  // `reduce` pour enchaîner les traitements séquentiellement (respect du throttle API).
  await cibles.reduce<Promise<void>>(
    (previous, cible) => previous.then(() => process(cible)),
    Promise.resolve(),
  )

  output.log(
    `completer-structures-main: ${dryRun ? 'DRY RUN — ' : ''}${
      results.ciblesSiret
    } cibles ; dénominations ${results.denominationsCompletees} ; adresses ${
      dryRun
        ? results.adressesReutilisees + results.adressesCreees
        : results.adressesLiees
    } (${results.adresseViaBan} BAN, ${
      results.adresseViaApiEntreprise
    } API Entreprise ; ${results.adressesReutilisees} réutilisées, ${
      results.adressesCreees
    } à créer) ; échecs API ${results.echecsApi} ; dont fermés complétés ${
      results.etablissementsFermes
    }`,
  )

  return results
}
