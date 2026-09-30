# Cambios

## 0.1.0 · En desarrollo

- Monorepo con una extensión Chrome, laboratorio local y paquetes comunes.
- Subproyectos por portal, con pantallas y conexiones organizadas por carpeta.
- Adaptación experimental de entrada e identificación del DNI con fixtures sintéticas.
- Carpetas preparadas para Hacienda y Registro de Asociaciones, desactivadas.
- Conexiones de controles React, recuperación del original y pruebas de navegador.
- Sistema de diseño común (`packages/design`, DESIGN.md): tokens con contraste AA, componentes y tema para webs con el framework Morfos de la AGE. El runtime, el popup y los portales lo usan.
- Portal de cita previa de Extranjería (experimental): página informativa, provincia, oficina y trámite, e información del trámite con la elección con o sin Cl@ve. Fixtures con HTML real de las páginas públicas.
- `site.config.json` admite `routes` con varias rutas por dominio y `verifiedAt`. Un content script por portal.
- Pantallas guiadas en el runtime (`panels`, `page`, `shell`) y espera a contenido oficial tardío con aviso de interfaz original.
- Acciones `custom` en `DomBridge` para elementos no nativos revisados.
- Herramientas `site:live`, `site:record` y `site:preview` para trabajar con la web real y sin conexión.
- Reportes de pantallas pendientes: captura local (`packages/capture` + Rampart), revisión en `report.html`, envío al intake privado y PR draft en `fixtures/inbox/` tras etiqueta de mantenimiento.
