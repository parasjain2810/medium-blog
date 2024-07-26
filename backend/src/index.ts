import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'

const app = new Hono<{
	Bindings: {
		DATABASE_URL: string
	}
}>();

app.post('/api/v1/user/signup',async (c) => {
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
    jwt: token
  });
} 
catch (error) {
  return c.status(403)
}

})
app.post('/api/v1/user/signin', (c) => {
  return c.text('Hello Hono!')
})
app.post('/api/v1/blog', (c) => {
  return c.text('Hello Hono!')
})
app.put('/api/v1/blog', (c) => {
  return c.text('Hello Hono!')
})
app.get('/api/blog/:id', (c) => {
  return c.text('Hello Hono!')
})
app.get('/api/blog/bulk', (c) => {
  return c.text('Hello Hono!')
})

export default app
