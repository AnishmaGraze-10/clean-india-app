require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

console.log('Starting server initialization...');

connectDB().catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});
