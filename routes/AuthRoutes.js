import express  from "express";
import AuthCtrl from "../controllers/AuthCtrl.js";
import auth from "../middleware/auth.js"
const router = express.Router();

router.post('/register' , AuthCtrl.register);
router.post('/activation' , AuthCtrl.activateEmail);
router.post('/login' , AuthCtrl.login);
router.post('/refresh_token' , AuthCtrl.getAccessToken);
router.post('/forgot' , AuthCtrl.forgetPassword);
router.post('/reset' ,auth , AuthCtrl.resetPassword);

export default router;
