const {Sequelize, DataTypes} = require('sequelize')
const sequelize = new Sequelize('event_management_development', 'postgres', '12345678', ({
    host: 'localhost',
    port: 5433,
    dialect: 'postgres'
}))

const User = sequelize.define('User',{
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
});

const Event = sequelize.define('Event',{
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
    }
});



User.hasMany(Event,{
    foreignKey:'user_id',
    onDelete: 'CASCADE'
})

Event.belongsTo(User,{foreignKey:'user_id'})

User.sync()
Event.sync()

const Invite = sequelize.define('Invite', {
    event_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    owner: {
        type: DataTypes.STRING,
        allowNull: false
    }
})


User.hasMany(Invite, {
    onDelete: 'CASCADE',
    foreignKey: 'user_id'
})

Invite.belongsTo(User, { foreignKey: 'user_id' })
Invite.sync()


const Member = sequelize.define('Member',{
    user_id:{
        type:DataTypes.BIGINT,
        references:{
            model:User,
            key:'id'
        }
    },
    event_id: {
        type: DataTypes.BIGINT,
        references: {
            model: Event,
            key: 'id'
        }
    }
})

User.belongsToMany(Event,{
    foreignKey:'event_id',
    through:Member
})


Event.belongsToMany(User, {
    foreignKey:'user_id',
    through: Member
})

Member.sync()



module.exports.User = User
module.exports.Event = Event
module.exports.Member = Member
module.exports.Invite = Invite
