# Feature: Détacher un compte de ses équipes

## Rule: Les tags d'un coordinateur essaiment vers ceux qui s'en servent

> Un tag est un vocabulaire de travail. Le supprimer priverait de sens des
> comptes rendus qui ne sont pas ceux du partant : il est donc dupliqué chez
> chaque médiateur qui l'a réellement employé, avant que l'original ne parte.

### Scenario: Le tag d'un coordinateur rejoint chacun de ses utilisateurs

* Given un coordinateur dont le tag est utilisé par 2 médiateurs
* When je détache ce coordinateur de ses équipes
* Then 2 tags sont essaimés
* And chaque médiateur utilisateur possède désormais le tag
* And les comptes rendus pointent vers le tag de leur médiateur
* And le tag du coordinateur est marqué supprimé

### Scenario: Un tag de coordinateur que personne n'utilise est simplement supprimé

* Given un coordinateur dont le tag est utilisé par 0 médiateur
* When je détache ce coordinateur de ses équipes
* Then 0 tag est essaimé
* And le tag du coordinateur est marqué supprimé

## Rule: Les tags d'un médiateur reviennent à son coordinateur, s'il n'y en a qu'un

### Scenario: Le tag revient au coordinateur unique

* Given un médiateur coordonné par un seul coordinateur
* When je détache ce médiateur de ses équipes
* Then 1 tag est transféré
* And le tag appartient désormais au coordinateur

### Scenario: Sans coordinateur, le tag est supprimé faute de destinataire

* Given un médiateur sans coordinateur
* When je détache ce médiateur de ses équipes
* Then 0 tag est transféré
* And le tag du médiateur est marqué supprimé

## Rule: Les invitations et les appartenances sont coupées

### Scenario: Le médiateur quitte son équipe

* Given un médiateur coordonné par un seul coordinateur
* When je détache ce médiateur de ses équipes
* Then ce médiateur n'appartient plus à aucune équipe
* And les invitations de ce médiateur ont disparu
