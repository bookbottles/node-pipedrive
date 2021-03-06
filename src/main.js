'use strict';

var https     = require('https'),
    Q         = require('q'),
    validator = require('validator'),
    _         = require('lodash');

module.exports = function (apiKey) {
    var host = 'api.pipedrive.com',
        port = 443;

    return {
        saveOrganization: saveOrg,
        savePerson: savePerson,
        saveDeal: saveDeal,
        moveDealToStage: moveDealToStage,
        addNoteToDeal: addNoteToDeal
    };

    //////////

    /**
     *
     * @param {string} endPoint path with leading slash
     * @param {string} method
     * @param {object} [params]
     * @param {object} [queryParams]
     * @returns {Q.Promise}
     */
    function makeRequest(endPoint, method, params, queryParams) {
        return Q.Promise(function (resolve, reject) {
            var stringParams;

            var options = {
                host: host,
                port: port,
                path: '/v1' + endPoint + '?api_token=' + apiKey,
                method: method.toUpperCase()
            };

            if (queryParams) {
                options.path += _.reduce(queryParams, function (query, value, key) {
                    return query + '&' + key + '=' + value;
                }, '');
            }

            if (params) {
                stringParams = JSON.stringify(params);

                options.headers = {
                    'Content-Type': 'application/json',
                    'Content-Length': stringParams.length
                };
            }

            var req = https.request(options, function (res) {
                res.setEncoding('utf-8');

                var responseString = '';

                res.on('data', function (data) {
                    responseString += data;
                });

                res.on('end', function () {
                    try {
                        resolve(JSON.parse(responseString));
                    } catch (e) {
                        reject(e);
                    }
                });
            });

            req.on('error', function (e) {
                reject(e);
            });

            if (params) {
                req.write(stringParams);
            }
            req.end();
        });
    }

    /**
     /**
     *
     * @param name
     * @param [owner]
     * @returns {Q.Promise}
     */
    function saveOrg(name, owner) {
        var params = {
            name: name
        };

        if (owner) {
            params.owner_id = owner;  // eslint-disable-line camelcase
        }

        return makeRequest('/organizations', 'post', params).then(function (res) {
            if (_.isNull(res)) {
                return null;
            } else {
                if (_.has(res, 'data') && _.has(res.data, 'id')) {
                    return res.data.id;
                } else {
                    return Q.reject('Unexpected response from Pipe.saveOrg: ' + JSON.stringify(res));
                }
            }
        }, function (e) {
            return Q.reject('Error /organizations making request to Pipedrive: ' + e);
        });
    }

    /**
     *
     * @param name
     * @param [email]
     * @param [phone]
     * @param [org]
     * @param [owner]
     * @returns {Q.Promise}
     */
    function savePerson(name, email, phone, org, owner) {
        var params = {
            name: name
        };

        if (email) {
            params.email = email;
        }

        if (phone) {
            params.phone = phone;
        }

        if (owner) {
            params.owner_id = owner; // eslint-disable-line camelcase
        }

        if (org) {
            params.org_id = org; // eslint-disable-line camelcase
        }

        return makeRequest('/persons', 'post', params).then(function (res) {
            if (!_.isNull(res) && _.has(res, 'data') && _.has(res.data, 'id')) {
                return res.data.id;
            } else {
                return Q.reject('Unexpected response from Pipe.savePerson: ');
            }
        }, function (e) {
            return Q.reject('Error making /persons request to Pipedrive: ' + e);
        });
    }

    /**
     *
     * @param title
     * @param [owner]
     * @param [person]
     * @param [org]
     * @param [stage]
     * @param [message]
     * @returns {Q.Promise}
     */
    function saveDeal(title, owner, person, org, stage, message) {

        var params = {
            title: title
        };

        if (owner) {
            params.user_id = owner; // eslint-disable-line camelcase
        }

        if (person) {
            params.person_id = person; // eslint-disable-line camelcase
        }

        if (org) {
            params.org_id = org; // eslint-disable-line camelcase
        }

        if (stage) {
            params.stage_id = stage; // eslint-disable-line camelcase
        }

        if (message) {
            params['64c365fee51a073ee12e8f218bad4fd62a8c83a9'] = validator.blacklist(validator.stripLow(message), '“”');
        }

        return makeRequest('/deals', 'post', params).then(function (res) {
            if (!_.isNull(res) && _.has(res, 'data') && _.has(res.data, 'id')) {
                return res.data.id;
            } else {
                return Q.reject('Unexpected response from Pipe.saveDeal: ' + JSON.stringify(res));
            }
        }, function (e) {
            return Q.reject('Error making /deals request to Pipedrive: ' + e);
        });
    }

    /**
     * @param deal
     * @param stage
     * @returns {Q.Promise}
     */
    function moveDealToStage(deal, stage) {
        var params = {
            stage_id: stage // eslint-disable-line camelcase
        };

        return makeRequest('/deals/' + deal, 'put', params).then(function (res) {
            if (res.success !== true) {
                return Q.reject('Error: could not move deal. ' + JSON.stringify(res));
            } else {
                return true;
            }
        });
    }

    /**
     * @param deal
     * @param note
     * @returns {Q.Promise}
     */
    function addNoteToDeal(deal, note) {
        var params = {
            content: note,
            deal_id: deal // eslint-disable-line camelcase
        };

        return makeRequest('/notes', 'post', params).then(function (res) {
            if (res.success !== true) {
                return Q.reject('Error: could not add note. ' + JSON.stringify(res));
            } else {
                return true;
            }
        });
    }
};
