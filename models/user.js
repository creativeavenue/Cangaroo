// Requiring bcrypt for password hashing.
// Using the bcryptjs version - regular bcrypt module sometimes causes errors on Windows machines
const bcrypt = require('bcryptjs');
// Creating our User model
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    // The email cannot be null, and must be a proper email before creation
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
      primaryKey: true,
    },
    // The password cannot be null
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // User type must be admin, vendor, donor or client
    user_type: {
      type: DataTypes.ENUM({
        values: ['admin', 'vendor', 'donor', 'client'],
      }),
    },
  });

  // // Add UserEmail foreign key to Donation model - one to many
  User.associate = (models) => {
    User.hasMany(models.Donation, {
      foreignKey: {
        allowNull: false,
      },
    });
    User.hasMany(models.Assist, {
      foreignKey: {
        allowNull: false,
      },
    });
  };

  // Creating a custom method for our User model. This will check if an unhashed password
  // entered by the user can be compared to the hashed password stored in our database
  User.prototype.validPassword = function (password) { // eslint-disable-line
    return bcrypt.compareSync(password, this.password);
  };

  // Hooks are automatic methods that run during various phases of the User Model lifecycle
  // In this case, before a User is created, we will automatically hash their password
  User.addHook('beforeCreate', (user) => {
    /* eslint-disable no-param-reassign */
    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
    /* eslint-enable no-param-reassign */
  });
  return User;
};
