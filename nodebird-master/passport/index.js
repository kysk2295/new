const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');

module.exports = () => {

    //데이터 저장
  passport.serializeUser((user, done) => {
    //세션에 사용자 id만 저장
    done(null, user.id);
  });

  //매 요청시 실행
  //사용자가 저장한 아이디를 통해 사용자 정보 객체를 불러오는 것
  passport.deserializeUser((id, done) => {
    User.findOne({
      where: { id },
      include: [{
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followers',
      }, {
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followings',
      }],
    })
      .then(user => done(null, user))
      .catch(err => done(err));
  });

  local();
  kakao();
};