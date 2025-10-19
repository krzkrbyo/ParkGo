# ParkGo - Development Build para Impresión Térmica

Este documento explica cómo configurar y usar el Development Build de ParkGo para habilitar la impresión térmica Bluetooth.

## Requisitos Previos

- Node.js 18+
- Expo CLI
- Android Studio (para Android)
- Xcode (para iOS, solo en macOS)

## Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env` y configura:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de Supabase:

```env
EXPO_PUBLIC_SUPABASE_URL=tu_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
EXPO_PUBLIC_DEEP_LINK_SCHEME=parkgo
```

## Development Build

### Para Android

1. **Prebuild del proyecto:**
   ```bash
   npx expo prebuild --platform android
   ```

2. **Construir Development Build:**
   ```bash
   npx expo run:android
   ```

3. **Instalar en dispositivo físico:**
   - Conecta tu dispositivo Android via USB
   - Habilita "Depuración USB" en Opciones de Desarrollador
   - Ejecuta: `npx expo run:android --device`

### Para iOS

1. **Prebuild del proyecto:**
   ```bash
   npx expo prebuild --platform ios
   ```

2. **Construir Development Build:**
   ```bash
   npx expo run:ios
   ```

## Uso de la Impresión Térmica

### Ruta 1: Impresión Estándar (Expo Go compatible)

1. **Navegar a TestPrintScreen:**
   - Usa el componente `PrintableQRCode`
   - Configura tamaño, papel y zona silenciosa
   - Genera PDF o imprime directamente

2. **Características:**
   - QR codes de alta calidad (≥600px)
   - Control de tamaño físico en milímetros
   - Quiet zone configurable
   - Generación de PDF con `expo-print`

### Ruta 2: Impresión Térmica Bluetooth

1. **Navegar a TestThermalScreen:**
   - Escanea dispositivos Bluetooth
   - Conecta a impresora térmica
   - Configura parámetros QR

2. **Comandos ESC/POS soportados:**
   - QR Code nativo (Modelo 2)
   - Tamaño de módulo 1-16
   - Niveles de corrección L/M/Q/H
   - Alineación de texto
   - Feed y corte de papel

3. **Impresoras compatibles:**
   - SAT AF330
   - Impresoras ESC/POS estándar
   - Dispositivos con característica de escritura BLE

## Configuración de Impresora

### SAT AF330

1. **Encender la impresora**
2. **Activar Bluetooth** (modo pareable)
3. **En la app:**
   - Escanear dispositivos
   - Seleccionar "SAT" o "AF330"
   - Conectar
   - Probar impresión

### Otras Impresoras

1. **Verificar compatibilidad ESC/POS**
2. **Activar Bluetooth**
3. **Buscar en la lista de dispositivos**
4. **Probar con "Impresión de Prueba"**

## Solución de Problemas

### Bluetooth no funciona

1. **Verificar permisos:**
   - Android: Configuración > Aplicaciones > ParkGo > Permisos
   - Asegurar que Bluetooth y Ubicación estén habilitados

2. **Verificar versión Android:**
   - Mínimo Android 6.0 (API 23)
   - Recomendado Android 8.0+

3. **Reiniciar Bluetooth:**
   - Desactivar y reactivar Bluetooth
   - Reiniciar la app

### Impresión no funciona

1. **Verificar conexión:**
   - Estado "Conectado" en la app
   - Impresora encendida y en rango

2. **Verificar papel:**
   - Papel térmico instalado
   - Sin atascos

3. **Probar con impresión simple:**
   - Usar "Impresión de Prueba" primero
   - Verificar que la impresora responda

### QR Code no se lee

1. **Ajustar tamaño de módulo:**
   - Probar valores 4-8
   - Aumentar para texto largo

2. **Cambiar nivel de corrección:**
   - Usar 'M' o 'Q' para mejor legibilidad
   - 'H' para máxima corrección

3. **Verificar quiet zone:**
   - Asegurar margen blanco alrededor del QR
   - Mínimo 4 módulos de espacio

## Estructura del Proyecto

```
components/
  PrintableQRCode.tsx     # Componente QR para impresión estándar

screens/
  TestPrintScreen.tsx     # Prueba impresión estándar + PDF
  TestThermalScreen.tsx   # Prueba impresión térmica Bluetooth

ble/
  ESCPos.ts              # Comandos ESC/POS
  ThermalPrinterService.ts # Servicio Bluetooth

app.json                 # Permisos Android Bluetooth
```

## Comandos Útiles

```bash
# Limpiar y reinstalar
npm run clean && npm install

# Prebuild para Android
npx expo prebuild --platform android --clear

# Construir Development Build
npx expo run:android

# Ejecutar en dispositivo específico
npx expo run:android --device

# Ver logs
npx expo run:android --variant debug
```

## Notas Importantes

1. **Expo Go vs Development Build:**
   - Expo Go: Solo impresión estándar (PDF)
   - Development Build: Impresión térmica Bluetooth

2. **Permisos Android:**
   - Bluetooth requiere ubicación
   - Solicitar permisos en tiempo de ejecución

3. **Rendimiento:**
   - QR codes grandes pueden tardar en generar
   - Usar chunks pequeños para BLE

4. **Compatibilidad:**
   - Probar con diferentes impresoras
   - Ajustar parámetros según modelo

## Soporte

Para problemas específicos:

1. Revisar logs de la consola
2. Verificar configuración de Bluetooth
3. Probar con impresora diferente
4. Ajustar parámetros QR (módulo, ECL)

---

**Desarrollado para ParkGo - Sistema de Estacionamiento Inteligente**
