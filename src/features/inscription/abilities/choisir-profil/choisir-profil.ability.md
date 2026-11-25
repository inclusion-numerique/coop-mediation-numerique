# Fonctionnalité: Choisir son profil d’inscription

## Règle: Choisir un profil pose le profil, accepte les CGU et garantit le compte de rôle

### Scénario: Un médiateur choisit son profil

* Quand je choisis le profil "Mediateur"
* Alors le profil d’inscription de l’utilisateur est "Mediateur"
* Et un compte médiateur existe pour l’utilisateur
* Et aucun compte coordinateur n’existe pour l’utilisateur

### Scénario: Un coordinateur choisit son profil

* Quand je choisis le profil "Coordinateur"
* Alors le profil d’inscription de l’utilisateur est "Coordinateur"
* Et un compte coordinateur existe pour l’utilisateur
* Et aucun compte médiateur n’existe pour l’utilisateur

## Règle: Une inscription validée ne se re-choisit pas

### Scénario: Choisir un profil alors que l'inscription est déjà validée

* Étant donné mon inscription est déjà validée avec le profil "Mediateur"
* Quand je choisis le profil "Coordinateur"
* Alors le choix du profil est refusé car l’inscription est déjà validée
* Et le profil d’inscription de l’utilisateur est "Mediateur"
