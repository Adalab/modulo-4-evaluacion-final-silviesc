//importar las dependencias
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

//crear el servidor
const server = express();
server.use(cors());
server.use(express.json());

//definir el puerto 
const port = process.env.PORT || 4500;

//crear la conexión con la BD
async function getConnection() {
    const conex = await mysql.createConnection({
        host: process.env.HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || 'r00t',
        database: 'music',
    });
    conex.connect();
    return conex;
}

getConnection();

server.listen(port, () => {
    console.log(`Servidor escuchando por http://localhost:${port}`);
})

//endpoint para obtener todas las artistas guardadas
server.get('/artists', async(req, res) => {
    const conex = await getConnection();
    const artistsSQL = 'SELECT * FROM artists';
    const [result] = await conex.query(artistsSQL);
    const numberOfElements = result.length;
    res.json({
        info: {count: numberOfElements}, 
        results: result
    });
});

//endpoint para obtener todos los festivales guardados
server.get('/festivals', async(req, res) => {
    const conex = await getConnection();
    const festivalsSQL = 'SELECT * FROM festivals';
    const [result] = await conex.query(festivalsSQL);
    const numberOfElements = result.length;
    res.json({
        info: {count: numberOfElements}, 
        results: result
    });
});

//endpoint para obtener una artista por su ID
server.get('/artists/:id', async(req, res) => {
    const conex = await getConnection();
    const idArtist = req.params.id;
    if(isNaN(idArtist)) { 
        return res.json({success: false, error: 'El ID de la artista debe ser un número'})
    };
    const getArtist = 'SELECT * FROM artists WHERE idArtist = ?';
    const [result] = await conex.query(getArtist, [idArtist]);
    if (result.length === 0) {
        return res.json({success: false, error: 'El ID introducido no existe'})
    }; 
    res.json({success: true, artista: result[0]});
});

//endpoint para obtener un festival por su ID
server.get('/festivals/:id', async(req, res) => {
    const conex = await getConnection();
    const idFestival = req.params.id;
    if(isNaN(idFestival)) { 
        return res.json({success: false, error: 'El ID del festival debe ser un número'})
    };
    const getFestival = 'SELECT * FROM festivals WHERE idFestival = ?';
    const [result] = await conex.query(getFestival, [idFestival]);
    if (result.length === 0) {
        return res.json({success: false, error: 'El ID introducido no existe'})
    }; 
    res.json({success: true, festival: result[0]});
});

//endpoint para añadir una nueva artista
server.post('/artists', async(req, res) => {
    const conex = await getConnection();
    const data = req.body;
    const {nameArtist, musicalGenre, hit, grammys} = data;
    const newArtist = 'INSERT INTO artists (name, genre, hit, grammys) VALUES (?, ?, ?, ?)';
    const [result] = await conex.query(newArtist, [nameArtist, musicalGenre, hit, grammys]);
    res.json({
        success: true,
        id: result.insertId
    });
});

//endpoint para añadir un nuevo festival
server.post('/festivals', async(req, res) => {
    const conex = await getConnection();
    const data = req.body;
    const {nameFestival, location, date, ticketPrice} = data;
    const newFestival = 'INSERT INTO festivals (name, location, date, price) VALUES (?, ?, ?, ?)';
    const [result] = await conex.query(newFestival, [nameFestival, location, date, ticketPrice]);
    res.json({
        success: true,
        id: result.insertId
    });
});

//endpoint para actualizar una artista existente
server.put('/artists/:id', async(req, res) => {
    const conex = await getConnection();
    const id = req.params.id;
    const data = req.body;
    const {nameArtist, musicalGenre, hit, grammys} = data;
    const modifyArtist = 'UPDATE artists SET name = ?, genre = ?, hit = ?, grammys = ? WHERE idArtist = ?';
    const [result] = await conex.query(modifyArtist, [nameArtist, musicalGenre, hit, grammys, id]);
    res.json({
        success: true,
        message: 'La artista ha sido actualizada correctamente'
    });
});

//endpoint para actualizar un festival existente
server.put('/festivals/:id', async(req, res) => {
    const conex = await getConnection();
    const id = req.params.id;
    const data = req.body;
    const {nameFestival, location, date, ticketPrice} = data;
    const modifyFestival = 'UPDATE festivals SET name = ?, location = ?, date = ?, price = ? WHERE idFestival = ?';
    const [result] = await conex.query(modifyFestival, [nameFestival, location, date, ticketPrice, id]);
    res.json({
        success: true,
        message: 'El festival ha sido actualizado correctamente'
    });
});

//endpoint para eliminar una artista de la BD
server.delete('/artists/:id', async (req, res) => {
    const conex = await getConnection();
    const id = req.params.id;
    const deleteArtist = 'DELETE FROM artists WHERE idArtist = ?';
    const [result] = await conex.query(deleteArtist, [id]);
    if(result.affectedRows > 0) {
        res.json({
            success: true,
            message: 'La artista ha sido eliminada correctamente'
        });
    } else {
        res.json({
            success: false,
            message: 'No se ha podido eliminar la artista seleccionada'
        });
    };
});

//endpoint para eliminar un festival de la BD
server.delete('/festivals/:id', async (req, res) => {
    const conex = await getConnection();
    const id = req.params.id;
    const deleteFestival = 'DELETE FROM festivals WHERE idFestival = ?';
    const [result] = await conex.query(deleteFestival, [id]);
    if(result.affectedRows > 0) {
        res.json({
            success: true,
            message: 'El festival ha sido eliminado correctamente'
        });
    } else {
        res.json({
            success: false,
            message: 'No se ha podido eliminar el festival seleccionado'
        });
    };
});


