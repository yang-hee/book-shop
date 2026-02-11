const conn = require('../mariadb');
const {StatusCodes} = require('http-status-codes');

const allBooks = (req, res) => {
    // 카테고리 아이디가 있으면?
    // limit(page당 도서 수), current_page(현재 페이지 위치)은 프론트엔드에서 전달해줌 URL
    // offset => (currnet_page - 1) * limit
    let {category_id, new_books, limit, current_page } = req.query;
    
    let offset = limit * (current_page - 1);

    let sql = 'SELECT *,  (SELECT count(*) FROM likes WHERE liked_book_id=books.id) AS likes FROM books ';
    let values = []
    // 카테고리 선택이 되어있는지 신간인지에 따라서 다른 sql 저장
    if(category_id && new_books) {
        sql += 'WHERE category_id = ? AND pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 4 YEAR) AND NOW()';
        values = [category_id];
    }else if(category_id){
        sql += 'WHERE category_id = ?';
        values = [category_id]
    }else if(new_books){
        sql += 'WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 4 YEAR) AND NOW()';
    }
    
    sql += 'LIMIT ? OFFSET ?';
    values.push(parseInt(limit), offset)

    // 카테고리별 신간 조회
    conn.query(sql, values,
        (err, results) => {
            if(err) {
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
            if(results.length){
                return res.status(StatusCodes.OK).json(results);
            } else {
                return res.status(StatusCodes.NOT_FOUND).end();
            }
        }
    )


};

const bookDetail = (req, res) => {
    let book_id = req.params.id;
    let {user_id} = req.body;
    
    let sql = `SELECT *,
                    (SELECT count(*) FROM likes WHERE liked_book_id=books.id) AS likes,
                    (SELECT EXISTS (SELECT * FROM likes WHERE user_id=? AND liked_book_id=?)) AS liked
                FROM books 
                LEFT JOIN category
                ON books.category_id = category.id
                WHERE books.id=?;`

    const values = [user_id, book_id, book_id]
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
};



module.exports = {
  allBooks,
  bookDetail,
}