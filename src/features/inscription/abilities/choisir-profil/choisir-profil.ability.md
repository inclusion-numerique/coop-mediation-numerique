# Feature: Choisir son profil d’inscription

## Rule: Choisir un profil pose le profil, accepte les CGU et garantit le compte de rôle

### Scenario: Un médiateur choisit son profil

* When je choisis le profil "Mediateur"
* Then le profil d’inscription de l’utilisateur est "Mediateur"
* And un compte médiateur existe pour l’utilisateur
* And aucun compte coordinateur n’existe pour l’utilisateur

### Scenario: Un coordinateur choisit son profil

* When je choisis le profil "Coordinateur"
* Then le profil d’inscription de l’utilisateur est "Coordinateur"
* And un compte coordinateur existe pour l’utilisateur
* And aucun compte médiateur n’existe pour l’utilisateur

## Rule: Une inscription validée ne se re-choisit pas

### Scenario: Choisir un profil alors que l'inscription est déjà validée

* Given mon inscription est déjà validée avec le profil "Mediateur"
* When je choisis le profil "Coordinateur"
* Then le choix du profil est refusé car l’inscription est déjà validée
* And le profil d’inscription de l’utilisateur est "Mediateur"
