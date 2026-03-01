// const conn = require('../mariadb');
const mariadb = require('mysql2/promise');
const {StatusCodes} = require('http-status-codes');

// 주문하기
// 1. 배송 정보 등록
// 2. 해당 배송 정보를 주문 테이블에 등록
const order = async (req, res) => {
    const conn = await mariadb.createConnection({
        host : '127.0.0.1',
        user : 'root',
        password : 'root',
        database : 'Bookshop',   
        dateStrings : true
    })
    // items, delivery는 JSON 객체로
    const {items, delivery, totalQuantity, totalPrice, userId, firstBookTitle} = req.body;
    
    // delivery 값 생성 후 반환된 results 값에서 insertId를 넣어줌!
    // 배송 정보를 주문 테이블에 등록
    // delivery 값 추가
    let sql = 'INSERT INTO delivery (address, receiver, contact) VALUES (?, ?, ?)';
    let values = [delivery.address, delivery.receiver, delivery.contact];

    // query 확인 시 sql, values 매개변수 2개밖에 안받는다! -> err, results 값은 [results] 배열에 담아준다!
    let [results] = await conn.query(sql, values);
    let delivery_id = results.insertId;
    
    console.log('값 체크용', userId, delivery_id)
    sql = `INSERT INTO orders (book_title, total_quantity, total_price, user_id, delivery_id)
            VALUES (?, ?, ?, ?, ?)`;
    values = [firstBookTitle, totalQuantity, totalPrice, userId, delivery_id];
    [results] = await conn.query(sql, values);
    let order_id = results.insertId;

    console.log()
    // 장바구니에서 삭제할 아이디 && 구매할 책 id 조회
    sql = `SELECT book_id, quantity FROM cartItems WHERE id IN (?)`;
    let [orderItems, fields] = await conn.query(sql, [items]);

    // console.log('orderItems rows, fields', rows, fields)
    //orderedBook 테이블 삽입
    // book_id는 items에서 받아오기 -> items는 배열! 요소 하나씩 꺼내서(for-each) values를 하나씩 만들기
    sql = `INSERT INTO orderedBook (order_id, book_id, quantity) VALUES ?`;

    values = [];
    orderItems.forEach((item) => {
        // console.log(item)
        values.push([order_id, item.book_id, item.quantity]);
        // console.log(values)
    })
    console.log('orderItems', values, orderItems)
    // results가 배열하나가 아닌 여러개의 값이 들어옴 [results, ___]
    results = await conn.query(sql, [values])
    // 구매 후 장바구니에서 삭제
    let result = await deleteCartItems(conn, items);
    return res.status(StatusCodes.OK).json(result);
}

const deleteCartItems = async (conn, items) => {
    let sql = `DELETE FROM cartItems WHERE id IN (?)`;

    let result = await conn.query(sql, [items]);
    return result;
}

// 주문 목록 조회
const getOrders = async (req, res) => {
    const conn = await mariadb.createConnection({
        host : '127.0.0.1',
        user : 'root',
        password : 'root',
        database : 'Bookshop',   
        dateStrings : true
    });

    let sql = `SELECT orders.id, created_at, address, receiver, contact, book_title, total_quantity, total_price
                FROM orders LEFT JOIN delivery
                ON orders.delivery_id = delivery.id`;
    let [rows, fields] = await conn.query(sql); 
    return res.status(StatusCodes.OK).json(rows);
}

// 주문 상세 조회
const getOrderDetail = async (req, res) => {
    const {id} = req.params;
    const conn = await mariadb.createConnection({
        host : '127.0.0.1',
        user : 'root',
        password : 'root',
        database : 'Bookshop',   
        dateStrings : true
    });

    let sql = `SELECT book_id, title, author, price, quantity
                FROM orderedBook LEFT JOIN books
                ON orderedBook.book_id = books.id
                WHERE order_id=?`;
    let [rows, fields] = await conn.query(sql, id); 
    return res.status(StatusCodes.OK).json(rows);
}



module.exports = {
    order,
    getOrders,
    getOrderDetail
}