/**
 * Script para Eliminar Usuarios de la Base de Datos
 *
 * Este script te permite eliminar usuarios de forma segura, incluyendo:
 * - Usuarios registrados con email/password
 * - Usuarios registrados con Google OAuth
 * - Limpieza completa de datos relacionados
 *
 * USO:
 *   node deleteUsers.js
 */

import dotenv from "dotenv"
dotenv.config()

import readline from "readline"
import sequelize from "./src/config/database.js"
import Usuario from "./src/models/Usuario.js"
import UsuarioRol from "./src/models/UsuarioRol.js"
import AuditLog from "./src/models/AuditLog.js"
import Administrador from "./src/models/Administrador.js"
import Guia from "./src/models/Guia.js"
import Reserva from "./src/models/Reserva.js"
import Compra from "./src/models/Compra.js"
import Sugerencia from "./src/models/Sugerencia.js"
import Carrito from "./src/models/Carrito.js"
import "./src/models/associations.js"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

async function deleteUser(userId) {
  const transaction = await sequelize.transaction()

  try {
    const usuario = await Usuario.findByPk(userId, {
      include: [
        { model: UsuarioRol, as: "roles" },
        { model: Guia, as: "perfilGuia" },
        { model: Administrador, as: "perfilAdmin" },
      ],
    })

    if (!usuario) {
      console.log(`❌ Usuario con ID ${userId} no encontrado`)
      return false
    }

    console.log(`\n🔍 Usuario encontrado:`)
    console.log(`   ID: ${usuario.id_usuarios}`)
    console.log(`   Nombre: ${usuario.nombre} ${usuario.apellido}`)
    console.log(`   Email: ${usuario.email}`)
    console.log(`   Rol principal: ${usuario.rol}`)
    console.log(`   OAuth Google: ${usuario.googleId ? "Sí" : "No"}`)
    if (usuario.googleId) {
      console.log(`   Google ID: ${usuario.googleId}`)
    }
    console.log(`   Roles activos: ${usuario.roles?.map((r) => r.rol).join(", ") || "ninguno"}`)
    console.log(`   Es guía: ${usuario.perfilGuia ? "Sí" : "No"}`)
    console.log(`   Es admin: ${usuario.perfilAdmin ? "Sí" : "No"}`)

    const confirm = await question(
      `\n⚠️  ¿Estás SEGURO de eliminar este usuario? (escribe "SI" para confirmar): `
    )

    if (confirm.trim().toUpperCase() !== "SI") {
      console.log("❌ Eliminación cancelada")
      await transaction.rollback()
      return false
    }

    // Eliminar en orden para respetar las foreign keys
    console.log("\n🗑️  Eliminando datos relacionados...")

    // 1. Eliminar roles
    const rolesDeleted = await UsuarioRol.destroy({
      where: { id_usuario: userId },
      transaction,
    })
    console.log(`   ✅ Roles eliminados: ${rolesDeleted}`)

    // 2. Eliminar logs de auditoría
    const auditLogsDeleted = await AuditLog.destroy({
      where: { id_usuario: userId },
      transaction,
    })
    console.log(`   ✅ Logs de auditoría eliminados: ${auditLogsDeleted}`)

    // 3. Eliminar perfil de guía
    if (usuario.perfilGuia) {
      await Guia.destroy({
        where: { id_usuario: userId },
        transaction,
      })
      console.log(`   ✅ Perfil de guía eliminado`)
    }

    // 4. Eliminar perfil de administrador
    if (usuario.perfilAdmin) {
      await Administrador.destroy({
        where: { id_usuario: userId },
        transaction,
      })
      console.log(`   ✅ Perfil de administrador eliminado`)
    }

    // 5. Eliminar carritos
    const carritosDeleted = await Carrito.destroy({
      where: { id_usuario: userId },
      transaction,
    })
    console.log(`   ✅ Carritos eliminados: ${carritosDeleted}`)

    // 6. Eliminar sugerencias
    const sugerenciasDeleted = await Sugerencia.destroy({
      where: { id_usuario: userId },
      transaction,
    })
    console.log(`   ✅ Sugerencias eliminadas: ${sugerenciasDeleted}`)

    // 7. Verificar reservas (no se eliminan, solo se informa)
    const reservasCount = await Reserva.count({
      where: { id_usuario: userId },
    })
    if (reservasCount > 0) {
      console.log(
        `   ⚠️  Este usuario tiene ${reservasCount} reserva(s). Las reservas NO se eliminarán para mantener historial.`
      )
    }

    // 8. Verificar compras (no se eliminan, solo se informa)
    const comprasCount = await Compra.count({
      where: { id_usuario: userId },
    })
    if (comprasCount > 0) {
      console.log(
        `   ⚠️  Este usuario tiene ${comprasCount} compra(s). Las compras NO se eliminarán para mantener historial contable.`
      )
    }

    // 9. Eliminar el usuario
    await Usuario.destroy({
      where: { id_usuarios: userId },
      transaction,
    })
    console.log(`   ✅ Usuario eliminado`)

    await transaction.commit()
    console.log(`\n✅ Usuario eliminado exitosamente`)
    return true
  } catch (error) {
    await transaction.rollback()
    console.error(`\n❌ Error eliminando usuario:`, error.message)
    return false
  }
}

async function deleteUserByEmail(email) {
  try {
    const usuario = await Usuario.findOne({
      where: { email },
    })

    if (!usuario) {
      console.log(`❌ Usuario con email "${email}" no encontrado`)
      return false
    }

    return await deleteUser(usuario.id_usuarios)
  } catch (error) {
    console.error(`❌ Error buscando usuario:`, error.message)
    return false
  }
}

async function listUsers() {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ["id_usuarios", "email", "nombre", "apellido", "rol", "googleId", "created_at"],
      order: [["created_at", "DESC"]],
      limit: 50,
    })

    if (usuarios.length === 0) {
      console.log("📭 No hay usuarios en la base de datos")
      return
    }

    console.log(`\n📋 Últimos ${usuarios.length} usuarios:`)
    console.log("─".repeat(100))
    console.log(
      `${"ID".padEnd(6)} | ${"Email".padEnd(30)} | ${"Nombre".padEnd(20)} | ${"Rol".padEnd(10)} | ${"OAuth".padEnd(5)}`
    )
    console.log("─".repeat(100))

    usuarios.forEach((u) => {
      console.log(
        `${String(u.id_usuarios).padEnd(6)} | ${u.email.padEnd(30)} | ${`${u.nombre} ${u.apellido}`.padEnd(20)} | ${u.rol.padEnd(10)} | ${u.googleId ? "Sí" : "No"}`
      )
    })
    console.log("─".repeat(100))
  } catch (error) {
    console.error("❌ Error listando usuarios:", error.message)
  }
}

async function deleteMultipleUsers() {
  try {
    await listUsers()

    const emailsInput = await question(
      `\n📝 Ingresa los emails de los usuarios a eliminar (separados por coma):\n   `
    )

    const emails = emailsInput
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.length > 0)

    if (emails.length === 0) {
      console.log("❌ No se ingresaron emails")
      return
    }

    console.log(`\n🎯 Emails a procesar: ${emails.length}`)

    let eliminados = 0
    let errores = 0

    for (const email of emails) {
      console.log(`\n${"=".repeat(80)}`)
      console.log(`Procesando: ${email}`)
      console.log("=".repeat(80))

      const result = await deleteUserByEmail(email)
      if (result) {
        eliminados++
      } else {
        errores++
      }
    }

    console.log(`\n${"=".repeat(80)}`)
    console.log(`📊 Resumen:`)
    console.log(`   ✅ Usuarios eliminados: ${eliminados}`)
    console.log(`   ❌ Errores/Cancelados: ${errores}`)
    console.log(`   📝 Total procesados: ${emails.length}`)
    console.log("=".repeat(80))
  } catch (error) {
    console.error("❌ Error en eliminación múltiple:", error.message)
  }
}

async function main() {
  try {
    console.log("🗑️  Script de Eliminación de Usuarios")
    console.log("=" .repeat(80))

    // Conectar a la base de datos
    await sequelize.authenticate()
    console.log("✅ Conexión a la base de datos establecida")

    console.log(`\n¿Qué deseas hacer?`)
    console.log(`1. Listar usuarios`)
    console.log(`2. Eliminar un usuario por email`)
    console.log(`3. Eliminar múltiples usuarios por email`)
    console.log(`4. Eliminar un usuario por ID`)
    console.log(`5. Salir`)

    const opcion = await question(`\nSelecciona una opción (1-5): `)

    switch (opcion.trim()) {
      case "1":
        await listUsers()
        break

      case "2":
        {
          await listUsers()
          const email = await question(`\nIngresa el email del usuario a eliminar: `)
          if (email.trim()) {
            await deleteUserByEmail(email.trim())
          } else {
            console.log("❌ Email no válido")
          }
        }
        break

      case "3":
        await deleteMultipleUsers()
        break

      case "4":
        {
          await listUsers()
          const id = await question(`\nIngresa el ID del usuario a eliminar: `)
          const userId = parseInt(id)
          if (userId && !isNaN(userId)) {
            await deleteUser(userId)
          } else {
            console.log("❌ ID no válido")
          }
        }
        break

      case "5":
        console.log("👋 Saliendo...")
        break

      default:
        console.log("❌ Opción no válida")
    }

    rl.close()
    process.exit(0)
  } catch (error) {
    console.error("❌ Error en el script:", error)
    rl.close()
    process.exit(1)
  }
}

// Ejecutar script
main()
