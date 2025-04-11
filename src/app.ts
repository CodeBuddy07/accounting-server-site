import express from "express";
var cookieParser = require('cookie-parser')
import cors from "cors";
import dotenv from "dotenv";
import adminRoutes from "./routes/admin.routes";
import customerRoutes from "./routes/customer.route";
import productRoutes from "./routes/product.route";
import transactionRoutes from "./routes/transaction.route";
import globalErrorHandler from "./utils/globalErrorHandler";


dotenv.config();

const app = express();
app.use(cors({
    origin:["http://localhost:5173","https://accounting-client-site.vercel.app"],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/transactions", transactionRoutes);

app.get('/', (req, res)=>{
    res.send("Accounting Server is running.")
})


app.use(globalErrorHandler)

export default app;
