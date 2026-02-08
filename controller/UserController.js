const conn = require('../mariadb');
const {StatusCodes} = require('http-status-codes');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const crypto = require('crypto'); // 암호화 모듈
dotenv.config();

// 회원가입 시 비밀번호 암호화 => 암호화된 비밀번호와 salt값 같이 저장
const join = (req, res) => {
	const {email, password} = req.body  
   
	let sql = 'INSERT INTO users (email, password, salt) VALUES (?, ?, ?)';
	
    // 비밀번호 암호화
    const salt = crypto.randomBytes(10).toString('base64'); // hash
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64')
    
    let values = [email, hashPassword, salt];

	conn.query(sql, values,
		(err, results) => {
			if(err) {
				// BAD REQUEST
				return res.status(StatusCodes.BAD_REQUEST).end();
			}
			return res.status(StatusCodes.CREATED).json(results);
		}
	)
};

// 로그인 시 이메일&비밀번호 받아서 -> salt값 꺼내서 비밀번호 암호화 -> 디비 비밀번호랑 비교
const login = (req, res) => {
    const {email, password} = req.body
    let sql = 'SELECT * FROM users WHERE email = ?'
    conn.query(sql, email,
        (err, results) => {
            if(err) {
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
            const loginUser = results[0];

            // salt값 꺼내서 비밀번호 암호화
            const hashPassword = crypto.pbkdf2Sync(password, loginUser.salt, 10000, 10, 'sha512').toString('base64')
            // 재암호화 한 비밀번호화 DB 비밀번호 비교
            if(loginUser && loginUser.password == hashPassword) {
                // 토큰 발행
                const token = jwt.sign({
                    email : loginUser.email
                }, process.envPRIVATE_KEY, {
                    expiresIn : '5m',
                    issuer : 'yanghee'
                });
                // 토큰 쿠키에 담기
                res.cookie('token', token, {
                    httpOnly : true
                });
                return res.status(StatusCodes);
      } else {
        return res.status(StatusCodes.UNAUTHORIZED).json(results);
      }
    } 
  )
}

const passwordResetRequest = (req, res) => {
    const {email} = req.body

    let sql = 'SELECT * FROM WHERE email = ?'
    conn.query(sql, email,
        (err, results) => {
            if(err) {
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
            // 이메일로 유저 찾기
            const user = results[0];
            // 유저가 있으면
            if (user) {
                return res.status(StatusCodes.OK).json({
                    email : email
                });
            } else {
                return res.status(StatusCodes.UNAUTHORIZED).end();
            }
        }
    )
}

const passwordReset = (req, res) => {
    const {password, email} = req.body

    let sql = 'UPDATE users SET password = ?, salt = ? WHERE email= ?';
    
    const salt = crypto.randomBytes(10).toString('base64'); // hash
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64')
 
    let values = [hashPassword, salt, email];
    conn.query(sql, values, 
        (err, results) => {
            if(err) {
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

            if(results.affectedRows == 0){
                return res.status(StatusCodes.BAD_REQUEST).end();
            } else {
                return res.status(StatusCodes.OK).json(results);
       
            }
        }
    )
}

module.exports = {join, login, passwordResetRequest, passwordReset}