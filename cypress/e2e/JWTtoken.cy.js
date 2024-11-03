describe('Using JWT Token', () => {
  beforeEach(() => {
    cy.loginToApp();
  });

  it.only('With JWT Token Make an API request to create an article, perform the deletion through UI, and verify with another API call', () => {
    const bodyRequest = {
      article: {
        title: 'Article 1',
        description: 'API requests in Cypress',
        body: 'Cypress is a next generation front end testing tool built for the modern web.',
        tagList: ['api'],
      },
    };
    cy.get('@token').then((token) => {
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
        cy.get('.article-preview').first({ timeout: 5000 }).click();
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

  it('With JWT Token Make an API request to create an article, perform the deletion, and verify with another API call', () => {
    const bodyRequest = {
      article: {
        title: 'Cypress',
        description: 'API requests in Cypress',
        body: 'Cypress is a next generation front end testing tool built for the modern web.',
        tagList: ['api'],
      },
    };
    cy.get('@token').then((token) => {
      cy.request({
        method: 'POST',
        url: 'https://conduit-api.bondaracademy.com/api/articles/',
        headers: {
          Authorization: 'Token ' + token,
        },
        body: bodyRequest,
      })
        .then((res) => {
          expect(res.status).to.equal(201);
        })
        .then((res) => {
          const slugID = res.body.article.slug;
          cy.request({
            method: 'GET',
            url: 'https://conduit-api.bondaracademy.com/api/articles/' + slugID,
            headers: {
              Authorization: 'Token ' + token,
            },
          }).then((res) => {
            expect(res.status).to.equal(200);
            cy.request({
              method: 'DELETE',
              url:
                'https://conduit-api.bondaracademy.com/api/articles/' + slugID,
              headers: {
                Authorization: 'Token ' + token,
              },
            }).then((del) => {
              expect(del.status).to.equal(204);
            });
          });
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

  it.skip('Should update user data', () => {
    const updateData = {
      user: {
        bio: 'My public Bio',
      },
    };
    cy.get('@token').then((token) => {
      cy.request({
        method: 'PUT',
        url: 'https://conduit-api.bondaracademy.com/api/user',
        headers: {
          Authorization: 'Token ' + token,
        },
        body: updateData,
      })
        .then((res) => {
          expect(res.status).to.equal(200);
          const userValue = res.body.user.username;
          cy.request({
            method: 'GET',
            url:
              'https://conduit-api.bondaracademy.com/api/profiles/' + userValue,
            headers: {
              Authorization: 'Token ' + token,
            },
          });
        })
        .then((res) => {
          expect(res.body.profile.username).to.equal('DimeS3');
          expect(res.body.profile.bio).to.equal(updateData.user.bio);
        });
    });
  });
});
