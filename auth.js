// decodeJwt 모듈화
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const decodeJwt = (req, res) => {
  try {
    let jwtToken = req.headers["authorization"];
    console.log("jwtToken?", jwtToken);
    if (jwtToken) {
      console.log(jwtToken);
      let decodedJwt = jwt.verify(jwtToken, process.env.PRIVATE_KEY);
      return decodedJwt;
    } else {
      // 토큰이 없는 경우
      throw new ReferenceError("jwt must be provided");
    }
  } catch (err) {
    console.log(err.name);
    console.log(err.message);
    return err;
  }
};

module.exports = decodeJwt;
