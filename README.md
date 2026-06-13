# Moon Studio

Sitio web y sistema de turnos para Moon Studio. Permite conocer el estudio, sus servicios y profesionales, además de solicitar citas desde cualquier dispositivo.

Incluye un panel privado para administrar turnos, servicios, profesionales, horarios y días sin disponibilidad.

## Tecnologías

- React y Vite
- Node.js y Express
- MySQL
- Nginx

## Despliegue

La aplicación está desplegada en una instancia Ubuntu de Amazon Lightsail. Nginx sirve el frontend y actúa como proxy para la API, mientras que el backend y MySQL se ejecutan dentro del servidor.

La configuración contempla un dominio personalizado, conexión HTTPS y la incorporación de Cloudflare para administrar DNS, seguridad y caché.
