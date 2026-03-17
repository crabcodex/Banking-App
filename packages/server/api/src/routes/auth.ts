import { Router } from 'express';
import {RegisterCustomerCommand} from "@bank/identity"





export function authRoutes(commandBus: any): Router {
    const router = Router();

    router.post("/register", async (req,res, next) => {

        try {
            const {email, password} = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    error: "email and password are required",
                })
            }

            const command = new RegisterCustomerCommand(email,password)

            await commandBus.execute(command);

            return res.status(201).json({
                message: "Customer registered"
            })

        } catch (error) {
            next(error)
        }

    });

    return router;
}