const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User, Hashtag } = require('../models');

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.followerCount = req.user ? req.user.Followers.length : 0;
  res.locals.followingCount = req.user ? req.user.Followings.length : 0;
  res.locals.followerIdList = req.user ? req.user.Followings.map(f => f.id) : [];
  next();
});

router.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile', { title: '내 정보 - NodeBird' });
});

router.get('/join', isNotLoggedIn, (req, res) => {
  res.render('join', { title: '회원가입 - NodeBird' });
});

//메인 페이지
router.get('/', async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      //가져올때 User 모델의 id와 nick도 가져오도록
      //include가 같은모델이 여러개면 as로 구분
      include: [{
        model: User,
        attributes: ['id', 'nick'],
      },
      // order: [['createdAt', 'DESC']],
      {
        model: User,
        attributes: ['id', 'nick'],
        as: 'Liker',
        through: 'Like'
      }
      ],
    });
    console.log('hello');
    res.render('main', {
      title: 'NodeBird',
      twits: posts,
    });
  } catch (err) {
    console.error(err);
    console.log(err);
    next(err);
  }
});



module.exports = router;