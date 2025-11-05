/**
 * Email Service
 * 
 * Servicio para envío de emails usando Nodemailer con Gmail SMTP.
 * Incluye plantillas para notificaciones de contacto y respuestas.
 */

import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.GMAIL_SMTP_USER,
          pass: process.env.GMAIL_SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verificar configuración
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('Error configurando email service:', error);
        } else {
          console.log('Email service configurado correctamente');
        }
      });
    } catch (error) {
      console.error('Error inicializando email service:', error);
    }
  }

  /**
   * Envía email de notificación a administradores sobre nuevo mensaje de contacto
   */
  async sendContactNotificationToAdmins(contactData) {
    if (!this.transporter) {
      throw new Error('Email service no configurado');
    }

    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
    
    if (adminEmails.length === 0) {
      console.warn('No hay emails de administradores configurados');
      return;
    }

    const mailOptions = {
      from: process.env.GMAIL_SMTP_USER,
      to: adminEmails.join(', '),
      subject: `Nuevo mensaje de contacto: ${contactData.asunto}`,
      html: this.getContactNotificationTemplate(contactData)
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email de notificación enviado:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error enviando email de notificación:', error);
      throw error;
    }
  }

  /**
   * Envía copia de confirmación al usuario que envió el mensaje de contacto
   */
  async sendContactConfirmationToUser(contactData) {
    if (!this.transporter) {
      throw new Error('Email service no configurado');
    }

    const mailOptions = {
      from: process.env.GMAIL_SMTP_USER,
      to: contactData.email,
      subject: `Confirmación de consulta recibida: ${contactData.asunto}`,
      html: this.getContactConfirmationTemplate(contactData)
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email de confirmación enviado al usuario:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error enviando email de confirmación al usuario:', error);
      throw error;
    }
  }

  /**
   * Envía respuesta del administrador al usuario que envió el mensaje de contacto
   */
  async sendContactReplyToUser(contactData, reply, adminName) {
    if (!this.transporter) {
      throw new Error('Email service no configurado');
    }

    const mailOptions = {
      from: process.env.GMAIL_SMTP_USER,
      to: contactData.email,
      subject: `Re: ${contactData.asunto}`,
      html: this.getContactReplyTemplate(contactData, reply, adminName)
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email de respuesta enviado:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error enviando email de respuesta:', error);
      throw error;
    }
  }

  /**
   * Envía email de verificación de cuenta
   */
  async sendVerificationEmail(email, token, nombre) {
    if (!this.transporter) {
      throw new Error('Email service no configurado');
    }

    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.GMAIL_SMTP_USER,
      to: email,
      subject: 'Verifica tu correo electrónico - TrekkingAR',
      html: this.getVerificationEmailTemplate(nombre, verificationUrl)
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email de verificación enviado:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error enviando email de verificación:', error);
      throw error;
    }
  }

  /**
   * Envía email de notificación del sistema
   */
  async sendSystemNotification(notificationData) {
    if (!this.transporter) {
      throw new Error('Email service no configurado');
    }

    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
    
    if (adminEmails.length === 0) {
      console.warn('No hay emails de administradores configurados');
      return;
    }

    const mailOptions = {
      from: process.env.GMAIL_SMTP_USER,
      to: adminEmails.join(', '),
      subject: `Notificación del sistema: ${notificationData.titulo}`,
      html: this.getSystemNotificationTemplate(notificationData)
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email de notificación del sistema enviado:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error enviando email de notificación del sistema:', error);
      throw error;
    }
  }

  /**
   * Plantilla HTML para notificación de contacto
   */
  getContactNotificationTemplate(contactData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nuevo mensaje de contacto</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1E7A5F; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #1E7A5F; }
          .value { margin-top: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nuevo mensaje de contacto</h1>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Nombre:</div>
              <div class="value">${contactData.nombre}</div>
            </div>
            <div class="field">
              <div class="label">Email:</div>
              <div class="value">${contactData.email}</div>
            </div>
            <div class="field">
              <div class="label">Asunto:</div>
              <div class="value">${contactData.asunto}</div>
            </div>
            <div class="field">
              <div class="label">Mensaje:</div>
              <div class="value">${contactData.mensaje.replace(/\n/g, '<br>')}</div>
            </div>
            <div class="field">
              <div class="label">Fecha:</div>
              <div class="value">${new Date(contactData.createdAt).toLocaleString('es-AR')}</div>
            </div>
          </div>
          <div class="footer">
            <p>Este mensaje fue enviado desde el formulario de contacto de TrekkingApp.</p>
            <p>Puedes responder desde el panel de administración.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Plantilla HTML para confirmación de mensaje recibido
   */
  getContactConfirmationTemplate(contactData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmación de consulta recibida</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1E7A5F; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .message-box { background-color: #e9f5f0; padding: 15px; margin: 20px 0; border-left: 4px solid #1E7A5F; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .highlight { color: #1E7A5F; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Consulta recibida!</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${contactData.nombre}</strong>,</p>

            <p>Hemos recibido tu consulta y queremos confirmar que la hemos registrado correctamente. Nuestro equipo la revisará y te responderá a la brevedad.</p>

            <div class="message-box">
              <h3>Resumen de tu consulta:</h3>
              <p><strong>Asunto:</strong> ${contactData.asunto}</p>
              <p><strong>Tu email:</strong> ${contactData.email}</p>
              <p><strong>Mensaje:</strong></p>
              <p>${contactData.mensaje.replace(/\n/g, '<br>')}</p>
              <p><strong>Fecha de envío:</strong> ${new Date(contactData.createdAt).toLocaleString('es-AR')}</p>
            </div>

            <p>Te responderemos lo antes posible a <span class="highlight">${contactData.email}</span>.</p>

            <p>Si tienes alguna pregunta adicional mientras tanto, no dudes en contactarnos.</p>

            <p>Saludos cordiales,<br>
            <strong>Equipo TrekkingAR</strong></p>
          </div>
          <div class="footer">
            <p>Este es un email automático de confirmación.</p>
            <p>TrekkingAR - San Carlos de Bariloche, Río Negro, Argentina</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Plantilla HTML para respuesta de contacto
   */
  getContactReplyTemplate(contactData, reply, adminName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Respuesta a tu consulta</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1E7A5F; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .original-message { background-color: #e9e9e9; padding: 15px; margin: 20px 0; border-left: 4px solid #1E7A5F; }
          .reply { background-color: #f0f8f0; padding: 15px; margin: 20px 0; border-left: 4px solid #D98B3A; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Respuesta a tu consulta</h1>
          </div>
          <div class="content">
            <p>Hola ${contactData.nombre},</p>
            
            <div class="original-message">
              <h3>Tu consulta original:</h3>
              <p><strong>Asunto:</strong> ${contactData.asunto}</p>
              <p><strong>Mensaje:</strong></p>
              <p>${contactData.mensaje.replace(/\n/g, '<br>')}</p>
            </div>
            
            <div class="reply">
              <h3>Nuestra respuesta:</h3>
              <p>${reply.replace(/\n/g, '<br>')}</p>
            </div>
            
            <p>Si tienes más preguntas, no dudes en contactarnos nuevamente.</p>
            
            <p>Saludos cordiales,<br>
            <strong>${adminName}</strong><br>
            Equipo TrekkingApp</p>
          </div>
          <div class="footer">
            <p>Este email fue enviado como respuesta a tu consulta del ${new Date(contactData.createdAt).toLocaleDateString('es-AR')}.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Envía email de recuperación de contraseña
   */
  async sendPasswordResetEmail(email, token, nombre) {
    if (!this.transporter) {
      throw new Error('Email service no configurado');
    }

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.GMAIL_SMTP_USER,
      to: email,
      subject: 'Recuperación de contraseña - TrekkingAR',
      html: this.getPasswordResetEmailTemplate(nombre, resetUrl)
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email de recuperación de contraseña enviado:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error enviando email de recuperación de contraseña:', error);
      throw error;
    }
  }

  /**
   * Plantilla HTML para email de verificación
   */
  getVerificationEmailTemplate(nombre, verificationUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1E7A5F; color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: white; padding: 30px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
          .button { display: inline-block; padding: 15px 40px; background-color: #D98B3A; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .button:hover { background-color: #c47a2f; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .url-box { background-color: #f0f8f0; padding: 15px; border-left: 4px solid #1E7A5F; margin: 20px 0; word-break: break-all; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏔️ TrekkingAR</h1>
            <p style="margin: 0; font-size: 18px;">Bienvenido a la aventura</p>
          </div>
          <div class="content">
            <h2>¡Hola, ${nombre}!</h2>
            <p>Gracias por registrarte en TrekkingAR. Estamos emocionados de tenerte con nosotros.</p>
            <p>Para completar tu registro y comenzar tu aventura, por favor verifica tu correo electrónico haciendo clic en el botón de abajo:</p>

            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">✓ Verificar mi correo</a>
            </div>

            <p>O copia y pega este enlace en tu navegador:</p>
            <div class="url-box">
              <code>${verificationUrl}</code>
            </div>

            <p><strong>⚠️ Este enlace expirará en 24 horas.</strong></p>
            <p>Si no solicitaste esta cuenta, puedes ignorar este correo.</p>

            <p style="margin-top: 30px;">¡Nos vemos en la montaña! 🥾</p>
            <p><strong>El equipo de TrekkingAR</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} TrekkingAR - San Carlos de Bariloche, Río Negro, Argentina</p>
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Plantilla HTML para email de recuperación de contraseña
   */
  getPasswordResetEmailTemplate(nombre, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1E7A5F; color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: white; padding: 30px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
          .button { display: inline-block; padding: 15px 40px; background-color: #D98B3A; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .button:hover { background-color: #c47a2f; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .url-box { background-color: #f0f8f0; padding: 15px; border-left: 4px solid #1E7A5F; margin: 20px 0; word-break: break-all; }
          .warning { background-color: #fff3e0; padding: 15px; border-left: 4px solid #D98B3A; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏔️ TrekkingAR</h1>
            <p style="margin: 0; font-size: 18px;">Recuperación de contraseña</p>
          </div>
          <div class="content">
            <h2>Hola${nombre ? `, ${nombre}` : ''},</h2>
            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en TrekkingAR.</p>
            <p>Si realizaste esta solicitud, haz clic en el botón de abajo para crear una nueva contraseña:</p>

            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">🔐 Restablecer contraseña</a>
            </div>

            <p>O copia y pega este enlace en tu navegador:</p>
            <div class="url-box">
              <code>${resetUrl}</code>
            </div>

            <div class="warning">
              <p><strong>⚠️ Importante:</strong></p>
              <ul style="margin: 10px 0;">
                <li>Este enlace expirará en 1 hora por seguridad</li>
                <li>Si no solicitaste este cambio, ignora este correo</li>
                <li>Tu contraseña actual seguirá funcionando</li>
              </ul>
            </div>

            <p>Si tienes problemas con el enlace o no solicitaste este cambio, contáctanos de inmediato.</p>

            <p style="margin-top: 30px;">Saludos,</p>
            <p><strong>El equipo de TrekkingAR</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} TrekkingAR - San Carlos de Bariloche, Río Negro, Argentina</p>
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Envía email de confirmación de suscripción al newsletter
   */
  async sendNewsletterConfirmationEmail(suscriptor) {
    if (!this.transporter) {
      throw new Error('Email service no configurado');
    }

    const mailOptions = {
      from: process.env.GMAIL_SMTP_USER,
      to: suscriptor.email,
      subject: '¡Bienvenido al Newsletter de TrekkingAR!',
      html: this.getNewsletterConfirmationTemplate(suscriptor)
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email de confirmación de newsletter enviado:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error enviando email de confirmación de newsletter:', error);
      throw error;
    }
  }

  /**
   * Envía campaña de newsletter a un suscriptor
   */
  async sendNewsletterCampaign(suscriptor, campania) {
    if (!this.transporter) {
      throw new Error('Email service no configurado');
    }

    const mailOptions = {
      from: `TrekkingAR <${process.env.GMAIL_SMTP_USER}>`,
      to: suscriptor.email,
      subject: campania.asunto,
      html: this.getNewsletterCampaignTemplate(suscriptor, campania)
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Campaña enviada a ${suscriptor.email}:`, result.messageId);
      return result;
    } catch (error) {
      console.error(`Error enviando campaña a ${suscriptor.email}:`, error);
      throw error;
    }
  }

  /**
   * Plantilla HTML para confirmación de suscripción al newsletter
   */
  getNewsletterConfirmationTemplate(suscriptor) {
    const unsubscribeUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/newsletter/unsubscribe/${suscriptor.token_desuscripcion}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #1E7A5F 0%, #2a9d7a 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
          .content { padding: 40px 30px; }
          .content p { margin: 15px 0; }
          .highlight { background-color: #e9f5f0; padding: 20px; margin: 25px 0; border-left: 4px solid #1E7A5F; border-radius: 4px; }
          .footer { background-color: #f9f9f9; padding: 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e0e0e0; }
          .unsubscribe { margin-top: 15px; }
          .unsubscribe a { color: #999; text-decoration: none; }
          .unsubscribe a:hover { text-decoration: underline; }
          .icon { font-size: 48px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="icon">🏔️</div>
            <h1>¡Bienvenido a TrekkingAR!</h1>
            <p>Tu newsletter de aventuras</p>
          </div>
          <div class="content">
            <p>Hola${suscriptor.nombre ? ` <strong>${suscriptor.nombre}</strong>` : ''},</p>

            <p>¡Gracias por suscribirte a nuestro newsletter! 🎒</p>

            <p>A partir de ahora recibirás en tu correo:</p>

            <div class="highlight">
              <ul style="margin: 0; padding-left: 20px;">
                <li>🗻 Nuevas rutas y destinos de trekking</li>
                <li>🎁 Ofertas exclusivas y promociones</li>
                <li>📸 Consejos y guías de aventura</li>
                <li>🌟 Novedades de la comunidad TrekkingAR</li>
              </ul>
            </div>

            <p>Nos alegra que formes parte de nuestra comunidad de aventureros.</p>

            <p style="margin-top: 30px;">¡Nos vemos en la montaña! 🥾</p>
            <p><strong>El equipo de TrekkingAR</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} TrekkingAR - San Carlos de Bariloche, Río Negro, Argentina</p>
            <div class="unsubscribe">
              <p>Si deseas dejar de recibir estos correos, puedes <a href="${unsubscribeUrl}">darte de baja aquí</a>.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Plantilla HTML para campaña de newsletter
   */
  getNewsletterCampaignTemplate(suscriptor, campania) {
    const unsubscribeUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/newsletter/unsubscribe/${suscriptor.token_desuscripcion}`;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Procesar el cuerpo para convertir saltos de línea en HTML
    const cuerpoHTML = campania.cuerpo.replace(/\n/g, '<br>');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #1E7A5F 0%, #2a9d7a 100%); color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 40px 30px; }
          .content p { margin: 15px 0; }
          .image-container { text-align: center; margin: 25px 0; }
          .image-container img { max-width: 100%; height: auto; border-radius: 8px; }
          .cta-button { display: inline-block; padding: 15px 40px; background-color: #D98B3A; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .cta-button:hover { background-color: #c47a2f; }
          .discount-code { background-color: #fff3e0; padding: 20px; margin: 25px 0; border-left: 4px solid #D98B3A; border-radius: 4px; text-align: center; }
          .discount-code .code { font-size: 24px; font-weight: bold; color: #D98B3A; letter-spacing: 2px; margin: 10px 0; }
          .footer { background-color: #f9f9f9; padding: 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e0e0e0; }
          .unsubscribe { margin-top: 15px; }
          .unsubscribe a { color: #999; text-decoration: none; }
          .unsubscribe a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏔️ TrekkingAR</h1>
          </div>
          <div class="content">
            <p>Hola${suscriptor.nombre ? ` <strong>${suscriptor.nombre}</strong>` : ''},</p>

            ${campania.imagen_campania ? `
              <div class="image-container">
                <img src="${campania.imagen_campania}" alt="${campania.nombre}">
              </div>
            ` : ''}

            <div>
              ${cuerpoHTML}
            </div>

            ${campania.codigo_descuento ? `
              <div class="discount-code">
                <p style="margin: 0 0 10px 0; font-weight: bold;">¡Aprovecha tu descuento exclusivo!</p>
                <div class="code">${campania.codigo_descuento}</div>
                ${campania.descuento_porcentaje ? `
                  <p style="margin: 10px 0 0 0; color: #D98B3A; font-size: 18px; font-weight: bold;">${campania.descuento_porcentaje}% OFF</p>
                ` : ''}
                ${campania.fecha_fin ? `
                  <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">Válido hasta: ${new Date(campania.fecha_fin).toLocaleDateString('es-AR')}</p>
                ` : ''}
              </div>
            ` : ''}

            <div style="text-align: center; margin: 30px 0;">
              <a href="${frontendUrl}" class="cta-button">Ver todas las aventuras</a>
            </div>

            <p style="margin-top: 30px;">¡Nos vemos en la montaña! 🥾</p>
            <p><strong>El equipo de TrekkingAR</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} TrekkingAR - San Carlos de Bariloche, Río Negro, Argentina</p>
            <div class="unsubscribe">
              <p>Si deseas dejar de recibir estos correos, puedes <a href="${unsubscribeUrl}">darte de baja aquí</a>.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Envía email de confirmación de pago
   */
  async sendPaymentConfirmationEmail(paymentData) {
    if (!this.transporter) {
      throw new Error('Email service no configurado');
    }

    const { usuario, compra, pago, reservas } = paymentData;

    if (!usuario || !usuario.email) {
      console.warn('No se puede enviar email de confirmación: usuario sin email');
      return;
    }

    const mailOptions = {
      from: process.env.GMAIL_SMTP_USER,
      to: usuario.email,
      subject: `Confirmación de Pago - Compra #${compra.numero_compra}`,
      html: this.getPaymentConfirmationTemplate(paymentData)
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email de confirmación de pago enviado:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error enviando email de confirmación de pago:', error);
      throw error;
    }
  }

  /**
   * Plantilla HTML para confirmación de pago
   */
  getPaymentConfirmationTemplate(paymentData) {
    const { usuario, compra, pago, reservas } = paymentData;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Formatear fecha de pago
    const fechaPago = new Date(pago.fecha_pago).toLocaleString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Generar lista de reservas
    let reservasHTML = '';
    if (reservas && reservas.length > 0) {
      reservasHTML = reservas.map(reserva => `
        <div style="background-color: #f9f9f9; padding: 15px; margin: 10px 0; border-left: 4px solid #1E7A5F; border-radius: 4px;">
          <p style="margin: 5px 0;"><strong>Viaje:</strong> ${reserva.viaje_nombre || 'Viaje de aventura'}</p>
          <p style="margin: 5px 0;"><strong>Fecha:</strong> ${reserva.fecha_viaje ? new Date(reserva.fecha_viaje).toLocaleDateString('es-AR') : 'Fecha a confirmar'}</p>
          <p style="margin: 5px 0;"><strong>Personas:</strong> ${reserva.cantidad_personas || 1}</p>
          <p style="margin: 5px 0;"><strong>Estado:</strong> <span style="color: #1E7A5F; font-weight: bold;">✓ CONFIRMADA</span></p>
        </div>
      `).join('');
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 650px; margin: 20px auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #1E7A5F 0%, #2a9d7a 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
          .success-badge { background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 15px 0; font-weight: bold; }
          .content { padding: 40px 30px; }
          .content p { margin: 15px 0; }
          .info-box { background-color: #e9f5f0; padding: 20px; margin: 25px 0; border-left: 4px solid #1E7A5F; border-radius: 4px; }
          .info-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .info-label { font-weight: bold; color: #1E7A5F; }
          .info-value { color: #333; }
          .total-box { background-color: #fff3e0; padding: 20px; margin: 25px 0; border-left: 4px solid #D98B3A; border-radius: 4px; text-align: center; }
          .total-amount { font-size: 32px; font-weight: bold; color: #D98B3A; margin: 10px 0; }
          .button { display: inline-block; padding: 15px 40px; background-color: #1E7A5F; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .button:hover { background-color: #176a50; }
          .footer { background-color: #f9f9f9; padding: 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e0e0e0; }
          .divider { border-top: 2px solid #e0e0e0; margin: 30px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏔️ TrekkingAR</h1>
            <p>Confirmación de Pago</p>
            <div class="success-badge">✓ PAGO APROBADO</div>
          </div>
          <div class="content">
            <h2>¡Gracias por tu compra, ${usuario.nombre}!</h2>
            <p>Tu pago ha sido procesado exitosamente. A continuación encontrarás los detalles de tu compra:</p>

            <div class="info-box">
              <h3 style="margin-top: 0; color: #1E7A5F;">📋 Información de la Compra</h3>
              <div class="info-row">
                <span class="info-label">Número de Compra:</span>
                <span class="info-value"><strong>#${compra.numero_compra}</strong></span>
              </div>
              <div class="info-row">
                <span class="info-label">Fecha de Pago:</span>
                <span class="info-value">${fechaPago}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Método de Pago:</span>
                <span class="info-value">Mercado Pago</span>
              </div>
              <div class="info-row">
                <span class="info-label">ID de Transacción:</span>
                <span class="info-value">${pago.referencia_externa || 'N/A'}</span>
              </div>
            </div>

            ${reservas && reservas.length > 0 ? `
              <h3 style="color: #1E7A5F;">🎒 Tus Reservas Confirmadas</h3>
              ${reservasHTML}
            ` : ''}

            <div class="total-box">
              <p style="margin: 0 0 10px 0; font-weight: bold; color: #666;">Total Pagado</p>
              <div class="total-amount">$${Number(pago.monto).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>

            <div class="divider"></div>

            <h3 style="color: #1E7A5F;">📌 Próximos Pasos</h3>
            <ul style="line-height: 2;">
              <li>Recibirás más información sobre tu viaje por email antes de la fecha de salida</li>
              <li>Puedes revisar tus reservas en cualquier momento desde tu perfil</li>
              <li>Si tienes alguna consulta, no dudes en contactarnos</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${frontendUrl}/mis-reservas" class="button">Ver Mis Reservas</a>
            </div>

            <p style="margin-top: 30px;">¡Nos vemos en la montaña! 🥾</p>
            <p><strong>El equipo de TrekkingAR</strong></p>
          </div>
          <div class="footer">
            <p><strong>¿Necesitas ayuda?</strong></p>
            <p>Contáctanos en ${process.env.GMAIL_SMTP_USER || 'info@trekkingar.com'}</p>
            <p style="margin-top: 20px;">© ${new Date().getFullYear()} TrekkingAR - San Carlos de Bariloche, Río Negro, Argentina</p>
            <p>Este es un correo automático de confirmación. Por favor, guárdalo para tus registros.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Plantilla HTML para notificaciones del sistema
   */
  getSystemNotificationTemplate(notificationData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Notificación del sistema</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2C6EA4; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .priority { padding: 10px; margin: 10px 0; border-radius: 5px; }
          .priority.alta { background-color: #ffebee; border-left: 4px solid #f44336; }
          .priority.urgente { background-color: #ffcdd2; border-left: 4px solid #d32f2f; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Notificación del sistema</h1>
          </div>
          <div class="content">
            <div class="priority ${notificationData.prioridad}">
              <strong>Prioridad:</strong> ${notificationData.prioridad.toUpperCase()}
            </div>
            
            <h2>${notificationData.titulo}</h2>
            <p>${notificationData.mensaje}</p>
            
            ${notificationData.meta ? `
              <h3>Información adicional:</h3>
              <pre>${JSON.stringify(notificationData.meta, null, 2)}</pre>
            ` : ''}
            
            <p><strong>Fecha:</strong> ${new Date(notificationData.createdAt).toLocaleString('es-AR')}</p>
          </div>
          <div class="footer">
            <p>Esta es una notificación automática del sistema TrekkingApp.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

// Exportar instancia singleton
export default new EmailService();
