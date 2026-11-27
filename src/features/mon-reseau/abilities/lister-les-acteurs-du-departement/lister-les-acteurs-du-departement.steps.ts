import assert from 'node:assert'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { listerLesActeursDuDepartement } from '@/features/mon-reseau/abilities/lister-les-acteurs-du-departement/domain/lister-les-acteurs-du-departement'
import { acteursDuDepartement } from '@/features/mon-reseau/abilities/lister-les-acteurs-du-departement/implementations/prisma'
import {
  exercerDansLeLieu,
  semerUnActeur,
  semerUnLieu,
} from '@/features/mon-reseau/mon-reseau.cucumber'
import { departementConnu } from '@/libraries/departement'
import { criteresDesActeursDuReseau } from './ui/filtres/acteurs-du-reseau.filtre'

const communesDesLieux = async () => []

type Consultation = Awaited<
  ReturnType<ReturnType<typeof listerLesActeursDuDepartement>>
>

const etat: { consultation?: Consultation } = {}

const nomsProposes = (): readonly string[] => {
  const consultation = etat.consultation
  if (consultation === undefined || !consultation.success) {
    throw new Error('Aucun annuaire des acteurs consulté')
  }
  return consultation.data.acteurs.items.map(({ nomAffiche }) => nomAffiche)
}

const SAINT_FLOUR = '15187'

const semerDansLeCantal = async ({
  prenom,
  nom,
  coordinateur = false,
  supprime = false,
  codeInsee,
}: {
  prenom: string
  nom: string
  coordinateur?: boolean
  supprime?: boolean
  codeInsee?: string
}) => {
  const { mediateurId } = await semerUnActeur({
    prenom,
    nom,
    coordinateur,
    supprime,
  })
  if (mediateurId === null) throw new Error('Médiateur non semé')
  await exercerDansLeLieu({
    mediateurId,
    lieuId: await semerUnLieu(codeInsee === undefined ? {} : { codeInsee }),
  })
}

const consulter = async (parametres: Record<string, string>) => {
  etat.consultation = await listerLesActeursDuDepartement({
    acteursDuDepartement,
    communesDesLieux,
  })({
    departement: departementConnu('15'),
    criteres: criteresDesActeursDuReseau({ lignes: '100', ...parametres }),
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
  'le médiateur {word} {word} qui exerce à Saint-Flour',
  async (prenom: string, nom: string) => {
    await semerDansLeCantal({ prenom, nom, codeInsee: SAINT_FLOUR })
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
  'on cherche « {word} » à Saint-Flour dans l’annuaire des acteurs du Cantal',
  async (recherche: string) => {
    await consulter({ recherche, communes: SAINT_FLOUR })
  },
)

When(
  'on cherche « {word} » parmi les médiateurs numériques du Cantal',
  async (recherche: string) => {
    await consulter({ recherche, role: 'mediateur_numerique' })
  },
)

When(
  'on cherche « {word} » de Z à A dans l’annuaire des acteurs du Cantal',
  async (recherche: string) => {
    await consulter({ recherche, ordre: 'desc' })
  },
)

When(
  'on consulte l’annuaire des acteurs du département « {word} »',
  async (code: string) => {
    etat.consultation = await listerLesActeursDuDepartement({
      acteursDuDepartement,
      communesDesLieux,
    })({
      departement: departementConnu(code),
      criteres: criteresDesActeursDuReseau({}),
    })
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
    error: { _tag: 'DepartementInconnu' },
  })
})

After(() => {
  delete etat.consultation
})
