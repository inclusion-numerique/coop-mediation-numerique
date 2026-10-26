import assert from 'node:assert'
import {
  consulterUnActeur,
  type QuiConsulte,
} from '@app/web/features/mon-reseau/abilities/consulter-un-acteur'
import {
  type ActeurASemer,
  type ActeurSeme,
  semerUnActeur,
} from '@app/web/features/mon-reseau/mon-reseau.cucumber'
import { derniereActiviteDeLUtilisateur } from '@app/web/features/utilisateurs'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { subDays } from 'date-fns'

type Consultation = Awaited<ReturnType<typeof consulterUnActeur>>

const etat: {
  acteur?: ActeurSeme
  lecteur?: ActeurSeme
  consultation?: Consultation
} = {}

const lActeur = (): ActeurSeme => {
  if (etat.acteur === undefined) throw new Error('Aucun acteur semé')
  return etat.acteur
}

const leLecteur = (): ActeurSeme => {
  if (etat.lecteur === undefined) throw new Error('Aucun lecteur semé')
  return etat.lecteur
}

const laFiche = () => {
  const consultation = etat.consultation
  if (consultation === undefined || !consultation.success) {
    throw new Error('Aucune fiche consultée')
  }
  return consultation.data
}

const laRelation = () => {
  const { regard } = laFiche()
  if (regard._tag !== 'Coordinateur')
    throw new Error('Aucun regard de coordinateur')
  return regard.relation
}

const semerAlexMartin = async (acteur: ActeurASemer = {}) => {
  etat.acteur = await semerUnActeur({
    prenom: 'Alex',
    nom: 'Martin',
    ...acteur,
  })
}

const quiConsulte = (): QuiConsulte => {
  const { userId, coordinateurId } = leLecteur()
  return {
    id: userId,
    coordinateur: coordinateurId === null ? null : { id: coordinateurId },
  }
}

const consulter = async (acteurId: string) => {
  etat.consultation = await consulterUnActeur({
    quiConsulte: quiConsulte(),
    acteurId,
    lireLaDerniereActivite: derniereActiviteDeLUtilisateur,
    maintenant: new Date(),
  })
}

const coordonner = async (suppression: Date | null) => {
  const { coordinateurId } = leLecteur()
  const { mediateurId } = lActeur()
  await prismaClient.mediateurCoordonne.create({
    data: {
      coordinateurId: coordinateurId ?? '',
      mediateurId: mediateurId ?? '',
      creation: new Date('2026-01-01'),
      suppression,
    },
  })
}

Given('un médiateur Alex Martin', async () => {
  await semerAlexMartin()
})

Given('un médiateur supprimé Alex Martin', async () => {
  await semerAlexMartin({ supprime: true })
})

Given('un médiateur non inscrit Alex Martin', async () => {
  await semerAlexMartin({ inscrit: false })
})

Given('un coordinateur Alex Martin qui ne fait pas de médiation', async () => {
  await semerAlexMartin({ mediateur: false, coordinateur: true })
})

Given(
  'un médiateur Alex Martin dont la dernière activité date de {int} jours',
  async (jours: number) => {
    await semerAlexMartin()
    await prismaClient.mediateur.update({
      where: { id: lActeur().mediateurId ?? '' },
      data: { derniereCreationActivite: subDays(new Date(), jours) },
    })
  },
)

Given('Alex Martin est coordonné par un coordinateur non inscrit', async () => {
  const { coordinateurId } = await semerUnActeur({
    prenom: 'Cam',
    nom: 'Noninscrit',
    mediateur: false,
    coordinateur: true,
    inscrit: false,
  })
  await prismaClient.mediateurCoordonne.create({
    data: {
      coordinateurId: coordinateurId ?? '',
      mediateurId: lActeur().mediateurId ?? '',
    },
  })
})

Given('un médiateur qui consulte l’annuaire', async () => {
  etat.lecteur = await semerUnActeur({ prenom: 'Lou', nom: 'Lecteur' })
})

Given('un coordinateur qui consulte l’annuaire', async () => {
  etat.lecteur = await semerUnActeur({
    prenom: 'Lou',
    nom: 'Coordinatrice',
    coordinateur: true,
  })
})

Given('Alex Martin est membre de son équipe', async () => {
  await coordonner(null)
})

Given('Alex Martin a quitté son équipe', async () => {
  await coordonner(new Date('2026-03-01'))
})

Given('il a invité Alex Martin dans son équipe', async () => {
  await prismaClient.invitationEquipe.create({
    data: {
      email: `invitation-${lActeur().userId}@example.com`,
      coordinateurId: leLecteur().coordinateurId ?? '',
      mediateurId: lActeur().mediateurId,
      creation: new Date('2026-10-01'),
    },
  })
})

When('il consulte la fiche d’Alex Martin', async () => {
  await consulter(lActeur().userId)
})

When('il consulte la fiche « {word} »', async (acteurId: string) => {
  await consulter(acteurId)
})

When('il consulte sa propre fiche', async () => {
  await consulter(leLecteur().userId)
})

Then('la fiche présente Alex Martin', () => {
  assert.strictEqual(laFiche().acteur.nomAffiche, 'Alex Martin')
})

Then('Alex Martin n’est coordonné par personne', () => {
  assert.deepStrictEqual(laFiche().acteur.profil.mediation?.coordinateurs, [])
})

Then('la fiche ne dit rien de l’équipe', () => {
  assert.deepStrictEqual(laFiche().regard, { _tag: 'Mediateur' })
})

Then('la fiche est introuvable', () => {
  assert.strictEqual(etat.consultation?.success, false)
})

Then('Alex Martin est actif', () => {
  assert.deepStrictEqual(laFiche().statut, { _tag: 'Actif' })
})

Then('Alex Martin n’a jamais été actif', () => {
  assert.deepStrictEqual(laFiche().statut, { _tag: 'JamaisActif' })
})

Then('Alex Martin est hors de son équipe', () => {
  assert.deepStrictEqual(laRelation(), { _tag: 'HorsEquipe' })
})

Then(
  'Alex Martin est membre de son équipe, sans activité ces 30 derniers jours',
  () => {
    assert.deepStrictEqual(laRelation(), {
      _tag: 'Membre',
      statistiques: { beneficiairesAccompagnes: 0, accompagnements: 0 },
      contrat: null,
    })
  },
)

Then('Alex Martin est invité dans son équipe', () => {
  assert.deepStrictEqual(laRelation(), {
    _tag: 'Invite',
    invitationLe: new Date('2026-10-01'),
  })
})

Then('Alex Martin est un ancien membre de son équipe', () => {
  assert.deepStrictEqual(laRelation(), {
    _tag: 'AncienMembre',
    depuis: new Date('2026-01-01'),
    fin: new Date('2026-03-01'),
  })
})

Then('l’acteur ne peut pas rejoindre son équipe', () => {
  assert.deepStrictEqual(laRelation(), { _tag: 'NonCoordonnable' })
})

After(() => {
  etat.acteur = undefined
  etat.lecteur = undefined
  etat.consultation = undefined
})
