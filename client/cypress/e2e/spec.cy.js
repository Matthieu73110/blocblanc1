describe('Admin Dashboard', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/');
    cy.get('.login-button').click()
    cy.get('.auth-toggle button:nth-child(2)').click()
    cy.get('.signin-form input[type=email]').type('garagiste@vroumvroum.fr');
    cy.get('.signin-form input[type=password]').type('Azerty@01');
    cy.get('.signin-form button').click();
  });

  it('should display client count', () => {
    cy.get('p').contains('Nombre de clients inscrits').should('be.visible');
  });

  it('should add a new vehicle', () => {
    cy.get('input[placeholder="Marque"]').type('Toyota');
    cy.get('input[placeholder="Modèle"]').type('Corolla');
    cy.get('input[placeholder="Année"]').type('2020');
    cy.get('button').contains('Ajouter').click();

    // cy.contains('Véhicule ajouté').should('be.visible');
    cy.get('div').contains('Toyota').should('be.visible');
  });

  it('should edit an existing vehicle', () => {
    cy.contains('Toyota').parent().find('button').contains('Modifier').click();

    cy.get('input[placeholder="Marque"]').clear().type('Honda');
    cy.get('button').contains('Mettre à jour').click();

    // cy.contains('Véhicule mis à jour').should('be.visible');
    cy.get('div').contains('Honda').should('be.visible');
  });

  it('should delete a vehicle', () => {
    cy.contains('Honda').parent().find('button').contains('Supprimer').click();

    // cy.contains('Véhicule supprimé').should('be.visible');
    cy.get('div').contains('Honda').should('not.exist');
  });
});
