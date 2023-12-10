import mongoose from "mongoose";
import app from "./app";

async function server() {
  await mongoose.connect("mongodb://127.0.0.1:27017/test");

  app.listen(3500, () => {
    console.log("SERVER is listening to PORT 3500");
  });
}

server();
