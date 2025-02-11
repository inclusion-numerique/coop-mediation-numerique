import { AxiosResponse } from 'axios'
import { BrevoContact, createContact } from './contact'

const BREVO_API_KEY = process.env.BREVO_API_KEY!

export const createBrevoContact: (
  ...listIds: number[]
) => (
  contact: BrevoContact,
  updateEnabled?: boolean,
) => Promise<AxiosResponse> = createContact(BREVO_API_KEY)
