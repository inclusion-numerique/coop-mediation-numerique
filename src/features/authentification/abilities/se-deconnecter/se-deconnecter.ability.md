# Feature: Se déconnecter

> Se déconnecter ferme la session de la coop sur l'appareil où l'on se trouve.
> La déconnexion auprès de ProConnect, qui la précède, n'est pas décrite ici.

## Rule: La déconnexion ferme la session de l'appareil, et elle seule

### Scenario: Une personne connectée sur deux appareils se déconnecte de l'un d'eux

* Given une personne connectée sur deux appareils
* When elle se déconnecte du premier appareil
* Then la session du premier appareil est fermée
* And la session du second appareil reste ouverte
