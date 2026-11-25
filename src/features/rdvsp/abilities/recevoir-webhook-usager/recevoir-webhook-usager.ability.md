# Fonctionnalité: Recevoir une notification d'usager

## Règle: La Coop ne tient à jour que les usagers qu'elle suit

### Scénario: Usager rattaché à un bénéficiaire

* Étant donné un usager notifié rattaché à un bénéficiaire
* Quand RDV Service Public notifie la mise à jour de l’usager sous le nom "Durand"
* Alors la notification usager est traitée
* Et l’usager notifié se nomme "Durand"

### Scénario: Usager qu'aucun bénéficiaire ne suit

* Étant donné un usager notifié rattaché à aucun bénéficiaire
* Quand RDV Service Public notifie la mise à jour de l’usager sous le nom "Durand"
* Alors la notification usager est ignorée pour la raison "usagerNonSuivi"
* Et l’usager notifié se nomme "Dupont"

### Scénario: Création annoncée

* Étant donné un usager notifié rattaché à un bénéficiaire
* Quand RDV Service Public notifie la création de l’usager
* Alors la notification usager est ignorée pour la raison "creationDeferee"

## Règle: Un effacement chez RDV Service Public anonymise les fiches qui en descendent

### Scénario: Usager supprimé

* Étant donné un usager notifié rattaché à un bénéficiaire
* Quand RDV Service Public notifie la suppression de l’usager
* Alors la notification usager est traitée
* Et le bénéficiaire rattaché est anonymisé et supprimé
* Et l’usager notifié n’existe plus
* Et le compteur de bénéficiaires du médiateur a diminué de 1

### Scénario: Usager supprimé dont la commune a plusieurs codes postaux

* Étant donné un usager notifié rattaché à un bénéficiaire de Nice
* Quand RDV Service Public notifie la suppression de l’usager
* Alors le bénéficiaire rattaché est anonymisé et supprimé
* Et le bénéficiaire rattaché ne garde que le code postal "06100"
