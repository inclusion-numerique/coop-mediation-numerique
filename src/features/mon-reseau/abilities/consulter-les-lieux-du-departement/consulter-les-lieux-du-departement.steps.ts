import assert from 'node:assert'
import { After, Then, When } from '@cucumber/cucumber'
import { consulterLesLieuxDuDepartement } from '@/features/mon-reseau/abilities/consulter-les-lieux-du-departement/domain/consulter-les-lieux-du-departement'
import type { ParametresDuReseau } from '@/features/mon-reseau/ui/filtres/reseau.filtre'
import { departementConnu } from '@/libraries/departement'
import { criteresDesLieuxDuReseau } from './ui/filtres/lieux-du-reseau.filtre'

const AURILLAC = '15014'

const etat: {
  communesDemandees?: readonly string[]
  consultation?: Awaited<ReturnType<typeof consulterLesLieux>>
} = {}

const annuaireVide = async ({
  criteres,
}: {
  criteres: { readonly communes: readonly string[] }
}) => {
  etat.communesDemandees = criteres.communes
  return { items: [], totalItems: 0 }
}

const aucuneCommune = async () => []

const consulterLesLieux = (code: string, parametres: ParametresDuReseau) =>
  consulterLesLieuxDuDepartement({
    lieuxDuDepartement: annuaireVide,
    communesDesLieux: aucuneCommune,
  })({
    departement: departementConnu(code),
    criteres: criteresDesLieuxDuReseau(parametres),
  })

const consulter = async (communes: string) => {
  etat.consultation = await consulterLesLieux('15', { communes })
}

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
    etat.consultation = await consulterLesLieux(code, {})
  },
)

Then('l’annuaire est demandé pour Aurillac seulement', () => {
  assert.deepStrictEqual(etat.communesDemandees, [AURILLAC])
})

Then('l’annuaire est demandé sans commune', () => {
  assert.deepStrictEqual(etat.communesDemandees, [])
})

Then('l’annuaire des lieux est introuvable', () => {
  assert.deepStrictEqual(etat.consultation, {
    success: false,
    error: { _tag: 'DepartementInconnu' },
  })
})

After(() => {
  delete etat.communesDemandees
  delete etat.consultation
})
