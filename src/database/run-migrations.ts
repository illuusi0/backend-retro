import * as path from 'path';
import { Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';

function createSequelize(): Sequelize {
  const url = process.env.DATABASE_URL;
  if (url) {
    return new Sequelize(url, { logging: false });
  }
  return new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'retro_db',
    logging: false,
  });
}

export async function runMigrations(): Promise<void> {
  const sequelize = createSequelize();
  const migrationsDir = path.join(__dirname, '..', '..', 'migrations');

  const umzug = new Umzug({
    migrations: {
      glob: path.join(migrationsDir, '*.js'),
      resolve: ({ name, path: migrationPath, context }) => {
        if (!migrationPath) {
          throw new Error(`Migration path missing for ${name}`);
        }
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const migration = require(migrationPath) as {
          up: (qi: unknown, sq: typeof Sequelize) => Promise<void>;
          down: (qi: unknown, sq: typeof Sequelize) => Promise<void>;
        };
        return {
          name,
          up: async () =>
            migration.up(context.queryInterface, Sequelize),
          down: async () =>
            migration.down(context.queryInterface, Sequelize),
        };
      },
    },
    context: {
      queryInterface: sequelize.getQueryInterface(),
    },
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
  });

  const pending = await umzug.pending();
  if (pending.length === 0) {
    console.log('✅ Migrations: up to date');
  } else {
    console.log(`⏳ Applying ${pending.length} migration(s)...`);
    await umzug.up();
    console.log('✅ Migrations applied');
  }

  await sequelize.close();
}
