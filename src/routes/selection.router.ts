import { Router } from "express"
import { SelectionController } from "../controllers/selection.controller"

export const selectionRouter = () => {

    const router = Router()
    const selectionController = new SelectionController()

    router.get("/", selectionController.randomWords)

    return router
}