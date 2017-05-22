const moment = require('moment');
const modelHelpers = require('../helpers/model-helpers');
const async = require('async');

module.exports = (Colaboration) => {
  const model = Colaboration;
  model.getColaboration = (country, next) => {
    let moreThanADay = 0;
    model.findOne({ country: 'SD' }, (err, result) => {
      if (result) {
        const dateUpdated = moment(result.updated_at);
        moreThanADay = moment().subtract(1, 'day') - dateUpdated;
      }

      if (moreThanADay > 0 || !result) {
        async.waterfall([
          (callback) => {
            modelHelpers.getData(0, callback);
          },
          (resultData, callback) => {
            modelHelpers.mapData(resultData, callback);
          },
          (dataMapped, callback) => {
            const objectToCreate = {
              country: 'SD',
              updated_at: new Date(),
              data: dataMapped,
            };
            if (result) {
              Colaboration.updateAll({ id: result.id }, objectToCreate,
                errUpdate => callback(errUpdate, { data: dataMapped }));
            } else {
              Colaboration.create(objectToCreate, callback);
            }
          },
        ], (errWaterfall, resultWaterfall) => next(errWaterfall, resultWaterfall.data));
      } else {
        next(err, result.data);
      }
    });
  };

  Colaboration.remoteMethod('getColaboration', {
    accepts: { arg: 'country', type: 'string' },
    returns: { arg: 'result', type: 'string' },
  });
};
