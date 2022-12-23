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

function addUser(userId, fullName, phoneNumber, username, pending_file_id = null, pending_price_status = null, pending_subject_name = null, pending_file_price = null) {
    try {
        Users.create({
            userId,
            fullName,
            phoneNumber,
            username,
            pending_file_id,
            pending_price_status,
            pending_subject_name,
            pending_file_price,
        }, {
            logging: false
        }, )
    } catch (error) {
        console.log(error);
    }
}

function getAllUsers() {
    try {
        const users = Users.findAll({
            raw: true,
        });

        return users;
    } catch (error) {
        console.log(error);
    }
}


async function findUser(userId) {
    try {
        let user = await Users.findOne({
            logging: false,
            where: {
                userId
            },
            raw: true
        });
        return user;
    } catch (error) {
        console.log(error);
    }
}

async function changeUserName(userId, fullName) {
    try {
        const result = await Users.update({
            fullName
        }, {
            where: {
                userId
            },
            logging: false
        }, )

        return 1
    } catch (err) {
        console.log(err)
    }
}

async function updatePendingFile(userId, pending_file_id) {
    try {
        const result = await Users.update({
            pending_file_id
        }, {
            where: {
                userId
            },
            logging: false
        })
        return result
    } catch (error) {
        console.log(err);
    }
}

async function updatePendingPriceStatus(userId, pending_price_status) {
    try {
        const result = await Users.update({
            pending_price_status
        }, {
            where: {
                userId
            },
            logging: false
        })
        return result
    } catch (error) {
        console.log(err);
    }
}

async function updatePendingSubjectName(userId, pending_subject_name) {
    try {
        const result = await Users.update({
            pending_subject_name
        }, {
            where: {
                userId
            },
            logging: false
        })
        return result
    } catch (error) {
        console.log(error);
    }
}

async function updatePendingFilePrice(userId, pending_file_price) {
    try {
        const result = await Users.update({
            pending_file_price
        }, {
            where: {
                userId
            },
            logging: false
        })
        return result
    } catch (error) {
        console.log(error);
    }
}
module.exports = {
    addUser,
    findUser,
    getAllUsers,
    changeUserName,
    updatePendingFile,
    updatePendingPriceStatus,
    updatePendingSubjectName,
    updatePendingFilePrice,
}