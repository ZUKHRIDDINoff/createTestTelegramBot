const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
    'institute_Bot',
    'root',
    'Password123!',
     {
       host: 'localhost',
       dialect: 'mysql'
    }
);
 sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
 }).catch((error) => {
    console.error('Unable to connect to the database: ', error);
 });


 const Users = sequelize.define("users", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: true
    },
    pending_file_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pending_price_status: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    pending_subject_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pending_file_price: {
      type: DataTypes.STRING,
      allowNull: true
    }
}, {
    timestamps: false,
 });

 sequelize.sync().then(() => {
    console.log('Users table created successfully!');
 }).catch((error) => {
    console.error('Unable to create table : ', error);
 });