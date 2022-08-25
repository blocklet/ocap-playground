const joinUrl = require('url-join');

module.exports = (serviceUrl = 'https://launcher.arcblock.io') => ({
  type: 'vc',
  value: {
    '@context': 'https://schema.arcblock.io/v0.1/context.jsonld',
    id: '{{input.id}}',
    tag: ['{{input.nodeId}}'],
    type: ['VerifiableCredential', 'OwnershipCredential', 'NFTCertificate', 'NodeOwnershipCredential'],
    issuer: {
      id: '{{ctx.issuer.id}}',
      pk: '{{ctx.issuer.pk}}',
      name: '{{ctx.issuer.name}}',
    },
    issuanceDate: '{{input.issuanceDate}}',
    expirationDate: '{{input.expirationDate}}',
    credentialSubject: {
      id: '{{ctx.owner}}',
      isOwnerOf: {
        abtnode: {
          id: '{{input.nodeId}}',
          provider: '{{input.nodeProvider}}',
        },
      },
      display: {
        type: 'url',
        content: joinUrl(serviceUrl, '/api/nft/display'), // accept asset-did in query param
      },
    },
    evidence: [
      {
        id: '{{input.purchaseId}}',
        type: ['NodePurchaseCredential'],
        verifier: '{{input.purchaseIssuerId}}',
        evidenceDocument: 'NodePurchaseCredential',
        subjectPresence: 'Digital',
        documentPresence: 'Digital',
      },
    ],
    credentialStatus: {
      id: joinUrl(serviceUrl, '/api/nft/status'),
      type: 'NFTStatusList2021',
      scope: 'public',
    },
    refreshService: {
      id: joinUrl(serviceUrl, '/api/nft/refresh/{{input.id}}'),
      type: 'NodeOwnershipRefreshService2021',
    },
    proof: {
      type: '{{input.proofType}}',
      created: '{{input.issuanceDate}}',
      proofPurpose: 'assertionMethod',
      jws: '{{input.signature}}',
    },
  },
});
