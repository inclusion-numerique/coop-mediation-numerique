import assert from 'node:assert'
import type {
  Compte,
  InterrogerSirene,
  ReponseSirene,
} from '@app/web/features/lieux-activite/abilities/verifier-les-sirets-des-lieux'
import {
  effacerLeSiret,
  lireLesLieuxASiret,
  marquerLeSiretVerifie,
  verifierLesSiretsDesLieux,
} from '@app/web/features/lieux-activite/abilities/verifier-les-sirets-des-lieux'
import {
  lieuxASiretSemes,
  SIRET_PREMIER,
  SIRET_SECOND,
  semerDesLieuxASiret,
} from '@app/web/features/lieux-activite/lieux-activite.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'

type Sirene = {
  readonly reponses: Map<string, ReponseSirene>
  readonly pannes: Set<string>
  readonly interroges: string[]
}

const scenario: { sirene?: Sirene; compte?: Compte } = {}

const sirene = (): Sirene => {
  const existante = scenario.sirene
  if (existante) return existante

  const nouvelle: Sirene = {
    reponses: new Map(),
    pannes: new Set(),
    interroges: [],
  }
  scenario.sirene = nouvelle
  return nouvelle
}

const compte = (): Compte => {
  if (!scenario.compte) throw new Error('Aucune vérification menée')
  return scenario.compte
}

/**
 * L'annuaire des entreprises du scénario. Les ports d'écriture, eux, restent
 * les vrais : c'est la base qui doit montrer ce que la vérification a fait.
 */
const interrogerSirene: InterrogerSirene = async (siret) => {
  sirene().interroges.push(siret)

  if (sirene().pannes.has(siret)) {
    throw new Error(`SIRENE indisponible pour ${siret}`)
  }

  return sirene().reponses.get(siret) ?? { connu: false }
}

/** Seuls les lieux du scénario, pour ne pas balayer la base entière. */
const lireLesLieuxDuScenario = async () => {
  const lieux = await lireLesLieuxASiret()
  const semes = new Set([
    lieuxASiretSemes().premierId,
    lieuxASiretSemes().secondId,
  ])
  return lieux.filter(({ id }) => semes.has(id))
}

const lieu = (id: string) =>
  prismaClient.lieuInclusion.findUniqueOrThrow({
    where: { id },
    select: {
      siret: true,
      nom: true,
      adresse: true,
      synchronisationSiret: true,
    },
  })

Given('des lieux qui portent un SIRET', async () => {
  scenario.sirene = undefined
  scenario.compte = undefined
  await semerDesLieuxASiret()
})

Given('SIRENE enregistre le premier lieu sous les mêmes nom et adresse', () => {
  sirene().reponses.set(SIRET_PREMIER, {
    connu: true,
    nom: 'Maison France Services de Reims',
    adresse: '12 rue de la Paix',
  })
})

Given('SIRENE enregistre le premier lieu sous un autre nom', () => {
  sirene().reponses.set(SIRET_PREMIER, {
    connu: true,
    nom: 'Boulangerie du Centre',
    adresse: '12 rue de la Paix',
  })
})

Given('SIRENE enregistre le premier lieu à une autre adresse', () => {
  sirene().reponses.set(SIRET_PREMIER, {
    connu: true,
    nom: 'Maison France Services de Reims',
    adresse: '87 boulevard Victor Hugo',
  })
})

Given('SIRENE ne connaît aucun des SIRET', () => {
  sirene().reponses.clear()
})

Given('SIRENE ne connaît pas le SIRET du second lieu', () => {
  sirene().reponses.delete(SIRET_SECOND)
})

Given('SIRENE tombe en panne sur le premier lieu', () => {
  sirene().pannes.add(SIRET_PREMIER)
})

Given('le premier lieu a été confronté à SIRENE aujourd’hui', async () => {
  await prismaClient.lieuInclusion.update({
    where: { id: lieuxASiretSemes().premierId },
    data: { synchronisationSiret: new Date() },
  })
})

When('on vérifie les SIRET des lieux', async () => {
  scenario.compte = await verifierLesSiretsDesLieux({
    command: { verifiesDepuis: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    ports: {
      lireLesLieuxASiret: lireLesLieuxDuScenario,
      interrogerSirene,
      effacerLeSiret,
      marquerLeSiretVerifie,
      journal: () => undefined,
    },
  })
})

Then('le premier lieu garde son SIRET', async () => {
  assert.strictEqual(
    (await lieu(lieuxASiretSemes().premierId)).siret,
    SIRET_PREMIER,
  )
})

Then('la confrontation du premier lieu est datée', async () => {
  assert.ok(
    (await lieu(lieuxASiretSemes().premierId)).synchronisationSiret,
    'La date de confrontation devrait être posée',
  )
})

Then('le SIRET du premier lieu est effacé', async () => {
  const apres = await lieu(lieuxASiretSemes().premierId)

  assert.strictEqual(apres.siret, null)
  assert.strictEqual(apres.synchronisationSiret, null)
})

Then('le SIRET du second lieu est effacé', async () => {
  assert.strictEqual((await lieu(lieuxASiretSemes().secondId)).siret, null)
})

Then('le premier lieu garde son nom et son adresse', async () => {
  const apres = await lieu(lieuxASiretSemes().premierId)

  assert.strictEqual(apres.nom, 'Maison France Services de Reims')
  assert.strictEqual(apres.adresse, '12 rue de la Paix')
})

Then('SIRENE n’a pas été interrogée sur le premier lieu', () => {
  assert.ok(
    !sirene().interroges.includes(SIRET_PREMIER),
    'SIRENE ne devrait pas avoir été interrogée',
  )
})

Then('la passe compte un échec', () => {
  assert.strictEqual(compte().echecs, 1)
})
