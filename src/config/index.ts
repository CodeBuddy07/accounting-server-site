import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  port: process.env.PORT || 3000,
  environment: process.env.NODE_ENV || 'development',
  clientSite: process.env.FRONTEND_URL || "http://localhost:5173",
  databaseUrl: process.env.DATABASE_URL as string, 
  jwt: {
    secret: process.env.JWT_SECRET as string, 
  },
  email: {
    user: process.env.EMAIL_USER as string,
    pass: process.env.EMAIL_PASS as string,
  }
  
};
