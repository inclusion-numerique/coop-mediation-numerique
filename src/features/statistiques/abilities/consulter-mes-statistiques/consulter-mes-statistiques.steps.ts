import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { titreDesStatistiques } from '@/features/statistiques/ui/presenters/titre-des-statistiques.presenter'

type Personne = Parameters<typeof titreDesStatistiques>[0]

const personnes: Readonly<Record<string, Personne>> = {
  médiateur: { mediateur: { id: 'mediateur' }, coordinateur: null },
  'coordinateur sans activité de médiation': {
    mediateur: null,
    coordinateur: { id: 'coordinateur' },
  },
  'coordinateur qui fait aussi de la médiation': {
    mediateur: { id: 'mediateur' },
    coordinateur: { id: 'coordinateur' },
  },
}

const consultation: { personne?: Personne; titre?: string } = {}

Given('une personne connectée qui est {string}', (personne: string) => {
  const decrite = personnes[personne]
  assert.ok(decrite, `Personne inconnue : ${personne}`)
  consultation.personne = decrite
})

When('elle consulte ses statistiques', () => {
  assert.ok(consultation.personne, "Aucune personne n'a été décrite")
  consultation.titre = titreDesStatistiques(consultation.personne)
})

Then("la page s'intitule {string}", (titre: string) => {
  assert.strictEqual(consultation.titre, titre)
})
