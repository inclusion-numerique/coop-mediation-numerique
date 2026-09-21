import assert from 'node:assert'
import {
  auditerLesDonnees,
  lieuxAAuditer,
  type Releve,
} from '@app/web/features/lieux-activite/abilities/auditer-les-donnees'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

const semis: { lieuId?: string; releve?: Releve } = {}

const semerUnLieuAAuditer = async (
  champs: Record<string, unknown>,
): Promise<void> => {
  const lieu = await prismaClient.lieuInclusion.create({
    data: {
      nom: `Lieu à auditer ${v4()}`,
      adresse: '12 quai du Port',
      commune: 'Rochefort',
      codePostal: '17300',
      codeInsee: '17299',
      services: ['AideAuxDemarchesAdministratives'],
      ...champs,
    },
    select: { id: true },
  })

  semis.lieuId = lieu.id
}

const anomaliesDuLieu = () =>
  (semis.releve?.detail ?? []).filter(({ lieuId }) => lieuId === semis.lieuId)

Given('un lieu dont la voie est vide', async () => {
  await semerUnLieuAAuditer({ adresse: '' })
})

Given(
  'un lieu dont les horaires ne suivent pas le format OpenStreetMap',
  async () => {
    await semerUnLieuAAuditer({ horaires: 'tous les jours sauf le mardi' })
  },
)

When('on audite les données des lieux', async () => {
  semis.releve = auditerLesDonnees(await lieuxAAuditer())
})

Then('le relevé compte ce lieu parmi les écartés', () => {
  assert.ok(
    anomaliesDuLieu().some(({ gravite }) => gravite === 'lieu-ecarte'),
    'le lieu devrait porter une anomalie bloquante',
  )
})

Then('le relevé ne compte pas ce lieu parmi les écartés', () => {
  assert.ok(
    anomaliesDuLieu().every(({ gravite }) => gravite !== 'lieu-ecarte'),
    'le lieu ne devrait porter aucune anomalie bloquante',
  )
})

Then('il porte le motif {string}', (motif: string) => {
  assert.ok(
    anomaliesDuLieu().some(({ code }) => code === motif),
    `motifs relevés : ${anomaliesDuLieu()
      .map(({ code }) => code)
      .join(', ')}`,
  )
})

After(async () => {
  if (semis.lieuId != null)
    await prismaClient.lieuInclusion.deleteMany({ where: { id: semis.lieuId } })
  semis.lieuId = undefined
  semis.releve = undefined
})
