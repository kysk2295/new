const Sequelize = require('sequelize');

module.exports = class Post extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      content: {
        type: Sequelize.STRING(140),
        allowNull: false,
      },
      img: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      // artistName:{
      //   type: Sequelize.STRING(40),
      //   allowNull: false,
      // },
      // productName:{
      //   type: Sequelize.STRING(40),
      //   allowNull: false,
      // },
      // link:{
      //   type: Sequelize.STRING(40),
      //   allowNull: false,
      // },
      // price:{
      //   type: Sequelize.STRING(40),
      //   allowNull: false,
      // },
      // category:{
      //   type: Sequelize.STRING(40),
      //   allowNull: false,
      // },
      // likeCnt:{
      //   type: Sequelize.INTEGER,
      //   defaultValue:0
      // },
      // tags: {
      //   type: Sequelize.STRING(40),
      //   allowNull: true
      // }
    }, {
      sequelize,
      timestamps: true,
      underscored: false,
      modelName: 'Post',
      tableName: 'posts',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    });
  }

  static associate(db) {
    //1:n
    //post모델에 userid 추가됨
    db.Post.belongsTo(db.User);
    //n:m
    //posthashtag 모델에 hashtagid 추가
    db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag' });

    //좋아요
    db.Post.belongsToMany(db.User, {through: 'Like', as: 'Liker'});
  }
};