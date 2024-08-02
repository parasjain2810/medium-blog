import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign } from "hono/jwt";


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
  
  try {
    const user = await prisma.user.create({
      data: {
         email:body.email,
         password:body.password
      }}
    )
  
    const token= await sign({id:user.id,email:user.email},"paras");
    return c.json({
      jwt:token
    });
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
    try {
      
      const existUser = await prisma.user.findUnique({
        where: {
          email:body.email,
          password:body.password
        }
      })
      if(!existUser) { 
        c.status(403)
        return c.json({
          error:"User is not found",
        })}
       const jwt=await sign({id:existUser.id},c.env.JWT_SECRET)

     

        return c.json({jwt})
  
    } catch (error) {
      console.log(error);
       return c.status(403)
    }
    
  })

