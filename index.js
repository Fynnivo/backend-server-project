import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/Database.js";
import session from "express-session";
import UserRoute from "./routes/UserRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import StripeRoute from "./routes/StripeRoute.js";
import MongoStore from "connect-mongo";
dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "https://stripe.com", "https://checkout.stripe.com", "https://billing.stripe.com"]
  })
);
app.use(
  session({
    secret: process.env.SESS_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1 * 24 * 60 * 60 * 1000,
      secure: "auto",
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      autoRemove: "native",
    }),
  })
);
app.use(express.static("public"));
app.use(express.json());
app.use(UserRoute);
app.use(AuthRoute);
app.use(StripeRoute);
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Database connected..."));

app.listen(port, () =>
  console.log(`Server up and running on http://localhost:${port}`)
);
