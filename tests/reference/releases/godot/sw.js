(() => {
  // node_modules/workbox-core/_version.js
  try {
    self["workbox:core:7.4.0"] && _();
  } catch (e) {}

  // node_modules/workbox-core/models/messages/messages.js
  var messages = {
    "invalid-value": ({ paramName, validValueDescription, value }) => {
      if (!paramName || !validValueDescription) {
        throw new Error(`Unexpected input to 'invalid-value' error.`);
      }
      return `The '${paramName}' parameter was given a value with an ` + `unexpected value. ${validValueDescription} Received a value of ` + `${JSON.stringify(value)}.`;
    },
    "not-an-array": ({ moduleName, className, funcName, paramName }) => {
      if (!moduleName || !className || !funcName || !paramName) {
        throw new Error(`Unexpected input to 'not-an-array' error.`);
      }
      return `The parameter '${paramName}' passed into ` + `'${moduleName}.${className}.${funcName}()' must be an array.`;
    },
    "incorrect-type": ({ expectedType, paramName, moduleName, className, funcName }) => {
      if (!expectedType || !paramName || !moduleName || !funcName) {
        throw new Error(`Unexpected input to 'incorrect-type' error.`);
      }
      const classNameStr = className ? `${className}.` : "";
      return `The parameter '${paramName}' passed into ` + `'${moduleName}.${classNameStr}` + `${funcName}()' must be of type ${expectedType}.`;
    },
    "incorrect-class": ({ expectedClassName, paramName, moduleName, className, funcName, isReturnValueProblem }) => {
      if (!expectedClassName || !moduleName || !funcName) {
        throw new Error(`Unexpected input to 'incorrect-class' error.`);
      }
      const classNameStr = className ? `${className}.` : "";
      if (isReturnValueProblem) {
        return `The return value from ` + `'${moduleName}.${classNameStr}${funcName}()' ` + `must be an instance of class ${expectedClassName}.`;
      }
      return `The parameter '${paramName}' passed into ` + `'${moduleName}.${classNameStr}${funcName}()' ` + `must be an instance of class ${expectedClassName}.`;
    },
    "missing-a-method": ({ expectedMethod, paramName, moduleName, className, funcName }) => {
      if (!expectedMethod || !paramName || !moduleName || !className || !funcName) {
        throw new Error(`Unexpected input to 'missing-a-method' error.`);
      }
      return `${moduleName}.${className}.${funcName}() expected the ` + `'${paramName}' parameter to expose a '${expectedMethod}' method.`;
    },
    "add-to-cache-list-unexpected-type": ({ entry }) => {
      return `An unexpected entry was passed to ` + `'workbox-precaching.PrecacheController.addToCacheList()' The entry ` + `'${JSON.stringify(entry)}' isn't supported. You must supply an array of ` + `strings with one or more characters, objects with a url property or ` + `Request objects.`;
    },
    "add-to-cache-list-conflicting-entries": ({ firstEntry, secondEntry }) => {
      if (!firstEntry || !secondEntry) {
        throw new Error(`Unexpected input to ` + `'add-to-cache-list-duplicate-entries' error.`);
      }
      return `Two of the entries passed to ` + `'workbox-precaching.PrecacheController.addToCacheList()' had the URL ` + `${firstEntry} but different revision details. Workbox is ` + `unable to cache and version the asset correctly. Please remove one ` + `of the entries.`;
    },
    "plugin-error-request-will-fetch": ({ thrownErrorMessage }) => {
      if (!thrownErrorMessage) {
        throw new Error(`Unexpected input to ` + `'plugin-error-request-will-fetch', error.`);
      }
      return `An error was thrown by a plugins 'requestWillFetch()' method. ` + `The thrown error message was: '${thrownErrorMessage}'.`;
    },
    "invalid-cache-name": ({ cacheNameId, value }) => {
      if (!cacheNameId) {
        throw new Error(`Expected a 'cacheNameId' for error 'invalid-cache-name'`);
      }
      return `You must provide a name containing at least one character for ` + `setCacheDetails({${cacheNameId}: '...'}). Received a value of ` + `'${JSON.stringify(value)}'`;
    },
    "unregister-route-but-not-found-with-method": ({ method }) => {
      if (!method) {
        throw new Error(`Unexpected input to ` + `'unregister-route-but-not-found-with-method' error.`);
      }
      return `The route you're trying to unregister was not  previously ` + `registered for the method type '${method}'.`;
    },
    "unregister-route-route-not-registered": () => {
      return `The route you're trying to unregister was not previously ` + `registered.`;
    },
    "queue-replay-failed": ({ name }) => {
      return `Replaying the background sync queue '${name}' failed.`;
    },
    "duplicate-queue-name": ({ name }) => {
      return `The Queue name '${name}' is already being used. ` + `All instances of backgroundSync.Queue must be given unique names.`;
    },
    "expired-test-without-max-age": ({ methodName, paramName }) => {
      return `The '${methodName}()' method can only be used when the ` + `'${paramName}' is used in the constructor.`;
    },
    "unsupported-route-type": ({ moduleName, className, funcName, paramName }) => {
      return `The supplied '${paramName}' parameter was an unsupported type. ` + `Please check the docs for ${moduleName}.${className}.${funcName} for ` + `valid input types.`;
    },
    "not-array-of-class": ({ value, expectedClass, moduleName, className, funcName, paramName }) => {
      return `The supplied '${paramName}' parameter must be an array of ` + `'${expectedClass}' objects. Received '${JSON.stringify(value)},'. ` + `Please check the call to ${moduleName}.${className}.${funcName}() ` + `to fix the issue.`;
    },
    "max-entries-or-age-required": ({ moduleName, className, funcName }) => {
      return `You must define either config.maxEntries or config.maxAgeSeconds` + `in ${moduleName}.${className}.${funcName}`;
    },
    "statuses-or-headers-required": ({ moduleName, className, funcName }) => {
      return `You must define either config.statuses or config.headers` + `in ${moduleName}.${className}.${funcName}`;
    },
    "invalid-string": ({ moduleName, funcName, paramName }) => {
      if (!paramName || !moduleName || !funcName) {
        throw new Error(`Unexpected input to 'invalid-string' error.`);
      }
      return `When using strings, the '${paramName}' parameter must start with ` + `'http' (for cross-origin matches) or '/' (for same-origin matches). ` + `Please see the docs for ${moduleName}.${funcName}() for ` + `more info.`;
    },
    "channel-name-required": () => {
      return `You must provide a channelName to construct a ` + `BroadcastCacheUpdate instance.`;
    },
    "invalid-responses-are-same-args": () => {
      return `The arguments passed into responsesAreSame() appear to be ` + `invalid. Please ensure valid Responses are used.`;
    },
    "expire-custom-caches-only": () => {
      return `You must provide a 'cacheName' property when using the ` + `expiration plugin with a runtime caching strategy.`;
    },
    "unit-must-be-bytes": ({ normalizedRangeHeader }) => {
      if (!normalizedRangeHeader) {
        throw new Error(`Unexpected input to 'unit-must-be-bytes' error.`);
      }
      return `The 'unit' portion of the Range header must be set to 'bytes'. ` + `The Range header provided was "${normalizedRangeHeader}"`;
    },
    "single-range-only": ({ normalizedRangeHeader }) => {
      if (!normalizedRangeHeader) {
        throw new Error(`Unexpected input to 'single-range-only' error.`);
      }
      return `Multiple ranges are not supported. Please use a  single start ` + `value, and optional end value. The Range header provided was ` + `"${normalizedRangeHeader}"`;
    },
    "invalid-range-values": ({ normalizedRangeHeader }) => {
      if (!normalizedRangeHeader) {
        throw new Error(`Unexpected input to 'invalid-range-values' error.`);
      }
      return `The Range header is missing both start and end values. At least ` + `one of those values is needed. The Range header provided was ` + `"${normalizedRangeHeader}"`;
    },
    "no-range-header": () => {
      return `No Range header was found in the Request provided.`;
    },
    "range-not-satisfiable": ({ size, start, end }) => {
      return `The start (${start}) and end (${end}) values in the Range are ` + `not satisfiable by the cached response, which is ${size} bytes.`;
    },
    "attempt-to-cache-non-get-request": ({ url, method }) => {
      return `Unable to cache '${url}' because it is a '${method}' request and ` + `only 'GET' requests can be cached.`;
    },
    "cache-put-with-no-response": ({ url }) => {
      return `There was an attempt to cache '${url}' but the response was not ` + `defined.`;
    },
    "no-response": ({ url, error }) => {
      let message = `The strategy could not generate a response for '${url}'.`;
      if (error) {
        message += ` The underlying error is ${error}.`;
      }
      return message;
    },
    "bad-precaching-response": ({ url, status }) => {
      return `The precaching request for '${url}' failed` + (status ? ` with an HTTP status of ${status}.` : `.`);
    },
    "non-precached-url": ({ url }) => {
      return `createHandlerBoundToURL('${url}') was called, but that URL is ` + `not precached. Please pass in a URL that is precached instead.`;
    },
    "add-to-cache-list-conflicting-integrities": ({ url }) => {
      return `Two of the entries passed to ` + `'workbox-precaching.PrecacheController.addToCacheList()' had the URL ` + `${url} with different integrity values. Please remove one of them.`;
    },
    "missing-precache-entry": ({ cacheName, url }) => {
      return `Unable to find a precached response in ${cacheName} for ${url}.`;
    },
    "cross-origin-copy-response": ({ origin }) => {
      return `workbox-core.copyResponse() can only be used with same-origin ` + `responses. It was passed a response with origin ${origin}.`;
    },
    "opaque-streams-source": ({ type }) => {
      const message = `One of the workbox-streams sources resulted in an ` + `'${type}' response.`;
      if (type === "opaqueredirect") {
        return `${message} Please do not use a navigation request that results ` + `in a redirect as a source.`;
      }
      return `${message} Please ensure your sources are CORS-enabled.`;
    }
  };

  // node_modules/workbox-core/models/messages/messageGenerator.js
  var generatorFunction = (code, details = {}) => {
    const message = messages[code];
    if (!message) {
      throw new Error(`Unable to find message for code '${code}'.`);
    }
    return message(details);
  };
  var messageGenerator = generatorFunction;

  // node_modules/workbox-core/_private/WorkboxError.js
  class WorkboxError extends Error {
    constructor(errorCode, details) {
      const message = messageGenerator(errorCode, details);
      super(message);
      this.name = errorCode;
      this.details = details;
    }
  }

  // node_modules/workbox-core/_private/assert.js
  var isArray = (value, details) => {
    if (!Array.isArray(value)) {
      throw new WorkboxError("not-an-array", details);
    }
  };
  var hasMethod = (object, expectedMethod, details) => {
    const type = typeof object[expectedMethod];
    if (type !== "function") {
      details["expectedMethod"] = expectedMethod;
      throw new WorkboxError("missing-a-method", details);
    }
  };
  var isType = (object, expectedType, details) => {
    if (typeof object !== expectedType) {
      details["expectedType"] = expectedType;
      throw new WorkboxError("incorrect-type", details);
    }
  };
  var isInstance = (object, expectedClass, details) => {
    if (!(object instanceof expectedClass)) {
      details["expectedClassName"] = expectedClass.name;
      throw new WorkboxError("incorrect-class", details);
    }
  };
  var isOneOf = (value, validValues, details) => {
    if (!validValues.includes(value)) {
      details["validValueDescription"] = `Valid values are ${JSON.stringify(validValues)}.`;
      throw new WorkboxError("invalid-value", details);
    }
  };
  var isArrayOfClass = (value, expectedClass, details) => {
    const error = new WorkboxError("not-array-of-class", details);
    if (!Array.isArray(value)) {
      throw error;
    }
    for (const item of value) {
      if (!(item instanceof expectedClass)) {
        throw error;
      }
    }
  };
  var finalAssertExports = {
    hasMethod,
    isArray,
    isInstance,
    isOneOf,
    isType,
    isArrayOfClass
  };

  // node_modules/workbox-core/_private/cacheNames.js
  var _cacheNameDetails = {
    googleAnalytics: "googleAnalytics",
    precache: "precache-v2",
    prefix: "workbox",
    runtime: "runtime",
    suffix: typeof registration !== "undefined" ? registration.scope : ""
  };
  var _createCacheName = (cacheName) => {
    return [_cacheNameDetails.prefix, cacheName, _cacheNameDetails.suffix].filter((value) => value && value.length > 0).join("-");
  };
  var eachCacheNameDetail = (fn) => {
    for (const key of Object.keys(_cacheNameDetails)) {
      fn(key);
    }
  };
  var cacheNames = {
    updateDetails: (details) => {
      eachCacheNameDetail((key) => {
        if (typeof details[key] === "string") {
          _cacheNameDetails[key] = details[key];
        }
      });
    },
    getGoogleAnalyticsName: (userCacheName) => {
      return userCacheName || _createCacheName(_cacheNameDetails.googleAnalytics);
    },
    getPrecacheName: (userCacheName) => {
      return userCacheName || _createCacheName(_cacheNameDetails.precache);
    },
    getPrefix: () => {
      return _cacheNameDetails.prefix;
    },
    getRuntimeName: (userCacheName) => {
      return userCacheName || _createCacheName(_cacheNameDetails.runtime);
    },
    getSuffix: () => {
      return _cacheNameDetails.suffix;
    }
  };

  // node_modules/workbox-core/_private/logger.js
  var logger = (() => {
    if (!("__WB_DISABLE_DEV_LOGS" in globalThis)) {
      self.__WB_DISABLE_DEV_LOGS = false;
    }
    let inGroup = false;
    const methodToColorMap = {
      debug: `#7f8c8d`,
      log: `#2ecc71`,
      warn: `#f39c12`,
      error: `#c0392b`,
      groupCollapsed: `#3498db`,
      groupEnd: null
    };
    const print = function(method, args) {
      if (self.__WB_DISABLE_DEV_LOGS) {
        return;
      }
      if (method === "groupCollapsed") {
        if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
          console[method](...args);
          return;
        }
      }
      const styles = [
        `background: ${methodToColorMap[method]}`,
        `border-radius: 0.5em`,
        `color: white`,
        `font-weight: bold`,
        `padding: 2px 0.5em`
      ];
      const logPrefix = inGroup ? [] : ["%cworkbox", styles.join(";")];
      console[method](...logPrefix, ...args);
      if (method === "groupCollapsed") {
        inGroup = true;
      }
      if (method === "groupEnd") {
        inGroup = false;
      }
    };
    const api = {};
    const loggerMethods = Object.keys(methodToColorMap);
    for (const key of loggerMethods) {
      const method = key;
      api[method] = (...args) => {
        print(method, args);
      };
    }
    return api;
  })();

  // node_modules/workbox-core/_private/waitUntil.js
  function waitUntil(event, asyncFn) {
    const returnPromise = asyncFn();
    event.waitUntil(returnPromise);
    return returnPromise;
  }

  // node_modules/workbox-precaching/_version.js
  try {
    self["workbox:precaching:7.4.0"] && _();
  } catch (e) {}

  // node_modules/workbox-precaching/utils/createCacheKey.js
  var REVISION_SEARCH_PARAM = "__WB_REVISION__";
  function createCacheKey(entry) {
    if (!entry) {
      throw new WorkboxError("add-to-cache-list-unexpected-type", { entry });
    }
    if (typeof entry === "string") {
      const urlObject = new URL(entry, location.href);
      return {
        cacheKey: urlObject.href,
        url: urlObject.href
      };
    }
    const { revision, url } = entry;
    if (!url) {
      throw new WorkboxError("add-to-cache-list-unexpected-type", { entry });
    }
    if (!revision) {
      const urlObject = new URL(url, location.href);
      return {
        cacheKey: urlObject.href,
        url: urlObject.href
      };
    }
    const cacheKeyURL = new URL(url, location.href);
    const originalURL = new URL(url, location.href);
    cacheKeyURL.searchParams.set(REVISION_SEARCH_PARAM, revision);
    return {
      cacheKey: cacheKeyURL.href,
      url: originalURL.href
    };
  }

  // node_modules/workbox-precaching/utils/PrecacheInstallReportPlugin.js
  class PrecacheInstallReportPlugin {
    constructor() {
      this.updatedURLs = [];
      this.notUpdatedURLs = [];
      this.handlerWillStart = async ({ request, state }) => {
        if (state) {
          state.originalRequest = request;
        }
      };
      this.cachedResponseWillBeUsed = async ({ event, state, cachedResponse }) => {
        if (event.type === "install") {
          if (state && state.originalRequest && state.originalRequest instanceof Request) {
            const url = state.originalRequest.url;
            if (cachedResponse) {
              this.notUpdatedURLs.push(url);
            } else {
              this.updatedURLs.push(url);
            }
          }
        }
        return cachedResponse;
      };
    }
  }

  // node_modules/workbox-precaching/utils/PrecacheCacheKeyPlugin.js
  class PrecacheCacheKeyPlugin {
    constructor({ precacheController }) {
      this.cacheKeyWillBeUsed = async ({ request, params }) => {
        const cacheKey = (params === null || params === undefined ? undefined : params.cacheKey) || this._precacheController.getCacheKeyForURL(request.url);
        return cacheKey ? new Request(cacheKey, { headers: request.headers }) : request;
      };
      this._precacheController = precacheController;
    }
  }

  // node_modules/workbox-precaching/utils/printCleanupDetails.js
  var logGroup = (groupTitle, deletedURLs) => {
    logger.groupCollapsed(groupTitle);
    for (const url of deletedURLs) {
      logger.log(url);
    }
    logger.groupEnd();
  };
  function printCleanupDetails(deletedURLs) {
    const deletionCount = deletedURLs.length;
    if (deletionCount > 0) {
      logger.groupCollapsed(`During precaching cleanup, ` + `${deletionCount} cached ` + `request${deletionCount === 1 ? " was" : "s were"} deleted.`);
      logGroup("Deleted Cache Requests", deletedURLs);
      logger.groupEnd();
    }
  }

  // node_modules/workbox-precaching/utils/printInstallDetails.js
  function _nestedGroup(groupTitle, urls) {
    if (urls.length === 0) {
      return;
    }
    logger.groupCollapsed(groupTitle);
    for (const url of urls) {
      logger.log(url);
    }
    logger.groupEnd();
  }
  function printInstallDetails(urlsToPrecache, urlsAlreadyPrecached) {
    const precachedCount = urlsToPrecache.length;
    const alreadyPrecachedCount = urlsAlreadyPrecached.length;
    if (precachedCount || alreadyPrecachedCount) {
      let message = `Precaching ${precachedCount} file${precachedCount === 1 ? "" : "s"}.`;
      if (alreadyPrecachedCount > 0) {
        message += ` ${alreadyPrecachedCount} ` + `file${alreadyPrecachedCount === 1 ? " is" : "s are"} already cached.`;
      }
      logger.groupCollapsed(message);
      _nestedGroup(`View newly precached URLs.`, urlsToPrecache);
      _nestedGroup(`View previously precached URLs.`, urlsAlreadyPrecached);
      logger.groupEnd();
    }
  }

  // node_modules/workbox-core/_private/canConstructResponseFromBodyStream.js
  var supportStatus;
  function canConstructResponseFromBodyStream() {
    if (supportStatus === undefined) {
      const testResponse = new Response("");
      if ("body" in testResponse) {
        try {
          new Response(testResponse.body);
          supportStatus = true;
        } catch (error) {
          supportStatus = false;
        }
      }
      supportStatus = false;
    }
    return supportStatus;
  }

  // node_modules/workbox-core/copyResponse.js
  async function copyResponse(response, modifier) {
    let origin = null;
    if (response.url) {
      const responseURL = new URL(response.url);
      origin = responseURL.origin;
    }
    if (origin !== self.location.origin) {
      throw new WorkboxError("cross-origin-copy-response", { origin });
    }
    const clonedResponse = response.clone();
    const responseInit = {
      headers: new Headers(clonedResponse.headers),
      status: clonedResponse.status,
      statusText: clonedResponse.statusText
    };
    const modifiedResponseInit = modifier ? modifier(responseInit) : responseInit;
    const body = canConstructResponseFromBodyStream() ? clonedResponse.body : await clonedResponse.blob();
    return new Response(body, modifiedResponseInit);
  }

  // node_modules/workbox-core/_private/getFriendlyURL.js
  var getFriendlyURL = (url) => {
    const urlObj = new URL(String(url), location.href);
    return urlObj.href.replace(new RegExp(`^${location.origin}`), "");
  };

  // node_modules/workbox-core/_private/cacheMatchIgnoreParams.js
  function stripParams(fullURL, ignoreParams) {
    const strippedURL = new URL(fullURL);
    for (const param of ignoreParams) {
      strippedURL.searchParams.delete(param);
    }
    return strippedURL.href;
  }
  async function cacheMatchIgnoreParams(cache, request, ignoreParams, matchOptions) {
    const strippedRequestURL = stripParams(request.url, ignoreParams);
    if (request.url === strippedRequestURL) {
      return cache.match(request, matchOptions);
    }
    const keysOptions = Object.assign(Object.assign({}, matchOptions), { ignoreSearch: true });
    const cacheKeys = await cache.keys(request, keysOptions);
    for (const cacheKey of cacheKeys) {
      const strippedCacheKeyURL = stripParams(cacheKey.url, ignoreParams);
      if (strippedRequestURL === strippedCacheKeyURL) {
        return cache.match(cacheKey, matchOptions);
      }
    }
    return;
  }

  // node_modules/workbox-core/_private/Deferred.js
  class Deferred {
    constructor() {
      this.promise = new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    }
  }

  // node_modules/workbox-core/models/quotaErrorCallbacks.js
  var quotaErrorCallbacks = new Set;

  // node_modules/workbox-core/_private/executeQuotaErrorCallbacks.js
  async function executeQuotaErrorCallbacks() {
    if (true) {
      logger.log(`About to run ${quotaErrorCallbacks.size} ` + `callbacks to clean up caches.`);
    }
    for (const callback of quotaErrorCallbacks) {
      await callback();
      if (true) {
        logger.log(callback, "is complete.");
      }
    }
    if (true) {
      logger.log("Finished running callbacks.");
    }
  }

  // node_modules/workbox-core/_private/timeout.js
  function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // node_modules/workbox-strategies/_version.js
  try {
    self["workbox:strategies:7.4.0"] && _();
  } catch (e) {}

  // node_modules/workbox-strategies/StrategyHandler.js
  function toRequest(input) {
    return typeof input === "string" ? new Request(input) : input;
  }

  class StrategyHandler {
    constructor(strategy, options) {
      this._cacheKeys = {};
      if (true) {
        finalAssertExports.isInstance(options.event, ExtendableEvent, {
          moduleName: "workbox-strategies",
          className: "StrategyHandler",
          funcName: "constructor",
          paramName: "options.event"
        });
      }
      Object.assign(this, options);
      this.event = options.event;
      this._strategy = strategy;
      this._handlerDeferred = new Deferred;
      this._extendLifetimePromises = [];
      this._plugins = [...strategy.plugins];
      this._pluginStateMap = new Map;
      for (const plugin of this._plugins) {
        this._pluginStateMap.set(plugin, {});
      }
      this.event.waitUntil(this._handlerDeferred.promise);
    }
    async fetch(input) {
      const { event } = this;
      let request = toRequest(input);
      if (request.mode === "navigate" && event instanceof FetchEvent && event.preloadResponse) {
        const possiblePreloadResponse = await event.preloadResponse;
        if (possiblePreloadResponse) {
          if (true) {
            logger.log(`Using a preloaded navigation response for ` + `'${getFriendlyURL(request.url)}'`);
          }
          return possiblePreloadResponse;
        }
      }
      const originalRequest = this.hasCallback("fetchDidFail") ? request.clone() : null;
      try {
        for (const cb of this.iterateCallbacks("requestWillFetch")) {
          request = await cb({ request: request.clone(), event });
        }
      } catch (err) {
        if (err instanceof Error) {
          throw new WorkboxError("plugin-error-request-will-fetch", {
            thrownErrorMessage: err.message
          });
        }
      }
      const pluginFilteredRequest = request.clone();
      try {
        let fetchResponse;
        fetchResponse = await fetch(request, request.mode === "navigate" ? undefined : this._strategy.fetchOptions);
        if (true) {
          logger.debug(`Network request for ` + `'${getFriendlyURL(request.url)}' returned a response with ` + `status '${fetchResponse.status}'.`);
        }
        for (const callback of this.iterateCallbacks("fetchDidSucceed")) {
          fetchResponse = await callback({
            event,
            request: pluginFilteredRequest,
            response: fetchResponse
          });
        }
        return fetchResponse;
      } catch (error) {
        if (true) {
          logger.log(`Network request for ` + `'${getFriendlyURL(request.url)}' threw an error.`, error);
        }
        if (originalRequest) {
          await this.runCallbacks("fetchDidFail", {
            error,
            event,
            originalRequest: originalRequest.clone(),
            request: pluginFilteredRequest.clone()
          });
        }
        throw error;
      }
    }
    async fetchAndCachePut(input) {
      const response = await this.fetch(input);
      const responseClone = response.clone();
      this.waitUntil(this.cachePut(input, responseClone));
      return response;
    }
    async cacheMatch(key) {
      const request = toRequest(key);
      let cachedResponse;
      const { cacheName, matchOptions } = this._strategy;
      const effectiveRequest = await this.getCacheKey(request, "read");
      const multiMatchOptions = Object.assign(Object.assign({}, matchOptions), { cacheName });
      cachedResponse = await caches.match(effectiveRequest, multiMatchOptions);
      if (true) {
        if (cachedResponse) {
          logger.debug(`Found a cached response in '${cacheName}'.`);
        } else {
          logger.debug(`No cached response found in '${cacheName}'.`);
        }
      }
      for (const callback of this.iterateCallbacks("cachedResponseWillBeUsed")) {
        cachedResponse = await callback({
          cacheName,
          matchOptions,
          cachedResponse,
          request: effectiveRequest,
          event: this.event
        }) || undefined;
      }
      return cachedResponse;
    }
    async cachePut(key, response) {
      const request = toRequest(key);
      await timeout(0);
      const effectiveRequest = await this.getCacheKey(request, "write");
      if (true) {
        if (effectiveRequest.method && effectiveRequest.method !== "GET") {
          throw new WorkboxError("attempt-to-cache-non-get-request", {
            url: getFriendlyURL(effectiveRequest.url),
            method: effectiveRequest.method
          });
        }
        const vary = response.headers.get("Vary");
        if (vary) {
          logger.debug(`The response for ${getFriendlyURL(effectiveRequest.url)} ` + `has a 'Vary: ${vary}' header. ` + `Consider setting the {ignoreVary: true} option on your strategy ` + `to ensure cache matching and deletion works as expected.`);
        }
      }
      if (!response) {
        if (true) {
          logger.error(`Cannot cache non-existent response for ` + `'${getFriendlyURL(effectiveRequest.url)}'.`);
        }
        throw new WorkboxError("cache-put-with-no-response", {
          url: getFriendlyURL(effectiveRequest.url)
        });
      }
      const responseToCache = await this._ensureResponseSafeToCache(response);
      if (!responseToCache) {
        if (true) {
          logger.debug(`Response '${getFriendlyURL(effectiveRequest.url)}' ` + `will not be cached.`, responseToCache);
        }
        return false;
      }
      const { cacheName, matchOptions } = this._strategy;
      const cache = await self.caches.open(cacheName);
      const hasCacheUpdateCallback = this.hasCallback("cacheDidUpdate");
      const oldResponse = hasCacheUpdateCallback ? await cacheMatchIgnoreParams(cache, effectiveRequest.clone(), ["__WB_REVISION__"], matchOptions) : null;
      if (true) {
        logger.debug(`Updating the '${cacheName}' cache with a new Response ` + `for ${getFriendlyURL(effectiveRequest.url)}.`);
      }
      try {
        await cache.put(effectiveRequest, hasCacheUpdateCallback ? responseToCache.clone() : responseToCache);
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === "QuotaExceededError") {
            await executeQuotaErrorCallbacks();
          }
          throw error;
        }
      }
      for (const callback of this.iterateCallbacks("cacheDidUpdate")) {
        await callback({
          cacheName,
          oldResponse,
          newResponse: responseToCache.clone(),
          request: effectiveRequest,
          event: this.event
        });
      }
      return true;
    }
    async getCacheKey(request, mode) {
      const key = `${request.url} | ${mode}`;
      if (!this._cacheKeys[key]) {
        let effectiveRequest = request;
        for (const callback of this.iterateCallbacks("cacheKeyWillBeUsed")) {
          effectiveRequest = toRequest(await callback({
            mode,
            request: effectiveRequest,
            event: this.event,
            params: this.params
          }));
        }
        this._cacheKeys[key] = effectiveRequest;
      }
      return this._cacheKeys[key];
    }
    hasCallback(name) {
      for (const plugin of this._strategy.plugins) {
        if (name in plugin) {
          return true;
        }
      }
      return false;
    }
    async runCallbacks(name, param) {
      for (const callback of this.iterateCallbacks(name)) {
        await callback(param);
      }
    }
    *iterateCallbacks(name) {
      for (const plugin of this._strategy.plugins) {
        if (typeof plugin[name] === "function") {
          const state = this._pluginStateMap.get(plugin);
          const statefulCallback = (param) => {
            const statefulParam = Object.assign(Object.assign({}, param), { state });
            return plugin[name](statefulParam);
          };
          yield statefulCallback;
        }
      }
    }
    waitUntil(promise) {
      this._extendLifetimePromises.push(promise);
      return promise;
    }
    async doneWaiting() {
      while (this._extendLifetimePromises.length) {
        const promises = this._extendLifetimePromises.splice(0);
        const result = await Promise.allSettled(promises);
        const firstRejection = result.find((i) => i.status === "rejected");
        if (firstRejection) {
          throw firstRejection.reason;
        }
      }
    }
    destroy() {
      this._handlerDeferred.resolve(null);
    }
    async _ensureResponseSafeToCache(response) {
      let responseToCache = response;
      let pluginsUsed = false;
      for (const callback of this.iterateCallbacks("cacheWillUpdate")) {
        responseToCache = await callback({
          request: this.request,
          response: responseToCache,
          event: this.event
        }) || undefined;
        pluginsUsed = true;
        if (!responseToCache) {
          break;
        }
      }
      if (!pluginsUsed) {
        if (responseToCache && responseToCache.status !== 200) {
          responseToCache = undefined;
        }
        if (true) {
          if (responseToCache) {
            if (responseToCache.status !== 200) {
              if (responseToCache.status === 0) {
                logger.warn(`The response for '${this.request.url}' ` + `is an opaque response. The caching strategy that you're ` + `using will not cache opaque responses by default.`);
              } else {
                logger.debug(`The response for '${this.request.url}' ` + `returned a status code of '${response.status}' and won't ` + `be cached as a result.`);
              }
            }
          }
        }
      }
      return responseToCache;
    }
  }

  // node_modules/workbox-strategies/Strategy.js
  class Strategy {
    constructor(options = {}) {
      this.cacheName = cacheNames.getRuntimeName(options.cacheName);
      this.plugins = options.plugins || [];
      this.fetchOptions = options.fetchOptions;
      this.matchOptions = options.matchOptions;
    }
    handle(options) {
      const [responseDone] = this.handleAll(options);
      return responseDone;
    }
    handleAll(options) {
      if (options instanceof FetchEvent) {
        options = {
          event: options,
          request: options.request
        };
      }
      const event = options.event;
      const request = typeof options.request === "string" ? new Request(options.request) : options.request;
      const params = "params" in options ? options.params : undefined;
      const handler = new StrategyHandler(this, { event, request, params });
      const responseDone = this._getResponse(handler, request, event);
      const handlerDone = this._awaitComplete(responseDone, handler, request, event);
      return [responseDone, handlerDone];
    }
    async _getResponse(handler, request, event) {
      await handler.runCallbacks("handlerWillStart", { event, request });
      let response = undefined;
      try {
        response = await this._handle(request, handler);
        if (!response || response.type === "error") {
          throw new WorkboxError("no-response", { url: request.url });
        }
      } catch (error) {
        if (error instanceof Error) {
          for (const callback of handler.iterateCallbacks("handlerDidError")) {
            response = await callback({ error, event, request });
            if (response) {
              break;
            }
          }
        }
        if (!response) {
          throw error;
        } else if (true) {
          logger.log(`While responding to '${getFriendlyURL(request.url)}', ` + `an ${error instanceof Error ? error.toString() : ""} error occurred. Using a fallback response provided by ` + `a handlerDidError plugin.`);
        }
      }
      for (const callback of handler.iterateCallbacks("handlerWillRespond")) {
        response = await callback({ event, request, response });
      }
      return response;
    }
    async _awaitComplete(responseDone, handler, request, event) {
      let response;
      let error;
      try {
        response = await responseDone;
      } catch (error) {}
      try {
        await handler.runCallbacks("handlerDidRespond", {
          event,
          request,
          response
        });
        await handler.doneWaiting();
      } catch (waitUntilError) {
        if (waitUntilError instanceof Error) {
          error = waitUntilError;
        }
      }
      await handler.runCallbacks("handlerDidComplete", {
        event,
        request,
        response,
        error
      });
      handler.destroy();
      if (error) {
        throw error;
      }
    }
  }

  // node_modules/workbox-precaching/PrecacheStrategy.js
  class PrecacheStrategy extends Strategy {
    constructor(options = {}) {
      options.cacheName = cacheNames.getPrecacheName(options.cacheName);
      super(options);
      this._fallbackToNetwork = options.fallbackToNetwork === false ? false : true;
      this.plugins.push(PrecacheStrategy.copyRedirectedCacheableResponsesPlugin);
    }
    async _handle(request, handler) {
      const response = await handler.cacheMatch(request);
      if (response) {
        return response;
      }
      if (handler.event && handler.event.type === "install") {
        return await this._handleInstall(request, handler);
      }
      return await this._handleFetch(request, handler);
    }
    async _handleFetch(request, handler) {
      let response;
      const params = handler.params || {};
      if (this._fallbackToNetwork) {
        if (true) {
          logger.warn(`The precached response for ` + `${getFriendlyURL(request.url)} in ${this.cacheName} was not ` + `found. Falling back to the network.`);
        }
        const integrityInManifest = params.integrity;
        const integrityInRequest = request.integrity;
        const noIntegrityConflict = !integrityInRequest || integrityInRequest === integrityInManifest;
        response = await handler.fetch(new Request(request, {
          integrity: request.mode !== "no-cors" ? integrityInRequest || integrityInManifest : undefined
        }));
        if (integrityInManifest && noIntegrityConflict && request.mode !== "no-cors") {
          this._useDefaultCacheabilityPluginIfNeeded();
          const wasCached = await handler.cachePut(request, response.clone());
          if (true) {
            if (wasCached) {
              logger.log(`A response for ${getFriendlyURL(request.url)} ` + `was used to "repair" the precache.`);
            }
          }
        }
      } else {
        throw new WorkboxError("missing-precache-entry", {
          cacheName: this.cacheName,
          url: request.url
        });
      }
      if (true) {
        const cacheKey = params.cacheKey || await handler.getCacheKey(request, "read");
        logger.groupCollapsed(`Precaching is responding to: ` + getFriendlyURL(request.url));
        logger.log(`Serving the precached url: ${getFriendlyURL(cacheKey instanceof Request ? cacheKey.url : cacheKey)}`);
        logger.groupCollapsed(`View request details here.`);
        logger.log(request);
        logger.groupEnd();
        logger.groupCollapsed(`View response details here.`);
        logger.log(response);
        logger.groupEnd();
        logger.groupEnd();
      }
      return response;
    }
    async _handleInstall(request, handler) {
      this._useDefaultCacheabilityPluginIfNeeded();
      const response = await handler.fetch(request);
      const wasCached = await handler.cachePut(request, response.clone());
      if (!wasCached) {
        throw new WorkboxError("bad-precaching-response", {
          url: request.url,
          status: response.status
        });
      }
      return response;
    }
    _useDefaultCacheabilityPluginIfNeeded() {
      let defaultPluginIndex = null;
      let cacheWillUpdatePluginCount = 0;
      for (const [index, plugin] of this.plugins.entries()) {
        if (plugin === PrecacheStrategy.copyRedirectedCacheableResponsesPlugin) {
          continue;
        }
        if (plugin === PrecacheStrategy.defaultPrecacheCacheabilityPlugin) {
          defaultPluginIndex = index;
        }
        if (plugin.cacheWillUpdate) {
          cacheWillUpdatePluginCount++;
        }
      }
      if (cacheWillUpdatePluginCount === 0) {
        this.plugins.push(PrecacheStrategy.defaultPrecacheCacheabilityPlugin);
      } else if (cacheWillUpdatePluginCount > 1 && defaultPluginIndex !== null) {
        this.plugins.splice(defaultPluginIndex, 1);
      }
    }
  }
  PrecacheStrategy.defaultPrecacheCacheabilityPlugin = {
    async cacheWillUpdate({ response }) {
      if (!response || response.status >= 400) {
        return null;
      }
      return response;
    }
  };
  PrecacheStrategy.copyRedirectedCacheableResponsesPlugin = {
    async cacheWillUpdate({ response }) {
      return response.redirected ? await copyResponse(response) : response;
    }
  };

  // node_modules/workbox-precaching/PrecacheController.js
  class PrecacheController {
    constructor({ cacheName, plugins = [], fallbackToNetwork = true } = {}) {
      this._urlsToCacheKeys = new Map;
      this._urlsToCacheModes = new Map;
      this._cacheKeysToIntegrities = new Map;
      this._strategy = new PrecacheStrategy({
        cacheName: cacheNames.getPrecacheName(cacheName),
        plugins: [
          ...plugins,
          new PrecacheCacheKeyPlugin({ precacheController: this })
        ],
        fallbackToNetwork
      });
      this.install = this.install.bind(this);
      this.activate = this.activate.bind(this);
    }
    get strategy() {
      return this._strategy;
    }
    precache(entries) {
      this.addToCacheList(entries);
      if (!this._installAndActiveListenersAdded) {
        self.addEventListener("install", this.install);
        self.addEventListener("activate", this.activate);
        this._installAndActiveListenersAdded = true;
      }
    }
    addToCacheList(entries) {
      if (true) {
        finalAssertExports.isArray(entries, {
          moduleName: "workbox-precaching",
          className: "PrecacheController",
          funcName: "addToCacheList",
          paramName: "entries"
        });
      }
      const urlsToWarnAbout = [];
      for (const entry of entries) {
        if (typeof entry === "string") {
          urlsToWarnAbout.push(entry);
        } else if (entry && entry.revision === undefined) {
          urlsToWarnAbout.push(entry.url);
        }
        const { cacheKey, url } = createCacheKey(entry);
        const cacheMode = typeof entry !== "string" && entry.revision ? "reload" : "default";
        if (this._urlsToCacheKeys.has(url) && this._urlsToCacheKeys.get(url) !== cacheKey) {
          throw new WorkboxError("add-to-cache-list-conflicting-entries", {
            firstEntry: this._urlsToCacheKeys.get(url),
            secondEntry: cacheKey
          });
        }
        if (typeof entry !== "string" && entry.integrity) {
          if (this._cacheKeysToIntegrities.has(cacheKey) && this._cacheKeysToIntegrities.get(cacheKey) !== entry.integrity) {
            throw new WorkboxError("add-to-cache-list-conflicting-integrities", {
              url
            });
          }
          this._cacheKeysToIntegrities.set(cacheKey, entry.integrity);
        }
        this._urlsToCacheKeys.set(url, cacheKey);
        this._urlsToCacheModes.set(url, cacheMode);
        if (urlsToWarnAbout.length > 0) {
          const warningMessage = `Workbox is precaching URLs without revision ` + `info: ${urlsToWarnAbout.join(", ")}
This is generally NOT safe. ` + `Learn more at https://bit.ly/wb-precache`;
          if (false) {} else {
            logger.warn(warningMessage);
          }
        }
      }
    }
    install(event) {
      return waitUntil(event, async () => {
        const installReportPlugin = new PrecacheInstallReportPlugin;
        this.strategy.plugins.push(installReportPlugin);
        for (const [url, cacheKey] of this._urlsToCacheKeys) {
          const integrity = this._cacheKeysToIntegrities.get(cacheKey);
          const cacheMode = this._urlsToCacheModes.get(url);
          const request = new Request(url, {
            integrity,
            cache: cacheMode,
            credentials: "same-origin"
          });
          await Promise.all(this.strategy.handleAll({
            params: { cacheKey },
            request,
            event
          }));
        }
        const { updatedURLs, notUpdatedURLs } = installReportPlugin;
        if (true) {
          printInstallDetails(updatedURLs, notUpdatedURLs);
        }
        return { updatedURLs, notUpdatedURLs };
      });
    }
    activate(event) {
      return waitUntil(event, async () => {
        const cache = await self.caches.open(this.strategy.cacheName);
        const currentlyCachedRequests = await cache.keys();
        const expectedCacheKeys = new Set(this._urlsToCacheKeys.values());
        const deletedURLs = [];
        for (const request of currentlyCachedRequests) {
          if (!expectedCacheKeys.has(request.url)) {
            await cache.delete(request);
            deletedURLs.push(request.url);
          }
        }
        if (true) {
          printCleanupDetails(deletedURLs);
        }
        return { deletedURLs };
      });
    }
    getURLsToCacheKeys() {
      return this._urlsToCacheKeys;
    }
    getCachedURLs() {
      return [...this._urlsToCacheKeys.keys()];
    }
    getCacheKeyForURL(url) {
      const urlObject = new URL(url, location.href);
      return this._urlsToCacheKeys.get(urlObject.href);
    }
    getIntegrityForCacheKey(cacheKey) {
      return this._cacheKeysToIntegrities.get(cacheKey);
    }
    async matchPrecache(request) {
      const url = request instanceof Request ? request.url : request;
      const cacheKey = this.getCacheKeyForURL(url);
      if (cacheKey) {
        const cache = await self.caches.open(this.strategy.cacheName);
        return cache.match(cacheKey);
      }
      return;
    }
    createHandlerBoundToURL(url) {
      const cacheKey = this.getCacheKeyForURL(url);
      if (!cacheKey) {
        throw new WorkboxError("non-precached-url", { url });
      }
      return (options) => {
        options.request = new Request(url);
        options.params = Object.assign({ cacheKey }, options.params);
        return this.strategy.handle(options);
      };
    }
  }

  // node_modules/workbox-precaching/utils/getOrCreatePrecacheController.js
  var precacheController;
  var getOrCreatePrecacheController = () => {
    if (!precacheController) {
      precacheController = new PrecacheController;
    }
    return precacheController;
  };

  // node_modules/workbox-routing/_version.js
  try {
    self["workbox:routing:7.4.0"] && _();
  } catch (e) {}

  // node_modules/workbox-routing/utils/constants.js
  var defaultMethod = "GET";
  var validMethods = [
    "DELETE",
    "GET",
    "HEAD",
    "PATCH",
    "POST",
    "PUT"
  ];

  // node_modules/workbox-routing/utils/normalizeHandler.js
  var normalizeHandler = (handler) => {
    if (handler && typeof handler === "object") {
      if (true) {
        finalAssertExports.hasMethod(handler, "handle", {
          moduleName: "workbox-routing",
          className: "Route",
          funcName: "constructor",
          paramName: "handler"
        });
      }
      return handler;
    } else {
      if (true) {
        finalAssertExports.isType(handler, "function", {
          moduleName: "workbox-routing",
          className: "Route",
          funcName: "constructor",
          paramName: "handler"
        });
      }
      return { handle: handler };
    }
  };

  // node_modules/workbox-routing/Route.js
  class Route {
    constructor(match, handler, method = defaultMethod) {
      if (true) {
        finalAssertExports.isType(match, "function", {
          moduleName: "workbox-routing",
          className: "Route",
          funcName: "constructor",
          paramName: "match"
        });
        if (method) {
          finalAssertExports.isOneOf(method, validMethods, { paramName: "method" });
        }
      }
      this.handler = normalizeHandler(handler);
      this.match = match;
      this.method = method;
    }
    setCatchHandler(handler) {
      this.catchHandler = normalizeHandler(handler);
    }
  }

  // node_modules/workbox-routing/RegExpRoute.js
  class RegExpRoute extends Route {
    constructor(regExp, handler, method) {
      if (true) {
        finalAssertExports.isInstance(regExp, RegExp, {
          moduleName: "workbox-routing",
          className: "RegExpRoute",
          funcName: "constructor",
          paramName: "pattern"
        });
      }
      const match = ({ url }) => {
        const result = regExp.exec(url.href);
        if (!result) {
          return;
        }
        if (url.origin !== location.origin && result.index !== 0) {
          if (true) {
            logger.debug(`The regular expression '${regExp.toString()}' only partially matched ` + `against the cross-origin URL '${url.toString()}'. RegExpRoute's will only ` + `handle cross-origin requests if they match the entire URL.`);
          }
          return;
        }
        return result.slice(1);
      };
      super(match, handler, method);
    }
  }

  // node_modules/workbox-routing/Router.js
  class Router {
    constructor() {
      this._routes = new Map;
      this._defaultHandlerMap = new Map;
    }
    get routes() {
      return this._routes;
    }
    addFetchListener() {
      self.addEventListener("fetch", (event) => {
        const { request } = event;
        const responsePromise = this.handleRequest({ request, event });
        if (responsePromise) {
          event.respondWith(responsePromise);
        }
      });
    }
    addCacheListener() {
      self.addEventListener("message", (event) => {
        if (event.data && event.data.type === "CACHE_URLS") {
          const { payload } = event.data;
          if (true) {
            logger.debug(`Caching URLs from the window`, payload.urlsToCache);
          }
          const requestPromises = Promise.all(payload.urlsToCache.map((entry) => {
            if (typeof entry === "string") {
              entry = [entry];
            }
            const request = new Request(...entry);
            return this.handleRequest({ request, event });
          }));
          event.waitUntil(requestPromises);
          if (event.ports && event.ports[0]) {
            requestPromises.then(() => event.ports[0].postMessage(true));
          }
        }
      });
    }
    handleRequest({ request, event }) {
      if (true) {
        finalAssertExports.isInstance(request, Request, {
          moduleName: "workbox-routing",
          className: "Router",
          funcName: "handleRequest",
          paramName: "options.request"
        });
      }
      const url = new URL(request.url, location.href);
      if (!url.protocol.startsWith("http")) {
        if (true) {
          logger.debug(`Workbox Router only supports URLs that start with 'http'.`);
        }
        return;
      }
      const sameOrigin = url.origin === location.origin;
      const { params, route } = this.findMatchingRoute({
        event,
        request,
        sameOrigin,
        url
      });
      let handler = route && route.handler;
      const debugMessages = [];
      if (true) {
        if (handler) {
          debugMessages.push([`Found a route to handle this request:`, route]);
          if (params) {
            debugMessages.push([
              `Passing the following params to the route's handler:`,
              params
            ]);
          }
        }
      }
      const method = request.method;
      if (!handler && this._defaultHandlerMap.has(method)) {
        if (true) {
          debugMessages.push(`Failed to find a matching route. Falling ` + `back to the default handler for ${method}.`);
        }
        handler = this._defaultHandlerMap.get(method);
      }
      if (!handler) {
        if (true) {
          logger.debug(`No route found for: ${getFriendlyURL(url)}`);
        }
        return;
      }
      if (true) {
        logger.groupCollapsed(`Router is responding to: ${getFriendlyURL(url)}`);
        debugMessages.forEach((msg) => {
          if (Array.isArray(msg)) {
            logger.log(...msg);
          } else {
            logger.log(msg);
          }
        });
        logger.groupEnd();
      }
      let responsePromise;
      try {
        responsePromise = handler.handle({ url, request, event, params });
      } catch (err) {
        responsePromise = Promise.reject(err);
      }
      const catchHandler = route && route.catchHandler;
      if (responsePromise instanceof Promise && (this._catchHandler || catchHandler)) {
        responsePromise = responsePromise.catch(async (err) => {
          if (catchHandler) {
            if (true) {
              logger.groupCollapsed(`Error thrown when responding to: ` + ` ${getFriendlyURL(url)}. Falling back to route's Catch Handler.`);
              logger.error(`Error thrown by:`, route);
              logger.error(err);
              logger.groupEnd();
            }
            try {
              return await catchHandler.handle({ url, request, event, params });
            } catch (catchErr) {
              if (catchErr instanceof Error) {
                err = catchErr;
              }
            }
          }
          if (this._catchHandler) {
            if (true) {
              logger.groupCollapsed(`Error thrown when responding to: ` + ` ${getFriendlyURL(url)}. Falling back to global Catch Handler.`);
              logger.error(`Error thrown by:`, route);
              logger.error(err);
              logger.groupEnd();
            }
            return this._catchHandler.handle({ url, request, event });
          }
          throw err;
        });
      }
      return responsePromise;
    }
    findMatchingRoute({ url, sameOrigin, request, event }) {
      const routes = this._routes.get(request.method) || [];
      for (const route of routes) {
        let params;
        const matchResult = route.match({ url, sameOrigin, request, event });
        if (matchResult) {
          if (true) {
            if (matchResult instanceof Promise) {
              logger.warn(`While routing ${getFriendlyURL(url)}, an async ` + `matchCallback function was used. Please convert the ` + `following route to use a synchronous matchCallback function:`, route);
            }
          }
          params = matchResult;
          if (Array.isArray(params) && params.length === 0) {
            params = undefined;
          } else if (matchResult.constructor === Object && Object.keys(matchResult).length === 0) {
            params = undefined;
          } else if (typeof matchResult === "boolean") {
            params = undefined;
          }
          return { route, params };
        }
      }
      return {};
    }
    setDefaultHandler(handler, method = defaultMethod) {
      this._defaultHandlerMap.set(method, normalizeHandler(handler));
    }
    setCatchHandler(handler) {
      this._catchHandler = normalizeHandler(handler);
    }
    registerRoute(route) {
      if (true) {
        finalAssertExports.isType(route, "object", {
          moduleName: "workbox-routing",
          className: "Router",
          funcName: "registerRoute",
          paramName: "route"
        });
        finalAssertExports.hasMethod(route, "match", {
          moduleName: "workbox-routing",
          className: "Router",
          funcName: "registerRoute",
          paramName: "route"
        });
        finalAssertExports.isType(route.handler, "object", {
          moduleName: "workbox-routing",
          className: "Router",
          funcName: "registerRoute",
          paramName: "route"
        });
        finalAssertExports.hasMethod(route.handler, "handle", {
          moduleName: "workbox-routing",
          className: "Router",
          funcName: "registerRoute",
          paramName: "route.handler"
        });
        finalAssertExports.isType(route.method, "string", {
          moduleName: "workbox-routing",
          className: "Router",
          funcName: "registerRoute",
          paramName: "route.method"
        });
      }
      if (!this._routes.has(route.method)) {
        this._routes.set(route.method, []);
      }
      this._routes.get(route.method).push(route);
    }
    unregisterRoute(route) {
      if (!this._routes.has(route.method)) {
        throw new WorkboxError("unregister-route-but-not-found-with-method", {
          method: route.method
        });
      }
      const routeIndex = this._routes.get(route.method).indexOf(route);
      if (routeIndex > -1) {
        this._routes.get(route.method).splice(routeIndex, 1);
      } else {
        throw new WorkboxError("unregister-route-route-not-registered");
      }
    }
  }

  // node_modules/workbox-routing/utils/getOrCreateDefaultRouter.js
  var defaultRouter;
  var getOrCreateDefaultRouter = () => {
    if (!defaultRouter) {
      defaultRouter = new Router;
      defaultRouter.addFetchListener();
      defaultRouter.addCacheListener();
    }
    return defaultRouter;
  };

  // node_modules/workbox-routing/registerRoute.js
  function registerRoute(capture, handler, method) {
    let route;
    if (typeof capture === "string") {
      const captureUrl = new URL(capture, location.href);
      if (true) {
        if (!(capture.startsWith("/") || capture.startsWith("http"))) {
          throw new WorkboxError("invalid-string", {
            moduleName: "workbox-routing",
            funcName: "registerRoute",
            paramName: "capture"
          });
        }
        const valueToCheck = capture.startsWith("http") ? captureUrl.pathname : capture;
        const wildcards = "[*:?+]";
        if (new RegExp(`${wildcards}`).exec(valueToCheck)) {
          logger.debug(`The '$capture' parameter contains an Express-style wildcard ` + `character (${wildcards}). Strings are now always interpreted as ` + `exact matches; use a RegExp for partial or wildcard matches.`);
        }
      }
      const matchCallback = ({ url }) => {
        if (true) {
          if (url.pathname === captureUrl.pathname && url.origin !== captureUrl.origin) {
            logger.debug(`${capture} only partially matches the cross-origin URL ` + `${url.toString()}. This route will only handle cross-origin requests ` + `if they match the entire URL.`);
          }
        }
        return url.href === captureUrl.href;
      };
      route = new Route(matchCallback, handler, method);
    } else if (capture instanceof RegExp) {
      route = new RegExpRoute(capture, handler, method);
    } else if (typeof capture === "function") {
      route = new Route(capture, handler, method);
    } else if (capture instanceof Route) {
      route = capture;
    } else {
      throw new WorkboxError("unsupported-route-type", {
        moduleName: "workbox-routing",
        funcName: "registerRoute",
        paramName: "capture"
      });
    }
    const defaultRouter = getOrCreateDefaultRouter();
    defaultRouter.registerRoute(route);
    return route;
  }

  // node_modules/workbox-precaching/utils/removeIgnoredSearchParams.js
  function removeIgnoredSearchParams(urlObject, ignoreURLParametersMatching = []) {
    for (const paramName of [...urlObject.searchParams.keys()]) {
      if (ignoreURLParametersMatching.some((regExp) => regExp.test(paramName))) {
        urlObject.searchParams.delete(paramName);
      }
    }
    return urlObject;
  }

  // node_modules/workbox-precaching/utils/generateURLVariations.js
  function* generateURLVariations(url, { ignoreURLParametersMatching = [/^utm_/, /^fbclid$/], directoryIndex = "index.html", cleanURLs = true, urlManipulation } = {}) {
    const urlObject = new URL(url, location.href);
    urlObject.hash = "";
    yield urlObject.href;
    const urlWithoutIgnoredParams = removeIgnoredSearchParams(urlObject, ignoreURLParametersMatching);
    yield urlWithoutIgnoredParams.href;
    if (directoryIndex && urlWithoutIgnoredParams.pathname.endsWith("/")) {
      const directoryURL = new URL(urlWithoutIgnoredParams.href);
      directoryURL.pathname += directoryIndex;
      yield directoryURL.href;
    }
    if (cleanURLs) {
      const cleanURL = new URL(urlWithoutIgnoredParams.href);
      cleanURL.pathname += ".html";
      yield cleanURL.href;
    }
    if (urlManipulation) {
      const additionalURLs = urlManipulation({ url: urlObject });
      for (const urlToAttempt of additionalURLs) {
        yield urlToAttempt.href;
      }
    }
  }

  // node_modules/workbox-precaching/PrecacheRoute.js
  class PrecacheRoute extends Route {
    constructor(precacheController, options) {
      const match = ({ request }) => {
        const urlsToCacheKeys = precacheController.getURLsToCacheKeys();
        for (const possibleURL of generateURLVariations(request.url, options)) {
          const cacheKey = urlsToCacheKeys.get(possibleURL);
          if (cacheKey) {
            const integrity = precacheController.getIntegrityForCacheKey(cacheKey);
            return { cacheKey, integrity };
          }
        }
        if (true) {
          logger.debug(`Precaching did not find a match for ` + getFriendlyURL(request.url));
        }
        return;
      };
      super(match, precacheController.strategy);
    }
  }

  // node_modules/workbox-precaching/addRoute.js
  function addRoute(options) {
    const precacheController = getOrCreatePrecacheController();
    const precacheRoute = new PrecacheRoute(precacheController, options);
    registerRoute(precacheRoute);
  }

  // node_modules/workbox-precaching/utils/deleteOutdatedCaches.js
  var SUBSTRING_TO_FIND = "-precache-";
  var deleteOutdatedCaches = async (currentPrecacheName, substringToFind = SUBSTRING_TO_FIND) => {
    const cacheNames = await self.caches.keys();
    const cacheNamesToDelete = cacheNames.filter((cacheName) => {
      return cacheName.includes(substringToFind) && cacheName.includes(self.registration.scope) && cacheName !== currentPrecacheName;
    });
    await Promise.all(cacheNamesToDelete.map((cacheName) => self.caches.delete(cacheName)));
    return cacheNamesToDelete;
  };

  // node_modules/workbox-precaching/cleanupOutdatedCaches.js
  function cleanupOutdatedCaches() {
    self.addEventListener("activate", (event) => {
      const cacheName = cacheNames.getPrecacheName();
      event.waitUntil(deleteOutdatedCaches(cacheName).then((cachesDeleted) => {
        if (true) {
          if (cachesDeleted.length > 0) {
            logger.log(`The following out-of-date precaches were cleaned up ` + `automatically:`, cachesDeleted);
          }
        }
      }));
    });
  }

  // node_modules/workbox-precaching/createHandlerBoundToURL.js
  function createHandlerBoundToURL(url) {
    const precacheController = getOrCreatePrecacheController();
    return precacheController.createHandlerBoundToURL(url);
  }

  // node_modules/workbox-precaching/getCacheKeyForURL.js
  function getCacheKeyForURL(url) {
    const precacheController = getOrCreatePrecacheController();
    return precacheController.getCacheKeyForURL(url);
  }

  // node_modules/workbox-precaching/precache.js
  function precache(entries) {
    const precacheController = getOrCreatePrecacheController();
    precacheController.precache(entries);
  }

  // node_modules/workbox-precaching/precacheAndRoute.js
  function precacheAndRoute(entries, options) {
    precache(entries);
    addRoute(options);
  }
  // node_modules/workbox-routing/NavigationRoute.js
  class NavigationRoute extends Route {
    constructor(handler, { allowlist = [/./], denylist = [] } = {}) {
      if (true) {
        finalAssertExports.isArrayOfClass(allowlist, RegExp, {
          moduleName: "workbox-routing",
          className: "NavigationRoute",
          funcName: "constructor",
          paramName: "options.allowlist"
        });
        finalAssertExports.isArrayOfClass(denylist, RegExp, {
          moduleName: "workbox-routing",
          className: "NavigationRoute",
          funcName: "constructor",
          paramName: "options.denylist"
        });
      }
      super((options) => this._match(options), handler);
      this._allowlist = allowlist;
      this._denylist = denylist;
    }
    _match({ url, request }) {
      if (request && request.mode !== "navigate") {
        return false;
      }
      const pathnameAndSearch = url.pathname + url.search;
      for (const regExp of this._denylist) {
        if (regExp.test(pathnameAndSearch)) {
          if (true) {
            logger.log(`The navigation route ${pathnameAndSearch} is not ` + `being used, since the URL matches this denylist pattern: ` + `${regExp.toString()}`);
          }
          return false;
        }
      }
      if (this._allowlist.some((regExp) => regExp.test(pathnameAndSearch))) {
        if (true) {
          logger.debug(`The navigation route ${pathnameAndSearch} ` + `is being used.`);
        }
        return true;
      }
      if (true) {
        logger.log(`The navigation route ${pathnameAndSearch} is not ` + `being used, since the URL being navigated to doesn't ` + `match the allowlist.`);
      }
      return false;
    }
  }

  // node_modules/workbox-core/cacheNames.js
  var cacheNames2 = {
    get googleAnalytics() {
      return cacheNames.getGoogleAnalyticsName();
    },
    get precache() {
      return cacheNames.getPrecacheName();
    },
    get prefix() {
      return cacheNames.getPrefix();
    },
    get runtime() {
      return cacheNames.getRuntimeName();
    },
    get suffix() {
      return cacheNames.getSuffix();
    }
  };
  // web/cache-audit.ts
  async function digest(bytes) {
    return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))].map((n) => n.toString(16).padStart(2, "0")).join("");
  }
  async function verifyResponse(response, entry) {
    if (!response || !response.ok)
      return false;
    const bytes = await response.arrayBuffer();
    return bytes.byteLength === entry.bytes && await digest(bytes) === entry.sha256;
  }
  async function auditCached(entries, match) {
    const missing = [], corrupt = [];
    if (!entries.length || new Set(entries.map((e) => e.url)).size !== entries.length)
      return { missing: ["invalid required inventory"], corrupt: [], state: "error" };
    for (const entry of entries) {
      const response = await match(entry.url);
      if (!response)
        missing.push(entry.url);
      else if (!await verifyResponse(response, entry))
        corrupt.push(entry.url);
    }
    return { missing, corrupt, state: missing.length || corrupt.length ? "error" : "ready" };
  }

  // web/sw.ts
  if (typeof { inventory: { schemaVersion: 1, buildId: "0930123c68d675c10e7284821b9c33333200df24d2fbbefff15642966f043803", mode: "release", engine: { version: "4.7.2", templateSha256: "f298490b8d44d934be425a5a65a51bf15f422428b229a06a6e11d9ffea248011" }, entrypoint: "index.html", packMountOrder: ["releases/0930123c68d675c10e7284821b9c33333200df24d2fbbefff15642966f043803/sor.pck"], entries: [{ url: "assets/icons/icon-maskable.svg", sha256: "b51d5573688bd0dfc9224a8d8709713506250f7e659f57d3c2be9f03ae72116e", bytes: 357, category: "content" }, { url: "assets/icons/icon.svg", sha256: "c78b0a67096128d469525ef4058ed4655d9335db8b3385ad9a37508020c920c6", bytes: 365, category: "content" }, { url: "index.html", sha256: "7aeb8a43e6ede32f13c722b2ba0621bb44f622762c0d11d1476221b64a3f71d6", bytes: 1710, category: "content" }, { url: "manifest.webmanifest", sha256: "f04f477ef560faf86d300aa30c5eba971e416ae382775842bdd4e74ecd820a5a", bytes: 392, category: "content" }, { url: "releases/0930123c68d675c10e7284821b9c33333200df24d2fbbefff15642966f043803/browser.js", sha256: "55432a048a10584557a51c335fd8a5c3555e242b8ae17051a41108d2811a498c", bytes: 18554, category: "content" }, { url: "releases/0930123c68d675c10e7284821b9c33333200df24d2fbbefff15642966f043803/index.html", sha256: "7aeb8a43e6ede32f13c722b2ba0621bb44f622762c0d11d1476221b64a3f71d6", bytes: 1710, category: "content" }, { url: "releases/0930123c68d675c10e7284821b9c33333200df24d2fbbefff15642966f043803/sor.audio.position.worklet.js", sha256: "be33985bc7160d6bf9646f259cd86b259cd67b02ccb297ee5c44f8ac84327bc8", bytes: 2973, category: "engine" }, { url: "releases/0930123c68d675c10e7284821b9c33333200df24d2fbbefff15642966f043803/sor.audio.worklet.js", sha256: "5b476a9c9ce642c0ee4256436d1bc31d9c38f868aca0f9a8e2a57c18d2dec2a3", bytes: 7298, category: "engine" }, { url: "releases/0930123c68d675c10e7284821b9c33333200df24d2fbbefff15642966f043803/sor.js", sha256: "33c94cb3175f3333b82e2a3be5e8e86f77986f0aa2042b1631f6367a4e5bb6ba", bytes: 279815, category: "engine" }, { url: "releases/0930123c68d675c10e7284821b9c33333200df24d2fbbefff15642966f043803/sor.pck", sha256: "daf8a1ce6e834e65162352c898549eba0e0717495be4d4de09b85deb5e18ed52", bytes: 5572176, category: "content" }, { url: "releases/0930123c68d675c10e7284821b9c33333200df24d2fbbefff15642966f043803/sor.wasm", sha256: "fc74679e3b97f76878947fcd4fbe1268cbfa6188182a2e33bbc3f5dc9bfa57d0", bytes: 39514754, category: "engine" }] }, inventoryUrl: "releases/0930123c68d675c10e7284821b9c33333200df24d2fbbefff15642966f043803/asset-inventory.json", inventoryDigest: "c4cd6782b39cdc55fa10d699dd636de0182e8036e2124d0d154e138423c7e0db" } !== "undefined") {
    const config = { inventory: { schemaVersion: 1, buildId: "0930123c68d675c10e7284821b9c33333200df24d2fbbefff15642966f043803", mode: "release", engine: { version: "4.7.2", templateSha256: "f298490b8d44d934be425a5a65a51bf15f422428b229a06a6e11d9ffea248011" }, entrypoint: "index.html", packMountOrder: ["releases/0930123c68d675c10e7284821b9c33333200df24d2fbbefff15642966f043803/sor.pck"], entries: [{ url: "assets/icons/icon-maskable.svg", sha256: "b51d5573688bd0dfc9224a8d8709713506250f7e659f57d3c2be9f03ae72116e", bytes: 357, category: "content" }, { url: "assets/icons/icon.svg", sha256: "c78b0a67096128d469525ef4058ed4655d9335db8b3385ad9a37508020c920c6", bytes: 365, category: "content" }, { url: "index.html", sha256: "7aeb8a43e6ede32f13c722b2ba0621bb44f622762c0d11d1476221b64a3f71d6", bytes: 1710, category: "content" }, { url: "manifest.webmanifest", sha256: "f04f477ef560faf86d300aa30c5eba971e416ae382775842bdd4e74ecd820a5a", bytes: 392, category: "content" }, { url: "releases/0930123c68d675c10e7284821b9c33333200df24d2fbbefff15642966f043803/browser.js", sha256: "55432a048a10584557a51c335fd8a5c3555e242b8ae17051a41108d2811a498c", bytes: 18554, category: "content" }, { url: "releases/0930123c68d675c10e7284821b9c33333200df24d2fbbefff15642966f043803/index.html", sha256: "7aeb8a43e6ede32f13c722b2ba0621bb44f622762c0d11d1476221b64a3f71d6", bytes: 1710, category: "content" }, { url: "releases/0930123c68d675c10e7284821b9c33333200df24d2fbbefff15642966f043803/sor.audio.position.worklet.js", sha256: "be33985bc7160d6bf9646f259cd86b259cd67b02ccb297ee5c44f8ac84327bc8", bytes: 2973, category: "engine" }, { url: "releases/0930123c68d675c10e7284821b9c33333200df24d2fbbefff15642966f043803/sor.audio.worklet.js", sha256: "5b476a9c9ce642c0ee4256436d1bc31d9c38f868aca0f9a8e2a57c18d2dec2a3", bytes: 7298, category: "engine" }, { url: "releases/0930123c68d675c10e7284821b9c33333200df24d2fbbefff15642966f043803/sor.js", sha256: "33c94cb3175f3333b82e2a3be5e8e86f77986f0aa2042b1631f6367a4e5bb6ba", bytes: 279815, category: "engine" }, { url: "releases/0930123c68d675c10e7284821b9c33333200df24d2fbbefff15642966f043803/sor.pck", sha256: "daf8a1ce6e834e65162352c898549eba0e0717495be4d4de09b85deb5e18ed52", bytes: 5572176, category: "content" }, { url: "releases/0930123c68d675c10e7284821b9c33333200df24d2fbbefff15642966f043803/sor.wasm", sha256: "fc74679e3b97f76878947fcd4fbe1268cbfa6188182a2e33bbc3f5dc9bfa57d0", bytes: 39514754, category: "engine" }] }, inventoryUrl: "releases/0930123c68d675c10e7284821b9c33333200df24d2fbbefff15642966f043803/asset-inventory.json", inventoryDigest: "c4cd6782b39cdc55fa10d699dd636de0182e8036e2124d0d154e138423c7e0db" }, inventory = config.inventory;
    const integrity = (hex) => "sha256-" + btoa(String.fromCharCode(...hex.match(/../g).map((s) => parseInt(s, 16))));
    precacheAndRoute([{"revision":"b51d5573688bd0dfc9224a8d8709713506250f7e659f57d3c2be9f03ae72116e","url":"assets/icons/icon-maskable.svg"},{"revision":"c78b0a67096128d469525ef4058ed4655d9335db8b3385ad9a37508020c920c6","url":"assets/icons/icon.svg"},{"revision":"7aeb8a43e6ede32f13c722b2ba0621bb44f622762c0d11d1476221b64a3f71d6","url":"index.html"},{"revision":"f04f477ef560faf86d300aa30c5eba971e416ae382775842bdd4e74ecd820a5a","url":"manifest.webmanifest"},{"revision":"55432a048a10584557a51c335fd8a5c3555e242b8ae17051a41108d2811a498c","url":"releases/0930123c68d675c10e7284821b9c33333200df24d2fbbefff15642966f043803/browser.js"},{"revision":"7aeb8a43e6ede32f13c722b2ba0621bb44f622762c0d11d1476221b64a3f71d6","url":"releases/0930123c68d675c10e7284821b9c33333200df24d2fbbefff15642966f043803/index.html"},{"revision":"be33985bc7160d6bf9646f259cd86b259cd67b02ccb297ee5c44f8ac84327bc8","url":"releases/0930123c68d675c10e7284821b9c33333200df24d2fbbefff15642966f043803/sor.audio.position.worklet.js"},{"revision":"5b476a9c9ce642c0ee4256436d1bc31d9c38f868aca0f9a8e2a57c18d2dec2a3","url":"releases/0930123c68d675c10e7284821b9c33333200df24d2fbbefff15642966f043803/sor.audio.worklet.js"},{"revision":"33c94cb3175f3333b82e2a3be5e8e86f77986f0aa2042b1631f6367a4e5bb6ba","url":"releases/0930123c68d675c10e7284821b9c33333200df24d2fbbefff15642966f043803/sor.js"},{"revision":"daf8a1ce6e834e65162352c898549eba0e0717495be4d4de09b85deb5e18ed52","url":"releases/0930123c68d675c10e7284821b9c33333200df24d2fbbefff15642966f043803/sor.pck"},{"revision":"fc74679e3b97f76878947fcd4fbe1268cbfa6188182a2e33bbc3f5dc9bfa57d0","url":"releases/0930123c68d675c10e7284821b9c33333200df24d2fbbefff15642966f043803/sor.wasm"},{"revision":"c4cd6782b39cdc55fa10d699dd636de0182e8036e2124d0d154e138423c7e0db","url":"releases/0930123c68d675c10e7284821b9c33333200df24d2fbbefff15642966f043803/asset-inventory.json"}].map((entry) => ({ ...entry, integrity: integrity(entry.revision) })));
    registerRoute(new NavigationRoute(createHandlerBoundToURL("index.html")));
    cleanupOutdatedCaches();
    const worker = self;
    let repair = Promise.resolve();
    worker.addEventListener("message", (event) => {
      const data = event.data, port = event.ports[0];
      if (!port)
        return;
      const legacy = data?.protocolVersion === undefined;
      const fail = (error) => port.postMessage({ type: "CACHE_STATUS", protocolVersion: 1, requestId: data?.requestId, buildId: inventory.buildId, state: "error", missing: [], corrupt: [], error });
      if (!data || !["CACHE_STATUS", "CACHE_REPAIR"].includes(data.type) || !legacy && data.protocolVersion !== 1 || data.expectedBuildId && data.expectedBuildId !== inventory.buildId) {
        fail("Unsupported protocol or mismatched release");
        return;
      }
      const task = async () => {
        try {
          const cache = await caches.open(cacheNames2.precache);
          const match = (url) => cache.match(getCacheKeyForURL(url) ?? url);
          const inv = await match(config.inventoryUrl);
          if (!inv || await digest(await inv.arrayBuffer()) !== config.inventoryDigest) {
            fail("Inventory digest mismatch");
            return;
          }
          let result = await auditCached(inventory.entries, match);
          if (data.type === "CACHE_REPAIR") {
            for (const url of [...result.missing, ...result.corrupt]) {
              const entry = inventory.entries.find((e) => e.url === url);
              port.postMessage({ type: "CACHE_PROGRESS", requestId: data.requestId, url });
              const response = await fetch(url, { cache: "no-store" });
              if (!await verifyResponse(response.clone(), entry))
                throw new Error("Repair digest mismatch");
              await cache.put(getCacheKeyForURL(url) ?? url, response);
            }
            result = await auditCached(inventory.entries, match);
          }
          port.postMessage({ type: "CACHE_STATUS", protocolVersion: 1, requestId: data.requestId, buildId: inventory.buildId, ...result, missing: legacy ? [...result.missing, ...result.corrupt] : result.missing });
        } catch (error) {
          fail(String(error));
        }
      };
      const pending = data.type === "CACHE_REPAIR" ? repair = repair.then(task, task) : task();
      event.waitUntil(pending);
    });
  }
})();
