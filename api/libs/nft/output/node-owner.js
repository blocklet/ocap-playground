module.exports = {
  type: 'vc',
  value: {
    '@context': 'https://schema.arcblock.io/v0.1/context.jsonld',
    id: '{{input.id}}',
    type: ['VerifiableCredential', 'NodeOwnerCredential'],
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
          url: '{{{input.nodeUrl}}}',
          urlAlt: '{{{input.nodeUrlAlt}}}',
        },
      },
      display: {
        type: 'url',
        content: `${process.env.BASE_URL}/api/nft/display`,
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
      id: 'https://launcher.arcblock.io/api/nodes/{{input.nodeId}}/status',
      type: 'NodeInstanceStatusList2021',
    },
    refreshService: {
      id: 'https://launcher.arcblock.io/api/onwership/{{input.nodeId}}/refresh',
      type: 'NodeOwnershipRefreshService2021',
    },
    proof: {
      type: '{{input.proofType}}',
      created: '{{input.issuanceDate}}',
      proofPurpose: 'assertionMethod',
      jws: '{{input.signature}}',
    },
  },
};
