import sequelize from "../config/database.js"
import ImagenViaje from "../models/ImagenViaje.js"
import Viaje from "../models/Viaje.js"
import { Op } from "sequelize"

async function queryDatabase() {
  try {
    // Connect to database
    console.log("Connecting to database...")
    await sequelize.authenticate()
    console.log("Connected successfully!")

    console.log("\n" + "=".repeat(60))
    console.log("QUERY 1: SELECT * FROM imagenes_viaje LIMIT 10")
    console.log("=".repeat(60))
    const imagenesViaje = await ImagenViaje.findAll({
      limit: 10,
      order: [['id_imagen_viaje', 'DESC']]
    })

    if (imagenesViaje.length === 0) {
      console.log("No images found in imagenes_viaje table")
    } else {
      console.log(`Found ${imagenesViaje.length} images:`)
      console.table(imagenesViaje.map(img => ({
        id_imagen_viaje: img.id_imagen_viaje,
        id_viaje: img.id_viaje,
        url: img.url,
        descripcion: img.descripcion,
        orden: img.orden,
        es_principal: img.es_principal,
        focus_point: img.focus_point
      })))
    }

    console.log("\n" + "=".repeat(60))
    console.log("QUERY 2: SELECT id_viaje, titulo, imagen_principal_url FROM viajes WHERE imagen_principal_url IS NOT NULL")
    console.log("=".repeat(60))
    const viajesdWithImages = await Viaje.findAll({
      attributes: ['id_viaje', 'titulo', 'imagen_principal_url'],
      where: {
        imagen_principal_url: {
          [Op.not]: null
        }
      },
      order: [['id_viaje', 'DESC']]
    })

    if (viajesdWithImages.length === 0) {
      console.log("No trips found with imagen_principal_url set")
    } else {
      console.log(`Found ${viajesdWithImages.length} trips with principal images:`)
      console.table(viajesdWithImages.map(viaje => ({
        id_viaje: viaje.id_viaje,
        titulo: viaje.titulo,
        imagen_principal_url: viaje.imagen_principal_url
      })))
    }

    console.log("\n" + "=".repeat(60))
    console.log("ADDITIONAL QUERY: Trips WITHOUT imagen_principal_url")
    console.log("=".repeat(60))
    const viajesdWithoutImages = await Viaje.findAll({
      attributes: ['id_viaje', 'titulo', 'imagen_principal_url'],
      where: {
        imagen_principal_url: null
      },
      order: [['id_viaje', 'DESC']]
    })

    if (viajesdWithoutImages.length === 0) {
      console.log("All trips have imagen_principal_url set")
    } else {
      console.log(`Found ${viajesdWithoutImages.length} trips WITHOUT principal images:`)
      console.table(viajesdWithoutImages.map(viaje => ({
        id_viaje: viaje.id_viaje,
        titulo: viaje.titulo,
        imagen_principal_url: viaje.imagen_principal_url
      })))
    }

    console.log("\n" + "=".repeat(60))
    console.log("SUMMARY STATISTICS")
    console.log("=".repeat(60))
    const totalImages = await ImagenViaje.count()
    const totalTrips = await Viaje.count()
    const tripsWithPrincipalImage = await Viaje.count({
      where: {
        imagen_principal_url: {
          [Op.not]: null
        }
      }
    })

    console.log(`Total images in imagenes_viaje: ${totalImages}`)
    console.log(`Total trips in viajes: ${totalTrips}`)
    console.log(`Trips with imagen_principal_url set: ${tripsWithPrincipalImage}`)
    console.log(`Trips without imagen_principal_url: ${totalTrips - tripsWithPrincipalImage}`)
    console.log(`Average images per trip: ${(totalImages / totalTrips).toFixed(2)}`)

  } catch (error) {
    console.error("Error querying database:", error)
    process.exit(1)
  } finally {
    await sequelize.close()
    console.log("\nDatabase connection closed")
    process.exit(0)
  }
}

queryDatabase()
