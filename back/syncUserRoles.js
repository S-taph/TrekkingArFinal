/**
 * Script para Sincronizar Roles de Usuarios
 *
 * Este script sincroniza automáticamente los roles en la tabla usuario_roles
 * basándose en los perfiles existentes en las tablas guias y administrador.
 *
 * Casos que resuelve:
 * - Usuario está en tabla 'guias' pero no tiene rol 'guia' en usuario_roles
 * - Usuario está en tabla 'administrador' pero no tiene rol 'admin' en usuario_roles
 * - Usuario no tiene ningún rol en usuario_roles (migra desde campo 'rol')
 *
 * USO:
 *   node syncUserRoles.js
 */

import dotenv from "dotenv"
dotenv.config()

import sequelize from "./src/config/database.js"
import Usuario from "./src/models/Usuario.js"
import UsuarioRol from "./src/models/UsuarioRol.js"
import Guia from "./src/models/Guia.js"
import Administrador from "./src/models/Administrador.js"
import "./src/models/associations.js"
import roleService from "./src/services/roleService.js"

async function syncUserRoles() {
  try {
    console.log("🔄 Script de Sincronización de Roles")
    console.log("=" .repeat(80))

    // Conectar a la base de datos
    await sequelize.authenticate()
    console.log("✅ Conexión a la base de datos establecida\n")

    // Obtener todos los usuarios
    const usuarios = await Usuario.findAll({
      include: [
        {
          model: UsuarioRol,
          as: "roles",
          required: false,
        },
        {
          model: Guia,
          as: "perfilGuia",
          required: false,
        },
        {
          model: Administrador,
          as: "perfilAdmin",
          required: false,
        },
      ],
    })

    console.log(`📊 Usuarios encontrados: ${usuarios.length}\n`)

    let sincronizados = 0
    let errores = 0
    const cambios = []

    for (const usuario of usuarios) {
      try {
        const rolesActuales = usuario.roles?.map((r) => r.rol) || []
        const cambiosUsuario = []

        console.log(`\n👤 Procesando: ${usuario.nombre} ${usuario.apellido} (${usuario.email})`)
        console.log(`   ID: ${usuario.id_usuarios}`)
        console.log(`   Rol principal: ${usuario.rol}`)
        console.log(`   Roles actuales en usuario_roles: [${rolesActuales.join(", ") || "ninguno"}]`)

        // 1. Verificar si necesita migración inicial (no tiene roles en usuario_roles)
        if (rolesActuales.length === 0 && usuario.rol) {
          console.log(`   ⚠️  No tiene roles en usuario_roles, migrando rol: ${usuario.rol}`)
          await roleService.migrateUserRole(usuario.id_usuarios, usuario.rol)
          rolesActuales.push(usuario.rol)
          cambiosUsuario.push(`Migrado rol inicial: ${usuario.rol}`)
        }

        // 2. Verificar si tiene perfil de guía pero no el rol
        if (usuario.perfilGuia && !rolesActuales.includes("guia")) {
          console.log(`   ⚠️  Tiene perfil de guía pero falta rol 'guia'`)
          await roleService.assignRole(
            usuario.id_usuarios,
            "guia",
            null,
            "Sincronizado automáticamente - perfil de guía existente"
          )
          rolesActuales.push("guia")
          cambiosUsuario.push("Asignado rol: guia")
          console.log(`   ✅ Rol 'guia' asignado`)
        }

        // 3. Verificar si tiene perfil de admin pero no el rol
        if (usuario.perfilAdmin && !rolesActuales.includes("admin")) {
          console.log(`   ⚠️  Tiene perfil de admin pero falta rol 'admin'`)
          await roleService.assignRole(
            usuario.id_usuarios,
            "admin",
            null,
            "Sincronizado automáticamente - perfil de administrador existente"
          )
          rolesActuales.push("admin")
          cambiosUsuario.push("Asignado rol: admin")
          console.log(`   ✅ Rol 'admin' asignado`)
        }

        // 4. Asegurar que todos tengan rol 'cliente'
        if (!rolesActuales.includes("cliente")) {
          console.log(`   ⚠️  Falta rol 'cliente' (todos los usuarios deben tenerlo)`)
          await roleService.assignRole(
            usuario.id_usuarios,
            "cliente",
            null,
            "Sincronizado automáticamente - rol base"
          )
          rolesActuales.push("cliente")
          cambiosUsuario.push("Asignado rol: cliente")
          console.log(`   ✅ Rol 'cliente' asignado`)
        }

        if (cambiosUsuario.length > 0) {
          sincronizados++
          cambios.push({
            usuario: `${usuario.nombre} ${usuario.apellido} (${usuario.email})`,
            cambios: cambiosUsuario,
          })
          console.log(`   ✅ Usuario sincronizado`)
        } else {
          console.log(`   ✅ Usuario ya está sincronizado correctamente`)
        }
      } catch (error) {
        errores++
        console.error(`   ❌ Error sincronizando usuario ${usuario.id_usuarios}:`, error.message)
      }
    }

    // Resumen final
    console.log("\n" + "=".repeat(80))
    console.log("📊 Resumen de Sincronización:")
    console.log(`   ✅ Usuarios procesados: ${usuarios.length}`)
    console.log(`   🔄 Usuarios sincronizados: ${sincronizados}`)
    console.log(`   ❌ Errores: ${errores}`)
    console.log("=".repeat(80))

    if (cambios.length > 0) {
      console.log("\n📝 Detalle de cambios:")
      cambios.forEach(({ usuario, cambios: camb }, index) => {
        console.log(`\n${index + 1}. ${usuario}`)
        camb.forEach((c) => console.log(`   - ${c}`))
      })
    }

    console.log("\n✅ Sincronización completada exitosamente")
    process.exit(0)
  } catch (error) {
    console.error("\n❌ Error en el script:", error)
    console.error(error.stack)
    process.exit(1)
  }
}

// Ejecutar script
syncUserRoles()
