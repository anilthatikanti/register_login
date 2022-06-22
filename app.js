const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "userData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => 
      console.log("Server Running at http://localhost.com:3000/");
    );
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//REGISTRATION

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashPassword = await bcrypt.hash(password, 10);
  const getUserQuery = `
    SELECT 
        *
    FROM 
      user
    WHERE username = '${username}';`;
  const userDB = await db.get(getUserQuery);
  if (userDB === undefined) {
    if (password.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      createUserQuery = `
        INSERT INTO 
           user (username, name, password, gender, location)
        VALUES ('${username}','${name}','${hashPassword}','${gender}','${location}';`;
      await db.run(createUserQuery);
      response.status(200);
      response.send("User created successfully");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

//login

app.post("/login", async (request, response) => {
  const { username,password} = request.body;
  const getUserQuery = `
    SELECT 
        *
    FROM 
      user
    WHERE username = '${username}';`;
    const DbUser = await db.get(getUserQuery);
    if(DbUser === undefined){
        response.status(400);
        response.send("Invalid user");
    }else{
        const isPassword = await bcrypt.compare(password,DbUser.password);
        if (isPassword){
            response.send("Login success!");
            response.status(200);
        }else{
            response.status(400);
            response.send("Invalid password");
        }
    }
)};

app.put("/change-password", async(request,response)=>{
    const { username,oldPassword,newPassword} = request.body;
    const getUserQuery = `
    SELECT 
        *
    FROM 
      user
    WHERE username = '${username}';`;
    const DbUser = await db.get(getUserQuery);
    if (DbUser === undefined){
        response.status(400);
        response.send("Invalid user");
    }else{
        const isPassword = await bcrypt.compare(oldPassword,DbUser.password);
        if (isPassword){
            if (newPassword.length < 5){
                response.status(400);
                response.send("Password is too short")
            }else{
            const hashPassword = await bcrypt.hash(newPassword,10)
            const changeUserQuery =`
            UPDATE user
            set password = '${hashPassword}'
            WHERE 
                username = '${username}';`;
         };
         await db.run(changeUserQuery);
         response.status(200);
         response.send("Password updated")

        }else{
            response.status(400);
            response.send("Invalid current password");
        }
    }
});

module.exports = app;
