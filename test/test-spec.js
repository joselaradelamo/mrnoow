const { expect, assert } = require('chai');
const modelHelpers = require('../common/helpers/model-helpers.js');
const { stub } = require('sinon');

describe('Testing is working', () => {
  it('tests works correctly', (done) => {
    expect(true).to.be.true;
    return done();
  });
});

describe('Get the data from the api', () => {
  it('the api gives a 200 statuscode and a body response', (done) => {
    const endpoint = 'http://datastore.iatistandard.org/api/1/access/activity?recipient-country=SD';
    modelHelpers.doRequest(endpoint, (err, response) => {
      expect(err).to.be.null;
      expect(response).to.be.an.object;
      expect(response).to.have.a.property('body');
      expect(response).to.have.a.property('statusCode');
      expect(response.statusCode).to.be.equal(200);
      return done();
    });
  });
});

describe('Creating the endpoint', () => {
  it('the endpoint contains all the keywords', (done) => {
    const endpoint = modelHelpers.createEndpoint('testApiEndpoint', 0);
    expect(endpoint).to.be.a.string;
    expect(endpoint).to.include('testApiEndpoint');
    expect(endpoint).to.include('offset');
    expect(endpoint).to.include('limit');
    expect(endpoint).to.include('start-date__gt');
    expect(endpoint).to.include('end-date__lt');
    expect(endpoint).to.not.include(null);
    expect(endpoint).to.not.include(undefined);
    expect(endpoint).to.not.include(false);
    return done();
  });
});

describe('Saving the request response', () => {
  const errorValue = 'The request failed';
  it('We receive an error if something went wrong in the request', (done) => {
    modelHelpers.saveResponse('error', null, null, function(err) {
      expect(err).to.be.string;
      expect(err).to.be.equal(errorValue);
    return done();
    });
  });
  it('We receive an error if there is no response from the endpoint request', (done) => {
    modelHelpers.saveResponse(null, null, null, function(err) {
      expect(err).to.be.string;
      expect(err).to.be.equal(errorValue);
    return done();
    });
  });
  it('We receive an error if there is no body in the response from the endpoint request', (done) => {
    modelHelpers.saveResponse(null, 'response without body', null, function(err) {
      expect(err).to.be.string;
      expect(err).to.be.equal(errorValue);
    return done();
    });
  });
  it('We receive an array with the seven values that we have in the activities', (done) => {
    const response = {
      body: {
        'iati-activities': [1,2,3,4,5,6,7],
        'limit': 10,
        'start': 0,
        'total-count': 7
      }
    };

    modelHelpers.saveResponse(null, response, 0, function(err, responseSaved) {
      expect(err).to.be.not.ok;
      expect(responseSaved).to.be.an.array;
      expect(responseSaved.length).to.be.equal(7);
      return done();
    });
  });
  it('We receive an array with the seven values that we have from the previous test and one more', (done) => {
    const response = {
      body: {
        'iati-activities': [8],
        'limit': 10,
        'start': 0,
        'total-count': 1
      }
    };

    modelHelpers.saveResponse(null, response, 0, function(err, responseSaved) {
      expect(err).to.be.not.ok;
      expect(responseSaved).to.be.an.array;
      expect(responseSaved.length).to.be.equal(8);
      return done();
    });
  });
});
describe('Mapping and ordering the response info', () => {
  var responseSaved = //{
    /*'iati-activities': */[{
      'iati-activity': {
        'transaction': [
          {
            'provider-org': 'Sida',
            'value': {
              'value-date': '2011-12-12',
              'text': 181400000
            }
          }, {
            'provider-org': {
              'text': 'Sida'
            },
            'value': {
              'value-date': '2011-10-10',
              'text': 69583
            }
          }
        ]
      },
    }, {
    'iati-activity': {
        'transaction': [
          {
            'provider-org': {
              'narrative': 'Sida'
            },
            'value': {
              'value-date': '2010-12-12',
              'text': 149600000
            }
          }, {
            'provider-org': {
              'ref': 'UD'
            },
            'value': {
              'value-date': '2010-10-10',
              'text': 6100000
            }
          }, {
            'provider-org': 'UD',
            'value': {
              'value-date': '2010-10-10',
              'text': 5000
            }
          }, {
            'provider-org': {
              'narrative': {
                text: 'Sida'
              } 
            },
            'value': {
              'value-date': '2010-10-10',
              'text': 67518
            }
          }
        ]
      }
    }];
  //};
  var orderedData = {
    "2011" : {
      "Sida" : 181469583
    },
    "2010" : {
      "Sida" : 149667518 ,
      "UD" : 6105000
    }
  };
  it('We receive acorrect mapped and ordered array', (done) => {
    modelHelpers.mapData(responseSaved, function(err, resultResponse) {
      expect(resultResponse).to.be.eql(orderedData);
      done();
    });
  });
});
