<p align="center">
  <a href="#">
    <img alt="Nyx" src="https://cdn.discordapp.com/attachments/707047887200321609/963261054249492490/nyx.png"/>
  </a>
</p>

---

<p align="center">
  Nyx es una plantilla de Bots de Discord escrita en Typescript, que soporta la mayoría de las características de Discord.js junto con otras herramientas útiles para desarrollo de bots.
  <br>
  <a href = "https://github.com/Amgelo563/nyx/blob/main/README.md"><b>🇺🇸 English README</b></a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/workflow/status/Amgelo563/nyx/Build?logo=github&style=for-the-badge" alt="Build Status" />
  <a href="https://github.com/Amgelo563/nyx/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/licencia-MIT-blue.svg?style=for-the-badge" alt="Nyx usa la licencia MIT." />
  </a>
  <img src="https://img.shields.io/badge/PRs-bienvenidas-brightgreen.svg?style=for-the-badge" alt="PRs bienvenidas!" />
  <img src="https://img.shields.io/badge/Forks-bienvenidos-brightgreen.svg?style=for-the-badge" alt="Forks bienvenidos!" />
</p>

## 📚 Introducción
Esta es una plantilla para dar a desarrolladores (y a mi mismo) un inicio fácil pero robusto para desarrollar bots.

La plantilla por defecto no está completamente hecha para ser usada en bots públicos grandes, pues no soporta opciones cruciales como Sharding, o, irónicamente, soporta opciones que no necesitan como comandos en mensajes, aunque siempre puedes adaptar la plantilla a tu gusto.

La plantilla funciona al 100% solo clonando el repositorio, instalando las dependencias y cambiando tu config.json. Y, de hecho, incluye comandos de ejemplo para que puedas ver las posibilidades del bot.

Esta plantilla está inspirada por [Modbot](https://github.com/aternosorg/modbot).

## ✨ Características
Todas estas características están incluidas en la plantilla. Puedes modificar todas a tu gusto o incluir más.

### Eventos
* Registra varias acciones por evento, o escucha a tus propios eventos.

### Schedules
* Programa acciones que pasen solo a una hora exacta o cada cierto tiempo.
* Para y reanuda Schedules a tu gusto.
* [Usa Cron](https://crontab.guru/) para cronometrar los eventos.

### Comandos
* Soporte de comandos de mensajes y slash commands con solo una declaración.
* Soporte de subcomandos, registrados también en Discord.
* Parseo automático de argumentos en comandos de texto a un [CommandInteractionOptionResolver](https://discord.js.org/#/docs/main/stable/class/CommandInteractionOptionResolver).
* Soporte de aliases de comandos (solo en comandos de mensaje), descripciones de comando y sintaxis de comandos.
* Soporte para múltiples prefixes.
* Soporte automático de categorías de comandos.
* Soporte de comprobación de permisos (GuildMembers solo pueden ejecutar comandos si tienen ciertos permisos).
* Soporte de autocompletado: responde a los autocompletados como desees.
* Soporte de Context Menus ([User Commands](https://discord.com/developers/docs/interactions/application-commands#user-commands) y [Message Commands](https://discord.com/developers/docs/interactions/application-commands#message-commands)).
* Soporte por defecto de comandos por MD, puede ser desactivado por comando.
* Colorea tus comandos añadiendo un `defaultColor` a su data.

### Otros
* Soporte incorporado de [Prisma](https://www.prisma.io/) para administración de bases de datos de forma fácil y rápida.
* Soporte incorporado de [Tracer](https://www.npmjs.com/package/tracer) para registro en consola completo.
* *(Teóricamente pero no muy práctico?)* Soporte para múltiples bots corriendo al mismo tiempo.

## 📖 Uso
[Revisa la Wiki para pasos de cómo usar la plantilla.](https://github.com/Amgelo563/nyx/wiki)

## 🌐 Licencia

[LICENSE](https://github.com/Amgelo563/nyx/blob/main/LICENSE)

Nyx está licensiado bajo la Licencia MIT, especificada arriba.

Si no quieres leer toda la licencia, este es un resumen:

* **✅ Puedes:** Modificar el software para tu uso personal o público, distribuirlo libremente y/o comercialmente.

* **❌ No puedes:** Cambiar la licencia, aunque se puede incluir dentro de un proyecto con una licencia más restrictiva, pero el código original se mantiene licenciado bajo MIT.

* **📝 Debes:** Incluir el copyright (archivo LICENSE) dentro del código modificado.

No necesitas incluir explícitamente crédito a este repositorio (todo el crédito ya se encuentra dentro de LICENSE), pero estaré muy agradecido si lo haces 💙.

## 🚧 Disclaimers
* Para evitar comandos sin sentido, solo el primer nombre es usado para registrar slash commands. El resto solo funciona en comandos de mensajes.
* Hay algunas partes del código (como static overriding la data de comandos) que no son exactamente muy lindas. La plantilla está siempre abierta a sugerencias y/o PRs.
