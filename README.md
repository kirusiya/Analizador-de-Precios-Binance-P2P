# Analizador de Precios Binance P2P

Una herramienta avanzada para analizar precios en tiempo real y proyectar tendencias futuras en el mercado Binance P2P (USDT/BOB). Diseñada para traders e inversores que buscan optimizar sus operaciones de compra y venta de criptomonedas.

## 🚀 Características

*   **Análisis de Precios en Tiempo Real:** Obtén el precio mínimo, máximo y el spread actual para operaciones de compra y venta de USDT en BOB.
*   **Proyecciones de Precios Inteligentes:** Un modelo predictivo que analiza tendencias y proyecta movimientos futuros de precios, sugiriendo el mejor momento para comprar o vender.
*   **Filtrado de Anunciantes por Experiencia:** Prioriza la seguridad y eficiencia al mostrar solo anunciantes con un historial comprobado (más de 500 órdenes completadas). Si no hay suficientes, muestra todos los disponibles.
*   **Tabla Detallada de Anunciantes:** Explora una lista completa de anunciantes con su reputación, disponibilidad, límites y métodos de pago. Incluye funcionalidad de búsqueda y ordenamiento.
*   **Interfaz de Usuario Intuitiva:** Una experiencia de usuario moderna y responsiva, construida con componentes de Shadcn/ui.
*   **Proxy API Robusto:** Un Route Handler en Next.js que actúa como un proxy para la API de Binance P2P, manejando la paginación y simulando solicitudes de navegador para una recolección de datos fiable.

## 🛠️ Tecnologías Utilizadas

*   **Next.js 14 (App Router):** Framework de React para aplicaciones web full-stack.
*   **React:** Biblioteca de JavaScript para construir interfaces de usuario.
*   **Tailwind CSS:** Framework CSS para un desarrollo rápido y estilizado.
*   **Shadcn/ui:** Componentes de UI reutilizables y accesibles, construidos con Radix UI y Tailwind CSS.
*   **Node.js:** Entorno de ejecución para el backend (Route Handler).
*   **`date-fns`:** Librería para manipulación y formateo de fechas.
*   **`lucide-react`:** Colección de iconos personalizables.
*   **`clsx` y `tailwind-merge`:** Utilidades para la gestión de clases CSS.

## ⚙️ Instalación y Configuración

Sigue estos pasos para configurar y ejecutar el proyecto localmente.

### Prerrequisitos

Asegúrate de tener instalado:

*   Node.js (versión 18 o superior)
*   npm o Yarn

### Pasos

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/binance-p2p-analyzer.git
    cd binance-p2p-analyzer
