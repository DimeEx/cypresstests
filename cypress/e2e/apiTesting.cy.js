/// <reference types="cypress" />

describe('Using Intercept method', () => {
  beforeEach(() => {
    cy.intercept('GET', 'https://conduit-api.bondaracademy.com/api/tags', {
      // cy.intercept(
      //   { method: 'Get', path: 'tags' },
      //   {
      fixture: 'popularTags.json',
    });
    cy.loginToApp();
  });

  it.only('Verify correct request and response', () => {
    cy.intercept(
      'POST',
      'https://conduit-api.bondaracademy.com/api/articles/'
    ).as('postArticle');

    cy.get('a[href="/editor"]').click();
    cy.get('[placeholder="Article Title"]').type('Article about Cypress');
    cy.get('[formcontrolname="description"]').type(
      'This article is about how good is Cypress'
    );
    cy.get('[formcontrolname="body"]').type(
      'With Cypress, you can easily create tests for your modern web applications, debug them visually, and automatically run them in your continuous integration builds.'
    );
    cy.get('[placeholder="Enter tags"]').type('automation');

    cy.get('button').click();

    cy.wait('@postArticle', { timeout: 20000 }).then((res) => {
      console.log(res);
      expect(res.response.statusCode).to.be.equal(201);
      expect(res.request.body.article.body).to.contain(
        'With Cypress, you can easily create tests for your modern web applications'
      );
      expect(res.response.body.article.description).to.equal(
        'This article is about how good is Cypress'
      );
      expect(res.response.body.article.tagList[0]).to.be.equal('automation');
    });
  });
  it('Verify popular Tags', () => {
    cy.get('.tag-list')
      .should('contain', 'Cypress')
      .and('contain', 'IWEC')
      .and('contain', 'Automation');
  });

  it('Verify global feeds likes count', () => {
    cy.intercept('GET', 'https://conduit-api.bondaracademy.com/api/articles*', {
      fixture: 'articles.json',
    });

    cy.contains('Global Feed').click();
    cy.get('app-article-list button').then((like) => {
      expect(like[0]).to.contain('1');
      expect(like[1]).to.contain('5');
    });
    cy.fixture('articles.json').then((file) => {
      const slugID = file.articles[1].slug;
      file.articles[1].favoritesCount = 6;
      cy.intercept(
        'POST',
        'https://conduit-api.bondaracademy.com/api/articles/' +
          slugID +
          '/favorite',
        file
      );
    });
    cy.get('app-article-list button').eq(1).click().should('contain', '6');
  });
  it('Make an API request to create an article, perform the deletion through UI, and verify with another API call', () => {
    const userData = {
      user: {
        email: 'dime@dime.com',
        password: '123456',
      },
    };

    const bodyRequest = {
      article: {
        title: 'Article 7',
        description: 'API requests in Cypress',
        body: 'Cypress is a next generation front end testing tool built for the modern web.',
        tagList: ['api2'],
      },
    };
    cy.request(
      'POST',
      'https://conduit-api.bondaracademy.com/api/users/login',
      userData
    )
      .its('body')
      .then((body) => {
        const token = body.user.token;
        cy.request({
          method: 'POST',
          url: 'https://conduit-api.bondaracademy.com/api/articles/',
          headers: {
            Authorization: 'Token ' + token,
          },
          body: bodyRequest,
        }).then((res) => {
          expect(res.status).to.equal(201);
        });

        cy.intercept(
          'GET',
          'https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0'
        ).as('globalFeed');

        cy.contains('Global Feed').click();
        cy.wait('@globalFeed').then(() => {
          cy.get('app-article-preview').should('be.visible');
          cy.get('.article-preview').first({ timeout: 10000 }).click();
          cy.get('.banner').contains('Delete Article').click();
        });

        cy.request({
          method: 'GET',
          url: 'https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0',
          headers: {
            Authorization: 'Token ' + token,
          },
        })
          .its('body')
          .then((body) => {
            expect(body.articles[0].title).to.not.equal(
              bodyRequest.article.title
            );
          });
      });
  });
});
