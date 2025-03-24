import app from "./app";
import config from "./config";
import connectDB from "./config/db";

const PORT = config.port || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
