# Feature: Valider son inscription

## Rule: Valider pose la date de validation et accepte les CGU si besoin

### Scenario: Un médiateur en cours valide son inscription

* Given mon profil d’inscription est "Mediateur"
* And un compte médiateur existe pour mon inscription
* When je valide mon inscription
* Then mon inscription est validée

### Scenario: Valider accepte les CGU quand elles ne l’avaient pas encore été (flow Dataspace)

* Given mon profil d’inscription est "ConseillerNumerique"
* And un compte médiateur existe pour mon inscription
* And je n’ai pas encore accepté les CGU
* When je valide mon inscription
* Then mon inscription est validée
* And mes CGU sont acceptées

## Rule: Une inscription sans compte de rôle ne se valide pas

### Scenario: Un profil posé sans compte de rôle ne peut pas valider

* Given mon profil d’inscription est "Mediateur"
* When je valide mon inscription
* Then la validation est refusée car aucun compte de rôle n’existe
* And mon inscription n’est pas validée

## Rule: Une inscription déjà validée ne se re-valide pas

### Scenario: Valider une inscription déjà validée

* Given mon profil d’inscription est "Mediateur"
* And mon inscription est déjà validée
* When je valide mon inscription
* Then la validation est refusée car l’inscription est déjà validée
