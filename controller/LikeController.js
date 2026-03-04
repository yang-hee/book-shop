const decodeJwt = require('../auth'); // 인증 모듈
const conn = require('../mariadb');
const {StatusCodes} = require('http-status-codes');
const jwt = require('jsonwebtoken');

// 좋아요 추가
const addLike = (req, res) => {
	
	const book_id = req.params.id;
	// 추후 토큰으로 확인
	// const {user_id} = req.body;
	let authorization = decodeJwt(req, res);
	if(authorization instanceof jwt.TokenExpiredError){
		return res.status(StatusCodes.UNAUTHORIZED).json({
			"message":"로그인 세션이 만료되었습니다. 다시 로그인하세요."
		})
	} else if(authorization instanceof jwt.JsonWebTokenError) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			"message":"잘못된 토큰입니다."
		})
	}else {

		sql = 'INSERT INTO likes (user_id, liked_book_id) VALUES (?, ?)'
		values = [authorization.id, book_id]
		conn.query(sql, values, 
			(err, results) => {
				if(err) {
					return res.status(StatusCodes.BAD_REQUEST).end();
				}
				return res.status(StatusCodes.OK).json(results);
			}
		)
	}
  
};

// 좋아요 삭제
const removeLike = (req, res) => {
	const book_id = req.params.id;
	let authorization = decodeJwt(req, res);
	if(authorization instanceof jwt.TokenExpiredError){
		return res.status(StatusCodes.UNAUTHORIZED).json({
			"message":"로그인 세션이 만료되었습니다. 다시 로그인하세요."
		})
	} else if(authorization instanceof jwt.JsonWebTokenError) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			"message":"잘못된 토큰입니다."
		})
	}else {

		sql = 'DELETE FROM likes WHERE user_id = ? AND liked_book_id = ?';
		values = [authorization.id, book_id]
		conn.query(sql, values,
			(err, results) => {
				if(err) {
					return res.statsu(StatusCodes.BAD_REQUEST).end();
				}
				return res.status(StatusCodes.OK).json(results);
			}
		)
	}
};


module.exports = {
	addLike,
	removeLike
}