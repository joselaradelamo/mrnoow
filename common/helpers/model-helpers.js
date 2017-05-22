const moment = require('moment');
const request = require('request');
const _ = require('lodash');
const async = require('async');

let responseSaved = [];

function hasOwnProperty(obj, name) {
  return Object.prototype.hasOwnProperty.call(obj, name);
}

function createEndpoint(apiUrl, offset) {
  const limit = 100;
  const dateFormat = 'YYYY-MM-DD';
  const actualDate = moment();
  const endOfFilter = actualDate.endOf('year').format(dateFormat);
  const startOfFilter = actualDate.subtract(5, 'years').startOf('year').format(dateFormat);
  const endpoint = `${apiUrl}?recipient-country=SD&offset=${offset}&limit=${limit}`;
  const endpointWithFilter = `${endpoint}&start-date__gt=${startOfFilter}&end-date__lt=${endOfFilter}`;

  return endpointWithFilter;
}

function doRequest(endpoint, callback) {
  request.get({ url: endpoint, json: true }, callback);
}

function getData(offset, cb) {
  const apiUrl = 'http://datastore.iatistandard.org/api/1/access/activity';
  const endpoint = createEndpoint(apiUrl, offset);
  doRequest(endpoint, (err, response) => {
    // eslint-disable-next-line no-use-before-define
    saveResponse(err, response, offset, cb);
  });
}

function saveResponse(err, response, offset, cb) {
  if (!response || err || !hasOwnProperty(response, 'body')) {
    return cb('The request failed');
  }
  const requestResult = response.body;
  responseSaved = _.concat(responseSaved, requestResult['iati-activities']);
  if (requestResult.limit + requestResult.start >= requestResult['total-count']) {
    return cb(null, responseSaved);
  }
  return getData(offset + parseInt(requestResult.limit, 10), cb);
}

function getOrganization(transaction) {
  let organization = false;
  if (transaction['provider-org']) {
    if (typeof transaction['provider-org'] === 'string') {
      organization = transaction['provider-org'];
    } else {
      const provider = transaction['provider-org'];
      if (provider.text) {
        organization = provider.text;
      } else if (provider.narrative) {
        organization = typeof provider.narrative === 'string' ? provider.narrative : provider.narrative[0] || provider.narrative.text;
      }
      if (!organization && provider.ref) {
        organization = provider.ref;
      }
    }
    if (typeof organization === 'undefined') {
      organization = transaction.ref;
    }
  }
  if (organization) { organization = organization.replace(/\./g, ' '); }

  return organization;
}

function orderData(resultResponse, cb) {
  const orderedNames = {};
  const orderedData = {};
  async.series([
    (callback) => {
      async.mapSeries(Object.keys(resultResponse), (year, callbackSeries) => {
        if (year) {
          orderedNames[year] = {};
          orderedNames[year] = Object.keys(resultResponse[year])
            .sort((a, b) => resultResponse[year][b] - resultResponse[year][a]);
        }
        return callbackSeries();
      }, callback);
    },
    (callback) => {
      async.mapSeries(Object.keys(resultResponse), (year, callbackSeries) => {
        if (Object.getOwnPropertyNames(resultResponse[year]).length > 0) {
          orderedData[year] = {};
          orderedNames[year].forEach((name) => {
            orderedData[year][name] = resultResponse[year][name];
          });
        }
        return callbackSeries();
      }, callback);
    }], () => cb(null, orderedData));
}

function mapData(result, cb) {
  const resultResponse = {};
  let year;
  let organization;
  async.each(result, (iaitActivities, cbEach) => {
    if (iaitActivities['iati-activity']) {
      const transactions = iaitActivities['iati-activity'].transaction;
      if (transactions && transactions.length > 0) {
        async.each(transactions, (transaction, cbEachTrans) => {
          if (transaction.value && hasOwnProperty(transaction.value, 'value-date')) {
            const valueDate = new Date(transaction.value['value-date']);
            year = moment(valueDate).year();
            if (!hasOwnProperty(resultResponse, year)) {
              resultResponse[year] = {};
            }
            organization = getOrganization(transaction);
            if (organization) {
              resultResponse[year][organization] = (resultResponse[year][organization] || 0) +
                parseInt(transaction.value.text, 10);
            }
          }
          return cbEachTrans();
        });
      }
    }
    return cbEach();
  }, () => {
    orderData(resultResponse, cb);
  });
}

module.exports = {
  doRequest,
  createEndpoint,
  saveResponse,
  getData,
  mapData,
  orderData,
};

