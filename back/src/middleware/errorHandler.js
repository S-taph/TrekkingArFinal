export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err)

  // Error de validación de Sequelize
  if (err.name === "SequelizeValidationError") {
    const errors = err.errors.map((error) => ({
      field: error.path,
      message: error.message,
    }))

    return res.status(400).json({
      success: false,
      message: "Error de validación",
      errors,
    })
  }

  // Error de clave única de Sequelize
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(400).json({
      success: false,
      message: "El recurso ya existe",
      field: err.errors[0]?.path,
    })
  }

  // Error de JWT
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Token inválido",
    })
  }

  // Error genérico
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Error interno del servidor",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}
