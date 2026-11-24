import Button from '@codegouvfr/react-dsfr/Button'
import { Meta, StoryObj } from '@storybook/react'
import { buttonLoadingClassname } from './button-loading-classname'

const meta: Meta<typeof Button> = {
  title: 'DSFR Component/Button/Loading',
  component: Button,
}

export default meta

type Story = StoryObj<typeof Button>

export const DisabledIconeGauche: Story = {
  render: () => (
    <Button
      disabled
      {...buttonLoadingClassname(true)}
      iconPosition="left"
      iconId="fr-icon-arrow-right-line"
    >
      Enregistrer
    </Button>
  ),
  args: {
    children: 'Enregistrer',
  },
}

export const DisabledIconeDroiteSecondary: Story = {
  render: () => (
    <Button
      disabled
      {...buttonLoadingClassname(true)}
      iconPosition="right"
      iconId="fr-icon-arrow-right-line"
      priority="secondary"
    >
      Enregistrer
    </Button>
  ),
}

export const IconeSeulementTertiaryDisabled: Story = {
  render: () => (
    <Button
      {...buttonLoadingClassname(true)}
      title="Enregistrer"
      iconId="fr-icon-arrow-right-line"
      priority="tertiary"
      disabled
    />
  ),
}

export const SansIconeDisabled: Story = {
  render: () => (
    <Button {...buttonLoadingClassname(true)} disabled>
      Enregistrer
    </Button>
  ),
}

export const SansIconeDisabledDanger: Story = {
  render: () => (
    <Button {...buttonLoadingClassname(true, 'fr-btn--danger')} disabled>
      Enregistrer
    </Button>
  ),
}

export const SansIconeSmallTexteLongDisabled: Story = {
  render: () => (
    <Button {...buttonLoadingClassname(true)} size="small" disabled>
      Un très long texte de bouton
    </Button>
  ),
}

export const SansIconeSmallSecondaryDisabled: Story = {
  render: () => (
    <Button
      {...buttonLoadingClassname(true)}
      size="small"
      priority="secondary"
      disabled
    >
      Enregistrer
    </Button>
  ),
}

export const SansIconeLargeTertiaryDisabled: Story = {
  render: () => (
    <Button
      {...buttonLoadingClassname(true)}
      size="large"
      priority="tertiary"
      disabled
    >
      Enregistrer
    </Button>
  ),
}

export const SansIconeTertiaryNoOutlineDisabled: Story = {
  render: () => (
    <Button
      {...buttonLoadingClassname(true)}
      priority="tertiary no outline"
      disabled
    >
      Enregistrer
    </Button>
  ),
}

export const IconeGauche: Story = {
  render: () => (
    <Button {...buttonLoadingClassname(true)} iconId="fr-icon-arrow-right-line">
      Enregistrer
    </Button>
  ),
}

export const IconeGaucheSmall: Story = {
  render: () => (
    <Button
      {...buttonLoadingClassname(true)}
      size="small"
      iconId="fr-icon-arrow-right-line"
    >
      Enregistrer
    </Button>
  ),
}

export const IconeDroiteSecondary: Story = {
  render: () => (
    <Button
      {...buttonLoadingClassname(true)}
      iconId="fr-icon-arrow-right-line"
      iconPosition="right"
      priority="secondary"
    >
      Enregistrer
    </Button>
  ),
}

export const IconeDroiteLarge: Story = {
  render: () => (
    <Button
      {...buttonLoadingClassname(true)}
      size="large"
      iconId="fr-icon-arrow-right-line"
      iconPosition="right"
    >
      Enregistrer
    </Button>
  ),
}

export const IconeSeulementTertiary: Story = {
  render: () => (
    <Button
      {...buttonLoadingClassname(true)}
      title="Enregistrer"
      iconId="fr-icon-arrow-right-line"
      priority="tertiary"
    />
  ),
}

export const SansIcone: Story = {
  render: () => <Button {...buttonLoadingClassname(true)}>Enregistrer</Button>,
}

export const SansIconeDanger: Story = {
  render: () => (
    <Button {...buttonLoadingClassname(true, 'fr-btn--danger')}>
      Enregistrer
    </Button>
  ),
}

export const SansIconeSmallSecondary: Story = {
  render: () => (
    <Button {...buttonLoadingClassname(true)} size="small" priority="secondary">
      Enregistrer
    </Button>
  ),
}

export const SansIconeLargeTertiary: Story = {
  render: () => (
    <Button {...buttonLoadingClassname(true)} size="large" priority="tertiary">
      Enregistrer
    </Button>
  ),
}

export const SansIconeTertiaryNoOutline: Story = {
  render: () => (
    <Button {...buttonLoadingClassname(true)} priority="tertiary no outline">
      Enregistrer
    </Button>
  ),
}
