export const up = async (queryInterface, Sequelize) => {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    // Create destinos table
    await queryInterface.createTable(
      "destinos",
      {
        id_destino: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        nombre: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        provincia: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        region: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        descripcion: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        fecha_creacion: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        fecha_actualizacion: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
        },
      },
      { transaction },
    )

    // Add index on nombre (check if it doesn't exist first)
    try {
      await queryInterface.addIndex("destinos", ["nombre"], {
        unique: true,
        name: "destinos_nombre",
        transaction,
      })
    } catch (error) {
      if (error.original?.code !== 'ER_DUP_KEYNAME') {
        throw error
      }
      // Index already exists, continue
    }

    // Insert some default destinos (common Argentine trekking destinations)
    // Check if data already exists first
    const existingDestinos = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM destinos',
      { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
    )

    if (existingDestinos[0].count === 0) {
      await queryInterface.bulkInsert(
        "destinos",
        [
          {
            nombre: "Cerro Aconcagua",
            provincia: "Mendoza",
            region: "Cuyo",
            descripcion: "El pico más alto de América",
            fecha_creacion: new Date(),
            fecha_actualizacion: new Date(),
          },
        {
          nombre: "Cerro Fitz Roy",
          provincia: "Santa Cruz",
          region: "Patagonia",
          descripcion: "Icónica montaña patagónica",
          fecha_creacion: new Date(),
          fecha_actualizacion: new Date(),
        },
        {
          nombre: "Cerro Torre",
          provincia: "Santa Cruz",
          region: "Patagonia",
          descripcion: "Una de las montañas más difíciles del mundo",
          fecha_creacion: new Date(),
          fecha_actualizacion: new Date(),
        },
        {
          nombre: "Glaciar Perito Moreno",
          provincia: "Santa Cruz",
          region: "Patagonia",
          descripcion: "Uno de los glaciares más famosos del mundo",
          fecha_creacion: new Date(),
          fecha_actualizacion: new Date(),
        },
        {
          nombre: "Cerro Champaquí",
          provincia: "Córdoba",
          region: "Sierras Pampeanas",
          descripcion: "Punto más alto de Córdoba",
          fecha_creacion: new Date(),
          fecha_actualizacion: new Date(),
        },
        {
          nombre: "Quebrada de Humahuaca",
          provincia: "Jujuy",
          region: "NOA",
          descripcion: "Patrimonio de la Humanidad UNESCO",
          fecha_creacion: new Date(),
          fecha_actualizacion: new Date(),
        },
        {
          nombre: "Volcán Lanín",
          provincia: "Neuquén",
          region: "Patagonia Norte",
          descripcion: "Volcán emblemático de la Patagonia",
          fecha_creacion: new Date(),
          fecha_actualizacion: new Date(),
        },
        {
          nombre: "Laguna de los Tres",
          provincia: "Santa Cruz",
          region: "Patagonia",
          descripcion: "Trekking clásico en El Chaltén",
          fecha_creacion: new Date(),
          fecha_actualizacion: new Date(),
        },
        {
          nombre: "Cerro Catedral",
          provincia: "Río Negro",
          region: "Patagonia",
          descripcion: "Centro de esquí y trekking en Bariloche",
          fecha_creacion: new Date(),
          fecha_actualizacion: new Date(),
        },
        {
          nombre: "Valle de la Luna",
          provincia: "San Juan",
          region: "Cuyo",
          descripcion: "Formaciones rocosas únicas",
          fecha_creacion: new Date(),
          fecha_actualizacion: new Date(),
        },
      ],
      { transaction },
    )
    }

    // Add id_destino column to viajes table
    await queryInterface.addColumn(
      "viajes",
      "id_destino",
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "destinos",
          key: "id_destino",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      { transaction },
    )

    // Add index on id_destino for better query performance
    await queryInterface.addIndex("viajes", ["id_destino"], {
      transaction,
    })

    await transaction.commit()
    console.log("✅ Migration completed: destinos table created and viajes updated")
  } catch (error) {
    await transaction.rollback()
    console.error("❌ Migration failed:", error)
    throw error
  }
}

export const down = async (queryInterface, Sequelize) => {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    // Remove index from viajes
    await queryInterface.removeIndex("viajes", ["id_destino"], { transaction })

    // Remove id_destino column from viajes
    await queryInterface.removeColumn("viajes", "id_destino", { transaction })

    // Drop destinos table
    await queryInterface.dropTable("destinos", { transaction })

    await transaction.commit()
    console.log("✅ Rollback completed: destinos table dropped and viajes restored")
  } catch (error) {
    await transaction.rollback()
    console.error("❌ Rollback failed:", error)
    throw error
  }
}
