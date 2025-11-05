import sequelize from './src/config/database.js'
import { QueryInterface } from 'sequelize'

const up20251029 = async (queryInterface, Sequelize) => {
  console.log('⏭️  Marcando 20251029_create_destino_and_update_viaje como completada...')
  await queryInterface.sequelize.query(
    "INSERT IGNORE INTO SequelizeMeta (name) VALUES ('20251029_create_destino_and_update_viaje.js')"
  )
  console.log('✅ Migración marcada como completada')
}

const createSuscriptores = async (queryInterface, Sequelize) => {
  console.log('📧 Creando tabla suscriptores...')

  await queryInterface.createTable('suscriptores', {
    id_suscriptor: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    email: {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true
    },
    nombre: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    activo: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    origen: {
      type: Sequelize.ENUM('web', 'landing', 'social', 'referido'),
      defaultValue: 'web',
      allowNull: false
    },
    token_desuscripcion: {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true
    },
    fecha_suscripcion: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false
    },
    fecha_desuscripcion: {
      type: Sequelize.DATE,
      allowNull: true
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  })

  console.log('✅ Tabla suscriptores creada')
}

const createCampanias = async (queryInterface, Sequelize) => {
  console.log('📢 Creando tabla campanias...')

  await queryInterface.createTable('campanias', {
    id_campania: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    nombre: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    descripcion: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    asunto: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    cuerpo: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    tipo_campania: {
      type: Sequelize.ENUM('descuento', 'promocion', 'informativa', 'temporada'),
      defaultValue: 'informativa',
      allowNull: false
    },
    descuento_porcentaje: {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true
    },
    codigo_descuento: {
      type: Sequelize.STRING(50),
      allowNull: true,
      unique: true
    },
    fecha_inicio: {
      type: Sequelize.DATE,
      allowNull: true
    },
    fecha_fin: {
      type: Sequelize.DATE,
      allowNull: true
    },
    activa: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    limite_usos: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    usos_actuales: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    imagen_campania: {
      type: Sequelize.STRING(500),
      allowNull: true
    },
    enviada: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    fecha_envio: {
      type: Sequelize.DATE,
      allowNull: true
    },
    total_enviados: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    fecha_creacion: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false
    },
    fecha_actualizacion: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  })

  console.log('✅ Tabla campanias creada')
}

const createCampaniaSuscriptor = async (queryInterface, Sequelize) => {
  console.log('🔗 Creando tabla campania_suscriptor...')

  await queryInterface.createTable('campania_suscriptor', {
    id_campania_suscriptor: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    id_campania: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'campanias',
        key: 'id_campania'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    id_suscriptor: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'suscriptores',
        key: 'id_suscriptor'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    entregada: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    abierta: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    clickeada: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    fecha_entrega: {
      type: Sequelize.DATE,
      allowNull: true
    },
    fecha_abierta: {
      type: Sequelize.DATE,
      allowNull: true
    },
    fecha_clickeada: {
      type: Sequelize.DATE,
      allowNull: true
    },
    error_envio: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  })

  console.log('✅ Tabla campania_suscriptor creada')
}

async function run() {
  try {
    console.log('🚀 Iniciando migraciones de Newsletter...\n')

    const queryInterface = sequelize.getQueryInterface()
    const Sequelize = sequelize.Sequelize

    // Mark previous migration as done
    await up20251029(queryInterface, Sequelize)

    // Check if tables exist
    const tables = await queryInterface.showAllTables()

    if (!tables.includes('suscriptores')) {
      await createSuscriptores(queryInterface, Sequelize)
    } else {
      console.log('⏭️  Tabla suscriptores ya existe')
    }

    if (!tables.includes('campanias')) {
      await createCampanias(queryInterface, Sequelize)
    } else {
      console.log('⏭️  Tabla campanias ya existe')
    }

    if (!tables.includes('campania_suscriptor')) {
      await createCampaniaSuscriptor(queryInterface, Sequelize)
    } else {
      console.log('⏭️  Tabla campania_suscriptor ya existe')
    }

    // Mark migrations as done
    await queryInterface.sequelize.query(
      "INSERT IGNORE INTO SequelizeMeta (name) VALUES " +
      "('20251102000001-create-suscriptores.cjs'), " +
      "('20251102000002-create-campanias.cjs'), " +
      "('20251102000003-create-campania-suscriptor.cjs')"
    )

    console.log('\n✅ ¡Todas las migraciones de Newsletter completadas!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error)
    process.exit(1)
  }
}

run()
