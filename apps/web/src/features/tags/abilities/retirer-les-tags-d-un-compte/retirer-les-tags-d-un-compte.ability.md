# Feature: Retirer les tags d'un compte

> Quand un compte part, ses tags partent avec lui. Un tag de coordinateur est
> pourtant un vocabulaire de travail partagé : le supprimer priverait de sens
> des comptes rendus qui ne sont pas ceux du partant. Il est donc dupliqué chez
> chaque médiateur qui l'a réellement employé, avant que l'original ne parte.

## Rule: Les tags d'un coordinateur essaiment vers ceux qui s'en servent

### Scenario: Le tag d'un coordinateur rejoint chacun de ses utilisateurs

* Given un coordinateur partant dont le tag est utilisé par 2 médiateurs
* When on retire les tags de ce coordinateur
* Then 2 copies du tag du coordinateur sont essaimées
* And chaque médiateur utilisateur possède sa copie du tag
* And les activités de chaque médiateur portent sa copie du tag
* And le tag du coordinateur partant est marqué supprimé

### Scenario: Un tag de coordinateur que personne n'utilise est simplement supprimé

* Given un coordinateur partant dont le tag est utilisé par 0 médiateur
* When on retire les tags de ce coordinateur
* Then 0 copie du tag du coordinateur est essaimée
* And le tag du coordinateur partant est marqué supprimé

## Rule: Les tags d'un médiateur partent avec lui

> Un tag personnel est le vocabulaire d'une seule personne. Le confier à son
> coordinateur lui donnerait un mot dont il n'a pas l'usage. Il est donc
> supprimé ; les liens vers les comptes rendus subsistent, l'historique reste
> lisible.

### Scenario: Le tag d'un médiateur est supprimé

* Given un médiateur partant qui a utilisé son tag dans une activité
* When on retire les tags de ce médiateur
* Then 0 copie du tag du coordinateur est essaimée
* And le tag du médiateur partant est marqué supprimé
* And son activité porte toujours ce tag
