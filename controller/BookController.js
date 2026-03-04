const conn = require('../mariadb');
const {StatusCodes} = require('http-status-codes');
const decodeJwt = require('../auth');
const jwt = require('jsonwebtoken')

const allBooks = (req, res) => {
    let allBooksRes = {};


    // 카테고리 아이디가 있으면?
    // limit(page당 도서 수), current_page(현재 페이지 위치)은 프론트엔드에서 전달해줌 URL
    // offset => (currnet_page - 1) * limit
    let {category_id, new_books, limit, currentPage } = req.query;
    
    let offset = limit * (currentPage - 1);

    let sql = 'SELECT SQL_CALC_FOUND_ROWS *, (SELECT count(*) FROM likes WHERE liked_book_id=books.id) AS likes FROM books';
    let values = []
    // 카테고리 선택이 되어있는지 신간인지에 따라서 다른 sql 저장
    if(category_id && new_books) {
        sql += ' WHERE category_id = ? AND pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 4 YEAR) AND NOW()';
        values = [category_id];
    }else if(category_id){
        sql += ' WHERE category_id = ?';
        values = [category_id]
    }else if(new_books){
        sql += ' WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 4 YEAR) AND NOW()';
    }
    
    sql += ' LIMIT ? OFFSET ?';
    values.push(parseInt(limit), offset)

    // 카테고리별 신간 조회
    conn.query(sql, values,
        (err, results) => {
            if(err) {
                // return res.status(StatusCodes.BAD_REQUEST).end();
            }
            console.log(sql, values, results)
            if(results.length){
                allBooksRes.books = results;
                // return res.status(StatusCodes.OK).json(results);
            } else {
                return res.status(StatusCodes.NOT_FOUND).end();
            }
        }
    )

    sql = 'SELECT found_rows()'
    conn.query(sql,
        (err, results) => {
            if(err) {
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
            let pagination = {};
            pagination.currentPage = parseInt(currentPage);
            pagination.totalCount = results[0]["found_rows()"]
            allBooksRes.pagination=pagination;
            return res.status(StatusCodes.OK).json(allBooksRes);
        }
    )


};

const bookDetail = (req, res) => {
    // 로그인 상태가 아니면 liked 빼고
    // 로그인 상태면 ? liked 추가해서
       let authorization = decodeJwt(req, res);
	if(authorization instanceof jwt.TokenExpiredError){
		return res.status(StatusCodes.UNAUTHORIZED).json({
			"message":"로그인 세션이 만료되었습니다. 다시 로그인하세요."
		})
	} else if(authorization instanceof jwt.JsonWebTokenError) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			"message":"잘못된 토큰입니다."
		})
        // 토큰이 없을 떄 좋아요 삭제!
	} else if(authorization instanceof ReferenceError){
        let book_id = req.params.id;
        // let {user_id} = req.body;
        
        let sql = `SELECT *,
                        (SELECT count(*) FROM likes WHERE liked_book_id=books.id) AS likes
                    FROM books 
                    LEFT JOIN category
                    ON books.category_id = category.category_id
                    WHERE books.id=?;`
        let values = [book_id];
        conn.query(sql, values,
            (err, results) => {
                if(err) {
                    return res.status(StatusCodes.BAD_REQUEST).end();
                }

                if(results[0]){
                    return res.status(StatusCodes.OK).json(results[0]);
                } else {
                    return res.status(StatusCodes.NOT_FOUND).end();
                }
            }
        )

    } else{
        let book_id = req.params.id;
        // let {user_id} = req.body;
        
        let sql = `SELECT *,
                        (SELECT count(*) FROM likes WHERE liked_book_id=books.id) AS likes,
                        (SELECT EXISTS (SELECT * FROM likes WHERE user_id=? AND liked_book_id=?)) AS liked
                    FROM books 
                    LEFT JOIN category
                    ON books.category_id = category.category_id
                    WHERE books.id=?;`

        const values = [authorization.id, book_id, book_id]
        conn.query(sql, values,
            (err, results) => {
                if(err) {
                    return res.status(StatusCodes.BAD_REQUEST).end();
                }

                if(results[0]){
                    return res.status(StatusCodes.OK).json(results[0]);
                } else {
                    return res.status(StatusCodes.NOT_FOUND).end();
                }
            }
        )
    }
};



module.exports = {
  allBooks,
  bookDetail,
}