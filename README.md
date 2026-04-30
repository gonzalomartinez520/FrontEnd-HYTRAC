## ¿Como ejecutar esto?
### 1. Requisitos

Instalar las siguientes dependencias:

* **Node.js 24 (LTS)**
* **npm** (incluido con Node.js, en linux puede que haga falta ser instalado)
* **Git**

### 2. Clonar el repositorio

```bash
git clone https://github.com/dmelhado/PP1-TPI-2026-1.git
cd PP1-TPI-2026-1.git
```

### 3. Preparar variable de Vite para desarrollo local

Es necesario indicarle a Vite dónde pegarle a la API. Crear el archivo `.env.development.local` en la raíz del proyecto.

Si se desea pegarle a una instancia local de la API, debe contener:
```
VITE_API_URL=http://localhost:8080/api
```

Si se desea pegarle a la API de producción, debe contener:
```
VITE_API_URL=http://hytrac.dmelhado.com/api
```

Este archivo es ignorado por git, por lo que no se subirán sus cambios.

NOTA: Puede ser que falle pegarle a la API de producción por temas de CORS. Falta hacer pruebas de esto. Quejarse con Dante en ese caso.

### 4. Ejecutar el Frontend

```bash
cd frontend
npm install
npm run dev
```

## Como llamar a la API

Todos los llamados a api deben hacerse utilizando la frase `${API_URL}/<llamado>`. Por ejemplo, si se quiere verificar si la API esta funcionando:

```jsx
const checkBackend = async () => {
  try {
    const res = await fetch(`${API_URL}/health`) 
    if (!res.ok) throw new Error("Bad response")
    setStatus("ok")
  } catch (err) {
    setStatus("error")
  }
}
```
