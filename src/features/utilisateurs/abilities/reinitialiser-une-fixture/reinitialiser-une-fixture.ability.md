# Fonctionnalité: Réinitialiser une fixture

> L'administration remet un compte de test dans son état d'origine après
> l'avoir parcouru. Un compte réel ne se réinitialise jamais.

## Règle: Seul un compte de test se réinitialise

### Scénario: Un compte réel ne se réinitialise pas

* Étant donné un compte réel à réinitialiser
* Quand ce compte est réinitialisé
* Alors la réinitialisation échoue avec l'erreur "CompteNonFixture"

### Scénario: Un compte marqué de test sans état d'origine ne se réinitialise pas

* Étant donné un compte marqué de test absent des fixtures à réinitialiser
* Quand ce compte est réinitialisé
* Alors la réinitialisation échoue avec l'erreur "CompteNonFixture"
