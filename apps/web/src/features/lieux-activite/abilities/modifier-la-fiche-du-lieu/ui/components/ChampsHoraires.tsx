'use client'

import {
  daysTexts,
  type Period,
  periodsTexts,
} from '@app/web/components/structure/fields/openingHoursHelpers'
import { withForm } from '@app/web/libs/form/use-app-form'
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch'
import {
  OSM_DAYS_OF_WEEK,
  type OsmDaysOfWeek,
} from '@gouvfr-anct/timetable-to-osm-opening-hours'
import { useSelector } from '@tanstack/react-form'
import { informationsPratiquesFormOptions } from './informationsPratiquesFormData'

const jours: readonly OsmDaysOfWeek[] = [...OSM_DAYS_OF_WEEK]

const periodes: Period[] = ['am', 'pm']

/**
 * La grille d'ouverture, dupliquée depuis le parcours de création plutôt que
 * partagée : `withForm` lie un composant à la forme d'UN formulaire, et une
 * ability ne dépend pas d'une autre. Les deux copies mourront ensemble le jour
 * où la création rejoindra ce standard.
 *
 * Une demi-journée : les horaires ne sont saisissables que si la bascule
 * « Ouvert » est active, et se vident dès qu'elle retombe — sans quoi un horaire
 * resterait attaché à une demi-journée fermée.
 */
const DemiJournee = withForm({
  ...informationsPratiquesFormOptions,
  props: {} as { isPending: boolean; day: OsmDaysOfWeek; period: Period },
  render: ({ form, isPending, day, period }) => {
    const isOpen = useSelector(
      form.store,
      (state) => state.values.openingHours[day][period].isOpen === true,
    )
    const libelle = `${daysTexts[day]} ${periodsTexts[period]}`

    return (
      <>
        <div className="fr-text--center fr-text-mention--grey fr-text--sm fr-mb-1w">
          <span style={{ textTransform: 'capitalize' }}>{daysTexts[day]}</span>{' '}
          {periodsTexts[period]}
        </div>
        <div
          className={`fr-border fr-border-radius--4 ${
            isOpen ? '' : 'fr-background-alt--grey'
          }`}
        >
          <div className="fr-flex fr-border-bottom">
            <form.AppField name={`openingHours.${day}.${period}.startTime`}>
              {(field) => (
                <field.Input
                  isPending={isPending || !isOpen}
                  hideLabel
                  label={`Horaire d’ouverture du ${libelle}`}
                  className="fr-flex-grow-1 fr-border-right fr-m-0"
                  classes={{
                    nativeInputOrTextArea: 'fr-input--clear fr-text--center',
                  }}
                  nativeInputProps={{ type: 'time' }}
                />
              )}
            </form.AppField>
            <form.AppField name={`openingHours.${day}.${period}.endTime`}>
              {(field) => (
                <field.Input
                  isPending={isPending || !isOpen}
                  hideLabel
                  label={`Horaire de fermeture du ${libelle}`}
                  className="fr-flex-grow-1 fr-m-0"
                  classes={{
                    nativeInputOrTextArea: 'fr-input--clear fr-text--center',
                  }}
                  nativeInputProps={{ type: 'time' }}
                />
              )}
            </form.AppField>
          </div>
          <div className="fr-px-12v fr-py-2v">
            <ToggleSwitch
              inputTitle={`Ouverture du ${libelle}`}
              className="fr-m-0"
              classes={{ root: 'fr-m-0' }}
              disabled={isPending}
              checked={isOpen}
              label={isOpen ? 'Ouvert' : 'Fermé'}
              labelPosition="left"
              showCheckedHint={false}
              onChange={(checked) => {
                form.setFieldValue(
                  `openingHours.${day}.${period}.isOpen`,
                  checked,
                )
                if (checked) return
                form.setFieldValue(
                  `openingHours.${day}.${period}.startTime`,
                  '',
                )
                form.setFieldValue(`openingHours.${day}.${period}.endTime`, '')
              }}
            />
          </div>
        </div>
      </>
    )
  },
})

export const ChampsHoraires = withForm({
  ...informationsPratiquesFormOptions,
  props: {} as { isPending: boolean },
  render: ({ form, isPending }) => (
    <div className="fr-grid-row fr-grid-row--gutters fr-mb-2w">
      {jours.flatMap((day) =>
        periodes.map((period) => (
          <div className="fr-col-6" key={`${day}-${period}`}>
            <DemiJournee
              form={form}
              isPending={isPending}
              day={day}
              period={period}
            />
          </div>
        )),
      )}
    </div>
  ),
})
