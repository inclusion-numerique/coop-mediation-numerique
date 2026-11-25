# Fonctionnalité: Valider son inscription

## Règle: Valider pose la date de validation et accepte les CGU si besoin

### Scénario: Un médiateur en cours valide son inscription

* Étant donné mon profil d’inscription est "Mediateur"
* Et un compte médiateur existe pour mon inscription
* Quand je valide mon inscription
* Alors mon inscription est validée

### Scénario: Valider accepte les CGU quand elles ne l’avaient pas encore été (flow Dataspace)

* Étant donné mon profil d’inscription est "ConseillerNumerique"
* Et un compte médiateur existe pour mon inscription
* Et je n’ai pas encore accepté les CGU
* Quand je valide mon inscription
* Alors mon inscription est validée
* Et mes CGU sont acceptées

## Règle: Une inscription sans compte de rôle ne se valide pas

### Scénario: Un profil posé sans compte de rôle ne peut pas valider

* Étant donné mon profil d’inscription est "Mediateur"
* Quand je valide mon inscription
* Alors la validation est refusée car aucun compte de rôle n’existe
* Et mon inscription n’est pas validée

## Règle: Une inscription déjà validée ne se re-valide pas

### Scénario: Valider une inscription déjà validée

* Étant donné mon profil d’inscription est "Mediateur"
* Et mon inscription est déjà validée
* Quand je valide mon inscription
* Alors la validation est refusée car l’inscription est déjà validée
