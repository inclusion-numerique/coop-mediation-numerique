import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import type Excel from 'exceljs'
import { v4 } from 'uuid'
import {
  filtresDesUtilisateurs,
  filtresUtilisateursDesFiltres,
} from '@/features/utilisateurs/ui/filtres/utilisateurs.filtre'
import { auteurDeLExport } from '@/features/utilisateurs/ui/presenters/auteur-de-l-export.presenter'
import { barreDesUtilisateurs } from '@/features/utilisateurs/ui/presenters/barre-des-utilisateurs.presenter'
import { semerUnCompteDeListe } from '@/features/utilisateurs/utilisateurs.cucumber'
import { classeurDesUtilisateurs } from './implementations/excel/classeur-des-utilisateurs.classeur'
import { utilisateursAExporter } from './implementations/prisma/utilisateurs-a-exporter.query'
import { colonnesDeLExport } from './ui/presenters/colonnes-de-l-export.presenter'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

const AUJOURD_HUI = () => new Date()

const export_: { marqueur: string; classeur?: Excel.Workbook } = {
  marqueur: '',
}

const auteur = {
  id: v4(),
  firstName: 'Ada',
  lastName: 'Admin',
  role: 'Admin' as const,
  coordinateur: null,
  mediateur: null,
  emplois: [],
  isConseillerNumerique: false,
}

Given(
  'deux médiateurs actifs et un médiateur supprimé à exporter',
  async () => {
    export_.marqueur = `Export${v4().slice(0, 8)}`
    const actif = (prenom: string) =>
      semerUnCompteDeListe({
        prenom,
        marqueur: export_.marqueur,
        creeLe: new Date('2026-01-01'),
        inscritLe: new Date('2026-01-02'),
        mediateur: {
          derniereActivite: AUJOURD_HUI(),
          dernierBeneficiaire: null,
        },
      })

    await actif('Alice')
    await actif('Bruno')
    await semerUnCompteDeListe({
      prenom: 'Chloe',
      marqueur: export_.marqueur,
      creeLe: new Date('2026-01-01'),
      inscritLe: new Date('2026-01-02'),
      supprimeLe: new Date('2026-02-01'),
      mediateur: { derniereActivite: AUJOURD_HUI(), dernierBeneficiaire: null },
    })
  },
)

When(
  "l'administration exporte les comptes actifs de cette recherche",
  async () => {
    const valeurs = filtresDesUtilisateurs.charger({ statut: 'actif' })
    const filtres = filtresUtilisateursDesFiltres(valeurs)
    const maintenant = AUJOURD_HUI()

    export_.classeur = classeurDesUtilisateurs({
      utilisateurs: await utilisateursAExporter({
        mots: [export_.marqueur],
        filtres,
        maintenant,
      }),
      auteur: auteurDeLExport(auteur),
      filtres: barreDesUtilisateurs({
        adresse: { chemin: '', parametres: {} },
        valeurs,
        options: {
          employeuses: [],
          coordinateurs: [],
          lieux: [],
          communes: [],
          departements: [],
        },
      }).etiquettes.map(({ titre, libelle }) => ({
        type: titre,
        valeur: libelle,
      })),
      genereLe: maintenant,
      colonnes: colonnesDeLExport,
    })
  },
)

const feuille = (): Excel.Worksheet => {
  const trouvee = export_.classeur?.getWorksheet('Utilisateurs')
  assert.ok(trouvee, 'Aucun classeur exporté')
  return trouvee
}

Then('le classeur exporté compte {int} utilisateurs', (attendu: number) => {
  const identifiants = feuille()
    .getSheetValues()
    .filter(
      (ligne) =>
        Array.isArray(ligne) &&
        typeof ligne[1] === 'string' &&
        UUID.test(ligne[1]),
    )
  assert.strictEqual(identifiants.length, attendu)
})

Then('le classeur rappelle le filtre de statut {string}', (libelle: string) => {
  const lignes = feuille().getSheetValues()
  assert.ok(
    lignes.some(
      (ligne) =>
        Array.isArray(ligne) && ligne[1] === 'Statut' && ligne[2] === libelle,
    ),
  )
})
