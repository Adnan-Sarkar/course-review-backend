import mongoose from "mongoose";
import app from "./app";
import config from "./app/config";

async function server() {
  try {
    await mongoose.connect(config.DB_URL as string);

    app.listen(config.PORT, () => {
      console.log(`SERVER is listening to PORT ${config.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

server();
