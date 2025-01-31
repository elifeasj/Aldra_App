import { Client, QueryResult } from 'pg';

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'aldradatabase',
  password: '1234',
  port: 5432,
});

async function updateInactiveUsers() {
  console.log('Starting inactive users update check...');
  
  try {
    await client.connect();
    console.log('Connected to database successfully');
    
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const result: QueryResult = await client.query(`
      UPDATE users 
      SET status = 'inactive'
      WHERE last_activity < $1 
      AND status = 'active'
      RETURNING id, email, last_activity;
    `, [oneYearAgo]);

    const updatedCount = result?.rowCount ?? 0;
    
    if (updatedCount > 0) {
      console.log(`Updated ${updatedCount} users to inactive status:`);
      result.rows.forEach(user => {
        console.log(`- User ID: ${user.id}, Email: ${user.email}, Last Activity: ${user.last_activity}`);
      });
    } else {
      console.log('No users needed to be marked as inactive');
    }

  } catch (error) {
    console.error('Error updating inactive users:', error);
    process.exit(1);
  } finally {
    try {
      await client.end();
      console.log('Database connection closed');
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }
}

if (require.main === module) {
  updateInactiveUsers()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export default updateInactiveUsers;
