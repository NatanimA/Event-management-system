'use strict';
const { Model} = require('sequelize')

module.exports = (sequelize,DataTypes) => {
    class Member extends Model {

        static associate(models){
            Member.belongsTo(models.User,{
                foreignKey:"userId"
            })
            Member.belongsTo(models.Event,{
                foreignKey: "eventId"
            })
        }
    }

    Member.init({
        eventId: {
            type: DataTypes.INTEGER,
            references: {
                model: {
                    tableName: 'Events',
                },
                key: 'id'
            },
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            references: {
                model: {
                    tableName: 'Users'
                },
                key: 'id'
            },
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: "Member"
    }
    )
    return Member;
};
