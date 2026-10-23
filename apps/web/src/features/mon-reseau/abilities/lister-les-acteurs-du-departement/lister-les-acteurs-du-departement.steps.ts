import assert from 'node:assert'
import { consulterLesActeursDuDepartement } from '@app/web/features/mon-reseau/abilities/lister-les-acteurs-du-departement'
import {
  exercerDansLeLieu,
  semerUnActeur,
  semerUnLieu,
} from '@app/web/features/mon-reseau/mon-reseau.cucumber'
import { After, Given, Then, When } from '@cucumber/cucumber'

type Consultation = Awaited<ReturnType<typeof consulterLesActeursDuDepartement>>

const etat: { consultation?: Consultation } = {}

const nomsProposes = (): readonly string[] => {
  const consultation = etat.consultation
  if (consultation === undefined || !consultation.success) {
    throw new Error('Aucun annuaire des acteurs consulté')
  }
  return consultation.data.acteurs.acteurs.map(({ nomAffiche }) => nomAffiche)
}

const semerDansLeCantal = async ({
  prenom,
  nom,
  coordinateur = false,
  supprime = false,
}: {
  prenom: string
  nom: string
  coordinateur?: boolean
  supprime?: boolean
}) => {
  const { mediateurId } = await semerUnActeur({
    prenom,
    nom,
    coordinateur,
    supprime,
  })
  if (mediateurId === null) throw new Error('Médiateur non semé')
  await exercerDansLeLieu({ mediateurId, lieuId: await semerUnLieu() })
}

const consulter = async (parametres: Record<string, string>) => {
  etat.consultation = await consulterLesActeursDuDepartement('15', {
    lignes: '100',
    ...parametres,
  })
}

Given(
  'le médiateur {word} {word} qui exerce dans le Cantal',
  async (prenom: string, nom: string) => {
    await semerDansLeCantal({ prenom, nom })
  },
)

Given(
  'le médiateur supprimé {word} {word} qui exerce dans le Cantal',
  async (prenom: string, nom: string) => {
    await semerDansLeCantal({ prenom, nom, supprime: true })
  },
)

Given(
  'le coordinateur {word} {word} qui exerce dans le Cantal',
  async (prenom: string, nom: string) => {
    await semerDansLeCantal({ prenom, nom, coordinateur: true })
  },
)

When(
  'on cherche « {word} » dans l’annuaire des acteurs du Cantal',
  async (recherche: string) => {
    await consulter({ recherche })
  },
)

When(
  'on cherche « {word} » parmi les coordinateurs du Cantal',
  async (recherche: string) => {
    await consulter({ recherche, role: 'coordinateur' })
  },
)

When(
  'on cherche « {word} » de Z à A dans l’annuaire des acteurs du Cantal',
  async (recherche: string) => {
    await consulter({ recherche, tri: 'nomza' })
  },
)

When(
  'on consulte l’annuaire des acteurs du département « {word} »',
  async (code: string) => {
    etat.consultation = await consulterLesActeursDuDepartement(code, {})
  },
)

Then('l’annuaire propose {word} {word}', (prenom: string, nom: string) => {
  assert.ok(nomsProposes().includes(`${prenom} ${nom}`))
})

Then(
  'l’annuaire ne propose pas {word} {word}',
  (prenom: string, nom: string) => {
    assert.ok(!nomsProposes().includes(`${prenom} ${nom}`))
  },
)

Then('l’annuaire ne propose personne', () => {
  assert.deepStrictEqual(nomsProposes(), [])
})

Then(
  'l’annuaire propose {word} {word} avant {word} {word}',
  (
    premierPrenom: string,
    premierNom: string,
    secondPrenom: string,
    secondNom: string,
  ) => {
    const noms = nomsProposes()
    assert.ok(
      noms.indexOf(`${premierPrenom} ${premierNom}`) <
        noms.indexOf(`${secondPrenom} ${secondNom}`),
    )
  },
)

Then('l’annuaire des acteurs est introuvable', () => {
  assert.deepStrictEqual(etat.consultation, {
    success: false,
    error: { _tag: 'DepartementInconnu', code: '20' },
  })
})

After(() => {
  etat.consultation = undefined
})
