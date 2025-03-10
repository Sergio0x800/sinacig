const { models } = require('../libs/sequelize');
const boom = require('@hapi/boom');
const LogService = require('./logs.service');

const logService = new LogService();

class RiesgoControlInternoService {
  constructor() {}

  async createRiesgoControlInterno(dataRiesgoControlInterno) {
    const result = await models.ControlInterno.create(dataRiesgoControlInterno);
    return result;
  }

  async findRiesgoControlInterno(id_plan) {
    const result = await models.ControlInterno.findAll({
      where: {
        id_riesgo: id_plan,
        estado_registro: 1,
      },
    });
    if (result.length === 0) {
      throw boom.notFound('No hay registros');
    }
    return result;
  }

  async deleteControlInterno(id_control, changes) {
    const resultAntes = await models.ControlInterno.findOne({
      where: { id_riesgo_control_interno: id_control },
    });

    const resultEncontrado = await models.ControlInterno.findOne({
      where: { id_riesgo_control_interno: id_control },
    });

    if (resultAntes.length === 0) {
      throw boom.notFound('No hay registros');
    }
    const resultUpdate = await resultEncontrado.update(changes, {
      where: {
        id_riesgo_control_interno: id_control,
      },
    });
    const newLog = {
      nombre_tabla: 'tt_riesgo_control_interno',
      id_registro: id_control,
      antes: JSON.stringify(resultAntes),
      despues: JSON.stringify(resultUpdate),
      id_usuario_modifico: changes.usuario_registro,
    };
    await logService.createLog(newLog);
    return resultUpdate;
  }
}

module.exports = RiesgoControlInternoService;
