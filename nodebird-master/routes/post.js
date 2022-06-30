const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Hashtag, User } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

//이미지를 업로드할 uploads 폴더가 없을 때 uploads 폴더를 생성한다
try {
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads');
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

//이미지 업로드를 처리하는 라우터
router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
  console.log(req.file);
  res.json({ url: `/img/${req.file.filename}` });
});

//게시글 업로드를 처리하는 라우터
const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
  try {
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id,
    });
    //#으로 시작하는 내용이 있으면
    const hashtags = req.body.content.match(/#[^\s#]*/g);
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map(tag => {
          //Hashtag 테이블에서 이름을 찾는다.
          //이름이 없으면 이름을 만든다.
          //#을빼고 소문저로 저장한다
          return Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() },
          })
        }),
      );
      await post.addHashtags(result.map(r => r[0]));
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/:id', async (req,res,next)=>{
  try{

    await Post.destroy({where: {id:req.params.id, UserId: req.user.id}});
    res.send('Ok');
  }catch(error){
    console.error(error);
    next(error);
  }
});

router.get('/hashtag', async (req, res, next) => {
  const query = req.query.hashtag;
  if (!query) {
    return res.redirect('/');
  }
  try {
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let posts = [];
    if (hashtag) {
      posts = await hashtag.getPosts({ include: [{ model: User }] });
    }

    return res.render('main', {
      title: `${query} | NodeBird`,
      twits: posts,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.post('/:id/like', async (req,res,next)=>{
  try{
    const post = await Post.findOne({where: {id: req.params.id}});
    //req.params.id : 게시글 id
    await post.addLiker(req.user.id);
    res.send('ok');
  }catch(error){
    console.error(error);
    next(error);
  }
});

router.delete('/:id/unlike', async (req,res, next)=>{
  try{
    const post = await Post.findOne({where: {id: req.params.id}});
    //req.params.id : 게시글 id
    await post.removeLiker(req.user.id);
    res.send('ok');
  }catch(error){
    console.error(error);
    next(error);
  }
});

module.exports = router;