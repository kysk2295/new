const express = require('express');

const { isLoggedIn } = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

router.post('/:id/follow', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (user) {
      await user.addFollowing(parseInt(req.params.id, 10));
      res.send('success');
    } else {
      res.status(404).send('no user');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});
//팔로우 끊기
router.post('/:id/unfollow', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (user) {
      //A.getB : 관계있는 로우 조회
      //A.addB : 관계 생성
      //A.setB : 관계 수정
      //A.removeB : 관계 제거
      await user.removeFollowing(parseInt(req.params.id, 10));
      res.send('success');
    } else {
      res.status(404).send('no user');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});
//프로필 수정
router.post('/profile', async (req,res, next)=>{
  try{
    await User.update({nick: req.body.nick},{
      where: {id: req.user.id}
    });
    res.redirect('/profile');
  }catch(error){
    console.error(error);
    next(error);
  }

})

module.exports = router;