import assert from 'node:assert'
import { nombreDeLieuxDuDepartement } from '@app/web/features/lieux-activite'
import { consulterLeReseauDuDepartement } from '@app/web/features/mon-reseau/abilities/consulter-le-reseau-du-departement'
import {
  type ActeurASemer,
  exercerDansLeLieu,
  semerUnActeur,
  semerUnLieu,
} from '@app/web/features/mon-reseau/mon-reseau.cucumber'
import { After, Given, Then, When } from '@cucumber/cucumber'

type Consultation = Awaited<ReturnType<typeof consulterLeReseauDuDepartement>>

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
  const consultation = await consulterLeReseauDuDepartement('15')
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
  etat.consultation = await consulterLeReseauDuDepartement('15')
})

When(
  'on consulte le réseau du département « {word} »',
  async (code: string) => {
    etat.consultation = await consulterLeReseauDuDepartement(code)
  },
)

Then('le réseau du Cantal compte {int} acteur(s) de plus', (ecart: number) => {
  assert.strictEqual(reseauConsulte().acteurs, (etat.acteursAvant ?? 0) + ecart)
})

Then('le réseau du Cantal compte les lieux de son annuaire', async () => {
  assert.strictEqual(
    reseauConsulte().lieux,
    await nombreDeLieuxDuDepartement('15'),
  )
})

Then('le département est inconnu', () => {
  assert.deepStrictEqual(etat.consultation, {
    success: false,
    error: { _tag: 'DepartementInconnu', code: '20' },
  })
})

After(() => {
  etat.acteursAvant = undefined
  etat.consultation = undefined
})
