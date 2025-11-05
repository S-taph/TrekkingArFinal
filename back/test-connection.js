import dotenv from "dotenv"
import mysql from "mysql2/promise"

dotenv.config()

console.log("Variables de entorno:")
console.log("DB_HOST:", process.env.DB_HOST)
console.log("DB_USER:", process.env.DB_USER)
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "***" : "VACÍA")
console.log("DB_NAME:", process.env.DB_NAME)

try {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  })
  
  console.log("✅ Conexión a MySQL exitosa!")
  await connection.end()
} catch (error) {
  console.log("❌ Error de conexión:", error.message)
}
