import assert from 'node:assert'
import { consulterLesLieuxDuDepartement } from '@app/web/features/mon-reseau/abilities/consulter-les-lieux-du-departement'
import { semerUnLieu } from '@app/web/features/mon-reseau/mon-reseau.cucumber'
import { After, Given, Then, When } from '@cucumber/cucumber'

const AURILLAC = '15014'
const SAINT_FLOUR = '15187'

type Consultation = Awaited<ReturnType<typeof consulterLesLieuxDuDepartement>>

const etat: {
  aurillac?: string
  saintFlour?: string
  consultation?: Consultation
} = {}

const proposes = (): readonly string[] => {
  const consultation = etat.consultation
  if (consultation === undefined || !consultation.success) {
    throw new Error('Aucun annuaire consulté')
  }
  return consultation.data.lieux.lieux.map(({ id }) => id)
}

const consulter = async (communes: string) => {
  etat.consultation = await consulterLesLieuxDuDepartement('15', {
    communes,
    lignes: '100',
  })
}

Given('un lieu publié à Aurillac et un lieu publié à Saint-Flour', async () => {
  etat.aurillac = await semerUnLieu({ codeInsee: AURILLAC, publie: true })
  etat.saintFlour = await semerUnLieu({
    codeInsee: SAINT_FLOUR,
    commune: 'Saint-Flour',
    publie: true,
  })
})

When('on consulte les lieux du Cantal à Aurillac', async () => {
  await consulter(AURILLAC)
})

When(
  'on consulte les lieux du Cantal dans la commune « {word} »',
  async (commune: string) => {
    await consulter(commune)
  },
)

When(
  'on consulte les lieux du département « {word} »',
  async (code: string) => {
    etat.consultation = await consulterLesLieuxDuDepartement(code, {})
  },
)

Then('seul le lieu d’Aurillac est proposé', () => {
  assert.ok(proposes().includes(etat.aurillac ?? ''))
  assert.ok(!proposes().includes(etat.saintFlour ?? ''))
})

Then('les deux lieux sont proposés', () => {
  assert.ok(proposes().includes(etat.aurillac ?? ''))
  assert.ok(proposes().includes(etat.saintFlour ?? ''))
})

Then('l’annuaire des lieux est introuvable', () => {
  assert.deepStrictEqual(etat.consultation, {
    success: false,
    error: { _tag: 'DepartementInconnu', code: '20' },
  })
})

After(() => {
  etat.aurillac = undefined
  etat.saintFlour = undefined
  etat.consultation = undefined
})
