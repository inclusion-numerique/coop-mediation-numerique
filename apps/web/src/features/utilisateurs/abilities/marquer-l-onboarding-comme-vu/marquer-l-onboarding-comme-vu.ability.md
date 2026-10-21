# Feature: Marquer l'onboarding comme vu

> La première visite présente la Coop ; une fois parcourue, elle ne revient
> plus. La date retenue est celle de la première fois.

## Rule: La présentation vue une fois ne revient pas

### Scenario: Marquer la présentation comme vue

* Given un compte qui n'a jamais vu la présentation
* When il marque la présentation comme vue le 21/10/2026
* Then la présentation est vue depuis le 21/10/2026

### Scenario: Revoir la présentation ne change pas la date

* Given un compte qui a vu la présentation le 01/09/2026
* When il marque la présentation comme vue le 21/10/2026
* Then la présentation est vue depuis le 01/09/2026
