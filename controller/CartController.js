const conn = require('../mariadb');
const {StatusCodes} = require('http-status-codes');

// 장바구니 담기
const addCart = (req, res) => {
  	const {book_id, quantity, user_id} = req.body;

  	let sql = `INSERT INTO cartItems (book_id, quantity, user_id) VALUES (?, ?, ?)`;
  	const values = [book_id, quantity, user_id];
  	conn.query(sql, values,
		(err, results) => {
			if(err) {
				console.log(err)
				return res.status(StatusCodes.BAD_REQUEST).end();
			}
			return res.status(StatusCodes.OK).json(results);
		}
  	)
};

// 장바구니 아이템 목록 조회
const getCart = (req, res) => {

}

// 장바구니 아이템 삭제
const removeCart = (req, res) => {

}

module.exports = {
  addCart,
  getCart,
  removeCart
}