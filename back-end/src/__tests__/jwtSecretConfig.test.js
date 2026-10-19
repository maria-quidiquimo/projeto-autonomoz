const path = require('path');
const { spawnSync } = require('child_process');

describe('JWT_SECRET configuration', () => {
  it('fails to load authentication when JWT_SECRET is missing', () => {
    const envWithoutJwtSecret = Object.fromEntries(
      Object.entries(process.env).filter(([name]) => name !== 'JWT_SECRET')
    );
    const result = spawnSync(
      process.execPath,
      [
        '-e',
        "try { require('./src/middlewares/auth'); process.exit(1); } catch (error) { console.log(error.message); }"
      ],
      {
        cwd: path.resolve(__dirname, '../..'),
        env: envWithoutJwtSecret,
        encoding: 'utf8'
      }
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('JWT_SECRET não definido no arquivo .env.');
  });
});
