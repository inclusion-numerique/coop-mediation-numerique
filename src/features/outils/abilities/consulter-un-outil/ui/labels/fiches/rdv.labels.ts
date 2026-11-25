import { RDVServicePublicLogo } from '@/libraries/pictograms/services'
import type { FicheOutil } from './fiche-outil.labels'

export default (website: string): FicheOutil => ({
  title: 'RDV Service Public',
  description:
    'Un outil de prise de rendez-vous en ligne, simplifiant votre organisation et rappelant aux usagers leurs rendez-vous par SMS.',
  website,
  pictogram: RDVServicePublicLogo,
  illustration: '/images/illustrations/mes-outils/rdv-service-public.webp',
  features: [
    {
      title: 'Définir vos plages de disponibilités',
      description:
        'Informez vos apprenants et vos collègues des créneaux disponibles.',
      icon: 'ri-calendar-2-line',
    },
    {
      title: 'Envoyer une notification de rappel',
      description:
        'Vos apprenants recevront un SMS et/ou un e-mail de rappel de RDV. Ils pourront également modifier ou annuler le RDV.',
      icon: 'ri-notification-3-line',
    },
    {
      title: 'Importer vos RDVs sur votre agenda',
      description:
        'Synchronisez RDV Service Public et votre agenda du quotidien.',
      icon: 'ri-loop-right-line',
    },
  ],
  classes: {
    access: 'fr-background-alt--blue-ecume fr-border-none',
  },
})
