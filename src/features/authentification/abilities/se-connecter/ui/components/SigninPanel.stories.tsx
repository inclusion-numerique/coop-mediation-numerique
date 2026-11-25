import { Meta, StoryObj } from '@storybook/react'
import SigninPanel from '@/features/authentification/abilities/se-connecter/ui/components/SigninPanel'

const meta: Meta<typeof SigninPanel> = {
  title: 'SigninPanel',
  component: SigninPanel,
}

export default meta

type Story = StoryObj<typeof SigninPanel>

export const Desktop: Story = {
  args: {
    callbackUrl: '/connexion/suivant',
    connexion: { via: 'proconnect', fournisseur: 'proconnect' },
  },
}
export const Mobile: Story = {
  args: { ...Desktop.args },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}
