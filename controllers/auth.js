const User = require("../models/user");
const bcrypt = require("bcrypt");

const generateHash = (password) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                return reject("Error on generating salt");
            }

            bcrypt.hash(password, salt, (err, hash) => {
                if (err) {
                    return reject("Error on generating hashing");
                }
                resolve(hash);
            });
        });
    });
};

const registerUser = async (req, res) => {
    const { name, surname, username, password } = req.body;

    //check if the user already exists
    const userExists = await User.findOne({ where: { username: username } });
    if (userExists) {
        return res.status(400).json({
            type: "Client error",
            field: "username",
            msg: "Username already exists",
        });
    }

    //generate hashed password
    try {
        var hashedPassword = await generateHash(password);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            type: "Server error",
            msg: "Error on generating hash for password",
        });
    }

    //create the user
    const user = await User.create({
        name: name,
        surname: surname,
        username: username,
        password: hashedPassword,
    });

    return res.status(200).json({ username: user.username });
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        //ensure that the user exists
        const user = await User.findOne({ where: { username: username } });
        if (!user) {
            return res.status(400).json({
                type: "Client Error",
                msg: "Account does not exists",
            });
        }

        //check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                type: "Client Error",
                msg: "Invalid username or password",
            });
        }

        //create a session id for the user
        req.session.userId = user.id;

        return res.redirect(`/dashboard/${user.id}`);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            type: "Server error",
            msg: "Error on processing the request",
        });
    }
};

module.exports = { registerUser, loginUser };
