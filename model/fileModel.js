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


 const Files = sequelize.define("files", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    chat_id: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    file_id: {
        type: DataTypes.STRING,
        allowNUll: false
    },
    text: {
        type: DataTypes.STRING,
        allowNUll: true   
    },
    subjectName: {
        type: DataTypes.STRING,
        allowNUll: false
    },
    price_file: {
        type: DataTypes.STRING,
        allowNUll: false
    }
}, {
    timestamps: false,
 });

 sequelize.sync().then(() => {
    console.log('Users table created successfully!');
 }).catch((error) => {
    console.error('Unable to create table : ', error);
 });