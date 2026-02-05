const express = require('express');
const router = express.Router();

router.use(express.json());

// 도서 전체 조회
router.get('/', (req, res) => {
    
});

// 도서 개별 조회
router.post('/:id', (req, res) => {

});

// 카테고리별 도서 전체 조회
router.post('/', (req, res) => {

});

module.exports = router