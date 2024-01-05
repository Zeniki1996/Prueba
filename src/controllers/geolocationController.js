// geolocationController.js
const express = require('express');
const geocodeService = require('../services/geocodeService');
const databaseService = require('../services/databaseService');

const router = express.Router();

router.get('/:userId', async (req, res) => {
  // ... (código anterior)

  res.json({
    user: {
      id: userId,
      Nombre: userData.Nombre,
      Apellido: userData.Apellido,
      Usuario: userData.Usuario
    },
    geolocation: geolocationData
  });
});

// Nuevo endpoint para manejar solicitudes POST desde la API
router.post('/updateGeolocation/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Obtener los datos del cuerpo de la solicitud
    const { ciudad } = req.body;

    // Obtener información de georreferenciación desde la API de Geocode.xyz
    const geolocationData = await geocodeService.getGeolocationData(ciudad);

    // Actualizar la base de datos con la nueva información de georreferenciación
    await databaseService.connectToDatabase();
    await databaseService.query`UPDATE Clientes SET Ciudad = ${ciudad} WHERE id = ${userId}`;
    await databaseService.close();

    res.json({
      success: true,
      message: 'Datos actualizados exitosamente'
    });
  } catch (error) {
    console.error('Error en la solicitud:', error.message);
    res.status(500).json({ error: 'Error en la solicitud' });
  }
});

module.exports = router;
