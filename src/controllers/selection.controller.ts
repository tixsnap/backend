import { NextFunction, Request, Response } from "express";

export class SelectionController {

    private generateWords(length: number = 10): string {
        const words: string = "abcdefghijklmnopqrstuvwxyz";
        let randomWord = "";
    
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * words.length);
            randomWord += words[randomIndex];
        }
    
        return randomWord;
    }

    
    

    randomWords(req: Request, res: Response, next: NextFunction){
        
        try {
            
            const words = this.generateWords()
            res.status(200).send({
                message: "success",
                words
            })
            

        } catch (error) {
            console.log(error)
        }
    }
}