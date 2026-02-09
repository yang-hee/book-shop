const express = require('express');
const { allBooks, bookDetail } = require('../controller/BookController');
const router = express.Router();

router.use(express.json());


// 도서 전체 조회 + 카테고리 별 도서 조회
router.get('/', allBooks);

// 도서 개별 조회
router.get('/:id', bookDetail);



module.exports = router