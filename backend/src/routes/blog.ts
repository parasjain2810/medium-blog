import { createPostInput, updatePostInput, } from '@parash2810/common-medium';
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";


export const blogRoutes = new Hono<{
	Bindings: {
		DATABASE_URL: string;
        JWT_SECRET: string;
	},
  Variables : {
		userId: string;
	}
}>();


blogRoutes.use("/*", async (c, next) => {
    const authHeader = c.req.header("authorization") || "";
    try {
        const user = await verify(authHeader, c.env.JWT_SECRET);
        if (user) {
            c.set("userId",user.id);
            await next();
        } else {
            c.status(403);
            return c.json({
                message: "You are not logged in"
            })
        }
    } catch(e) {
        c.status(403);
        return c.json({
            message: "You are not logged in"
        })
    }
});

blogRoutes.post('/',async(c)=>{
    const body= await c.req.json()

    const {success}=createPostInput.safeParse(body);

    if(!success) {
        c.status(403);
        return c.json({
          message:"Invalid credentials"
        })
    }

    const authorId=c.get("userId")

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const blog= await prisma.post.create({
        data:{
            title:body.title,
            content:body.content,
            authorId:authorId,
            publishedDate:Date()
        }
    })

    return c.json({
        id: blog.id
    })
})

blogRoutes.put('/',async(c)=>{
  const body =await c.req.json();

  const {success}=updatePostInput.safeParse(body);

  if(!success) {
    c.status(403);
    return c.json({
      message:"Invalid credentials"
    })
  }

  const prisma=new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const blog = await prisma.post.update({
    where: {
        id: body.id
    }, 
    data: {
        title: body.title,
        content: body.content
    }
})

return c.json({
    blog
})
  
})

blogRoutes.get('/bulk',async(c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const blogs=await prisma.post.findMany({
            select:{
                content:true,
                title:true,
                id:true,
                publishedDate:true,
                author:{
                    select:{
                        name:true,
                    }
                }
            }
        })

        return c.json({blogs})
    } catch (error) {
        c.status(411)
        c.json({
            message:"Error while fetching blogs"
        })
    }
})

blogRoutes.get('/:id',async(c)=>{
  const id=c.req.param("id");
  const prisma=new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL
  }).$extends(withAccelerate())
  try {
    const blog=await prisma.post.findFirst({
        where:{
            id:id
        },
        select:{
         id:true,
         title:true,
         content:true,
         publishedDate:true,
         author:{
             select:{
                 name:true,
             }
         }
        }
   })
   return c.json({blog})
  } catch (error) {
    c.status(411)
    return  c.json({
        message: "Error while fetching blog post"
    });
  }
})

