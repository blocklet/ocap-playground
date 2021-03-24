module.exports = {
  type: 'vc',
  value: {
    '@context': 'https://schema.arcblock.io/v0.1/context.jsonld',
    id: '{{input.id}}',
    type: ['VerifiableCredential', 'BlockletPurchaseCredential'],
    issuer: {
      id: '{{ctx.issuer.id}}',
      pk: '{{ctx.issuer.pk}}',
      name: '{{ctx.issuer.name}}',
    },
    issuanceDate: '{{input.issuanceDate}}', // does not expire
    credentialSubject: {
      id: '{{ctx.owner}}',
      purchased: {
        blocklet: {
          id: '{{data.did}}',
          url: '{{{data.url}}}',
          name: '{{data.name}}',
        },
      },
      display: {
        type: 'url',
        content: `${process.env.BASE_URL}/api/nft/display`,
      },
    },
    credentialStatus: {
      id: 'https://registry.arcblock.io/api/purchase/{{input.id}}/status',
      type: 'BlockletPurchaseStatusList2021',
    },
    refreshService: {
      id: 'https://registry.arcblock.io/api/purchase/{{input.id}}/refresh',
      type: 'BlockletPurchaseRefreshService2021',
    },
    proof: {
      type: '{{input.proofType}}',
      created: '{{input.issuanceDate}}',
      proofPurpose: 'assertionMethod',
      jws: '{{input.signature}}',
    },
  },
};
