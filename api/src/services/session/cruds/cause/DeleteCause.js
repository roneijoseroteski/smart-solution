const CauseDao = require('../../../dao/cruds/CauseDao');

const { ADMINISTRADOR_ID } = require('../../../../shared/constants/accessLevel');
const { get } = require('lodash');
const { STATUS_UNAUTHORIZED, MESSAGE_UNAUTHORIZED } = require('../../../../shared/constants/HTTPResponse');

module.exports = class DeleteCause {
  constructor() {
    this._queryResult = '';
  }

  getParameters(req) {
    return {
      updateId: get(req.params, 'id', ''),
      mysql: get(req, 'mysql'),
      authData: get(req, 'authData', ''),
    };
  }

  checkParameters({ updateId, mysql, authData }) {
    return {
      ...(!updateId ? { numeroCracha: 'ID da causa não infomada' } : ''),
      ...(!mysql ? { mysql: 'Conexão não estabelecida' } : ''),
      ...(!authData ? { authData: 'Dados de autenticação não encontrados' } : ''),
    };
  }

  async run(req) {
    try {
      const parameters = this.getParameters(req);

      const errors = this.checkParameters(parameters);
      if (Object.values(errors).length > 0) throw errors;

      await this.validateGroups(parameters);
      await this.deleteCause(parameters);

      if (!this._queryResult.affectedRows)
        throw 'Não foi possível deletar a causa';

      return this._queryResult;
    } catch (err) {
      console.log('err DeleteCause :>> ', err);

      throw err;
    }
  }

  async deleteCause(parameters) {
    this._queryResult = await new CauseDao(parameters).deleteCause();
  }

  async validateGroups({ authData }) {
    if (authData.nivel_acesso !== ADMINISTRADOR_ID)
      throw { status: STATUS_UNAUTHORIZED, message: MESSAGE_UNAUTHORIZED };
  }
};
