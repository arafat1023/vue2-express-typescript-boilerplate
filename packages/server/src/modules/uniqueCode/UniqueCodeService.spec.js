const UniqueIdService = require('./UniqueCodeService').default;
const { connectDatabase, disconnectDatabase } = require('../../jest.utils');

describe('unique code service spec', () => {
  beforeAll(connectDatabase);
  afterAll(disconnectDatabase);

  it('should get base62 codes sequentially for user', async () => {
    const firstCode = await UniqueIdService.getForUser();
    expect(firstCode).toHaveLength(10); // 000001 in 62 base numbering
    const secondCode = await UniqueIdService.getForUser();
    expect(secondCode).toHaveLength(10); // 000002 in 62 base numbering

    const codeSet = new Set();
    for (let i = 0; i < 10000; i++) {
      // eslint-disable-next-line no-await-in-loop
      codeSet.add(await UniqueIdService.getForUser());
    }

    expect(codeSet.size).toBe(10000);
  });
});
