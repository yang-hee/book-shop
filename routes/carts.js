const express = require('express');
const { addCart, getCart, removeCart } = require('../controller/CartController');
const router = express.Router();

router.use(express.json());

// 장바구니 담기
router.post('/', addCart);

// 장바구니 조회
router.get('/', getCart);

// 장바구니 삭제
router.get('/:id', removeCart);

// 장바구니 선택한 주문 예상 상품 목록 조회
// router.get('/', (req, res) => {

// });


module.exports = router