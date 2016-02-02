'use strict';

var _ = require('lodash');
var Q = require('q');
var InstanceContext = require('../../../../base/InstanceContext');
var InstanceResource = require('../../../../base/InstanceResource');
var Page = require('../../../../base/Page');
var deserialize = require('../../../../base/deserialize');
var values = require('../../../../base/values');

var CredentialListPage;
var CredentialListList;
var CredentialListInstance;
var CredentialListContext;

/**
 * Initialize the CredentialListPage
 *
 * @param {Version} version - Version that contains the resource
 * @param {Response} response - Response from the API
 * @param {string} trunkSid - The trunk_sid
 *
 * @returns CredentialListPage
 */
function CredentialListPage(version, response, trunkSid) {
  Page.prototype.constructor.call(this, version, response);

  // Path Solution
  this._solution = {
    trunkSid: trunkSid
  };
}

_.extend(CredentialListPage.prototype, Page.prototype);
CredentialListPage.prototype.constructor = CredentialListPage;

/**
 * Build an instance of CredentialListInstance
 *
 * @param {obj} payload - Payload response from the API
 *
 * @returns CredentialListInstance
 */
CredentialListPage.prototype.getInstance = function getInstance(payload) {
  return new CredentialListInstance(
    this._version,
    payload,
    this._solution.trunkSid
  );
};


/**
 * Initialize the CredentialListList
 *
 * @param {Version} version - Version that contains the resource
 * @param {string} trunkSid - The trunk_sid
 *
 * @returns CredentialListList
 */
function CredentialListList(version, trunkSid) {
  function CredentialListListInstance(sid) {
    return CredentialListListInstance.get(sid);
  }

  CredentialListListInstance._version = version;
  // Path Solution
  CredentialListListInstance._solution = {
    trunkSid: trunkSid
  };
  CredentialListListInstance._uri = _.template(
    '/Trunks/<%= trunkSid %>/CredentialLists' // jshint ignore:line
  )(CredentialListListInstance._solution);
  /**
   * Create a new CredentialListInstance
   *
   * @param {string} opts.credentialListSid - The credential_list_sid
   *
   * @returns Newly created CredentialListInstance
   */
  CredentialListListInstance.create = function create(opts, callback) {
    if (_.isUndefined(opts)) {
      throw new Error('Required parameters credentialListSid are missing.');  // jshint ignore:line
    }
    if (_.isUndefined(opts.credentialListSid)) {
      throw new Error('Required parameter "credentialListSid" missing.');
    }

    var deferred = Q.defer();
    var data = values.of({
      'CredentialListSid': opts.credentialListSid
    });

    var promise = this._version.create({
      uri: this._uri,
      method: 'POST',
      data: data
    });

    promise = promise.then(function(payload) {
      deferred.resolve(new CredentialListInstance(
        this._version,
        payload,
        this._solution.trunkSid
      ));
    }.bind(this));

    promise.catch(function(error) {
      deferred.reject(error);
    });

    if (_.isFunction(callback)) {
      deferred.promise.nodeify(callback);
    }

    return deferred.promise;
  };

  /**
   * Streams CredentialListInstance records from the API.
   * This operation lazily loads records as efficiently as possible until the limit
   * is reached.
   * The results are passed into the callback function, so this operation is memory efficient.
   *
   * @param {Function} callback - A callback function to process records
   * @param {number} [opts.limit] -
   *         Upper limit for the number of records to return.
   *         list() guarantees never to return more than limit.
   *         Default is no limit
   * @param {number} [opts.pageSize=50] -
   *         Number of records to fetch per request,
   *         when not set will use the default value of 50 records.
   *         If no pageSize is defined but a limit is defined,
   *         list() will attempt to read the limit with the most efficient
   *         page size, i.e. min(limit, 1000)
   */
  CredentialListListInstance.each = function each(opts, callback) {
    opts = opts || {};
    if (_.isFunction(opts)) {
      opts = { callback: opts };
    } else if (_.isFunction(callback) && !_.isFunction(opts.callback)) {
      opts.callback = callback;
    }

    if (_.isUndefined(opts.callback)) {
      throw new Error('Callback function must be provided');
    }

    var done = false;
    var currentPage = 1;
    var limits = this._version.readLimits({
      limit: opts.limit,
      pageSize: opts.pageSize
    });

    function onComplete(error) {
      done = true;
      if (_.isFunction(opts.done)) {
        opts.done(error);
      }
    }

    function fetchNextPage(fn) {
      var promise = fn();
      if (_.isUndefined(promise)) {
        onComplete();
        return;
      }

      promise.then(function(page) {
        _.each(page.instances, function(instance) {
          if (done) {
            return false;
          }

          opts.callback(instance, onComplete);
        });

        if ((limits.pageLimit && limits.pageLimit <= currentPage)) {
          onComplete();
        } else if (!done) {
          currentPage++;
          fetchNextPage(_.bind(page.nextPage, page));
        }
      });

      promise.catch(onComplete);
    }

    fetchNextPage(_.bind(this.page, this, opts));
  };

  /**
   * Lists CredentialListInstance records from the API as a list.
   *
   * @param {number} [opts.limit] -
   *         Upper limit for the number of records to return.
   *         list() guarantees never to return more than limit.
   *         Default is no limit
   * @param {number} [opts.pageSize] -
   *         Number of records to fetch per request,
   *         when not set will use the default value of 50 records.
   *         If no page_size is defined but a limit is defined,
   *         list() will attempt to read the limit with the most
   *         efficient page size, i.e. min(limit, 1000)
   *
   * @returns {Array} A list of records
   */
  CredentialListListInstance.list = function list(opts, callback) {
    if (_.isFunction(opts)) {
      callback = opts;
      opts = {};
    }
    opts = opts || {};
    var deferred = Q.defer();
    var allResources = [];
    opts.callback = function(resource) {
      allResources.push(resource);
    };

    opts.done = function(error) {
      if (_.isUndefined(error)) {
        deferred.resolve(allResources);
      } else {
        deferred.reject(error);
      }
    };

    if (_.isFunction(callback)) {
      deferred.promise.nodeify(callback);
    }

    this.each(opts);
    return deferred.promise;
  };

  /**
   * Retrieve a single page of CredentialListInstance records from the API.
   * Request is executed immediately
   *
   * @param {string} [opts.pageToken] - PageToken provided by the API
   * @param {number} [opts.pageNumber] -
   *          Page Number, this value is simply for client state
   * @param {number} [opts.pageSize] - Number of records to return, defaults to 50
   *
   * @returns Page of CredentialListInstance
   */
  CredentialListListInstance.page = function page(opts, callback) {
    var deferred = Q.defer();
    var data = values.of({
      'PageToken': opts.pageToken,
      'Page': opts.pageNumber,
      'PageSize': opts.pageSize
    });

    var promise = this._version.page({
      uri: this._uri,
      method: 'GET',
      params: data
    });

    promise = promise.then(function(payload) {
      deferred.resolve(new CredentialListPage(
        this._version,
        payload,
        this._solution.trunkSid
      ));
    }.bind(this));

    promise.catch(function(error) {
      deferred.reject(error);
    });

    if (_.isFunction(callback)) {
      deferred.promise.nodeify(callback);
    }

    return deferred.promise;
  };

  /**
   * Constructs a CredentialListContext
   *
   * @param {string} sid - The sid
   *
   * @returns CredentialListContext
   */
  CredentialListListInstance.get = function get(sid) {
    return new CredentialListContext(
      this._version,
      this._solution.trunkSid,
      sid
    );
  };

  return CredentialListListInstance;
}


/**
 * Initialize the CredentialListContext
 *
 * @param {Version} version - Version that contains the resource
 * @param {object} payload - The instance payload
 * @param {sid} trunkSid - The trunk_sid
 * @param {sid} sid - The sid
 *
 * @returns {CredentialListContext}
 */
function CredentialListInstance(version, payload, trunkSid, sid) {
  InstanceResource.prototype.constructor.call(this, version);

  // Marshaled Properties
  this._properties = {
    accountSid: payload.account_sid, // jshint ignore:line,
    sid: payload.sid, // jshint ignore:line,
    trunkSid: payload.trunk_sid, // jshint ignore:line,
    friendlyName: payload.friendly_name, // jshint ignore:line,
    dateCreated: deserialize.iso8601DateTime(payload.date_created), // jshint ignore:line,
    dateUpdated: deserialize.iso8601DateTime(payload.date_updated), // jshint ignore:line,
    url: payload.url, // jshint ignore:line,
  };

  // Context
  this._context = undefined;
  this._solution = {
    trunkSid: trunkSid,
    sid: sid || this._properties.sid,
  };
}

_.extend(CredentialListInstance.prototype, InstanceResource.prototype);
CredentialListInstance.prototype.constructor = CredentialListInstance;

Object.defineProperty(CredentialListInstance.prototype,
  '_proxy', {
  get: function() {
    if (!this._context) {
      this._context = new CredentialListContext(
        this._version,
        this._solution.trunkSid,
        this._solution.sid
      );
    }

    return this._context;
  },
});

Object.defineProperty(CredentialListInstance.prototype,
  'accountSid', {
  get: function() {
    return this._properties.accountSid;
  },
});

Object.defineProperty(CredentialListInstance.prototype,
  'sid', {
  get: function() {
    return this._properties.sid;
  },
});

Object.defineProperty(CredentialListInstance.prototype,
  'trunkSid', {
  get: function() {
    return this._properties.trunkSid;
  },
});

Object.defineProperty(CredentialListInstance.prototype,
  'friendlyName', {
  get: function() {
    return this._properties.friendlyName;
  },
});

Object.defineProperty(CredentialListInstance.prototype,
  'dateCreated', {
  get: function() {
    return this._properties.dateCreated;
  },
});

Object.defineProperty(CredentialListInstance.prototype,
  'dateUpdated', {
  get: function() {
    return this._properties.dateUpdated;
  },
});

Object.defineProperty(CredentialListInstance.prototype,
  'url', {
  get: function() {
    return this._properties.url;
  },
});

/**
 * Fetch a CredentialListInstance
 *
 * @returns Fetched CredentialListInstance
 */
CredentialListInstance.prototype.fetch = function fetch(callback) {
  var deferred = Q.defer();
  var promise = this._version.fetch({
    uri: this._uri,
    method: 'GET'
  });

  promise = promise.then(function(payload) {
    deferred.resolve(new CredentialListInstance(
      this._version,
      payload,
      this._solution.trunkSid,
      this._solution.sid
    ));
  }.bind(this));

  promise.catch(function(error) {
    deferred.reject(error);
  });

  if (_.isFunction(callback)) {
    deferred.promise.nodeify(callback);
  }

  return deferred.promise;
};

/**
 * Deletes the CredentialListInstance
 *
 * @returns true if delete succeeds, false otherwise
 */
CredentialListInstance.prototype.remove = function remove(callback) {
  var deferred = Q.defer();
  var promise = this._version.remove({
    uri: this._uri,
    method: 'DELETE'
  });

  promise = promise.then(function(payload) {
    deferred.resolve(payload);
  }.bind(this));

  promise.catch(function(error) {
    deferred.reject(error);
  });

  if (_.isFunction(callback)) {
    deferred.promise.nodeify(callback);
  }

  return deferred.promise;
};


/**
 * Initialize the CredentialListContext
 *
 * @param {Version} version - Version that contains the resource
 * @param {sid} trunkSid - The trunk_sid
 * @param {sid} sid - The sid
 *
 * @returns {CredentialListContext}
 */
function CredentialListContext(version, trunkSid, sid) {
  InstanceContext.prototype.constructor.call(this, version);

  // Path Solution
  this._solution = {
    trunkSid: trunkSid,
    sid: sid,
  };
  this._uri = _.template(
    '/Trunks/<%= trunkSid %>/CredentialLists/<%= sid %>' // jshint ignore:line
  )(this._solution);
}

_.extend(CredentialListContext.prototype, InstanceContext.prototype);
CredentialListContext.prototype.constructor = CredentialListContext;

/**
 * Fetch a CredentialListInstance
 *
 * @returns Fetched CredentialListInstance
 */
CredentialListContext.prototype.fetch = function fetch(callback) {
  var deferred = Q.defer();
  var promise = this._version.fetch({
    uri: this._uri,
    method: 'GET'
  });

  promise = promise.then(function(payload) {
    deferred.resolve(new CredentialListInstance(
      this._version,
      payload,
      this._solution.trunkSid,
      this._solution.sid
    ));
  }.bind(this));

  promise.catch(function(error) {
    deferred.reject(error);
  });

  if (_.isFunction(callback)) {
    deferred.promise.nodeify(callback);
  }

  return deferred.promise;
};

/**
 * Deletes the CredentialListInstance
 *
 * @returns true if delete succeeds, false otherwise
 */
CredentialListContext.prototype.remove = function remove(callback) {
  var deferred = Q.defer();
  var promise = this._version.remove({
    uri: this._uri,
    method: 'DELETE'
  });

  promise = promise.then(function(payload) {
    deferred.resolve(payload);
  }.bind(this));

  promise.catch(function(error) {
    deferred.reject(error);
  });

  if (_.isFunction(callback)) {
    deferred.promise.nodeify(callback);
  }

  return deferred.promise;
};

module.exports = {
  CredentialListPage: CredentialListPage,
  CredentialListList: CredentialListList,
  CredentialListInstance: CredentialListInstance,
  CredentialListContext: CredentialListContext
};