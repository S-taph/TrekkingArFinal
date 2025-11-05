import nodemailer from 'nodemailer';

/**
 * Configuración de Nodemailer
 * Crear transporter para envío de correos electrónicos
 */
export const createTransporter = () => {
  // Usar variables de entorno para configuración
  const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true para puerto 465, false para otros
    auth: {
      user: process.env.GMAIL_SMTP_USER,
      pass: process.env.GMAIL_SMTP_PASS, // App password para Gmail
    },
  });

  return transporter;
};

/**
 * Enviar correo de verificación
 * @param {string} email - Dirección de correo del usuario
 * @param {string} token - Token de verificación
 * @param {string} nombre - Nombre del usuario
 * @returns {Promise} Promise con resultado del envío
 */
export const sendVerificationEmail = async (email, token, nombre) => {
  const transporter = createTransporter();

  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"TrekkingAR" <${process.env.GMAIL_SMTP_USER}>`,
    to: email,
    subject: 'Verifica tu correo electrónico - TrekkingAR',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background-color: #64b5f6;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: white;
            padding: 30px;
            border-radius: 0 0 5px 5px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #9CCC65;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏔️ TrekkingAR</h1>
          </div>
          <div class="content">
            <h2>¡Hola, ${nombre}!</h2>
            <p>Gracias por registrarte en TrekkingAR. Estamos emocionados de tenerte con nosotros.</p>
            <p>Para completar tu registro y comenzar tu aventura, por favor verifica tu correo electrónico haciendo clic en el botón de abajo:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verificar mi correo</a>
            </div>
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #64b5f6;">${verificationUrl}</p>
            <p><strong>Este enlace expirará en 24 horas.</strong></p>
            <p>Si no solicitaste esta cuenta, puedes ignorar este correo.</p>
            <p>¡Nos vemos en la montaña!</p>
            <p>El equipo de TrekkingAR</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} TrekkingAR. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[Nodemailer] Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Nodemailer] Error sending email:', error);
    throw error;
  }
};
