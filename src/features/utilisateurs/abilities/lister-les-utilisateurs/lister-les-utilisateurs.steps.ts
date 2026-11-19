import assert from 'node:assert'
import { type DataTable, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma/prismaClient'
import {
  AUCUN_FILTRE,
  type FiltresUtilisateurs,
  filtresUtilisateurs,
  type LigneUtilisateur,
} from '@/features/utilisateurs/domain'
import { libelleDuStatut } from '@/features/utilisateurs/ui'
import {
  semerUnCompteDeListe,
  semerUneEmployeuse,
  semerUnLieu,
} from '@/features/utilisateurs/utilisateurs.cucumber'
import type { UtilisateursTrouves } from './domain'
import { rechercherDesUtilisateurs } from './implementation'

const UN_JOUR = 24 * 60 * 60 * 1000

const scenario: {
  marqueur: string
  comptes: Readonly<Record<string, string>>
  employeuses: Readonly<Record<string, number>>
  lieux: Readonly<Record<string, string>>
  trouves?: UtilisateursTrouves
} = { marqueur: '', comptes: {}, employeuses: {}, lieux: {} }

const maintenant = () => new Date()

const ilYA = (cellule: string): Date | null =>
  cellule === 'aucun'
    ? null
    : new Date(maintenant().getTime() - Number(cellule) * UN_JOUR)

const idDe = (prenom: string): string => {
  const id = scenario.comptes[prenom]
  assert.ok(id, `Compte « ${prenom} » inconnu`)
  return id
}

const roles = {
  mediateur: { med: true, coord: false, role: 'User' },
  coordinateur: { med: false, coord: true, role: 'User' },
  'les deux': { med: true, coord: true, role: 'User' },
  admin: { med: false, coord: false, role: 'Admin' },
} as const

const roleDe = (cellule: string) => {
  const role = Object.entries(roles).find(([nom]) => nom === cellule)
  assert.ok(role, `Rôle « ${cellule} » inconnu`)
  return role[1]
}

const rechercher = async (
  recherche: string,
  filtres: FiltresUtilisateurs = AUCUN_FILTRE,
) => {
  scenario.trouves = await rechercherDesUtilisateurs({
    searchParams: { recherche: `${recherche} ${scenario.marqueur}`.trim() },
    filtres,
    orderBy: [],
    maintenant: maintenant(),
  })
}

const trouves = (): readonly LigneUtilisateur[] => {
  assert.ok(scenario.trouves, 'Aucune recherche faite')
  return scenario.trouves.utilisateurs
}

const prenomsTrouves = (): readonly string[] =>
  trouves()
    .map(({ prenom }) => prenom ?? '')
    .toSorted()

Given('les comptes suivants dans la liste :', async (table: DataTable) => {
  scenario.marqueur = `Liste${v4().slice(0, 8)}`
  scenario.comptes = {}

  const semes = await table
    .hashes()
    .reduce<Promise<Record<string, string>>>(async (precedents, ligne) => {
      const deja = await precedents
      const { med, coord, role } = roleDe(ligne.role)
      const id = await semerUnCompteDeListe({
        prenom: ligne.prenom,
        marqueur: scenario.marqueur,
        role,
        creeLe: ilYA(ligne.cree) ?? maintenant(),
        inscritLe: ilYA(ligne.inscrit),
        supprimeLe: ilYA(ligne.supprime),
        derniereVisite: ilYA(ligne.visite),
        mediateur: med
          ? {
              derniereActivite: ilYA(ligne.activite),
              dernierBeneficiaire: ilYA(ligne.beneficiaire),
            }
          : null,
        coordinateur: coord
          ? {
              aUneEquipe: ligne.equipe === 'oui',
              aCoordonne: ligne.coordonne === 'oui',
            }
          : null,
      })
      return { ...deja, [ligne.prenom]: id }
    }, Promise.resolve({}))

  scenario.comptes = semes
})

const rattacher = async (
  prenom: string,
  employeuseId: number,
  source: string,
) => {
  const personne = await prismaClient.personneMain.upsert({
    where: { coopId: idDe(prenom) },
    create: { coopId: idDe(prenom) },
    update: {},
    select: { id: true },
  })
  await prismaClient.personneAffectationEmploiMain.create({
    data: {
      personneId: personne.id,
      structureAdministrativeId: employeuseId,
      source,
      estActive: true,
    },
  })
}

Given(
  /^"([^"]+)" est employée? par "([^"]+)"$/,
  async (prenom: string, nom: string) => {
    const employeuseId = await semerUneEmployeuse(nom)
    scenario.employeuses = { ...scenario.employeuses, [nom]: employeuseId }
    await rattacher(prenom, employeuseId, 'coop')
  },
)

Given(
  /^"([^"]+)" est employée? par l'antenne "([^"]+)" de "([^"]+)"$/,
  async (prenom: string, antenne: string, sirene: string) => {
    await rattacher(
      prenom,
      await semerUneEmployeuse(antenne, { denominationSirene: sirene }),
      'coop',
    )
  },
)

Given(
  /^"([^"]+)" est employée? par "([^"]+)" au code INSEE "([^"]+)" et au code postal "([^"]*)"$/,
  async (
    prenom: string,
    nom: string,
    codeInsee: string,
    codePostal: string,
  ) => {
    await rattacher(
      prenom,
      await semerUneEmployeuse(nom, { adresse: { codeInsee, codePostal } }),
      'coop',
    )
  },
)

Given(
  /^"([^"]+)" est aussi rattachée? à "([^"]+)" par la source "([^"]+)"$/,
  async (prenom: string, nom: string, source: string) => {
    const employeuseId = await semerUneEmployeuse(nom)
    scenario.employeuses = { ...scenario.employeuses, [nom]: employeuseId }
    await rattacher(prenom, employeuseId, source)
  },
)

Given('{string} est conseiller numérique', async (prenom: string) => {
  await rattacher(prenom, await semerUneEmployeuse('Employeuse CN'), 'idposte')
})

Given('{string} exerce à {string}', async (prenom: string, nom: string) => {
  const lieuId = await semerUnLieu(nom)
  scenario.lieux = { ...scenario.lieux, [nom]: lieuId }
  const { id: mediateurId } = await prismaClient.mediateur.findUniqueOrThrow({
    where: { userId: idDe(prenom) },
    select: { id: true },
  })
  await prismaClient.mediateurEnActivite.create({
    data: { mediateurId, structureId: lieuId, debut: new Date('2026-01-01') },
  })
})

When(
  "l'administration filtre la liste sur le statut {string}",
  async (statut: string) => {
    await rechercher('', filtresUtilisateurs({ statut }))
  },
)

When(
  "l'administration filtre la liste sur l'employeuse {string}",
  async (nom: string) => {
    await rechercher(
      '',
      filtresUtilisateurs({
        employeuses: String(scenario.employeuses[nom] ?? ''),
      }),
    )
  },
)

When(
  "l'administration filtre la liste sur le département {string}",
  async (departement: string) => {
    await rechercher('', filtresUtilisateurs({ departements: departement }))
  },
)

When(
  "l'administration filtre la liste sur le lieu {string}",
  async (nom: string) => {
    await rechercher('', filtresUtilisateurs({ lieux: scenario.lieux[nom] }))
  },
)

When(
  "l'administration filtre la liste sur les conseillers numériques",
  async () => {
    await rechercher('', filtresUtilisateurs({ conseiller_numerique: '1' }))
  },
)

When(
  "l'administration cherche {string} dans la liste",
  async (recherche: string) => {
    await rechercher(recherche)
  },
)

When(
  "l'administration cherche l'identifiant de {string} dans la liste",
  async (prenom: string) => {
    await rechercher(idDe(prenom))
  },
)

Then('la liste contient exactement {string}', (attendus: string) => {
  assert.deepStrictEqual(
    prenomsTrouves(),
    attendus
      .split(',')
      .map((prenom) => prenom.trim())
      .toSorted(),
  )
})

const ligneDe = (prenom: string): LigneUtilisateur => {
  const ligne = trouves().find(({ id }) => id === idDe(prenom))
  assert.ok(ligne, `Ligne de « ${prenom} » absente`)
  return ligne
}

Then(
  "la ligne de {string} affiche l'employeuse {string}",
  (prenom: string, nom: string) => {
    assert.strictEqual(ligneDe(prenom).employeuse?.nom, nom)
  },
)

Then(
  "la ligne de {string} affiche le code INSEE d'employeuse {string}",
  (prenom: string, codeInsee: string) => {
    assert.strictEqual(ligneDe(prenom).employeuse?.codeInsee, codeInsee)
  },
)

Then(
  "la ligne de {string} n'affiche aucun code INSEE d'employeuse",
  (prenom: string) => {
    assert.strictEqual(ligneDe(prenom).employeuse?.codeInsee, null)
  },
)

Then('la liste ne contient pas {string}', (prenom: string) => {
  assert.ok(!prenomsTrouves().includes(prenom))
})

Then('chacun de ces comptes affiche le statut {string}', (libelle: string) => {
  assert.deepStrictEqual(
    [...new Set(trouves().map(({ statut }) => libelleDuStatut(statut)))],
    [libelle],
  )
})

Then('le total dépasse le nombre de comptes trouvés', () => {
  assert.ok(scenario.trouves)
  assert.ok(scenario.trouves.totalCount > scenario.trouves.matchesCount)
})
