/**
 * Multer Configuration
 * 
 * Configuración para manejo de uploads de imágenes
 * con validaciones de tipo y tamaño.
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Crear directorio de uploads si no existe
const uploadsDir = path.join(process.cwd(), 'uploads');
const viajesDir = path.join(uploadsDir, 'viajes');
const tempDir = path.join(uploadsDir, 'temp');
const avatarsDir = path.join(uploadsDir, 'avatars');

[uploadsDir, viajesDir, tempDir, avatarsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Detectar si es un avatar por la ruta
    if (req.path.includes('/avatar')) {
      cb(null, avatarsDir);
      return;
    }

    const viajeId = req.params.id || req.params.viajeId;

    if (viajeId) {
      // Si hay viajeId, guardar en directorio específico del viaje
      const viajeDir = path.join(viajesDir, viajeId);
      if (!fs.existsSync(viajeDir)) {
        fs.mkdirSync(viajeDir, { recursive: true });
      }
      cb(null, viajeDir);
    } else {
      // Si no hay viajeId, guardar en temp
      cb(null, tempDir);
    }
  },
  filename: (req, file, cb) => {
    // Generar nombre único: timestamp + random + extensión
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `img-${uniqueSuffix}${ext}`);
  }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  // Verificar tipo MIME
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes JPEG, PNG y WebP.'), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
    files: 10 // Máximo 10 archivos por request
  }
});

// Middleware para manejo de errores de multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. Máximo 5MB permitido.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Demasiados archivos. Máximo 10 archivos por request.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Campo de archivo inesperado.'
      });
    }
  }
  
  if (error.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

// Función para generar ruta relativa del archivo
// IMPORTANTE: Guardamos solo rutas relativas en la BD, no URLs absolutas
// El backend construirá la URL completa dinámicamente según el entorno
const getFileUrl = (req, filename, viajeId = null) => {
  if (viajeId) {
    return `/uploads/viajes/${viajeId}/${filename}`;
  } else {
    return `/uploads/temp/${filename}`;
  }
};

// Función para mover archivo de temp a directorio final
const moveFileToViaje = (tempFilename, viajeId) => {
  const tempPath = path.join(tempDir, tempFilename);
  const viajeDir = path.join(viajesDir, viajeId);
  const finalPath = path.join(viajeDir, tempFilename);
  
  if (!fs.existsSync(viajeDir)) {
    fs.mkdirSync(viajeDir, { recursive: true });
  }
  
  fs.renameSync(tempPath, finalPath);
  return finalPath;
};

// Función para eliminar archivo
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error eliminando archivo:', error);
    return false;
  }
};

export {
  upload,
  handleMulterError,
  getFileUrl,
  moveFileToViaje,
  deleteFile
};