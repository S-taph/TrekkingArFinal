import { useState, useEffect } from "react"
import { Alert, AlertTitle, Button, Collapse, IconButton } from "@mui/material"
import { Close as CloseIcon, CameraAlt as CameraIcon } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

/**
 * GuidePhotoAlert - Componente de alerta para guías sin foto de perfil
 *
 * Muestra una alerta persistente cuando un usuario con rol de guía
 * inicia sesión sin tener una foto de perfil cargada.
 *
 * La alerta se puede cerrar temporalmente pero se mostrará nuevamente
 * en la próxima sesión hasta que el guía cargue su foto.
 */
export default function GuidePhotoAlert() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Verificar si el usuario es guía y no tiene foto de perfil
    if (user && user.rol === "guia" && !user.avatar) {
      // Verificar si el usuario cerró la alerta en esta sesión
      const alertClosed = sessionStorage.getItem("guidePhotoAlertClosed")
      if (!alertClosed) {
        setOpen(true)
      }
    } else {
      setOpen(false)
    }
  }, [user])

  const handleClose = () => {
    setOpen(false)
    // Guardar en sessionStorage que se cerró la alerta (solo durante esta sesión)
    sessionStorage.setItem("guidePhotoAlertClosed", "true")
  }

  const handleGoToProfile = () => {
    navigate("/perfil")
    handleClose()
  }

  // No renderizar nada si el usuario no es guía o ya tiene foto
  if (!user || user.rol !== "guia" || user.avatar) {
    return null
  }

  return (
    <Collapse in={open}>
      <Alert
        severity="warning"
        icon={<CameraIcon />}
        action={
          <IconButton
            aria-label="cerrar"
            color="inherit"
            size="small"
            onClick={handleClose}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
        sx={{
          mb: 2,
          mx: { xs: 2, sm: 3, md: 4 },
          mt: 2,
          borderRadius: 2,
          boxShadow: 2,
        }}
      >
        <AlertTitle sx={{ fontWeight: 700 }}>
          Foto de perfil requerida
        </AlertTitle>
        Como guía de TrekkingAR, es importante que tengas una foto de perfil para que los clientes
        puedan conocerte. Tu perfil aparecerá en la página "Nosotros" una vez que cargues tu foto.
        <Button
          variant="contained"
          size="small"
          startIcon={<CameraIcon />}
          onClick={handleGoToProfile}
          sx={{ mt: 1 }}
        >
          Cargar foto ahora
        </Button>
      </Alert>
    </Collapse>
  )
}
