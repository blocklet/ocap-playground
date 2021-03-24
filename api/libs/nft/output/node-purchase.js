module.exports = {
  type: 'vc',
  value: {
    '@context': 'https://schema.arcblock.io/v0.1/context.jsonld',
    id: '{{input.id}}',
    type: ['VerifiableCredential', 'NodePurchaseCredential'],
    issuer: {
      id: '{{ctx.issuer.id}}',
      pk: '{{ctx.issuer.pk}}',
      name: '{{ctx.issuer.name}}',
    },
    issuanceDate: '{{input.issuanceDate}}',
    credentialSubject: {
      id: '{{ctx.owner}}',
      purchased: {
        type: '{{data.type}}',
        period: '{{data.period}}',
        name: '{{input.name}}',
        description: '{{input.description}}',
      },
      display: {
        type: 'url',
        content: `${process.env.BASE_URL}/api/nft/display`,
      },
    },
    credentialStatus: {
      id: 'https://launcher.arcblock.io/api/purchases/{{input.id}}/status',
      type: 'NodePurchaseStatusList2021',
    },
    proof: {
      type: '{{input.proofType}}',
      created: '{{input.issuanceDate}}',
      proofPurpose: 'assertionMethod',
      jws: '{{input.signature}}',
    },
  },
};
