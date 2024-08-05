import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import {signupInput,signinInput} from '@parash2810/common-medium'



export const userRoutes = new Hono<{
	Bindings: {
		DATABASE_URL: string
        JWT_SECRET: string;
	}
  Variables : {
		userId: string
	}
}>();

userRoutes.post('/signup',async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  
  const body=await c.req.json();

  const {success}= signupInput.safeParse(body);

  if(!success) {
    c.status(403);
    return c.json({
      message:"Invalid credentials"
    })
  }
  
  try {
    const user = await prisma.user.create({
      data: {
         email:body.email,
         password:body.password,
         name:body.name
      }}
    )
  
    const jwt= await sign({id:user.id,email:user.email},c.env.JWT_SECRET);
    return c.json({jwt,user});
  } 
  catch (error) {
    console.log(error)
    return c.status(403)
  }
  
  })

userRoutes.post('/signin', async(c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  
    const body=await c.req.json();
     const {success}=signinInput.safeParse(body);
     if(!success) {
      c.status(403);
      return c.json({
        message:"Invalid email or password"
      })
    }
    
    try {
      
      const user = await prisma.user.findUnique({
        where: {
          email:body.email,
          password:body.password
        }
      })
      if(!user) { 
        c.status(403)
        return c.json({
          error:"User is not found",
        })}
       const jwt=await sign({id:user.id},c.env.JWT_SECRET)
        return c.json({jwt,user})
  
    } catch (error) {
      console.log(error);
       return c.status(403)
    }
    
  })

