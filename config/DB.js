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

// const db = new Sequelize(process.env.MYSQL_PUBLIC_URL, {
//   dialect: "mysql",
//   dialectOptions: {
//     ssl: { rejectUnauthorized: false }
//   },
//   logging: false
// });

export default db;
