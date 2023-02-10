const { Sequelize , Model , DataTypes } =require('sequelize')
const sequelize = new Sequelize('event_management_development', 'postgres', '12345678', ({
    host: 'localhost',
    port: 5433,
    dialect: 'postgres'
}))

class User extends Model {
    name
    email
    password
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
       type: DataTypes.STRING,
       allowNull: false
    }
    },{
        sequelize,
        modelName: 'User'
    });

    //User.sync({ alter: true})
    User.sync()


module.exports = sequelize.models.User
