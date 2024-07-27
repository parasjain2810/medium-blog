export function initMiddleware(app:any){
    app.use('/api/v1/blog/*', async (c:any, next:any) => {
        //get the header
        //verify header
        //if teh header is correct if yes we procced further
        //if not return error 404  to the user
      const header=c.req.header('authorizatiion')||""
      //Beareer tokens=> ["Brearer","token"]
      const token=header.split('')[1]
      
      //@ts-ignore
      const response=await verify(token,c.env.JWT_SECRET)
      if(response.id){
          c.set("userId",response.id)
          await next();
      }else{
        c.status(403)
        return c.json({})
      }
      })//middlerdware
}