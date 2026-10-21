# Feature: Réinitialiser une fixture

> L'administration remet un compte de test dans son état d'origine après
> l'avoir parcouru. Un compte réel ne se réinitialise jamais.

## Rule: Seul un compte de test se réinitialise

### Scenario: Un compte réel ne se réinitialise pas

* Given un compte réel à réinitialiser
* When ce compte est réinitialisé
* Then la réinitialisation échoue avec l'erreur "CompteNonFixture"
