const express = require('express');
const router = express.Router();
const conn = require('../mariadb');
router.use(express.json());
const {StatusCodes} = require('http-status-codes'); // status-codes 모듈

const {join, login, passwordResetRequest, passwordReset} = require('../controller/UserController')

// 회원가입
router.post('/join', join);

// 로그인
router.post('/login', login);

// 비밀번호 초기화 요청
router.post('/reset', passwordResetRequest);

// 비밀번호 초기화
router.put('/reset', passwordReset);


module.exports = router