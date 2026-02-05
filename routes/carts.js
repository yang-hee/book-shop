const express = require('express');
const router = express.Router();

router.use(express.json());

// 장바구니 담기
router.post('/', (req, res) => {

});

// 장바구니 조회
router.get('/', (req, res) => {

});

// 장바구니 삭제
router.get('/:id', (req, res) => {

});

// 장바구니 선택한 주문 예상 상품 목록 조회
// router.get('/', (req, res) => {

// });


module.exports = router