import 'dotenv/config'
import connectDB from './db/index.js'
import { app } from './app.js';

connectDB()
.then(()=> {
  app.on("error", (error) => {
    console.log("Error: Application encountered an error", error);
    throw error
  }) //to handle application-level errors

  app.get('/',(req, res) => {
    res.send("Connection establised")
  })

  app.listen(process.env.PORT || 4000, () => {
    console.log(`Server is running at port :${process.env.PORT}`);
  })
})
.catch((err)=> {
  console.log("MONGO DB CONNECTION FAILED !!!", err);
})
