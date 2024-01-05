import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import * as z from "zod";

//Define a schema for input validation using zod
 const schema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email"),
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters long")
});


export async function POST(req: Request) {
    try{
        const body = await req.json();
        const {email, username, password} = schema.parse(body);

        const existingUserByEmail = await db.user.findUnique({
            where: {
                email
            }
        });

        if(existingUserByEmail){
            return NextResponse.json({user: null, message: "Email already exists"}, {status: 400});
        }

        const existingUserByUsername = await db.user.findUnique({
            where: {
                username
            }
        });

        if(existingUserByUsername){
            return NextResponse.json({user: null, message: "Username already exists"}, {status: 400});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await db.user.create({
            data: {
                email,
                username,
                password: hashedPassword
            }
        });
        const {password: newUserPassowrd, ...rest} = newUser;

        return NextResponse.json({user: rest, message: "User created successfully"}, {status: 201});
    }catch(error){
        return NextResponse.json({user: null, message: "Something wrong"}, {status: 500});
    }
}