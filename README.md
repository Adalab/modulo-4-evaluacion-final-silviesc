# Proyecto: Evaluación final módulo 4 - Express JS y BBDD
Este proyecto consiste en una API que proporciona acceso a información sobre distintos artistas y festivales. 
Utiliza el formato JSON para las solicitudes y respuestas, y requiere autenticación para algunas operaciones.

# Endpoints disponibles
1. GET /artists: Obtiene información sobre todas las artistas.
2. GET /artists/:id: Obtiene información sobre una artista en específico según su ID.
3. POST /artists: Añade un nuevo artista a la base de datos.
4. PUT /artists/:id: Actualiza la información de una artista existente.
5. DELETE /artists/:id: Elimina una artista de la base de datos.
6. GET /festivals: Obtiene información sobre todos los festivales.
7. GET /festivals/:id: Obtiene información sobre un festival en concreto según su ID.
8. POST /festivals: Añade un nuevo festival a la base de datos.
9. PUT /festivals/:id: Actualiza la información de un festival existente.
10. DELETE /festivals/:id: Elimina un festival de la base de datos.
11. GET /all_info: Obtiene información sobre artistas y festivales relacionados.
12. POST /register: Registra un nuevo usuario en la base de datos.
13. POST /login: Inicia sesión en la API para obtener un token de acceso.

# Autenticación
Para acceder a ciertos endpoints, es necesario autenticarse proporcionando un token de acceso en el encabezado de autorización de la solicitud.

# Ejemplos de solicitud y respuesta
Para obtener información sobre todas las artistas y el festival con el que están relacionadas, abrimos la app de Postman e introducimos lo siguiente:
- Hacemos click en el método HTTP "GET" 
- Introducimos la ruta "http://localhost:4000/all_info"
- Pulsamos el botón "Send"

En la parte inferior de la pantalla, nos aparecerá la siguiente respuesta: 
{
    "success": true,
    "results": [
        {
            "idArtist": 2,
            "name": "Dua Lipa",
            "genre": "Pop",
            "hit": "Houdini",
            "grammys": 7,
            "festival_name": "Primavera Sound"
        },
        {
            "idArtist": 5,
            "name": "Lana del Rey",
            "genre": "Indie pop",
            "hit": "Born to die",
            "grammys": 5,
            "festival_name": "Primavera Sound"
        },
        {
            "idArtist": 3,
            "name": "Charlotte de Witte",
            "genre": "Techno",
            "hit": "Overdrive",
            "grammys": 2,
            "festival_name": "Aquasella"
        },
        {
            "idArtist": 4,
            "name": "Rihanna",
            "genre": "R&B",
            "hit": "Umbrella",
            "grammys": 10,
            "festival_name": "Monegros"
        }
    ]
}


# Códigos de estado HTTP
400: Solicitud incorrecta.
404: Recurso no encontrado.
500: Error interno del servidor.