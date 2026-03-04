const decodeJwt = require('../auth'); // 인증 모듈
const conn = require('../mariadb');
const {StatusCodes} = require('http-status-codes');
const jwt = require('jsonwebtoken');

// 장바구니 담기
const addCart = (req, res) => {
  	const {book_id, quantity } = req.body;
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

		let sql = `INSERT INTO cartItems (book_id, quantity, user_id) VALUES (?, ?, ?)`;
		const values = [book_id, quantity, authorization.id];
		conn.query(sql, values,
			(err, results) => {
				if(err) {
					console.log(err)
					return res.status(StatusCodes.BAD_REQUEST).end();
				}
				return res.status(StatusCodes.OK).json(results);
			}
		)
	}
};

// 장바구니 아이템 목록 조회
const getCart = (req, res) => {
	const selected = req.body?.selected;

	let authorization = decodeJwt(req, res);
	// authorization의 형태가 jwt.TokenExpiredError 처럼 생겼니??
	if(authorization instanceof jwt.TokenExpiredError){
		return res.status(StatusCodes.UNAUTHORIZED).json({
			"message":"로그인 세션이 만료되었습니다. 다시 로그인하세요."
		})
	} else if(authorization instanceof jwt.JsonWebTokenError) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			"message":"잘못된 토큰입니다."
		})
	}else {
		// 전체 장바구니 보기
		let sql = `SELECT cartItems.id, book_id, title, summary, quantity, price
					FROM cartItems LEFT JOIN books
					ON cartItems.book_id = books.id
					WHERE user_id=?`;
		let values = [authorization.id]
		console.log(selected)
		if(selected){        // 주문서 작성 시 선택한 장바구니 목록 조회
			sql +=  ` AND cartItems.id IN (?)`;
			values.push(selected)
		} 
		console.log(sql, values)
		conn.query(sql, values,
			(err, results) => {
				if(err) {
					return res.status(StatusCodes.BAD_REQUEST).end();
				}
				return res.status(StatusCodes.OK).json(results);
			}
		)
	}


}

// 장바구니 아이템 삭제
const removeCart = (req, res) => {
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
	
		// cartItemID
		const cartItemId =req.params.id;

		let sql = `DELETE FROM cartItems WHERE id=?`
		conn.query(sql, cartItemId,
			(err, results) => {
				if(err){
					return res.status(StatusCodes.BAD_REQUEST).end();
				}
				return res.status(StatusCodes.OK).json(results);
			}
		)
	}

}




module.exports = {
  addCart,
  getCart,
  removeCart
}