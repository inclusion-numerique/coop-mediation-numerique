import assert from 'node:assert'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { consulterLeReseauDuDepartement } from '@/features/mon-reseau/abilities/consulter-le-reseau-du-departement/domain/consulter-le-reseau-du-departement'
import { compterLesActeursDuDepartement } from '@/features/mon-reseau/abilities/consulter-le-reseau-du-departement/implementations/prisma'
import {
  type ActeurASemer,
  exercerDansLeLieu,
  semerUnActeur,
  semerUnLieu,
} from '@/features/mon-reseau/mon-reseau.cucumber'

const LIEUX_DE_L_ANNUAIRE = 12

const nombreDeLieuxDuDepartement = async () => LIEUX_DE_L_ANNUAIRE

const consulterEnBase = consulterLeReseauDuDepartement({
  compterLesActeursDuDepartement,
  nombreDeLieuxDuDepartement,
})

type Consultation = Awaited<ReturnType<typeof consulterEnBase>>

const etat: {
  acteursAvant?: number
  consultation?: Consultation
} = {}

const reseauConsulte = () => {
  const consultation = etat.consultation
  if (consultation === undefined || !consultation.success) {
    throw new Error('Aucun réseau consulté')
  }
  return consultation.data
}

const semerUnMediateurDuCantal = async ({
  termine = false,
  ...acteur
}: ActeurASemer & { termine?: boolean }) => {
  const { mediateurId } = await semerUnActeur(acteur)
  if (mediateurId === null) throw new Error('Médiateur non semé')
  await exercerDansLeLieu({
    mediateurId,
    lieuId: await semerUnLieu(),
    termine,
  })
}

Given('le réseau du Cantal tel qu’il est', async () => {
  const consultation = await consulterEnBase({ code: '15' })
  etat.acteursAvant = consultation.success ? consultation.data.acteurs : 0
})

Given('un médiateur qui exerce dans un lieu du Cantal', async () => {
  await semerUnMediateurDuCantal({})
})

Given(
  'un médiateur dont l’activité dans un lieu du Cantal a pris fin',
  async () => {
    await semerUnMediateurDuCantal({ termine: true })
  },
)

Given('un médiateur supprimé qui exerce dans un lieu du Cantal', async () => {
  await semerUnMediateurDuCantal({ supprime: true })
})

Given(
  'un médiateur non inscrit qui exerce dans un lieu du Cantal',
  async () => {
    await semerUnMediateurDuCantal({ inscrit: false })
  },
)

When('on consulte le réseau du Cantal', async () => {
  etat.consultation = await consulterEnBase({ code: '15' })
})

When(
  'on consulte le réseau du département « {word} »',
  async (code: string) => {
    etat.consultation = await consulterEnBase({ code: code })
  },
)

Then('le réseau du Cantal compte {int} acteur(s) de plus', (ecart: number) => {
  assert.strictEqual(reseauConsulte().acteurs, (etat.acteursAvant ?? 0) + ecart)
})

Then('le réseau du Cantal compte les lieux de son annuaire', () => {
  assert.strictEqual(reseauConsulte().lieux, LIEUX_DE_L_ANNUAIRE)
})

Then('le département est inconnu', () => {
  assert.deepStrictEqual(etat.consultation, {
    success: false,
    error: { _tag: 'DepartementInconnu', code: '20' },
  })
})

After(() => {
  delete etat.acteursAvant
  delete etat.consultation
})
