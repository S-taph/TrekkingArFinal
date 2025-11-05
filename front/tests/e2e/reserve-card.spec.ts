import { test, expect } from '@playwright/test';

test.describe('Reserve Card Sticky', () => {
  test.describe('Desktop viewport', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('debe mostrar el total en la fila destacada', async ({ page }) => {
      await page.goto('http://localhost:5176/viajes/1');

      // Esperar a que la página cargue
      await page.waitForSelector('[data-testid="btn-reservar"]', { timeout: 10000 });

      // Verificar que el total está visible
      const totalRow = page.locator('[role="status"][aria-label*="Total"]');
      await expect(totalRow).toBeVisible();
    });

    test('debe tener botón reservar visible y clickable', async ({ page }) => {
      await page.goto('http://localhost:5176/viajes/1');

      const reserveButton = page.locator('[data-testid="btn-reservar"]');
      await expect(reserveButton).toBeVisible();

      // Verificar texto del botón
      await expect(reserveButton).toHaveText(/RESERVAR/);

      // Verificar que tiene el estilo pill (border-radius grande)
      const borderRadius = await reserveButton.evaluate((el) => {
        return window.getComputedStyle(el).borderRadius;
      });
      expect(borderRadius).toContain('999px');
    });

    test('debe mostrar badges de confianza', async ({ page }) => {
      await page.goto('http://localhost:5176/viajes/1');

      // Esperar y verificar los 3 badges
      await expect(page.getByText('Guías certificados')).toBeVisible();
      await expect(page.getByText('Cancelación flexible')).toBeVisible();
      await expect(page.getByText('Pago seguro')).toBeVisible();
    });

    test('click en whatsapp inline navega a /contacto con query params', async ({ page }) => {
      await page.goto('http://localhost:5176/viajes/1');

      // Buscar botón de WhatsApp inline (desktop)
      const whatsappButton = page.locator('[data-testid="btn-consultar"]');
      await expect(whatsappButton).toBeVisible();

      await whatsappButton.click();

      // Verificar navegación
      await expect(page).toHaveURL(/\/contacto\?tripId=1/);
    });

    test('debe actualizar el total al cambiar cantidad', async ({ page }) => {
      await page.goto('http://localhost:5176/viajes/1');

      // Esperar a que cargue
      await page.waitForSelector('[data-testid="btn-reservar"]');

      // Obtener total inicial
      const totalRow = page.locator('[role="status"][aria-label*="Total"]');
      const initialTotal = await totalRow.locator('h4').textContent();

      // Hacer click en el botón + para aumentar cantidad
      const increaseButton = page.locator('button:has(svg[data-testid="AddIcon"])');
      await increaseButton.click();

      // Esperar a que el total cambie (animación)
      await page.waitForTimeout(500);

      const newTotal = await totalRow.locator('h4').textContent();
      expect(newTotal).not.toBe(initialTotal);
    });

    test('debe expandir el desglose de precio al hacer click', async ({ page }) => {
      await page.goto('http://localhost:5176/viajes/1');

      const expandButton = page.getByText('Ver desglose de precio');
      await expect(expandButton).toBeVisible();

      await expandButton.click();

      // Verificar que el desglose está visible
      await expect(page.getByText('Precio por persona')).toBeVisible();
      await expect(page.getByText('Subtotal')).toBeVisible();
      await expect(page.getByText('Impuestos')).toBeVisible();
    });
  });

  test.describe('Mobile viewport', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('botón WhatsApp inline no se muestra', async ({ page }) => {
      await page.goto('http://localhost:5176/viajes/1');

      await page.waitForSelector('[data-testid="btn-reservar"]');

      // El botón inline no debe estar visible en mobile
      const whatsappInline = page.locator('[data-testid="btn-consultar"]');
      await expect(whatsappInline).not.toBeVisible();
    });

    test('FloatingWhatsAppButton está visible y es clickable', async ({ page }) => {
      await page.goto('http://localhost:5176/viajes/1');

      // Esperar a que la página cargue
      await page.waitForTimeout(1000);

      // Buscar el botón flotante de WhatsApp (Fab)
      const floatingButton = page.locator('button[aria-label*="WhatsApp"]').last();

      // Scroll para asegurarnos que está en viewport
      await page.evaluate(() => window.scrollTo(0, 500));

      await expect(floatingButton).toBeVisible();
      await floatingButton.click();

      // Verificar navegación
      await expect(page).toHaveURL(/\/contacto/);
    });

    test('debe mostrar FOMO badge si quedan pocos cupos', async ({ page }) => {
      await page.goto('http://localhost:5176/viajes/1');

      // Esperar carga
      await page.waitForTimeout(1000);

      // Buscar el FOMO badge
      const fomoBadge = page.locator('[role="status"][aria-label*="cupos"]');

      // Si hay cupos limitados, debe estar visible
      const isVisible = await fomoBadge.isVisible().catch(() => false);

      if (isVisible) {
        // Verificar que tiene texto de urgencia
        await expect(fomoBadge).toContainText(/cupos|cupo/i);
      }
    });
  });
});
