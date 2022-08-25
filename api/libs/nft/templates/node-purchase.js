const joinUrl = require('url-join');

module.exports = (serviceUrl = 'https://launcher.arcblock.io') => ({
  type: 'vc',
  value: {
    '@context': 'https://schema.arcblock.io/v0.1/context.jsonld',
    id: '{{input.id}}',
    type: ['VerifiableCredential', 'PurchaseCredential', 'NFTTicket', 'NodePurchaseCredential'],
    issuer: {
      id: '{{ctx.issuer.id}}',
      pk: '{{ctx.issuer.pk}}',
      name: '{{ctx.issuer.name}}',
    },
    issuanceDate: '{{input.issuanceDate}}',
    credentialSubject: {
      id: '{{ctx.owner}}',
      purchased: {
        abtnode: {
          type: '{{data.type}}',
          period: '{{data.period}}',
          name: '{{input.name}}',
          description: '{{input.description}}',
        },
      },
      display: {
        type: 'url',
        content: joinUrl(serviceUrl, '/api/nft/display'), // accept asset-did in query param
      },
    },
    credentialStatus: {
      id: joinUrl(serviceUrl, '/api/nft/status'),
      type: 'NFTStatusList2021',
      scope: 'public',
    },
    proof: {
      type: '{{input.proofType}}',
      created: '{{input.issuanceDate}}',
      proofPurpose: 'assertionMethod',
      jws: '{{input.signature}}',
    },
  },
});
