import 'dotenv/config';
import app from './app';
import { verifyEmailConnection } from './config/nodemailer';
import { verifyDbConnection } from './config/prisma';

const port = process.env.PORT || 3000;

app.listen(port, () => {
  verifyDbConnection();
  verifyEmailConnection();
  console.log(`Servidor corriendo en http://localhost:${port}`);
});