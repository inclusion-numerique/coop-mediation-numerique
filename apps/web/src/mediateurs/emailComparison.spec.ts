import {
  isAlreadyInvited,
  isAlreadyTeamMember,
  isEmailMatch,
  normalizeEmail,
} from './emailComparison'

describe('emailComparison', () => {
  describe('isEmailMatch', () => {
    it('should return true for identical emails', () => {
      expect(isEmailMatch('test@example.com', 'test@example.com')).toBe(true)
    })

    it('should return true for emails with different cases', () => {
      expect(isEmailMatch('TEST@EXAMPLE.COM', 'test@example.com')).toBe(true)
      expect(isEmailMatch('test@example.com', 'TEST@EXAMPLE.COM')).toBe(true)
      expect(isEmailMatch('TeSt@ExAmPlE.cOm', 'test@example.com')).toBe(true)
    })

    it('should return false for different emails', () => {
      expect(isEmailMatch('test1@example.com', 'test2@example.com')).toBe(false)
      expect(isEmailMatch('test@example.com', 'test@example.fr')).toBe(false)
    })
  })

  describe('isAlreadyInvited', () => {
    const existingInvitations = [
      { email: 'invited1@example.com' },
      { email: 'invited2@example.com' },
      { email: 'UPPERCASE@example.com' },
    ]

    it('should return true when email exists in invitations (exact match)', () => {
      expect(
        isAlreadyInvited('invited1@example.com', existingInvitations),
      ).toBe(true)
    })

    it('should return true when email exists with different case', () => {
      expect(
        isAlreadyInvited('INVITED1@EXAMPLE.COM', existingInvitations),
      ).toBe(true)
      expect(
        isAlreadyInvited('uppercase@example.com', existingInvitations),
      ).toBe(true)
    })

    it('should return false when email does not exist', () => {
      expect(isAlreadyInvited('new@example.com', existingInvitations)).toBe(
        false,
      )
    })

    it('should return false for empty invitations list', () => {
      expect(isAlreadyInvited('test@example.com', [])).toBe(false)
    })
  })

  describe('isAlreadyTeamMember', () => {
    const teamMembers = [
      { mediateur: { user: { email: 'member1@example.com' } } },
      { mediateur: { user: { email: 'member2@example.com' } } },
      { mediateur: { user: { email: 'UPPERCASE.MEMBER@example.com' } } },
    ]

    it('should return true when email exists in team members (exact match)', () => {
      expect(isAlreadyTeamMember('member1@example.com', teamMembers)).toBe(true)
    })

    it('should return true when email exists with different case', () => {
      expect(isAlreadyTeamMember('MEMBER1@EXAMPLE.COM', teamMembers)).toBe(true)
      expect(
        isAlreadyTeamMember('uppercase.member@example.com', teamMembers),
      ).toBe(true)
    })

    it('should return false when email does not exist', () => {
      expect(isAlreadyTeamMember('new@example.com', teamMembers)).toBe(false)
    })

    it('should return false for empty team members list', () => {
      expect(isAlreadyTeamMember('test@example.com', [])).toBe(false)
    })
  })

  describe('normalizeEmail', () => {
    it('should convert email to lowercase', () => {
      expect(normalizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com')
    })

    it('should handle mixed case', () => {
      expect(normalizeEmail('TeSt@ExAmPlE.cOm')).toBe('test@example.com')
    })

    it('should not change already lowercase email', () => {
      expect(normalizeEmail('test@example.com')).toBe('test@example.com')
    })
  })
})
