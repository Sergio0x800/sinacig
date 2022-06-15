const express = require('express');
const router = express.Router();
const MatrizService = require('../services/matriz.service');
const passport = require('passport');
const { checkRoles } = require('../middlewares/auth.handler');
const matrizService = new MatrizService();

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkRoles(1, 2),
  async (req, res, next) => {
    try {
      const dataMatriz = req.body;
      const matrizAdded = await matrizService.createMatriz(dataMatriz);
      res.json(matrizAdded);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkRoles(1, 2),
  async (req, res, next) => {
    try {
      const { id_unidad_ejecutora, fecha_periodo_inicio, fecha_periodo_fin } =
        req.query;
      const matrizPeriodos = await matrizService.findMatrizByUnidadFecha(
        id_unidad_ejecutora,
        fecha_periodo_inicio,
        fecha_periodo_fin
      );
      res.json(matrizPeriodos);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/form/:id_matriz',
  passport.authenticate('jwt', { session: false }),
  checkRoles(1, 2),
  async (req, res, next) => {
    try {
      const { id_matriz } = req.params;
      const matrizPeriodos = await matrizService.findMatrizByIdForm(id_matriz);
      res.json(matrizPeriodos);
    } catch (error) {
      next(error);
    }
  }
);

// router.get(
//   '/update/:id_matriz',
//   passport.authenticate('jwt', { session: false }),
//   checkRoles(1, 2),
//   async (req, res, next) => {
//     try {
//       const { id_matriz } = req.params;
//       const matrizPeriodos = await matrizService.findMatrizById(id_matriz);
//       res.json(matrizPeriodos);
//     } catch (error) {
//       next(error);
//     }
//   }
// );

router.patch(
  '/update',
  passport.authenticate('jwt', { session: false }),
  checkRoles(1, 2),
  async (req, res, next) => {
    try {
      const body = req.body;
      const updatedMatriz = await matrizService.updateMatrizPeriodo(body);
      res.json(updatedMatriz);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id_matriz',
  passport.authenticate('jwt', { session: false }),
  checkRoles(1),
  async (req, res, next) => {
    try {
      const { id_matriz } = req.params;
      const dataMatriz = req.body;
      const updatedMatriz = await matrizService.deleteMatriz(
        id_matriz,
        dataMatriz
      );
      res.json(updatedMatriz);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
