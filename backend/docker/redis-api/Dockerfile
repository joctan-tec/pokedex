# Imagen base oficial de Python
FROM python:3.11-slim

# Seteamos el directorio de trabajo
WORKDIR /app

# Copiamos los archivos de dependencias primero
COPY requirements.txt .

# Instalamos las dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el resto del código de la aplicación
COPY app/ .

# Exponemos el puerto en el que la aplicación escuchará
EXPOSE 5000

# Comando para ejecutar la aplicación
CMD ["python", "main.py"]