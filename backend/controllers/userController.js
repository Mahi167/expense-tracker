import User from '../models/userModel.js';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your_jwt_secret_here';
const TOKEN_EXPIRES = '24h';

export const createToken = (userId) => {
    return jwt.sign(
        { userId },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRES }
    );
};

// Register A User
export async function registerUser(req, res) {

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email"
        });
    }
    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters"
        });
    }
    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already present"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });
        const token = createToken(user._id);

        return res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}

// to Login User

export async function loginUser(req, res) {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Both fields are required"
        });
    }

    try {

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const match = await bcrypt.compare(
            password,
            user.password
        );

        if (!match) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = createToken(user._id);

        return res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}

// to get login user details
export async function getCurrentUser(req, res) {
    try{
        const user = await User.findById(req.user.id).select("name email");
        if(!user){
            return res.status(404).json({
                success : false,
                message : "User Not Found"
            })
        }
        res.json({success : true ,user})
    }
     catch(err) {
        console.log(err);
        res.status(500).json({
            success : false,
            message : "Server Error"
        })
    }
}

// update user

export async function updateProfile(req, res) {
    const {name, email} = req.body;
    if(!name || !email || !validator.isEmail(email)){
        return res.status(400).json({
            success : false,
            message : "valid email and name are required"
        })
    }
    try{
        const exists = await User.findOne({email ,_id : {$ne : req.user.id}});
        if(exists){
            return res.status(409).json({
                success : false,
                message : "email already in use"
            })
        }
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {name, email},
            {new : true, runValidators : true, select : "name email"}
        )
        res.json({
            success : true,
            user
        })
    }
     catch(err) {
        console.log(err);
        res.status(500).json({
            success : false,
            message : "Server Error"
        })
    }
}

// tochange password

export async function updatePassword(req,res) {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters"
        });
    }
    try{
        const user = await User.findById(req.user.id).select("password");
        if(!user){
            return res.status(404).json({
                success : false,
                message : "User Not found"
            })
        }
        const match = await bcrypt.compare(currentPassword, user.password);
        if(!match){
            return res.status(401).json({
                success : false,
                message : "Current Passsword is incorrect"
            })
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({
            success : true,
            message : "Password Changed"
        })
    }
     catch(err) {
        console.log(err);
        res.status(500).json({
            success : false,
            message : "Server Error"
        })
    }
}