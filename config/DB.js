import { Sequelize } from "sequelize";


const db = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQLUSER,
  process.env.MYSQL_ROOT_PASSWORD,
  {
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT,
    dialect: "mysql",
  }
);

export default db;

// mysql -h shuttle.proxy.rlwy.net -u root -p --port 33397 --protocol=TCP railway
// xniegZhNwDLRwDeQbCIXFoRPiytqVRIG