/**
 * Script de Migración: Usuario.rol -> UsuarioRol (múltiples roles)
 *
 * Este script migra todos los usuarios del sistema antiguo (un solo rol en campo 'rol')
 * al nuevo sistema (múltiples roles en tabla 'usuario_roles')
 *
 * USO:
 *   node migrateUserRoles.js
 */

import dotenv from "dotenv"
dotenv.config()

import sequelize from "./src/config/database.js"
import Usuario from "./src/models/Usuario.js"
import UsuarioRol from "./src/models/UsuarioRol.js"
import "./src/models/associations.js"

async function migrateUserRoles() {
  try {
    console.log("🔄 Iniciando migración de roles de usuarios...")

    // Conectar a la base de datos
    await sequelize.authenticate()
    console.log("✅ Conexión a la base de datos establecida")

    // Sincronizar tabla usuario_roles si no existe
    await UsuarioRol.sync()
    console.log("✅ Tabla usuario_roles verificada")

    // Obtener todos los usuarios
    const usuarios = await Usuario.findAll({
      attributes: ["id_usuarios", "email", "nombre", "apellido", "rol"],
    })

    console.log(`📊 Total de usuarios a migrar: ${usuarios.length}`)

    let migrados = 0
    let yaExistentes = 0
    let errores = 0

    for (const usuario of usuarios) {
      try {
        // Verificar si ya tiene roles en el nuevo sistema
        const rolesExistentes = await UsuarioRol.findAll({
          where: { id_usuario: usuario.id_usuarios },
        })

        if (rolesExistentes.length > 0) {
          console.log(
            `⚠️  Usuario ${usuario.email} ya tiene roles:`,
            rolesExistentes.map((r) => r.rol).join(", "),
          )
          yaExistentes++
          continue
        }

        // Migrar rol del campo 'rol' al nuevo sistema
        const rolMigrado = usuario.rol || "cliente"

        await UsuarioRol.create({
          id_usuario: usuario.id_usuarios,
          rol: rolMigrado,
          activo: true,
          asignado_por: null,
          observaciones: "Migrado automáticamente del sistema antiguo",
        })

        console.log(
          `✅ Usuario ${usuario.email} (ID: ${usuario.id_usuarios}) migrado con rol: ${rolMigrado}`,
        )
        migrados++
      } catch (error) {
        console.error(
          `❌ Error migrando usuario ${usuario.email} (ID: ${usuario.id_usuarios}):`,
          error.message,
        )
        errores++
      }
    }

    console.log("\n📊 Resumen de la migración:")
    console.log(`   ✅ Usuarios migrados: ${migrados}`)
    console.log(`   ⚠️  Usuarios ya existentes: ${yaExistentes}`)
    console.log(`   ❌ Errores: ${errores}`)
    console.log(`   📝 Total procesados: ${usuarios.length}`)

    console.log("\n✨ Migración completada exitosamente")

    // Verificar la migración
    console.log("\n🔍 Verificando migración...")
    const totalRoles = await UsuarioRol.count()
    console.log(`   Total de roles en usuario_roles: ${totalRoles}`)

    // Mostrar algunos ejemplos
    const ejemplos = await UsuarioRol.findAll({
      limit: 5,
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["id_usuarios", "email", "nombre"],
        },
      ],
    })

    console.log("\n📋 Ejemplos de roles migrados:")
    ejemplos.forEach((rol) => {
      console.log(
        `   - ${rol.usuario.email}: rol='${rol.rol}', activo=${rol.activo}`,
      )
    })

    process.exit(0)
  } catch (error) {
    console.error("❌ Error en la migración:", error)
    process.exit(1)
  }
}

// Ejecutar migración
migrateUserRoles()
