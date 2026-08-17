# Feature: Recevoir une notification d'usager

## Rule: La Coop ne tient à jour que les usagers qu'elle suit

### Scenario: Usager rattaché à un bénéficiaire

* Given un usager notifié rattaché à un bénéficiaire
* When RDV Service Public notifie la mise à jour de l’usager sous le nom "Durand"
* Then la notification usager est traitée
* And l’usager notifié se nomme "Durand"

### Scenario: Usager qu'aucun bénéficiaire ne suit

* Given un usager notifié rattaché à aucun bénéficiaire
* When RDV Service Public notifie la mise à jour de l’usager sous le nom "Durand"
* Then la notification usager est ignorée pour la raison "usagerNonSuivi"
* And l’usager notifié se nomme "Dupont"

### Scenario: Création annoncée

* Given un usager notifié rattaché à un bénéficiaire
* When RDV Service Public notifie la création de l’usager
* Then la notification usager est ignorée pour la raison "creationDeferee"

## Rule: Un effacement chez RDV Service Public anonymise les fiches qui en descendent

### Scenario: Usager supprimé

* Given un usager notifié rattaché à un bénéficiaire
* When RDV Service Public notifie la suppression de l’usager
* Then la notification usager est traitée
* And le bénéficiaire rattaché est anonymisé et supprimé
* And l’usager notifié n’existe plus
* And le compteur de bénéficiaires du médiateur a diminué de 1
