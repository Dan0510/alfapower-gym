const mysql = require("mysql2/promise");
const { getSecret } = require("../gcp/gcpSecretManager");

let pool;

const clientPools = new Map();

async function getConnectionDB () {
  if (pool) return pool;

  const secrets = await getSecret("alfapower-gym");

  pool = mysql.createPool({
    host: secrets.host,
    user: secrets.user,
    password: secrets.password,
    database: secrets.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
     connectTimeout: 10000, 
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  });

  console.log("DB pool initialized");
  return pool;
}






module.exports = {getConnectionDB };
