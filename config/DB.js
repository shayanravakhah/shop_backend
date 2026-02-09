import { Sequelize } from "sequelize";


const db = new Sequelize(process.env.MYSQL_PUBLIC_URL, {
  dialect: "mysql",
  dialectOptions: {
    ssl: { rejectUnauthorized: false }
  },
  logging: false
});

export default db;
