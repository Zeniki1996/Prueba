const express = require('express');
const mssql = require('mssql');
const axios = require('axios');

const app = express();
const port = 3000;

// Configuración de la conexión a SQL Server
const config = {
  
  server: 'CU-LPNMARTINEZ\NNMRMSSQLSERVER',
  database: 'TuBaseDeDatos',
};

// Ruta para obtener datos de Georreferenciación
app.get('/georreferenciacion/:ciudad', async (req, res) => {
  try {
    // Obtén la ciudad desde los parámetros de la solicitud
    const ciudad = req.params.ciudad;

    // Llama a la API de Geocode.xyz con la ciudad
    const response = await axios.get(`https://geocode.xyz/${ciudad}?json=1`);

    // Inserta o actualiza los datos en la base de datos
    const pool = await mssql.connect(config);

    // Verifica si el cliente ya existe en la base de datos
    const existingClient = await pool.request()
      .input('Ciudad', mssql.NVarChar, ciudad)
      .query('SELECT * FROM Clientes WHERE Ciudad = @Ciudad');

    if (existingClient.recordset.length > 0) {
      // Si el cliente existe, actualiza los datos de Georreferenciación
      await pool.request()
        .input('Ciudad', mssql.NVarChar, ciudad)
        .input('Latitud', mssql.NVarChar, response.data.latt)
        .input('Longitud', mssql.NVarChar, response.data.longt)
        .query('UPDATE Clientes SET Latitud = @Latitud, Longitud = @Longitud WHERE Ciudad = @Ciudad');
    } else {
      // Si el cliente no existe, inserta un nuevo registro
      await pool.request()
        .input('Nombre', mssql.NVarChar, 'Nombre del cliente')  // Puedes ajustar esto según tus necesidades
        .input('Apellido', mssql.NVarChar, 'Apellido del cliente')  // Puedes ajustar esto según tus necesidades
        .input('Usuario', mssql.NVarChar, 'Usuario del cliente')  // Puedes ajustar esto según tus necesidades
        .input('Ciudad', mssql.NVarChar, ciudad)
        .input('Latitud', mssql.NVarChar, response.data.latt)
        .input('Longitud', mssql.NVarChar, response.data.longt)
        .query('INSERT INTO Clientes (Nombre, Apellido, Usuario, Ciudad, Latitud, Longitud) VALUES (@Nombre, @Apellido, @Usuario, @Ciudad, @Latitud, @Longitud)');
    }

    // Devuelve los datos de Georreferenciación al cliente
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error interno del servidor');
  }
});


// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:3000`);
});
