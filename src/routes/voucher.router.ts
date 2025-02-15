import { Router } from "express"
import { verifyRole, verifyToken } from "../middlewares/auth.middleware"
import { VoucherControoler } from "../controllers/voucher.controller"

export const voucherRouter = () => {
    const router = Router()
    const voucherController = new VoucherControoler()

    router.post("/", verifyRole, verifyToken, voucherController.createVoucher)
    router.get("/", verifyRole, verifyToken, voucherController.getVouchers)

    return router
}