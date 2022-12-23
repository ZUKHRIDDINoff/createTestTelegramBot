const {
    Sequelize,
    DataTypes
} = require("sequelize");

const sequelize = new Sequelize(
    'institute_Bot',
    'root',
    'Password123!', {
        host: 'localhost',
        dialect: 'mysql'
    }
);

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
        allowNull: false
    }
}, {
    timestamps: false,
});





function addFile(chat_id, file_id, text, subjectName, price_file) {
    try {
        Files.create({
            chat_id,
            file_id,
            text,
            subjectName,
            price_file
        }, {
            logging: false
        }, )
        return 1
    } catch (error) {
        console.log(error);
    }
}

function getAllFiles() {
    try {
        const files = Files.findAll({
            raw: true,
            logging: false
        });

        return files;
    } catch (error) {
        console.log(error);
    }
}


async function findFile(subjectName) {
    try {
        let file = await Files.findOne({
            logging: false,
            where: {
                subjectName
            },
            raw: true
        });
        return file;
    } catch (error) {
        console.log(error);
    }
}

async function deleteFile(subjectName) {
    try {
        const result = Files.destroy({
            where: {
                subjectName
            },
            logging: false
        })
        return result
    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    addFile,
    getAllFiles,
    findFile,
    deleteFile,
}