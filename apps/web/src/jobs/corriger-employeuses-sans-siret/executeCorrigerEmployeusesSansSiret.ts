import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { entrepotPrismaClient } from '@app/web/entrepotPrismaClient'
import { rechercheApiEntreprise } from '@app/web/external-apis/rechercheApiEntreprise'
import { mergeStructureAdministrative } from '@app/web/features/structures/use-cases/merge/mutations/mergeStructureAdministrative'
import { getAuditOutputPath } from '@app/web/jobs/audit-output'
import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import type { CorrigerEmployeusesSansSiretJob } from './corrigerEmployeusesSansSiretJob'

// Script correctif UNIQUE pour les employeuses coop sans SIRET, en quatre phases chaînées :
//   1. PEUPLER   — écrit le `siret_valide` du CSV dans coop.structure_administrative (là où
//                  le SIRET est encore nul).
//   2. DÉDUPLIQUER — fusionne les employeuses qui partagent alors un même SIRET (une par SIRET,
//                    même logique/garde que `deduplicate-employeuses`), via mergeStructureAdministrative.
//   3. LIER      — pose le structure_coop_id manquant dans main pour les cas ÉVIDENTS (SIRET 1-1
//                  ou règle du siège), même garde que `link-employeuses-main`.
//   4. PROPAGER  — recopie le SIRET de l'employeuse coop vers les lignes main qui lui sont déjà
//                  liées mais n'ont pas de SIRET (seulement un SIRET valide ; données douteuses écartées).
//   5. CRÉER     — pour les employeuses dont le SIRET est ABSENT de main, enrichit via l'API
//                  Entreprise (dénomination, adresse, état, APE, catégorie juridique, service public)
//                  et INSÈRE la structure_administrative + son adresse, avec edited_by='coop'.
//
// Le dry-run SIMULE le chaînage complet en mémoire (SIRET appliqués virtuellement, puis dédup,
// liaison, propagation, création — l'API est bien appelée en dry-run pour un plan fidèle, seules
// les écritures DB sont suspendues). main n'est lu qu'en SELECT ; les écritures ciblent coop
// (phases 1-2) et main (phases 3-5, sous grant en prod).

const LA_POSTE_SIREN = '356000000'

const luhnValide = (siret: string): boolean => {
  const somme = siret
    .split('')
    .reverse()
    .reduce((total, chiffre, index) => {
      const n = Number(chiffre)
      const double = index % 2 === 1 ? n * 2 : n
      return total + (double > 9 ? double - 9 : double)
    }, 0)
  return somme % 10 === 0
}

// La Poste (SIREN 356000000) est l'exception documentée à la clé de Luhn.
const siretValide = (siret: string): boolean =>
  /^\d{14}$/.test(siret) &&
  (luhnValide(siret) || siret.startsWith(LA_POSTE_SIREN))

type PlanCsv = { coopId: string; siret: string }

const parseCsv = (texte: string): PlanCsv[] =>
  texte
    .split('\n')
    .slice(1)
    .map((ligne) => ligne.trimEnd())
    .filter((ligne) => ligne.length > 0)
    .map((ligne) => ligne.split(';'))
    .map((champs) => ({
      coopId: (champs.at(0) ?? '').trim(),
      siret: (champs.at(11) ?? '').trim(),
    }))
    .filter(({ coopId, siret }) => coopId.length > 0 && siret.length > 0)

type Employeuse = {
  id: string
  siret: string | null
  nom: string
  commune: string
  modification: Date
  emplois: number
  activites: number
}

type LigneMainLibre = { id: number; siret: string; estSiege: boolean }

const chargerEmployeuses = async (): Promise<Employeuse[]> => {
  const rows = await prismaClient.structureAdministrative.findMany({
    where: { suppression: null },
    select: {
      id: true,
      siret: true,
      nom: true,
      commune: true,
      modification: true,
      _count: {
        select: {
          emplois: { where: { suppression: null } },
          activites: { where: { suppression: null } },
        },
      },
    },
  })
  return rows.map((r) => ({
    id: r.id,
    siret: r.siret,
    nom: r.nom,
    commune: r.commune,
    modification: r.modification,
    emplois: r._count.emplois,
    activites: r._count.activites,
  }))
}

const clePaire = (siret: string, denomination: string | null) =>
  `${siret}|${denomination ?? ''}`

const chargerEtatMain = async (): Promise<{
  liees: Set<string>
  libresParSiret: Map<string, LigneMainLibre[]>
  lieesSansSiret: {
    mainId: number
    coopId: string
    denomination: string | null
  }[]
  pairesExistantes: Set<string>
  siretsPresents: Set<string>
}> => {
  const [liees, libres, sansSiret, paires] = await Promise.all([
    entrepotPrismaClient.$queryRaw<{ structure_coop_id: string }[]>`
      SELECT structure_coop_id FROM main.structure_administrative
      WHERE structure_coop_id IS NOT NULL`,
    entrepotPrismaClient.$queryRaw<
      { id: number; siret: string; est_siege: boolean }[]
    >`
      SELECT id, siret, (denomination_antenne IS NULL) AS est_siege
      FROM main.structure_administrative
      WHERE structure_coop_id IS NULL AND deleted_at IS NULL AND siret IS NOT NULL`,
    // Lignes main LIÉES à une coop mais dont le SIRET est absent : candidates à
    // recevoir le SIRET de leur employeuse coop (phase 4).
    entrepotPrismaClient.$queryRaw<
      {
        id: number
        structure_coop_id: string
        denomination_antenne: string | null
      }[]
    >`
      SELECT id, structure_coop_id, denomination_antenne
      FROM main.structure_administrative
      WHERE structure_coop_id IS NOT NULL AND siret IS NULL AND deleted_at IS NULL`,
    // Paires (siret, denomination_antenne) déjà présentes : contrainte unique de main.
    // Écrire un SIRET qui recréerait une paire existante violerait cette contrainte.
    entrepotPrismaClient.$queryRaw<
      { siret: string; denomination_antenne: string | null }[]
    >`
      SELECT siret, denomination_antenne FROM main.structure_administrative
      WHERE siret IS NOT NULL AND deleted_at IS NULL`,
  ])
  const libresParSiret = libres.reduce((acc, l) => {
    const item = { id: l.id, siret: l.siret, estSiege: l.est_siege }
    return acc.set(l.siret, [...(acc.get(l.siret) ?? []), item])
  }, new Map<string, LigneMainLibre[]>())
  return {
    liees: new Set(liees.map(({ structure_coop_id }) => structure_coop_id)),
    libresParSiret,
    lieesSansSiret: sansSiret.map((r) => ({
      mainId: r.id,
      coopId: r.structure_coop_id,
      denomination: r.denomination_antenne,
    })),
    pairesExistantes: new Set(
      paires.map((p) => clePaire(p.siret, p.denomination_antenne)),
    ),
    siretsPresents: new Set(paires.map((p) => p.siret)),
  }
}

// Adresse API = une chaîne "VOIE CODE_POSTAL COMMUNE" ; on retire le suffixe cp+commune
// pour récupérer la voie seule (les composants numéro/type ne sont pas fournis par l'API).
const extraireVoie = (
  adresse: string,
  codePostal: string,
  libelleCommune: string,
): string => {
  const suffixe = `${codePostal} ${libelleCommune}`.trim().toLowerCase()
  return adresse.toLowerCase().endsWith(suffixe)
    ? adresse.slice(0, adresse.length - suffixe.length).trim()
    : adresse
}

type EnrichissementSirene = {
  denominationSirene: string
  etatAdministratif: 'A' | 'F'
  codeActivitePrincipale: string | null
  categorieJuridique: string | null
  publique: boolean
  codePostal: string
  codeInsee: string
  nomCommune: string
  nomVoie: string | null
}

// Enrichit un SIRET via l'API Recherche d'entreprises (publique, sans jeton) : reproduit
// ce que l'ETL de l'Entrepôt ferait à l'ingestion. Renvoie null si l'entité est introuvable,
// n'est pas une personne morale nommée, ou n'a pas d'adresse exploitable (cp/insee/commune).
const enrichirDepuisSiret = async (
  siret: string,
): Promise<EnrichissementSirene | null> => {
  const { results } = await rechercheApiEntreprise(
    { q: siret, page: 1, per_page: 1 },
    { retries: 3, factor: 2, minTimeout: 1_000, maxTimeout: 5_000 },
  )
  const uniteLegale = results.at(0)
  const etablissement = uniteLegale?.matching_etablissements.find(
    (e) => e.siret === siret,
  )
  if (!uniteLegale || !etablissement) return null

  const denomination = uniteLegale.nom_raison_sociale ?? uniteLegale.nom_complet
  const codePostal = etablissement.code_postal ?? ''
  const codeInsee = etablissement.commune ?? ''
  const nomCommune = etablissement.libelle_commune ?? ''
  if (!denomination || !codePostal || !codeInsee || !nomCommune) return null
  // Entité non-diffusible (SIRENE masque nom/adresse) ou code postal non normalisé :
  // pas d'enrichissement exploitable (le code postal "[NON-DIFFUSIBLE]" casserait aussi
  // le varchar(5) de main.adresse).
  if (denomination.includes('NON-DIFFUSIBLE') || !/^\d{5}$/.test(codePostal))
    return null

  const categorieJuridique = uniteLegale.nature_juridique ?? null
  // `est_service_public` de l'API n'est pas fiable (souvent absent). On dérive `publique`
  // de la catégorie juridique INSEE : niveau 1 = 4 (personne morale de droit public) ou
  // 7 (administration / collectivité) ⟹ public. 9 (associations), 5 (sociétés) ⟹ privé.
  const publique =
    categorieJuridique !== null && /^[47]/.test(categorieJuridique)

  return {
    denominationSirene: denomination,
    etatAdministratif: etablissement.etat_administratif === 'F' ? 'F' : 'A',
    codeActivitePrincipale:
      etablissement.activite_principale ??
      uniteLegale.activite_principale ??
      null,
    categorieJuridique,
    publique,
    codePostal,
    codeInsee,
    nomCommune,
    nomVoie:
      extraireVoie(etablissement.adresse, codePostal, nomCommune) || null,
  }
}

// Réutilise une ligne main.adresse identique (clé unique cp+commune+voie+numéro+répétition)
// ou en crée une. Renvoie son id, ou null en cas d'échec.
const upsertAdresse = async (
  enr: EnrichissementSirene,
): Promise<number | null> => {
  const existante = await entrepotPrismaClient.$queryRaw<{ id: number }[]>`
    SELECT id FROM main.adresse
    WHERE code_postal = ${enr.codePostal}
      AND nom_commune = ${enr.nomCommune}
      AND nom_voie IS NOT DISTINCT FROM ${enr.nomVoie}
      AND numero_voie IS NULL AND repetition IS NULL
    LIMIT 1`
  const dejaLa = existante.at(0)?.id
  if (dejaLa !== undefined) return dejaLa

  const creee = await entrepotPrismaClient.$queryRaw<{ id: number }[]>`
    INSERT INTO main.adresse (code_postal, code_insee, nom_commune, nom_voie, created_at, updated_at)
    VALUES (${enr.codePostal}, ${enr.codeInsee}, ${enr.nomCommune}, ${enr.nomVoie}, now(), now())
    RETURNING id`
  return creee.at(0)?.id ?? null
}

type Fusion = { siret: string; cibleId: string; sourceIds: string[] }
type Liaison = {
  coopId: string
  nom: string
  siret: string
  mainId: number
  palier: 'siret_1_1' | 'siege'
}

// Cible de fusion = déjà liée à main d'abord, puis la plus riche (emplois, activités, fraîcheur).
const parPriorite = (liees: Set<string>) => (a: Employeuse, b: Employeuse) =>
  Number(liees.has(b.id)) - Number(liees.has(a.id)) ||
  b.emplois - a.emplois ||
  b.activites - a.activites ||
  b.modification.getTime() - a.modification.getTime()

export const executeCorrigerEmployeusesSansSiret = async (
  job: CorrigerEmployeusesSansSiretJob,
) => {
  const dryRun = job.payload?.dryRun ?? true
  const csvPath = job.payload?.csvPath ?? ''
  output.log(
    `corriger-employeuses-sans-siret: démarrage${dryRun ? ' (DRY RUN)' : ''}...`,
  )

  // ── Chargement ──
  const [texte, employeuses, main] = await Promise.all([
    readFile(join(process.cwd(), csvPath), 'utf-8'),
    chargerEmployeuses(),
    chargerEtatMain(),
  ])

  const employeuseParId = new Map(employeuses.map((e) => [e.id, e]))
  const siretActuelNul = (id: string) =>
    (employeuseParId.get(id)?.siret ?? null) === null

  // ── PHASE 1 : plan de peuplement (SIRET valides, cible existante, SIRET encore nul) ──
  const planBrut = parseCsv(texte)
  const invalides = planBrut.filter(({ siret }) => !siretValide(siret))
  const peuplement = planBrut.filter(
    ({ coopId, siret }) =>
      siretValide(siret) &&
      employeuseParId.has(coopId) &&
      siretActuelNul(coopId),
  )
  const siretPeuple = new Map(
    peuplement.map(({ coopId, siret }) => [coopId, siret]),
  )

  // SIRET effectif = celui du CSV s'il vient d'être peuplé, sinon l'existant.
  const siretEffectif = (e: Employeuse): string | null =>
    siretPeuple.get(e.id) ?? e.siret

  // ── PHASE 2 : plan de déduplication sur le SIRET effectif ──
  const groupes = employeuses.reduce((acc, e) => {
    const s = siretEffectif(e)
    return s === null ? acc : acc.set(s, [...(acc.get(s) ?? []), e])
  }, new Map<string, Employeuse[]>())

  const fusions = [...groupes.entries()]
    .filter(([, membres]) => {
      const orphelines = membres.filter((m) => !main.liees.has(m.id)).length
      const liees = membres.filter((m) => main.liees.has(m.id)).length
      return membres.length > 1 && orphelines > 0 && liees <= 1
    })
    .map(([siret, membres]): Fusion => {
      const [cible, ...sources] = [...membres].sort(parPriorite(main.liees))
      return { siret, cibleId: cible.id, sourceIds: sources.map((s) => s.id) }
    })
    // garde de sûreté : on n'absorbe que des orphelines (jamais une ligne liée à main)
    .filter((f) => f.sourceIds.every((id) => !main.liees.has(id)))

  const absorbees = new Set(fusions.flatMap((f) => f.sourceIds))

  // ── PHASE 3 : plan de liaison des survivantes orphelines (cas évidents) ──
  const survivantes = employeuses.filter(
    (e) => !absorbees.has(e.id) && !main.liees.has(e.id),
  )
  const liaisonsBrutes = survivantes
    .map((e): Liaison | null => {
      const siret = siretEffectif(e)
      if (siret === null) return null
      const candidates = main.libresParSiret.get(siret) ?? []
      if (candidates.length === 1)
        return {
          coopId: e.id,
          nom: e.nom,
          siret,
          mainId: candidates[0].id,
          palier: 'siret_1_1',
        }
      const sieges = candidates.filter((c) => c.estSiege)
      if (candidates.length > 1 && sieges.length === 1)
        return {
          coopId: e.id,
          nom: e.nom,
          siret,
          mainId: sieges[0].id,
          palier: 'siege',
        }
      return null
    })
    .filter((l): l is Liaison => l !== null)

  // deux survivantes visant la même ligne main → conflit, on écarte
  const compteCible = liaisonsBrutes.reduce(
    (acc, l) => acc.set(l.mainId, (acc.get(l.mainId) ?? 0) + 1),
    new Map<number, number>(),
  )
  const liaisons = liaisonsBrutes.filter((l) => compteCible.get(l.mainId) === 1)
  const conflitsLiaison = liaisonsBrutes.length - liaisons.length

  // ── PHASE 4 : propager le SIRET coop vers les lignes main liées qui en manquent ──
  // On lit le SIRET EFFECTIF (post-peuplement) de l'employeuse liée ; on ne propage
  // qu'un SIRET valide (les données douteuses côté coop — ex. SIRET à 13 chiffres —
  // sont écartées plutôt que recopiées dans main).
  type PropagationMain = { mainId: number; coopId: string; siret: string }
  const propagationsCandidates = main.lieesSansSiret
    .map(({ mainId, coopId, denomination }) => {
      const employeuse = employeuseParId.get(coopId)
      const siret = employeuse ? siretEffectif(employeuse) : null
      return { mainId, coopId, siret, denomination }
    })
    .filter(
      (p): p is PropagationMain & { denomination: string | null } =>
        p.siret !== null && siretValide(p.siret),
    )
  // On écarte les propagations qui recréeraient une paire (siret, denomination_antenne)
  // déjà présente dans main : la ligne liée est alors un doublon interne à main que
  // seul l'Entrepôt peut résorber (on ne peut pas y écrire le SIRET sans violer la contrainte).
  const estCollision = (p: PropagationMain & { denomination: string | null }) =>
    main.pairesExistantes.has(clePaire(p.siret, p.denomination))
  const propagations = propagationsCandidates.filter((p) => !estCollision(p))
  const collisions = propagationsCandidates.filter(estCollision)
  const collisionsMain = collisions.length

  // ── PHASE 5 : créer dans main les entités dont le SIRET y est absent ──
  // Cibles : employeuses NON liées, au SIRET effectif valide et ABSENT de main. On les
  // dédoublonne par SIRET (filet — la phase 2 les a normalement déjà fusionnées), puis on
  // enrichit chacune via l'API Entreprise pour reproduire l'ingestion Entrepôt.
  const ciblesCreation = [
    ...employeuses
      .filter((e) => !absorbees.has(e.id) && !main.liees.has(e.id))
      .reduce((acc, e) => {
        const s = siretEffectif(e)
        return s !== null && siretValide(s) && !main.siretsPresents.has(s)
          ? acc.has(s)
            ? acc
            : acc.set(s, e)
          : acc
      }, new Map<string, Employeuse>())
      .values(),
  ]

  type Creation = {
    coopId: string
    nom: string
    siret: string
    enr: EnrichissementSirene
  }
  // Enrichissement séquentiel (respect du rate limit de l'API publique).
  const enrichissements = await ciblesCreation.reduce(
    async (
      prev: Promise<
        (Creation | { coopId: string; nom: string; siret: string; enr: null })[]
      >,
      e,
    ) => {
      const acc = await prev
      const siret = siretEffectif(e) as string
      const enr = await enrichirDepuisSiret(siret).catch(() => null)
      return [...acc, { coopId: e.id, nom: e.nom, siret, enr }]
    },
    Promise.resolve([]),
  )
  const creations = enrichissements.filter((x): x is Creation => x.enr !== null)
  const nonEnrichis = enrichissements.filter((x) => x.enr === null)

  // ── Trace CSV ──
  const nom = (id: string) => employeuseParId.get(id)?.nom ?? '?'
  const echapper = (v: string | number) => {
    const s = String(v)
    return /[";\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s
  }
  const lignesCsv = [
    ['phase', 'action', 'coop_id', 'nom', 'siret', 'detail'].join(';'),
    ...peuplement.map(({ coopId, siret }) =>
      ['1_peupler', 'set_siret', coopId, nom(coopId), siret, '']
        .map(echapper)
        .join(';'),
    ),
    ...invalides.map(({ coopId, siret }) =>
      ['1_peupler', 'SIRET_INVALIDE', coopId, nom(coopId), siret, 'ignoré']
        .map(echapper)
        .join(';'),
    ),
    ...fusions.flatMap((f) =>
      f.sourceIds.map((sid) =>
        [
          '2_dedupliquer',
          'absorber',
          sid,
          nom(sid),
          f.siret,
          `vers ${f.cibleId}`,
        ]
          .map(echapper)
          .join(';'),
      ),
    ),
    ...liaisons.map((l) =>
      ['3_lier', l.palier, l.coopId, l.nom, l.siret, `main_id=${l.mainId}`]
        .map(echapper)
        .join(';'),
    ),
    ...propagations.map((p) =>
      [
        '4_propager_main',
        'set_siret_main',
        p.coopId,
        nom(p.coopId),
        p.siret,
        `main_id=${p.mainId}`,
      ]
        .map(echapper)
        .join(';'),
    ),
    ...collisions.map((p) =>
      [
        '4_propager_main',
        'COLLISION_ignoree',
        p.coopId,
        nom(p.coopId),
        p.siret,
        `main_id=${p.mainId} (doublon dans main)`,
      ]
        .map(echapper)
        .join(';'),
    ),
    ...creations.map((c) =>
      [
        '5_creer_main',
        'insert',
        c.coopId,
        c.nom,
        c.siret,
        `${c.enr.denominationSirene} | ${c.enr.categorieJuridique ?? '?'} | etat=${c.enr.etatAdministratif} | publique=${c.enr.publique}`,
      ]
        .map(echapper)
        .join(';'),
    ),
    ...nonEnrichis.map((c) =>
      [
        '5_creer_main',
        'NON_ENRICHI',
        c.coopId,
        c.nom,
        c.siret,
        'API sans résultat exploitable',
      ]
        .map(echapper)
        .join(';'),
    ),
  ]
  const tracePath = getAuditOutputPath(
    `corriger-employeuses-sans-siret-${dryRun ? 'dry-run' : 'applied'}.csv`,
  )
  await writeFile(tracePath, lignesCsv.join('\n'), 'utf-8')

  // ── Exécution (apply) : peupler → fusionner → lier → propager, dans l'ordre du plan ──
  const applique = !dryRun

  const peuplees = applique
    ? await peuplement.reduce(async (prev, { coopId, siret }) => {
        const acc = await prev
        const r = await prismaClient.structureAdministrative.updateMany({
          where: { id: coopId, siret: null, suppression: null },
          data: { siret, modification: new Date() },
        })
        return acc + r.count
      }, Promise.resolve(0))
    : peuplement.length

  const fusionnees = applique
    ? await fusions.reduce(async (prev, f) => {
        const acc = await prev
        await f.sourceIds.reduce(async (p, sid) => {
          await p
          await mergeStructureAdministrative(sid, f.cibleId, {
            timeout: 120_000,
          })
        }, Promise.resolve())
        return acc + f.sourceIds.length
      }, Promise.resolve(0))
    : absorbees.size

  const liees = applique
    ? await liaisons.reduce(async (prev, l) => {
        const acc = await prev
        const n = await entrepotPrismaClient.$executeRaw`
          UPDATE main.structure_administrative
          SET structure_coop_id = ${l.coopId}::uuid
          WHERE id = ${l.mainId} AND structure_coop_id IS NULL`
        return acc + (n === 1 ? 1 : 0)
      }, Promise.resolve(0))
    : liaisons.length

  // La garde `siret IS NULL` rend la propagation idempotente. Le try/catch protège d'une
  // collision de contrainte résiduelle (ex. NULLS NOT DISTINCT) que le pré-filtre n'aurait
  // pas anticipée : une ligne en échec est ignorée sans interrompre les suivantes.
  const propagees = applique
    ? await propagations.reduce(async (prev, p) => {
        const acc = await prev
        const n = await entrepotPrismaClient.$executeRaw`
            UPDATE main.structure_administrative
            SET siret = ${p.siret}
            WHERE id = ${p.mainId} AND siret IS NULL`.catch(
          (error: unknown) => {
            output.log(
              `  propagation main_id=${p.mainId} ignorée : ${String(error).slice(0, 80)}`,
            )
            return 0
          },
        )
        return acc + (n === 1 ? 1 : 0)
      }, Promise.resolve(0))
    : propagations.length

  // Création dans main : upsert de l'adresse enrichie puis INSERT de la structure. Chaque
  // création est protégée par try/catch (une contrainte inattendue n'interrompt pas le lot).
  const creees = applique
    ? await creations.reduce(async (prev, c) => {
        const acc = await prev
        const adresseId = await upsertAdresse(c.enr).catch(() => null)
        if (adresseId === null) {
          output.log(`  création ${c.siret} ignorée : adresse non créée`)
          return acc
        }
        return await entrepotPrismaClient.$executeRaw`
            INSERT INTO main.structure_administrative
              (siret, denomination_sirene, adresse_id, structure_coop_id, etat_administratif,
               code_activite_principale, categorie_juridique, publique, edited_by,
               last_sirene_enrich_at, created_at, updated_at)
            VALUES (${c.siret}, ${c.enr.denominationSirene}, ${adresseId}, ${c.coopId}::uuid,
                    ${c.enr.etatAdministratif}, ${c.enr.codeActivitePrincipale},
                    ${c.enr.categorieJuridique}, ${c.enr.publique}, 'coop',
                    ${new Date()}, now(), now())`
          .then(() => acc + 1)
          .catch((error: unknown) => {
            output.log(
              `  création ${c.siret} ignorée : ${String(error).slice(0, 80)}`,
            )
            return acc
          })
      }, Promise.resolve(0))
    : creations.length

  // ── Rapport ──
  output.log(
    `\n=== CORRECTION EMPLOYEUSES SANS SIRET ${dryRun ? '(DRY RUN)' : ''} ===`,
  )
  output.log(
    `1. Peuplement : ${peuplees} SIRET écrits (${invalides.length} invalides ignorés)`,
  )
  output.log(
    `2. Déduplication : ${fusions.length} groupes, ${fusionnees} employeuses absorbées`,
  )
  output.log(
    `3. Liaison main : ${liees} liées (${liaisons.filter((l) => l.palier === 'siret_1_1').length} siret_1_1, ${liaisons.filter((l) => l.palier === 'siege').length} siège` +
      `${conflitsLiaison > 0 ? `, ${conflitsLiaison} conflits écartés` : ''})`,
  )
  output.log(
    `4. Propagation SIRET vers main : ${propagees} ligne(s) complétée(s)` +
      `${collisionsMain > 0 ? ` (${collisionsMain} écartées : doublon (siret, dénomination) déjà dans main)` : ''}`,
  )
  output.log(
    `5. Création dans main : ${creees} entité(s) enrichie(s) SIRENE + créée(s)` +
      `${nonEnrichis.length > 0 ? ` (${nonEnrichis.length} non enrichies : API sans résultat)` : ''}`,
  )
  output.log(`Export: ${tracePath}`)
  output.log(`\ncorriger-employeuses-sans-siret: terminé`)

  return {
    dryRun,
    peuplees,
    invalides: invalides.length,
    groupesFusion: fusions.length,
    absorbees: fusionnees,
    liees,
    conflitsLiaison,
    propageesMain: propagees,
    collisionsMain,
    creeesMain: creees,
    nonEnrichies: nonEnrichis.length,
    export: tracePath,
  }
}
