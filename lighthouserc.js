module.exports = {
  ci: {
    collect: {
      url: [
        'https://comics-dun.vercel.app/',
        'https://comics-dun.vercel.app/login',
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
