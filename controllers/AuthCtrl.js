import Users from "../models/Users.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import sendEmail from "./sendEmail.js";
dotenv.config();


const AuthCtrl = {
    register: async (req, res) => {

        try {

            const { firstname, lastname, username, email, password, gender, bYear, bMonth, bDay } = req.body;

            //check  firstname 
            if (!firstname) return res.status(400).json({ message: "Please enter your first name " });
            if (!validateLength(firstname, 3, 20)) return res.status(400).json({ message: "First name must be between 3 and 20 caharcters" });

            //check lastname
            if (!lastname) return res.status(400).json({ message: "Please enter your last name " });
            if (!validateLength(lastname, 3, 20)) return res.status(400).json({ message: "last name must be between 3 and 20 caharcters" });

            //check username
            if (!username) return res.status(400).json({ message: "Please enter Your user name" });
            if (!validateLength(username, 3, 6)) return res.status(400).json({ message: "user name must be between 3 and 6 caharcters" });
            let user_name = String(username).toLowerCase().replace(/ /g, '');
            const NewUserName = await Users.findOne({ username: user_name });
            if (NewUserName) return res.status(400).json({ message: "This user name is already exists." });

            //cehck email
            if (!email) return res.status(400).json({ message: "Please enter your email " });
            if (!validateEmail(email)) return res.status(400).json({ message: "Invalid emails." });
            const user_email = await Users.findOne({ email });
            if (user_email) return res.status(400).json({ message: "This email is already exists." });

            //check password
            if (!password) return res.status(400).json({ message: "Please enter your password" });
            if (!validateLength(password, 6, 30)) return res.status(400).json({ message: "Password must be atleast 6 characters." });
            const passwordHash = await bcrypt.hash(password, 12);

            //check date
            let current_date = new Date();
            let picked_date = new Date(bYear, bMonth - 1, bDay);
            let atleast_date = new Date(1970 + 14, 0, 1);
            let higher_date = new Date(1970 + 70, 0, 1);
            if (current_date - picked_date < atleast_date) return res.status(400).json({ message: "Sorry you are under the age." });
            if (current_date - picked_date > higher_date) return res.status(400).json({ message: "This is not a valied birthday." });

            //check gender 
            if (!gender) return res.status(400).json({ message: "Please enter your gender" });

            const newUser = {
                firstname, lastname, username: user_name, email, password: passwordHash, gender, bYear, bMonth, bDay
            };

            //send email
            const activation_token = createActivationToken(newUser);
            const url = `${process.env.CLIENT_URL}/user/activation/${activation_token}`
            sendEmail(email, url, "Verify your email address", "Congratulations! You're almost set to start using Share With Me.Just click the button below to validate your email address.");

            res.json({ message: " Register Success , Please validate your email address to active your account" })

        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    activateEmail: async (req, res) => {
        try {
            const { activate_token } = req.body;
            const user = jwt.verify(activate_token, process.env.ACTIVATION_TOKEN_SECRET);

            const { firstname, lastname, username, email, password, gender, bYear, bMonth, bDay } = user;

            // const check = await Users.findOne(user._id);
            // if (check) return res.status(400).json({ message: "This account is already avtivated." });

            //save to db
            const newUser = new Users({
                firstname, lastname, username, email, password, gender, bYear, bMonth, bDay
            });
            await newUser.save();

            res.json({ message: "Account has been activated." });

        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            //check if empty
            if (!email) return res.status(400).json({ message: "Please write your Email." });
            if (!password) return res.status(400).json({ message: "Please write your Password" });

            //check email
            const user = await Users.findOne({ email });
            if (!user) return res.status(400).json({ message: "This email does not exist." });

            //check password
            const check_password = await bcrypt.compare(password, user.password);
            if (!check_password) return res.status(400).json({ message: "Password is incorrect." });

            const refresh_token = createRefreshToken({ id: user._id });
            const access_token = createAccessToken({ id: user._id });

            res.cookie('refreshtoken', refresh_token, {
                path: '/api/refresh_token',
                httpOnly: false,
                secure: false,
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            res.json({
                user,
                access_token
            });

        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    logout: async (req, res) => {
        try {
            res.clearCookie('refreshtoken', { path: '/api/refresh_token' })

            return res.json({ message: "Logged out!" });

        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    getAccessToken: async (req, res) => {
        try {
            const rf_token = req.cookies.refreshtoken
            if (!rf_token) return res.status(400).json({ message: "Please login now" })

            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, async (error, result) => {
                if (error) return res.status(400).json({ message: "Please login now." })

                const user = await Users.findById(result.id).select("-password")
                    .populate('followers following', '-password')

                if (!user) return res.status(400).json({ message: "This Account does not exist." })

                const access_token = createAccessToken({ id: result.id })

                res.json({
                    access_token,
                    user
                });

            });

        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    forgetPassword: async (req, res) => {
        try {
            const { email } = req.body;
            const user = await Users.findOne({ email });
            if (!user) return res.status(400).json({ message: "This email does not exist." });

            const access_token = createAccessToken({ id: user._id });
            const url = `${process.env.CLIENT_URL}/user/reset/${access_token}`;

            sendEmail(email, url, "Reset your password", "Click the buuton to rest your password.");

            res.json({ message: "Re-send the password, please check your email." })

        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    resetPassword: async (req, res) => {
        try {
            const { password , cr_password } = req.body;

            //check password
            if(!validateLength(password ,6 ,20)) return res.status(400).json({ message: "Password must be atleast 6 characters." });

            //check match
            if(!isMatch(password ,cr_password)) return res.status(400).json({ message: 'Password did not match' });

            const passwordHash = await bcrypt.hash(password, 12);

            await Users.findOneAndUpdate({ _id: req.user.id }, {
                password: passwordHash
            });

            res.json({ message: "Password successfully changed!" });

        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    },
};

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1, 3}\.[0-9]{1, 3}\.[0-9]{1, 3}\.[0-9]{1, 3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

const validateLength = (text, min, max) => {
    if (text.length > max || text.length < min) {
        return false;
    };
    return true;
};

const isMatch = (password, cr_password) => {
    if (password === cr_password) {
        return true
    };
    return false;
};

const createActivationToken = (payload) => {
    return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, { expiresIn: '5m' })
}

const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15d' })
}

const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
}

export default AuthCtrl;