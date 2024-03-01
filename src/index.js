//importar las dependencias
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//crear el servidor
const server = express();
server.use(cors());
server.use(express.json());

//definir el puerto
const port = process.env.PORT || 4500;

//crear la conexión con la BD
async function getConnection() {
  const conex = await mysql.createConnection({
    host: process.env.HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "r00t",
    database: "music",
  });
  conex.connect();
  return conex;
}

server.listen(port, () => {
  console.log(`Servidor escuchando por http://localhost:${port}`);
});

//endpoint para obtener todas las artistas guardadas
server.get("/artists", async (req, res) => {
  try {
    const conex = await getConnection();
    const artistsSQL = "SELECT * FROM artists";
    const [result] = await conex.query(artistsSQL);
    const numberOfElements = result.length;
    res.json({
      info: { count: numberOfElements },
      results: result,
    });
    conex.end();
  } catch (error) {
    console.error("Error al obtener las artistas:", error);
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
});

//endpoint para obtener todos los festivales guardados
server.get("/festivals", async (req, res) => {
  try {
    const conex = await getConnection();
    const festivalsSQL = "SELECT * FROM festivals";
    const [result] = await conex.query(festivalsSQL);
    const numberOfElements = result.length;
    res.json({
      info: { count: numberOfElements },
      results: result,
    });
    conex.end();
  } catch (error) {
    console.error("Error al obtener los festivales:", error);
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
});

//endpoint para obtener toda la info relacionada
server.get("/all_info", async (req, res) => {
  try {
    const conex = await getConnection();
    const all_info =
      "SELECT artists.idArtist, artists.name, artists.genre, artists.hit, artists.grammys, festivals.name AS festival_name FROM artists JOIN festivals ON artists.fk_festival = festivals.idFestival";
    const [result] = await conex.query(all_info);
    res.json({
      success: true,
      results: result,
    });
    conex.end();
  } catch (error) {
    console.error("Error al obtener los festivales:", error);
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
});

//endpoint para obtener una artista por su ID
server.get("/artists/:id", async (req, res) => {
  try {
    const conex = await getConnection();
    const idArtist = req.params.id;
    if (isNaN(idArtist)) {
      return res.json({
        success: false,
        error: "El ID de la artista debe ser un número",
      });
    }
    const getArtist = "SELECT * FROM artists WHERE idArtist = ?";
    const [result] = await conex.query(getArtist, [idArtist]);
    if (result.length === 0) {
      return res.json({ success: false, error: "El ID introducido no existe" });
    }
    res.json({ success: true, artista: result[0] });
    conex.end(); // Cerrar la conexión después de usarla
  } catch (error) {
    console.error("Error al obtener la artista:", error);
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
});

//endpoint para obtener un festival por su ID
server.get("/festivals/:id", async (req, res) => {
  try {
    const conex = await getConnection();
    const idFestival = req.params.id;
    if (isNaN(idFestival)) {
      return res.json({
        success: false,
        error: "El ID del festival debe ser un número",
      });
    }
    const getFestival = "SELECT * FROM festivals WHERE idFestival = ?";
    const [result] = await conex.query(getFestival, [idFestival]);
    if (result.length === 0) {
      return res.json({ success: false, error: "El ID introducido no existe" });
    }
    res.json({ success: true, festival: result[0] });
    conex.end(); // Cerrar la conexión después de usarla
  } catch (error) {
    console.error("Error al obtener el festival:", error);
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
});

//endpoint para añadir una nueva artista
server.post("/artists", async (req, res) => {
    try {
      const conex = await getConnection();
      const data = req.body;
      const { nameArtist, musicalGenre, hit, grammys, festivalName } = data;
      if (!nameArtist || !musicalGenre || !hit || !grammys || !festivalName) {
        return res
          .status(400)
          .json({
            success: false,
            error: 'Se requieren todos los campos: nameArtist, musicalGenre, hit, grammys y festivalName',
          });
      }
      if (isNaN(grammys)) {
        return res
          .status(400)
          .json({ success: false, error: "El campo grammys debe ser un número" });
      }
      // Consulta para obtener el ID del festival
      const festivalQuery = 'SELECT idFestival FROM festivals WHERE name = ?';
      const [festivalResult] = await conex.query(festivalQuery, [festivalName]);
      if (festivalResult.length === 0) {
        return res.status(400).json({ success: false, error: 'El festival especificado no existe' });
      }
      const festivalId = festivalResult[0].idFestival;
      const newArtist = 'INSERT INTO artists (name, genre, hit, grammys, fk_festival) VALUES (?, ?, ?, ?, ?)';
      const [result] = await conex.query(newArtist, [
        nameArtist,
        musicalGenre,
        hit,
        grammys,
        festivalId,
      ]);
      res.json({
        success: true,
        id: result.insertId,
      });
      conex.end();
    } catch (error) {
      console.error('Error al añadir la artista:', error);
      res
        .status(500)
        .json({ success: false, error: 'Error interno del servidor' });
    }
  });

// endpoint para añadir un nuevo festival
server.post("/festivals", async (req, res) => {
  try {
    const conex = await getConnection();
    const data = req.body;
    const { nameFestival, location, date, ticketPrice } = data;
    if (!nameFestival || !location || !date || !ticketPrice) {
      return res
        .status(400)
        .json({
          success: false,
          error: 'Se requieren todos los campos: nameFestival, location, date y ticketPrice',
        });
    }
    if (isNaN(ticketPrice)) {
      return res
        .status(400)
        .json({
          success: false,
          error: 'El campo ticketPrice debe ser un número',
        });
    }
    const newFestival =
      "INSERT INTO festivals (name, location, date, price) VALUES (?, ?, ?, ?)";
    const [result] = await conex.query(newFestival, [
      nameFestival,
      location,
      date,
      ticketPrice,
    ]);
    res.json({
      success: true,
      id: result.insertId,
    });
    conex.end();
  } catch (error) {
    console.error("Error al añadir festival:", error);
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
});

//endpoint para actualizar una artista existente
server.put("/artists/:id", async (req, res) => {
    try {
      const conex = await getConnection();
      const id = req.params.id;
      const data = req.body;
      const { nameArtist, musicalGenre, hit, grammys, festivalName } = data;
      if (!nameArtist || !musicalGenre || !hit || !grammys || !festivalName) {
        return res
          .status(400)
          .json({
            success: false,
            error: 'Se requieren todos los campos: nameArtist, musicalGenre, hit, grammys y festivalName',
          });
      }
      if (isNaN(grammys)) {
        return res
          .status(400)
          .json({
            success: false,
            error: `El campo ${grammys} debe ser un número`,
          });
      }
  
      // Consulta para obtener el ID del festival
      const festivalQuery = "SELECT idFestival FROM festivals WHERE name = ?";
      const [festivalResult] = await conex.query(festivalQuery, [festivalName]);
      if (festivalResult.length === 0) {
        return res.status(400).json({ success: false, error: "El festival especificado no existe" });
      }
      const festivalId = festivalResult[0].idFestival;
  
      const modifyArtist =
        "UPDATE artists SET name = ?, genre = ?, hit = ?, grammys = ?, fk_festival = ? WHERE idArtist = ?";
      const [result] = await conex.query(modifyArtist, [
        nameArtist,
        musicalGenre,
        hit,
        grammys,
        festivalId,
        id,
      ]);
      res.json({
        success: true,
        message: "La artista ha sido actualizada correctamente",
      });
      conex.end();
    } catch (error) {
      console.error("Error al actualizar artista:", error);
      res
        .status(500)
        .json({ success: false, error: "Error interno del servidor" });
    }
  });

//endpoint para actualizar un festival existente
server.put("/festivals/:id", async (req, res) => {
  try {
    const conex = await getConnection();
    const id = req.params.id;
    const data = req.body;
    const { nameFestival, location, date, ticketPrice } = data;
    if (!nameFestival || !location || !date || !ticketPrice) {
      return res
        .status(400)
        .json({
          success: false,
          error: 'Se requieren todos los campos: nameFestival, location, date y ticketPrice',
        });
    }
    if (isNaN(ticketPrice)) {
      return res
        .status(400)
        .json({
          success: false,
          error: 'El campo ticketPrice debe ser un número',
        });
    }
    const modifyFestival =
      "UPDATE festivals SET name = ?, location = ?, date = ?, price = ? WHERE idFestival = ?";
    const [result] = await conex.query(modifyFestival, [
      nameFestival,
      location,
      date,
      ticketPrice,
      id,
    ]);
    res.json({
      success: true,
      message: "El festival ha sido actualizado correctamente",
    });
    conex.end();
  } catch (error) {
    console.error("Error al actualizar festival:", error);
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
});

//endpoint para eliminar una artista de la BD
server.delete("/artists/:id", async (req, res) => {
  try {
    const conex = await getConnection();
    const id = req.params.id;
    const deleteArtist = "DELETE FROM artists WHERE idArtist = ?";
    const [result] = await conex.query(deleteArtist, [id]);
    if (result.affectedRows > 0) {
      res.json({
        success: true,
        message: "La artista ha sido eliminada correctamente",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No se ha encontrado ninguna artista con el ID proporcionado",
      });
    }
    conex.end();
  } catch (error) {
    console.error("Error al eliminar artista:", error);
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
});

//endpoint para eliminar un festival de la BD
server.delete("/festivals/:id", async (req, res) => {
  try {
    const conex = await getConnection();
    const id = req.params.id;
    const deleteFestival = "DELETE FROM festivals WHERE idFestival = ?";
    const [result] = await conex.query(deleteFestival, [id]);
    if (result.affectedRows > 0) {
      res.json({
        success: true,
        message: "El festival ha sido eliminado correctamente",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No se ha encontrado ningún festival con el ID proporcionado",
      });
    }
    conex.end();
  } catch (error) {
    console.error("Error al eliminar festival:", error);
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
});

//BONUS

//endpoint de registro de usuario
server.post('/register', async (req, res) => {
  try {
    const conex = await getConnection();
    const { name, email, address, password } = req.body;
    const selectUser = 'SELECT * FROM usuarios_db WHERE email = ?';
    const [result] = await conex.query(selectUser, [email]);
    if(result.length > 0) {
        return res.status(400).json({success: false, error: 'El usuario introducido ya existe'});
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = 'INSERT INTO usuarios_db (name, email, address, password) values (?, ?, ?, ?)';
    const [resultInsert] = await conex.query(newUser, [name, email, address, hashedPassword]);
    const token = jwt.sign({email}, 'secret');
    res.json({ success: true, token});
    conex.end();
  } catch (error){
    console.error(error);
    res.status(500).json({success: false, error: 'Error interno del servidor'});
  }
});

//endpoint de inicio de sesión
server.post('/login', async (req, res) => {
    try {
        const conex = await getConnection();
        const { email, password } = req.body;
        const selectUser = 'SELECT * FROM usuarios_db WHERE email = ?';
        const [result] = await conex.query(selectUser, [email]);
        if (result.length === 0) {
            return res.json({ success: false, error: 'El usuario introducido no existe' });
        }
        const passwordOk = await bcrypt.compare(password,result[0].password);
        if(!passwordOk) {
            return res.json({ success: false, error: 'Contraseña incorrecta' });
        }
        const userInfo = { id: result[0].id, email: result[0].email };
        const token = jwt.sign(userInfo, 'secret_key');
        res.json({ success: true, token });
        conex.end();
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, error: 'Error interno del servidor'});
    }
});

