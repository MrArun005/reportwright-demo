import {
  EXPORT_DEFAULTS,
  arrangeToolbar,
  clearStaleParams,
  exportOptionsFrom,
  fetchReport,
  findText,
  frozenAt,
  galleyDefinition,
  loadFontStore,
  loadModelFonts,
  loadReportFonts,
  origin,
  pageLinks,
  paramChoices,
  parameterOptions,
  pdfBlob,
  rangeValue,
  readingText,
  renderReport,
  reportFetch,
  serverPdfUrl,
  subsetter,
  usingWorker
} from "./chunk-3DOCCIRH.js";
import {
  needsExportData
} from "./chunk-F6RMRXIN.js";
import {
  fontKeysOf,
  linkTitle,
  pageToSvg
} from "./chunk-VXXHZVVK.js";
import {
  NO_CJK_FONTS
} from "./chunk-BR5K6SBL.js";
import {
  safeUrl
} from "./chunk-72S6DETS.js";
import {
  CORE_FONT_KEY
} from "./chunk-S5Y2GHBR.js";
import {
  __commonJS,
  __toESM
} from "./chunk-OLLMACWA.js";

// node_modules/react/cjs/react.production.js
var require_react_production = __commonJS({
  "node_modules/react/cjs/react.production.js"(exports) {
    "use strict";
    /**
     * @license React
     * react.production.js
     *
     * Copyright (c) Meta Platforms, Inc. and affiliates.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */
    var REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("react.transitional.element");
    var REACT_PORTAL_TYPE = /* @__PURE__ */ Symbol.for("react.portal");
    var REACT_FRAGMENT_TYPE = /* @__PURE__ */ Symbol.for("react.fragment");
    var REACT_STRICT_MODE_TYPE = /* @__PURE__ */ Symbol.for("react.strict_mode");
    var REACT_PROFILER_TYPE = /* @__PURE__ */ Symbol.for("react.profiler");
    var REACT_CONSUMER_TYPE = /* @__PURE__ */ Symbol.for("react.consumer");
    var REACT_CONTEXT_TYPE = /* @__PURE__ */ Symbol.for("react.context");
    var REACT_FORWARD_REF_TYPE = /* @__PURE__ */ Symbol.for("react.forward_ref");
    var REACT_SUSPENSE_TYPE = /* @__PURE__ */ Symbol.for("react.suspense");
    var REACT_MEMO_TYPE = /* @__PURE__ */ Symbol.for("react.memo");
    var REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy");
    var REACT_ACTIVITY_TYPE = /* @__PURE__ */ Symbol.for("react.activity");
    var REACT_VIEW_TRANSITION_TYPE = /* @__PURE__ */ Symbol.for("react.view_transition");
    var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
    function getIteratorFn(maybeIterable) {
      if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
      maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
      return "function" === typeof maybeIterable ? maybeIterable : null;
    }
    var ReactNoopUpdateQueue = {
      isMounted: function() {
        return false;
      },
      enqueueForceUpdate: function() {
      },
      enqueueReplaceState: function() {
      },
      enqueueSetState: function() {
      }
    };
    var assign = Object.assign;
    var emptyObject = {};
    function Component(props, context, updater) {
      this.props = props;
      this.context = context;
      this.refs = emptyObject;
      this.updater = updater || ReactNoopUpdateQueue;
    }
    Component.prototype.isReactComponent = {};
    Component.prototype.setState = function(partialState, callback) {
      if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
        throw Error(
          "takes an object of state variables to update or a function which returns an object of state variables."
        );
      this.updater.enqueueSetState(this, partialState, callback, "setState");
    };
    Component.prototype.forceUpdate = function(callback) {
      this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
    };
    function ComponentDummy() {
    }
    ComponentDummy.prototype = Component.prototype;
    function PureComponent(props, context, updater) {
      this.props = props;
      this.context = context;
      this.refs = emptyObject;
      this.updater = updater || ReactNoopUpdateQueue;
    }
    var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
    pureComponentPrototype.constructor = PureComponent;
    assign(pureComponentPrototype, Component.prototype);
    pureComponentPrototype.isPureReactComponent = true;
    var isArrayImpl = Array.isArray;
    function noop() {
    }
    var ReactSharedInternals = { H: null, A: null, T: null, S: null };
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function ReactElement(type, key, props) {
      var refProp = props.ref;
      return {
        $$typeof: REACT_ELEMENT_TYPE,
        type,
        key,
        ref: void 0 !== refProp ? refProp : null,
        props
      };
    }
    function cloneAndReplaceKey(oldElement, newKey) {
      return ReactElement(oldElement.type, newKey, oldElement.props);
    }
    function isValidElement(object) {
      return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    function escape(key) {
      var escaperLookup = { "=": "=0", ":": "=2" };
      return "$" + key.replace(/[=:]/g, function(match) {
        return escaperLookup[match];
      });
    }
    var userProvidedKeyEscapeRegex = /\/+/g;
    function getElementKey(element, index) {
      return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
    }
    function resolveThenable(thenable) {
      switch (thenable.status) {
        case "fulfilled":
          return thenable.value;
        case "rejected":
          throw thenable.reason;
        default:
          switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(
            function(fulfilledValue) {
              "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
            },
            function(error) {
              "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
            }
          )), thenable.status) {
            case "fulfilled":
              return thenable.value;
            case "rejected":
              throw thenable.reason;
          }
      }
      throw thenable;
    }
    function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
      var type = typeof children;
      if ("undefined" === type || "boolean" === type) children = null;
      var invokeCallback = false;
      if (null === children) invokeCallback = true;
      else
        switch (type) {
          case "bigint":
          case "string":
          case "number":
            invokeCallback = true;
            break;
          case "object":
            switch (children.$$typeof) {
              case REACT_ELEMENT_TYPE:
              case REACT_PORTAL_TYPE:
                invokeCallback = true;
                break;
              case REACT_LAZY_TYPE:
                return invokeCallback = children._init, mapIntoArray(
                  invokeCallback(children._payload),
                  array,
                  escapedPrefix,
                  nameSoFar,
                  callback
                );
            }
        }
      if (invokeCallback)
        return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
          return c;
        })) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(
          callback,
          escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(
            userProvidedKeyEscapeRegex,
            "$&/"
          ) + "/") + invokeCallback
        )), array.push(callback)), 1;
      invokeCallback = 0;
      var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
      if (isArrayImpl(children))
        for (var i = 0; i < children.length; i++)
          nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
            nameSoFar,
            array,
            escapedPrefix,
            type,
            callback
          );
      else if (i = getIteratorFn(children), "function" === typeof i)
        for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
          nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
            nameSoFar,
            array,
            escapedPrefix,
            type,
            callback
          );
      else if ("object" === type) {
        if ("function" === typeof children.then)
          return mapIntoArray(
            resolveThenable(children),
            array,
            escapedPrefix,
            nameSoFar,
            callback
          );
        array = String(children);
        throw Error(
          "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
        );
      }
      return invokeCallback;
    }
    function mapChildren(children, func, context) {
      if (null == children) return children;
      var result = [], count = 0;
      mapIntoArray(children, result, "", "", function(child) {
        return func.call(context, child, count++);
      });
      return result;
    }
    function lazyInitializer(payload) {
      if (-1 === payload._status) {
        var ctor = payload._result, thenable = ctor();
        thenable.then(
          function(moduleObject) {
            if (0 === payload._status || -1 === payload._status)
              payload._status = 1, payload._result = moduleObject, void 0 === thenable.status && (thenable.status = "fulfilled", thenable.value = moduleObject);
          },
          function(error) {
            if (0 === payload._status || -1 === payload._status)
              payload._status = 2, payload._result = error, void 0 === thenable.status && (thenable.status = "rejected", thenable.reason = error);
          }
        );
        -1 === payload._status && (payload._status = 0, payload._result = thenable);
      }
      if (1 === payload._status) return payload._result.default;
      throw payload._result;
    }
    var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
      if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
        var event = new window.ErrorEvent("error", {
          bubbles: true,
          cancelable: true,
          message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
          error
        });
        if (!window.dispatchEvent(event)) return;
      } else if ("object" === typeof process && "function" === typeof process.emit) {
        process.emit("uncaughtException", error);
        return;
      }
      console.error(error);
    };
    function startTransition(scope) {
      var prevTransition = ReactSharedInternals.T, currentTransition = {};
      currentTransition.types = null !== prevTransition ? prevTransition.types : null;
      ReactSharedInternals.T = currentTransition;
      try {
        var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
        null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
        "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
      } catch (error) {
        reportGlobalError(error);
      } finally {
        null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
      }
    }
    function addTransitionType(type) {
      var transition = ReactSharedInternals.T;
      if (null !== transition) {
        var transitionTypes = transition.types;
        null === transitionTypes ? transition.types = [type] : -1 === transitionTypes.indexOf(type) && transitionTypes.push(type);
      } else startTransition(addTransitionType.bind(null, type));
    }
    var Children = {
      map: mapChildren,
      forEach: function(children, forEachFunc, forEachContext) {
        mapChildren(
          children,
          function() {
            forEachFunc.apply(this, arguments);
          },
          forEachContext
        );
      },
      count: function(children) {
        var n = 0;
        mapChildren(children, function() {
          n++;
        });
        return n;
      },
      toArray: function(children) {
        return mapChildren(children, function(child) {
          return child;
        }) || [];
      },
      only: function(children) {
        if (!isValidElement(children))
          throw Error(
            "React.Children.only expected to receive a single React element child."
          );
        return children;
      }
    };
    exports.Activity = REACT_ACTIVITY_TYPE;
    exports.Children = Children;
    exports.Component = Component;
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.Profiler = REACT_PROFILER_TYPE;
    exports.PureComponent = PureComponent;
    exports.StrictMode = REACT_STRICT_MODE_TYPE;
    exports.Suspense = REACT_SUSPENSE_TYPE;
    exports.ViewTransition = REACT_VIEW_TRANSITION_TYPE;
    exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
    exports.__COMPILER_RUNTIME = {
      __proto__: null,
      c: function(size) {
        return ReactSharedInternals.H.useMemoCache(size);
      }
    };
    exports.addTransitionType = addTransitionType;
    exports.cache = function(fn) {
      return function() {
        return fn.apply(null, arguments);
      };
    };
    exports.cacheSignal = function() {
      return null;
    };
    exports.cloneElement = function(element, config, children) {
      if (null === element || void 0 === element)
        throw Error(
          "The argument must be a React element, but you passed " + element + "."
        );
      var props = assign({}, element.props), key = element.key;
      if (null != config)
        for (propName in void 0 !== config.key && (key = "" + config.key), config)
          !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
      var propName = arguments.length - 2;
      if (1 === propName) props.children = children;
      else if (1 < propName) {
        for (var childArray = Array(propName), i = 0; i < propName; i++)
          childArray[i] = arguments[i + 2];
        props.children = childArray;
      }
      return ReactElement(element.type, key, props);
    };
    exports.createContext = function(defaultValue) {
      defaultValue = {
        $$typeof: REACT_CONTEXT_TYPE,
        _currentValue: defaultValue,
        _currentValue2: defaultValue,
        _threadCount: 0,
        Provider: null,
        Consumer: null
      };
      defaultValue.Provider = defaultValue;
      defaultValue.Consumer = {
        $$typeof: REACT_CONSUMER_TYPE,
        _context: defaultValue
      };
      return defaultValue;
    };
    exports.createElement = function(type, config, children) {
      var propName, props = {}, key = null;
      if (null != config)
        for (propName in void 0 !== config.key && (key = "" + config.key), config)
          hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
      var childrenLength = arguments.length - 2;
      if (1 === childrenLength) props.children = children;
      else if (1 < childrenLength) {
        for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++)
          childArray[i] = arguments[i + 2];
        props.children = childArray;
      }
      if (type && type.defaultProps)
        for (propName in childrenLength = type.defaultProps, childrenLength)
          void 0 === props[propName] && (props[propName] = childrenLength[propName]);
      return ReactElement(type, key, props);
    };
    exports.createRef = function() {
      return { current: null };
    };
    exports.forwardRef = function(render) {
      return { $$typeof: REACT_FORWARD_REF_TYPE, render };
    };
    exports.isValidElement = isValidElement;
    exports.lazy = function(ctor) {
      return {
        $$typeof: REACT_LAZY_TYPE,
        _payload: { _status: -1, _result: ctor },
        _init: lazyInitializer
      };
    };
    exports.memo = function(type, compare) {
      return {
        $$typeof: REACT_MEMO_TYPE,
        type,
        compare: void 0 === compare ? null : compare
      };
    };
    exports.startTransition = startTransition;
    exports.unstable_useCacheRefresh = function() {
      return ReactSharedInternals.H.useCacheRefresh();
    };
    exports.use = function(usable) {
      return ReactSharedInternals.H.use(usable);
    };
    exports.useActionState = function(action, initialState, permalink) {
      return ReactSharedInternals.H.useActionState(action, initialState, permalink);
    };
    exports.useCallback = function(callback, deps) {
      return ReactSharedInternals.H.useCallback(callback, deps);
    };
    exports.useContext = function(Context) {
      return ReactSharedInternals.H.useContext(Context);
    };
    exports.useDebugValue = function() {
    };
    exports.useDeferredValue = function(value, initialValue) {
      return ReactSharedInternals.H.useDeferredValue(value, initialValue);
    };
    exports.useEffect = function(create, deps) {
      return ReactSharedInternals.H.useEffect(create, deps);
    };
    exports.useEffectEvent = function(callback) {
      return ReactSharedInternals.H.useEffectEvent(callback);
    };
    exports.useId = function() {
      return ReactSharedInternals.H.useId();
    };
    exports.useImperativeHandle = function(ref, create, deps) {
      return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
    };
    exports.useInsertionEffect = function(create, deps) {
      return ReactSharedInternals.H.useInsertionEffect(create, deps);
    };
    exports.useLayoutEffect = function(create, deps) {
      return ReactSharedInternals.H.useLayoutEffect(create, deps);
    };
    exports.useMemo = function(create, deps) {
      return ReactSharedInternals.H.useMemo(create, deps);
    };
    exports.useOptimistic = function(passthrough, reducer) {
      return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
    };
    exports.useReducer = function(reducer, initialArg, init) {
      return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
    };
    exports.useRef = function(initialValue) {
      return ReactSharedInternals.H.useRef(initialValue);
    };
    exports.useState = function(initialState) {
      return ReactSharedInternals.H.useState(initialState);
    };
    exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
      return ReactSharedInternals.H.useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot
      );
    };
    exports.useTransition = function() {
      return ReactSharedInternals.H.useTransition();
    };
    exports.version = "19.3.0";
  }
});

// node_modules/react/index.js
var require_react = __commonJS({
  "node_modules/react/index.js"(exports, module) {
    "use strict";
    if (true) {
      module.exports = require_react_production();
    } else {
      module.exports = null;
    }
  }
});

// node_modules/scheduler/cjs/scheduler.production.js
var require_scheduler_production = __commonJS({
  "node_modules/scheduler/cjs/scheduler.production.js"(exports) {
    "use strict";
    /**
     * @license React
     * scheduler.production.js
     *
     * Copyright (c) Meta Platforms, Inc. and affiliates.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */
    function push(heap, node) {
      var index = heap.length;
      heap.push(node);
      a: for (; 0 < index; ) {
        var parentIndex = index - 1 >>> 1, parent = heap[parentIndex];
        if (0 < compare(parent, node))
          heap[parentIndex] = node, heap[index] = parent, index = parentIndex;
        else break a;
      }
    }
    function peek(heap) {
      return 0 === heap.length ? null : heap[0];
    }
    function pop(heap) {
      if (0 === heap.length) return null;
      var first = heap[0], last = heap.pop();
      if (last !== first) {
        heap[0] = last;
        a: for (var index = 0, length = heap.length, halfLength = length >>> 1; index < halfLength; ) {
          var leftIndex = 2 * (index + 1) - 1, left = heap[leftIndex], rightIndex = leftIndex + 1, right = heap[rightIndex];
          if (0 > compare(left, last))
            rightIndex < length && 0 > compare(right, left) ? (heap[index] = right, heap[rightIndex] = last, index = rightIndex) : (heap[index] = left, heap[leftIndex] = last, index = leftIndex);
          else if (rightIndex < length && 0 > compare(right, last))
            heap[index] = right, heap[rightIndex] = last, index = rightIndex;
          else break a;
        }
      }
      return first;
    }
    function compare(a, b) {
      var diff = a.sortIndex - b.sortIndex;
      return 0 !== diff ? diff : a.id - b.id;
    }
    exports.unstable_now = void 0;
    if ("object" === typeof performance && "function" === typeof performance.now) {
      localPerformance = performance;
      exports.unstable_now = function() {
        return localPerformance.now();
      };
    } else {
      localDate = Date, initialTime = localDate.now();
      exports.unstable_now = function() {
        return localDate.now() - initialTime;
      };
    }
    var localPerformance;
    var localDate;
    var initialTime;
    var taskQueue = [];
    var timerQueue = [];
    var taskIdCounter = 1;
    var currentTask = null;
    var currentPriorityLevel = 3;
    var isPerformingWork = false;
    var isHostCallbackScheduled = false;
    var isHostTimeoutScheduled = false;
    var needsPaint = false;
    var localSetTimeout = "function" === typeof setTimeout ? setTimeout : null;
    var localClearTimeout = "function" === typeof clearTimeout ? clearTimeout : null;
    var localSetImmediate = "undefined" !== typeof setImmediate ? setImmediate : null;
    function advanceTimers(currentTime) {
      for (var timer = peek(timerQueue); null !== timer; ) {
        if (null === timer.callback) pop(timerQueue);
        else if (timer.startTime <= currentTime)
          pop(timerQueue), timer.sortIndex = timer.expirationTime, push(taskQueue, timer);
        else break;
        timer = peek(timerQueue);
      }
    }
    function handleTimeout(currentTime) {
      isHostTimeoutScheduled = false;
      advanceTimers(currentTime);
      if (!isHostCallbackScheduled)
        if (null !== peek(taskQueue))
          isHostCallbackScheduled = true, isMessageLoopRunning || (isMessageLoopRunning = true, schedulePerformWorkUntilDeadline());
        else {
          var firstTimer = peek(timerQueue);
          null !== firstTimer && requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
        }
    }
    var isMessageLoopRunning = false;
    var taskTimeoutID = -1;
    var frameInterval = 5;
    var startTime = -1;
    function shouldYieldToHost() {
      return needsPaint ? true : exports.unstable_now() - startTime < frameInterval ? false : true;
    }
    function performWorkUntilDeadline() {
      needsPaint = false;
      if (isMessageLoopRunning) {
        var currentTime = exports.unstable_now();
        startTime = currentTime;
        var hasMoreWork = true;
        try {
          a: {
            isHostCallbackScheduled = false;
            isHostTimeoutScheduled && (isHostTimeoutScheduled = false, localClearTimeout(taskTimeoutID), taskTimeoutID = -1);
            isPerformingWork = true;
            var previousPriorityLevel = currentPriorityLevel;
            try {
              b: {
                advanceTimers(currentTime);
                for (currentTask = peek(taskQueue); null !== currentTask && !(currentTask.expirationTime > currentTime && shouldYieldToHost()); ) {
                  var callback = currentTask.callback;
                  if ("function" === typeof callback) {
                    currentTask.callback = null;
                    currentPriorityLevel = currentTask.priorityLevel;
                    var continuationCallback = callback(
                      currentTask.expirationTime <= currentTime
                    );
                    currentTime = exports.unstable_now();
                    if ("function" === typeof continuationCallback) {
                      currentTask.callback = continuationCallback;
                      advanceTimers(currentTime);
                      hasMoreWork = true;
                      break b;
                    }
                    currentTask === peek(taskQueue) && pop(taskQueue);
                    advanceTimers(currentTime);
                  } else pop(taskQueue);
                  currentTask = peek(taskQueue);
                }
                if (null !== currentTask) hasMoreWork = true;
                else {
                  var firstTimer = peek(timerQueue);
                  null !== firstTimer && requestHostTimeout(
                    handleTimeout,
                    firstTimer.startTime - currentTime
                  );
                  hasMoreWork = false;
                }
              }
              break a;
            } finally {
              currentTask = null, currentPriorityLevel = previousPriorityLevel, isPerformingWork = false;
            }
            hasMoreWork = void 0;
          }
        } finally {
          hasMoreWork ? schedulePerformWorkUntilDeadline() : isMessageLoopRunning = false;
        }
      }
    }
    var schedulePerformWorkUntilDeadline;
    if ("function" === typeof localSetImmediate)
      schedulePerformWorkUntilDeadline = function() {
        localSetImmediate(performWorkUntilDeadline);
      };
    else if ("undefined" !== typeof MessageChannel) {
      channel = new MessageChannel(), port = channel.port2;
      channel.port1.onmessage = performWorkUntilDeadline;
      schedulePerformWorkUntilDeadline = function() {
        port.postMessage(null);
      };
    } else
      schedulePerformWorkUntilDeadline = function() {
        localSetTimeout(performWorkUntilDeadline, 0);
      };
    var channel;
    var port;
    function requestHostTimeout(callback, ms) {
      taskTimeoutID = localSetTimeout(function() {
        callback(exports.unstable_now());
      }, ms);
    }
    exports.unstable_IdlePriority = 5;
    exports.unstable_ImmediatePriority = 1;
    exports.unstable_LowPriority = 4;
    exports.unstable_NormalPriority = 3;
    exports.unstable_Profiling = null;
    exports.unstable_UserBlockingPriority = 2;
    exports.unstable_cancelCallback = function(task) {
      task.callback = null;
    };
    exports.unstable_forceFrameRate = function(fps) {
      0 > fps || 125 < fps ? console.error(
        "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
      ) : frameInterval = 0 < fps ? Math.floor(1e3 / fps) : 5;
    };
    exports.unstable_getCurrentPriorityLevel = function() {
      return currentPriorityLevel;
    };
    exports.unstable_next = function(eventHandler) {
      switch (currentPriorityLevel) {
        case 1:
        case 2:
        case 3:
          var priorityLevel = 3;
          break;
        default:
          priorityLevel = currentPriorityLevel;
      }
      var previousPriorityLevel = currentPriorityLevel;
      currentPriorityLevel = priorityLevel;
      try {
        return eventHandler();
      } finally {
        currentPriorityLevel = previousPriorityLevel;
      }
    };
    exports.unstable_requestPaint = function() {
      needsPaint = true;
    };
    exports.unstable_runWithPriority = function(priorityLevel, eventHandler) {
      switch (priorityLevel) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          priorityLevel = 3;
      }
      var previousPriorityLevel = currentPriorityLevel;
      currentPriorityLevel = priorityLevel;
      try {
        return eventHandler();
      } finally {
        currentPriorityLevel = previousPriorityLevel;
      }
    };
    exports.unstable_scheduleCallback = function(priorityLevel, callback, options) {
      var currentTime = exports.unstable_now();
      "object" === typeof options && null !== options ? (options = options.delay, options = "number" === typeof options && 0 < options ? currentTime + options : currentTime) : options = currentTime;
      switch (priorityLevel) {
        case 1:
          var timeout = -1;
          break;
        case 2:
          timeout = 250;
          break;
        case 5:
          timeout = 1073741823;
          break;
        case 4:
          timeout = 1e4;
          break;
        default:
          timeout = 5e3;
      }
      timeout = options + timeout;
      priorityLevel = {
        id: taskIdCounter++,
        callback,
        priorityLevel,
        startTime: options,
        expirationTime: timeout,
        sortIndex: -1
      };
      options > currentTime ? (priorityLevel.sortIndex = options, push(timerQueue, priorityLevel), null === peek(taskQueue) && priorityLevel === peek(timerQueue) && (isHostTimeoutScheduled ? (localClearTimeout(taskTimeoutID), taskTimeoutID = -1) : isHostTimeoutScheduled = true, requestHostTimeout(handleTimeout, options - currentTime))) : (priorityLevel.sortIndex = timeout, push(taskQueue, priorityLevel),
      isHostCallbackScheduled || isPerformingWork || (isHostCallbackScheduled = true, isMessageLoopRunning || (isMessageLoopRunning = true, schedulePerformWorkUntilDeadline())));
      return priorityLevel;
    };
    exports.unstable_shouldYield = shouldYieldToHost;
    exports.unstable_wrapCallback = function(callback) {
      var parentPriorityLevel = currentPriorityLevel;
      return function() {
        var previousPriorityLevel = currentPriorityLevel;
        currentPriorityLevel = parentPriorityLevel;
        try {
          return callback.apply(this, arguments);
        } finally {
          currentPriorityLevel = previousPriorityLevel;
        }
      };
    };
  }
});

// node_modules/scheduler/index.js
var require_scheduler = __commonJS({
  "node_modules/scheduler/index.js"(exports, module) {
    "use strict";
    if (true) {
      module.exports = require_scheduler_production();
    } else {
      module.exports = null;
    }
  }
});

// node_modules/react-dom/cjs/react-dom.production.js
var require_react_dom_production = __commonJS({
  "node_modules/react-dom/cjs/react-dom.production.js"(exports) {
    "use strict";
    /**
     * @license React
     * react-dom.production.js
     *
     * Copyright (c) Meta Platforms, Inc. and affiliates.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */
    var React = require_react();
    function formatProdErrorMessage(code) {
      var url = "https://react.dev/errors/" + code;
      if (1 < arguments.length) {
        url += "?args[]=" + encodeURIComponent(arguments[1]);
        for (var i = 2; i < arguments.length; i++)
          url += "&args[]=" + encodeURIComponent(arguments[i]);
      }
      return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
    }
    function noop() {
    }
    var Internals = {
      d: {
        f: noop,
        r: function() {
          throw Error(formatProdErrorMessage(522));
        },
        D: noop,
        C: noop,
        L: noop,
        m: noop,
        X: noop,
        S: noop,
        M: noop
      },
      p: 0,
      findDOMNode: null
    };
    var REACT_PORTAL_TYPE = /* @__PURE__ */ Symbol.for("react.portal");
    var REACT_RECOVERABLE_TYPE = /* @__PURE__ */ Symbol.for("react.recoverable");
    var REACT_OPTIMISTIC_KEY = /* @__PURE__ */ Symbol.for("react.optimistic_key");
    function createPortal$1(children, containerInfo, implementation) {
      var key = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
      return {
        $$typeof: REACT_PORTAL_TYPE,
        key: null == key ? null : key === REACT_OPTIMISTIC_KEY ? REACT_OPTIMISTIC_KEY : "" + key,
        children,
        containerInfo,
        implementation
      };
    }
    var ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
    function getCrossOriginStringAs(as, input) {
      if ("font" === as) return "";
      if ("string" === typeof input)
        return "use-credentials" === input ? input : "";
    }
    exports.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Internals;
    exports.browser = function(reason) {
      return { $$typeof: REACT_RECOVERABLE_TYPE, _reason: reason };
    };
    exports.createPortal = function(children, container) {
      var key = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
      if (!container || 1 !== container.nodeType && 9 !== container.nodeType && 11 !== container.nodeType)
        throw Error(formatProdErrorMessage(299));
      return createPortal$1(children, container, null, key);
    };
    exports.flushSync = function(fn) {
      var previousTransition = ReactSharedInternals.T, previousUpdatePriority = Internals.p;
      try {
        if (ReactSharedInternals.T = null, Internals.p = 2, fn) return fn();
      } finally {
        ReactSharedInternals.T = previousTransition, Internals.p = previousUpdatePriority, Internals.d.f();
      }
    };
    exports.preconnect = function(href, options) {
      "string" === typeof href && (options ? (options = options.crossOrigin, options = "string" === typeof options ? "use-credentials" === options ? options : "" : void 0) : options = null, Internals.d.C(href, options));
    };
    exports.prefetchDNS = function(href) {
      "string" === typeof href && Internals.d.D(href);
    };
    exports.preinit = function(href, options) {
      if ("string" === typeof href && options && "string" === typeof options.as) {
        var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin), integrity = "string" === typeof options.integrity ? options.integrity : void 0, fetchPriority = "string" === typeof options.fetchPriority ? options.fetchPriority : void 0;
        "style" === as ? Internals.d.S(
          href,
          "string" === typeof options.precedence ? options.precedence : void 0,
          {
            crossOrigin,
            integrity,
            fetchPriority
          }
        ) : "script" === as && Internals.d.X(href, {
          crossOrigin,
          integrity,
          fetchPriority,
          nonce: "string" === typeof options.nonce ? options.nonce : void 0
        });
      }
    };
    exports.preinitModule = function(href, options) {
      if ("string" === typeof href)
        if ("object" === typeof options && null !== options) {
          if (null == options.as || "script" === options.as) {
            var crossOrigin = getCrossOriginStringAs(
              options.as,
              options.crossOrigin
            );
            Internals.d.M(href, {
              crossOrigin,
              integrity: "string" === typeof options.integrity ? options.integrity : void 0,
              nonce: "string" === typeof options.nonce ? options.nonce : void 0,
              fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0
            });
          }
        } else null == options && Internals.d.M(href);
    };
    exports.preload = function(href, options) {
      if ("string" === typeof href && "object" === typeof options && null !== options && "string" === typeof options.as) {
        var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
        Internals.d.L(href, as, {
          crossOrigin,
          integrity: "string" === typeof options.integrity ? options.integrity : void 0,
          nonce: "string" === typeof options.nonce ? options.nonce : void 0,
          type: "string" === typeof options.type ? options.type : void 0,
          fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0,
          referrerPolicy: "string" === typeof options.referrerPolicy ? options.referrerPolicy : void 0,
          imageSrcSet: "string" === typeof options.imageSrcSet ? options.imageSrcSet : void 0,
          imageSizes: "string" === typeof options.imageSizes ? options.imageSizes : void 0,
          media: "string" === typeof options.media ? options.media : void 0
        });
      }
    };
    exports.preloadModule = function(href, options) {
      if ("string" === typeof href)
        if (options) {
          var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
          Internals.d.m(href, {
            as: "string" === typeof options.as && "script" !== options.as ? options.as : void 0,
            crossOrigin,
            integrity: "string" === typeof options.integrity ? options.integrity : void 0,
            nonce: "string" === typeof options.nonce ? options.nonce : void 0,
            fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0
          });
        } else Internals.d.m(href);
    };
    exports.requestFormReset = function(form) {
      Internals.d.r(form);
    };
    exports.unstable_batchedUpdates = function(fn, a) {
      return fn(a);
    };
    exports.useFormState = function(action, initialState, permalink) {
      return ReactSharedInternals.H.useFormState(action, initialState, permalink);
    };
    exports.useFormStatus = function() {
      return ReactSharedInternals.H.useHostTransitionStatus();
    };
    exports.version = "19.3.0";
  }
});

// node_modules/react-dom/index.js
var require_react_dom = __commonJS({
  "node_modules/react-dom/index.js"(exports, module) {
    "use strict";
    function checkDCE() {
      if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") {
        return;
      }
      if (false) {
        throw new Error("^_^");
      }
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
      } catch (err) {
        console.error(err);
      }
    }
    if (true) {
      checkDCE();
      module.exports = require_react_dom_production();
    } else {
      module.exports = null;
    }
  }
});

// node_modules/react-dom/cjs/react-dom-client.production.js
var require_react_dom_client_production = __commonJS({
  "node_modules/react-dom/cjs/react-dom-client.production.js"(exports) {
    "use strict";
    /**
     * @license React
     * react-dom-client.production.js
     *
     * Copyright (c) Meta Platforms, Inc. and affiliates.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */
    var Scheduler = require_scheduler();
    var React = require_react();
    var ReactDOM = require_react_dom();
    function formatProdErrorMessage(code) {
      var url = "https://react.dev/errors/" + code;
      if (1 < arguments.length) {
        url += "?args[]=" + encodeURIComponent(arguments[1]);
        for (var i = 2; i < arguments.length; i++)
          url += "&args[]=" + encodeURIComponent(arguments[i]);
      }
      return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
    }
    function isValidContainer(node) {
      return !(!node || 1 !== node.nodeType && 9 !== node.nodeType && 11 !== node.nodeType);
    }
    function getNearestMountedFiber(fiber) {
      for (var node = fiber, nextNode = node; nextNode && !nextNode.alternate; )
        node = nextNode, 0 !== (node.flags & 4098) && (fiber = node.return), nextNode = node.return;
      for (; node.return; ) node = node.return;
      return 3 === node.tag ? fiber : null;
    }
    function getSuspenseInstanceFromFiber(fiber) {
      if (13 === fiber.tag) {
        var suspenseState = fiber.memoizedState;
        null === suspenseState && (fiber = fiber.alternate, null !== fiber && (suspenseState = fiber.memoizedState));
        if (null !== suspenseState) return suspenseState.dehydrated;
      }
      return null;
    }
    function getActivityInstanceFromFiber(fiber) {
      if (31 === fiber.tag) {
        var activityState = fiber.memoizedState;
        null === activityState && (fiber = fiber.alternate, null !== fiber && (activityState = fiber.memoizedState));
        if (null !== activityState) return activityState.dehydrated;
      }
      return null;
    }
    function assertIsMounted(fiber) {
      if (getNearestMountedFiber(fiber) !== fiber)
        throw Error(formatProdErrorMessage(188));
    }
    function findCurrentFiberUsingSlowPath(fiber) {
      var alternate = fiber.alternate;
      if (!alternate) {
        alternate = getNearestMountedFiber(fiber);
        if (null === alternate) throw Error(formatProdErrorMessage(188));
        return alternate !== fiber ? null : fiber;
      }
      for (var a = fiber, b = alternate; ; ) {
        var parentA = a.return;
        if (null === parentA) break;
        var parentB = parentA.alternate;
        if (null === parentB) {
          b = parentA.return;
          if (null !== b) {
            a = b;
            continue;
          }
          break;
        }
        if (parentA.child === parentB.child) {
          for (parentB = parentA.child; parentB; ) {
            if (parentB === a) return assertIsMounted(parentA), fiber;
            if (parentB === b) return assertIsMounted(parentA), alternate;
            parentB = parentB.sibling;
          }
          throw Error(formatProdErrorMessage(188));
        }
        if (a.return !== b.return) a = parentA, b = parentB;
        else {
          for (var didFindChild = false, child$0 = parentA.child; child$0; ) {
            if (child$0 === a) {
              didFindChild = true;
              a = parentA;
              b = parentB;
              break;
            }
            if (child$0 === b) {
              didFindChild = true;
              b = parentA;
              a = parentB;
              break;
            }
            child$0 = child$0.sibling;
          }
          if (!didFindChild) {
            for (child$0 = parentB.child; child$0; ) {
              if (child$0 === a) {
                didFindChild = true;
                a = parentB;
                b = parentA;
                break;
              }
              if (child$0 === b) {
                didFindChild = true;
                b = parentB;
                a = parentA;
                break;
              }
              child$0 = child$0.sibling;
            }
            if (!didFindChild) throw Error(formatProdErrorMessage(189));
          }
        }
        if (a.alternate !== b) throw Error(formatProdErrorMessage(190));
      }
      if (3 !== a.tag) throw Error(formatProdErrorMessage(188));
      return a.stateNode.current === a ? fiber : alternate;
    }
    function findCurrentHostFiberImpl(node) {
      var tag = node.tag;
      if (5 === tag || 26 === tag || 27 === tag || 6 === tag) return node;
      for (node = node.child; null !== node; ) {
        tag = findCurrentHostFiberImpl(node);
        if (null !== tag) return tag;
        node = node.sibling;
      }
      return null;
    }
    function traverseVisibleInstancesAndTextInstances(child, searchWithinHosts, fn, a, b, c) {
      for (; null !== child; ) {
        if ((5 === child.tag || 27 === child.tag || 6 === child.tag) && fn(child, a, b, c) || (22 !== child.tag || null === child.memoizedState) && (searchWithinHosts || 5 !== child.tag && 27 !== child.tag) && traverseVisibleInstancesAndTextInstances(
          child.child,
          searchWithinHosts,
          fn,
          a,
          b,
          c
        ))
          return true;
        child = child.sibling;
      }
      return false;
    }
    function getFragmentParentInstanceOrContainerFiber(fiber) {
      for (fiber = fiber.return; null !== fiber; ) {
        if (3 === fiber.tag || 5 === fiber.tag || 27 === fiber.tag) return fiber;
        fiber = fiber.return;
      }
      return null;
    }
    function fiberIsPortaledIntoHost(fiber) {
      var foundPortalParent = false;
      for (fiber = fiber.return; null !== fiber; ) {
        4 === fiber.tag && (foundPortalParent = true);
        if (3 === fiber.tag || 5 === fiber.tag || 27 === fiber.tag) break;
        fiber = fiber.return;
      }
      return foundPortalParent;
    }
    function getFragmentInstanceOrTextInstanceSiblings(fiber) {
      var result = [null, null], parentHostFiber = getFragmentParentInstanceOrContainerFiber(fiber);
      if (null === parentHostFiber) return result;
      findFragmentInstanceOrTextInstanceSiblings(
        result,
        fiber,
        parentHostFiber.child,
        { foundSelf: false }
      );
      return result;
    }
    function findFragmentInstanceOrTextInstanceSiblings(result, self, child, state) {
      for (; null !== child; ) {
        if (child === self) state.foundSelf = true;
        else if (5 === child.tag || 27 === child.tag || 6 === child.tag) {
          if (state.foundSelf) return result[1] = child, true;
          result[0] = child;
        } else if ((22 !== child.tag || null === child.memoizedState) && findFragmentInstanceOrTextInstanceSiblings(
          result,
          self,
          child.child,
          state
        ))
          return true;
        child = child.sibling;
      }
      return false;
    }
    function getInstanceFromHostFiber(fiber) {
      switch (fiber.tag) {
        case 5:
        case 27:
        case 6:
          return fiber.stateNode;
        case 3:
          return fiber.stateNode.containerInfo;
        default:
          throw Error(formatProdErrorMessage(559));
      }
    }
    var searchTarget = null;
    var searchBoundary = null;
    function isFiberPrecedingCheck(child, target, boundary) {
      return child === boundary ? true : child === target ? (searchTarget = child, true) : false;
    }
    function isFiberFollowingCheck(child, target, boundary) {
      return child === boundary ? (searchBoundary = child, false) : child === target ? (null !== searchBoundary && (searchTarget = child), true) : false;
    }
    function getParentForFragmentAncestors(inst) {
      if (null === inst) return null;
      do
        inst = null === inst ? null : inst.return;
      while (inst && 5 !== inst.tag && 27 !== inst.tag && 3 !== inst.tag);
      return inst ? inst : null;
    }
    function getLowestCommonAncestor(instA, instB, getParent2) {
      for (var depthA = 0, tempA = instA; tempA; tempA = getParent2(tempA)) depthA++;
      tempA = 0;
      for (var tempB = instB; tempB; tempB = getParent2(tempB)) tempA++;
      for (; 0 < depthA - tempA; ) instA = getParent2(instA), depthA--;
      for (; 0 < tempA - depthA; ) instB = getParent2(instB), tempA--;
      for (; depthA--; ) {
        if (instA === instB || null !== instB && instA === instB.alternate)
          return instA;
        instA = getParent2(instA);
        instB = getParent2(instB);
      }
      return null;
    }
    var assign = Object.assign;
    var REACT_LEGACY_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("react.element");
    var REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("react.transitional.element");
    var REACT_PORTAL_TYPE = /* @__PURE__ */ Symbol.for("react.portal");
    var REACT_FRAGMENT_TYPE = /* @__PURE__ */ Symbol.for("react.fragment");
    var REACT_STRICT_MODE_TYPE = /* @__PURE__ */ Symbol.for("react.strict_mode");
    var REACT_PROFILER_TYPE = /* @__PURE__ */ Symbol.for("react.profiler");
    var REACT_CONSUMER_TYPE = /* @__PURE__ */ Symbol.for("react.consumer");
    var REACT_CONTEXT_TYPE = /* @__PURE__ */ Symbol.for("react.context");
    var REACT_FORWARD_REF_TYPE = /* @__PURE__ */ Symbol.for("react.forward_ref");
    var REACT_SUSPENSE_TYPE = /* @__PURE__ */ Symbol.for("react.suspense");
    var REACT_SUSPENSE_LIST_TYPE = /* @__PURE__ */ Symbol.for("react.suspense_list");
    var REACT_MEMO_TYPE = /* @__PURE__ */ Symbol.for("react.memo");
    var REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy");
    var REACT_ACTIVITY_TYPE = /* @__PURE__ */ Symbol.for("react.activity");
    var REACT_LEGACY_HIDDEN_TYPE = /* @__PURE__ */ Symbol.for("react.legacy_hidden");
    var REACT_MEMO_CACHE_SENTINEL = /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel");
    var REACT_VIEW_TRANSITION_TYPE = /* @__PURE__ */ Symbol.for("react.view_transition");
    var REACT_RECOVERABLE_TYPE = /* @__PURE__ */ Symbol.for("react.recoverable");
    var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
    function getIteratorFn(maybeIterable) {
      if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
      maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
      return "function" === typeof maybeIterable ? maybeIterable : null;
    }
    var REACT_CLIENT_REFERENCE = /* @__PURE__ */ Symbol.for("react.client.reference");
    function getComponentNameFromType(type) {
      if (null == type) return null;
      if ("function" === typeof type)
        return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
      if ("string" === typeof type) return type;
      switch (type) {
        case REACT_FRAGMENT_TYPE:
          return "Fragment";
        case REACT_PROFILER_TYPE:
          return "Profiler";
        case REACT_STRICT_MODE_TYPE:
          return "StrictMode";
        case REACT_SUSPENSE_TYPE:
          return "Suspense";
        case REACT_SUSPENSE_LIST_TYPE:
          return "SuspenseList";
        case REACT_ACTIVITY_TYPE:
          return "Activity";
        case REACT_VIEW_TRANSITION_TYPE:
          return "ViewTransition";
      }
      if ("object" === typeof type)
        switch (type.$$typeof) {
          case REACT_PORTAL_TYPE:
            return "Portal";
          case REACT_CONTEXT_TYPE:
            return type.displayName || "Context";
          case REACT_CONSUMER_TYPE:
            return (type._context.displayName || "Context") + ".Consumer";
          case REACT_FORWARD_REF_TYPE:
            var innerType = type.render;
            type = type.displayName;
            type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
            return type;
          case REACT_MEMO_TYPE:
            return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
          case REACT_LAZY_TYPE:
            innerType = type._payload;
            type = type._init;
            try {
              return getComponentNameFromType(type(innerType));
            } catch (x) {
            }
        }
      return null;
    }
    var isArrayImpl = Array.isArray;
    var ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
    var ReactDOMSharedInternals = ReactDOM.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
    var sharedNotPendingObject = {
      pending: false,
      data: null,
      method: null,
      action: null
    };
    var valueStack = [];
    var index = -1;
    function createCursor(defaultValue) {
      return { current: defaultValue };
    }
    function pop(cursor) {
      0 > index || (cursor.current = valueStack[index], valueStack[index] = null, index--);
    }
    function push(cursor, value) {
      index++;
      valueStack[index] = cursor.current;
      cursor.current = value;
    }
    var contextStackCursor = createCursor(null);
    var contextFiberStackCursor = createCursor(null);
    var rootInstanceStackCursor = createCursor(null);
    var hostTransitionProviderCursor = createCursor(null);
    function pushHostContainer(fiber, nextRootInstance) {
      push(rootInstanceStackCursor, nextRootInstance);
      push(contextFiberStackCursor, fiber);
      push(contextStackCursor, null);
      switch (nextRootInstance.nodeType) {
        case 9:
        case 11:
          fiber = (fiber = nextRootInstance.documentElement) ? (fiber = fiber.namespaceURI) ? getOwnHostContext(fiber) : 0 : 0;
          break;
        default:
          if (fiber = nextRootInstance.tagName, nextRootInstance = nextRootInstance.namespaceURI)
            nextRootInstance = getOwnHostContext(nextRootInstance), fiber = getChildHostContextProd(nextRootInstance, fiber);
          else
            switch (fiber) {
              case "svg":
                fiber = 1;
                break;
              case "math":
                fiber = 2;
                break;
              default:
                fiber = 0;
            }
      }
      pop(contextStackCursor);
      push(contextStackCursor, fiber);
    }
    function popHostContainer() {
      pop(contextStackCursor);
      pop(contextFiberStackCursor);
      pop(rootInstanceStackCursor);
    }
    function pushHostContext(fiber) {
      var stateHook = fiber.memoizedState;
      null !== stateHook && (HostTransitionContext._currentValue = stateHook.memoizedState, push(hostTransitionProviderCursor, fiber));
      stateHook = contextStackCursor.current;
      var JSCompiler_inline_result = getChildHostContextProd(stateHook, fiber.type);
      stateHook !== JSCompiler_inline_result && (push(contextFiberStackCursor, fiber), push(contextStackCursor, JSCompiler_inline_result));
    }
    function popHostContext(fiber) {
      contextFiberStackCursor.current === fiber && (pop(contextStackCursor), pop(contextFiberStackCursor));
      hostTransitionProviderCursor.current === fiber && (pop(hostTransitionProviderCursor), HostTransitionContext._currentValue = sharedNotPendingObject);
    }
    var prefix;
    var suffix;
    function describeBuiltInComponentFrame(name) {
      if (void 0 === prefix)
        try {
          throw Error();
        } catch (x) {
          var match = x.stack.trim().match(/\n( *(at )?)/);
          prefix = match && match[1] || "";
          suffix = -1 < x.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < x.stack.indexOf("@") ? "@unknown:0:0" : "";
        }
      return "\n" + prefix + name + suffix;
    }
    var reentry = false;
    function describeNativeComponentFrame(fn, construct) {
      if (!fn || reentry) return "";
      reentry = true;
      var previousPrepareStackTrace = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      try {
        var RunInRootFrame = {
          DetermineComponentFrameRoot: function() {
            try {
              if (construct) {
                var Fake = function() {
                  throw Error();
                };
                Object.defineProperty(Fake.prototype, "props", {
                  set: function() {
                    throw Error();
                  }
                });
                if ("object" === typeof Reflect && Reflect.construct) {
                  try {
                    Reflect.construct(Fake, []);
                  } catch (x) {
                    var control = x;
                  }
                  Reflect.construct(fn, [], Fake);
                } else {
                  try {
                    Fake.call();
                  } catch (x$1) {
                    control = x$1;
                  }
                  Fake = false;
                  try {
                    var prevProps = Object.getOwnPropertyDescriptor(
                      fn.prototype,
                      "props"
                    );
                    Object.defineProperty(fn.prototype, "props", {
                      configurable: true,
                      set: function() {
                        throw Error();
                      }
                    });
                    Fake = true;
                    new fn();
                  } finally {
                    Fake && (void 0 !== prevProps ? Object.defineProperty(fn.prototype, "props", prevProps) : delete fn.prototype.props);
                  }
                }
              } else {
                try {
                  throw Error();
                } catch (x$2) {
                  control = x$2;
                }
                (Fake = fn()) && "function" === typeof Fake.catch && Fake.catch(function() {
                });
              }
            } catch (sample) {
              if (sample && control && "string" === typeof sample.stack)
                return [sample.stack, control.stack];
            }
            return [null, null];
          }
        };
        RunInRootFrame.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
        var namePropDescriptor = Object.getOwnPropertyDescriptor(
          RunInRootFrame.DetermineComponentFrameRoot,
          "name"
        );
        namePropDescriptor && namePropDescriptor.configurable && Object.defineProperty(
          RunInRootFrame.DetermineComponentFrameRoot,
          "name",
          { value: "DetermineComponentFrameRoot" }
        );
        var _RunInRootFrame$Deter = RunInRootFrame.DetermineComponentFrameRoot(), sampleStack = _RunInRootFrame$Deter[0], controlStack = _RunInRootFrame$Deter[1];
        if (sampleStack && controlStack) {
          var sampleLines = sampleStack.split("\n"), controlLines = controlStack.split("\n");
          for (namePropDescriptor = RunInRootFrame = 0; RunInRootFrame < sampleLines.length && !sampleLines[RunInRootFrame].includes("DetermineComponentFrameRoot"); )
            RunInRootFrame++;
          for (; namePropDescriptor < controlLines.length && !controlLines[namePropDescriptor].includes(
            "DetermineComponentFrameRoot"
          ); )
            namePropDescriptor++;
          if (RunInRootFrame === sampleLines.length || namePropDescriptor === controlLines.length)
            for (RunInRootFrame = sampleLines.length - 1, namePropDescriptor = controlLines.length - 1; 1 <= RunInRootFrame && 0 <= namePropDescriptor && sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]; )
              namePropDescriptor--;
          for (; 1 <= RunInRootFrame && 0 <= namePropDescriptor; RunInRootFrame--, namePropDescriptor--)
            if (sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
              if (1 !== RunInRootFrame || 1 !== namePropDescriptor) {
                do
                  if (RunInRootFrame--, namePropDescriptor--, 0 > namePropDescriptor || sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
                    var frame = "\n" + sampleLines[RunInRootFrame].replace(" at new ", " at ");
                    fn.displayName && frame.includes("<anonymous>") && (frame = frame.replace("<anonymous>", fn.displayName));
                    return frame;
                  }
                while (1 <= RunInRootFrame && 0 <= namePropDescriptor);
              }
              break;
            }
        }
      } finally {
        reentry = false, Error.prepareStackTrace = previousPrepareStackTrace;
      }
      return (previousPrepareStackTrace = fn ? fn.displayName || fn.name : "") ? describeBuiltInComponentFrame(previousPrepareStackTrace) : "";
    }
    function describeFiber(fiber, childFiber) {
      switch (fiber.tag) {
        case 26:
        case 27:
        case 5:
          return describeBuiltInComponentFrame(fiber.type);
        case 16:
          return describeBuiltInComponentFrame("Lazy");
        case 13:
          return fiber.child !== childFiber && null !== childFiber ? describeBuiltInComponentFrame("Suspense Fallback") : describeBuiltInComponentFrame("Suspense");
        case 19:
          return describeBuiltInComponentFrame("SuspenseList");
        case 0:
        case 15:
          return describeNativeComponentFrame(fiber.type, false);
        case 11:
          return describeNativeComponentFrame(fiber.type.render, false);
        case 1:
          return describeNativeComponentFrame(fiber.type, true);
        case 31:
          return describeBuiltInComponentFrame("Activity");
        case 30:
          return describeBuiltInComponentFrame("ViewTransition");
        default:
          return "";
      }
    }
    function getStackByFiberInDevAndProd(workInProgress2) {
      try {
        var info = "", previous = null;
        do
          info += describeFiber(workInProgress2, previous), previous = workInProgress2, workInProgress2 = workInProgress2.return;
        while (workInProgress2);
        return info;
      } catch (x) {
        return "\nError generating stack: " + x.message + "\n" + x.stack;
      }
    }
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var scheduleCallback$3 = Scheduler.unstable_scheduleCallback;
    var cancelCallback$1 = Scheduler.unstable_cancelCallback;
    var shouldYield = Scheduler.unstable_shouldYield;
    var requestPaint = Scheduler.unstable_requestPaint;
    var now = Scheduler.unstable_now;
    var getCurrentPriorityLevel = Scheduler.unstable_getCurrentPriorityLevel;
    var ImmediatePriority = Scheduler.unstable_ImmediatePriority;
    var UserBlockingPriority = Scheduler.unstable_UserBlockingPriority;
    var NormalPriority$1 = Scheduler.unstable_NormalPriority;
    var LowPriority = Scheduler.unstable_LowPriority;
    var IdlePriority = Scheduler.unstable_IdlePriority;
    var log$1 = Scheduler.log;
    var unstable_setDisableYieldValue = Scheduler.unstable_setDisableYieldValue;
    var rendererID = null;
    var injectedHook = null;
    function setIsStrictModeForDevtools(newIsStrictMode) {
      "function" === typeof log$1 && unstable_setDisableYieldValue(newIsStrictMode);
      if (injectedHook && "function" === typeof injectedHook.setStrictMode)
        try {
          injectedHook.setStrictMode(rendererID, newIsStrictMode);
        } catch (err) {
        }
    }
    var clz32 = Math.clz32 ? Math.clz32 : clz32Fallback;
    var log = Math.log;
    var LN2 = Math.LN2;
    function clz32Fallback(x) {
      x >>>= 0;
      return 0 === x ? 32 : 31 - (log(x) / LN2 | 0) | 0;
    }
    var nextTransitionUpdateLane = 256;
    var nextTransitionDeferredLane = 262144;
    var nextRetryLane = 4194304;
    function getHighestPriorityLanes(lanes) {
      var pendingSyncLanes = lanes & 42;
      if (0 !== pendingSyncLanes) return pendingSyncLanes;
      switch (lanes & -lanes) {
        case 1:
          return 1;
        case 2:
          return 2;
        case 4:
          return 4;
        case 8:
          return 8;
        case 16:
          return 16;
        case 32:
          return 32;
        case 64:
          return 64;
        case 128:
          return 128;
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
          return lanes & -lanes;
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
          return lanes & 3932160;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
          return lanes & 62914560;
        case 67108864:
          return 67108864;
        case 134217728:
          return 134217728;
        case 268435456:
          return 268435456;
        case 536870912:
          return 536870912;
        case 1073741824:
          return 0;
        default:
          return lanes;
      }
    }
    function getNextLanes(root2, wipLanes, rootHasPendingCommit) {
      var pendingLanes = root2.pendingLanes;
      if (0 === pendingLanes) return 0;
      var nextLanes = 0, suspendedLanes = root2.suspendedLanes, pingedLanes = root2.pingedLanes;
      root2 = root2.warmLanes;
      var nonIdlePendingLanes = pendingLanes & 134217727;
      0 !== nonIdlePendingLanes ? (pendingLanes = nonIdlePendingLanes & ~suspendedLanes, 0 !== pendingLanes ? nextLanes = getHighestPriorityLanes(pendingLanes) : (pingedLanes &= nonIdlePendingLanes, 0 !== pingedLanes ? nextLanes = getHighestPriorityLanes(pingedLanes) : rootHasPendingCommit || (rootHasPendingCommit = nonIdlePendingLanes & ~root2, 0 !== rootHasPendingCommit && (nextLanes = getHighestPriorityLanes(
      rootHasPendingCommit))))) : (nonIdlePendingLanes = pendingLanes & ~suspendedLanes, 0 !== nonIdlePendingLanes ? nextLanes = getHighestPriorityLanes(nonIdlePendingLanes) : 0 !== pingedLanes ? nextLanes = getHighestPriorityLanes(pingedLanes) : rootHasPendingCommit || (rootHasPendingCommit = pendingLanes & ~root2, 0 !== rootHasPendingCommit && (nextLanes = getHighestPriorityLanes(rootHasPendingCommit))));
      return 0 === nextLanes ? 0 : 0 !== wipLanes && wipLanes !== nextLanes && 0 === (wipLanes & suspendedLanes) && (suspendedLanes = nextLanes & -nextLanes, rootHasPendingCommit = wipLanes & -wipLanes, suspendedLanes >= rootHasPendingCommit || 32 === suspendedLanes && 0 !== (rootHasPendingCommit & 4194048)) ? wipLanes : nextLanes;
    }
    function checkIfRootIsPrerendering(root2, renderLanes2) {
      return 0 === (root2.pendingLanes & ~(root2.suspendedLanes & ~root2.pingedLanes) & renderLanes2);
    }
    function getEntangledLanes(root2, renderLanes2) {
      0 !== (renderLanes2 & 8) && (renderLanes2 |= renderLanes2 & 32);
      var allEntangledLanes = root2.entangledLanes;
      if (0 !== allEntangledLanes)
        for (root2 = root2.entanglements, allEntangledLanes &= renderLanes2; 0 < allEntangledLanes; ) {
          var index$4 = 31 - clz32(allEntangledLanes), lane = 1 << index$4;
          renderLanes2 |= root2[index$4];
          allEntangledLanes &= ~lane;
        }
      return renderLanes2;
    }
    function computeExpirationTime(lane, currentTime) {
      switch (lane) {
        case 1:
        case 2:
        case 4:
        case 8:
        case 64:
          return currentTime + 250;
        case 16:
        case 32:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
          return currentTime + 5e3;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
          return -1;
        case 67108864:
        case 134217728:
        case 268435456:
        case 536870912:
        case 1073741824:
          return -1;
        default:
          return -1;
      }
    }
    function claimNextRetryLane() {
      var lane = nextRetryLane;
      nextRetryLane <<= 1;
      0 === (nextRetryLane & 62914560) && (nextRetryLane = 4194304);
      return lane;
    }
    function createLaneMap(initial) {
      for (var laneMap = [], i = 0; 31 > i; i++) laneMap.push(initial);
      return laneMap;
    }
    function markRootUpdated$1(root2, updateLane) {
      root2.pendingLanes |= updateLane;
      268435456 !== updateLane && (root2.suspendedLanes = 0, root2.pingedLanes = 0, root2.warmLanes = 0);
    }
    function markRootFinished(root2, finishedLanes, remainingLanes, spawnedLane, updatedLanes, suspendedRetryLanes) {
      var previouslyPendingLanes = root2.pendingLanes;
      root2.pendingLanes = remainingLanes;
      root2.suspendedLanes = 0;
      root2.pingedLanes = 0;
      root2.warmLanes = 0;
      root2.expiredLanes &= remainingLanes;
      root2.entangledLanes &= remainingLanes;
      root2.errorRecoveryDisabledLanes &= remainingLanes;
      root2.shellSuspendCounter = 0;
      var entanglements = root2.entanglements, expirationTimes = root2.expirationTimes, hiddenUpdates = root2.hiddenUpdates;
      for (remainingLanes = previouslyPendingLanes & ~remainingLanes; 0 < remainingLanes; ) {
        var index$7 = 31 - clz32(remainingLanes), lane = 1 << index$7;
        entanglements[index$7] = 0;
        expirationTimes[index$7] = -1;
        var hiddenUpdatesForLane = hiddenUpdates[index$7];
        if (null !== hiddenUpdatesForLane)
          for (hiddenUpdates[index$7] = null, index$7 = 0; index$7 < hiddenUpdatesForLane.length; index$7++) {
            var update = hiddenUpdatesForLane[index$7];
            null !== update && (update.lane &= -536870913);
          }
        remainingLanes &= ~lane;
      }
      0 !== spawnedLane && markSpawnedDeferredLane(root2, spawnedLane, 0);
      0 !== suspendedRetryLanes && 0 === updatedLanes && 0 !== root2.tag && (root2.suspendedLanes |= suspendedRetryLanes & ~(previouslyPendingLanes & ~finishedLanes));
    }
    function markSpawnedDeferredLane(root2, spawnedLane, entangledLanes) {
      root2.pendingLanes |= spawnedLane;
      root2.suspendedLanes &= ~spawnedLane;
      var spawnedLaneIndex = 31 - clz32(spawnedLane);
      root2.entangledLanes |= spawnedLane;
      root2.entanglements[spawnedLaneIndex] = root2.entanglements[spawnedLaneIndex] | 1073741824 | entangledLanes & 261930;
    }
    function markRootEntangled(root2, entangledLanes) {
      var rootEntangledLanes = root2.entangledLanes |= entangledLanes;
      for (root2 = root2.entanglements; rootEntangledLanes; ) {
        var index$8 = 31 - clz32(rootEntangledLanes), lane = 1 << index$8;
        lane & entangledLanes | root2[index$8] & entangledLanes && (root2[index$8] |= entangledLanes);
        rootEntangledLanes &= ~lane;
      }
    }
    function getBumpedLaneForHydration(root2, renderLanes2) {
      var renderLane = renderLanes2 & -renderLanes2;
      renderLane = 0 !== (renderLane & 42) ? 1 : getBumpedLaneForHydrationByLane(renderLane);
      return 0 !== (renderLane & (root2.suspendedLanes | renderLanes2)) ? 0 : renderLane;
    }
    function getBumpedLaneForHydrationByLane(lane) {
      switch (lane) {
        case 2:
          lane = 1;
          break;
        case 8:
          lane = 4;
          break;
        case 32:
          lane = 16;
          break;
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
          lane = 128;
          break;
        case 268435456:
          lane = 134217728;
          break;
        default:
          lane = 0;
      }
      return lane;
    }
    function lanesToEventPriority(lanes) {
      lanes &= -lanes;
      return 2 < lanes ? 8 < lanes ? 0 !== (lanes & 134217727) ? 32 : 268435456 : 8 : 2;
    }
    function resolveUpdatePriority() {
      var updatePriority = ReactDOMSharedInternals.p;
      if (0 !== updatePriority) return updatePriority;
      updatePriority = window.event;
      return void 0 === updatePriority ? 32 : getEventPriority(updatePriority.type);
    }
    function runWithPriority(priority, fn) {
      var previousPriority = ReactDOMSharedInternals.p;
      try {
        return ReactDOMSharedInternals.p = priority, fn();
      } finally {
        ReactDOMSharedInternals.p = previousPriority;
      }
    }
    var randomKey = Math.random().toString(36).slice(2);
    var internalInstanceKey = "__reactFiber$" + randomKey;
    var internalPropsKey = "__reactProps$" + randomKey;
    var internalContainerInstanceKey = "__reactContainer$" + randomKey;
    var internalEventHandlersKey = "__reactEvents$" + randomKey;
    var internalEventHandlerListenersKey = "__reactListeners$" + randomKey;
    var internalEventHandlesSetKey = "__reactHandles$" + randomKey;
    var internalRootNodeResourcesKey = "__reactResources$" + randomKey;
    var internalHoistableMarker = "__reactMarker$" + randomKey;
    var internalLoadPendingKey = "__reactLoad$" + randomKey;
    function detachDeletedInstance(node) {
      delete node[internalInstanceKey];
      delete node[internalPropsKey];
      delete node[internalEventHandlerListenersKey];
      delete node[internalEventHandlesSetKey];
    }
    function getClosestInstanceFromNode(targetNode) {
      var targetInst;
      if (targetInst = targetNode[internalInstanceKey]) return targetInst;
      for (var parentNode = targetNode.parentNode; parentNode; ) {
        if (targetInst = parentNode[internalContainerInstanceKey] || parentNode[internalInstanceKey]) {
          parentNode = targetInst.alternate;
          if (null !== targetInst.child || null !== parentNode && null !== parentNode.child)
            for (targetNode = getParentHydrationBoundary(targetNode); null !== targetNode; ) {
              if (parentNode = targetNode[internalInstanceKey]) return parentNode;
              targetNode = getParentHydrationBoundary(targetNode);
            }
          return targetInst;
        }
        targetNode = parentNode;
        parentNode = targetNode.parentNode;
      }
      return null;
    }
    function getInstanceFromNode(node) {
      if (node = node[internalInstanceKey] || node[internalContainerInstanceKey]) {
        var tag = node.tag;
        if (5 === tag || 6 === tag || 13 === tag || 31 === tag || 26 === tag || 27 === tag || 3 === tag)
          return node;
      }
      return null;
    }
    function getNodeFromInstance(inst) {
      var tag = inst.tag;
      if (5 === tag || 26 === tag || 27 === tag || 6 === tag) return inst.stateNode;
      throw Error(formatProdErrorMessage(33));
    }
    function getResourcesFromRoot(root2) {
      var resources = root2[internalRootNodeResourcesKey];
      resources || (resources = root2[internalRootNodeResourcesKey] = { hoistableStyles: /* @__PURE__ */ new Map(), hoistableScripts: /* @__PURE__ */ new Map() });
      return resources;
    }
    function markNodeAsHoistable(node) {
      node[internalHoistableMarker] = true;
    }
    function clearPendingLoadOnNode(node) {
      node[internalLoadPendingKey] = void 0;
    }
    var allNativeEvents = /* @__PURE__ */ new Set();
    var registrationNameDependencies = {};
    function registerTwoPhaseEvent(registrationName, dependencies) {
      registerDirectEvent(registrationName, dependencies);
      registerDirectEvent(registrationName + "Capture", dependencies);
    }
    function registerDirectEvent(registrationName, dependencies) {
      registrationNameDependencies[registrationName] = dependencies;
      for (registrationName = 0; registrationName < dependencies.length; registrationName++)
        allNativeEvents.add(dependencies[registrationName]);
    }
    var VALID_ATTRIBUTE_NAME_REGEX = RegExp(
      "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
    );
    var illegalAttributeNameCache = {};
    var validatedAttributeNameCache = {};
    function isAttributeNameSafe(attributeName) {
      if (hasOwnProperty.call(validatedAttributeNameCache, attributeName))
        return true;
      if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) return false;
      if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName))
        return validatedAttributeNameCache[attributeName] = true;
      illegalAttributeNameCache[attributeName] = true;
      return false;
    }
    var viewTransitionMutationContext = false;
    function pushMutationContext() {
      var prev = viewTransitionMutationContext;
      viewTransitionMutationContext = false;
      return prev;
    }
    function setValueForAttribute(node, name, value) {
      if (isAttributeNameSafe(name))
        if (null === value) node.removeAttribute(name);
        else {
          switch (typeof value) {
            case "undefined":
            case "function":
            case "symbol":
              node.removeAttribute(name);
              return;
            case "boolean":
              var prefix$10 = name.toLowerCase().slice(0, 5);
              if ("data-" !== prefix$10 && "aria-" !== prefix$10) {
                node.removeAttribute(name);
                return;
              }
          }
          node.setAttribute(name, value);
        }
    }
    function setValueForKnownAttribute(node, name, value) {
      if (null === value) node.removeAttribute(name);
      else {
        switch (typeof value) {
          case "undefined":
          case "function":
          case "symbol":
          case "boolean":
            node.removeAttribute(name);
            return;
        }
        node.setAttribute(name, value);
      }
    }
    function setValueForNamespacedAttribute(node, namespace, name, value) {
      if (null === value) node.removeAttribute(name);
      else {
        switch (typeof value) {
          case "undefined":
          case "function":
          case "symbol":
          case "boolean":
            node.removeAttribute(name);
            return;
        }
        node.setAttributeNS(namespace, name, value);
      }
    }
    function getToStringValue(value) {
      switch (typeof value) {
        case "bigint":
        case "boolean":
        case "number":
        case "string":
        case "undefined":
          return value;
        case "object":
          return value;
        default:
          return "";
      }
    }
    function isCheckable(elem) {
      var type = elem.type;
      return (elem = elem.nodeName) && "input" === elem.toLowerCase() && ("checkbox" === type || "radio" === type);
    }
    function trackValueOnNode(node, valueField, currentValue) {
      var descriptor = Object.getOwnPropertyDescriptor(
        node.constructor.prototype,
        valueField
      );
      if (!node.hasOwnProperty(valueField) && "undefined" !== typeof descriptor && "function" === typeof descriptor.get && "function" === typeof descriptor.set) {
        var get = descriptor.get, set = descriptor.set;
        Object.defineProperty(node, valueField, {
          configurable: true,
          get: function() {
            return get.call(this);
          },
          set: function(value) {
            currentValue = "" + value;
            set.call(this, value);
          }
        });
        Object.defineProperty(node, valueField, {
          enumerable: descriptor.enumerable
        });
        return {
          getValue: function() {
            return currentValue;
          },
          setValue: function(value) {
            currentValue = "" + value;
          },
          stopTracking: function() {
            node._valueTracker = null;
            delete node[valueField];
          }
        };
      }
    }
    function track(node) {
      if (!node._valueTracker) {
        var valueField = isCheckable(node) ? "checked" : "value";
        node._valueTracker = trackValueOnNode(
          node,
          valueField,
          "" + node[valueField]
        );
      }
    }
    function updateValueIfChanged(node) {
      if (!node) return false;
      var tracker = node._valueTracker;
      if (!tracker) return true;
      var lastValue = tracker.getValue();
      var value = "";
      node && (value = isCheckable(node) ? node.checked ? "true" : "false" : node.value);
      node = value;
      return node !== lastValue ? (tracker.setValue(node), true) : false;
    }
    var escapeSelectorAttributeValueInsideDoubleQuotesRegex = /[\n"\\]/g;
    function escapeSelectorAttributeValueInsideDoubleQuotes(value) {
      return value.replace(
        escapeSelectorAttributeValueInsideDoubleQuotesRegex,
        function(ch) {
          return "\\" + ch.charCodeAt(0).toString(16) + " ";
        }
      );
    }
    function updateInput(element, value, defaultValue, lastDefaultValue, checked, defaultChecked, type, name) {
      element.name = "";
      null != type && "function" !== typeof type && "symbol" !== typeof type && "boolean" !== typeof type ? element.type = type : element.removeAttribute("type");
      if (null != value)
        if ("number" === type) {
          if (0 === value && "" === element.value || element.value != value)
            element.value = "" + getToStringValue(value);
        } else
          element.value !== "" + getToStringValue(value) && (element.value = "" + getToStringValue(value));
      else
        "submit" !== type && "reset" !== type || element.removeAttribute("value");
      null != value ? "number" === type && element.value == value ? setDefaultValue(element, getToStringValue(element.value)) : setDefaultValue(element, getToStringValue(value)) : null != defaultValue ? setDefaultValue(element, getToStringValue(defaultValue)) : null != lastDefaultValue && element.removeAttribute("value");
      null == checked && null != defaultChecked && (element.defaultChecked = !!defaultChecked);
      null != checked && (element.checked = checked && "function" !== typeof checked && "symbol" !== typeof checked);
      null != name && "function" !== typeof name && "symbol" !== typeof name && "boolean" !== typeof name ? element.name = "" + getToStringValue(name) : element.removeAttribute("name");
    }
    function initInput(element, value, defaultValue, checked, defaultChecked, type, name, isHydrating2) {
      null != type && "function" !== typeof type && "symbol" !== typeof type && "boolean" !== typeof type && (element.type = type);
      if (null != value || null != defaultValue) {
        if (!("submit" !== type && "reset" !== type || void 0 !== value && null !== value)) {
          track(element);
          return;
        }
        defaultValue = null != defaultValue ? "" + getToStringValue(defaultValue) : "";
        value = null != value ? "" + getToStringValue(value) : defaultValue;
        isHydrating2 || value === element.value || (element.value = value);
        element.defaultValue = value;
      }
      checked = null != checked ? checked : defaultChecked;
      checked = "function" !== typeof checked && "symbol" !== typeof checked && !!checked;
      element.checked = isHydrating2 ? element.checked : !!checked;
      element.defaultChecked = !!checked;
      null != name && "function" !== typeof name && "symbol" !== typeof name && "boolean" !== typeof name && (element.name = name);
      track(element);
    }
    function setDefaultValue(node, value) {
      node.defaultValue !== "" + value && (node.defaultValue = "" + value);
    }
    function updateOptions(node, multiple, propValue, setDefaultSelected) {
      node = node.options;
      if (multiple) {
        multiple = {};
        for (var i = 0; i < propValue.length; i++)
          multiple["$" + propValue[i]] = true;
        for (propValue = 0; propValue < node.length; propValue++)
          i = multiple.hasOwnProperty("$" + node[propValue].value), node[propValue].selected !== i && (node[propValue].selected = i), i && setDefaultSelected && (node[propValue].defaultSelected = true);
      } else {
        propValue = "" + getToStringValue(propValue);
        multiple = null;
        for (i = 0; i < node.length; i++) {
          if (node[i].value === propValue) {
            node[i].selected = true;
            setDefaultSelected && (node[i].defaultSelected = true);
            return;
          }
          null !== multiple || node[i].disabled || (multiple = node[i]);
        }
        null !== multiple && (multiple.selected = true);
      }
    }
    function updateTextarea(element, value, defaultValue) {
      if (null != value && (value = "" + getToStringValue(value), value !== element.value && (element.value = value), null == defaultValue)) {
        element.defaultValue !== value && (element.defaultValue = value);
        return;
      }
      element.defaultValue = null != defaultValue ? "" + getToStringValue(defaultValue) : "";
    }
    function initTextarea(element, value, defaultValue, children) {
      if (null == value) {
        if (null != children) {
          if (null != defaultValue) throw Error(formatProdErrorMessage(92));
          if (isArrayImpl(children)) {
            if (1 < children.length) throw Error(formatProdErrorMessage(93));
            children = children[0];
          }
          defaultValue = children;
        }
        null == defaultValue && (defaultValue = "");
        value = defaultValue;
      }
      defaultValue = getToStringValue(value);
      element.defaultValue = defaultValue;
      children = element.textContent;
      children === defaultValue && "" !== children && null !== children && (element.value = children);
      track(element);
    }
    function setTextContent(node, text) {
      if (text) {
        var firstChild = node.firstChild;
        if (firstChild && firstChild === node.lastChild && 3 === firstChild.nodeType) {
          firstChild.nodeValue = text;
          return;
        }
      }
      node.textContent = text;
    }
    var unitlessNumbers = new Set(
      "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIn\
dex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitB\
oxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
        " "
      )
    );
    function setValueForStyle(style2, styleName, value) {
      var isCustomProperty = 0 === styleName.indexOf("--");
      null == value || "boolean" === typeof value || "" === value ? isCustomProperty ? style2.setProperty(styleName, "") : "float" === styleName ? style2.cssFloat = "" : style2[styleName] = "" : isCustomProperty ? style2.setProperty(styleName, value) : "number" !== typeof value || 0 === value || unitlessNumbers.has(styleName) ? "float" === styleName ? style2.cssFloat = value : style2[styleName] = ("" +
      value).trim() : style2[styleName] = value + "px";
    }
    function setValueForStyles(node, styles, prevStyles) {
      if (null != styles && "object" !== typeof styles)
        throw Error(formatProdErrorMessage(62));
      node = node.style;
      if (null != prevStyles) {
        for (var styleName in prevStyles)
          !prevStyles.hasOwnProperty(styleName) || null != styles && styles.hasOwnProperty(styleName) || (0 === styleName.indexOf("--") ? node.setProperty(styleName, "") : "float" === styleName ? node.cssFloat = "" : node[styleName] = "", viewTransitionMutationContext = true);
        for (var styleName$16 in styles)
          styleName = styles[styleName$16], styles.hasOwnProperty(styleName$16) && prevStyles[styleName$16] !== styleName && (setValueForStyle(node, styleName$16, styleName), viewTransitionMutationContext = true);
      } else
        for (var styleName$17 in styles)
          styles.hasOwnProperty(styleName$17) && setValueForStyle(node, styleName$17, styles[styleName$17]);
    }
    function isCustomElement(tagName) {
      if (-1 === tagName.indexOf("-")) return false;
      switch (tagName) {
        case "annotation-xml":
        case "color-profile":
        case "font-face":
        case "font-face-src":
        case "font-face-uri":
        case "font-face-format":
        case "font-face-name":
        case "missing-glyph":
          return false;
        default:
          return true;
      }
    }
    var aliases = /* @__PURE__ */ new Map([
      ["acceptCharset", "accept-charset"],
      ["htmlFor", "for"],
      ["httpEquiv", "http-equiv"],
      ["crossOrigin", "crossorigin"],
      ["accentHeight", "accent-height"],
      ["alignmentBaseline", "alignment-baseline"],
      ["arabicForm", "arabic-form"],
      ["baselineShift", "baseline-shift"],
      ["capHeight", "cap-height"],
      ["clipPath", "clip-path"],
      ["clipRule", "clip-rule"],
      ["colorInterpolation", "color-interpolation"],
      ["colorInterpolationFilters", "color-interpolation-filters"],
      ["colorProfile", "color-profile"],
      ["colorRendering", "color-rendering"],
      ["dominantBaseline", "dominant-baseline"],
      ["enableBackground", "enable-background"],
      ["fillOpacity", "fill-opacity"],
      ["fillRule", "fill-rule"],
      ["floodColor", "flood-color"],
      ["floodOpacity", "flood-opacity"],
      ["fontFamily", "font-family"],
      ["fontSize", "font-size"],
      ["fontSizeAdjust", "font-size-adjust"],
      ["fontStretch", "font-stretch"],
      ["fontStyle", "font-style"],
      ["fontVariant", "font-variant"],
      ["fontWeight", "font-weight"],
      ["glyphName", "glyph-name"],
      ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
      ["glyphOrientationVertical", "glyph-orientation-vertical"],
      ["horizAdvX", "horiz-adv-x"],
      ["horizOriginX", "horiz-origin-x"],
      ["imageRendering", "image-rendering"],
      ["letterSpacing", "letter-spacing"],
      ["lightingColor", "lighting-color"],
      ["markerEnd", "marker-end"],
      ["markerMid", "marker-mid"],
      ["markerStart", "marker-start"],
      ["maskType", "mask-type"],
      ["overlinePosition", "overline-position"],
      ["overlineThickness", "overline-thickness"],
      ["paintOrder", "paint-order"],
      ["panose-1", "panose-1"],
      ["pointerEvents", "pointer-events"],
      ["renderingIntent", "rendering-intent"],
      ["shapeRendering", "shape-rendering"],
      ["stopColor", "stop-color"],
      ["stopOpacity", "stop-opacity"],
      ["strikethroughPosition", "strikethrough-position"],
      ["strikethroughThickness", "strikethrough-thickness"],
      ["strokeDasharray", "stroke-dasharray"],
      ["strokeDashoffset", "stroke-dashoffset"],
      ["strokeLinecap", "stroke-linecap"],
      ["strokeLinejoin", "stroke-linejoin"],
      ["strokeMiterlimit", "stroke-miterlimit"],
      ["strokeOpacity", "stroke-opacity"],
      ["strokeWidth", "stroke-width"],
      ["textAnchor", "text-anchor"],
      ["textDecoration", "text-decoration"],
      ["textRendering", "text-rendering"],
      ["transformOrigin", "transform-origin"],
      ["underlinePosition", "underline-position"],
      ["underlineThickness", "underline-thickness"],
      ["unicodeBidi", "unicode-bidi"],
      ["unicodeRange", "unicode-range"],
      ["unitsPerEm", "units-per-em"],
      ["vAlphabetic", "v-alphabetic"],
      ["vHanging", "v-hanging"],
      ["vIdeographic", "v-ideographic"],
      ["vMathematical", "v-mathematical"],
      ["vectorEffect", "vector-effect"],
      ["vertAdvY", "vert-adv-y"],
      ["vertOriginX", "vert-origin-x"],
      ["vertOriginY", "vert-origin-y"],
      ["wordSpacing", "word-spacing"],
      ["writingMode", "writing-mode"],
      ["xmlnsXlink", "xmlns:xlink"],
      ["xHeight", "x-height"]
    ]);
    var isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
    function sanitizeURL(url) {
      return isJavaScriptProtocol.test("" + url) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : url;
    }
    function noop$1() {
    }
    var currentReplayingEvent = null;
    function getEventTarget(nativeEvent) {
      nativeEvent = nativeEvent.target || nativeEvent.srcElement || window;
      nativeEvent.correspondingUseElement && (nativeEvent = nativeEvent.correspondingUseElement);
      return 3 === nativeEvent.nodeType ? nativeEvent.parentNode : nativeEvent;
    }
    var restoreTarget = null;
    var restoreQueue = null;
    function restoreStateOfTarget(target) {
      var internalInstance = getInstanceFromNode(target);
      if (internalInstance && (target = internalInstance.stateNode)) {
        var props = target[internalPropsKey] || null;
        a: switch (target = internalInstance.stateNode, internalInstance.type) {
          case "input":
            updateInput(
              target,
              props.value,
              props.defaultValue,
              props.defaultValue,
              props.checked,
              props.defaultChecked,
              props.type,
              props.name
            );
            internalInstance = props.name;
            if ("radio" === props.type && null != internalInstance) {
              for (props = target; props.parentNode; ) props = props.parentNode;
              props = props.querySelectorAll(
                'input[name="' + escapeSelectorAttributeValueInsideDoubleQuotes(
                  "" + internalInstance
                ) + '"][type="radio"]'
              );
              for (internalInstance = 0; internalInstance < props.length; internalInstance++) {
                var otherNode = props[internalInstance];
                if (otherNode !== target && otherNode.form === target.form) {
                  var otherProps = otherNode[internalPropsKey] || null;
                  if (!otherProps) throw Error(formatProdErrorMessage(90));
                  updateInput(
                    otherNode,
                    otherProps.value,
                    otherProps.defaultValue,
                    otherProps.defaultValue,
                    otherProps.checked,
                    otherProps.defaultChecked,
                    otherProps.type,
                    otherProps.name
                  );
                }
              }
              for (internalInstance = 0; internalInstance < props.length; internalInstance++)
                otherNode = props[internalInstance], otherNode.form === target.form && updateValueIfChanged(otherNode);
            }
            break a;
          case "textarea":
            updateTextarea(target, props.value, props.defaultValue);
            break a;
          case "select":
            internalInstance = props.value, null != internalInstance && updateOptions(target, !!props.multiple, internalInstance, false);
        }
      }
    }
    var isInsideEventHandler = false;
    function batchedUpdates$1(fn, a, b) {
      if (isInsideEventHandler) return fn(a, b);
      isInsideEventHandler = true;
      try {
        var JSCompiler_inline_result = fn(a);
        return JSCompiler_inline_result;
      } finally {
        if (isInsideEventHandler = false, null !== restoreTarget || null !== restoreQueue) {
          if (flushSyncWork$1(), restoreTarget && (a = restoreTarget, fn = restoreQueue, restoreQueue = restoreTarget = null, restoreStateOfTarget(a), fn))
            for (a = 0; a < fn.length; a++) restoreStateOfTarget(fn[a]);
        }
      }
    }
    function getListener(inst, registrationName) {
      var stateNode = inst.stateNode;
      if (null === stateNode) return null;
      var props = stateNode[internalPropsKey] || null;
      if (null === props) return null;
      stateNode = props[registrationName];
      a: switch (registrationName) {
        case "onClick":
        case "onClickCapture":
        case "onDoubleClick":
        case "onDoubleClickCapture":
        case "onMouseDown":
        case "onMouseDownCapture":
        case "onMouseMove":
        case "onMouseMoveCapture":
        case "onMouseUp":
        case "onMouseUpCapture":
        case "onMouseEnter":
          (props = !props.disabled) || (inst = inst.type, props = !("button" === inst || "input" === inst || "select" === inst || "textarea" === inst));
          inst = !props;
          break a;
        default:
          inst = false;
      }
      if (inst) return null;
      if (stateNode && "function" !== typeof stateNode)
        throw Error(
          formatProdErrorMessage(231, registrationName, typeof stateNode)
        );
      return stateNode;
    }
    var canUseDOM = !("undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement);
    var passiveBrowserEventsSupported = false;
    if (canUseDOM)
      try {
        options = {};
        Object.defineProperty(options, "passive", {
          get: function() {
            passiveBrowserEventsSupported = true;
          }
        });
        window.addEventListener("test", options, options);
        window.removeEventListener("test", options, options);
      } catch (e) {
        passiveBrowserEventsSupported = false;
      }
    var options;
    var root = null;
    var startText = null;
    var fallbackText = null;
    function getData() {
      if (fallbackText) return fallbackText;
      var start, startValue = startText, startLength = startValue.length, end, endValue = "value" in root ? root.value : root.textContent, endLength = endValue.length;
      for (start = 0; start < startLength && startValue[start] === endValue[start]; start++) ;
      var minEnd = startLength - start;
      for (end = 1; end <= minEnd && startValue[startLength - end] === endValue[endLength - end]; end++) ;
      return fallbackText = endValue.slice(start, 1 < end ? 1 - end : void 0);
    }
    function getEventCharCode(nativeEvent) {
      var keyCode = nativeEvent.keyCode;
      "charCode" in nativeEvent ? (nativeEvent = nativeEvent.charCode, 0 === nativeEvent && 13 === keyCode && (nativeEvent = 13)) : nativeEvent = keyCode;
      10 === nativeEvent && (nativeEvent = 13);
      return 32 <= nativeEvent || 13 === nativeEvent ? nativeEvent : 0;
    }
    function functionThatReturnsTrue() {
      return true;
    }
    function functionThatReturnsFalse() {
      return false;
    }
    function createSyntheticEvent(Interface) {
      function SyntheticBaseEvent(reactName, reactEventType, targetInst, nativeEvent, nativeEventTarget) {
        this._reactName = reactName;
        this._targetInst = targetInst;
        this.type = reactEventType;
        this.nativeEvent = nativeEvent;
        this.target = nativeEventTarget;
        this.currentTarget = null;
        for (var propName in Interface)
          Interface.hasOwnProperty(propName) && (reactName = Interface[propName], this[propName] = reactName ? reactName(nativeEvent) : nativeEvent[propName]);
        this.isDefaultPrevented = (null != nativeEvent.defaultPrevented ? nativeEvent.defaultPrevented : false === nativeEvent.returnValue) ? functionThatReturnsTrue : functionThatReturnsFalse;
        this.isPropagationStopped = functionThatReturnsFalse;
        return this;
      }
      assign(SyntheticBaseEvent.prototype, {
        preventDefault: function() {
          this.defaultPrevented = true;
          var event = this.nativeEvent;
          event && (event.preventDefault ? event.preventDefault() : "unknown" !== typeof event.returnValue && (event.returnValue = false), this.isDefaultPrevented = functionThatReturnsTrue);
        },
        stopPropagation: function() {
          var event = this.nativeEvent;
          event && (event.stopPropagation ? event.stopPropagation() : "unknown" !== typeof event.cancelBubble && (event.cancelBubble = true), this.isPropagationStopped = functionThatReturnsTrue);
        },
        persist: function() {
        },
        isPersistent: functionThatReturnsTrue
      });
      return SyntheticBaseEvent;
    }
    var EventInterface = {
      eventPhase: 0,
      bubbles: 0,
      cancelable: 0,
      timeStamp: function(event) {
        return event.timeStamp || Date.now();
      },
      defaultPrevented: 0,
      isTrusted: 0
    };
    var SyntheticEvent = createSyntheticEvent(EventInterface);
    var UIEventInterface = assign({}, EventInterface, { view: 0, detail: 0 });
    var SyntheticUIEvent = createSyntheticEvent(UIEventInterface);
    var lastMovementX;
    var lastMovementY;
    var lastMouseEvent;
    var MouseEventInterface = assign({}, UIEventInterface, {
      screenX: 0,
      screenY: 0,
      clientX: 0,
      clientY: 0,
      pageX: 0,
      pageY: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      getModifierState: getEventModifierState,
      button: 0,
      buttons: 0,
      relatedTarget: function(event) {
        return void 0 === event.relatedTarget ? event.fromElement === event.srcElement ? event.toElement : event.fromElement : event.relatedTarget;
      },
      movementX: function(event) {
        if ("movementX" in event) return event.movementX;
        event !== lastMouseEvent && (lastMouseEvent && "mousemove" === event.type ? (lastMovementX = event.screenX - lastMouseEvent.screenX, lastMovementY = event.screenY - lastMouseEvent.screenY) : lastMovementY = lastMovementX = 0, lastMouseEvent = event);
        return lastMovementX;
      },
      movementY: function(event) {
        return "movementY" in event ? event.movementY : lastMovementY;
      }
    });
    var SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface);
    var DragEventInterface = assign({}, MouseEventInterface, { dataTransfer: 0 });
    var SyntheticDragEvent = createSyntheticEvent(DragEventInterface);
    var FocusEventInterface = assign({}, UIEventInterface, { relatedTarget: 0 });
    var SyntheticFocusEvent = createSyntheticEvent(FocusEventInterface);
    var AnimationEventInterface = assign({}, EventInterface, {
      animationName: 0,
      elapsedTime: 0,
      pseudoElement: 0
    });
    var SyntheticAnimationEvent = createSyntheticEvent(AnimationEventInterface);
    var ClipboardEventInterface = assign({}, EventInterface, {
      clipboardData: function(event) {
        return "clipboardData" in event ? event.clipboardData : window.clipboardData;
      }
    });
    var SyntheticClipboardEvent = createSyntheticEvent(ClipboardEventInterface);
    var CompositionEventInterface = assign({}, EventInterface, { data: 0 });
    var SyntheticCompositionEvent = createSyntheticEvent(CompositionEventInterface);
    var normalizeKey = {
      Esc: "Escape",
      Spacebar: " ",
      Left: "ArrowLeft",
      Up: "ArrowUp",
      Right: "ArrowRight",
      Down: "ArrowDown",
      Del: "Delete",
      Win: "OS",
      Menu: "ContextMenu",
      Apps: "ContextMenu",
      Scroll: "ScrollLock",
      MozPrintableKey: "Unidentified"
    };
    var translateToKey = {
      8: "Backspace",
      9: "Tab",
      12: "Clear",
      13: "Enter",
      16: "Shift",
      17: "Control",
      18: "Alt",
      19: "Pause",
      20: "CapsLock",
      27: "Escape",
      32: " ",
      33: "PageUp",
      34: "PageDown",
      35: "End",
      36: "Home",
      37: "ArrowLeft",
      38: "ArrowUp",
      39: "ArrowRight",
      40: "ArrowDown",
      45: "Insert",
      46: "Delete",
      112: "F1",
      113: "F2",
      114: "F3",
      115: "F4",
      116: "F5",
      117: "F6",
      118: "F7",
      119: "F8",
      120: "F9",
      121: "F10",
      122: "F11",
      123: "F12",
      144: "NumLock",
      145: "ScrollLock",
      224: "Meta"
    };
    var modifierKeyToProp = {
      Alt: "altKey",
      Control: "ctrlKey",
      Meta: "metaKey",
      Shift: "shiftKey"
    };
    function modifierStateGetter(keyArg) {
      var nativeEvent = this.nativeEvent;
      return nativeEvent.getModifierState ? nativeEvent.getModifierState(keyArg) : (keyArg = modifierKeyToProp[keyArg]) ? !!nativeEvent[keyArg] : false;
    }
    function getEventModifierState() {
      return modifierStateGetter;
    }
    var KeyboardEventInterface = assign({}, UIEventInterface, {
      key: function(nativeEvent) {
        if (nativeEvent.key) {
          var key = normalizeKey[nativeEvent.key] || nativeEvent.key;
          if ("Unidentified" !== key) return key;
        }
        return "keypress" === nativeEvent.type ? (nativeEvent = getEventCharCode(nativeEvent), 13 === nativeEvent ? "Enter" : String.fromCharCode(nativeEvent)) : "keydown" === nativeEvent.type || "keyup" === nativeEvent.type ? translateToKey[nativeEvent.keyCode] || "Unidentified" : "";
      },
      code: 0,
      location: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      repeat: 0,
      locale: 0,
      getModifierState: getEventModifierState,
      charCode: function(event) {
        return "keypress" === event.type ? getEventCharCode(event) : 0;
      },
      keyCode: function(event) {
        return "keydown" === event.type || "keyup" === event.type ? event.keyCode : 0;
      },
      which: function(event) {
        return "keypress" === event.type ? getEventCharCode(event) : "keydown" === event.type || "keyup" === event.type ? event.keyCode : 0;
      }
    });
    var SyntheticKeyboardEvent = createSyntheticEvent(KeyboardEventInterface);
    var PointerEventInterface = assign({}, MouseEventInterface, {
      pointerId: 0,
      width: 0,
      height: 0,
      pressure: 0,
      tangentialPressure: 0,
      tiltX: 0,
      tiltY: 0,
      twist: 0,
      pointerType: 0,
      isPrimary: 0
    });
    var SyntheticPointerEvent = createSyntheticEvent(PointerEventInterface);
    var SubmitEventInterface = assign({}, EventInterface, { submitter: 0 });
    var SyntheticSubmitEvent = createSyntheticEvent(SubmitEventInterface);
    var TouchEventInterface = assign({}, UIEventInterface, {
      touches: 0,
      targetTouches: 0,
      changedTouches: 0,
      altKey: 0,
      metaKey: 0,
      ctrlKey: 0,
      shiftKey: 0,
      getModifierState: getEventModifierState
    });
    var SyntheticTouchEvent = createSyntheticEvent(TouchEventInterface);
    var TransitionEventInterface = assign({}, EventInterface, {
      propertyName: 0,
      elapsedTime: 0,
      pseudoElement: 0
    });
    var SyntheticTransitionEvent = createSyntheticEvent(TransitionEventInterface);
    var WheelEventInterface = assign({}, MouseEventInterface, {
      deltaX: function(event) {
        return "deltaX" in event ? event.deltaX : "wheelDeltaX" in event ? -event.wheelDeltaX : 0;
      },
      deltaY: function(event) {
        return "deltaY" in event ? event.deltaY : "wheelDeltaY" in event ? -event.wheelDeltaY : "wheelDelta" in event ? -event.wheelDelta : 0;
      },
      deltaZ: 0,
      deltaMode: 0
    });
    var SyntheticWheelEvent = createSyntheticEvent(WheelEventInterface);
    var ToggleEventInterface = assign({}, EventInterface, {
      newState: 0,
      oldState: 0,
      source: 0
    });
    var SyntheticToggleEvent = createSyntheticEvent(ToggleEventInterface);
    var END_KEYCODES = [9, 13, 27, 32];
    var canUseCompositionEvent = canUseDOM && "CompositionEvent" in window;
    var documentMode = null;
    canUseDOM && "documentMode" in document && (documentMode = document.documentMode);
    var canUseTextInputEvent = canUseDOM && "TextEvent" in window && !documentMode;
    var useFallbackCompositionData = canUseDOM && (!canUseCompositionEvent || documentMode && 8 < documentMode && 11 >= documentMode);
    var SPACEBAR_CHAR = String.fromCharCode(32);
    var hasSpaceKeypress = false;
    function isFallbackCompositionEnd(domEventName, nativeEvent) {
      switch (domEventName) {
        case "keyup":
          return -1 !== END_KEYCODES.indexOf(nativeEvent.keyCode);
        case "keydown":
          return 229 !== nativeEvent.keyCode;
        case "keypress":
        case "mousedown":
        case "focusout":
          return true;
        default:
          return false;
      }
    }
    function getDataFromCustomEvent(nativeEvent) {
      nativeEvent = nativeEvent.detail;
      return "object" === typeof nativeEvent && "data" in nativeEvent ? nativeEvent.data : null;
    }
    var isComposing = false;
    function getNativeBeforeInputChars(domEventName, nativeEvent) {
      switch (domEventName) {
        case "compositionend":
          return getDataFromCustomEvent(nativeEvent);
        case "keypress":
          if (32 !== nativeEvent.which) return null;
          hasSpaceKeypress = true;
          return SPACEBAR_CHAR;
        case "textInput":
          return domEventName = nativeEvent.data, domEventName === SPACEBAR_CHAR && hasSpaceKeypress ? null : domEventName;
        default:
          return null;
      }
    }
    function getFallbackBeforeInputChars(domEventName, nativeEvent) {
      if (isComposing)
        return "compositionend" === domEventName || !canUseCompositionEvent && isFallbackCompositionEnd(domEventName, nativeEvent) ? (domEventName = getData(), fallbackText = startText = root = null, isComposing = false, domEventName) : null;
      switch (domEventName) {
        case "paste":
          return null;
        case "keypress":
          if (!(nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey) || nativeEvent.ctrlKey && nativeEvent.altKey) {
            if (nativeEvent.char && 1 < nativeEvent.char.length)
              return nativeEvent.char;
            if (nativeEvent.which) return String.fromCharCode(nativeEvent.which);
          }
          return null;
        case "compositionend":
          return useFallbackCompositionData && "ko" !== nativeEvent.locale ? null : nativeEvent.data;
        default:
          return null;
      }
    }
    var supportedInputTypes = {
      color: true,
      date: true,
      datetime: true,
      "datetime-local": true,
      email: true,
      month: true,
      number: true,
      password: true,
      range: true,
      search: true,
      tel: true,
      text: true,
      time: true,
      url: true,
      week: true
    };
    function isTextInputElement(elem) {
      var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
      return "input" === nodeName ? !!supportedInputTypes[elem.type] : "textarea" === nodeName ? true : false;
    }
    function createAndAccumulateChangeEvent(dispatchQueue, inst, nativeEvent, target) {
      restoreTarget ? restoreQueue ? restoreQueue.push(target) : restoreQueue = [target] : restoreTarget = target;
      inst = accumulateTwoPhaseListeners(inst, "onChange");
      0 < inst.length && (nativeEvent = new SyntheticEvent(
        "onChange",
        "change",
        null,
        nativeEvent,
        target
      ), dispatchQueue.push({ event: nativeEvent, listeners: inst }));
    }
    var activeElement$1 = null;
    var activeElementInst$1 = null;
    function runEventInBatch(dispatchQueue) {
      processDispatchQueue(dispatchQueue, 0);
    }
    function getInstIfValueChanged(targetInst) {
      var targetNode = getNodeFromInstance(targetInst);
      if (updateValueIfChanged(targetNode)) return targetInst;
    }
    function getTargetInstForChangeEvent(domEventName, targetInst) {
      if ("change" === domEventName) return targetInst;
    }
    var isInputEventSupported = false;
    if (canUseDOM) {
      if (canUseDOM) {
        isSupported$jscomp$inline_474 = "oninput" in document;
        if (!isSupported$jscomp$inline_474) {
          element$jscomp$inline_475 = document.createElement("div");
          element$jscomp$inline_475.setAttribute("oninput", "return;");
          isSupported$jscomp$inline_474 = "function" === typeof element$jscomp$inline_475.oninput;
        }
        JSCompiler_inline_result$jscomp$318 = isSupported$jscomp$inline_474;
      } else JSCompiler_inline_result$jscomp$318 = false;
      isInputEventSupported = JSCompiler_inline_result$jscomp$318 && (!document.documentMode || 9 < document.documentMode);
    }
    var JSCompiler_inline_result$jscomp$318;
    var isSupported$jscomp$inline_474;
    var element$jscomp$inline_475;
    function stopWatchingForValueChange() {
      activeElement$1 && (activeElement$1.detachEvent("onpropertychange", handlePropertyChange), activeElementInst$1 = activeElement$1 = null);
    }
    function handlePropertyChange(nativeEvent) {
      if ("value" === nativeEvent.propertyName && getInstIfValueChanged(activeElementInst$1)) {
        var dispatchQueue = [];
        createAndAccumulateChangeEvent(
          dispatchQueue,
          activeElementInst$1,
          nativeEvent,
          getEventTarget(nativeEvent)
        );
        batchedUpdates$1(runEventInBatch, dispatchQueue);
      }
    }
    function handleEventsForInputEventPolyfill(domEventName, target, targetInst) {
      "focusin" === domEventName ? (stopWatchingForValueChange(), activeElement$1 = target, activeElementInst$1 = targetInst, activeElement$1.attachEvent("onpropertychange", handlePropertyChange)) : "focusout" === domEventName && stopWatchingForValueChange();
    }
    function getTargetInstForInputEventPolyfill(domEventName) {
      if ("selectionchange" === domEventName || "keyup" === domEventName || "keydown" === domEventName)
        return getInstIfValueChanged(activeElementInst$1);
    }
    function getTargetInstForClickEvent(domEventName, targetInst) {
      if ("click" === domEventName) return getInstIfValueChanged(targetInst);
    }
    function getTargetInstForInputOrChangeEvent(domEventName, targetInst) {
      if ("input" === domEventName || "change" === domEventName)
        return getInstIfValueChanged(targetInst);
    }
    function is(x, y) {
      return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
    }
    var objectIs = "function" === typeof Object.is ? Object.is : is;
    function shallowEqual(objA, objB) {
      if (objectIs(objA, objB)) return true;
      if ("object" !== typeof objA || null === objA || "object" !== typeof objB || null === objB)
        return false;
      var keysA = Object.keys(objA), keysB = Object.keys(objB);
      if (keysA.length !== keysB.length) return false;
      for (keysB = 0; keysB < keysA.length; keysB++) {
        var currentKey = keysA[keysB];
        if (!hasOwnProperty.call(objB, currentKey) || !objectIs(objA[currentKey], objB[currentKey]))
          return false;
      }
      return true;
    }
    function getActiveElement(doc) {
      doc = doc || ("undefined" !== typeof document ? document : void 0);
      if ("undefined" === typeof doc) return null;
      try {
        return doc.activeElement || doc.body;
      } catch (e$20) {
        return doc.body;
      }
    }
    function getLeafNode(node) {
      for (; node && node.firstChild; ) node = node.firstChild;
      return node;
    }
    function getNodeForCharacterOffset(root2, offset) {
      var node = getLeafNode(root2);
      root2 = 0;
      for (var nodeEnd; node; ) {
        if (3 === node.nodeType) {
          nodeEnd = root2 + node.textContent.length;
          if (root2 <= offset && nodeEnd >= offset)
            return { node, offset: offset - root2 };
          root2 = nodeEnd;
        }
        a: {
          for (; node; ) {
            if (node.nextSibling) {
              node = node.nextSibling;
              break a;
            }
            node = node.parentNode;
          }
          node = void 0;
        }
        node = getLeafNode(node);
      }
    }
    function containsNode(outerNode, innerNode) {
      return outerNode && innerNode ? outerNode === innerNode ? true : outerNode && 3 === outerNode.nodeType ? false : innerNode && 3 === innerNode.nodeType ? containsNode(outerNode, innerNode.parentNode) : "contains" in outerNode ? outerNode.contains(innerNode) : outerNode.compareDocumentPosition ? !!(outerNode.compareDocumentPosition(innerNode) & 16) : false : false;
    }
    function getActiveElementDeep(containerInfo) {
      containerInfo = null != containerInfo && null != containerInfo.ownerDocument && null != containerInfo.ownerDocument.defaultView ? containerInfo.ownerDocument.defaultView : window;
      for (var element = getActiveElement(containerInfo.document); element instanceof containerInfo.HTMLIFrameElement; ) {
        try {
          var JSCompiler_inline_result = "string" === typeof element.contentWindow.location.href;
        } catch (err) {
          JSCompiler_inline_result = false;
        }
        if (JSCompiler_inline_result) containerInfo = element.contentWindow;
        else break;
        element = getActiveElement(containerInfo.document);
      }
      return element;
    }
    function hasSelectionCapabilities(elem) {
      var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
      return nodeName && ("input" === nodeName && ("text" === elem.type || "search" === elem.type || "tel" === elem.type || "url" === elem.type || "password" === elem.type) || "textarea" === nodeName || "true" === elem.contentEditable);
    }
    var skipSelectionChangeEvent = canUseDOM && "documentMode" in document && 11 >= document.documentMode;
    var activeElement = null;
    var activeElementInst = null;
    var lastSelection = null;
    var mouseDown = false;
    function constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget) {
      var doc = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget.document : 9 === nativeEventTarget.nodeType ? nativeEventTarget : nativeEventTarget.ownerDocument;
      mouseDown || null == activeElement || activeElement !== getActiveElement(doc) || (doc = activeElement, "selectionStart" in doc && hasSelectionCapabilities(doc) ? doc = { start: doc.selectionStart, end: doc.selectionEnd } : (doc = (doc.ownerDocument && doc.ownerDocument.defaultView || window).getSelection(), doc = {
        anchorNode: doc.anchorNode,
        anchorOffset: doc.anchorOffset,
        focusNode: doc.focusNode,
        focusOffset: doc.focusOffset
      }), lastSelection && shallowEqual(lastSelection, doc) || (lastSelection = doc, doc = accumulateTwoPhaseListeners(activeElementInst, "onSelect"), 0 < doc.length && (nativeEvent = new SyntheticEvent(
        "onSelect",
        "select",
        null,
        nativeEvent,
        nativeEventTarget
      ), dispatchQueue.push({ event: nativeEvent, listeners: doc }), nativeEvent.target = activeElement)));
    }
    function makePrefixMap(styleProp, eventName) {
      var prefixes = {};
      prefixes[styleProp.toLowerCase()] = eventName.toLowerCase();
      prefixes["Webkit" + styleProp] = "webkit" + eventName;
      prefixes["Moz" + styleProp] = "moz" + eventName;
      return prefixes;
    }
    var vendorPrefixes = {
      animationend: makePrefixMap("Animation", "AnimationEnd"),
      animationiteration: makePrefixMap("Animation", "AnimationIteration"),
      animationstart: makePrefixMap("Animation", "AnimationStart"),
      transitionrun: makePrefixMap("Transition", "TransitionRun"),
      transitionstart: makePrefixMap("Transition", "TransitionStart"),
      transitioncancel: makePrefixMap("Transition", "TransitionCancel"),
      transitionend: makePrefixMap("Transition", "TransitionEnd")
    };
    var prefixedEventNames = {};
    var style = {};
    canUseDOM && (style = document.createElement("div").style, "AnimationEvent" in window || (delete vendorPrefixes.animationend.animation, delete vendorPrefixes.animationiteration.animation, delete vendorPrefixes.animationstart.animation), "TransitionEvent" in window || delete vendorPrefixes.transitionend.transition);
    function getVendorPrefixedEventName(eventName) {
      if (prefixedEventNames[eventName]) return prefixedEventNames[eventName];
      if (!vendorPrefixes[eventName]) return eventName;
      var prefixMap = vendorPrefixes[eventName], styleProp;
      for (styleProp in prefixMap)
        if (prefixMap.hasOwnProperty(styleProp) && styleProp in style)
          return prefixedEventNames[eventName] = prefixMap[styleProp];
      return eventName;
    }
    var ANIMATION_END = getVendorPrefixedEventName("animationend");
    var ANIMATION_ITERATION = getVendorPrefixedEventName("animationiteration");
    var ANIMATION_START = getVendorPrefixedEventName("animationstart");
    var TRANSITION_RUN = getVendorPrefixedEventName("transitionrun");
    var TRANSITION_START = getVendorPrefixedEventName("transitionstart");
    var TRANSITION_CANCEL = getVendorPrefixedEventName("transitioncancel");
    var TRANSITION_END = getVendorPrefixedEventName("transitionend");
    var topLevelEventsToReactNames = /* @__PURE__ */ new Map();
    var simpleEventPluginEvents = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouse\
Move mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
      " "
    );
    simpleEventPluginEvents.push("scrollEnd");
    function registerSimpleEvent(domEventName, reactName) {
      topLevelEventsToReactNames.set(domEventName, reactName);
      registerTwoPhaseEvent(reactName, [domEventName]);
    }
    var globalClientIdCounter$1 = 0;
    function getViewTransitionName(props, instance) {
      if (null != props.name && "auto" !== props.name) return props.name;
      if (null !== instance.autoName) return instance.autoName;
      props = pendingEffectsRoot.identifierPrefix;
      var globalClientId = globalClientIdCounter$1++;
      props = "_" + props + "t_" + globalClientId.toString(32) + "_";
      return instance.autoName = props;
    }
    function getClassNameByType(classByType) {
      if (null == classByType || "string" === typeof classByType)
        return classByType;
      var className = null, activeTypes = pendingTransitionTypes;
      if (null !== activeTypes)
        for (var i = 0; i < activeTypes.length; i++) {
          var match = classByType[activeTypes[i]];
          if (null != match) {
            if ("none" === match) return "none";
            className = null == className ? match : className + (" " + match);
          }
        }
      return null == className ? classByType.default : className;
    }
    function getViewTransitionClassName(defaultClass, eventClass) {
      defaultClass = getClassNameByType(defaultClass);
      eventClass = getClassNameByType(eventClass);
      return null == eventClass ? "auto" === defaultClass ? null : defaultClass : "auto" === eventClass ? null : eventClass;
    }
    var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
      if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
        var event = new window.ErrorEvent("error", {
          bubbles: true,
          cancelable: true,
          message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
          error
        });
        if (!window.dispatchEvent(event)) return;
      } else if ("object" === typeof process && "function" === typeof process.emit) {
        process.emit("uncaughtException", error);
        return;
      }
      console.error(error);
    };
    var concurrentQueues = [];
    var concurrentQueuesIndex = 0;
    var concurrentlyUpdatedLanes = 0;
    function finishQueueingConcurrentUpdates() {
      for (var endIndex = concurrentQueuesIndex, i = concurrentlyUpdatedLanes = concurrentQueuesIndex = 0; i < endIndex; ) {
        var fiber = concurrentQueues[i];
        concurrentQueues[i++] = null;
        var queue = concurrentQueues[i];
        concurrentQueues[i++] = null;
        var update = concurrentQueues[i];
        concurrentQueues[i++] = null;
        var lane = concurrentQueues[i];
        concurrentQueues[i++] = null;
        if (null !== queue && null !== update) {
          var pending = queue.pending;
          null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
          queue.pending = update;
        }
        0 !== lane && markUpdateLaneFromFiberToRoot(fiber, update, lane);
      }
    }
    function enqueueUpdate$1(fiber, queue, update, lane) {
      concurrentQueues[concurrentQueuesIndex++] = fiber;
      concurrentQueues[concurrentQueuesIndex++] = queue;
      concurrentQueues[concurrentQueuesIndex++] = update;
      concurrentQueues[concurrentQueuesIndex++] = lane;
      concurrentlyUpdatedLanes |= lane;
      fiber.lanes |= lane;
      fiber = fiber.alternate;
      null !== fiber && (fiber.lanes |= lane);
    }
    function enqueueConcurrentHookUpdate(fiber, queue, update, lane) {
      enqueueUpdate$1(fiber, queue, update, lane);
      return getRootForUpdatedFiber(fiber);
    }
    function enqueueConcurrentRenderForLane(fiber, lane) {
      enqueueUpdate$1(fiber, null, null, lane);
      return getRootForUpdatedFiber(fiber);
    }
    function markUpdateLaneFromFiberToRoot(sourceFiber, update, lane) {
      sourceFiber.lanes |= lane;
      var alternate = sourceFiber.alternate;
      null !== alternate && (alternate.lanes |= lane);
      for (var isHidden = false, parent = sourceFiber.return; null !== parent; )
        parent.childLanes |= lane, alternate = parent.alternate, null !== alternate && (alternate.childLanes |= lane), 22 === parent.tag && (sourceFiber = parent.stateNode, null === sourceFiber || sourceFiber._visibility & 1 || (isHidden = true)), sourceFiber = parent, parent = parent.return;
      return 3 === sourceFiber.tag ? (parent = sourceFiber.stateNode, isHidden && null !== update && (isHidden = 31 - clz32(lane), sourceFiber = parent.hiddenUpdates, alternate = sourceFiber[isHidden], null === alternate ? sourceFiber[isHidden] = [update] : alternate.push(update), update.lane = lane | 536870912), parent) : null;
    }
    function getRootForUpdatedFiber(sourceFiber) {
      if (50 < nestedUpdateCount)
        throw nestedUpdateCount = 0, rootWithNestedUpdates = null, Error(formatProdErrorMessage(185));
      for (var parent = sourceFiber.return; null !== parent; )
        sourceFiber = parent, parent = sourceFiber.return;
      return 3 === sourceFiber.tag ? sourceFiber.stateNode : null;
    }
    var emptyContextObject = {};
    function FiberNode(tag, pendingProps, key, mode) {
      this.tag = tag;
      this.key = key;
      this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null;
      this.index = 0;
      this.refCleanup = this.ref = null;
      this.pendingProps = pendingProps;
      this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null;
      this.mode = mode;
      this.subtreeFlags = this.flags = 0;
      this.deletions = null;
      this.childLanes = this.lanes = 0;
      this.alternate = null;
    }
    function createFiberImplClass(tag, pendingProps, key, mode) {
      return new FiberNode(tag, pendingProps, key, mode);
    }
    function shouldConstruct(Component) {
      Component = Component.prototype;
      return !(!Component || !Component.isReactComponent);
    }
    function createWorkInProgress(current, pendingProps) {
      var workInProgress2 = current.alternate;
      null === workInProgress2 ? (workInProgress2 = createFiberImplClass(
        current.tag,
        pendingProps,
        current.key,
        current.mode
      ), workInProgress2.elementType = current.elementType, workInProgress2.type = current.type, workInProgress2.stateNode = current.stateNode, workInProgress2.alternate = current, current.alternate = workInProgress2) : (workInProgress2.pendingProps = pendingProps, workInProgress2.type = current.type, workInProgress2.flags = 0, workInProgress2.subtreeFlags = 0, workInProgress2.deletions = null);
      workInProgress2.flags = current.flags & 1206910976;
      workInProgress2.childLanes = current.childLanes;
      workInProgress2.lanes = current.lanes;
      workInProgress2.child = current.child;
      workInProgress2.memoizedProps = current.memoizedProps;
      workInProgress2.memoizedState = current.memoizedState;
      workInProgress2.updateQueue = current.updateQueue;
      pendingProps = current.dependencies;
      workInProgress2.dependencies = null === pendingProps ? null : { lanes: pendingProps.lanes, firstContext: pendingProps.firstContext };
      workInProgress2.sibling = current.sibling;
      workInProgress2.index = current.index;
      workInProgress2.ref = current.ref;
      workInProgress2.refCleanup = current.refCleanup;
      return workInProgress2;
    }
    function resetWorkInProgress(workInProgress2, renderLanes2) {
      workInProgress2.flags &= 1206910978;
      var current = workInProgress2.alternate;
      null === current ? (workInProgress2.childLanes = 0, workInProgress2.lanes = renderLanes2, workInProgress2.child = null, workInProgress2.subtreeFlags = 0, workInProgress2.memoizedProps = null, workInProgress2.memoizedState = null, workInProgress2.updateQueue = null, workInProgress2.dependencies = null, workInProgress2.stateNode = null) : (workInProgress2.childLanes = current.childLanes, workInProgress2.
      lanes = current.lanes, workInProgress2.child = current.child, workInProgress2.subtreeFlags = 0, workInProgress2.deletions = null, workInProgress2.memoizedProps = current.memoizedProps, workInProgress2.memoizedState = current.memoizedState, workInProgress2.updateQueue = current.updateQueue, workInProgress2.type = current.type, renderLanes2 = current.dependencies, workInProgress2.dependencies =
      null === renderLanes2 ? null : {
        lanes: renderLanes2.lanes,
        firstContext: renderLanes2.firstContext
      });
      return workInProgress2;
    }
    function createFiberFromTypeAndProps(type, key, pendingProps, owner, mode, lanes) {
      var fiberTag = 0;
      owner = type;
      if ("function" === typeof owner) shouldConstruct(owner) && (fiberTag = 1);
      else if ("string" === typeof owner)
        fiberTag = isHostHoistableType(
          type,
          pendingProps,
          contextStackCursor.current
        ) ? 26 : "html" === type || "head" === type || "body" === type ? 27 : 5;
      else
        a: switch (owner) {
          case REACT_ACTIVITY_TYPE:
            return type = createFiberImplClass(31, pendingProps, key, mode), type.elementType = REACT_ACTIVITY_TYPE, type.lanes = lanes, type;
          case REACT_FRAGMENT_TYPE:
            return createFiberFromFragment(pendingProps.children, mode, lanes, key);
          case REACT_STRICT_MODE_TYPE:
            fiberTag = 8;
            mode |= 24;
            break;
          case REACT_PROFILER_TYPE:
            return type = createFiberImplClass(12, pendingProps, key, mode | 2), type.elementType = REACT_PROFILER_TYPE, type.lanes = lanes, type;
          case REACT_SUSPENSE_TYPE:
            return type = createFiberImplClass(13, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_TYPE, type.lanes = lanes, type;
          case REACT_SUSPENSE_LIST_TYPE:
            return type = createFiberImplClass(19, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_LIST_TYPE, type.lanes = lanes, type;
          case REACT_LEGACY_HIDDEN_TYPE:
          case REACT_VIEW_TRANSITION_TYPE:
            return type = mode | 32, type = createFiberImplClass(30, pendingProps, key, type), type.elementType = REACT_VIEW_TRANSITION_TYPE, type.lanes = lanes, type.stateNode = {
              autoName: null,
              paired: null,
              clones: null,
              ref: null
            }, type;
          default:
            if ("object" === typeof owner && null !== owner)
              switch (owner.$$typeof) {
                case REACT_CONTEXT_TYPE:
                  fiberTag = 10;
                  break a;
                case REACT_CONSUMER_TYPE:
                  fiberTag = 9;
                  break a;
                case REACT_FORWARD_REF_TYPE:
                  fiberTag = 11;
                  break a;
                case REACT_MEMO_TYPE:
                  fiberTag = 14;
                  break a;
                case REACT_LAZY_TYPE:
                  fiberTag = 16;
                  owner = null;
                  break a;
              }
            fiberTag = 29;
            pendingProps = Error(
              formatProdErrorMessage(130, null === type ? "null" : typeof type, "")
            );
            owner = null;
        }
      key = createFiberImplClass(fiberTag, pendingProps, key, mode);
      key.elementType = type;
      key.type = owner;
      key.lanes = lanes;
      return key;
    }
    function createFiberFromFragment(elements, mode, lanes, key) {
      elements = createFiberImplClass(7, elements, key, mode);
      elements.lanes = lanes;
      return elements;
    }
    function createFiberFromText(content, mode, lanes) {
      content = createFiberImplClass(6, content, null, mode);
      content.lanes = lanes;
      return content;
    }
    function createFiberFromDehydratedFragment(dehydratedNode) {
      var fiber = createFiberImplClass(18, null, null, 0);
      fiber.stateNode = dehydratedNode;
      return fiber;
    }
    function createFiberFromPortal(portal, mode, lanes) {
      mode = createFiberImplClass(
        4,
        null !== portal.children ? portal.children : [],
        portal.key,
        mode
      );
      mode.lanes = lanes;
      mode.stateNode = {
        containerInfo: portal.containerInfo,
        pendingChildren: null,
        implementation: portal.implementation
      };
      return mode;
    }
    var CapturedStacks = /* @__PURE__ */ new WeakMap();
    function createCapturedValueAtFiber(value, source) {
      if ("object" === typeof value && null !== value) {
        var existing = CapturedStacks.get(value);
        if (void 0 !== existing) return existing;
        source = {
          value,
          source,
          stack: getStackByFiberInDevAndProd(source)
        };
        CapturedStacks.set(value, source);
        return source;
      }
      return {
        value,
        source,
        stack: getStackByFiberInDevAndProd(source)
      };
    }
    var forkStack = [];
    var forkStackIndex = 0;
    var treeForkProvider = null;
    var treeForkCount = 0;
    var idStack = [];
    var idStackIndex = 0;
    var treeContextProvider = null;
    var treeContextId = 1;
    var treeContextOverflow = "";
    function pushTreeFork(workInProgress2, totalChildren) {
      forkStack[forkStackIndex++] = treeForkCount;
      forkStack[forkStackIndex++] = treeForkProvider;
      treeForkProvider = workInProgress2;
      treeForkCount = totalChildren;
    }
    function pushTreeId(workInProgress2, totalChildren, index2) {
      idStack[idStackIndex++] = treeContextId;
      idStack[idStackIndex++] = treeContextOverflow;
      idStack[idStackIndex++] = treeContextProvider;
      treeContextProvider = workInProgress2;
      var baseIdWithLeadingBit = treeContextId;
      workInProgress2 = treeContextOverflow;
      var baseLength = 32 - clz32(baseIdWithLeadingBit) - 1;
      baseIdWithLeadingBit &= ~(1 << baseLength);
      index2 += 1;
      var length = 32 - clz32(totalChildren) + baseLength;
      if (30 < length) {
        var numberOfOverflowBits = baseLength - baseLength % 5;
        length = (baseIdWithLeadingBit & (1 << numberOfOverflowBits) - 1).toString(32);
        baseIdWithLeadingBit >>= numberOfOverflowBits;
        baseLength -= numberOfOverflowBits;
        treeContextId = 1 << 32 - clz32(totalChildren) + baseLength | index2 << baseLength | baseIdWithLeadingBit;
        treeContextOverflow = length + workInProgress2;
      } else
        treeContextId = 1 << length | index2 << baseLength | baseIdWithLeadingBit, treeContextOverflow = workInProgress2;
    }
    function pushMaterializedTreeId(workInProgress2) {
      null !== workInProgress2.return && (pushTreeFork(workInProgress2, 1), pushTreeId(workInProgress2, 1, 0));
    }
    function popTreeContext(workInProgress2) {
      for (; workInProgress2 === treeForkProvider; )
        treeForkProvider = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null, treeForkCount = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null;
      for (; workInProgress2 === treeContextProvider; )
        treeContextProvider = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextOverflow = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextId = idStack[--idStackIndex], idStack[idStackIndex] = null;
    }
    function restoreSuspendedTreeContext(workInProgress2, suspendedContext) {
      idStack[idStackIndex++] = treeContextId;
      idStack[idStackIndex++] = treeContextOverflow;
      idStack[idStackIndex++] = treeContextProvider;
      treeContextId = suspendedContext.id;
      treeContextOverflow = suspendedContext.overflow;
      treeContextProvider = workInProgress2;
    }
    var hydrationParentFiber = null;
    var nextHydratableInstance = null;
    var isHydrating = false;
    var hydrationErrors = null;
    var rootOrSingletonContext = false;
    var HydrationMismatchException = Error(formatProdErrorMessage(519));
    function throwOnHydrationMismatch(fiber) {
      var error = Error(
        formatProdErrorMessage(
          418,
          1 < arguments.length && void 0 !== arguments[1] && arguments[1] ? "text" : "HTML",
          ""
        )
      );
      queueHydrationError(createCapturedValueAtFiber(error, fiber));
      throw HydrationMismatchException;
    }
    function prepareToHydrateHostInstance(fiber) {
      var instance = fiber.stateNode, type = fiber.type, props = fiber.memoizedProps;
      instance[internalInstanceKey] = fiber;
      instance[internalPropsKey] = props;
      switch (type) {
        case "dialog":
          listenToNonDelegatedEvent("cancel", instance);
          listenToNonDelegatedEvent("close", instance);
          break;
        case "iframe":
        case "object":
        case "embed":
          listenToNonDelegatedEvent("load", instance);
          break;
        case "video":
        case "audio":
          for (type = 0; type < mediaEventTypes.length; type++)
            listenToNonDelegatedEvent(mediaEventTypes[type], instance);
          break;
        case "source":
          listenToNonDelegatedEvent("error", instance);
          break;
        case "img":
        case "image":
        case "link":
          listenToNonDelegatedEvent("error", instance);
          listenToNonDelegatedEvent("load", instance);
          break;
        case "details":
          listenToNonDelegatedEvent("toggle", instance);
          break;
        case "input":
          listenToNonDelegatedEvent("invalid", instance);
          initInput(
            instance,
            props.value,
            props.defaultValue,
            props.checked,
            props.defaultChecked,
            props.type,
            props.name,
            true
          );
          break;
        case "select":
          listenToNonDelegatedEvent("invalid", instance);
          break;
        case "textarea":
          listenToNonDelegatedEvent("invalid", instance), initTextarea(instance, props.value, props.defaultValue, props.children);
      }
      type = props.children;
      "string" !== typeof type && "number" !== typeof type && "bigint" !== typeof type || instance.textContent === "" + type || true === props.suppressHydrationWarning || checkForUnmatchedText(instance.textContent, type) ? (null != props.popover && (listenToNonDelegatedEvent("beforetoggle", instance), listenToNonDelegatedEvent("toggle", instance)), null != props.onScroll && listenToNonDelegatedEvent(
      "scroll", instance), null != props.onScrollEnd && listenToNonDelegatedEvent("scrollend", instance), null != props.onClick && (instance.onclick = noop$1), instance = true) : instance = false;
      instance || throwOnHydrationMismatch(fiber, true);
    }
    function popToNextHostParent(fiber) {
      for (hydrationParentFiber = fiber.return; hydrationParentFiber; )
        switch (hydrationParentFiber.tag) {
          case 5:
          case 31:
          case 13:
            rootOrSingletonContext = false;
            return;
          case 27:
          case 3:
            rootOrSingletonContext = true;
            return;
          default:
            hydrationParentFiber = hydrationParentFiber.return;
        }
    }
    function popHydrationState(fiber) {
      if (fiber !== hydrationParentFiber) return false;
      if (!isHydrating) return popToNextHostParent(fiber), isHydrating = true, false;
      var tag = fiber.tag, JSCompiler_temp;
      if (JSCompiler_temp = 3 !== tag && 27 !== tag) {
        if (JSCompiler_temp = 5 === tag)
          JSCompiler_temp = fiber.type, JSCompiler_temp = !("form" !== JSCompiler_temp && "button" !== JSCompiler_temp) || shouldSetTextContent(fiber.type, fiber.memoizedProps);
        JSCompiler_temp = !JSCompiler_temp;
      }
      JSCompiler_temp && nextHydratableInstance && throwOnHydrationMismatch(fiber);
      popToNextHostParent(fiber);
      if (13 === tag) {
        fiber = fiber.memoizedState;
        fiber = null !== fiber ? fiber.dehydrated : null;
        if (!fiber) throw Error(formatProdErrorMessage(317));
        nextHydratableInstance = getNextHydratableInstanceAfterHydrationBoundary(fiber);
      } else if (31 === tag) {
        fiber = fiber.memoizedState;
        fiber = null !== fiber ? fiber.dehydrated : null;
        if (!fiber) throw Error(formatProdErrorMessage(317));
        nextHydratableInstance = getNextHydratableInstanceAfterHydrationBoundary(fiber);
      } else
        27 === tag ? (tag = nextHydratableInstance, isSingletonScope(fiber.type) ? (fiber = previousHydratableOnEnteringScopedSingleton, previousHydratableOnEnteringScopedSingleton = null, nextHydratableInstance = fiber) : nextHydratableInstance = tag) : nextHydratableInstance = hydrationParentFiber ? getNextHydratable(fiber.stateNode.nextSibling) : null;
      return true;
    }
    function resetHydrationState() {
      nextHydratableInstance = hydrationParentFiber = null;
      isHydrating = false;
    }
    function upgradeHydrationErrorsToRecoverable() {
      var queuedErrors = hydrationErrors;
      null !== queuedErrors && (null === workInProgressRootRecoverableErrors ? workInProgressRootRecoverableErrors = queuedErrors : workInProgressRootRecoverableErrors.push.apply(
        workInProgressRootRecoverableErrors,
        queuedErrors
      ), hydrationErrors = null);
      return queuedErrors;
    }
    function queueHydrationError(error) {
      null === hydrationErrors ? hydrationErrors = [error] : hydrationErrors.push(error);
    }
    var valueCursor = createCursor(null);
    var currentlyRenderingFiber$1 = null;
    var lastContextDependency = null;
    function pushProvider(providerFiber, context, nextValue) {
      push(valueCursor, context._currentValue);
      context._currentValue = nextValue;
    }
    function popProvider(context) {
      context._currentValue = valueCursor.current;
      pop(valueCursor);
    }
    function scheduleContextWorkOnParentPath(parent, renderLanes2, propagationRoot) {
      for (; null !== parent; ) {
        var alternate = parent.alternate;
        (parent.childLanes & renderLanes2) !== renderLanes2 ? (parent.childLanes |= renderLanes2, null !== alternate && (alternate.childLanes |= renderLanes2)) : null !== alternate && (alternate.childLanes & renderLanes2) !== renderLanes2 && (alternate.childLanes |= renderLanes2);
        if (parent === propagationRoot) break;
        parent = parent.return;
      }
    }
    function propagateContextChanges(workInProgress2, contexts, renderLanes2, forcePropagateEntireTree) {
      var fiber = workInProgress2.child;
      null !== fiber && (fiber.return = workInProgress2);
      for (; null !== fiber; ) {
        var list = fiber.dependencies;
        if (null !== list) {
          var nextFiber = fiber.child;
          list = list.firstContext;
          a: for (; null !== list; ) {
            var dependency = list;
            list = fiber;
            for (var i = 0; i < contexts.length; i++)
              if (dependency.context === contexts[i]) {
                list.lanes |= renderLanes2;
                dependency = list.alternate;
                null !== dependency && (dependency.lanes |= renderLanes2);
                scheduleContextWorkOnParentPath(
                  list.return,
                  renderLanes2,
                  workInProgress2
                );
                forcePropagateEntireTree || (nextFiber = null);
                break a;
              }
            list = dependency.next;
          }
        } else if (18 === fiber.tag) {
          nextFiber = fiber.return;
          if (null === nextFiber) throw Error(formatProdErrorMessage(341));
          nextFiber.lanes |= renderLanes2;
          list = nextFiber.alternate;
          null !== list && (list.lanes |= renderLanes2);
          scheduleContextWorkOnParentPath(nextFiber, renderLanes2, workInProgress2);
          nextFiber = null;
        } else
          13 === fiber.tag && null !== fiber.memoizedState && null === fiber.memoizedState.dehydrated ? (fiber.lanes |= renderLanes2, nextFiber = fiber.alternate, null !== nextFiber && (nextFiber.lanes |= renderLanes2), scheduleContextWorkOnParentPath(
            fiber.return,
            renderLanes2,
            workInProgress2
          ), nextFiber = fiber.child, nextFiber = null !== nextFiber ? nextFiber.sibling : null) : nextFiber = fiber.child;
        if (null !== nextFiber) nextFiber.return = fiber;
        else
          for (nextFiber = fiber; null !== nextFiber; ) {
            if (nextFiber === workInProgress2) {
              nextFiber = null;
              break;
            }
            fiber = nextFiber.sibling;
            if (null !== fiber) {
              fiber.return = nextFiber.return;
              nextFiber = fiber;
              break;
            }
            nextFiber = nextFiber.return;
          }
        fiber = nextFiber;
      }
    }
    function propagateParentContextChanges(current, workInProgress2, renderLanes2, forcePropagateEntireTree) {
      current = null;
      for (var parent = workInProgress2, isInsidePropagationBailout = false; null !== parent; ) {
        if (!isInsidePropagationBailout) {
          if (0 !== (parent.flags & 524288)) isInsidePropagationBailout = true;
          else if (0 !== (parent.flags & 262144)) break;
        }
        if (10 === parent.tag) {
          var currentParent = parent.alternate;
          if (null === currentParent) throw Error(formatProdErrorMessage(387));
          currentParent = currentParent.memoizedProps;
          if (null !== currentParent) {
            var context = parent.type;
            objectIs(parent.pendingProps.value, currentParent.value) || (null !== current ? current.push(context) : current = [context]);
          }
        } else if (parent === hostTransitionProviderCursor.current) {
          currentParent = parent.alternate;
          if (null === currentParent) throw Error(formatProdErrorMessage(387));
          currentParent.memoizedState.memoizedState !== parent.memoizedState.memoizedState && (null !== current ? current.push(HostTransitionContext) : current = [HostTransitionContext]);
        }
        parent = parent.return;
      }
      null !== current && propagateContextChanges(
        workInProgress2,
        current,
        renderLanes2,
        forcePropagateEntireTree
      );
      workInProgress2.flags |= 262144;
      return null !== current;
    }
    function checkIfContextChanged(currentDependencies) {
      for (currentDependencies = currentDependencies.firstContext; null !== currentDependencies; ) {
        if (!objectIs(
          currentDependencies.context._currentValue,
          currentDependencies.memoizedValue
        ))
          return true;
        currentDependencies = currentDependencies.next;
      }
      return false;
    }
    function prepareToReadContext(workInProgress2) {
      currentlyRenderingFiber$1 = workInProgress2;
      lastContextDependency = null;
      workInProgress2 = workInProgress2.dependencies;
      null !== workInProgress2 && (workInProgress2.firstContext = null);
    }
    function readContext(context) {
      return readContextForConsumer(currentlyRenderingFiber$1, context);
    }
    function readContextDuringReconciliation(consumer, context) {
      null === currentlyRenderingFiber$1 && prepareToReadContext(consumer);
      return readContextForConsumer(consumer, context);
    }
    function readContextForConsumer(consumer, context) {
      var value = context._currentValue;
      context = { context, memoizedValue: value, next: null };
      if (null === lastContextDependency) {
        if (null === consumer) throw Error(formatProdErrorMessage(308));
        lastContextDependency = context;
        consumer.dependencies = { lanes: 0, firstContext: context };
        consumer.flags |= 524288;
      } else lastContextDependency = lastContextDependency.next = context;
      return value;
    }
    var AbortControllerLocal = "undefined" !== typeof AbortController ? AbortController : function() {
      var listeners = [], signal = this.signal = {
        aborted: false,
        addEventListener: function(type, listener) {
          listeners.push(listener);
        }
      };
      this.abort = function() {
        signal.aborted = true;
        listeners.forEach(function(listener) {
          return listener();
        });
      };
    };
    var scheduleCallback$2 = Scheduler.unstable_scheduleCallback;
    var NormalPriority = Scheduler.unstable_NormalPriority;
    var CacheContext = {
      $$typeof: REACT_CONTEXT_TYPE,
      Consumer: null,
      Provider: null,
      _currentValue: null,
      _currentValue2: null,
      _threadCount: 0
    };
    function createCache() {
      return {
        controller: new AbortControllerLocal(),
        data: /* @__PURE__ */ new Map(),
        refCount: 0
      };
    }
    function releaseCache(cache) {
      cache.refCount--;
      0 === cache.refCount && scheduleCallback$2(NormalPriority, function() {
        cache.controller.abort();
      });
    }
    function queueTransitionTypes(root2, transitionTypes) {
      if (0 !== (root2.pendingLanes & 4194048)) {
        var queued = root2.transitionTypes;
        null === queued && (queued = root2.transitionTypes = []);
        for (root2 = 0; root2 < transitionTypes.length; root2++) {
          var transitionType = transitionTypes[root2];
          -1 === queued.indexOf(transitionType) && queued.push(transitionType);
        }
      }
    }
    var entangledTransitionTypes = null;
    function claimQueuedTransitionTypes(root2) {
      var claimed = root2.transitionTypes;
      root2.transitionTypes = null;
      return claimed;
    }
    var currentEntangledListeners = null;
    var currentEntangledPendingCount = 0;
    var currentEntangledLane = 0;
    var currentEntangledActionThenable = null;
    function entangleAsyncAction(transition, thenable) {
      if (null === currentEntangledListeners) {
        var entangledListeners = currentEntangledListeners = [];
        currentEntangledPendingCount = 0;
        currentEntangledLane = requestTransitionLane();
        currentEntangledActionThenable = {
          status: "pending",
          value: void 0,
          then: function(resolve) {
            entangledListeners.push(resolve);
          }
        };
      }
      currentEntangledPendingCount++;
      thenable.then(pingEngtangledActionScope, pingEngtangledActionScope);
      return thenable;
    }
    function pingEngtangledActionScope() {
      if (0 === --currentEntangledPendingCount && (entangledTransitionTypes = null, null !== currentEntangledListeners)) {
        null !== currentEntangledActionThenable && (currentEntangledActionThenable.status = "fulfilled");
        var listeners = currentEntangledListeners;
        currentEntangledListeners = null;
        currentEntangledLane = 0;
        currentEntangledActionThenable = null;
        for (var i = 0; i < listeners.length; i++) (0, listeners[i])();
      }
    }
    function chainThenableValue(thenable, result) {
      var listeners = [], thenableWithOverride = {
        status: "pending",
        value: null,
        reason: null,
        then: function(resolve) {
          listeners.push(resolve);
        }
      };
      thenable.then(
        function() {
          thenableWithOverride.status = "fulfilled";
          thenableWithOverride.value = result;
          for (var i = 0; i < listeners.length; i++) (0, listeners[i])(result);
        },
        function(error) {
          thenableWithOverride.status = "rejected";
          thenableWithOverride.reason = error;
          for (error = 0; error < listeners.length; error++)
            (0, listeners[error])(void 0);
        }
      );
      return thenableWithOverride;
    }
    var prevOnStartTransitionFinish = ReactSharedInternals.S;
    ReactSharedInternals.S = function(transition, returnValue) {
      globalMostRecentTransitionTime = now();
      "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && entangleAsyncAction(transition, returnValue);
      if (null !== entangledTransitionTypes)
        for (var root$28 = firstScheduledRoot; null !== root$28; )
          queueTransitionTypes(root$28, entangledTransitionTypes), root$28 = root$28.next;
      root$28 = transition.types;
      if (null !== root$28) {
        for (var root$29 = firstScheduledRoot; null !== root$29; )
          queueTransitionTypes(root$29, root$28), root$29 = root$29.next;
        if (0 !== currentEntangledLane) {
          root$29 = entangledTransitionTypes;
          null === root$29 && (root$29 = entangledTransitionTypes = []);
          for (var i = 0; i < root$28.length; i++) {
            var transitionType = root$28[i];
            -1 === root$29.indexOf(transitionType) && root$29.push(transitionType);
          }
        }
      }
      null !== prevOnStartTransitionFinish && prevOnStartTransitionFinish(transition, returnValue);
    };
    var resumedCache = createCursor(null);
    function peekCacheFromPool() {
      var cacheResumedFromPreviousRender = resumedCache.current;
      return null !== cacheResumedFromPreviousRender ? cacheResumedFromPreviousRender : workInProgressRoot.pooledCache;
    }
    function pushTransition(offscreenWorkInProgress, prevCachePool) {
      null === prevCachePool ? push(resumedCache, resumedCache.current) : push(resumedCache, prevCachePool.pool);
    }
    function getSuspendedCache() {
      var cacheFromPool = peekCacheFromPool();
      return null === cacheFromPool ? null : { parent: CacheContext._currentValue, pool: cacheFromPool };
    }
    var SuspenseException = Error(formatProdErrorMessage(460));
    var SuspenseyCommitException = Error(formatProdErrorMessage(474));
    var SuspenseActionException = Error(formatProdErrorMessage(542));
    var noopSuspenseyCommitThenable = { then: function() {
    } };
    function isThenableResolved(thenable) {
      thenable = thenable.status;
      return "fulfilled" === thenable || "rejected" === thenable;
    }
    function trackUsedThenable(thenableState2, thenable, index2) {
      index2 = thenableState2[index2];
      void 0 === index2 ? thenableState2.push(thenable) : index2 !== thenable && (thenable.then(noop$1, noop$1), thenable = index2);
      switch (thenable.status) {
        case "fulfilled":
          return thenable.value;
        case "rejected":
          thenableState2 = thenable.reason;
          checkIfUseWrappedInAsyncCatch(thenableState2);
          if (void 0 === thenableState2 && !("reason" in thenable))
            throw Error(formatProdErrorMessage(600));
          throw thenableState2;
        default:
          if ("string" === typeof thenable.status) thenable.then(noop$1, noop$1);
          else {
            thenableState2 = workInProgressRoot;
            if (null !== thenableState2 && 100 < thenableState2.shellSuspendCounter)
              throw Error(formatProdErrorMessage(482));
            thenableState2 = thenable;
            thenableState2.status = "pending";
            thenableState2.then(
              function(fulfilledValue) {
                if ("pending" === thenable.status) {
                  var fulfilledThenable = thenable;
                  fulfilledThenable.status = "fulfilled";
                  fulfilledThenable.value = fulfilledValue;
                }
              },
              function(error) {
                if ("pending" === thenable.status) {
                  var rejectedThenable = thenable;
                  rejectedThenable.status = "rejected";
                  rejectedThenable.reason = error;
                }
              }
            );
          }
          switch (thenable.status) {
            case "fulfilled":
              return thenable.value;
            case "rejected":
              throw thenableState2 = thenable.reason, checkIfUseWrappedInAsyncCatch(thenableState2), thenableState2;
          }
          suspendedThenable = thenable;
          throw SuspenseException;
      }
    }
    function resolveLazy(lazyType) {
      try {
        var init = lazyType._init;
        return init(lazyType._payload);
      } catch (x) {
        if (null !== x && "object" === typeof x && "function" === typeof x.then)
          throw suspendedThenable = x, SuspenseException;
        throw x;
      }
    }
    var suspendedThenable = null;
    function getSuspendedThenable() {
      if (null === suspendedThenable) throw Error(formatProdErrorMessage(459));
      var thenable = suspendedThenable;
      suspendedThenable = null;
      return thenable;
    }
    function checkIfUseWrappedInAsyncCatch(rejectedReason) {
      if (rejectedReason === SuspenseException || rejectedReason === SuspenseActionException)
        throw Error(formatProdErrorMessage(483));
    }
    var thenableState$1 = null;
    var thenableIndexCounter$1 = 0;
    function unwrapThenable(thenable) {
      var index2 = thenableIndexCounter$1;
      thenableIndexCounter$1 += 1;
      null === thenableState$1 && (thenableState$1 = []);
      return trackUsedThenable(thenableState$1, thenable, index2);
    }
    function coerceRef(workInProgress2, element) {
      element = element.props.ref;
      workInProgress2.ref = void 0 !== element ? element : null;
    }
    function throwOnInvalidObjectTypeImpl(returnFiber, newChild) {
      if (newChild.$$typeof === REACT_LEGACY_ELEMENT_TYPE)
        throw Error(formatProdErrorMessage(525));
      returnFiber = Object.prototype.toString.call(newChild);
      throw Error(
        formatProdErrorMessage(
          31,
          "[object Object]" === returnFiber ? "object with keys {" + Object.keys(newChild).join(", ") + "}" : returnFiber
        )
      );
    }
    function createChildReconciler(shouldTrackSideEffects) {
      function deleteChild(returnFiber, childToDelete) {
        if (shouldTrackSideEffects) {
          var deletions = returnFiber.deletions;
          null === deletions ? (returnFiber.deletions = [childToDelete], returnFiber.flags |= 16) : deletions.push(childToDelete);
        }
      }
      function deleteRemainingChildren(returnFiber, currentFirstChild) {
        if (!shouldTrackSideEffects) return null;
        for (; null !== currentFirstChild; )
          deleteChild(returnFiber, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
        return null;
      }
      function mapRemainingChildren(currentFirstChild) {
        for (var existingChildren = /* @__PURE__ */ new Map(); null !== currentFirstChild; )
          null === currentFirstChild.key ? existingChildren.set(currentFirstChild.index, currentFirstChild) : existingChildren.set(currentFirstChild.key, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
        return existingChildren;
      }
      function useFiber(fiber, pendingProps) {
        fiber = createWorkInProgress(fiber, pendingProps);
        fiber.index = 0;
        fiber.sibling = null;
        return fiber;
      }
      function placeChild(newFiber, lastPlacedIndex, newIndex) {
        newFiber.index = newIndex;
        if (!shouldTrackSideEffects)
          return newFiber.flags |= 1048576, lastPlacedIndex;
        newIndex = newFiber.alternate;
        if (null !== newIndex)
          return newIndex = newIndex.index, newIndex < lastPlacedIndex ? (newFiber.flags |= 2, lastPlacedIndex) : newIndex;
        newFiber.flags |= 134217730;
        return lastPlacedIndex;
      }
      function placeSingleChild(newFiber) {
        shouldTrackSideEffects && null === newFiber.alternate && (newFiber.flags |= 134217730);
        return newFiber;
      }
      function updateTextNode(returnFiber, current, textContent, lanes) {
        if (null === current || 6 !== current.tag)
          return current = createFiberFromText(textContent, returnFiber.mode, lanes), current.return = returnFiber, current;
        current = useFiber(current, textContent);
        current.return = returnFiber;
        return current;
      }
      function updateElement(returnFiber, current, element, lanes) {
        var elementType = element.type;
        if (elementType === REACT_FRAGMENT_TYPE)
          return returnFiber = updateFragment(
            returnFiber,
            current,
            element.props.children,
            lanes,
            element.key
          ), coerceRef(returnFiber, element), returnFiber;
        if (null !== current && (current.elementType === elementType || "object" === typeof elementType && null !== elementType && elementType.$$typeof === REACT_LAZY_TYPE && resolveLazy(elementType) === current.type))
          return current = useFiber(current, element.props), coerceRef(current, element), current.return = returnFiber, current;
        current = createFiberFromTypeAndProps(
          element.type,
          element.key,
          element.props,
          null,
          returnFiber.mode,
          lanes
        );
        coerceRef(current, element);
        current.return = returnFiber;
        return current;
      }
      function updatePortal(returnFiber, current, portal, lanes) {
        if (null === current || 4 !== current.tag || current.stateNode.containerInfo !== portal.containerInfo || current.stateNode.implementation !== portal.implementation)
          return current = createFiberFromPortal(portal, returnFiber.mode, lanes), current.return = returnFiber, current;
        current = useFiber(current, portal.children || []);
        current.return = returnFiber;
        return current;
      }
      function updateFragment(returnFiber, current, fragment, lanes, key) {
        if (null === current || 7 !== current.tag)
          return current = createFiberFromFragment(
            fragment,
            returnFiber.mode,
            lanes,
            key
          ), current.return = returnFiber, current;
        current = useFiber(current, fragment);
        current.return = returnFiber;
        return current;
      }
      function createChild(returnFiber, newChild, lanes) {
        if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild)
          return newChild = createFiberFromText(
            "" + newChild,
            returnFiber.mode,
            lanes
          ), newChild.return = returnFiber, newChild;
        if ("object" === typeof newChild && null !== newChild) {
          switch (newChild.$$typeof) {
            case REACT_ELEMENT_TYPE:
              return lanes = createFiberFromTypeAndProps(
                newChild.type,
                newChild.key,
                newChild.props,
                null,
                returnFiber.mode,
                lanes
              ), coerceRef(lanes, newChild), lanes.return = returnFiber, lanes;
            case REACT_PORTAL_TYPE:
              return newChild = createFiberFromPortal(
                newChild,
                returnFiber.mode,
                lanes
              ), newChild.return = returnFiber, newChild;
            case REACT_LAZY_TYPE:
              return newChild = resolveLazy(newChild), createChild(returnFiber, newChild, lanes);
          }
          if (isArrayImpl(newChild) || getIteratorFn(newChild))
            return newChild = createFiberFromFragment(
              newChild,
              returnFiber.mode,
              lanes,
              null
            ), newChild.return = returnFiber, newChild;
          if ("function" === typeof newChild.then)
            return createChild(returnFiber, unwrapThenable(newChild), lanes);
          if (newChild.$$typeof === REACT_CONTEXT_TYPE)
            return createChild(
              returnFiber,
              readContextDuringReconciliation(returnFiber, newChild),
              lanes
            );
          throwOnInvalidObjectTypeImpl(returnFiber, newChild);
        }
        return null;
      }
      function updateSlot(returnFiber, oldFiber, newChild, lanes) {
        var key = null !== oldFiber ? oldFiber.key : null;
        if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild)
          return null !== key ? null : updateTextNode(returnFiber, oldFiber, "" + newChild, lanes);
        if ("object" === typeof newChild && null !== newChild) {
          switch (newChild.$$typeof) {
            case REACT_ELEMENT_TYPE:
              return newChild.key === key ? updateElement(returnFiber, oldFiber, newChild, lanes) : null;
            case REACT_PORTAL_TYPE:
              return newChild.key === key ? updatePortal(returnFiber, oldFiber, newChild, lanes) : null;
            case REACT_LAZY_TYPE:
              return newChild = resolveLazy(newChild), updateSlot(returnFiber, oldFiber, newChild, lanes);
          }
          if (isArrayImpl(newChild) || getIteratorFn(newChild))
            return null !== key ? null : updateFragment(returnFiber, oldFiber, newChild, lanes, null);
          if ("function" === typeof newChild.then)
            return updateSlot(
              returnFiber,
              oldFiber,
              unwrapThenable(newChild),
              lanes
            );
          if (newChild.$$typeof === REACT_CONTEXT_TYPE)
            return updateSlot(
              returnFiber,
              oldFiber,
              readContextDuringReconciliation(returnFiber, newChild),
              lanes
            );
          throwOnInvalidObjectTypeImpl(returnFiber, newChild);
        }
        return null;
      }
      function updateFromMap(existingChildren, returnFiber, newIdx, newChild, lanes) {
        if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild)
          return existingChildren = existingChildren.get(newIdx) || null, updateTextNode(returnFiber, existingChildren, "" + newChild, lanes);
        if ("object" === typeof newChild && null !== newChild) {
          switch (newChild.$$typeof) {
            case REACT_ELEMENT_TYPE:
              return existingChildren = existingChildren.get(
                null === newChild.key ? newIdx : newChild.key
              ) || null, updateElement(returnFiber, existingChildren, newChild, lanes);
            case REACT_PORTAL_TYPE:
              return existingChildren = existingChildren.get(
                null === newChild.key ? newIdx : newChild.key
              ) || null, updatePortal(returnFiber, existingChildren, newChild, lanes);
            case REACT_LAZY_TYPE:
              return newChild = resolveLazy(newChild), updateFromMap(
                existingChildren,
                returnFiber,
                newIdx,
                newChild,
                lanes
              );
          }
          if (isArrayImpl(newChild) || getIteratorFn(newChild))
            return existingChildren = existingChildren.get(newIdx) || null, updateFragment(returnFiber, existingChildren, newChild, lanes, null);
          if ("function" === typeof newChild.then)
            return updateFromMap(
              existingChildren,
              returnFiber,
              newIdx,
              unwrapThenable(newChild),
              lanes
            );
          if (newChild.$$typeof === REACT_CONTEXT_TYPE)
            return updateFromMap(
              existingChildren,
              returnFiber,
              newIdx,
              readContextDuringReconciliation(returnFiber, newChild),
              lanes
            );
          throwOnInvalidObjectTypeImpl(returnFiber, newChild);
        }
        return null;
      }
      function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, lanes) {
        for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null; null !== oldFiber && newIdx < newChildren.length; newIdx++) {
          oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
          var newFiber = updateSlot(
            returnFiber,
            oldFiber,
            newChildren[newIdx],
            lanes
          );
          if (null === newFiber) {
            null === oldFiber && (oldFiber = nextOldFiber);
            break;
          }
          shouldTrackSideEffects && oldFiber && null === newFiber.alternate && deleteChild(returnFiber, oldFiber);
          currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
          null === previousNewFiber ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
          previousNewFiber = newFiber;
          oldFiber = nextOldFiber;
        }
        if (newIdx === newChildren.length)
          return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
        if (null === oldFiber) {
          for (; newIdx < newChildren.length; newIdx++)
            oldFiber = createChild(returnFiber, newChildren[newIdx], lanes), null !== oldFiber && (currentFirstChild = placeChild(
              oldFiber,
              currentFirstChild,
              newIdx
            ), null === previousNewFiber ? resultingFirstChild = oldFiber : previousNewFiber.sibling = oldFiber, previousNewFiber = oldFiber);
          isHydrating && pushTreeFork(returnFiber, newIdx);
          return resultingFirstChild;
        }
        for (oldFiber = mapRemainingChildren(oldFiber); newIdx < newChildren.length; newIdx++)
          nextOldFiber = updateFromMap(
            oldFiber,
            returnFiber,
            newIdx,
            newChildren[newIdx],
            lanes
          ), null !== nextOldFiber && (shouldTrackSideEffects && (newFiber = nextOldFiber.alternate, null !== newFiber && oldFiber.delete(null === newFiber.key ? newIdx : newFiber.key)), currentFirstChild = placeChild(
            nextOldFiber,
            currentFirstChild,
            newIdx
          ), null === previousNewFiber ? resultingFirstChild = nextOldFiber : previousNewFiber.sibling = nextOldFiber, previousNewFiber = nextOldFiber);
        shouldTrackSideEffects && oldFiber.forEach(function(child) {
          return deleteChild(returnFiber, child);
        });
        isHydrating && pushTreeFork(returnFiber, newIdx);
        return resultingFirstChild;
      }
      function reconcileChildrenIterator(returnFiber, currentFirstChild, newChildren, lanes) {
        if (null == newChildren) throw Error(formatProdErrorMessage(151));
        for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null, step = newChildren.next(); null !== oldFiber && !step.done; newIdx++, step = newChildren.next()) {
          oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
          var newFiber = updateSlot(returnFiber, oldFiber, step.value, lanes);
          if (null === newFiber) {
            null === oldFiber && (oldFiber = nextOldFiber);
            break;
          }
          shouldTrackSideEffects && oldFiber && null === newFiber.alternate && deleteChild(returnFiber, oldFiber);
          currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
          null === previousNewFiber ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
          previousNewFiber = newFiber;
          oldFiber = nextOldFiber;
        }
        if (step.done)
          return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
        if (null === oldFiber) {
          for (; !step.done; newIdx++, step = newChildren.next())
            step = createChild(returnFiber, step.value, lanes), null !== step && (currentFirstChild = placeChild(step, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
          isHydrating && pushTreeFork(returnFiber, newIdx);
          return resultingFirstChild;
        }
        for (oldFiber = mapRemainingChildren(oldFiber); !step.done; newIdx++, step = newChildren.next())
          step = updateFromMap(oldFiber, returnFiber, newIdx, step.value, lanes), null !== step && (shouldTrackSideEffects && (nextOldFiber = step.alternate, null !== nextOldFiber && oldFiber.delete(
            null === nextOldFiber.key ? newIdx : nextOldFiber.key
          )), currentFirstChild = placeChild(step, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
        shouldTrackSideEffects && oldFiber.forEach(function(child) {
          return deleteChild(returnFiber, child);
        });
        isHydrating && pushTreeFork(returnFiber, newIdx);
        return resultingFirstChild;
      }
      function reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, lanes) {
        "object" === typeof newChild && null !== newChild && newChild.type === REACT_FRAGMENT_TYPE && null === newChild.key && void 0 === newChild.props.ref && (newChild = newChild.props.children);
        if ("object" === typeof newChild && null !== newChild) {
          switch (newChild.$$typeof) {
            case REACT_ELEMENT_TYPE:
              a: {
                for (var key = newChild.key; null !== currentFirstChild; ) {
                  if (currentFirstChild.key === key) {
                    key = newChild.type;
                    if (key === REACT_FRAGMENT_TYPE) {
                      if (7 === currentFirstChild.tag) {
                        deleteRemainingChildren(
                          returnFiber,
                          currentFirstChild.sibling
                        );
                        lanes = useFiber(
                          currentFirstChild,
                          newChild.props.children
                        );
                        coerceRef(lanes, newChild);
                        lanes.return = returnFiber;
                        returnFiber = lanes;
                        break a;
                      }
                    } else if (currentFirstChild.elementType === key || "object" === typeof key && null !== key && key.$$typeof === REACT_LAZY_TYPE && resolveLazy(key) === currentFirstChild.type) {
                      deleteRemainingChildren(
                        returnFiber,
                        currentFirstChild.sibling
                      );
                      lanes = useFiber(currentFirstChild, newChild.props);
                      coerceRef(lanes, newChild);
                      lanes.return = returnFiber;
                      returnFiber = lanes;
                      break a;
                    }
                    deleteRemainingChildren(returnFiber, currentFirstChild);
                    break;
                  } else deleteChild(returnFiber, currentFirstChild);
                  currentFirstChild = currentFirstChild.sibling;
                }
                newChild.type === REACT_FRAGMENT_TYPE ? (lanes = createFiberFromFragment(
                  newChild.props.children,
                  returnFiber.mode,
                  lanes,
                  newChild.key
                ), coerceRef(lanes, newChild), lanes.return = returnFiber, returnFiber = lanes) : (lanes = createFiberFromTypeAndProps(
                  newChild.type,
                  newChild.key,
                  newChild.props,
                  null,
                  returnFiber.mode,
                  lanes
                ), coerceRef(lanes, newChild), lanes.return = returnFiber, returnFiber = lanes);
              }
              return placeSingleChild(returnFiber);
            case REACT_PORTAL_TYPE:
              a: {
                for (key = newChild.key; null !== currentFirstChild; ) {
                  if (currentFirstChild.key === key)
                    if (4 === currentFirstChild.tag && currentFirstChild.stateNode.containerInfo === newChild.containerInfo && currentFirstChild.stateNode.implementation === newChild.implementation) {
                      deleteRemainingChildren(
                        returnFiber,
                        currentFirstChild.sibling
                      );
                      lanes = useFiber(currentFirstChild, newChild.children || []);
                      lanes.return = returnFiber;
                      returnFiber = lanes;
                      break a;
                    } else {
                      deleteRemainingChildren(returnFiber, currentFirstChild);
                      break;
                    }
                  else deleteChild(returnFiber, currentFirstChild);
                  currentFirstChild = currentFirstChild.sibling;
                }
                lanes = createFiberFromPortal(newChild, returnFiber.mode, lanes);
                lanes.return = returnFiber;
                returnFiber = lanes;
              }
              return placeSingleChild(returnFiber);
            case REACT_LAZY_TYPE:
              return newChild = resolveLazy(newChild), reconcileChildFibersImpl(
                returnFiber,
                currentFirstChild,
                newChild,
                lanes
              );
          }
          if (isArrayImpl(newChild))
            return reconcileChildrenArray(
              returnFiber,
              currentFirstChild,
              newChild,
              lanes
            );
          if (getIteratorFn(newChild)) {
            key = getIteratorFn(newChild);
            if ("function" !== typeof key) throw Error(formatProdErrorMessage(150));
            newChild = key.call(newChild);
            return reconcileChildrenIterator(
              returnFiber,
              currentFirstChild,
              newChild,
              lanes
            );
          }
          if ("function" === typeof newChild.then)
            return reconcileChildFibersImpl(
              returnFiber,
              currentFirstChild,
              unwrapThenable(newChild),
              lanes
            );
          if (newChild.$$typeof === REACT_CONTEXT_TYPE)
            return reconcileChildFibersImpl(
              returnFiber,
              currentFirstChild,
              readContextDuringReconciliation(returnFiber, newChild),
              lanes
            );
          throwOnInvalidObjectTypeImpl(returnFiber, newChild);
        }
        return "string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild ? (newChild = "" + newChild, null !== currentFirstChild && 6 === currentFirstChild.tag ? (deleteRemainingChildren(returnFiber, currentFirstChild.sibling), lanes = useFiber(currentFirstChild, newChild), lanes.return = returnFiber, returnFiber = lanes) : (deleteRemainingChildren(
        returnFiber, currentFirstChild), lanes = createFiberFromText(newChild, returnFiber.mode, lanes), lanes.return = returnFiber, returnFiber = lanes), placeSingleChild(returnFiber)) : deleteRemainingChildren(returnFiber, currentFirstChild);
      }
      return function(returnFiber, currentFirstChild, newChild, lanes) {
        try {
          thenableIndexCounter$1 = 0;
          var firstChildFiber = reconcileChildFibersImpl(
            returnFiber,
            currentFirstChild,
            newChild,
            lanes
          );
          thenableState$1 = null;
          return firstChildFiber;
        } catch (x) {
          if (x === SuspenseException || x === SuspenseActionException) throw x;
          var fiber = createFiberImplClass(29, x, null, returnFiber.mode);
          fiber.lanes = lanes;
          fiber.return = returnFiber;
          return fiber;
        } finally {
        }
      };
    }
    var reconcileChildFibers = createChildReconciler(true);
    var mountChildFibers = createChildReconciler(false);
    var hasForceUpdate = false;
    function initializeUpdateQueue(fiber) {
      fiber.updateQueue = {
        baseState: fiber.memoizedState,
        firstBaseUpdate: null,
        lastBaseUpdate: null,
        shared: { pending: null, lanes: 0, hiddenCallbacks: null },
        callbacks: null
      };
    }
    function cloneUpdateQueue(current, workInProgress2) {
      current = current.updateQueue;
      workInProgress2.updateQueue === current && (workInProgress2.updateQueue = {
        baseState: current.baseState,
        firstBaseUpdate: current.firstBaseUpdate,
        lastBaseUpdate: current.lastBaseUpdate,
        shared: current.shared,
        callbacks: null
      });
    }
    function createUpdate(lane) {
      return { lane, tag: 0, payload: null, callback: null, next: null };
    }
    function enqueueUpdate(fiber, update, lane) {
      var updateQueue = fiber.updateQueue;
      if (null === updateQueue) return null;
      updateQueue = updateQueue.shared;
      if (0 !== (executionContext & 2)) {
        var pending = updateQueue.pending;
        null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
        updateQueue.pending = update;
        update = getRootForUpdatedFiber(fiber);
        markUpdateLaneFromFiberToRoot(fiber, null, lane);
        return update;
      }
      enqueueUpdate$1(fiber, updateQueue, update, lane);
      return getRootForUpdatedFiber(fiber);
    }
    function entangleTransitions(root2, fiber, lane) {
      fiber = fiber.updateQueue;
      if (null !== fiber && (fiber = fiber.shared, 0 !== (lane & 4194048))) {
        var queueLanes = fiber.lanes;
        queueLanes &= root2.pendingLanes;
        lane |= queueLanes;
        fiber.lanes = lane;
        markRootEntangled(root2, lane);
      }
    }
    function enqueueCapturedUpdate(workInProgress2, capturedUpdate) {
      var queue = workInProgress2.updateQueue, current = workInProgress2.alternate;
      if (null !== current && (current = current.updateQueue, queue === current)) {
        var newFirst = null, newLast = null;
        queue = queue.firstBaseUpdate;
        if (null !== queue) {
          do {
            var clone = {
              lane: queue.lane,
              tag: queue.tag,
              payload: queue.payload,
              callback: null,
              next: null
            };
            null === newLast ? newFirst = newLast = clone : newLast = newLast.next = clone;
            queue = queue.next;
          } while (null !== queue);
          null === newLast ? newFirst = newLast = capturedUpdate : newLast = newLast.next = capturedUpdate;
        } else newFirst = newLast = capturedUpdate;
        queue = {
          baseState: current.baseState,
          firstBaseUpdate: newFirst,
          lastBaseUpdate: newLast,
          shared: current.shared,
          callbacks: current.callbacks
        };
        workInProgress2.updateQueue = queue;
        return;
      }
      workInProgress2 = queue.lastBaseUpdate;
      null === workInProgress2 ? queue.firstBaseUpdate = capturedUpdate : workInProgress2.next = capturedUpdate;
      queue.lastBaseUpdate = capturedUpdate;
    }
    var didReadFromEntangledAsyncAction = false;
    function suspendIfUpdateReadFromEntangledAsyncAction() {
      if (didReadFromEntangledAsyncAction) {
        var entangledActionThenable = currentEntangledActionThenable;
        if (null !== entangledActionThenable) throw entangledActionThenable;
      }
    }
    function processUpdateQueue(workInProgress$jscomp$0, props, instance$jscomp$0, renderLanes2) {
      didReadFromEntangledAsyncAction = false;
      var queue = workInProgress$jscomp$0.updateQueue;
      hasForceUpdate = false;
      var firstBaseUpdate = queue.firstBaseUpdate, lastBaseUpdate = queue.lastBaseUpdate, pendingQueue = queue.shared.pending;
      if (null !== pendingQueue) {
        queue.shared.pending = null;
        var lastPendingUpdate = pendingQueue, firstPendingUpdate = lastPendingUpdate.next;
        lastPendingUpdate.next = null;
        null === lastBaseUpdate ? firstBaseUpdate = firstPendingUpdate : lastBaseUpdate.next = firstPendingUpdate;
        lastBaseUpdate = lastPendingUpdate;
        var current = workInProgress$jscomp$0.alternate;
        null !== current && (current = current.updateQueue, pendingQueue = current.lastBaseUpdate, pendingQueue !== lastBaseUpdate && (null === pendingQueue ? current.firstBaseUpdate = firstPendingUpdate : pendingQueue.next = firstPendingUpdate, current.lastBaseUpdate = lastPendingUpdate));
      }
      if (null !== firstBaseUpdate) {
        var newState = queue.baseState;
        lastBaseUpdate = 0;
        current = firstPendingUpdate = lastPendingUpdate = null;
        pendingQueue = firstBaseUpdate;
        do {
          var updateLane = pendingQueue.lane & -536870913, isHiddenUpdate = updateLane !== pendingQueue.lane;
          if (isHiddenUpdate ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes2 & updateLane) === updateLane) {
            0 !== updateLane && updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction = true);
            null !== current && (current = current.next = {
              lane: 0,
              tag: pendingQueue.tag,
              payload: pendingQueue.payload,
              callback: null,
              next: null
            });
            a: {
              var workInProgress2 = workInProgress$jscomp$0, update = pendingQueue;
              updateLane = props;
              var instance = instance$jscomp$0;
              switch (update.tag) {
                case 1:
                  workInProgress2 = update.payload;
                  if ("function" === typeof workInProgress2) {
                    newState = workInProgress2.call(instance, newState, updateLane);
                    break a;
                  }
                  newState = workInProgress2;
                  break a;
                case 3:
                  workInProgress2.flags = workInProgress2.flags & -65537 | 128;
                case 0:
                  workInProgress2 = update.payload;
                  updateLane = "function" === typeof workInProgress2 ? workInProgress2.call(instance, newState, updateLane) : workInProgress2;
                  if (null === updateLane || void 0 === updateLane) break a;
                  newState = assign({}, newState, updateLane);
                  break a;
                case 2:
                  hasForceUpdate = true;
              }
            }
            updateLane = pendingQueue.callback;
            null !== updateLane && (workInProgress$jscomp$0.flags |= 64, isHiddenUpdate && (workInProgress$jscomp$0.flags |= 8192), isHiddenUpdate = queue.callbacks, null === isHiddenUpdate ? queue.callbacks = [updateLane] : isHiddenUpdate.push(updateLane));
          } else
            isHiddenUpdate = {
              lane: updateLane,
              tag: pendingQueue.tag,
              payload: pendingQueue.payload,
              callback: pendingQueue.callback,
              next: null
            }, null === current ? (firstPendingUpdate = current = isHiddenUpdate, lastPendingUpdate = newState) : current = current.next = isHiddenUpdate, lastBaseUpdate |= updateLane;
          pendingQueue = pendingQueue.next;
          if (null === pendingQueue)
            if (pendingQueue = queue.shared.pending, null === pendingQueue)
              break;
            else
              isHiddenUpdate = pendingQueue, pendingQueue = isHiddenUpdate.next, isHiddenUpdate.next = null, queue.lastBaseUpdate = isHiddenUpdate, queue.shared.pending = null;
        } while (1);
        null === current && (lastPendingUpdate = newState);
        queue.baseState = lastPendingUpdate;
        queue.firstBaseUpdate = firstPendingUpdate;
        queue.lastBaseUpdate = current;
        null === firstBaseUpdate && (queue.shared.lanes = 0);
        workInProgressRootSkippedLanes |= lastBaseUpdate;
        workInProgress$jscomp$0.lanes = lastBaseUpdate;
        workInProgress$jscomp$0.memoizedState = newState;
      }
    }
    function callCallback(callback, context) {
      if ("function" !== typeof callback)
        throw Error(formatProdErrorMessage(191, callback));
      callback.call(context);
    }
    function commitCallbacks(updateQueue, context) {
      var callbacks = updateQueue.callbacks;
      if (null !== callbacks)
        for (updateQueue.callbacks = null, updateQueue = 0; updateQueue < callbacks.length; updateQueue++)
          callCallback(callbacks[updateQueue], context);
    }
    var currentTreeHiddenStackCursor = createCursor(null);
    var prevEntangledRenderLanesCursor = createCursor(0);
    function pushHiddenContext(fiber, context) {
      fiber = entangledRenderLanes;
      push(prevEntangledRenderLanesCursor, fiber);
      push(currentTreeHiddenStackCursor, context);
      entangledRenderLanes = fiber | context.baseLanes;
    }
    function reuseHiddenContextOnStack() {
      push(prevEntangledRenderLanesCursor, entangledRenderLanes);
      push(currentTreeHiddenStackCursor, currentTreeHiddenStackCursor.current);
    }
    function popHiddenContext() {
      entangledRenderLanes = prevEntangledRenderLanesCursor.current;
      pop(currentTreeHiddenStackCursor);
      pop(prevEntangledRenderLanesCursor);
    }
    var suspenseHandlerStackCursor = createCursor(null);
    var shellBoundary = null;
    function pushPrimaryTreeSuspenseHandler(handler) {
      var current = handler.alternate;
      push(suspenseStackCursor, suspenseStackCursor.current & 1);
      push(suspenseHandlerStackCursor, handler);
      null === shellBoundary && (null === current || null !== currentTreeHiddenStackCursor.current ? shellBoundary = handler : null !== current.memoizedState && (shellBoundary = handler));
    }
    function pushDehydratedActivitySuspenseHandler(fiber) {
      push(suspenseStackCursor, suspenseStackCursor.current);
      push(suspenseHandlerStackCursor, fiber);
      null === shellBoundary && (shellBoundary = fiber);
    }
    function pushOffscreenSuspenseHandler(fiber) {
      22 === fiber.tag ? (push(suspenseStackCursor, suspenseStackCursor.current), push(suspenseHandlerStackCursor, fiber), null === shellBoundary && (shellBoundary = fiber)) : reuseSuspenseHandlerOnStack();
    }
    function reuseSuspenseHandlerOnStack() {
      push(suspenseStackCursor, suspenseStackCursor.current);
      push(suspenseHandlerStackCursor, suspenseHandlerStackCursor.current);
    }
    function popSuspenseHandler(fiber) {
      pop(suspenseHandlerStackCursor);
      shellBoundary === fiber && (shellBoundary = null);
      pop(suspenseStackCursor);
    }
    var suspenseStackCursor = createCursor(0);
    function pushSuspenseListContext(fiber, newContext) {
      push(suspenseHandlerStackCursor, suspenseHandlerStackCursor.current);
      push(suspenseStackCursor, newContext);
    }
    function popSuspenseListContext(fiber) {
      pop(suspenseStackCursor);
      pop(suspenseHandlerStackCursor);
      shellBoundary === fiber && (shellBoundary = null);
    }
    function findFirstSuspended(row) {
      for (var node = row; null !== node; ) {
        if (13 === node.tag) {
          var state = node.memoizedState;
          if (null !== state && (state = state.dehydrated, null === state || isSuspenseInstancePending(state) || isSuspenseInstanceFallback(state)))
            return node;
        } else if (19 === node.tag && "independent" !== node.memoizedProps.revealOrder) {
          if (0 !== (node.flags & 128)) return node;
        } else if (null !== node.child) {
          node.child.return = node;
          node = node.child;
          continue;
        }
        if (node === row) break;
        for (; null === node.sibling; ) {
          if (null === node.return || node.return === row) return null;
          node = node.return;
        }
        node.sibling.return = node.return;
        node = node.sibling;
      }
      return null;
    }
    var renderLanes = 0;
    var currentlyRenderingFiber = null;
    var currentHook = null;
    var workInProgressHook = null;
    var didScheduleRenderPhaseUpdate = false;
    var didScheduleRenderPhaseUpdateDuringThisPass = false;
    var shouldDoubleInvokeUserFnsInHooksDEV = false;
    var localIdCounter = 0;
    var thenableIndexCounter = 0;
    var thenableState = null;
    var globalClientIdCounter = 0;
    function throwInvalidHookError() {
      throw Error(formatProdErrorMessage(321));
    }
    function areHookInputsEqual(nextDeps, prevDeps) {
      if (null === prevDeps) return false;
      for (var i = 0; i < prevDeps.length && i < nextDeps.length; i++)
        if (!objectIs(nextDeps[i], prevDeps[i])) return false;
      return true;
    }
    function renderWithHooks(current, workInProgress2, Component, props, secondArg, nextRenderLanes) {
      renderLanes = nextRenderLanes;
      currentlyRenderingFiber = workInProgress2;
      workInProgress2.memoizedState = null;
      workInProgress2.updateQueue = null;
      workInProgress2.lanes = 0;
      ReactSharedInternals.H = null === current || null === current.memoizedState ? HooksDispatcherOnMount : HooksDispatcherOnUpdate;
      shouldDoubleInvokeUserFnsInHooksDEV = false;
      nextRenderLanes = Component(props, secondArg);
      shouldDoubleInvokeUserFnsInHooksDEV = false;
      didScheduleRenderPhaseUpdateDuringThisPass && (nextRenderLanes = renderWithHooksAgain(
        workInProgress2,
        Component,
        props,
        secondArg
      ));
      finishRenderingHooks(current);
      return nextRenderLanes;
    }
    function finishRenderingHooks(current) {
      ReactSharedInternals.H = ContextOnlyDispatcher;
      var didRenderTooFewHooks = null !== currentHook && null !== currentHook.next;
      renderLanes = 0;
      workInProgressHook = currentHook = currentlyRenderingFiber = null;
      didScheduleRenderPhaseUpdate = false;
      thenableIndexCounter = 0;
      thenableState = null;
      if (didRenderTooFewHooks) throw Error(formatProdErrorMessage(300));
      null === current || didReceiveUpdate || (current = current.dependencies, null !== current && checkIfContextChanged(current) && (didReceiveUpdate = true));
    }
    function renderWithHooksAgain(workInProgress2, Component, props, secondArg) {
      currentlyRenderingFiber = workInProgress2;
      var numberOfReRenders = 0;
      do {
        didScheduleRenderPhaseUpdateDuringThisPass && (thenableState = null);
        thenableIndexCounter = 0;
        didScheduleRenderPhaseUpdateDuringThisPass = false;
        if (25 <= numberOfReRenders) throw Error(formatProdErrorMessage(301));
        numberOfReRenders += 1;
        workInProgressHook = currentHook = null;
        if (null != workInProgress2.updateQueue) {
          var children = workInProgress2.updateQueue;
          children.lastEffect = null;
          children.events = null;
          children.stores = null;
          null != children.memoCache && (children.memoCache.index = 0);
        }
        ReactSharedInternals.H = HooksDispatcherOnRerender;
        children = Component(props, secondArg);
      } while (didScheduleRenderPhaseUpdateDuringThisPass);
      return children;
    }
    function TransitionAwareHostComponent() {
      var dispatcher = ReactSharedInternals.H, maybeThenable = dispatcher.useState()[0];
      maybeThenable = "function" === typeof maybeThenable.then ? useThenable(maybeThenable) : maybeThenable;
      dispatcher = dispatcher.useState()[0];
      (null !== currentHook ? currentHook.memoizedState : null) !== dispatcher && (currentlyRenderingFiber.flags |= 1024);
      return maybeThenable;
    }
    function checkDidRenderIdHook() {
      var didRenderIdHook = 0 !== localIdCounter;
      localIdCounter = 0;
      return didRenderIdHook;
    }
    function bailoutHooks(current, workInProgress2, lanes) {
      workInProgress2.updateQueue = current.updateQueue;
      workInProgress2.flags &= -2053;
      current.lanes &= ~lanes;
    }
    function resetHooksOnUnwind(workInProgress2) {
      if (didScheduleRenderPhaseUpdate) {
        for (workInProgress2 = workInProgress2.memoizedState; null !== workInProgress2; ) {
          var queue = workInProgress2.queue;
          null !== queue && (queue.pending = null);
          workInProgress2 = workInProgress2.next;
        }
        didScheduleRenderPhaseUpdate = false;
      }
      renderLanes = 0;
      workInProgressHook = currentHook = currentlyRenderingFiber = null;
      didScheduleRenderPhaseUpdateDuringThisPass = false;
      thenableIndexCounter = localIdCounter = 0;
      thenableState = null;
    }
    function mountWorkInProgressHook() {
      var hook = {
        memoizedState: null,
        baseState: null,
        baseQueue: null,
        queue: null,
        next: null
      };
      null === workInProgressHook ? currentlyRenderingFiber.memoizedState = workInProgressHook = hook : workInProgressHook = workInProgressHook.next = hook;
      return workInProgressHook;
    }
    function updateWorkInProgressHook() {
      if (null === currentHook) {
        var nextCurrentHook = currentlyRenderingFiber.alternate;
        nextCurrentHook = null !== nextCurrentHook ? nextCurrentHook.memoizedState : null;
      } else nextCurrentHook = currentHook.next;
      var nextWorkInProgressHook = null === workInProgressHook ? currentlyRenderingFiber.memoizedState : workInProgressHook.next;
      if (null !== nextWorkInProgressHook)
        workInProgressHook = nextWorkInProgressHook, currentHook = nextCurrentHook;
      else {
        if (null === nextCurrentHook) {
          if (null === currentlyRenderingFiber.alternate)
            throw Error(formatProdErrorMessage(467));
          throw Error(formatProdErrorMessage(310));
        }
        currentHook = nextCurrentHook;
        nextCurrentHook = {
          memoizedState: currentHook.memoizedState,
          baseState: currentHook.baseState,
          baseQueue: currentHook.baseQueue,
          queue: currentHook.queue,
          next: null
        };
        null === workInProgressHook ? currentlyRenderingFiber.memoizedState = workInProgressHook = nextCurrentHook : workInProgressHook = workInProgressHook.next = nextCurrentHook;
      }
      return workInProgressHook;
    }
    function createFunctionComponentUpdateQueue() {
      return { lastEffect: null, events: null, stores: null, memoCache: null };
    }
    function useThenable(thenable) {
      var index2 = thenableIndexCounter;
      thenableIndexCounter += 1;
      null === thenableState && (thenableState = []);
      thenable = trackUsedThenable(thenableState, thenable, index2);
      index2 = currentlyRenderingFiber;
      null === (null === workInProgressHook ? index2.memoizedState : workInProgressHook.next) && (index2 = index2.alternate, ReactSharedInternals.H = null === index2 || null === index2.memoizedState ? HooksDispatcherOnMount : HooksDispatcherOnUpdate);
      return thenable;
    }
    function use(usable) {
      if (null !== usable && "object" === typeof usable) {
        if ("function" === typeof usable.then) return useThenable(usable);
        if (usable.$$typeof === REACT_RECOVERABLE_TYPE) return;
        if (usable.$$typeof === REACT_CONTEXT_TYPE) return readContext(usable);
      }
      throw Error(formatProdErrorMessage(438, String(usable)));
    }
    function useMemoCache(size) {
      var memoCache = null, updateQueue = currentlyRenderingFiber.updateQueue;
      null !== updateQueue && (memoCache = updateQueue.memoCache);
      if (null == memoCache) {
        var current = currentlyRenderingFiber.alternate;
        null !== current && (current = current.updateQueue, null !== current && (current = current.memoCache, null != current && (memoCache = {
          data: current.data.map(function(array) {
            return array.slice();
          }),
          index: 0
        })));
      }
      null == memoCache && (memoCache = { data: [], index: 0 });
      null === updateQueue && (updateQueue = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = updateQueue);
      updateQueue.memoCache = memoCache;
      updateQueue = memoCache.data[memoCache.index];
      if (void 0 === updateQueue)
        for (updateQueue = memoCache.data[memoCache.index] = Array(size), current = 0; current < size; current++)
          updateQueue[current] = REACT_MEMO_CACHE_SENTINEL;
      memoCache.index++;
      return updateQueue;
    }
    function basicStateReducer(state, action) {
      return "function" === typeof action ? action(state) : action;
    }
    function updateReducer(reducer) {
      var hook = updateWorkInProgressHook();
      return updateReducerImpl(hook, currentHook, reducer);
    }
    function updateReducerImpl(hook, current, reducer) {
      var queue = hook.queue;
      if (null === queue) throw Error(formatProdErrorMessage(311));
      queue.lastRenderedReducer = reducer;
      var baseQueue = hook.baseQueue, pendingQueue = queue.pending;
      if (null !== pendingQueue) {
        if (null !== baseQueue) {
          var baseFirst = baseQueue.next;
          baseQueue.next = pendingQueue.next;
          pendingQueue.next = baseFirst;
        }
        current.baseQueue = baseQueue = pendingQueue;
        queue.pending = null;
      }
      pendingQueue = hook.baseState;
      if (null === baseQueue) hook.memoizedState = pendingQueue;
      else {
        current = baseQueue.next;
        var newBaseQueueFirst = baseFirst = null, newBaseQueueLast = null, update = current, didReadFromEntangledAsyncAction$64 = false;
        do {
          var updateLane = update.lane & -536870913;
          if (updateLane !== update.lane ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes & updateLane) === updateLane) {
            var revertLane = update.revertLane;
            if (0 === revertLane)
              null !== newBaseQueueLast && (newBaseQueueLast = newBaseQueueLast.next = {
                lane: 0,
                revertLane: 0,
                gesture: null,
                action: update.action,
                hasEagerState: update.hasEagerState,
                eagerState: update.eagerState,
                next: null
              }), updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction$64 = true);
            else if ((renderLanes & revertLane) === revertLane) {
              update = update.next;
              revertLane === currentEntangledLane && (didReadFromEntangledAsyncAction$64 = true);
              continue;
            } else
              updateLane = {
                lane: 0,
                revertLane: update.revertLane,
                gesture: null,
                action: update.action,
                hasEagerState: update.hasEagerState,
                eagerState: update.eagerState,
                next: null
              }, null === newBaseQueueLast ? (newBaseQueueFirst = newBaseQueueLast = updateLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = updateLane, currentlyRenderingFiber.lanes |= revertLane, workInProgressRootSkippedLanes |= revertLane;
            updateLane = update.action;
            shouldDoubleInvokeUserFnsInHooksDEV && reducer(pendingQueue, updateLane);
            pendingQueue = update.hasEagerState ? update.eagerState : reducer(pendingQueue, updateLane);
          } else
            revertLane = {
              lane: updateLane,
              revertLane: update.revertLane,
              gesture: update.gesture,
              action: update.action,
              hasEagerState: update.hasEagerState,
              eagerState: update.eagerState,
              next: null
            }, null === newBaseQueueLast ? (newBaseQueueFirst = newBaseQueueLast = revertLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = revertLane, currentlyRenderingFiber.lanes |= updateLane, workInProgressRootSkippedLanes |= updateLane;
          update = update.next;
        } while (null !== update && update !== current);
        null === newBaseQueueLast ? baseFirst = pendingQueue : newBaseQueueLast.next = newBaseQueueFirst;
        if (!objectIs(pendingQueue, hook.memoizedState) && (didReceiveUpdate = true, didReadFromEntangledAsyncAction$64 && (reducer = currentEntangledActionThenable, null !== reducer)))
          throw reducer;
        hook.memoizedState = pendingQueue;
        hook.baseState = baseFirst;
        hook.baseQueue = newBaseQueueLast;
        queue.lastRenderedState = pendingQueue;
      }
      null === baseQueue && (queue.lanes = 0);
      return [hook.memoizedState, queue.dispatch];
    }
    function rerenderReducer(reducer) {
      var hook = updateWorkInProgressHook(), queue = hook.queue;
      if (null === queue) throw Error(formatProdErrorMessage(311));
      queue.lastRenderedReducer = reducer;
      var dispatch = queue.dispatch, lastRenderPhaseUpdate = queue.pending, newState = hook.memoizedState;
      if (null !== lastRenderPhaseUpdate) {
        queue.pending = null;
        var update = lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
        do
          newState = reducer(newState, update.action), update = update.next;
        while (update !== lastRenderPhaseUpdate);
        objectIs(newState, hook.memoizedState) || (didReceiveUpdate = true);
        hook.memoizedState = newState;
        null === hook.baseQueue && (hook.baseState = newState);
        queue.lastRenderedState = newState;
      }
      return [newState, dispatch];
    }
    function updateSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
      var fiber = currentlyRenderingFiber, hook = updateWorkInProgressHook(), isHydrating$jscomp$0 = isHydrating;
      if (isHydrating$jscomp$0) {
        if (void 0 === getServerSnapshot) throw Error(formatProdErrorMessage(407));
        getServerSnapshot = getServerSnapshot();
      } else getServerSnapshot = getSnapshot();
      var snapshotChanged = !objectIs(
        (currentHook || hook).memoizedState,
        getServerSnapshot
      );
      snapshotChanged && (hook.memoizedState = getServerSnapshot, didReceiveUpdate = true);
      hook = hook.queue;
      updateEffect(subscribeToStore.bind(null, fiber, hook, subscribe), [
        subscribe
      ]);
      subscribe = hook.getSnapshot !== getSnapshot || snapshotChanged || null !== workInProgressHook && 0 !== (workInProgressHook.memoizedState.tag & 1);
      pushSimpleEffect(
        subscribe ? 9 : 8,
        { destroy: void 0 },
        updateStoreInstance.bind(null, fiber, hook, getServerSnapshot, getSnapshot),
        null
      );
      if (subscribe) {
        fiber.flags |= 2048;
        if (null === workInProgressRoot) throw Error(formatProdErrorMessage(349));
        isHydrating$jscomp$0 || 0 !== (renderLanes & 127) || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
      }
      return getServerSnapshot;
    }
    function pushStoreConsistencyCheck(fiber, getSnapshot, renderedSnapshot) {
      fiber.flags |= 16384;
      fiber = { getSnapshot, value: renderedSnapshot };
      getSnapshot = currentlyRenderingFiber.updateQueue;
      null === getSnapshot ? (getSnapshot = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = getSnapshot, getSnapshot.stores = [fiber]) : (renderedSnapshot = getSnapshot.stores, null === renderedSnapshot ? getSnapshot.stores = [fiber] : renderedSnapshot.push(fiber));
    }
    function updateStoreInstance(fiber, inst, nextSnapshot, getSnapshot) {
      inst.value = nextSnapshot;
      inst.getSnapshot = getSnapshot;
      checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
    }
    function subscribeToStore(fiber, inst, subscribe) {
      return subscribe(function() {
        checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
      });
    }
    function checkIfSnapshotChanged(inst) {
      var latestGetSnapshot = inst.getSnapshot;
      inst = inst.value;
      try {
        var nextValue = latestGetSnapshot();
        return !objectIs(inst, nextValue);
      } catch (error) {
        return true;
      }
    }
    function forceStoreRerender(fiber) {
      var root2 = enqueueConcurrentRenderForLane(fiber, 2);
      null !== root2 && scheduleUpdateOnFiber(root2, fiber, 2);
    }
    function mountStateImpl(initialState) {
      var hook = mountWorkInProgressHook();
      if ("function" === typeof initialState) {
        var initialStateInitializer = initialState;
        initialState = initialStateInitializer();
        if (shouldDoubleInvokeUserFnsInHooksDEV) {
          setIsStrictModeForDevtools(true);
          try {
            initialStateInitializer();
          } finally {
            setIsStrictModeForDevtools(false);
          }
        }
      }
      hook.memoizedState = hook.baseState = initialState;
      hook.queue = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: basicStateReducer,
        lastRenderedState: initialState
      };
      return hook;
    }
    function updateOptimisticImpl(hook, current, passthrough, reducer) {
      hook.baseState = passthrough;
      return updateReducerImpl(
        hook,
        currentHook,
        "function" === typeof reducer ? reducer : basicStateReducer
      );
    }
    function dispatchActionState(fiber, actionQueue, setPendingState, setState, payload) {
      if (isRenderPhaseUpdate(fiber)) throw Error(formatProdErrorMessage(485));
      fiber = actionQueue.action;
      if (null !== fiber) {
        var actionNode = {
          payload,
          action: fiber,
          next: null,
          isTransition: true,
          status: "pending",
          value: null,
          reason: null,
          listeners: [],
          then: function(listener) {
            actionNode.listeners.push(listener);
          }
        };
        null !== ReactSharedInternals.T ? setPendingState(true) : actionNode.isTransition = false;
        setState(actionNode);
        setPendingState = actionQueue.pending;
        null === setPendingState ? (actionNode.next = actionQueue.pending = actionNode, runActionStateAction(actionQueue, actionNode)) : (actionNode.next = setPendingState.next, actionQueue.pending = setPendingState.next = actionNode);
      }
    }
    function runActionStateAction(actionQueue, node) {
      var action = node.action, payload = node.payload, prevState = actionQueue.state;
      if (node.isTransition) {
        var prevTransition = ReactSharedInternals.T, currentTransition = {};
        currentTransition.types = null !== prevTransition ? prevTransition.types : null;
        ReactSharedInternals.T = currentTransition;
        try {
          var returnValue = action(prevState, payload), onStartTransitionFinish = ReactSharedInternals.S;
          null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
          handleActionReturnValue(actionQueue, node, returnValue);
        } catch (error) {
          onActionError(actionQueue, node, error);
        } finally {
          null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
        }
      } else
        try {
          prevTransition = action(prevState, payload), handleActionReturnValue(actionQueue, node, prevTransition);
        } catch (error$70) {
          onActionError(actionQueue, node, error$70);
        }
    }
    function handleActionReturnValue(actionQueue, node, returnValue) {
      null !== returnValue && "object" === typeof returnValue && "function" === typeof returnValue.then ? returnValue.then(
        function(nextState) {
          onActionSuccess(actionQueue, node, nextState);
        },
        function(error) {
          return onActionError(actionQueue, node, error);
        }
      ) : onActionSuccess(actionQueue, node, returnValue);
    }
    function onActionSuccess(actionQueue, actionNode, nextState) {
      actionNode.status = "fulfilled";
      actionNode.value = nextState;
      notifyActionListeners(actionNode);
      actionQueue.state = nextState;
      actionNode = actionQueue.pending;
      null !== actionNode && (nextState = actionNode.next, nextState === actionNode ? actionQueue.pending = null : (nextState = nextState.next, actionNode.next = nextState, runActionStateAction(actionQueue, nextState)));
    }
    function onActionError(actionQueue, actionNode, error) {
      var last = actionQueue.pending;
      actionQueue.pending = null;
      if (null !== last) {
        last = last.next;
        do
          actionNode.status = "rejected", actionNode.reason = error, notifyActionListeners(actionNode), actionNode = actionNode.next;
        while (actionNode !== last);
      }
      actionQueue.action = null;
    }
    function notifyActionListeners(actionNode) {
      actionNode = actionNode.listeners;
      for (var i = 0; i < actionNode.length; i++) (0, actionNode[i])();
    }
    function actionStateReducer(oldState, newState) {
      return newState;
    }
    function mountActionState(action, initialStateProp) {
      if (isHydrating) {
        var ssrFormState = workInProgressRoot.formState;
        if (null !== ssrFormState) {
          a: {
            var JSCompiler_inline_result = currentlyRenderingFiber;
            if (isHydrating) {
              if (nextHydratableInstance) {
                b: {
                  var JSCompiler_inline_result$jscomp$0 = nextHydratableInstance;
                  for (var inRootOrSingleton = rootOrSingletonContext; 8 !== JSCompiler_inline_result$jscomp$0.nodeType; ) {
                    if (!inRootOrSingleton) {
                      JSCompiler_inline_result$jscomp$0 = null;
                      break b;
                    }
                    JSCompiler_inline_result$jscomp$0 = getNextHydratable(
                      JSCompiler_inline_result$jscomp$0.nextSibling
                    );
                    if (null === JSCompiler_inline_result$jscomp$0) {
                      JSCompiler_inline_result$jscomp$0 = null;
                      break b;
                    }
                  }
                  inRootOrSingleton = JSCompiler_inline_result$jscomp$0.data;
                  JSCompiler_inline_result$jscomp$0 = "F!" === inRootOrSingleton || "F" === inRootOrSingleton ? JSCompiler_inline_result$jscomp$0 : null;
                }
                if (JSCompiler_inline_result$jscomp$0) {
                  nextHydratableInstance = getNextHydratable(
                    JSCompiler_inline_result$jscomp$0.nextSibling
                  );
                  JSCompiler_inline_result = "F!" === JSCompiler_inline_result$jscomp$0.data;
                  break a;
                }
              }
              throwOnHydrationMismatch(JSCompiler_inline_result);
            }
            JSCompiler_inline_result = false;
          }
          JSCompiler_inline_result && (initialStateProp = ssrFormState[0]);
        }
      }
      ssrFormState = mountWorkInProgressHook();
      ssrFormState.memoizedState = ssrFormState.baseState = initialStateProp;
      JSCompiler_inline_result = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: actionStateReducer,
        lastRenderedState: initialStateProp
      };
      ssrFormState.queue = JSCompiler_inline_result;
      ssrFormState = dispatchSetState.bind(
        null,
        currentlyRenderingFiber,
        JSCompiler_inline_result
      );
      JSCompiler_inline_result.dispatch = ssrFormState;
      JSCompiler_inline_result = mountStateImpl(false);
      inRootOrSingleton = dispatchOptimisticSetState.bind(
        null,
        currentlyRenderingFiber,
        false,
        JSCompiler_inline_result.queue
      );
      JSCompiler_inline_result = mountWorkInProgressHook();
      JSCompiler_inline_result$jscomp$0 = {
        state: initialStateProp,
        dispatch: null,
        action,
        pending: null
      };
      JSCompiler_inline_result.queue = JSCompiler_inline_result$jscomp$0;
      ssrFormState = dispatchActionState.bind(
        null,
        currentlyRenderingFiber,
        JSCompiler_inline_result$jscomp$0,
        inRootOrSingleton,
        ssrFormState
      );
      JSCompiler_inline_result$jscomp$0.dispatch = ssrFormState;
      JSCompiler_inline_result.memoizedState = action;
      return [initialStateProp, ssrFormState, false];
    }
    function updateActionState(action) {
      var stateHook = updateWorkInProgressHook();
      return updateActionStateImpl(stateHook, currentHook, action);
    }
    function updateActionStateImpl(stateHook, currentStateHook, action) {
      currentStateHook = updateReducerImpl(
        stateHook,
        currentStateHook,
        actionStateReducer
      )[0];
      stateHook = updateReducer(basicStateReducer)[0];
      if ("object" === typeof currentStateHook && null !== currentStateHook && "function" === typeof currentStateHook.then)
        try {
          var state = useThenable(currentStateHook);
        } catch (x) {
          if (x === SuspenseException) throw SuspenseActionException;
          throw x;
        }
      else state = currentStateHook;
      currentStateHook = updateWorkInProgressHook();
      var actionQueue = currentStateHook.queue, dispatch = actionQueue.dispatch;
      action !== currentStateHook.memoizedState && (currentlyRenderingFiber.flags |= 2048, pushSimpleEffect(
        9,
        { destroy: void 0 },
        actionStateActionEffect.bind(null, actionQueue, action),
        null
      ));
      return [state, dispatch, stateHook];
    }
    function actionStateActionEffect(actionQueue, action) {
      actionQueue.action = action;
    }
    function rerenderActionState(action) {
      var stateHook = updateWorkInProgressHook(), currentStateHook = currentHook;
      if (null !== currentStateHook)
        return updateActionStateImpl(stateHook, currentStateHook, action);
      updateWorkInProgressHook();
      stateHook = stateHook.memoizedState;
      currentStateHook = updateWorkInProgressHook();
      var dispatch = currentStateHook.queue.dispatch;
      currentStateHook.memoizedState = action;
      return [stateHook, dispatch, false];
    }
    function pushSimpleEffect(tag, inst, create, deps) {
      tag = { tag, create, deps, inst, next: null };
      inst = currentlyRenderingFiber.updateQueue;
      null === inst && (inst = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = inst);
      create = inst.lastEffect;
      null === create ? inst.lastEffect = tag.next = tag : (deps = create.next, create.next = tag, tag.next = deps, inst.lastEffect = tag);
      return tag;
    }
    function updateRef() {
      return updateWorkInProgressHook().memoizedState;
    }
    function mountEffectImpl(fiberFlags, hookFlags, create, deps) {
      var hook = mountWorkInProgressHook();
      currentlyRenderingFiber.flags |= fiberFlags;
      hook.memoizedState = pushSimpleEffect(
        1 | hookFlags,
        { destroy: void 0 },
        create,
        void 0 === deps ? null : deps
      );
    }
    function updateEffectImpl(fiberFlags, hookFlags, create, deps) {
      var hook = updateWorkInProgressHook();
      deps = void 0 === deps ? null : deps;
      var inst = hook.memoizedState.inst;
      null !== currentHook && null !== deps && areHookInputsEqual(deps, currentHook.memoizedState.deps) ? hook.memoizedState = pushSimpleEffect(hookFlags, inst, create, deps) : (currentlyRenderingFiber.flags |= fiberFlags, hook.memoizedState = pushSimpleEffect(
        1 | hookFlags,
        inst,
        create,
        deps
      ));
    }
    function mountEffect(create, deps) {
      mountEffectImpl(8390656, 8, create, deps);
    }
    function updateEffect(create, deps) {
      updateEffectImpl(2048, 8, create, deps);
    }
    function useEffectEventImpl(payload) {
      currentlyRenderingFiber.flags |= 4;
      var componentUpdateQueue = currentlyRenderingFiber.updateQueue;
      if (null === componentUpdateQueue)
        componentUpdateQueue = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = componentUpdateQueue, componentUpdateQueue.events = [payload];
      else {
        var events = componentUpdateQueue.events;
        null === events ? componentUpdateQueue.events = [payload] : events.push(payload);
      }
    }
    function updateEvent(callback) {
      var ref = updateWorkInProgressHook().memoizedState;
      useEffectEventImpl({ ref, nextImpl: callback });
      return function() {
        if (0 !== (executionContext & 2)) throw Error(formatProdErrorMessage(440));
        return ref.impl.apply(void 0, arguments);
      };
    }
    function updateInsertionEffect(create, deps) {
      return updateEffectImpl(4, 2, create, deps);
    }
    function updateLayoutEffect(create, deps) {
      return updateEffectImpl(4, 4, create, deps);
    }
    function imperativeHandleEffect(create, ref) {
      if ("function" === typeof ref) {
        create = create();
        var refCleanup = ref(create);
        return function() {
          "function" === typeof refCleanup ? refCleanup() : ref(null);
        };
      }
      if (null !== ref && void 0 !== ref)
        return create = create(), ref.current = create, function() {
          ref.current = null;
        };
    }
    function updateImperativeHandle(ref, create, deps) {
      deps = null !== deps && void 0 !== deps ? deps.concat([ref]) : null;
      updateEffectImpl(4, 4, imperativeHandleEffect.bind(null, create, ref), deps);
    }
    function mountDebugValue() {
    }
    function updateCallback(callback, deps) {
      var hook = updateWorkInProgressHook();
      deps = void 0 === deps ? null : deps;
      var prevState = hook.memoizedState;
      if (null !== deps && areHookInputsEqual(deps, prevState[1]))
        return prevState[0];
      hook.memoizedState = [callback, deps];
      return callback;
    }
    function updateMemo(nextCreate, deps) {
      var hook = updateWorkInProgressHook();
      deps = void 0 === deps ? null : deps;
      var prevState = hook.memoizedState;
      if (null !== deps && areHookInputsEqual(deps, prevState[1]))
        return prevState[0];
      prevState = nextCreate();
      if (shouldDoubleInvokeUserFnsInHooksDEV) {
        setIsStrictModeForDevtools(true);
        try {
          nextCreate();
        } finally {
          setIsStrictModeForDevtools(false);
        }
      }
      hook.memoizedState = [prevState, deps];
      return prevState;
    }
    function mountDeferredValueImpl(hook, value, initialValue) {
      if (void 0 === initialValue || 0 !== (renderLanes & 1073741824) && 0 === (workInProgressRootRenderLanes & 261930))
        return hook.memoizedState = value;
      hook.memoizedState = initialValue;
      hook = requestDeferredLane();
      currentlyRenderingFiber.lanes |= hook;
      workInProgressRootSkippedLanes |= hook;
      return initialValue;
    }
    function updateDeferredValueImpl(hook, prevValue, value, initialValue) {
      if (objectIs(value, prevValue)) return value;
      if (null !== currentTreeHiddenStackCursor.current)
        return hook = mountDeferredValueImpl(hook, value, initialValue), objectIs(hook, prevValue) || (didReceiveUpdate = true), hook;
      if (0 === (renderLanes & 106) || 0 !== (renderLanes & 1073741824) && 0 === (workInProgressRootRenderLanes & 261930))
        return didReceiveUpdate = true, hook.memoizedState = value;
      hook = requestDeferredLane();
      currentlyRenderingFiber.lanes |= hook;
      workInProgressRootSkippedLanes |= hook;
      return prevValue;
    }
    function startTransition(fiber, queue, pendingState, finishedState, callback) {
      var previousPriority = ReactDOMSharedInternals.p;
      ReactDOMSharedInternals.p = 0 !== previousPriority && 8 > previousPriority ? previousPriority : 8;
      var prevTransition = ReactSharedInternals.T, currentTransition = {};
      currentTransition.types = null !== prevTransition ? prevTransition.types : null;
      ReactSharedInternals.T = currentTransition;
      dispatchOptimisticSetState(fiber, false, queue, pendingState);
      try {
        var returnValue = callback(), onStartTransitionFinish = ReactSharedInternals.S;
        null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
        if (null !== returnValue && "object" === typeof returnValue && "function" === typeof returnValue.then) {
          var thenableForFinishedState = chainThenableValue(
            returnValue,
            finishedState
          );
          dispatchSetStateInternal(
            fiber,
            queue,
            thenableForFinishedState,
            requestUpdateLane(fiber)
          );
        } else
          dispatchSetStateInternal(
            fiber,
            queue,
            finishedState,
            requestUpdateLane(fiber)
          );
      } catch (error) {
        dispatchSetStateInternal(
          fiber,
          queue,
          { then: function() {
          }, status: "rejected", reason: error },
          requestUpdateLane()
        );
      } finally {
        ReactDOMSharedInternals.p = previousPriority, null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
      }
    }
    function noop() {
    }
    function startHostTransition(formFiber, pendingState, action, formData) {
      if (5 !== formFiber.tag) throw Error(formatProdErrorMessage(476));
      var queue = ensureFormComponentIsStateful(formFiber).queue;
      startTransition(
        formFiber,
        queue,
        pendingState,
        sharedNotPendingObject,
        null === action ? noop : function() {
          requestFormReset$1(formFiber);
          return action(formData);
        }
      );
    }
    function ensureFormComponentIsStateful(formFiber) {
      var existingStateHook = formFiber.memoizedState;
      if (null !== existingStateHook) return existingStateHook;
      existingStateHook = {
        memoizedState: sharedNotPendingObject,
        baseState: sharedNotPendingObject,
        baseQueue: null,
        queue: {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: basicStateReducer,
          lastRenderedState: sharedNotPendingObject
        },
        next: null
      };
      var initialResetState = {};
      existingStateHook.next = {
        memoizedState: initialResetState,
        baseState: initialResetState,
        baseQueue: null,
        queue: {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: basicStateReducer,
          lastRenderedState: initialResetState
        },
        next: null
      };
      formFiber.memoizedState = existingStateHook;
      formFiber = formFiber.alternate;
      null !== formFiber && (formFiber.memoizedState = existingStateHook);
      return existingStateHook;
    }
    function requestFormReset$1(formFiber) {
      var stateHook = ensureFormComponentIsStateful(formFiber);
      null === stateHook.next && (stateHook = formFiber.alternate.memoizedState);
      dispatchSetStateInternal(
        formFiber,
        stateHook.next.queue,
        {},
        requestUpdateLane()
      );
    }
    function useHostTransitionStatus() {
      return readContext(HostTransitionContext);
    }
    function updateId() {
      return updateWorkInProgressHook().memoizedState;
    }
    function updateRefresh() {
      return updateWorkInProgressHook().memoizedState;
    }
    function refreshCache(fiber) {
      for (var provider = fiber.return; null !== provider; ) {
        switch (provider.tag) {
          case 24:
          case 3:
            var lane = requestUpdateLane();
            fiber = createUpdate(lane);
            var root$73 = enqueueUpdate(provider, fiber, lane);
            null !== root$73 && (scheduleUpdateOnFiber(root$73, provider, lane), entangleTransitions(root$73, provider, lane));
            provider = { cache: createCache() };
            fiber.payload = provider;
            return;
        }
        provider = provider.return;
      }
    }
    function dispatchReducerAction(fiber, queue, action) {
      var lane = requestUpdateLane();
      action = {
        lane,
        revertLane: 0,
        gesture: null,
        action,
        hasEagerState: false,
        eagerState: null,
        next: null
      };
      isRenderPhaseUpdate(fiber) ? enqueueRenderPhaseUpdate(queue, action) : (action = enqueueConcurrentHookUpdate(fiber, queue, action, lane), null !== action && (scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane)));
    }
    function dispatchSetState(fiber, queue, action) {
      var lane = requestUpdateLane();
      dispatchSetStateInternal(fiber, queue, action, lane);
    }
    function dispatchSetStateInternal(fiber, queue, action, lane) {
      var update = {
        lane,
        revertLane: 0,
        gesture: null,
        action,
        hasEagerState: false,
        eagerState: null,
        next: null
      };
      if (isRenderPhaseUpdate(fiber)) enqueueRenderPhaseUpdate(queue, update);
      else {
        var alternate = fiber.alternate;
        if (0 === fiber.lanes && (null === alternate || 0 === alternate.lanes) && (alternate = queue.lastRenderedReducer, null !== alternate))
          try {
            var currentState = queue.lastRenderedState, eagerState = alternate(currentState, action);
            update.hasEagerState = true;
            update.eagerState = eagerState;
            if (objectIs(eagerState, currentState))
              return enqueueUpdate$1(fiber, queue, update, 0), null === workInProgressRoot && finishQueueingConcurrentUpdates(), false;
          } catch (error) {
          } finally {
          }
        action = enqueueConcurrentHookUpdate(fiber, queue, update, lane);
        if (null !== action)
          return scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane), true;
      }
      return false;
    }
    function dispatchOptimisticSetState(fiber, throwIfDuringRender, queue, action) {
      action = {
        lane: 2,
        revertLane: requestTransitionLane(),
        gesture: null,
        action,
        hasEagerState: false,
        eagerState: null,
        next: null
      };
      if (isRenderPhaseUpdate(fiber)) {
        if (throwIfDuringRender) throw Error(formatProdErrorMessage(479));
      } else
        throwIfDuringRender = enqueueConcurrentHookUpdate(
          fiber,
          queue,
          action,
          2
        ), null !== throwIfDuringRender && scheduleUpdateOnFiber(throwIfDuringRender, fiber, 2);
    }
    function isRenderPhaseUpdate(fiber) {
      var alternate = fiber.alternate;
      return fiber === currentlyRenderingFiber || null !== alternate && alternate === currentlyRenderingFiber;
    }
    function enqueueRenderPhaseUpdate(queue, update) {
      didScheduleRenderPhaseUpdateDuringThisPass = didScheduleRenderPhaseUpdate = true;
      var pending = queue.pending;
      null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
      queue.pending = update;
    }
    function entangleTransitionUpdate(root2, queue, lane) {
      if (0 !== (lane & 4194048)) {
        var queueLanes = queue.lanes;
        queueLanes &= root2.pendingLanes;
        lane |= queueLanes;
        queue.lanes = lane;
        markRootEntangled(root2, lane);
      }
    }
    var ContextOnlyDispatcher = {
      readContext,
      use,
      useCallback: throwInvalidHookError,
      useContext: throwInvalidHookError,
      useEffect: throwInvalidHookError,
      useImperativeHandle: throwInvalidHookError,
      useLayoutEffect: throwInvalidHookError,
      useInsertionEffect: throwInvalidHookError,
      useMemo: throwInvalidHookError,
      useReducer: throwInvalidHookError,
      useRef: throwInvalidHookError,
      useState: throwInvalidHookError,
      useDebugValue: throwInvalidHookError,
      useDeferredValue: throwInvalidHookError,
      useTransition: throwInvalidHookError,
      useSyncExternalStore: throwInvalidHookError,
      useId: throwInvalidHookError,
      useHostTransitionStatus: throwInvalidHookError,
      useFormState: throwInvalidHookError,
      useActionState: throwInvalidHookError,
      useOptimistic: throwInvalidHookError,
      useMemoCache: throwInvalidHookError,
      useCacheRefresh: throwInvalidHookError,
      useEffectEvent: throwInvalidHookError
    };
    var HooksDispatcherOnMount = {
      readContext,
      use,
      useCallback: function(callback, deps) {
        mountWorkInProgressHook().memoizedState = [
          callback,
          void 0 === deps ? null : deps
        ];
        return callback;
      },
      useContext: readContext,
      useEffect: mountEffect,
      useImperativeHandle: function(ref, create, deps) {
        deps = null !== deps && void 0 !== deps ? deps.concat([ref]) : null;
        mountEffectImpl(
          4194308,
          4,
          imperativeHandleEffect.bind(null, create, ref),
          deps
        );
      },
      useLayoutEffect: function(create, deps) {
        return mountEffectImpl(4194308, 4, create, deps);
      },
      useInsertionEffect: function(create, deps) {
        mountEffectImpl(4, 2, create, deps);
      },
      useMemo: function(nextCreate, deps) {
        var hook = mountWorkInProgressHook();
        deps = void 0 === deps ? null : deps;
        var nextValue = nextCreate();
        if (shouldDoubleInvokeUserFnsInHooksDEV) {
          setIsStrictModeForDevtools(true);
          try {
            nextCreate();
          } finally {
            setIsStrictModeForDevtools(false);
          }
        }
        hook.memoizedState = [nextValue, deps];
        return nextValue;
      },
      useReducer: function(reducer, initialArg, init) {
        var hook = mountWorkInProgressHook();
        if (void 0 !== init) {
          var initialState = init(initialArg);
          if (shouldDoubleInvokeUserFnsInHooksDEV) {
            setIsStrictModeForDevtools(true);
            try {
              init(initialArg);
            } finally {
              setIsStrictModeForDevtools(false);
            }
          }
        } else initialState = initialArg;
        hook.memoizedState = hook.baseState = initialState;
        reducer = {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: reducer,
          lastRenderedState: initialState
        };
        hook.queue = reducer;
        reducer = reducer.dispatch = dispatchReducerAction.bind(
          null,
          currentlyRenderingFiber,
          reducer
        );
        return [hook.memoizedState, reducer];
      },
      useRef: function(initialValue) {
        var hook = mountWorkInProgressHook();
        initialValue = { current: initialValue };
        return hook.memoizedState = initialValue;
      },
      useState: function(initialState) {
        initialState = mountStateImpl(initialState);
        var queue = initialState.queue, dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
        queue.dispatch = dispatch;
        return [initialState.memoizedState, dispatch];
      },
      useDebugValue: mountDebugValue,
      useDeferredValue: function(value, initialValue) {
        var hook = mountWorkInProgressHook();
        return mountDeferredValueImpl(hook, value, initialValue);
      },
      useTransition: function() {
        var stateHook = mountStateImpl(false);
        stateHook = startTransition.bind(
          null,
          currentlyRenderingFiber,
          stateHook.queue,
          true,
          false
        );
        mountWorkInProgressHook().memoizedState = stateHook;
        return [false, stateHook];
      },
      useSyncExternalStore: function(subscribe, getSnapshot, getServerSnapshot) {
        var fiber = currentlyRenderingFiber, hook = mountWorkInProgressHook();
        if (isHydrating) {
          if (void 0 === getServerSnapshot)
            throw Error(formatProdErrorMessage(407));
          getServerSnapshot = getServerSnapshot();
        } else {
          getServerSnapshot = getSnapshot();
          if (null === workInProgressRoot)
            throw Error(formatProdErrorMessage(349));
          0 !== (workInProgressRootRenderLanes & 127) || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
        }
        hook.memoizedState = getServerSnapshot;
        var inst = { value: getServerSnapshot, getSnapshot };
        hook.queue = inst;
        mountEffect(subscribeToStore.bind(null, fiber, inst, subscribe), [
          subscribe
        ]);
        fiber.flags |= 2048;
        pushSimpleEffect(
          9,
          { destroy: void 0 },
          updateStoreInstance.bind(
            null,
            fiber,
            inst,
            getServerSnapshot,
            getSnapshot
          ),
          null
        );
        return getServerSnapshot;
      },
      useId: function() {
        var hook = mountWorkInProgressHook(), identifierPrefix = workInProgressRoot.identifierPrefix;
        if (isHydrating) {
          var JSCompiler_inline_result = treeContextOverflow;
          var idWithLeadingBit = treeContextId;
          JSCompiler_inline_result = (idWithLeadingBit & ~(1 << 32 - clz32(idWithLeadingBit) - 1)).toString(32) + JSCompiler_inline_result;
          identifierPrefix = "_" + identifierPrefix + "R_" + JSCompiler_inline_result;
          JSCompiler_inline_result = localIdCounter++;
          0 < JSCompiler_inline_result && (identifierPrefix += "H" + JSCompiler_inline_result.toString(32));
          identifierPrefix += "_";
        } else
          JSCompiler_inline_result = globalClientIdCounter++, identifierPrefix = "_" + identifierPrefix + "r_" + JSCompiler_inline_result.toString(32) + "_";
        return hook.memoizedState = identifierPrefix;
      },
      useHostTransitionStatus,
      useFormState: mountActionState,
      useActionState: mountActionState,
      useOptimistic: function(passthrough) {
        var hook = mountWorkInProgressHook();
        hook.memoizedState = hook.baseState = passthrough;
        var queue = {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: null,
          lastRenderedState: null
        };
        hook.queue = queue;
        hook = dispatchOptimisticSetState.bind(
          null,
          currentlyRenderingFiber,
          true,
          queue
        );
        queue.dispatch = hook;
        return [passthrough, hook];
      },
      useMemoCache,
      useCacheRefresh: function() {
        return mountWorkInProgressHook().memoizedState = refreshCache.bind(
          null,
          currentlyRenderingFiber
        );
      },
      useEffectEvent: function(callback) {
        var hook = mountWorkInProgressHook(), ref = { impl: callback };
        hook.memoizedState = ref;
        return function() {
          if (0 !== (executionContext & 2))
            throw Error(formatProdErrorMessage(440));
          return ref.impl.apply(void 0, arguments);
        };
      }
    };
    var HooksDispatcherOnUpdate = {
      readContext,
      use,
      useCallback: updateCallback,
      useContext: readContext,
      useEffect: updateEffect,
      useImperativeHandle: updateImperativeHandle,
      useInsertionEffect: updateInsertionEffect,
      useLayoutEffect: updateLayoutEffect,
      useMemo: updateMemo,
      useReducer: updateReducer,
      useRef: updateRef,
      useState: function() {
        return updateReducer(basicStateReducer);
      },
      useDebugValue: mountDebugValue,
      useDeferredValue: function(value, initialValue) {
        var hook = updateWorkInProgressHook();
        return updateDeferredValueImpl(
          hook,
          currentHook.memoizedState,
          value,
          initialValue
        );
      },
      useTransition: function() {
        var booleanOrThenable = updateReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
        return [
          "boolean" === typeof booleanOrThenable ? booleanOrThenable : useThenable(booleanOrThenable),
          start
        ];
      },
      useSyncExternalStore: updateSyncExternalStore,
      useId: updateId,
      useHostTransitionStatus,
      useFormState: updateActionState,
      useActionState: updateActionState,
      useOptimistic: function(passthrough, reducer) {
        var hook = updateWorkInProgressHook();
        return updateOptimisticImpl(hook, currentHook, passthrough, reducer);
      },
      useMemoCache,
      useCacheRefresh: updateRefresh,
      useEffectEvent: updateEvent
    };
    var HooksDispatcherOnRerender = {
      readContext,
      use,
      useCallback: updateCallback,
      useContext: readContext,
      useEffect: updateEffect,
      useImperativeHandle: updateImperativeHandle,
      useInsertionEffect: updateInsertionEffect,
      useLayoutEffect: updateLayoutEffect,
      useMemo: updateMemo,
      useReducer: rerenderReducer,
      useRef: updateRef,
      useState: function() {
        return rerenderReducer(basicStateReducer);
      },
      useDebugValue: mountDebugValue,
      useDeferredValue: function(value, initialValue) {
        var hook = updateWorkInProgressHook();
        return null === currentHook ? mountDeferredValueImpl(hook, value, initialValue) : updateDeferredValueImpl(
          hook,
          currentHook.memoizedState,
          value,
          initialValue
        );
      },
      useTransition: function() {
        var booleanOrThenable = rerenderReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
        return [
          "boolean" === typeof booleanOrThenable ? booleanOrThenable : useThenable(booleanOrThenable),
          start
        ];
      },
      useSyncExternalStore: updateSyncExternalStore,
      useId: updateId,
      useHostTransitionStatus,
      useFormState: rerenderActionState,
      useActionState: rerenderActionState,
      useOptimistic: function(passthrough, reducer) {
        var hook = updateWorkInProgressHook();
        if (null !== currentHook)
          return updateOptimisticImpl(hook, currentHook, passthrough, reducer);
        hook.baseState = passthrough;
        return [passthrough, hook.queue.dispatch];
      },
      useMemoCache,
      useCacheRefresh: updateRefresh,
      useEffectEvent: updateEvent
    };
    function applyDerivedStateFromProps(workInProgress2, ctor, getDerivedStateFromProps, nextProps) {
      ctor = workInProgress2.memoizedState;
      getDerivedStateFromProps = getDerivedStateFromProps(nextProps, ctor);
      getDerivedStateFromProps = null === getDerivedStateFromProps || void 0 === getDerivedStateFromProps ? ctor : assign({}, ctor, getDerivedStateFromProps);
      workInProgress2.memoizedState = getDerivedStateFromProps;
      0 === workInProgress2.lanes && (workInProgress2.updateQueue.baseState = getDerivedStateFromProps);
    }
    var classComponentUpdater = {
      enqueueSetState: function(inst, payload, callback) {
        inst = inst._reactInternals;
        var lane = requestUpdateLane(), update = createUpdate(lane);
        update.payload = payload;
        void 0 !== callback && null !== callback && (update.callback = callback);
        payload = enqueueUpdate(inst, update, lane);
        null !== payload && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
      },
      enqueueReplaceState: function(inst, payload, callback) {
        inst = inst._reactInternals;
        var lane = requestUpdateLane(), update = createUpdate(lane);
        update.tag = 1;
        update.payload = payload;
        void 0 !== callback && null !== callback && (update.callback = callback);
        payload = enqueueUpdate(inst, update, lane);
        null !== payload && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
      },
      enqueueForceUpdate: function(inst, callback) {
        inst = inst._reactInternals;
        var lane = requestUpdateLane(), update = createUpdate(lane);
        update.tag = 2;
        void 0 !== callback && null !== callback && (update.callback = callback);
        callback = enqueueUpdate(inst, update, lane);
        null !== callback && (scheduleUpdateOnFiber(callback, inst, lane), entangleTransitions(callback, inst, lane));
      }
    };
    function checkShouldComponentUpdate(workInProgress2, ctor, oldProps, newProps, oldState, newState, nextContext) {
      workInProgress2 = workInProgress2.stateNode;
      return "function" === typeof workInProgress2.shouldComponentUpdate ? workInProgress2.shouldComponentUpdate(newProps, newState, nextContext) : ctor.prototype && ctor.prototype.isPureReactComponent ? !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState) : true;
    }
    function callComponentWillReceiveProps(workInProgress2, instance, newProps, nextContext) {
      workInProgress2 = instance.state;
      "function" === typeof instance.componentWillReceiveProps && instance.componentWillReceiveProps(newProps, nextContext);
      "function" === typeof instance.UNSAFE_componentWillReceiveProps && instance.UNSAFE_componentWillReceiveProps(newProps, nextContext);
      instance.state !== workInProgress2 && classComponentUpdater.enqueueReplaceState(instance, instance.state, null);
    }
    function resolveClassComponentProps(Component, baseProps) {
      var newProps = baseProps;
      if ("ref" in baseProps) {
        newProps = {};
        for (var propName in baseProps)
          "ref" !== propName && (newProps[propName] = baseProps[propName]);
      }
      if (Component = Component.defaultProps) {
        newProps === baseProps && (newProps = assign({}, newProps));
        for (var propName$77 in Component)
          void 0 === newProps[propName$77] && (newProps[propName$77] = Component[propName$77]);
      }
      return newProps;
    }
    function defaultOnUncaughtError(error) {
      reportGlobalError(error);
    }
    function defaultOnCaughtError(error) {
      console.error(error);
    }
    function defaultOnRecoverableError(error) {
      reportGlobalError(error);
    }
    function logUncaughtError(root2, errorInfo) {
      try {
        var onUncaughtError = root2.onUncaughtError;
        onUncaughtError(errorInfo.value, { componentStack: errorInfo.stack });
      } catch (e$78) {
        setTimeout(function() {
          throw e$78;
        });
      }
    }
    function logCaughtError(root2, boundary, errorInfo) {
      try {
        var onCaughtError = root2.onCaughtError;
        onCaughtError(errorInfo.value, {
          componentStack: errorInfo.stack,
          errorBoundary: 1 === boundary.tag ? boundary.stateNode : null
        });
      } catch (e$79) {
        setTimeout(function() {
          throw e$79;
        });
      }
    }
    function createRootErrorUpdate(root2, errorInfo, lane) {
      lane = createUpdate(lane);
      lane.tag = 3;
      lane.payload = { element: null };
      lane.callback = function() {
        logUncaughtError(root2, errorInfo);
      };
      return lane;
    }
    function createClassErrorUpdate(lane) {
      lane = createUpdate(lane);
      lane.tag = 3;
      return lane;
    }
    function initializeClassErrorUpdate(update, root2, fiber, errorInfo) {
      var getDerivedStateFromError = fiber.type.getDerivedStateFromError;
      if ("function" === typeof getDerivedStateFromError) {
        var error = errorInfo.value;
        update.payload = function() {
          return getDerivedStateFromError(error);
        };
        update.callback = function() {
          logCaughtError(root2, fiber, errorInfo);
        };
      }
      var inst = fiber.stateNode;
      null !== inst && "function" === typeof inst.componentDidCatch && (update.callback = function() {
        logCaughtError(root2, fiber, errorInfo);
        "function" !== typeof getDerivedStateFromError && (null === legacyErrorBoundariesThatAlreadyFailed ? legacyErrorBoundariesThatAlreadyFailed = /* @__PURE__ */ new Set([this]) : legacyErrorBoundariesThatAlreadyFailed.add(this));
        var stack = errorInfo.stack;
        this.componentDidCatch(errorInfo.value, {
          componentStack: null !== stack ? stack : ""
        });
      });
    }
    function throwException(root2, returnFiber, sourceFiber, value, rootRenderLanes) {
      sourceFiber.flags |= 32768;
      if (null !== value && "object" === typeof value && "function" === typeof value.then) {
        returnFiber = sourceFiber.alternate;
        null !== returnFiber && propagateParentContextChanges(
          returnFiber,
          sourceFiber,
          rootRenderLanes,
          true
        );
        sourceFiber = suspenseHandlerStackCursor.current;
        if (null !== sourceFiber) {
          switch (sourceFiber.tag) {
            case 31:
            case 13:
            case 19:
              return null === shellBoundary ? renderDidSuspendDelayIfPossible() : null === sourceFiber.alternate && 0 === workInProgressRootExitStatus && (workInProgressRootExitStatus = 3), sourceFiber.flags &= -257, sourceFiber.flags |= 65536, sourceFiber.lanes = rootRenderLanes, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, null === returnFiber ?
              sourceFiber.updateQueue = /* @__PURE__ */ new Set([value]) : returnFiber.add(value), attachPingListener(root2, value, rootRenderLanes)), false;
            case 22:
              return sourceFiber.flags |= 65536, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, null === returnFiber ? (returnFiber = {
                transitions: null,
                markerInstances: null,
                retryQueue: /* @__PURE__ */ new Set([value])
              }, sourceFiber.updateQueue = returnFiber) : (sourceFiber = returnFiber.retryQueue, null === sourceFiber ? returnFiber.retryQueue = /* @__PURE__ */ new Set([value]) : sourceFiber.add(value)), attachPingListener(root2, value, rootRenderLanes)), false;
          }
          throw Error(formatProdErrorMessage(435, sourceFiber.tag));
        }
        attachPingListener(root2, value, rootRenderLanes);
        renderDidSuspendDelayIfPossible();
        return false;
      }
      if (isHydrating)
        return returnFiber = suspenseHandlerStackCursor.current, null !== returnFiber ? (0 === (returnFiber.flags & 65536) && (returnFiber.flags |= 256), returnFiber.flags |= 65536, returnFiber.lanes = rootRenderLanes, value !== HydrationMismatchException && (root2 = Error(formatProdErrorMessage(422), { cause: value }), queueHydrationError(createCapturedValueAtFiber(root2, sourceFiber)))) : (value !==
        HydrationMismatchException && (returnFiber = Error(formatProdErrorMessage(423), {
          cause: value
        }), queueHydrationError(
          createCapturedValueAtFiber(returnFiber, sourceFiber)
        )), root2 = root2.current.alternate, root2.flags |= 65536, rootRenderLanes &= -rootRenderLanes, root2.lanes |= rootRenderLanes, value = createCapturedValueAtFiber(value, sourceFiber), rootRenderLanes = createRootErrorUpdate(
          root2.stateNode,
          value,
          rootRenderLanes
        ), enqueueCapturedUpdate(root2, rootRenderLanes), 4 !== workInProgressRootExitStatus && (workInProgressRootExitStatus = 2)), false;
      var wrapperError = Error(formatProdErrorMessage(520), { cause: value });
      wrapperError = createCapturedValueAtFiber(wrapperError, sourceFiber);
      null === workInProgressRootConcurrentErrors ? workInProgressRootConcurrentErrors = [wrapperError] : workInProgressRootConcurrentErrors.push(wrapperError);
      4 !== workInProgressRootExitStatus && (workInProgressRootExitStatus = 2);
      if (null === returnFiber) return true;
      value = createCapturedValueAtFiber(value, sourceFiber);
      sourceFiber = returnFiber;
      do {
        switch (sourceFiber.tag) {
          case 3:
            return sourceFiber.flags |= 65536, root2 = rootRenderLanes & -rootRenderLanes, sourceFiber.lanes |= root2, root2 = createRootErrorUpdate(sourceFiber.stateNode, value, root2), enqueueCapturedUpdate(sourceFiber, root2), false;
          case 1:
            returnFiber = sourceFiber.type;
            wrapperError = sourceFiber.stateNode;
            if (0 === (sourceFiber.flags & 128) && ("function" === typeof returnFiber.getDerivedStateFromError || null !== wrapperError && "function" === typeof wrapperError.componentDidCatch && (null === legacyErrorBoundariesThatAlreadyFailed || !legacyErrorBoundariesThatAlreadyFailed.has(wrapperError))))
              return sourceFiber.flags |= 65536, rootRenderLanes &= -rootRenderLanes, sourceFiber.lanes |= rootRenderLanes, rootRenderLanes = createClassErrorUpdate(rootRenderLanes), initializeClassErrorUpdate(
                rootRenderLanes,
                root2,
                sourceFiber,
                value
              ), enqueueCapturedUpdate(sourceFiber, rootRenderLanes), false;
            break;
          case 22:
            if (null !== sourceFiber.memoizedState)
              return sourceFiber.flags |= 65536, false;
        }
        sourceFiber = sourceFiber.return;
      } while (null !== sourceFiber);
      return false;
    }
    var SelectiveHydrationException = Error(formatProdErrorMessage(461));
    var didReceiveUpdate = false;
    function reconcileChildren(current, workInProgress2, nextChildren, renderLanes2) {
      workInProgress2.child = null === current ? mountChildFibers(workInProgress2, null, nextChildren, renderLanes2) : reconcileChildFibers(
        workInProgress2,
        current.child,
        nextChildren,
        renderLanes2
      );
    }
    function updateForwardRef(current, workInProgress2, Component, nextProps, renderLanes2) {
      Component = Component.render;
      var ref = workInProgress2.ref;
      if ("ref" in nextProps) {
        var propsWithoutRef = {};
        for (var key in nextProps)
          "ref" !== key && (propsWithoutRef[key] = nextProps[key]);
      } else propsWithoutRef = nextProps;
      prepareToReadContext(workInProgress2);
      nextProps = renderWithHooks(
        current,
        workInProgress2,
        Component,
        propsWithoutRef,
        ref,
        renderLanes2
      );
      key = checkDidRenderIdHook();
      if (null !== current && !didReceiveUpdate)
        return bailoutHooks(current, workInProgress2, renderLanes2), bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
      isHydrating && key && pushMaterializedTreeId(workInProgress2);
      workInProgress2.flags |= 1;
      reconcileChildren(current, workInProgress2, nextProps, renderLanes2);
      return workInProgress2.child;
    }
    function updateMemoComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
      if (null === current) {
        var type = Component.type;
        if ("function" === typeof type && !shouldConstruct(type) && void 0 === type.defaultProps && null === Component.compare)
          return workInProgress2.tag = 15, workInProgress2.type = type, updateSimpleMemoComponent(
            current,
            workInProgress2,
            type,
            nextProps,
            renderLanes2
          );
        current = createFiberFromTypeAndProps(
          Component.type,
          null,
          nextProps,
          workInProgress2,
          workInProgress2.mode,
          renderLanes2
        );
        current.ref = workInProgress2.ref;
        current.return = workInProgress2;
        return workInProgress2.child = current;
      }
      type = current.child;
      if (!checkScheduledUpdateOrContext(current, renderLanes2)) {
        var prevProps = type.memoizedProps;
        Component = Component.compare;
        Component = null !== Component ? Component : shallowEqual;
        if (Component(prevProps, nextProps) && current.ref === workInProgress2.ref)
          return bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
      }
      workInProgress2.flags |= 1;
      current = createWorkInProgress(type, nextProps);
      current.ref = workInProgress2.ref;
      current.return = workInProgress2;
      return workInProgress2.child = current;
    }
    function updateSimpleMemoComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
      if (null !== current) {
        var prevProps = current.memoizedProps;
        if (shallowEqual(prevProps, nextProps) && current.ref === workInProgress2.ref)
          if (didReceiveUpdate = false, workInProgress2.pendingProps = nextProps = prevProps, checkScheduledUpdateOrContext(current, renderLanes2))
            0 !== (current.flags & 131072) && (didReceiveUpdate = true);
          else
            return workInProgress2.lanes = current.lanes, bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
      }
      return updateFunctionComponent(
        current,
        workInProgress2,
        Component,
        nextProps,
        renderLanes2
      );
    }
    function updateOffscreenComponent(current, workInProgress2, renderLanes2, nextProps) {
      var nextChildren = nextProps.children, prevState = null !== current ? current.memoizedState : null;
      null === current && null === workInProgress2.stateNode && (workInProgress2.stateNode = {
        _visibility: 1,
        _pendingMarkers: null,
        _retryCache: null,
        _transitions: null
      });
      if ("hidden" === nextProps.mode) {
        if (0 !== (workInProgress2.flags & 128)) {
          prevState = null !== prevState ? prevState.baseLanes | renderLanes2 : renderLanes2;
          if (null !== current) {
            nextProps = workInProgress2.child = current.child;
            for (nextChildren = 0; null !== nextProps; )
              nextChildren = nextChildren | nextProps.lanes | nextProps.childLanes, nextProps = nextProps.sibling;
            nextProps = nextChildren & ~prevState;
          } else nextProps = 0, workInProgress2.child = null;
          return deferHiddenOffscreenComponent(
            current,
            workInProgress2,
            prevState,
            renderLanes2,
            nextProps
          );
        }
        if (0 !== (renderLanes2 & 536870912))
          workInProgress2.memoizedState = { baseLanes: 0, cachePool: null }, null !== current && pushTransition(
            workInProgress2,
            null !== prevState ? prevState.cachePool : null
          ), null !== prevState ? pushHiddenContext(workInProgress2, prevState) : reuseHiddenContextOnStack(), pushOffscreenSuspenseHandler(workInProgress2);
        else
          return nextProps = workInProgress2.lanes = 536870912, deferHiddenOffscreenComponent(
            current,
            workInProgress2,
            null !== prevState ? prevState.baseLanes | renderLanes2 : renderLanes2,
            renderLanes2,
            nextProps
          );
      } else
        null !== prevState ? (pushTransition(workInProgress2, prevState.cachePool), pushHiddenContext(workInProgress2, prevState), reuseSuspenseHandlerOnStack(), workInProgress2.memoizedState = null) : (null !== current && pushTransition(workInProgress2, null), reuseHiddenContextOnStack(), reuseSuspenseHandlerOnStack());
      reconcileChildren(current, workInProgress2, nextChildren, renderLanes2);
      return workInProgress2.child;
    }
    function bailoutOffscreenComponent(current, workInProgress2) {
      null !== current && 22 === current.tag || null !== workInProgress2.stateNode || (workInProgress2.stateNode = {
        _visibility: 1,
        _pendingMarkers: null,
        _retryCache: null,
        _transitions: null
      });
      return workInProgress2.sibling;
    }
    function deferHiddenOffscreenComponent(current, workInProgress2, nextBaseLanes, renderLanes2, remainingChildLanes) {
      var JSCompiler_inline_result = peekCacheFromPool();
      JSCompiler_inline_result = null === JSCompiler_inline_result ? null : { parent: CacheContext._currentValue, pool: JSCompiler_inline_result };
      workInProgress2.memoizedState = {
        baseLanes: nextBaseLanes,
        cachePool: JSCompiler_inline_result
      };
      null !== current && pushTransition(workInProgress2, null);
      reuseHiddenContextOnStack();
      pushOffscreenSuspenseHandler(workInProgress2);
      null !== current && propagateParentContextChanges(current, workInProgress2, renderLanes2, true);
      workInProgress2.childLanes = remainingChildLanes;
      return null;
    }
    function mountActivityChildren(workInProgress2, nextProps) {
      nextProps = mountWorkInProgressOffscreenFiber(
        { mode: nextProps.mode, children: nextProps.children },
        workInProgress2.mode
      );
      nextProps.ref = workInProgress2.ref;
      workInProgress2.child = nextProps;
      nextProps.return = workInProgress2;
      return nextProps;
    }
    function retryActivityComponentWithoutHydrating(current, workInProgress2, renderLanes2) {
      reconcileChildFibers(workInProgress2, current.child, null, renderLanes2);
      current = mountActivityChildren(workInProgress2, workInProgress2.pendingProps);
      current.flags |= 2;
      popSuspenseHandler(workInProgress2);
      workInProgress2.memoizedState = null;
      return current;
    }
    function updateActivityComponent(current, workInProgress2, renderLanes2) {
      var nextProps = workInProgress2.pendingProps, didSuspend = 0 !== (workInProgress2.flags & 128);
      workInProgress2.flags &= -129;
      if (null === current) {
        if (isHydrating) {
          if ("hidden" === nextProps.mode)
            return current = mountActivityChildren(workInProgress2, nextProps), workInProgress2.lanes = 536870912, current.memoizedState = { baseLanes: 0, cachePool: null }, bailoutOffscreenComponent(null, current);
          pushDehydratedActivitySuspenseHandler(workInProgress2);
          (current = nextHydratableInstance) ? (current = canHydrateHydrationBoundary(
            current,
            rootOrSingletonContext
          ), current = null !== current && "&" === current.data ? current : null, null !== current && (workInProgress2.memoizedState = {
            dehydrated: current,
            treeContext: null !== treeContextProvider ? { id: treeContextId, overflow: treeContextOverflow } : null,
            retryLane: 536870912,
            hydrationErrors: null
          }, renderLanes2 = createFiberFromDehydratedFragment(current), renderLanes2.return = workInProgress2, workInProgress2.child = renderLanes2, hydrationParentFiber = workInProgress2, nextHydratableInstance = null)) : current = null;
          if (null === current) throw throwOnHydrationMismatch(workInProgress2);
          workInProgress2.lanes = 536870912;
          return null;
        }
        return mountActivityChildren(workInProgress2, nextProps);
      }
      var prevState = current.memoizedState;
      if (null !== prevState) {
        var dehydrated = prevState.dehydrated;
        pushDehydratedActivitySuspenseHandler(workInProgress2);
        if (didSuspend)
          if (workInProgress2.flags & 256)
            workInProgress2.flags &= -257, workInProgress2 = retryActivityComponentWithoutHydrating(
              current,
              workInProgress2,
              renderLanes2
            );
          else if (null !== workInProgress2.memoizedState)
            workInProgress2.child = current.child, workInProgress2.flags |= 128, workInProgress2 = null;
          else throw Error(formatProdErrorMessage(558));
        else if (didReceiveUpdate || propagateParentContextChanges(current, workInProgress2, renderLanes2, false), didSuspend = 0 !== (renderLanes2 & current.childLanes), didReceiveUpdate || didSuspend) {
          if (null === currentTreeHiddenStackCursor.current) {
            nextProps = workInProgressRoot;
            if (null !== nextProps && (dehydrated = getBumpedLaneForHydration(nextProps, renderLanes2), 0 !== dehydrated && dehydrated !== prevState.retryLane))
              throw prevState.retryLane = dehydrated, enqueueConcurrentRenderForLane(current, dehydrated), scheduleUpdateOnFiber(nextProps, current, dehydrated), SelectiveHydrationException;
            renderDidSuspendDelayIfPossible();
          }
          workInProgress2 = retryActivityComponentWithoutHydrating(
            current,
            workInProgress2,
            renderLanes2
          );
        } else
          current = prevState.treeContext, nextHydratableInstance = getNextHydratable(dehydrated.nextSibling), hydrationParentFiber = workInProgress2, isHydrating = true, hydrationErrors = null, rootOrSingletonContext = false, null !== current && restoreSuspendedTreeContext(workInProgress2, current), workInProgress2 = mountActivityChildren(workInProgress2, nextProps), workInProgress2.flags |= 134221824;
        return workInProgress2;
      }
      current = createWorkInProgress(current.child, {
        mode: nextProps.mode,
        children: nextProps.children
      });
      current.ref = workInProgress2.ref;
      workInProgress2.child = current;
      current.return = workInProgress2;
      return current;
    }
    function markRef(current, workInProgress2) {
      var ref = workInProgress2.ref;
      if (null === ref)
        null !== current && null !== current.ref && (workInProgress2.flags |= 4194816);
      else {
        if ("function" !== typeof ref && "object" !== typeof ref)
          throw Error(formatProdErrorMessage(284));
        if (null === current || current.ref !== ref)
          workInProgress2.flags |= 4194816;
      }
    }
    function updateFunctionComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
      prepareToReadContext(workInProgress2);
      Component = renderWithHooks(
        current,
        workInProgress2,
        Component,
        nextProps,
        void 0,
        renderLanes2
      );
      nextProps = checkDidRenderIdHook();
      if (null !== current && !didReceiveUpdate)
        return bailoutHooks(current, workInProgress2, renderLanes2), bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
      isHydrating && nextProps && pushMaterializedTreeId(workInProgress2);
      workInProgress2.flags |= 1;
      reconcileChildren(current, workInProgress2, Component, renderLanes2);
      return workInProgress2.child;
    }
    function replayFunctionComponent(current, workInProgress2, nextProps, Component, secondArg, renderLanes2) {
      prepareToReadContext(workInProgress2);
      workInProgress2.updateQueue = null;
      nextProps = renderWithHooksAgain(
        workInProgress2,
        Component,
        nextProps,
        secondArg
      );
      finishRenderingHooks(current);
      Component = checkDidRenderIdHook();
      if (null !== current && !didReceiveUpdate)
        return bailoutHooks(current, workInProgress2, renderLanes2), bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
      isHydrating && Component && pushMaterializedTreeId(workInProgress2);
      workInProgress2.flags |= 1;
      reconcileChildren(current, workInProgress2, nextProps, renderLanes2);
      return workInProgress2.child;
    }
    function updateClassComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
      prepareToReadContext(workInProgress2);
      if (null === workInProgress2.stateNode) {
        var context = emptyContextObject, contextType = Component.contextType;
        "object" === typeof contextType && null !== contextType && (context = readContext(contextType));
        context = new Component(nextProps, context);
        workInProgress2.memoizedState = null !== context.state && void 0 !== context.state ? context.state : null;
        context.updater = classComponentUpdater;
        workInProgress2.stateNode = context;
        context._reactInternals = workInProgress2;
        context = workInProgress2.stateNode;
        context.props = nextProps;
        context.state = workInProgress2.memoizedState;
        context.refs = {};
        initializeUpdateQueue(workInProgress2);
        contextType = Component.contextType;
        context.context = "object" === typeof contextType && null !== contextType ? readContext(contextType) : emptyContextObject;
        context.state = workInProgress2.memoizedState;
        contextType = Component.getDerivedStateFromProps;
        "function" === typeof contextType && (applyDerivedStateFromProps(
          workInProgress2,
          Component,
          contextType,
          nextProps
        ), context.state = workInProgress2.memoizedState);
        "function" === typeof Component.getDerivedStateFromProps || "function" === typeof context.getSnapshotBeforeUpdate || "function" !== typeof context.UNSAFE_componentWillMount && "function" !== typeof context.componentWillMount || (contextType = context.state, "function" === typeof context.componentWillMount && context.componentWillMount(), "function" === typeof context.UNSAFE_componentWillMount &&
        context.UNSAFE_componentWillMount(), contextType !== context.state && classComponentUpdater.enqueueReplaceState(context, context.state, null), processUpdateQueue(workInProgress2, nextProps, context, renderLanes2), suspendIfUpdateReadFromEntangledAsyncAction(), context.state = workInProgress2.memoizedState);
        "function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308);
        nextProps = true;
      } else if (null === current) {
        context = workInProgress2.stateNode;
        var unresolvedOldProps = workInProgress2.memoizedProps, oldProps = resolveClassComponentProps(Component, unresolvedOldProps);
        context.props = oldProps;
        var oldContext = context.context, contextType$jscomp$0 = Component.contextType;
        contextType = emptyContextObject;
        "object" === typeof contextType$jscomp$0 && null !== contextType$jscomp$0 && (contextType = readContext(contextType$jscomp$0));
        var getDerivedStateFromProps = Component.getDerivedStateFromProps;
        contextType$jscomp$0 = "function" === typeof getDerivedStateFromProps || "function" === typeof context.getSnapshotBeforeUpdate;
        unresolvedOldProps = workInProgress2.pendingProps !== unresolvedOldProps;
        contextType$jscomp$0 || "function" !== typeof context.UNSAFE_componentWillReceiveProps && "function" !== typeof context.componentWillReceiveProps || (unresolvedOldProps || oldContext !== contextType) && callComponentWillReceiveProps(
          workInProgress2,
          context,
          nextProps,
          contextType
        );
        hasForceUpdate = false;
        var oldState = workInProgress2.memoizedState;
        context.state = oldState;
        processUpdateQueue(workInProgress2, nextProps, context, renderLanes2);
        suspendIfUpdateReadFromEntangledAsyncAction();
        oldContext = workInProgress2.memoizedState;
        unresolvedOldProps || oldState !== oldContext || hasForceUpdate ? ("function" === typeof getDerivedStateFromProps && (applyDerivedStateFromProps(
          workInProgress2,
          Component,
          getDerivedStateFromProps,
          nextProps
        ), oldContext = workInProgress2.memoizedState), (oldProps = hasForceUpdate || checkShouldComponentUpdate(
          workInProgress2,
          Component,
          oldProps,
          nextProps,
          oldState,
          oldContext,
          contextType
        )) ? (contextType$jscomp$0 || "function" !== typeof context.UNSAFE_componentWillMount && "function" !== typeof context.componentWillMount || ("function" === typeof context.componentWillMount && context.componentWillMount(), "function" === typeof context.UNSAFE_componentWillMount && context.UNSAFE_componentWillMount()), "function" === typeof context.componentDidMount && (workInProgress2.flags |=
        4194308)) : ("function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308), workInProgress2.memoizedProps = nextProps, workInProgress2.memoizedState = oldContext), context.props = nextProps, context.state = oldContext, context.context = contextType, nextProps = oldProps) : ("function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308), nextProps =
        false);
      } else {
        context = workInProgress2.stateNode;
        cloneUpdateQueue(current, workInProgress2);
        contextType = workInProgress2.memoizedProps;
        contextType$jscomp$0 = resolveClassComponentProps(Component, contextType);
        context.props = contextType$jscomp$0;
        getDerivedStateFromProps = workInProgress2.pendingProps;
        oldState = context.context;
        oldContext = Component.contextType;
        oldProps = emptyContextObject;
        "object" === typeof oldContext && null !== oldContext && (oldProps = readContext(oldContext));
        unresolvedOldProps = Component.getDerivedStateFromProps;
        (oldContext = "function" === typeof unresolvedOldProps || "function" === typeof context.getSnapshotBeforeUpdate) || "function" !== typeof context.UNSAFE_componentWillReceiveProps && "function" !== typeof context.componentWillReceiveProps || (contextType !== getDerivedStateFromProps || oldState !== oldProps) && callComponentWillReceiveProps(
          workInProgress2,
          context,
          nextProps,
          oldProps
        );
        hasForceUpdate = false;
        oldState = workInProgress2.memoizedState;
        context.state = oldState;
        processUpdateQueue(workInProgress2, nextProps, context, renderLanes2);
        suspendIfUpdateReadFromEntangledAsyncAction();
        var newState = workInProgress2.memoizedState;
        contextType !== getDerivedStateFromProps || oldState !== newState || hasForceUpdate || null !== current && null !== current.dependencies && checkIfContextChanged(current.dependencies) ? ("function" === typeof unresolvedOldProps && (applyDerivedStateFromProps(
          workInProgress2,
          Component,
          unresolvedOldProps,
          nextProps
        ), newState = workInProgress2.memoizedState), (contextType$jscomp$0 = hasForceUpdate || checkShouldComponentUpdate(
          workInProgress2,
          Component,
          contextType$jscomp$0,
          nextProps,
          oldState,
          newState,
          oldProps
        ) || null !== current && null !== current.dependencies && checkIfContextChanged(current.dependencies)) ? (oldContext || "function" !== typeof context.UNSAFE_componentWillUpdate && "function" !== typeof context.componentWillUpdate || ("function" === typeof context.componentWillUpdate && context.componentWillUpdate(nextProps, newState, oldProps), "function" === typeof context.UNSAFE_componentWillUpdate &&
        context.UNSAFE_componentWillUpdate(
          nextProps,
          newState,
          oldProps
        )), "function" === typeof context.componentDidUpdate && (workInProgress2.flags |= 4), "function" === typeof context.getSnapshotBeforeUpdate && (workInProgress2.flags |= 1024)) : ("function" !== typeof context.componentDidUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 4), "function" !== typeof context.getSnapshotBeforeUpdate ||
        contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 1024), workInProgress2.memoizedProps = nextProps, workInProgress2.memoizedState = newState), context.props = nextProps, context.state = newState, context.context = oldProps, nextProps = contextType$jscomp$0) : ("function" !== typeof context.componentDidUpdate || contextType === current.
        memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 4), "function" !== typeof context.getSnapshotBeforeUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 1024), nextProps = false);
      }
      context = nextProps;
      markRef(current, workInProgress2);
      nextProps = 0 !== (workInProgress2.flags & 128);
      context || nextProps ? (context = workInProgress2.stateNode, Component = nextProps && "function" !== typeof Component.getDerivedStateFromError ? null : context.render(), workInProgress2.flags |= 1, null !== current && nextProps ? (workInProgress2.child = reconcileChildFibers(
        workInProgress2,
        current.child,
        null,
        renderLanes2
      ), workInProgress2.child = reconcileChildFibers(
        workInProgress2,
        null,
        Component,
        renderLanes2
      )) : reconcileChildren(current, workInProgress2, Component, renderLanes2), workInProgress2.memoizedState = context.state, current = workInProgress2.child) : current = bailoutOnAlreadyFinishedWork(
        current,
        workInProgress2,
        renderLanes2
      );
      return current;
    }
    function mountHostRootWithoutHydrating(current, workInProgress2, nextChildren, renderLanes2) {
      resetHydrationState();
      workInProgress2.flags |= 256;
      reconcileChildren(current, workInProgress2, nextChildren, renderLanes2);
      return workInProgress2.child;
    }
    var SUSPENDED_MARKER = {
      dehydrated: null,
      treeContext: null,
      retryLane: 0,
      hydrationErrors: null
    };
    function mountSuspenseOffscreenState(renderLanes2) {
      return { baseLanes: renderLanes2, cachePool: getSuspendedCache() };
    }
    function getRemainingWorkInPrimaryTree(current, primaryTreeDidDefer, renderLanes2) {
      current = null !== current ? current.childLanes & ~renderLanes2 : 0;
      primaryTreeDidDefer && (current |= workInProgressDeferredLane);
      return current;
    }
    function updateSuspenseComponent(current, workInProgress2, renderLanes2) {
      var nextProps = workInProgress2.pendingProps, showFallback = false, didSuspend = 0 !== (workInProgress2.flags & 128), JSCompiler_temp;
      (JSCompiler_temp = didSuspend) || (JSCompiler_temp = null !== current && null === current.memoizedState ? false : 0 !== (suspenseStackCursor.current & 2));
      JSCompiler_temp && (showFallback = true, workInProgress2.flags &= -129);
      JSCompiler_temp = 0 !== (workInProgress2.flags & 32);
      workInProgress2.flags &= -33;
      if (null === current) {
        if (isHydrating) {
          showFallback ? pushPrimaryTreeSuspenseHandler(workInProgress2) : reuseSuspenseHandlerOnStack();
          (current = nextHydratableInstance) ? (current = canHydrateHydrationBoundary(
            current,
            rootOrSingletonContext
          ), current = null !== current && "&" !== current.data ? current : null, null !== current && (workInProgress2.memoizedState = {
            dehydrated: current,
            treeContext: null !== treeContextProvider ? { id: treeContextId, overflow: treeContextOverflow } : null,
            retryLane: 536870912,
            hydrationErrors: null
          }, renderLanes2 = createFiberFromDehydratedFragment(current), renderLanes2.return = workInProgress2, workInProgress2.child = renderLanes2, hydrationParentFiber = workInProgress2, nextHydratableInstance = null)) : current = null;
          if (null === current) throw throwOnHydrationMismatch(workInProgress2);
          isSuspenseInstanceFallback(current) ? workInProgress2.lanes = 32 : workInProgress2.lanes = 536870912;
          return null;
        }
        didSuspend = nextProps.children;
        nextProps = nextProps.fallback;
        if (showFallback)
          return reuseSuspenseHandlerOnStack(), showFallback = workInProgress2.mode, didSuspend = mountWorkInProgressOffscreenFiber(
            { mode: "hidden", children: didSuspend },
            showFallback
          ), nextProps = createFiberFromFragment(
            nextProps,
            showFallback,
            renderLanes2,
            null
          ), didSuspend.return = workInProgress2, nextProps.return = workInProgress2, didSuspend.sibling = nextProps, workInProgress2.child = didSuspend, nextProps = workInProgress2.child, nextProps.memoizedState = mountSuspenseOffscreenState(renderLanes2), nextProps.childLanes = getRemainingWorkInPrimaryTree(
            current,
            JSCompiler_temp,
            renderLanes2
          ), workInProgress2.memoizedState = SUSPENDED_MARKER, bailoutOffscreenComponent(null, nextProps);
        pushPrimaryTreeSuspenseHandler(workInProgress2);
        return mountSuspensePrimaryChildren(workInProgress2, didSuspend);
      }
      var prevState = current.memoizedState;
      if (null !== prevState) {
        var dehydrated$96 = prevState.dehydrated;
        if (null !== dehydrated$96)
          return updateDehydratedSuspenseComponent(
            current,
            workInProgress2,
            didSuspend,
            JSCompiler_temp,
            nextProps,
            dehydrated$96,
            prevState,
            renderLanes2
          );
      }
      if (showFallback)
        return reuseSuspenseHandlerOnStack(), showFallback = nextProps.fallback, didSuspend = workInProgress2.mode, prevState = current.child, dehydrated$96 = prevState.sibling, nextProps = createWorkInProgress(prevState, {
          mode: "hidden",
          children: nextProps.children
        }), nextProps.subtreeFlags = prevState.subtreeFlags & 1206910976, null !== dehydrated$96 ? showFallback = createWorkInProgress(dehydrated$96, showFallback) : (showFallback = createFiberFromFragment(
          showFallback,
          didSuspend,
          renderLanes2,
          null
        ), showFallback.flags |= 2), showFallback.return = workInProgress2, nextProps.return = workInProgress2, nextProps.sibling = showFallback, workInProgress2.child = nextProps, bailoutOffscreenComponent(null, nextProps), nextProps = workInProgress2.child, showFallback = current.child.memoizedState, null === showFallback ? showFallback = mountSuspenseOffscreenState(renderLanes2) : (didSuspend =
        showFallback.cachePool, null !== didSuspend ? (prevState = CacheContext._currentValue, didSuspend = didSuspend.parent !== prevState ? { parent: prevState, pool: prevState } : didSuspend) : didSuspend = getSuspendedCache(), showFallback = {
          baseLanes: showFallback.baseLanes | renderLanes2,
          cachePool: didSuspend
        }), nextProps.memoizedState = showFallback, nextProps.childLanes = getRemainingWorkInPrimaryTree(
          current,
          JSCompiler_temp,
          renderLanes2
        ), workInProgress2.memoizedState = SUSPENDED_MARKER, bailoutOffscreenComponent(current.child, nextProps);
      pushPrimaryTreeSuspenseHandler(workInProgress2);
      renderLanes2 = current.child;
      current = renderLanes2.sibling;
      renderLanes2 = createWorkInProgress(renderLanes2, {
        mode: "visible",
        children: nextProps.children
      });
      renderLanes2.return = workInProgress2;
      renderLanes2.sibling = null;
      null !== current && (JSCompiler_temp = workInProgress2.deletions, null === JSCompiler_temp ? (workInProgress2.deletions = [current], workInProgress2.flags |= 16) : JSCompiler_temp.push(current));
      workInProgress2.child = renderLanes2;
      workInProgress2.memoizedState = null;
      return renderLanes2;
    }
    function mountSuspensePrimaryChildren(workInProgress2, primaryChildren) {
      primaryChildren = mountWorkInProgressOffscreenFiber(
        { mode: "visible", children: primaryChildren },
        workInProgress2.mode
      );
      primaryChildren.return = workInProgress2;
      return workInProgress2.child = primaryChildren;
    }
    function mountWorkInProgressOffscreenFiber(offscreenProps, mode) {
      offscreenProps = createFiberImplClass(22, offscreenProps, null, mode);
      offscreenProps.lanes = 0;
      return offscreenProps;
    }
    function retrySuspenseComponentWithoutHydrating(current, workInProgress2, renderLanes2) {
      reconcileChildFibers(workInProgress2, current.child, null, renderLanes2);
      current = mountSuspensePrimaryChildren(
        workInProgress2,
        workInProgress2.pendingProps.children
      );
      current.flags |= 2;
      workInProgress2.memoizedState = null;
      return current;
    }
    function updateDehydratedSuspenseComponent(current, workInProgress2, didSuspend, didPrimaryChildrenDefer, nextProps, suspenseInstance, suspenseState, renderLanes2) {
      if (didSuspend) {
        if (workInProgress2.flags & 256)
          return pushPrimaryTreeSuspenseHandler(workInProgress2), workInProgress2.flags &= -257, retrySuspenseComponentWithoutHydrating(
            current,
            workInProgress2,
            renderLanes2
          );
        if (null !== workInProgress2.memoizedState)
          return reuseSuspenseHandlerOnStack(), workInProgress2.child = current.child, workInProgress2.flags |= 128, null;
        reuseSuspenseHandlerOnStack();
        suspenseInstance = nextProps.fallback;
        suspenseState = workInProgress2.mode;
        nextProps = mountWorkInProgressOffscreenFiber(
          { mode: "visible", children: nextProps.children },
          suspenseState
        );
        suspenseInstance = createFiberFromFragment(
          suspenseInstance,
          suspenseState,
          renderLanes2,
          null
        );
        suspenseInstance.flags |= 2;
        nextProps.return = workInProgress2;
        suspenseInstance.return = workInProgress2;
        nextProps.sibling = suspenseInstance;
        workInProgress2.child = nextProps;
        reconcileChildFibers(workInProgress2, current.child, null, renderLanes2);
        nextProps = workInProgress2.child;
        nextProps.memoizedState = mountSuspenseOffscreenState(renderLanes2);
        nextProps.childLanes = getRemainingWorkInPrimaryTree(
          current,
          didPrimaryChildrenDefer,
          renderLanes2
        );
        workInProgress2.memoizedState = SUSPENDED_MARKER;
        return bailoutOffscreenComponent(null, nextProps);
      }
      pushPrimaryTreeSuspenseHandler(workInProgress2);
      if (isSuspenseInstanceFallback(suspenseInstance)) {
        didPrimaryChildrenDefer = suspenseInstance.nextSibling && suspenseInstance.nextSibling.dataset;
        if (didPrimaryChildrenDefer) var digest = didPrimaryChildrenDefer.dgst;
        didPrimaryChildrenDefer = digest;
        "" !== didPrimaryChildrenDefer && (nextProps = Error(formatProdErrorMessage(419)), nextProps.stack = "", nextProps.digest = didPrimaryChildrenDefer, queueHydrationError({ value: nextProps, source: null, stack: null }));
        return retrySuspenseComponentWithoutHydrating(
          current,
          workInProgress2,
          renderLanes2
        );
      }
      didReceiveUpdate || propagateParentContextChanges(current, workInProgress2, renderLanes2, false);
      didPrimaryChildrenDefer = 0 !== (renderLanes2 & current.childLanes);
      if (didReceiveUpdate || didPrimaryChildrenDefer) {
        if (null !== currentTreeHiddenStackCursor.current)
          return retrySuspenseComponentWithoutHydrating(
            current,
            workInProgress2,
            renderLanes2
          );
        didPrimaryChildrenDefer = workInProgressRoot;
        if (null !== didPrimaryChildrenDefer && (nextProps = getBumpedLaneForHydration(
          didPrimaryChildrenDefer,
          renderLanes2
        ), 0 !== nextProps && nextProps !== suspenseState.retryLane))
          throw suspenseState.retryLane = nextProps, enqueueConcurrentRenderForLane(current, nextProps), scheduleUpdateOnFiber(didPrimaryChildrenDefer, current, nextProps), SelectiveHydrationException;
        isSuspenseInstancePending(suspenseInstance) || renderDidSuspendDelayIfPossible();
        return retrySuspenseComponentWithoutHydrating(
          current,
          workInProgress2,
          renderLanes2
        );
      }
      if (isSuspenseInstancePending(suspenseInstance))
        return workInProgress2.flags |= 192, workInProgress2.child = current.child, null;
      current = suspenseState.treeContext;
      nextHydratableInstance = getNextHydratable(suspenseInstance.nextSibling);
      hydrationParentFiber = workInProgress2;
      isHydrating = true;
      hydrationErrors = null;
      rootOrSingletonContext = false;
      null !== current && restoreSuspendedTreeContext(workInProgress2, current);
      workInProgress2 = mountSuspensePrimaryChildren(
        workInProgress2,
        nextProps.children
      );
      workInProgress2.flags |= 134221824;
      return workInProgress2;
    }
    function scheduleSuspenseWorkOnFiber(fiber, renderLanes2, propagationRoot) {
      fiber.lanes |= renderLanes2;
      var alternate = fiber.alternate;
      null !== alternate && (alternate.lanes |= renderLanes2);
      scheduleContextWorkOnParentPath(fiber.return, renderLanes2, propagationRoot);
    }
    function findLastContentRow(firstChild) {
      for (var lastContentRow = null; null !== firstChild; ) {
        var currentRow = firstChild.alternate;
        null !== currentRow && null === findFirstSuspended(currentRow) && (lastContentRow = firstChild);
        firstChild = firstChild.sibling;
      }
      return lastContentRow;
    }
    function initSuspenseListRenderState(workInProgress2, isBackwards, tail, lastContentRow, tailMode, treeForkCount2) {
      var renderState = workInProgress2.memoizedState;
      null === renderState ? workInProgress2.memoizedState = {
        isBackwards,
        rendering: null,
        renderingStartTime: 0,
        last: lastContentRow,
        tail,
        tailMode,
        treeForkCount: treeForkCount2
      } : (renderState.isBackwards = isBackwards, renderState.rendering = null, renderState.renderingStartTime = 0, renderState.last = lastContentRow, renderState.tail = tail, renderState.tailMode = tailMode, renderState.treeForkCount = treeForkCount2);
    }
    function reverseChildren(fiber) {
      var row = fiber.child;
      for (fiber.child = null; null !== row; ) {
        var nextRow = row.sibling;
        row.sibling = fiber.child;
        fiber.child = row;
        row = nextRow;
      }
    }
    function updateSuspenseListComponent(current, workInProgress2, renderLanes2) {
      var nextProps = workInProgress2.pendingProps, revealOrder = nextProps.revealOrder, tailMode = nextProps.tail;
      nextProps = nextProps.children;
      var suspenseContext = suspenseStackCursor.current;
      if (workInProgress2.flags & 128)
        return pushSuspenseListContext(workInProgress2, suspenseContext), null;
      var shouldForceFallback = 0 !== (suspenseContext & 2);
      shouldForceFallback ? (suspenseContext = suspenseContext & 1 | 2, workInProgress2.flags |= 128) : suspenseContext &= 1;
      pushSuspenseListContext(workInProgress2, suspenseContext);
      "backwards" === revealOrder && null !== current ? (reverseChildren(current), reconcileChildren(current, workInProgress2, nextProps, renderLanes2), reverseChildren(current)) : reconcileChildren(current, workInProgress2, nextProps, renderLanes2);
      nextProps = isHydrating ? treeForkCount : 0;
      if (!shouldForceFallback && null !== current && 0 !== (current.flags & 128))
        a: for (current = workInProgress2.child; null !== current; ) {
          if (13 === current.tag)
            null !== current.memoizedState && scheduleSuspenseWorkOnFiber(current, renderLanes2, workInProgress2);
          else if (19 === current.tag)
            scheduleSuspenseWorkOnFiber(current, renderLanes2, workInProgress2);
          else if (null !== current.child) {
            current.child.return = current;
            current = current.child;
            continue;
          }
          if (current === workInProgress2) break a;
          for (; null === current.sibling; ) {
            if (null === current.return || current.return === workInProgress2)
              break a;
            current = current.return;
          }
          current.sibling.return = current.return;
          current = current.sibling;
        }
      switch (revealOrder) {
        case "backwards":
          renderLanes2 = findLastContentRow(workInProgress2.child);
          null === renderLanes2 ? (revealOrder = workInProgress2.child, workInProgress2.child = null) : (revealOrder = renderLanes2.sibling, renderLanes2.sibling = null, reverseChildren(workInProgress2));
          initSuspenseListRenderState(
            workInProgress2,
            true,
            revealOrder,
            null,
            tailMode,
            nextProps
          );
          break;
        case "unstable_legacy-backwards":
          renderLanes2 = null;
          revealOrder = workInProgress2.child;
          for (workInProgress2.child = null; null !== revealOrder; ) {
            current = revealOrder.alternate;
            if (null !== current && null === findFirstSuspended(current)) {
              workInProgress2.child = revealOrder;
              break;
            }
            current = revealOrder.sibling;
            revealOrder.sibling = renderLanes2;
            renderLanes2 = revealOrder;
            revealOrder = current;
          }
          initSuspenseListRenderState(
            workInProgress2,
            true,
            renderLanes2,
            null,
            tailMode,
            nextProps
          );
          break;
        case "together":
          initSuspenseListRenderState(
            workInProgress2,
            false,
            null,
            null,
            void 0,
            nextProps
          );
          break;
        case "independent":
          workInProgress2.memoizedState = null;
          break;
        default:
          renderLanes2 = findLastContentRow(workInProgress2.child), null === renderLanes2 ? (revealOrder = workInProgress2.child, workInProgress2.child = null) : (revealOrder = renderLanes2.sibling, renderLanes2.sibling = null), initSuspenseListRenderState(
            workInProgress2,
            false,
            revealOrder,
            renderLanes2,
            tailMode,
            nextProps
          );
      }
      return workInProgress2.child;
    }
    function updateContextProvider(current, workInProgress2, renderLanes2) {
      var newProps = workInProgress2.pendingProps;
      pushProvider(workInProgress2, workInProgress2.type, newProps.value);
      reconcileChildren(current, workInProgress2, newProps.children, renderLanes2);
      return workInProgress2.child;
    }
    function bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2) {
      null !== current && (workInProgress2.dependencies = current.dependencies);
      workInProgressRootSkippedLanes |= workInProgress2.lanes;
      if (0 === (renderLanes2 & workInProgress2.childLanes))
        if (null !== current) {
          if (propagateParentContextChanges(
            current,
            workInProgress2,
            renderLanes2,
            false
          ), 0 === (renderLanes2 & workInProgress2.childLanes))
            return null;
        } else return null;
      if (null !== current && workInProgress2.child !== current.child)
        throw Error(formatProdErrorMessage(153));
      if (null !== workInProgress2.child) {
        current = workInProgress2.child;
        renderLanes2 = createWorkInProgress(current, current.pendingProps);
        workInProgress2.child = renderLanes2;
        for (renderLanes2.return = workInProgress2; null !== current.sibling; )
          current = current.sibling, renderLanes2 = renderLanes2.sibling = createWorkInProgress(current, current.pendingProps), renderLanes2.return = workInProgress2;
        renderLanes2.sibling = null;
      }
      return workInProgress2.child;
    }
    function checkScheduledUpdateOrContext(current, renderLanes2) {
      if (0 !== (current.lanes & renderLanes2)) return true;
      current = current.dependencies;
      return null !== current && checkIfContextChanged(current) ? true : false;
    }
    function attemptEarlyBailoutIfNoScheduledUpdate(current, workInProgress2, renderLanes2) {
      switch (workInProgress2.tag) {
        case 3:
          pushHostContainer(workInProgress2, workInProgress2.stateNode.containerInfo);
          pushProvider(workInProgress2, CacheContext, current.memoizedState.cache);
          resetHydrationState();
          break;
        case 27:
        case 5:
          pushHostContext(workInProgress2);
          break;
        case 4:
          pushHostContainer(workInProgress2, workInProgress2.stateNode.containerInfo);
          break;
        case 10:
          pushProvider(
            workInProgress2,
            workInProgress2.type,
            workInProgress2.memoizedProps.value
          );
          break;
        case 31:
          if (null !== workInProgress2.memoizedState)
            return workInProgress2.flags |= 128, pushDehydratedActivitySuspenseHandler(workInProgress2), null;
          break;
        case 13:
          var state$108 = workInProgress2.memoizedState;
          if (null !== state$108) {
            if (null !== state$108.dehydrated)
              return pushPrimaryTreeSuspenseHandler(workInProgress2), workInProgress2.flags |= 128, null;
            state$108 = propagateParentContextChanges(
              current,
              workInProgress2,
              renderLanes2,
              false
            );
            var primaryChildLanes = workInProgress2.child.childLanes;
            if (state$108 || 0 !== (renderLanes2 & primaryChildLanes))
              return updateSuspenseComponent(current, workInProgress2, renderLanes2);
            pushPrimaryTreeSuspenseHandler(workInProgress2);
            current = bailoutOnAlreadyFinishedWork(
              current,
              workInProgress2,
              renderLanes2
            );
            return null !== current ? current.sibling : null;
          }
          pushPrimaryTreeSuspenseHandler(workInProgress2);
          break;
        case 19:
          if (workInProgress2.flags & 128)
            return updateSuspenseListComponent(
              current,
              workInProgress2,
              renderLanes2
            );
          primaryChildLanes = 0 !== (current.flags & 128);
          state$108 = 0 !== (renderLanes2 & workInProgress2.childLanes);
          state$108 || (propagateParentContextChanges(
            current,
            workInProgress2,
            renderLanes2,
            false
          ), state$108 = 0 !== (renderLanes2 & workInProgress2.childLanes));
          if (primaryChildLanes) {
            if (state$108)
              return updateSuspenseListComponent(
                current,
                workInProgress2,
                renderLanes2
              );
            workInProgress2.flags |= 128;
          }
          primaryChildLanes = workInProgress2.memoizedState;
          null !== primaryChildLanes && (primaryChildLanes.rendering = null, primaryChildLanes.tail = null, primaryChildLanes.lastEffect = null);
          pushSuspenseListContext(workInProgress2, suspenseStackCursor.current);
          if (state$108) break;
          else return null;
        case 22:
          return workInProgress2.lanes = 0, updateOffscreenComponent(
            current,
            workInProgress2,
            renderLanes2,
            workInProgress2.pendingProps
          );
        case 24:
          pushProvider(workInProgress2, CacheContext, current.memoizedState.cache);
      }
      return bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
    }
    function beginWork(current, workInProgress2, renderLanes2) {
      if (null !== current)
        if (current.memoizedProps !== workInProgress2.pendingProps)
          didReceiveUpdate = true;
        else {
          if (!checkScheduledUpdateOrContext(current, renderLanes2) && 0 === (workInProgress2.flags & 128))
            return didReceiveUpdate = false, attemptEarlyBailoutIfNoScheduledUpdate(
              current,
              workInProgress2,
              renderLanes2
            );
          didReceiveUpdate = 0 !== (current.flags & 131072) ? true : false;
        }
      else
        didReceiveUpdate = false, isHydrating && 0 !== (workInProgress2.flags & 1048576) && pushTreeId(workInProgress2, treeForkCount, workInProgress2.index);
      workInProgress2.lanes = 0;
      switch (workInProgress2.tag) {
        case 16:
          a: {
            var props = workInProgress2.pendingProps;
            current = resolveLazy(workInProgress2.elementType);
            workInProgress2.type = current;
            if ("function" === typeof current)
              shouldConstruct(current) ? (props = resolveClassComponentProps(current, props), workInProgress2.tag = 1, workInProgress2 = updateClassComponent(
                null,
                workInProgress2,
                current,
                props,
                renderLanes2
              )) : (workInProgress2.tag = 0, workInProgress2 = updateFunctionComponent(
                null,
                workInProgress2,
                current,
                props,
                renderLanes2
              ));
            else {
              if (void 0 !== current && null !== current) {
                var $$typeof = current.$$typeof;
                if ($$typeof === REACT_FORWARD_REF_TYPE) {
                  workInProgress2.tag = 11;
                  workInProgress2 = updateForwardRef(
                    null,
                    workInProgress2,
                    current,
                    props,
                    renderLanes2
                  );
                  break a;
                } else if ($$typeof === REACT_MEMO_TYPE) {
                  workInProgress2.tag = 14;
                  workInProgress2 = updateMemoComponent(
                    null,
                    workInProgress2,
                    current,
                    props,
                    renderLanes2
                  );
                  break a;
                } else if ($$typeof === REACT_CONTEXT_TYPE) {
                  workInProgress2.tag = 10;
                  workInProgress2.type = current;
                  workInProgress2 = updateContextProvider(
                    null,
                    workInProgress2,
                    renderLanes2
                  );
                  break a;
                }
              }
              workInProgress2 = getComponentNameFromType(current) || current;
              throw Error(formatProdErrorMessage(306, workInProgress2, ""));
            }
          }
          return workInProgress2;
        case 0:
          return updateFunctionComponent(
            current,
            workInProgress2,
            workInProgress2.type,
            workInProgress2.pendingProps,
            renderLanes2
          );
        case 1:
          return props = workInProgress2.type, $$typeof = resolveClassComponentProps(
            props,
            workInProgress2.pendingProps
          ), updateClassComponent(
            current,
            workInProgress2,
            props,
            $$typeof,
            renderLanes2
          );
        case 3:
          a: {
            pushHostContainer(
              workInProgress2,
              workInProgress2.stateNode.containerInfo
            );
            if (null === current) throw Error(formatProdErrorMessage(387));
            props = workInProgress2.pendingProps;
            var prevState = workInProgress2.memoizedState;
            $$typeof = prevState.element;
            cloneUpdateQueue(current, workInProgress2);
            processUpdateQueue(workInProgress2, props, null, renderLanes2);
            var nextState = workInProgress2.memoizedState;
            props = nextState.cache;
            pushProvider(workInProgress2, CacheContext, props);
            props !== prevState.cache && propagateContextChanges(
              workInProgress2,
              [CacheContext],
              renderLanes2,
              true
            );
            suspendIfUpdateReadFromEntangledAsyncAction();
            props = nextState.element;
            if (prevState.isDehydrated)
              if (prevState = {
                element: props,
                isDehydrated: false,
                cache: nextState.cache
              }, workInProgress2.updateQueue.baseState = prevState, workInProgress2.memoizedState = prevState, workInProgress2.flags & 256) {
                workInProgress2 = mountHostRootWithoutHydrating(
                  current,
                  workInProgress2,
                  props,
                  renderLanes2
                );
                break a;
              } else if (props !== $$typeof) {
                $$typeof = createCapturedValueAtFiber(
                  Error(formatProdErrorMessage(424)),
                  workInProgress2
                );
                queueHydrationError($$typeof);
                workInProgress2 = mountHostRootWithoutHydrating(
                  current,
                  workInProgress2,
                  props,
                  renderLanes2
                );
                break a;
              } else {
                current = workInProgress2.stateNode.containerInfo;
                switch (current.nodeType) {
                  case 9:
                    current = current.body;
                    break;
                  default:
                    current = "HTML" === current.nodeName ? current.ownerDocument.body : current;
                }
                nextHydratableInstance = getNextHydratable(current.firstChild);
                hydrationParentFiber = workInProgress2;
                isHydrating = true;
                hydrationErrors = null;
                rootOrSingletonContext = true;
                renderLanes2 = mountChildFibers(
                  workInProgress2,
                  null,
                  props,
                  renderLanes2
                );
                for (workInProgress2.child = renderLanes2; renderLanes2; )
                  renderLanes2.flags = renderLanes2.flags & -3 | 134221824, renderLanes2 = renderLanes2.sibling;
              }
            else {
              resetHydrationState();
              if (props === $$typeof) {
                workInProgress2 = bailoutOnAlreadyFinishedWork(
                  current,
                  workInProgress2,
                  renderLanes2
                );
                break a;
              }
              reconcileChildren(current, workInProgress2, props, renderLanes2);
            }
            workInProgress2 = workInProgress2.child;
          }
          return workInProgress2;
        case 26:
          return markRef(current, workInProgress2), null === current ? (renderLanes2 = getResource(
            workInProgress2.type,
            null,
            workInProgress2.pendingProps,
            null
          )) ? workInProgress2.memoizedState = renderLanes2 : isHydrating || (workInProgress2.stateNode = createHoistableInstance(
            workInProgress2.type,
            workInProgress2.pendingProps,
            rootInstanceStackCursor.current,
            workInProgress2
          )) : workInProgress2.memoizedState = getResource(
            workInProgress2.type,
            current.memoizedProps,
            workInProgress2.pendingProps,
            current.memoizedState
          ), null;
        case 27:
          return pushHostContext(workInProgress2), null === current && isHydrating && (props = workInProgress2.stateNode = resolveSingletonInstance(
            workInProgress2.type,
            workInProgress2.pendingProps,
            rootInstanceStackCursor.current
          ), hydrationParentFiber = workInProgress2, rootOrSingletonContext = true, $$typeof = nextHydratableInstance, isSingletonScope(workInProgress2.type) ? (previousHydratableOnEnteringScopedSingleton = $$typeof, nextHydratableInstance = getNextHydratable(props.firstChild)) : nextHydratableInstance = $$typeof), reconcileChildren(
            current,
            workInProgress2,
            workInProgress2.pendingProps.children,
            renderLanes2
          ), markRef(current, workInProgress2), null === current && (workInProgress2.flags |= 4194304), workInProgress2.child;
        case 5:
          if (null === current && isHydrating) {
            if ($$typeof = props = nextHydratableInstance)
              props = canHydrateInstance(
                props,
                workInProgress2.type,
                workInProgress2.pendingProps,
                rootOrSingletonContext
              ), null !== props ? (workInProgress2.stateNode = props, hydrationParentFiber = workInProgress2, nextHydratableInstance = getNextHydratable(props.firstChild), rootOrSingletonContext = false, $$typeof = true) : $$typeof = false;
            $$typeof || throwOnHydrationMismatch(workInProgress2);
          }
          pushHostContext(workInProgress2);
          $$typeof = workInProgress2.type;
          prevState = workInProgress2.pendingProps;
          nextState = null !== current ? current.memoizedProps : null;
          props = prevState.children;
          shouldSetTextContent($$typeof, prevState) ? props = null : null !== nextState && shouldSetTextContent($$typeof, nextState) && (workInProgress2.flags |= 32);
          null !== workInProgress2.memoizedState && ($$typeof = renderWithHooks(
            current,
            workInProgress2,
            TransitionAwareHostComponent,
            null,
            null,
            renderLanes2
          ), HostTransitionContext._currentValue = $$typeof);
          markRef(current, workInProgress2);
          reconcileChildren(current, workInProgress2, props, renderLanes2);
          return workInProgress2.child;
        case 6:
          if (null === current && isHydrating) {
            if (current = renderLanes2 = nextHydratableInstance)
              renderLanes2 = canHydrateTextInstance(
                renderLanes2,
                workInProgress2.pendingProps,
                rootOrSingletonContext
              ), null !== renderLanes2 ? (workInProgress2.stateNode = renderLanes2, hydrationParentFiber = workInProgress2, nextHydratableInstance = null, current = true) : current = false;
            current || throwOnHydrationMismatch(workInProgress2);
          }
          return null;
        case 13:
          return updateSuspenseComponent(current, workInProgress2, renderLanes2);
        case 4:
          return pushHostContainer(
            workInProgress2,
            workInProgress2.stateNode.containerInfo
          ), props = workInProgress2.pendingProps, null === current ? workInProgress2.child = reconcileChildFibers(
            workInProgress2,
            null,
            props,
            renderLanes2
          ) : reconcileChildren(current, workInProgress2, props, renderLanes2), workInProgress2.child;
        case 11:
          return updateForwardRef(
            current,
            workInProgress2,
            workInProgress2.type,
            workInProgress2.pendingProps,
            renderLanes2
          );
        case 7:
          return props = workInProgress2.pendingProps, markRef(current, workInProgress2), reconcileChildren(current, workInProgress2, props, renderLanes2), workInProgress2.child;
        case 8:
          return reconcileChildren(
            current,
            workInProgress2,
            workInProgress2.pendingProps.children,
            renderLanes2
          ), workInProgress2.child;
        case 12:
          return reconcileChildren(
            current,
            workInProgress2,
            workInProgress2.pendingProps.children,
            renderLanes2
          ), workInProgress2.child;
        case 10:
          return updateContextProvider(current, workInProgress2, renderLanes2);
        case 9:
          return $$typeof = workInProgress2.type._context, props = workInProgress2.pendingProps.children, prepareToReadContext(workInProgress2), $$typeof = readContext($$typeof), props = props($$typeof), workInProgress2.flags |= 1, reconcileChildren(current, workInProgress2, props, renderLanes2), workInProgress2.child;
        case 14:
          return updateMemoComponent(
            current,
            workInProgress2,
            workInProgress2.type,
            workInProgress2.pendingProps,
            renderLanes2
          );
        case 15:
          return updateSimpleMemoComponent(
            current,
            workInProgress2,
            workInProgress2.type,
            workInProgress2.pendingProps,
            renderLanes2
          );
        case 19:
          return updateSuspenseListComponent(current, workInProgress2, renderLanes2);
        case 31:
          return updateActivityComponent(current, workInProgress2, renderLanes2);
        case 22:
          return updateOffscreenComponent(
            current,
            workInProgress2,
            renderLanes2,
            workInProgress2.pendingProps
          );
        case 24:
          return prepareToReadContext(workInProgress2), props = readContext(CacheContext), null === current ? ($$typeof = peekCacheFromPool(), null === $$typeof && ($$typeof = workInProgressRoot, prevState = createCache(), $$typeof.pooledCache = prevState, prevState.refCount++, null !== prevState && ($$typeof.pooledCacheLanes |= renderLanes2), $$typeof = prevState), workInProgress2.memoizedState =
          { parent: props, cache: $$typeof }, initializeUpdateQueue(workInProgress2), pushProvider(workInProgress2, CacheContext, $$typeof)) : (0 !== (current.lanes & renderLanes2) && (cloneUpdateQueue(current, workInProgress2), processUpdateQueue(workInProgress2, null, null, renderLanes2), suspendIfUpdateReadFromEntangledAsyncAction()), $$typeof = current.memoizedState, prevState = workInProgress2.
          memoizedState, $$typeof.parent !== props ? ($$typeof = { parent: props, cache: props }, workInProgress2.memoizedState = $$typeof, 0 === workInProgress2.lanes && (workInProgress2.memoizedState = workInProgress2.updateQueue.baseState = $$typeof), pushProvider(workInProgress2, CacheContext, props)) : (props = prevState.cache, pushProvider(workInProgress2, CacheContext, props), props !== $$typeof.
          cache && propagateContextChanges(
            workInProgress2,
            [CacheContext],
            renderLanes2,
            true
          ))), reconcileChildren(
            current,
            workInProgress2,
            workInProgress2.pendingProps.children,
            renderLanes2
          ), workInProgress2.child;
        case 30:
          return null === workInProgress2.stateNode && (workInProgress2.stateNode = {
            autoName: null,
            paired: null,
            clones: null,
            ref: null
          }), props = workInProgress2.pendingProps, null != props.name && "auto" !== props.name ? workInProgress2.flags |= null === current ? 18882560 : 18874368 : isHydrating && pushMaterializedTreeId(workInProgress2), null !== current && current.memoizedProps.name !== props.name ? workInProgress2.flags |= 4194816 : markRef(current, workInProgress2), reconcileChildren(current, workInProgress2, props.
          children, renderLanes2), workInProgress2.child;
        case 29:
          throw workInProgress2.pendingProps;
      }
      throw Error(formatProdErrorMessage(156, workInProgress2.tag));
    }
    function markUpdate(workInProgress2) {
      workInProgress2.flags |= 4;
    }
    function preloadInstanceAndSuspendIfNeeded(workInProgress2, type, oldProps, newProps, renderLanes2) {
      var JSCompiler_temp;
      if (JSCompiler_temp = 0 !== (workInProgress2.mode & 32))
        JSCompiler_temp = null === oldProps ? maySuspendCommit(type, newProps) : maySuspendCommit(type, newProps) && (newProps.src !== oldProps.src || newProps.srcSet !== oldProps.srcSet);
      if (JSCompiler_temp) {
        if (workInProgress2.flags |= 16777216, (renderLanes2 & 335544128) === renderLanes2)
          if (workInProgress2.stateNode.complete) workInProgress2.flags |= 8192;
          else if (shouldRemainOnPreviousScreen()) workInProgress2.flags |= 8192;
          else
            throw suspendedThenable = noopSuspenseyCommitThenable, SuspenseyCommitException;
      } else workInProgress2.flags &= -16777217;
    }
    function preloadResourceAndSuspendIfNeeded(workInProgress2, resource) {
      if ("stylesheet" !== resource.type || 0 !== (resource.state.loading & 4))
        workInProgress2.flags &= -16777217;
      else if (workInProgress2.flags |= 16777216, !preloadResource(resource))
        if (shouldRemainOnPreviousScreen()) workInProgress2.flags |= 8192;
        else
          throw suspendedThenable = noopSuspenseyCommitThenable, SuspenseyCommitException;
    }
    function scheduleRetryEffect(workInProgress2, retryQueue) {
      null !== retryQueue && (workInProgress2.flags |= 4);
      workInProgress2.flags & 16384 && (retryQueue = 22 !== workInProgress2.tag ? claimNextRetryLane() : 536870912, workInProgress2.lanes |= retryQueue, workInProgressSuspendedRetryLanes |= retryQueue);
    }
    function cutOffTailIfNeeded(renderState, hasRenderedATailFallback) {
      if (!isHydrating)
        switch (renderState.tailMode) {
          case "visible":
            break;
          case "collapsed":
            for (var tailNode = renderState.tail, lastTailNode = null; null !== tailNode; )
              null !== tailNode.alternate && (lastTailNode = tailNode), tailNode = tailNode.sibling;
            null === lastTailNode ? hasRenderedATailFallback || null === renderState.tail ? renderState.tail = null : renderState.tail.sibling = null : lastTailNode.sibling = null;
            break;
          default:
            hasRenderedATailFallback = renderState.tail;
            for (tailNode = null; null !== hasRenderedATailFallback; )
              null !== hasRenderedATailFallback.alternate && (tailNode = hasRenderedATailFallback), hasRenderedATailFallback = hasRenderedATailFallback.sibling;
            null === tailNode ? renderState.tail = null : tailNode.sibling = null;
        }
    }
    function bubbleProperties(completedWork) {
      var didBailout = null !== completedWork.alternate && completedWork.alternate.child === completedWork.child, newChildLanes = 0, subtreeFlags = 0;
      if (didBailout)
        for (var child$113 = completedWork.child; null !== child$113; )
          newChildLanes |= child$113.lanes | child$113.childLanes, subtreeFlags |= child$113.subtreeFlags & 1206910976, subtreeFlags |= child$113.flags & 1206910976, child$113.return = completedWork, child$113 = child$113.sibling;
      else
        for (child$113 = completedWork.child; null !== child$113; )
          newChildLanes |= child$113.lanes | child$113.childLanes, subtreeFlags |= child$113.subtreeFlags, subtreeFlags |= child$113.flags, child$113.return = completedWork, child$113 = child$113.sibling;
      completedWork.subtreeFlags |= subtreeFlags;
      completedWork.childLanes = newChildLanes;
      return didBailout;
    }
    function completeWork(current, workInProgress2, renderLanes2) {
      var newProps = workInProgress2.pendingProps;
      popTreeContext(workInProgress2);
      switch (workInProgress2.tag) {
        case 16:
        case 15:
        case 0:
        case 11:
        case 7:
        case 8:
        case 12:
        case 9:
        case 14:
          return bubbleProperties(workInProgress2), null;
        case 1:
          return bubbleProperties(workInProgress2), null;
        case 3:
          renderLanes2 = workInProgress2.stateNode;
          newProps = null;
          null !== current && (newProps = current.memoizedState.cache);
          workInProgress2.memoizedState.cache !== newProps && (workInProgress2.flags |= 2048);
          popProvider(CacheContext);
          popHostContainer();
          renderLanes2.pendingContext && (renderLanes2.context = renderLanes2.pendingContext, renderLanes2.pendingContext = null);
          if (null === current || null === current.child)
            popHydrationState(workInProgress2) ? markUpdate(workInProgress2) : null === current || current.memoizedState.isDehydrated && 0 === (workInProgress2.flags & 256) || (workInProgress2.flags |= 1024, upgradeHydrationErrorsToRecoverable());
          bubbleProperties(workInProgress2);
          return null;
        case 26:
          var type = workInProgress2.type, nextResource = workInProgress2.memoizedState;
          null === current ? (markUpdate(workInProgress2), null !== nextResource ? (bubbleProperties(workInProgress2), preloadResourceAndSuspendIfNeeded(workInProgress2, nextResource)) : (bubbleProperties(workInProgress2), preloadInstanceAndSuspendIfNeeded(
            workInProgress2,
            type,
            null,
            newProps,
            renderLanes2
          ))) : nextResource ? nextResource !== current.memoizedState ? (markUpdate(workInProgress2), bubbleProperties(workInProgress2), preloadResourceAndSuspendIfNeeded(workInProgress2, nextResource)) : (bubbleProperties(workInProgress2), workInProgress2.flags &= -16777217) : (current = current.memoizedProps, current !== newProps && markUpdate(workInProgress2), bubbleProperties(workInProgress2),
          preloadInstanceAndSuspendIfNeeded(
            workInProgress2,
            type,
            current,
            newProps,
            renderLanes2
          ));
          return null;
        case 27:
          popHostContext(workInProgress2);
          renderLanes2 = rootInstanceStackCursor.current;
          type = workInProgress2.type;
          if (null !== current && null != workInProgress2.stateNode)
            current.memoizedProps !== newProps && markUpdate(workInProgress2);
          else {
            if (!newProps) {
              if (null === workInProgress2.stateNode)
                throw Error(formatProdErrorMessage(166));
              bubbleProperties(workInProgress2);
              workInProgress2.subtreeFlags &= -33554433;
              return null;
            }
            current = contextStackCursor.current;
            popHydrationState(workInProgress2) ? prepareToHydrateHostInstance(workInProgress2, current) : (current = resolveSingletonInstance(type, newProps, renderLanes2), workInProgress2.stateNode = current, markUpdate(workInProgress2));
          }
          bubbleProperties(workInProgress2);
          workInProgress2.subtreeFlags &= -33554433;
          return null;
        case 5:
          popHostContext(workInProgress2);
          type = workInProgress2.type;
          if (null !== current && null != workInProgress2.stateNode)
            current.memoizedProps !== newProps && markUpdate(workInProgress2);
          else {
            if (!newProps) {
              if (null === workInProgress2.stateNode)
                throw Error(formatProdErrorMessage(166));
              bubbleProperties(workInProgress2);
              workInProgress2.subtreeFlags &= -33554433;
              return null;
            }
            nextResource = contextStackCursor.current;
            if (popHydrationState(workInProgress2))
              prepareToHydrateHostInstance(workInProgress2, nextResource);
            else {
              var ownerDocument = getOwnerDocumentFromRootContainer(
                rootInstanceStackCursor.current
              );
              switch (nextResource) {
                case 1:
                  nextResource = ownerDocument.createElementNS(
                    "http://www.w3.org/2000/svg",
                    type
                  );
                  break;
                case 2:
                  nextResource = ownerDocument.createElementNS(
                    "http://www.w3.org/1998/Math/MathML",
                    type
                  );
                  break;
                default:
                  switch (type) {
                    case "svg":
                      nextResource = ownerDocument.createElementNS(
                        "http://www.w3.org/2000/svg",
                        type
                      );
                      break;
                    case "math":
                      nextResource = ownerDocument.createElementNS(
                        "http://www.w3.org/1998/Math/MathML",
                        type
                      );
                      break;
                    case "script":
                      nextResource = ownerDocument.createElement("div");
                      nextResource.innerHTML = "<script><\/script>";
                      nextResource = nextResource.removeChild(
                        nextResource.firstChild
                      );
                      break;
                    case "select":
                      nextResource = "string" === typeof newProps.is ? ownerDocument.createElement("select", {
                        is: newProps.is
                      }) : ownerDocument.createElement("select");
                      newProps.multiple ? nextResource.multiple = true : newProps.size && (nextResource.size = newProps.size);
                      break;
                    default:
                      nextResource = "string" === typeof newProps.is ? ownerDocument.createElement(type, { is: newProps.is }) : ownerDocument.createElement(type);
                  }
              }
              nextResource[internalInstanceKey] = workInProgress2;
              nextResource[internalPropsKey] = newProps;
              a: for (ownerDocument = workInProgress2.child; null !== ownerDocument; ) {
                if (5 === ownerDocument.tag || 6 === ownerDocument.tag)
                  nextResource.appendChild(ownerDocument.stateNode);
                else if (4 !== ownerDocument.tag && 27 !== ownerDocument.tag && null !== ownerDocument.child) {
                  ownerDocument.child.return = ownerDocument;
                  ownerDocument = ownerDocument.child;
                  continue;
                }
                if (ownerDocument === workInProgress2) break a;
                for (; null === ownerDocument.sibling; ) {
                  if (null === ownerDocument.return || ownerDocument.return === workInProgress2)
                    break a;
                  ownerDocument = ownerDocument.return;
                }
                ownerDocument.sibling.return = ownerDocument.return;
                ownerDocument = ownerDocument.sibling;
              }
              workInProgress2.stateNode = nextResource;
              a: switch (setInitialProperties(nextResource, type, newProps), type) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  newProps = !!newProps.autoFocus;
                  break a;
                case "img":
                  newProps = true;
                  break a;
                default:
                  newProps = false;
              }
              newProps && markUpdate(workInProgress2);
            }
          }
          bubbleProperties(workInProgress2);
          workInProgress2.subtreeFlags &= -33554433;
          preloadInstanceAndSuspendIfNeeded(
            workInProgress2,
            workInProgress2.type,
            null === current ? null : current.memoizedProps,
            workInProgress2.pendingProps,
            renderLanes2
          );
          return null;
        case 6:
          if (current && null != workInProgress2.stateNode)
            current.memoizedProps !== newProps && markUpdate(workInProgress2);
          else {
            if ("string" !== typeof newProps && null === workInProgress2.stateNode)
              throw Error(formatProdErrorMessage(166));
            current = rootInstanceStackCursor.current;
            if (popHydrationState(workInProgress2)) {
              current = workInProgress2.stateNode;
              renderLanes2 = workInProgress2.memoizedProps;
              newProps = null;
              type = hydrationParentFiber;
              if (null !== type)
                switch (type.tag) {
                  case 27:
                  case 5:
                    newProps = type.memoizedProps;
                }
              current[internalInstanceKey] = workInProgress2;
              current = current.nodeValue === renderLanes2 || null !== newProps && true === newProps.suppressHydrationWarning || checkForUnmatchedText(current.nodeValue, renderLanes2) ? true : false;
              current || throwOnHydrationMismatch(workInProgress2, true);
            } else
              current = getOwnerDocumentFromRootContainer(current).createTextNode(
                newProps
              ), current[internalInstanceKey] = workInProgress2, workInProgress2.stateNode = current;
          }
          bubbleProperties(workInProgress2);
          return null;
        case 31:
          renderLanes2 = workInProgress2.memoizedState;
          if (null === current || null !== current.memoizedState) {
            newProps = popHydrationState(workInProgress2);
            if (null !== renderLanes2) {
              if (null === current) {
                if (!newProps) throw Error(formatProdErrorMessage(318));
                current = workInProgress2.memoizedState;
                current = null !== current ? current.dehydrated : null;
                if (!current) throw Error(formatProdErrorMessage(557));
                current[internalInstanceKey] = workInProgress2;
              } else
                resetHydrationState(), 0 === (workInProgress2.flags & 128) && (workInProgress2.memoizedState = null), workInProgress2.flags |= 4;
              bubbleProperties(workInProgress2);
              current = false;
            } else
              renderLanes2 = upgradeHydrationErrorsToRecoverable(), null !== current && null !== current.memoizedState && (current.memoizedState.hydrationErrors = renderLanes2), current = true;
            if (!current) {
              if (workInProgress2.flags & 256)
                return popSuspenseHandler(workInProgress2), workInProgress2;
              popSuspenseHandler(workInProgress2);
              return null;
            }
            if (0 !== (workInProgress2.flags & 128))
              throw Error(formatProdErrorMessage(558));
          }
          bubbleProperties(workInProgress2);
          return null;
        case 13:
          newProps = workInProgress2.memoizedState;
          if (null === current || null !== current.memoizedState && null !== current.memoizedState.dehydrated) {
            type = popHydrationState(workInProgress2);
            if (null !== newProps && null !== newProps.dehydrated) {
              if (null === current) {
                if (!type) throw Error(formatProdErrorMessage(318));
                type = workInProgress2.memoizedState;
                type = null !== type ? type.dehydrated : null;
                if (!type) throw Error(formatProdErrorMessage(317));
                type[internalInstanceKey] = workInProgress2;
              } else
                resetHydrationState(), 0 === (workInProgress2.flags & 128) && (workInProgress2.memoizedState = null), workInProgress2.flags |= 4;
              bubbleProperties(workInProgress2);
              type = false;
            } else
              type = upgradeHydrationErrorsToRecoverable(), null !== current && null !== current.memoizedState && (current.memoizedState.hydrationErrors = type), type = true;
            if (!type) {
              if (workInProgress2.flags & 256)
                return popSuspenseHandler(workInProgress2), workInProgress2;
              popSuspenseHandler(workInProgress2);
              return null;
            }
          }
          popSuspenseHandler(workInProgress2);
          if (0 !== (workInProgress2.flags & 128))
            return workInProgress2.lanes = renderLanes2, workInProgress2;
          renderLanes2 = null !== newProps;
          current = null !== current && null !== current.memoizedState;
          renderLanes2 && (newProps = workInProgress2.child, type = null, null !== newProps.alternate && null !== newProps.alternate.memoizedState && null !== newProps.alternate.memoizedState.cachePool && (type = newProps.alternate.memoizedState.cachePool.pool), nextResource = null, null !== newProps.memoizedState && null !== newProps.memoizedState.cachePool && (nextResource = newProps.memoizedState.
          cachePool.pool), nextResource !== type && (newProps.flags |= 2048));
          renderLanes2 !== current && renderLanes2 && (workInProgress2.child.flags |= 8192);
          scheduleRetryEffect(workInProgress2, workInProgress2.updateQueue);
          bubbleProperties(workInProgress2);
          return null;
        case 4:
          return popHostContainer(), null === current && listenToAllSupportedEvents(workInProgress2.stateNode.containerInfo), workInProgress2.flags |= 67108864, bubbleProperties(workInProgress2), null;
        case 10:
          return popProvider(workInProgress2.type), bubbleProperties(workInProgress2), null;
        case 19:
          popSuspenseListContext(workInProgress2);
          newProps = workInProgress2.memoizedState;
          if (null === newProps) return bubbleProperties(workInProgress2), null;
          type = 0 !== (workInProgress2.flags & 128);
          nextResource = newProps.rendering;
          if (null === nextResource)
            if (type) cutOffTailIfNeeded(newProps, false);
            else {
              if (0 !== workInProgressRootExitStatus || null !== current && 0 !== (current.flags & 128))
                for (current = workInProgress2.child; null !== current; ) {
                  nextResource = findFirstSuspended(current);
                  if (null !== nextResource) {
                    workInProgress2.flags |= 128;
                    cutOffTailIfNeeded(newProps, false);
                    current = nextResource.updateQueue;
                    workInProgress2.updateQueue = current;
                    scheduleRetryEffect(workInProgress2, current);
                    workInProgress2.subtreeFlags = 0;
                    current = renderLanes2;
                    for (renderLanes2 = workInProgress2.child; null !== renderLanes2; )
                      resetWorkInProgress(renderLanes2, current), renderLanes2 = renderLanes2.sibling;
                    pushSuspenseListContext(
                      workInProgress2,
                      suspenseStackCursor.current & 1 | 2
                    );
                    isHydrating && pushTreeFork(workInProgress2, newProps.treeForkCount);
                    return workInProgress2.child;
                  }
                  current = current.sibling;
                }
              null !== newProps.tail && now() > workInProgressRootRenderTargetTime && (workInProgress2.flags |= 128, type = true, cutOffTailIfNeeded(newProps, false), workInProgress2.lanes = 4194304);
            }
          else {
            if (!type)
              if (current = findFirstSuspended(nextResource), null !== current) {
                if (workInProgress2.flags |= 128, type = true, current = current.updateQueue, workInProgress2.updateQueue = current, scheduleRetryEffect(workInProgress2, current), cutOffTailIfNeeded(newProps, true), null === newProps.tail && "collapsed" !== newProps.tailMode && "visible" !== newProps.tailMode && !nextResource.alternate && !isHydrating)
                  return bubbleProperties(workInProgress2), null;
              } else
                2 * now() - newProps.renderingStartTime > workInProgressRootRenderTargetTime && 536870912 !== renderLanes2 && (workInProgress2.flags |= 128, type = true, cutOffTailIfNeeded(newProps, false), workInProgress2.lanes = 4194304);
            newProps.isBackwards ? (nextResource.sibling = workInProgress2.child, workInProgress2.child = nextResource) : (current = newProps.last, null !== current ? current.sibling = nextResource : workInProgress2.child = nextResource, newProps.last = nextResource);
          }
          if (null !== newProps.tail) {
            current = newProps.tail;
            a: {
              for (renderLanes2 = current; null !== renderLanes2; ) {
                if (null !== renderLanes2.alternate) {
                  renderLanes2 = false;
                  break a;
                }
                renderLanes2 = renderLanes2.sibling;
              }
              renderLanes2 = true;
            }
            newProps.rendering = current;
            newProps.tail = current.sibling;
            newProps.renderingStartTime = now();
            current.sibling = null;
            nextResource = suspenseStackCursor.current;
            nextResource = type ? nextResource & 1 | 2 : nextResource & 1;
            "visible" === newProps.tailMode || "collapsed" === newProps.tailMode || !renderLanes2 || isHydrating ? pushSuspenseListContext(workInProgress2, nextResource) : (renderLanes2 = nextResource, push(suspenseHandlerStackCursor, workInProgress2), push(suspenseStackCursor, renderLanes2), null === shellBoundary && (shellBoundary = workInProgress2));
            isHydrating && pushTreeFork(workInProgress2, newProps.treeForkCount);
            return current;
          }
          bubbleProperties(workInProgress2);
          return null;
        case 22:
        case 23:
          return popSuspenseHandler(workInProgress2), popHiddenContext(), newProps = null !== workInProgress2.memoizedState, null !== current ? null !== current.memoizedState !== newProps && (workInProgress2.flags |= 8192) : newProps && (workInProgress2.flags |= 8192), newProps ? 0 !== (renderLanes2 & 536870912) && 0 === (workInProgress2.flags & 128) && (bubbleProperties(workInProgress2), workInProgress2.
          subtreeFlags & 6 && (workInProgress2.flags |= 8192)) : bubbleProperties(workInProgress2), renderLanes2 = workInProgress2.updateQueue, null !== renderLanes2 && scheduleRetryEffect(workInProgress2, renderLanes2.retryQueue), renderLanes2 = null, null !== current && null !== current.memoizedState && null !== current.memoizedState.cachePool && (renderLanes2 = current.memoizedState.cachePool.pool),
          newProps = null, null !== workInProgress2.memoizedState && null !== workInProgress2.memoizedState.cachePool && (newProps = workInProgress2.memoizedState.cachePool.pool), newProps !== renderLanes2 && (workInProgress2.flags |= 2048), null !== current && pop(resumedCache), null;
        case 24:
          return renderLanes2 = null, null !== current && (renderLanes2 = current.memoizedState.cache), workInProgress2.memoizedState.cache !== renderLanes2 && (workInProgress2.flags |= 2048), popProvider(CacheContext), bubbleProperties(workInProgress2), null;
        case 25:
          return null;
        case 30:
          return workInProgress2.flags |= 33554432, bubbleProperties(workInProgress2), null;
      }
      throw Error(formatProdErrorMessage(156, workInProgress2.tag));
    }
    function unwindWork(current, workInProgress2) {
      popTreeContext(workInProgress2);
      switch (workInProgress2.tag) {
        case 1:
          return current = workInProgress2.flags, current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
        case 3:
          return popProvider(CacheContext), popHostContainer(), current = workInProgress2.flags, 0 !== (current & 65536) && 0 === (current & 128) ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
        case 26:
        case 27:
        case 5:
          return popHostContext(workInProgress2), null;
        case 31:
          if (null !== workInProgress2.memoizedState) {
            popSuspenseHandler(workInProgress2);
            if (null === workInProgress2.alternate)
              throw Error(formatProdErrorMessage(340));
            resetHydrationState();
          }
          current = workInProgress2.flags;
          return current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
        case 13:
          popSuspenseHandler(workInProgress2);
          current = workInProgress2.memoizedState;
          if (null !== current && null !== current.dehydrated) {
            if (null === workInProgress2.alternate)
              throw Error(formatProdErrorMessage(340));
            resetHydrationState();
          }
          current = workInProgress2.flags;
          return current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
        case 19:
          return popSuspenseListContext(workInProgress2), current = workInProgress2.flags, current & 65536 ? (workInProgress2.flags = current & -65537 | 128, current = workInProgress2.memoizedState, null !== current && (current.rendering = null, current.tail = null), workInProgress2.flags |= 4, workInProgress2) : null;
        case 4:
          return popHostContainer(), null;
        case 10:
          return popProvider(workInProgress2.type), null;
        case 22:
        case 23:
          return popSuspenseHandler(workInProgress2), popHiddenContext(), null !== current && pop(resumedCache), current = workInProgress2.flags, current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
        case 24:
          return popProvider(CacheContext), null;
        case 25:
          return null;
        default:
          return null;
      }
    }
    function unwindInterruptedWork(current, interruptedWork) {
      popTreeContext(interruptedWork);
      switch (interruptedWork.tag) {
        case 3:
          popProvider(CacheContext);
          popHostContainer();
          break;
        case 26:
        case 27:
        case 5:
          popHostContext(interruptedWork);
          break;
        case 4:
          popHostContainer();
          break;
        case 31:
          null !== interruptedWork.memoizedState && popSuspenseHandler(interruptedWork);
          break;
        case 13:
          popSuspenseHandler(interruptedWork);
          break;
        case 19:
          popSuspenseListContext(interruptedWork);
          break;
        case 10:
          popProvider(interruptedWork.type);
          break;
        case 22:
        case 23:
          popSuspenseHandler(interruptedWork);
          popHiddenContext();
          null !== current && pop(resumedCache);
          break;
        case 24:
          popProvider(CacheContext);
      }
    }
    function commitHookEffectListMount(flags, finishedWork) {
      try {
        var updateQueue = finishedWork.updateQueue, lastEffect = null !== updateQueue ? updateQueue.lastEffect : null;
        if (null !== lastEffect) {
          var firstEffect = lastEffect.next;
          updateQueue = firstEffect;
          do {
            if ((updateQueue.tag & flags) === flags) {
              lastEffect = void 0;
              var create = updateQueue.create, inst = updateQueue.inst;
              lastEffect = create();
              inst.destroy = lastEffect;
            }
            updateQueue = updateQueue.next;
          } while (updateQueue !== firstEffect);
        }
      } catch (error) {
        captureCommitPhaseError(finishedWork, finishedWork.return, error);
      }
    }
    function commitHookEffectListUnmount(flags, finishedWork, nearestMountedAncestor$jscomp$0) {
      try {
        var updateQueue = finishedWork.updateQueue, lastEffect = null !== updateQueue ? updateQueue.lastEffect : null;
        if (null !== lastEffect) {
          var firstEffect = lastEffect.next;
          updateQueue = firstEffect;
          do {
            if ((updateQueue.tag & flags) === flags) {
              var inst = updateQueue.inst, destroy = inst.destroy;
              if (void 0 !== destroy) {
                inst.destroy = void 0;
                lastEffect = finishedWork;
                var nearestMountedAncestor = nearestMountedAncestor$jscomp$0, destroy_ = destroy;
                try {
                  destroy_();
                } catch (error) {
                  captureCommitPhaseError(
                    lastEffect,
                    nearestMountedAncestor,
                    error
                  );
                }
              }
            }
            updateQueue = updateQueue.next;
          } while (updateQueue !== firstEffect);
        }
      } catch (error) {
        captureCommitPhaseError(finishedWork, finishedWork.return, error);
      }
    }
    function commitClassCallbacks(finishedWork) {
      var updateQueue = finishedWork.updateQueue;
      if (null !== updateQueue) {
        var instance = finishedWork.stateNode;
        try {
          commitCallbacks(updateQueue, instance);
        } catch (error) {
          captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
      }
    }
    function safelyCallComponentWillUnmount(current, nearestMountedAncestor, instance) {
      instance.props = resolveClassComponentProps(
        current.type,
        current.memoizedProps
      );
      instance.state = current.memoizedState;
      try {
        instance.componentWillUnmount();
      } catch (error) {
        captureCommitPhaseError(current, nearestMountedAncestor, error);
      }
    }
    function safelyAttachRef(current, nearestMountedAncestor) {
      try {
        var ref = current.ref;
        if (null !== ref) {
          switch (current.tag) {
            case 26:
            case 27:
            case 5:
              var instanceToUse = current.stateNode;
              break;
            case 30:
              var instance = current.stateNode, name = getViewTransitionName(current.memoizedProps, instance);
              if (null === instance.ref || instance.ref.name !== name)
                instance.ref = createViewTransitionInstance(name);
              instanceToUse = instance.ref;
              break;
            case 7:
              if (null === current.stateNode) {
                var fragmentInstance = new FragmentInstance(current);
                traverseVisibleInstancesAndTextInstances(
                  current.child,
                  false,
                  addFragmentHandleToFiber,
                  fragmentInstance,
                  void 0,
                  void 0
                );
                current.stateNode = fragmentInstance;
              }
              instanceToUse = current.stateNode;
              break;
            default:
              instanceToUse = current.stateNode;
          }
          "function" === typeof ref ? current.refCleanup = ref(instanceToUse) : ref.current = instanceToUse;
        }
      } catch (error) {
        captureCommitPhaseError(current, nearestMountedAncestor, error);
      }
    }
    function safelyDetachRef(current, nearestMountedAncestor) {
      var ref = current.ref, refCleanup = current.refCleanup;
      if (null !== ref)
        if ("function" === typeof refCleanup)
          try {
            refCleanup();
          } catch (error) {
            captureCommitPhaseError(current, nearestMountedAncestor, error);
          } finally {
            current.refCleanup = null, current = current.alternate, null != current && (current.refCleanup = null);
          }
        else if ("function" === typeof ref)
          try {
            ref(null);
          } catch (error$148) {
            captureCommitPhaseError(current, nearestMountedAncestor, error$148);
          }
        else ref.current = null;
    }
    function commitNewChildToFragmentInstances(fiber, parentFragmentInstances) {
      if ((5 === fiber.tag || 27 === fiber.tag || 6 === fiber.tag) && null === fiber.alternate && null !== parentFragmentInstances)
        for (var i = 0; i < parentFragmentInstances.length; i++)
          commitNewChildToFragmentInstance(
            fiber.stateNode,
            parentFragmentInstances[i]
          );
    }
    function commitFragmentInstanceInsertionEffects(fiber) {
      for (var parent = fiber.return; null !== parent; ) {
        isFragmentInstanceParent(parent) && commitNewChildToFragmentInstance(fiber.stateNode, parent.stateNode);
        if (isFragmentInstanceHostBoundary(parent)) break;
        parent = parent.return;
      }
    }
    function commitFragmentInstanceDeletionEffects(fiber) {
      for (var parent = fiber.return; null !== parent; ) {
        isFragmentInstanceParent(parent) && deleteChildFromFragmentInstance(fiber.stateNode, parent.stateNode);
        if (isFragmentInstanceHostBoundary(parent)) break;
        parent = parent.return;
      }
    }
    function isFragmentInstanceHostBoundary(fiber) {
      return 5 === fiber.tag || 3 === fiber.tag || 27 === fiber.tag;
    }
    function isFragmentInstanceParent(fiber) {
      return fiber && 7 === fiber.tag && null !== fiber.stateNode;
    }
    function commitHostMount(finishedWork) {
      var type = finishedWork.type, props = finishedWork.memoizedProps, instance = finishedWork.stateNode;
      try {
        a: switch (type) {
          case "button":
          case "input":
          case "select":
          case "textarea":
            props.autoFocus && instance.focus();
            break a;
          case "img":
            props.src ? instance.src = props.src : props.srcSet && (instance.srcset = props.srcSet);
        }
      } catch (error) {
        captureCommitPhaseError(finishedWork, finishedWork.return, error);
      }
    }
    function commitHostUpdate(finishedWork, newProps, oldProps) {
      try {
        var domElement = finishedWork.stateNode;
        updateProperties(domElement, finishedWork.type, oldProps, newProps);
        domElement[internalPropsKey] = newProps;
      } catch (error) {
        captureCommitPhaseError(finishedWork, finishedWork.return, error);
      }
    }
    function isHostParent(fiber) {
      return 5 === fiber.tag || 3 === fiber.tag || 26 === fiber.tag || 27 === fiber.tag && isSingletonScope(fiber.type) || 4 === fiber.tag;
    }
    function getHostSibling(fiber) {
      a: for (; ; ) {
        for (; null === fiber.sibling; ) {
          if (null === fiber.return || isHostParent(fiber.return)) return null;
          fiber = fiber.return;
        }
        fiber.sibling.return = fiber.return;
        for (fiber = fiber.sibling; 5 !== fiber.tag && 6 !== fiber.tag && 18 !== fiber.tag; ) {
          if (27 === fiber.tag && isSingletonScope(fiber.type)) continue a;
          if (fiber.flags & 2) continue a;
          if (null === fiber.child || 4 === fiber.tag) continue a;
          else fiber.child.return = fiber, fiber = fiber.child;
        }
        if (!(fiber.flags & 2)) return fiber.stateNode;
      }
    }
    function insertOrAppendPlacementNodeIntoContainer(node, before, parent, parentFragmentInstances) {
      var tag = node.tag;
      if (5 === tag || 6 === tag)
        tag = node.stateNode, before ? (9 === parent.nodeType ? parent.body : "HTML" === parent.nodeName ? parent.ownerDocument.body : parent).insertBefore(tag, before) : (before = 9 === parent.nodeType ? parent.body : "HTML" === parent.nodeName ? parent.ownerDocument.body : parent, before.appendChild(tag), parent = parent._reactRootContainer, null !== parent && void 0 !== parent || null !== before.
        onclick || (before.onclick = noop$1)), commitNewChildToFragmentInstances(node, parentFragmentInstances), viewTransitionMutationContext = true;
      else if (4 !== tag && (27 === tag && (commitNewChildToFragmentInstances(node, parentFragmentInstances), parentFragmentInstances = null, isSingletonScope(node.type) && (parent = node.stateNode, before = null)), node = node.child, null !== node))
        for (insertOrAppendPlacementNodeIntoContainer(
          node,
          before,
          parent,
          parentFragmentInstances
        ), node = node.sibling; null !== node; )
          insertOrAppendPlacementNodeIntoContainer(
            node,
            before,
            parent,
            parentFragmentInstances
          ), node = node.sibling;
    }
    function insertOrAppendPlacementNode(node, before, parent, parentFragmentInstances) {
      var tag = node.tag;
      if (5 === tag || 6 === tag)
        tag = node.stateNode, before ? parent.insertBefore(tag, before) : parent.appendChild(tag), commitNewChildToFragmentInstances(node, parentFragmentInstances), viewTransitionMutationContext = true;
      else if (4 !== tag && (27 === tag && (commitNewChildToFragmentInstances(node, parentFragmentInstances), parentFragmentInstances = null, isSingletonScope(node.type) && (parent = node.stateNode)), node = node.child, null !== node))
        for (insertOrAppendPlacementNode(
          node,
          before,
          parent,
          parentFragmentInstances
        ), node = node.sibling; null !== node; )
          insertOrAppendPlacementNode(
            node,
            before,
            parent,
            parentFragmentInstances
          ), node = node.sibling;
    }
    function commitHostSingletonAcquisition(finishedWork) {
      var singleton = finishedWork.stateNode, props = finishedWork.memoizedProps;
      try {
        for (var type = finishedWork.type, attributes = singleton.attributes; attributes.length; )
          singleton.removeAttributeNode(attributes[0]);
        setInitialProperties(singleton, type, props);
        singleton[internalInstanceKey] = finishedWork;
        singleton[internalPropsKey] = props;
      } catch (error) {
        captureCommitPhaseError(finishedWork, finishedWork.return, error);
      }
    }
    var shouldStartViewTransition = false;
    var appearingViewTransitions = null;
    function trackEnterViewTransitions(placement) {
      if (30 === placement.tag || 0 !== (placement.subtreeFlags & 33554432))
        shouldStartViewTransition = true;
    }
    var viewTransitionCancelableChildren = null;
    function pushViewTransitionCancelableScope() {
      var prevChildren = viewTransitionCancelableChildren;
      viewTransitionCancelableChildren = null;
      return prevChildren;
    }
    var viewTransitionHostInstanceIdx = 0;
    function applyViewTransitionToHostInstances(fiber, name, className, collectMeasurements, stopAtNestedViewTransitions) {
      viewTransitionHostInstanceIdx = 0;
      return applyViewTransitionToHostInstancesRecursive(
        fiber.child,
        name,
        className,
        collectMeasurements,
        stopAtNestedViewTransitions
      );
    }
    function applyViewTransitionToHostInstancesRecursive(child, name, className, collectMeasurements, stopAtNestedViewTransitions) {
      for (var inViewport = false; null !== child; ) {
        if (5 === child.tag) {
          var instance = child.stateNode;
          if (null !== collectMeasurements) {
            var measurement = measureInstance(instance);
            collectMeasurements.push(measurement);
            measurement.view && (inViewport = true);
          } else
            inViewport || measureInstance(instance).view && (inViewport = true);
          shouldStartViewTransition = true;
          applyViewTransitionName(
            instance,
            0 === viewTransitionHostInstanceIdx ? name : name + "_" + viewTransitionHostInstanceIdx,
            className
          );
          viewTransitionHostInstanceIdx++;
        } else if (22 !== child.tag || null === child.memoizedState)
          30 === child.tag && stopAtNestedViewTransitions || applyViewTransitionToHostInstancesRecursive(
            child.child,
            name,
            className,
            collectMeasurements,
            stopAtNestedViewTransitions
          ) && (inViewport = true);
        child = child.sibling;
      }
      return inViewport;
    }
    function restoreViewTransitionOnHostInstances(child, stopAtNestedViewTransitions) {
      for (; null !== child; ) {
        if (5 === child.tag)
          restoreViewTransitionName(child.stateNode, child.memoizedProps);
        else if (22 !== child.tag || null === child.memoizedState)
          30 === child.tag && stopAtNestedViewTransitions || restoreViewTransitionOnHostInstances(
            child.child,
            stopAtNestedViewTransitions
          );
        child = child.sibling;
      }
    }
    function commitAppearingPairViewTransitions(placement) {
      if (0 !== (placement.subtreeFlags & 18874368))
        for (placement = placement.child; null !== placement; ) {
          if (22 !== placement.tag || null === placement.memoizedState) {
            if (commitAppearingPairViewTransitions(placement), 30 === placement.tag && 0 !== (placement.flags & 18874368) && placement.stateNode.paired) {
              var props = placement.memoizedProps;
              if (null == props.name || "auto" === props.name)
                throw Error(formatProdErrorMessage(544));
              var name = props.name;
              props = getViewTransitionClassName(props.default, props.share);
              "none" !== props && (applyViewTransitionToHostInstances(
                placement,
                name,
                props,
                null,
                false
              ) || restoreViewTransitionOnHostInstances(placement.child, false));
            }
          }
          placement = placement.sibling;
        }
    }
    function commitEnterViewTransitions(placement, gesture) {
      if (30 === placement.tag) {
        var state = placement.stateNode, props = placement.memoizedProps, name = getViewTransitionName(props, state), className = getViewTransitionClassName(
          props.default,
          state.paired ? props.share : props.enter
        );
        "none" !== className ? applyViewTransitionToHostInstances(placement, name, className, null, false) ? (commitAppearingPairViewTransitions(placement), state.paired || gesture || scheduleViewTransitionEvent(placement, props.onEnter)) : restoreViewTransitionOnHostInstances(placement.child, false) : commitAppearingPairViewTransitions(placement);
      } else if (0 !== (placement.subtreeFlags & 33554432))
        for (placement = placement.child; null !== placement; )
          commitEnterViewTransitions(placement, gesture), placement = placement.sibling;
      else commitAppearingPairViewTransitions(placement);
    }
    function commitDeletedPairViewTransitions(deletion) {
      if (null !== appearingViewTransitions && 0 !== appearingViewTransitions.size) {
        var pairs = appearingViewTransitions;
        if (0 !== (deletion.subtreeFlags & 18874368))
          for (deletion = deletion.child; null !== deletion; ) {
            if (22 !== deletion.tag || null === deletion.memoizedState) {
              if (30 === deletion.tag && 0 !== (deletion.flags & 18874368)) {
                var props = deletion.memoizedProps, name = props.name;
                if (null != name && "auto" !== name) {
                  var pair = pairs.get(name);
                  if (void 0 !== pair) {
                    var className = getViewTransitionClassName(
                      props.default,
                      props.share
                    );
                    "none" !== className && (applyViewTransitionToHostInstances(
                      deletion,
                      name,
                      className,
                      null,
                      false
                    ) ? (className = deletion.stateNode, pair.paired = className, className.paired = pair, scheduleViewTransitionEvent(deletion, props.onShare)) : restoreViewTransitionOnHostInstances(deletion.child, false));
                    pairs.delete(name);
                    if (0 === pairs.size) break;
                  }
                }
              }
              commitDeletedPairViewTransitions(deletion);
            }
            deletion = deletion.sibling;
          }
      }
    }
    function commitExitViewTransitions(deletion) {
      if (30 === deletion.tag) {
        var props = deletion.memoizedProps, name = getViewTransitionName(props, deletion.stateNode), pair = null !== appearingViewTransitions ? appearingViewTransitions.get(name) : void 0, className = getViewTransitionClassName(
          props.default,
          void 0 !== pair ? props.share : props.exit
        );
        "none" !== className && (applyViewTransitionToHostInstances(deletion, name, className, null, false) ? void 0 !== pair ? (className = deletion.stateNode, pair.paired = className, className.paired = pair, appearingViewTransitions.delete(name), scheduleViewTransitionEvent(deletion, props.onShare)) : scheduleViewTransitionEvent(deletion, props.onExit) : restoreViewTransitionOnHostInstances(deletion.
        child, false));
        null !== appearingViewTransitions && commitDeletedPairViewTransitions(deletion);
      } else if (0 !== (deletion.subtreeFlags & 33554432))
        for (deletion = deletion.child; null !== deletion; )
          commitExitViewTransitions(deletion), deletion = deletion.sibling;
      else
        null !== appearingViewTransitions && commitDeletedPairViewTransitions(deletion);
    }
    function commitNestedViewTransitions(changedParent) {
      for (changedParent = changedParent.child; null !== changedParent; ) {
        if (30 === changedParent.tag) {
          var props = changedParent.memoizedProps, name = getViewTransitionName(props, changedParent.stateNode);
          props = getViewTransitionClassName(props.default, props.update);
          changedParent.flags &= -5;
          "none" !== props && applyViewTransitionToHostInstances(
            changedParent,
            name,
            props,
            changedParent.memoizedState = [],
            false
          );
        } else
          0 !== (changedParent.subtreeFlags & 33554432) && commitNestedViewTransitions(changedParent);
        changedParent = changedParent.sibling;
      }
    }
    function restorePairedViewTransitions(parent) {
      if (0 !== (parent.subtreeFlags & 18874368))
        for (parent = parent.child; null !== parent; ) {
          if (22 !== parent.tag || null === parent.memoizedState) {
            if (30 === parent.tag && 0 !== (parent.flags & 18874368)) {
              var instance = parent.stateNode;
              null !== instance.paired && (instance.paired = null, restoreViewTransitionOnHostInstances(parent.child, false));
            }
            restorePairedViewTransitions(parent);
          }
          parent = parent.sibling;
        }
    }
    function restoreEnterOrExitViewTransitions(fiber) {
      if (30 === fiber.tag)
        fiber.stateNode.paired = null, restoreViewTransitionOnHostInstances(fiber.child, false), restorePairedViewTransitions(fiber);
      else if (0 !== (fiber.subtreeFlags & 33554432))
        for (fiber = fiber.child; null !== fiber; )
          restoreEnterOrExitViewTransitions(fiber), fiber = fiber.sibling;
      else restorePairedViewTransitions(fiber);
    }
    function restoreNestedViewTransitions(changedParent) {
      for (changedParent = changedParent.child; null !== changedParent; )
        30 === changedParent.tag ? restoreViewTransitionOnHostInstances(changedParent.child, false) : 0 !== (changedParent.subtreeFlags & 33554432) && restoreNestedViewTransitions(changedParent), changedParent = changedParent.sibling;
    }
    function measureViewTransitionHostInstancesRecursive(parentViewTransition, child, newName, oldName, className, previousMeasurements, stopAtNestedViewTransitions) {
      for (var inViewport = false; null !== child; ) {
        if (5 === child.tag) {
          var instance = child.stateNode;
          if (null !== previousMeasurements && viewTransitionHostInstanceIdx < previousMeasurements.length) {
            var previousMeasurement = previousMeasurements[viewTransitionHostInstanceIdx], nextMeasurement = measureInstance(instance);
            if (previousMeasurement.view || nextMeasurement.view) inViewport = true;
            var JSCompiler_temp;
            if (JSCompiler_temp = 0 === (parentViewTransition.flags & 4))
              if (nextMeasurement.clip) JSCompiler_temp = true;
              else {
                JSCompiler_temp = previousMeasurement.rect;
                var newRect = nextMeasurement.rect;
                JSCompiler_temp = JSCompiler_temp.y !== newRect.y || JSCompiler_temp.x !== newRect.x || JSCompiler_temp.height !== newRect.height || JSCompiler_temp.width !== newRect.width;
              }
            JSCompiler_temp && (parentViewTransition.flags |= 4);
            nextMeasurement.abs ? nextMeasurement = !previousMeasurement.abs : (previousMeasurement = previousMeasurement.rect, nextMeasurement = nextMeasurement.rect, nextMeasurement = previousMeasurement.height !== nextMeasurement.height || previousMeasurement.width !== nextMeasurement.width);
            nextMeasurement && (parentViewTransition.flags |= 32);
          } else parentViewTransition.flags |= 32;
          0 !== (parentViewTransition.flags & 4) && applyViewTransitionName(
            instance,
            0 === viewTransitionHostInstanceIdx ? newName : newName + "_" + viewTransitionHostInstanceIdx,
            className
          );
          inViewport && 0 !== (parentViewTransition.flags & 4) || (null === viewTransitionCancelableChildren && (viewTransitionCancelableChildren = []), viewTransitionCancelableChildren.push(
            instance,
            0 === viewTransitionHostInstanceIdx ? oldName : oldName + "_" + viewTransitionHostInstanceIdx,
            child.memoizedProps
          ));
          viewTransitionHostInstanceIdx++;
        } else if (22 !== child.tag || null === child.memoizedState)
          30 === child.tag && stopAtNestedViewTransitions ? parentViewTransition.flags |= child.flags & 32 : measureViewTransitionHostInstancesRecursive(
            parentViewTransition,
            child.child,
            newName,
            oldName,
            className,
            previousMeasurements,
            stopAtNestedViewTransitions
          ) && (inViewport = true);
        child = child.sibling;
      }
      return inViewport;
    }
    function measureNestedViewTransitions(changedParent, gesture) {
      for (changedParent = changedParent.child; null !== changedParent; ) {
        if (30 === changedParent.tag) {
          var props = changedParent.memoizedProps, state = changedParent.stateNode, name = getViewTransitionName(props, state), className = getViewTransitionClassName(props.default, props.update);
          if (gesture) {
            state = state.clones;
            var previousMeasurements = null === state ? null : state.map(measureClonedInstance);
          } else
            previousMeasurements = changedParent.memoizedState, changedParent.memoizedState = null;
          state = changedParent;
          var child = changedParent.child;
          viewTransitionHostInstanceIdx = 0;
          name = measureViewTransitionHostInstancesRecursive(
            state,
            child,
            name,
            name,
            className,
            previousMeasurements,
            false
          );
          0 !== (changedParent.flags & 4) && name && (gesture || scheduleViewTransitionEvent(changedParent, props.onUpdate));
        } else
          0 !== (changedParent.subtreeFlags & 33554432) && measureNestedViewTransitions(changedParent, gesture);
        changedParent = changedParent.sibling;
      }
    }
    var offscreenSubtreeIsHidden = false;
    var offscreenSubtreeWasHidden = false;
    var offscreenDirectParentIsHidden = false;
    var needsFormReset = false;
    var PossiblyWeakSet = "function" === typeof WeakSet ? WeakSet : Set;
    var nextEffect = null;
    var viewTransitionContextChanged = false;
    var inUpdateViewTransition = false;
    var rootViewTransitionAffected = false;
    var rootViewTransitionNameCanceled = false;
    function commitBeforeMutationEffects(root2, firstChild, committedLanes) {
      root2 = root2.containerInfo;
      eventsEnabled = _enabled;
      root2 = getActiveElementDeep(root2);
      if (hasSelectionCapabilities(root2)) {
        if ("selectionStart" in root2)
          var JSCompiler_temp = {
            start: root2.selectionStart,
            end: root2.selectionEnd
          };
        else
          a: {
            JSCompiler_temp = (JSCompiler_temp = root2.ownerDocument) && JSCompiler_temp.defaultView || window;
            var selection = JSCompiler_temp.getSelection && JSCompiler_temp.getSelection();
            if (selection && 0 !== selection.rangeCount) {
              JSCompiler_temp = selection.anchorNode;
              var anchorOffset = selection.anchorOffset, focusNode = selection.focusNode;
              selection = selection.focusOffset;
              try {
                JSCompiler_temp.nodeType, focusNode.nodeType;
              } catch (e$21) {
                JSCompiler_temp = null;
                break a;
              }
              var length = 0, start = -1, end = -1, indexWithinAnchor = 0, indexWithinFocus = 0, node = root2, parentNode = null;
              b: for (; ; ) {
                for (var next; ; ) {
                  node !== JSCompiler_temp || 0 !== anchorOffset && 3 !== node.nodeType || (start = length + anchorOffset);
                  node !== focusNode || 0 !== selection && 3 !== node.nodeType || (end = length + selection);
                  3 === node.nodeType && (length += node.nodeValue.length);
                  if (null === (next = node.firstChild)) break;
                  parentNode = node;
                  node = next;
                }
                for (; ; ) {
                  if (node === root2) break b;
                  parentNode === JSCompiler_temp && ++indexWithinAnchor === anchorOffset && (start = length);
                  parentNode === focusNode && ++indexWithinFocus === selection && (end = length);
                  if (null !== (next = node.nextSibling)) break;
                  node = parentNode;
                  parentNode = node.parentNode;
                }
                node = next;
              }
              JSCompiler_temp = -1 === start || -1 === end ? null : { start, end };
            } else JSCompiler_temp = null;
          }
        JSCompiler_temp = JSCompiler_temp || { start: 0, end: 0 };
      } else JSCompiler_temp = null;
      selectionInformation = { focusedElem: root2, selectionRange: JSCompiler_temp };
      _enabled = false;
      committedLanes = (committedLanes & 335544064) === committedLanes;
      nextEffect = firstChild;
      for (firstChild = committedLanes ? 9270 : 1024; null !== nextEffect; ) {
        root2 = nextEffect;
        if (committedLanes && (JSCompiler_temp = root2.deletions, null !== JSCompiler_temp))
          for (anchorOffset = 0; anchorOffset < JSCompiler_temp.length; anchorOffset++)
            committedLanes && commitExitViewTransitions(JSCompiler_temp[anchorOffset]);
        if (null === root2.alternate && 0 !== (root2.flags & 2))
          committedLanes && trackEnterViewTransitions(root2), commitBeforeMutationEffects_complete(committedLanes);
        else {
          if (22 === root2.tag) {
            if (JSCompiler_temp = root2.alternate, null !== root2.memoizedState) {
              null !== JSCompiler_temp && null === JSCompiler_temp.memoizedState && committedLanes && commitExitViewTransitions(JSCompiler_temp);
              commitBeforeMutationEffects_complete(committedLanes);
              continue;
            } else if (null !== JSCompiler_temp && null !== JSCompiler_temp.memoizedState) {
              committedLanes && trackEnterViewTransitions(root2);
              commitBeforeMutationEffects_complete(committedLanes);
              continue;
            }
          }
          JSCompiler_temp = root2.child;
          0 !== (root2.subtreeFlags & firstChild) && null !== JSCompiler_temp ? (JSCompiler_temp.return = root2, nextEffect = JSCompiler_temp) : (committedLanes && commitNestedViewTransitions(root2), commitBeforeMutationEffects_complete(committedLanes));
        }
      }
      appearingViewTransitions = null;
    }
    function commitBeforeMutationEffects_complete(isViewTransitionEligible$jscomp$0) {
      for (; null !== nextEffect; ) {
        var fiber = nextEffect, isViewTransitionEligible = isViewTransitionEligible$jscomp$0, current = fiber.alternate, flags = fiber.flags;
        switch (fiber.tag) {
          case 0:
          case 11:
          case 15:
            break;
          case 1:
            if (0 !== (flags & 1024) && null !== current) {
              isViewTransitionEligible = void 0;
              flags = current.memoizedProps;
              current = current.memoizedState;
              var instance = fiber.stateNode;
              try {
                var resolvedPrevProps = resolveClassComponentProps(
                  fiber.type,
                  flags
                );
                isViewTransitionEligible = instance.getSnapshotBeforeUpdate(
                  resolvedPrevProps,
                  current
                );
                instance.__reactInternalSnapshotBeforeUpdate = isViewTransitionEligible;
              } catch (error) {
                captureCommitPhaseError(fiber, fiber.return, error);
              }
            }
            break;
          case 3:
            if (0 !== (flags & 1024)) {
              if (current = fiber.stateNode.containerInfo, isViewTransitionEligible = current.nodeType, 9 === isViewTransitionEligible)
                clearContainerSparingly(current);
              else if (1 === isViewTransitionEligible)
                switch (current.nodeName) {
                  case "HEAD":
                  case "HTML":
                  case "BODY":
                    clearContainerSparingly(current);
                    break;
                  default:
                    current.textContent = "";
                }
            }
            break;
          case 5:
          case 26:
          case 27:
          case 6:
          case 4:
          case 17:
            break;
          case 30:
            isViewTransitionEligible && null !== current && (isViewTransitionEligible = getViewTransitionName(
              current.memoizedProps,
              current.stateNode
            ), flags = fiber.memoizedProps, flags = getViewTransitionClassName(flags.default, flags.update), "none" !== flags && applyViewTransitionToHostInstances(
              current,
              isViewTransitionEligible,
              flags,
              current.memoizedState = [],
              true
            ));
            break;
          default:
            if (0 !== (flags & 1024)) throw Error(formatProdErrorMessage(163));
        }
        current = fiber.sibling;
        if (null !== current) {
          current.return = fiber.return;
          nextEffect = current;
          break;
        }
        nextEffect = fiber.return;
      }
    }
    function commitLayoutEffectOnFiber(finishedRoot, current, finishedWork) {
      var flags = finishedWork.flags;
      switch (finishedWork.tag) {
        case 0:
        case 11:
        case 15:
          recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
          flags & 4 && commitHookEffectListMount(5, finishedWork);
          break;
        case 1:
          recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
          if (flags & 4)
            if (finishedRoot = finishedWork.stateNode, null === current)
              try {
                finishedRoot.componentDidMount();
              } catch (error) {
                captureCommitPhaseError(finishedWork, finishedWork.return, error);
              }
            else {
              var prevProps = resolveClassComponentProps(
                finishedWork.type,
                current.memoizedProps
              );
              current = current.memoizedState;
              try {
                finishedRoot.componentDidUpdate(
                  prevProps,
                  current,
                  finishedRoot.__reactInternalSnapshotBeforeUpdate
                );
              } catch (error$146) {
                captureCommitPhaseError(
                  finishedWork,
                  finishedWork.return,
                  error$146
                );
              }
            }
          flags & 64 && commitClassCallbacks(finishedWork);
          flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
          break;
        case 3:
          recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
          if (flags & 64 && (finishedRoot = finishedWork.updateQueue, null !== finishedRoot)) {
            current = null;
            if (null !== finishedWork.child)
              switch (finishedWork.child.tag) {
                case 27:
                case 5:
                  current = finishedWork.child.stateNode;
                  break;
                case 1:
                  current = finishedWork.child.stateNode;
              }
            try {
              commitCallbacks(finishedRoot, current);
            } catch (error) {
              captureCommitPhaseError(finishedWork, finishedWork.return, error);
            }
          }
          break;
        case 27:
          null === current && flags & 4 && commitHostSingletonAcquisition(finishedWork);
        case 26:
        case 5:
          recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
          null === current && flags & 4 && commitHostMount(finishedWork);
          flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
          break;
        case 12:
          recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
          break;
        case 31:
          recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
          flags & 4 && commitActivityHydrationCallbacks(finishedRoot, finishedWork);
          break;
        case 13:
          recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
          flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
          flags & 64 && (finishedRoot = finishedWork.memoizedState, null !== finishedRoot && (finishedRoot = finishedRoot.dehydrated, null !== finishedRoot && (finishedWork = retryDehydratedSuspenseBoundary.bind(
            null,
            finishedWork
          ), registerSuspenseInstanceRetry(finishedRoot, finishedWork))));
          break;
        case 22:
          flags = null !== finishedWork.memoizedState || offscreenSubtreeIsHidden;
          if (!flags) {
            var newOffscreenSubtreeWasHidden = null !== current && null !== current.memoizedState || offscreenSubtreeWasHidden;
            current = offscreenSubtreeIsHidden;
            prevProps = offscreenSubtreeWasHidden;
            offscreenSubtreeIsHidden = flags;
            (offscreenSubtreeWasHidden = newOffscreenSubtreeWasHidden) && !prevProps ? (flags = 2, 0 !== (finishedWork.subtreeFlags & 8772) && (flags |= 1), recursivelyTraverseReappearLayoutEffects(
              finishedRoot,
              finishedWork,
              flags
            )) : recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
            offscreenSubtreeIsHidden = current;
            offscreenSubtreeWasHidden = prevProps;
          }
          break;
        case 30:
          recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
          flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
          break;
        case 7:
          flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
        default:
          recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
      }
    }
    function hideOrUnhideAllChildren(parentFiber, isHidden) {
      for (parentFiber = parentFiber.child; null !== parentFiber; )
        hideOrUnhideAllChildrenOnFiber(parentFiber, isHidden), parentFiber = parentFiber.sibling;
    }
    function hideOrUnhideAllChildrenOnFiber(fiber, isHidden) {
      switch (fiber.tag) {
        case 5:
        case 26:
          try {
            var instance = fiber.stateNode;
            if (isHidden) {
              var style2 = instance.style;
              "function" === typeof style2.setProperty ? style2.setProperty("display", "none", "important") : style2.display = "none";
            } else {
              var instance$jscomp$0 = fiber.stateNode, styleProp = fiber.memoizedProps.style, display = void 0 !== styleProp && null !== styleProp && styleProp.hasOwnProperty("display") ? styleProp.display : null;
              instance$jscomp$0.style.display = null == display || "boolean" === typeof display ? "" : ("" + display).trim();
            }
          } catch (error) {
            captureCommitPhaseError(fiber, fiber.return, error);
          }
          hideOrUnhideNearestPortals(fiber, isHidden);
          break;
        case 6:
          try {
            fiber.stateNode.nodeValue = isHidden ? "" : fiber.memoizedProps, viewTransitionMutationContext = true;
          } catch (error) {
            captureCommitPhaseError(fiber, fiber.return, error);
          }
          break;
        case 18:
          try {
            var instance$jscomp$1 = fiber.stateNode;
            isHidden ? hideOrUnhideDehydratedBoundary(instance$jscomp$1, true) : hideOrUnhideDehydratedBoundary(fiber.stateNode, false);
          } catch (error) {
            captureCommitPhaseError(fiber, fiber.return, error);
          }
          break;
        case 22:
        case 23:
          null === fiber.memoizedState && hideOrUnhideAllChildren(fiber, isHidden);
          break;
        default:
          hideOrUnhideAllChildren(fiber, isHidden);
      }
    }
    function hideOrUnhideNearestPortals(parentFiber, isHidden$jscomp$0) {
      if (parentFiber.subtreeFlags & 67108864)
        for (parentFiber = parentFiber.child; null !== parentFiber; ) {
          a: {
            var fiber = parentFiber, isHidden = isHidden$jscomp$0;
            switch (fiber.tag) {
              case 4:
                hideOrUnhideAllChildrenOnFiber(fiber, isHidden);
                break a;
              case 22:
                null === fiber.memoizedState && hideOrUnhideNearestPortals(fiber, isHidden);
                break a;
              default:
                hideOrUnhideNearestPortals(fiber, isHidden);
            }
          }
          parentFiber = parentFiber.sibling;
        }
    }
    function detachFiberAfterEffects(fiber) {
      var alternate = fiber.alternate;
      null !== alternate && (fiber.alternate = null, detachFiberAfterEffects(alternate));
      fiber.child = null;
      fiber.deletions = null;
      fiber.sibling = null;
      5 === fiber.tag && (alternate = fiber.stateNode, null !== alternate && detachDeletedInstance(alternate));
      fiber.stateNode = null;
      fiber.return = null;
      fiber.dependencies = null;
      fiber.memoizedProps = null;
      fiber.memoizedState = null;
      fiber.pendingProps = null;
      fiber.stateNode = null;
      fiber.updateQueue = null;
    }
    var hostParent = null;
    var hostParentIsContainer = false;
    function recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, parent) {
      for (parent = parent.child; null !== parent; )
        commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, parent), parent = parent.sibling;
    }
    function commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, deletedFiber) {
      if (injectedHook && "function" === typeof injectedHook.onCommitFiberUnmount)
        try {
          injectedHook.onCommitFiberUnmount(rendererID, deletedFiber);
        } catch (err) {
        }
      switch (deletedFiber.tag) {
        case 26:
          offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
          recursivelyTraverseDeletionEffects(
            finishedRoot,
            nearestMountedAncestor,
            deletedFiber
          );
          deletedFiber.memoizedState ? deletedFiber.memoizedState.count-- : deletedFiber.stateNode && !offscreenSubtreeWasHidden && (deletedFiber = deletedFiber.stateNode, deletedFiber.parentNode.removeChild(deletedFiber));
          break;
        case 27:
          offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
          commitFragmentInstanceDeletionEffects(deletedFiber);
          var prevHostParent = hostParent, prevHostParentIsContainer = hostParentIsContainer;
          isSingletonScope(deletedFiber.type) && (hostParent = deletedFiber.stateNode, hostParentIsContainer = false);
          recursivelyTraverseDeletionEffects(
            finishedRoot,
            nearestMountedAncestor,
            deletedFiber
          );
          releaseSingletonInstance(
            deletedFiber.stateNode,
            deletedFiber.type,
            deletedFiber.memoizedProps
          );
          hostParent = prevHostParent;
          hostParentIsContainer = prevHostParentIsContainer;
          break;
        case 5:
          offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor), commitFragmentInstanceDeletionEffects(deletedFiber);
        case 6:
          6 === deletedFiber.tag && commitFragmentInstanceDeletionEffects(deletedFiber);
          prevHostParent = hostParent;
          prevHostParentIsContainer = hostParentIsContainer;
          hostParent = null;
          recursivelyTraverseDeletionEffects(
            finishedRoot,
            nearestMountedAncestor,
            deletedFiber
          );
          hostParent = prevHostParent;
          hostParentIsContainer = prevHostParentIsContainer;
          if (null !== hostParent)
            if (hostParentIsContainer)
              try {
                (9 === hostParent.nodeType ? hostParent.body : "HTML" === hostParent.nodeName ? hostParent.ownerDocument.body : hostParent).removeChild(deletedFiber.stateNode), viewTransitionMutationContext = true;
              } catch (error) {
                captureCommitPhaseError(
                  deletedFiber,
                  nearestMountedAncestor,
                  error
                );
              }
            else
              try {
                hostParent.removeChild(deletedFiber.stateNode), viewTransitionMutationContext = true;
              } catch (error) {
                captureCommitPhaseError(
                  deletedFiber,
                  nearestMountedAncestor,
                  error
                );
              }
          break;
        case 18:
          null !== hostParent && (hostParentIsContainer ? (finishedRoot = hostParent, clearHydrationBoundary(
            9 === finishedRoot.nodeType ? finishedRoot.body : "HTML" === finishedRoot.nodeName ? finishedRoot.ownerDocument.body : finishedRoot,
            deletedFiber.stateNode
          ), retryIfBlockedOn(finishedRoot)) : clearHydrationBoundary(hostParent, deletedFiber.stateNode));
          break;
        case 4:
          prevHostParent = hostParent;
          prevHostParentIsContainer = hostParentIsContainer;
          hostParent = deletedFiber.stateNode.containerInfo;
          hostParentIsContainer = true;
          recursivelyTraverseDeletionEffects(
            finishedRoot,
            nearestMountedAncestor,
            deletedFiber
          );
          hostParent = prevHostParent;
          hostParentIsContainer = prevHostParentIsContainer;
          break;
        case 0:
        case 11:
        case 14:
        case 15:
          commitHookEffectListUnmount(2, deletedFiber, nearestMountedAncestor);
          offscreenSubtreeWasHidden || commitHookEffectListUnmount(4, deletedFiber, nearestMountedAncestor);
          recursivelyTraverseDeletionEffects(
            finishedRoot,
            nearestMountedAncestor,
            deletedFiber
          );
          break;
        case 1:
          offscreenSubtreeWasHidden || (safelyDetachRef(deletedFiber, nearestMountedAncestor), prevHostParent = deletedFiber.stateNode, "function" === typeof prevHostParent.componentWillUnmount && safelyCallComponentWillUnmount(
            deletedFiber,
            nearestMountedAncestor,
            prevHostParent
          ));
          recursivelyTraverseDeletionEffects(
            finishedRoot,
            nearestMountedAncestor,
            deletedFiber
          );
          break;
        case 21:
          recursivelyTraverseDeletionEffects(
            finishedRoot,
            nearestMountedAncestor,
            deletedFiber
          );
          break;
        case 22:
          offscreenSubtreeWasHidden = (prevHostParent = offscreenSubtreeWasHidden) || null !== deletedFiber.memoizedState;
          recursivelyTraverseDeletionEffects(
            finishedRoot,
            nearestMountedAncestor,
            deletedFiber
          );
          offscreenSubtreeWasHidden = prevHostParent;
          break;
        case 30:
          safelyDetachRef(deletedFiber, nearestMountedAncestor);
          recursivelyTraverseDeletionEffects(
            finishedRoot,
            nearestMountedAncestor,
            deletedFiber
          );
          break;
        case 7:
          offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
          recursivelyTraverseDeletionEffects(
            finishedRoot,
            nearestMountedAncestor,
            deletedFiber
          );
          break;
        default:
          recursivelyTraverseDeletionEffects(
            finishedRoot,
            nearestMountedAncestor,
            deletedFiber
          );
      }
    }
    function commitActivityHydrationCallbacks(finishedRoot, finishedWork) {
      if (null === finishedWork.memoizedState && (finishedRoot = finishedWork.alternate, null !== finishedRoot && (finishedRoot = finishedRoot.memoizedState, null !== finishedRoot))) {
        finishedRoot = finishedRoot.dehydrated;
        try {
          retryIfBlockedOn(finishedRoot);
        } catch (error) {
          captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
      }
    }
    function commitSuspenseHydrationCallbacks(finishedRoot, finishedWork) {
      if (null === finishedWork.memoizedState && (finishedRoot = finishedWork.alternate, null !== finishedRoot && (finishedRoot = finishedRoot.memoizedState, null !== finishedRoot && (finishedRoot = finishedRoot.dehydrated, null !== finishedRoot))))
        try {
          retryIfBlockedOn(finishedRoot);
        } catch (error) {
          captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
    }
    function getRetryCache(finishedWork) {
      switch (finishedWork.tag) {
        case 31:
        case 13:
        case 19:
          var retryCache = finishedWork.stateNode;
          null === retryCache && (retryCache = finishedWork.stateNode = new PossiblyWeakSet());
          return retryCache;
        case 22:
          return finishedWork = finishedWork.stateNode, retryCache = finishedWork._retryCache, null === retryCache && (retryCache = finishedWork._retryCache = new PossiblyWeakSet()), retryCache;
        default:
          throw Error(formatProdErrorMessage(435, finishedWork.tag));
      }
    }
    function attachSuspenseRetryListeners(finishedWork, wakeables) {
      var retryCache = getRetryCache(finishedWork);
      wakeables.forEach(function(wakeable) {
        if (!retryCache.has(wakeable)) {
          retryCache.add(wakeable);
          var retry = resolveRetryWakeable.bind(null, finishedWork, wakeable);
          wakeable.then(retry, retry);
        }
      });
    }
    function recursivelyTraverseMutationEffects(root$jscomp$0, parentFiber, lanes) {
      var deletions = parentFiber.deletions;
      if (null !== deletions)
        for (var i = 0; i < deletions.length; i++) {
          var childToDelete = deletions[i], root2 = root$jscomp$0, returnFiber = parentFiber, parent = returnFiber;
          a: for (; null !== parent; ) {
            switch (parent.tag) {
              case 27:
                if (isSingletonScope(parent.type)) {
                  hostParent = parent.stateNode;
                  hostParentIsContainer = false;
                  break a;
                }
                break;
              case 5:
                hostParent = parent.stateNode;
                hostParentIsContainer = false;
                break a;
              case 3:
              case 4:
                hostParent = parent.stateNode.containerInfo;
                hostParentIsContainer = true;
                break a;
            }
            parent = parent.return;
          }
          if (null === hostParent) throw Error(formatProdErrorMessage(160));
          commitDeletionEffectsOnFiber(root2, returnFiber, childToDelete);
          hostParent = null;
          hostParentIsContainer = false;
          root2 = childToDelete.alternate;
          null !== root2 && (root2.return = null);
          childToDelete.return = null;
        }
      if (parentFiber.subtreeFlags & 13886)
        for (parentFiber = parentFiber.child; null !== parentFiber; )
          commitMutationEffectsOnFiber(parentFiber, root$jscomp$0, lanes), parentFiber = parentFiber.sibling;
    }
    var currentHoistableRoot = null;
    function commitMutationEffectsOnFiber(finishedWork, root2, lanes) {
      var current = finishedWork.alternate, flags = finishedWork.flags;
      switch (finishedWork.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          if (flags & 4 && (current = finishedWork.updateQueue, current = null !== current ? current.events : null, null !== current))
            for (var ii = 0; ii < current.length; ii++) {
              var _eventPayloads$ii2 = current[ii];
              _eventPayloads$ii2.ref.impl = _eventPayloads$ii2.nextImpl;
            }
          recursivelyTraverseMutationEffects(root2, finishedWork, lanes);
          commitReconciliationEffects(finishedWork);
          flags & 4 && (commitHookEffectListUnmount(3, finishedWork, finishedWork.return), commitHookEffectListMount(3, finishedWork), commitHookEffectListUnmount(5, finishedWork, finishedWork.return));
          break;
        case 1:
          recursivelyTraverseMutationEffects(root2, finishedWork, lanes);
          commitReconciliationEffects(finishedWork);
          flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
          flags & 64 && offscreenSubtreeIsHidden && (finishedWork = finishedWork.updateQueue, null !== finishedWork && (root2 = finishedWork.callbacks, null !== root2 && (lanes = finishedWork.shared.hiddenCallbacks, finishedWork.shared.hiddenCallbacks = null === lanes ? root2 : lanes.concat(root2))));
          break;
        case 26:
          ii = currentHoistableRoot;
          recursivelyTraverseMutationEffects(root2, finishedWork, lanes);
          commitReconciliationEffects(finishedWork);
          flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
          if (flags & 4)
            if (flags = null !== current ? current.memoizedState : null, lanes = finishedWork.memoizedState, null === current)
              if (null === lanes)
                if (null === finishedWork.stateNode)
                  if (offscreenSubtreeIsHidden)
                    finishedWork.stateNode = createHoistableInstance(
                      finishedWork.type,
                      finishedWork.memoizedProps,
                      root2.containerInfo,
                      finishedWork
                    );
                  else {
                    a: {
                      root2 = finishedWork.type;
                      lanes = finishedWork.memoizedProps;
                      flags = ii.ownerDocument || ii;
                      b: switch (root2) {
                        case "title":
                          current = flags.getElementsByTagName("title")[0];
                          if (!current || current[internalHoistableMarker] || current[internalInstanceKey] || "http://www.w3.org/2000/svg" === current.namespaceURI || current.hasAttribute("itemprop"))
                            current = flags.createElement(root2), flags.head.insertBefore(
                              current,
                              flags.querySelector("head > title")
                            );
                          setInitialProperties(current, root2, lanes);
                          current[internalInstanceKey] = finishedWork;
                          markNodeAsHoistable(current);
                          root2 = current;
                          break a;
                        case "link":
                          if (ii = getHydratableHoistableCache(
                            "link",
                            "href",
                            flags
                          ).get(root2 + (lanes.href || ""))) {
                            for (_eventPayloads$ii2 = 0; _eventPayloads$ii2 < ii.length; _eventPayloads$ii2++)
                              if (current = ii[_eventPayloads$ii2], current.getAttribute("href") === (null == lanes.href || "" === lanes.href ? null : lanes.href) && current.getAttribute("rel") === (null == lanes.rel ? null : lanes.rel) && current.getAttribute("title") === (null == lanes.title ? null : lanes.title) && current.getAttribute("crossorigin") === (null == lanes.crossOrigin ? null : lanes.
                              crossOrigin)) {
                                ii.splice(_eventPayloads$ii2, 1);
                                break b;
                              }
                          }
                          current = flags.createElement(root2);
                          setInitialProperties(current, root2, lanes);
                          flags.head.appendChild(current);
                          break;
                        case "meta":
                          if (ii = getHydratableHoistableCache(
                            "meta",
                            "content",
                            flags
                          ).get(root2 + (lanes.content || ""))) {
                            for (_eventPayloads$ii2 = 0; _eventPayloads$ii2 < ii.length; _eventPayloads$ii2++)
                              if (current = ii[_eventPayloads$ii2], current.getAttribute("content") === (null == lanes.content ? null : "" + lanes.content) && current.getAttribute("name") === (null == lanes.name ? null : lanes.name) && current.getAttribute("property") === (null == lanes.property ? null : lanes.property) && current.getAttribute("http-equiv") === (null == lanes.httpEquiv ? null : lanes.
                              httpEquiv) && current.getAttribute("charset") === (null == lanes.charSet ? null : lanes.charSet)) {
                                ii.splice(_eventPayloads$ii2, 1);
                                break b;
                              }
                          }
                          current = flags.createElement(root2);
                          setInitialProperties(current, root2, lanes);
                          flags.head.appendChild(current);
                          break;
                        default:
                          throw Error(formatProdErrorMessage(468, root2));
                      }
                      current[internalInstanceKey] = finishedWork;
                      markNodeAsHoistable(current);
                      root2 = current;
                    }
                    finishedWork.stateNode = root2;
                  }
                else
                  offscreenSubtreeIsHidden || mountHoistable(ii, finishedWork.type, finishedWork.stateNode);
              else
                finishedWork.stateNode = acquireResource(
                  ii,
                  lanes,
                  finishedWork.memoizedProps
                );
            else
              flags !== lanes ? (null === flags ? (root2 = current.stateNode, null === root2 || offscreenSubtreeWasHidden || root2.parentNode.removeChild(root2)) : flags.count--, null === lanes ? offscreenSubtreeIsHidden || mountHoistable(ii, finishedWork.type, finishedWork.stateNode) : acquireResource(ii, lanes, finishedWork.memoizedProps)) : null === lanes && null !== finishedWork.stateNode && commitHostUpdate(
                finishedWork,
                finishedWork.memoizedProps,
                current.memoizedProps
              );
          break;
        case 27:
          recursivelyTraverseMutationEffects(root2, finishedWork, lanes);
          commitReconciliationEffects(finishedWork);
          flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
          null !== current && flags & 4 && commitHostUpdate(
            finishedWork,
            finishedWork.memoizedProps,
            current.memoizedProps
          );
          break;
        case 5:
          ii = offscreenDirectParentIsHidden;
          offscreenDirectParentIsHidden = false;
          recursivelyTraverseMutationEffects(root2, finishedWork, lanes);
          offscreenDirectParentIsHidden = ii;
          commitReconciliationEffects(finishedWork);
          flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
          if (finishedWork.flags & 32) {
            root2 = finishedWork.stateNode;
            try {
              setTextContent(root2, ""), viewTransitionMutationContext = true;
            } catch (error) {
              captureCommitPhaseError(finishedWork, finishedWork.return, error);
            }
          }
          flags & 4 && null != finishedWork.stateNode && (root2 = finishedWork.memoizedProps, commitHostUpdate(
            finishedWork,
            root2,
            null !== current ? current.memoizedProps : root2
          ));
          flags & 1024 && (needsFormReset = true);
          break;
        case 6:
          recursivelyTraverseMutationEffects(root2, finishedWork, lanes);
          commitReconciliationEffects(finishedWork);
          if (flags & 4) {
            if (null === finishedWork.stateNode)
              throw Error(formatProdErrorMessage(162));
            root2 = finishedWork.memoizedProps;
            lanes = finishedWork.stateNode;
            try {
              lanes.nodeValue = root2, viewTransitionMutationContext = true;
            } catch (error) {
              captureCommitPhaseError(finishedWork, finishedWork.return, error);
            }
          }
          break;
        case 3:
          viewTransitionMutationContext = false;
          tagCaches = null;
          ii = currentHoistableRoot;
          currentHoistableRoot = getHoistableRoot(root2.containerInfo);
          recursivelyTraverseMutationEffects(root2, finishedWork, lanes);
          currentHoistableRoot = ii;
          commitReconciliationEffects(finishedWork);
          if (flags & 4 && null !== current && current.memoizedState.isDehydrated)
            try {
              retryIfBlockedOn(root2.containerInfo);
            } catch (error) {
              captureCommitPhaseError(finishedWork, finishedWork.return, error);
            }
          needsFormReset && (needsFormReset = false, recursivelyResetForms(finishedWork));
          viewTransitionMutationContext = false;
          break;
        case 4:
          flags = offscreenDirectParentIsHidden;
          offscreenDirectParentIsHidden = offscreenSubtreeIsHidden;
          current = pushMutationContext();
          ii = currentHoistableRoot;
          currentHoistableRoot = getHoistableRoot(
            finishedWork.stateNode.containerInfo
          );
          recursivelyTraverseMutationEffects(root2, finishedWork, lanes);
          commitReconciliationEffects(finishedWork);
          currentHoistableRoot = ii;
          viewTransitionMutationContext && inUpdateViewTransition && (rootViewTransitionAffected = true);
          viewTransitionMutationContext = current;
          offscreenDirectParentIsHidden = flags;
          break;
        case 12:
          recursivelyTraverseMutationEffects(root2, finishedWork, lanes);
          commitReconciliationEffects(finishedWork);
          break;
        case 31:
          recursivelyTraverseMutationEffects(root2, finishedWork, lanes);
          commitReconciliationEffects(finishedWork);
          flags & 4 && (root2 = finishedWork.updateQueue, null !== root2 && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, root2)));
          break;
        case 13:
          recursivelyTraverseMutationEffects(root2, finishedWork, lanes);
          commitReconciliationEffects(finishedWork);
          finishedWork.child.flags & 8192 && null !== finishedWork.memoizedState !== (null !== current && null !== current.memoizedState) && (globalMostRecentFallbackTime = now());
          flags & 4 && (root2 = finishedWork.updateQueue, null !== root2 && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, root2)));
          break;
        case 22:
          ii = null !== finishedWork.memoizedState;
          _eventPayloads$ii2 = null !== current && null !== current.memoizedState;
          var prevOffscreenSubtreeIsHidden = offscreenSubtreeIsHidden, prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden, prevOffscreenDirectParentIsHidden$166 = offscreenDirectParentIsHidden;
          offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden || ii;
          offscreenDirectParentIsHidden = prevOffscreenDirectParentIsHidden$166 || ii;
          offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden || _eventPayloads$ii2;
          recursivelyTraverseMutationEffects(root2, finishedWork, lanes);
          offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
          offscreenDirectParentIsHidden = prevOffscreenDirectParentIsHidden$166;
          offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden;
          commitReconciliationEffects(finishedWork);
          flags & 8192 && (root2 = finishedWork.stateNode, root2._visibility = ii ? root2._visibility & -2 : root2._visibility | 1, !ii || null === current || _eventPayloads$ii2 || offscreenSubtreeIsHidden || offscreenSubtreeWasHidden || (root2 = _eventPayloads$ii2 || offscreenSubtreeWasHidden, lanes = offscreenSubtreeIsHidden, current = offscreenSubtreeWasHidden, offscreenSubtreeIsHidden = ii || offscreenSubtreeIsHidden,
          offscreenSubtreeWasHidden = root2, recursivelyTraverseDisappearLayoutEffects(finishedWork, 2), offscreenSubtreeIsHidden = lanes, offscreenSubtreeWasHidden = current), !ii && offscreenDirectParentIsHidden || hideOrUnhideAllChildren(finishedWork, ii));
          flags & 4 && (root2 = finishedWork.updateQueue, null !== root2 && (lanes = root2.retryQueue, null !== lanes && (root2.retryQueue = null, attachSuspenseRetryListeners(finishedWork, lanes))));
          break;
        case 19:
          recursivelyTraverseMutationEffects(root2, finishedWork, lanes);
          commitReconciliationEffects(finishedWork);
          flags & 4 && (root2 = finishedWork.updateQueue, null !== root2 && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, root2)));
          break;
        case 30:
          flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
          flags = pushMutationContext();
          ii = inUpdateViewTransition;
          _eventPayloads$ii2 = (lanes & 335544064) === lanes;
          prevOffscreenSubtreeIsHidden = finishedWork.memoizedProps;
          inUpdateViewTransition = _eventPayloads$ii2 && "none" !== getViewTransitionClassName(
            prevOffscreenSubtreeIsHidden.default,
            prevOffscreenSubtreeIsHidden.update
          );
          recursivelyTraverseMutationEffects(root2, finishedWork, lanes);
          commitReconciliationEffects(finishedWork);
          _eventPayloads$ii2 && null !== current && viewTransitionMutationContext && (finishedWork.flags |= 4);
          inUpdateViewTransition = ii;
          viewTransitionMutationContext = flags;
          break;
        case 21:
          break;
        case 7:
          flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return)), current && null !== current.stateNode && (current.stateNode._fragmentFiber = finishedWork);
        default:
          recursivelyTraverseMutationEffects(root2, finishedWork, lanes), commitReconciliationEffects(finishedWork);
      }
    }
    function commitReconciliationEffects(finishedWork) {
      var flags = finishedWork.flags;
      if (flags & 2) {
        try {
          for (var hostParentFiber, parentFiber = finishedWork.return; null !== parentFiber; ) {
            if (isHostParent(parentFiber)) {
              hostParentFiber = parentFiber;
              break;
            }
            parentFiber = parentFiber.return;
          }
          parentFiber = null;
          for (var parent = finishedWork.return; null !== parent; ) {
            if (isFragmentInstanceParent(parent)) {
              var fragmentInstance = parent.stateNode;
              null === parentFiber ? parentFiber = [fragmentInstance] : parentFiber.push(fragmentInstance);
            }
            if (isFragmentInstanceHostBoundary(parent)) break;
            parent = parent.return;
          }
          var JSCompiler_inline_result = parentFiber;
          if (null == hostParentFiber) throw Error(formatProdErrorMessage(160));
          switch (hostParentFiber.tag) {
            case 27:
              var parent$jscomp$0 = hostParentFiber.stateNode, before = getHostSibling(finishedWork);
              insertOrAppendPlacementNode(
                finishedWork,
                before,
                parent$jscomp$0,
                JSCompiler_inline_result
              );
              break;
            case 5:
              var parent$149 = hostParentFiber.stateNode;
              hostParentFiber.flags & 32 && (setTextContent(parent$149, ""), hostParentFiber.flags &= -33);
              var before$150 = getHostSibling(finishedWork);
              insertOrAppendPlacementNode(
                finishedWork,
                before$150,
                parent$149,
                JSCompiler_inline_result
              );
              break;
            case 3:
            case 4:
              var parent$151 = hostParentFiber.stateNode.containerInfo, before$152 = getHostSibling(finishedWork);
              insertOrAppendPlacementNodeIntoContainer(
                finishedWork,
                before$152,
                parent$151,
                JSCompiler_inline_result
              );
              break;
            default:
              throw Error(formatProdErrorMessage(161));
          }
        } catch (error) {
          captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
        finishedWork.flags &= -3;
      }
      flags & 4096 && (finishedWork.flags &= -4097);
    }
    function recursivelyResetForms(parentFiber) {
      if (parentFiber.subtreeFlags & 1024)
        for (parentFiber = parentFiber.child; null !== parentFiber; ) {
          var fiber = parentFiber;
          recursivelyResetForms(fiber);
          5 === fiber.tag && fiber.flags & 1024 && (fiber = fiber.stateNode, _enabled = true, fiber.reset(), _enabled = false);
          parentFiber = parentFiber.sibling;
        }
    }
    function recursivelyTraverseAfterMutationEffects(root2, parentFiber) {
      if (parentFiber.subtreeFlags & 9270)
        for (parentFiber = parentFiber.child; null !== parentFiber; )
          commitAfterMutationEffectsOnFiber(parentFiber, root2), parentFiber = parentFiber.sibling;
      else measureNestedViewTransitions(parentFiber, false);
    }
    function commitAfterMutationEffectsOnFiber(finishedWork, root2) {
      var current = finishedWork.alternate;
      if (null === current) commitEnterViewTransitions(finishedWork, false);
      else
        switch (finishedWork.tag) {
          case 3:
            rootViewTransitionNameCanceled = viewTransitionContextChanged = false;
            pushViewTransitionCancelableScope();
            recursivelyTraverseAfterMutationEffects(root2, finishedWork);
            if (!viewTransitionContextChanged && !rootViewTransitionAffected) {
              finishedWork = viewTransitionCancelableChildren;
              if (null !== finishedWork)
                for (var i = 0; i < finishedWork.length; i += 3) {
                  current = finishedWork[i];
                  var oldName = finishedWork[i + 1];
                  restoreViewTransitionName(current, finishedWork[i + 2]);
                  current = current.ownerDocument.documentElement;
                  null !== current && current.animate(
                    { opacity: [0, 0], pointerEvents: ["none", "none"] },
                    {
                      duration: 0,
                      fill: "forwards",
                      pseudoElement: "::view-transition-group(" + oldName + ")"
                    }
                  );
                }
              finishedWork = root2.containerInfo;
              finishedWork = 9 === finishedWork.nodeType ? finishedWork.documentElement : finishedWork.ownerDocument.documentElement;
              null !== finishedWork && "" === finishedWork.style.viewTransitionName && (finishedWork.style.viewTransitionName = "none", finishedWork.animate(
                { opacity: [0, 0], pointerEvents: ["none", "none"] },
                {
                  duration: 0,
                  fill: "forwards",
                  pseudoElement: "::view-transition-group(root)"
                }
              ), finishedWork.animate(
                { width: [0, 0], height: [0, 0] },
                {
                  duration: 0,
                  fill: "forwards",
                  pseudoElement: "::view-transition"
                }
              ));
              rootViewTransitionNameCanceled = true;
            }
            viewTransitionCancelableChildren = null;
            break;
          case 5:
            recursivelyTraverseAfterMutationEffects(root2, finishedWork);
            break;
          case 4:
            i = viewTransitionContextChanged;
            viewTransitionContextChanged = false;
            recursivelyTraverseAfterMutationEffects(root2, finishedWork);
            viewTransitionContextChanged && (rootViewTransitionAffected = true);
            viewTransitionContextChanged = i;
            break;
          case 22:
            null === finishedWork.memoizedState && (null !== current.memoizedState ? commitEnterViewTransitions(finishedWork, false) : recursivelyTraverseAfterMutationEffects(root2, finishedWork));
            break;
          case 30:
            i = viewTransitionContextChanged;
            oldName = pushViewTransitionCancelableScope();
            viewTransitionContextChanged = false;
            recursivelyTraverseAfterMutationEffects(root2, finishedWork);
            viewTransitionContextChanged && (finishedWork.flags |= 4);
            var props = finishedWork.memoizedProps, state = finishedWork.stateNode;
            root2 = getViewTransitionName(props, state);
            state = getViewTransitionName(current.memoizedProps, state);
            var className = getViewTransitionClassName(props.default, props.update);
            "none" === className ? root2 = false : (props = current.memoizedState, current.memoizedState = null, current = finishedWork.child, viewTransitionHostInstanceIdx = 0, root2 = measureViewTransitionHostInstancesRecursive(
              finishedWork,
              current,
              root2,
              state,
              className,
              props,
              true
            ), viewTransitionHostInstanceIdx !== (null === props ? 0 : props.length) && (finishedWork.flags |= 32));
            0 !== (finishedWork.flags & 4) && root2 ? (scheduleViewTransitionEvent(
              finishedWork,
              finishedWork.memoizedProps.onUpdate
            ), viewTransitionCancelableChildren = oldName) : null !== oldName && (oldName.push.apply(oldName, viewTransitionCancelableChildren), viewTransitionCancelableChildren = oldName);
            viewTransitionContextChanged = 0 !== (finishedWork.flags & 32) ? true : i;
            break;
          default:
            recursivelyTraverseAfterMutationEffects(root2, finishedWork);
        }
    }
    function recursivelyTraverseLayoutEffects(root2, parentFiber) {
      if (parentFiber.subtreeFlags & 8772)
        for (parentFiber = parentFiber.child; null !== parentFiber; )
          commitLayoutEffectOnFiber(root2, parentFiber.alternate, parentFiber), parentFiber = parentFiber.sibling;
    }
    function recursivelyTraverseDisappearLayoutEffects(parentFiber, layoutEffectTraversalFlags$jscomp$0) {
      for (parentFiber = parentFiber.child; null !== parentFiber; ) {
        var finishedWork = parentFiber, layoutEffectTraversalFlags = layoutEffectTraversalFlags$jscomp$0;
        switch (finishedWork.tag) {
          case 0:
          case 11:
          case 14:
          case 15:
            commitHookEffectListUnmount(4, finishedWork, finishedWork.return);
            recursivelyTraverseDisappearLayoutEffects(
              finishedWork,
              layoutEffectTraversalFlags
            );
            break;
          case 1:
            safelyDetachRef(finishedWork, finishedWork.return);
            var instance = finishedWork.stateNode;
            "function" === typeof instance.componentWillUnmount && safelyCallComponentWillUnmount(
              finishedWork,
              finishedWork.return,
              instance
            );
            recursivelyTraverseDisappearLayoutEffects(
              finishedWork,
              layoutEffectTraversalFlags
            );
            break;
          case 27:
            0 !== (layoutEffectTraversalFlags & 2) && releaseSingletonInstance(
              finishedWork.stateNode,
              finishedWork.type,
              finishedWork.memoizedProps
            );
          case 5:
            safelyDetachRef(finishedWork, finishedWork.return);
            5 !== finishedWork.tag && 27 !== finishedWork.tag || commitFragmentInstanceDeletionEffects(finishedWork);
            recursivelyTraverseDisappearLayoutEffects(
              finishedWork,
              layoutEffectTraversalFlags
            );
            break;
          case 6:
            commitFragmentInstanceDeletionEffects(finishedWork);
            break;
          case 26:
            safelyDetachRef(finishedWork, finishedWork.return);
            instance = finishedWork.stateNode;
            null !== finishedWork.memoizedState || null === instance || offscreenSubtreeWasHidden || instance.parentNode.removeChild(instance);
            recursivelyTraverseDisappearLayoutEffects(
              finishedWork,
              layoutEffectTraversalFlags
            );
            break;
          case 22:
            null === finishedWork.memoizedState && recursivelyTraverseDisappearLayoutEffects(
              finishedWork,
              layoutEffectTraversalFlags
            );
            break;
          case 30:
            safelyDetachRef(finishedWork, finishedWork.return);
            recursivelyTraverseDisappearLayoutEffects(
              finishedWork,
              layoutEffectTraversalFlags
            );
            break;
          case 7:
            safelyDetachRef(finishedWork, finishedWork.return);
          default:
            recursivelyTraverseDisappearLayoutEffects(
              finishedWork,
              layoutEffectTraversalFlags
            );
        }
        parentFiber = parentFiber.sibling;
      }
    }
    function recursivelyTraverseReappearLayoutEffects(finishedRoot$jscomp$0, parentFiber, layoutEffectTraversalFlags) {
      layoutEffectTraversalFlags = 0 !== (parentFiber.subtreeFlags & 8772) ? layoutEffectTraversalFlags : layoutEffectTraversalFlags & -2;
      for (parentFiber = parentFiber.child; null !== parentFiber; ) {
        var current = parentFiber.alternate, finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags, includeWorkInProgressEffects = 0 !== (layoutEffectTraversalFlags & 1);
        switch (finishedWork.tag) {
          case 0:
          case 11:
          case 15:
            recursivelyTraverseReappearLayoutEffects(
              finishedRoot,
              finishedWork,
              layoutEffectTraversalFlags
            );
            commitHookEffectListMount(4, finishedWork);
            break;
          case 1:
            recursivelyTraverseReappearLayoutEffects(
              finishedRoot,
              finishedWork,
              layoutEffectTraversalFlags
            );
            current = finishedWork;
            finishedRoot = current.stateNode;
            if ("function" === typeof finishedRoot.componentDidMount)
              try {
                finishedRoot.componentDidMount();
              } catch (error) {
                captureCommitPhaseError(current, current.return, error);
              }
            current = finishedWork;
            finishedRoot = current.updateQueue;
            if (null !== finishedRoot) {
              var instance = current.stateNode;
              try {
                var hiddenCallbacks = finishedRoot.shared.hiddenCallbacks;
                if (null !== hiddenCallbacks)
                  for (finishedRoot.shared.hiddenCallbacks = null, finishedRoot = 0; finishedRoot < hiddenCallbacks.length; finishedRoot++)
                    callCallback(hiddenCallbacks[finishedRoot], instance);
              } catch (error) {
                captureCommitPhaseError(current, current.return, error);
              }
            }
            includeWorkInProgressEffects && flags & 64 && commitClassCallbacks(finishedWork);
            safelyAttachRef(finishedWork, finishedWork.return);
            break;
          case 27:
            0 !== (layoutEffectTraversalFlags & 2) && commitHostSingletonAcquisition(finishedWork);
          case 5:
            5 !== finishedWork.tag && 27 !== finishedWork.tag || commitFragmentInstanceInsertionEffects(finishedWork);
            recursivelyTraverseReappearLayoutEffects(
              finishedRoot,
              finishedWork,
              layoutEffectTraversalFlags
            );
            includeWorkInProgressEffects && null === current && flags & 4 && commitHostMount(finishedWork);
            safelyAttachRef(finishedWork, finishedWork.return);
            break;
          case 6:
            commitFragmentInstanceInsertionEffects(finishedWork);
            break;
          case 26:
            instance = finishedWork.stateNode;
            null !== finishedWork.memoizedState || null === instance || offscreenSubtreeIsHidden || mountHoistable(
              getHoistableRoot(instance.ownerDocument),
              finishedWork.type,
              instance
            );
            recursivelyTraverseReappearLayoutEffects(
              finishedRoot,
              finishedWork,
              layoutEffectTraversalFlags
            );
            includeWorkInProgressEffects && null === current && flags & 4 && commitHostMount(finishedWork);
            safelyAttachRef(finishedWork, finishedWork.return);
            break;
          case 12:
            recursivelyTraverseReappearLayoutEffects(
              finishedRoot,
              finishedWork,
              layoutEffectTraversalFlags
            );
            break;
          case 31:
            recursivelyTraverseReappearLayoutEffects(
              finishedRoot,
              finishedWork,
              layoutEffectTraversalFlags
            );
            includeWorkInProgressEffects && flags & 4 && commitActivityHydrationCallbacks(finishedRoot, finishedWork);
            break;
          case 13:
            recursivelyTraverseReappearLayoutEffects(
              finishedRoot,
              finishedWork,
              layoutEffectTraversalFlags
            );
            includeWorkInProgressEffects && flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
            break;
          case 22:
            null === finishedWork.memoizedState && recursivelyTraverseReappearLayoutEffects(
              finishedRoot,
              finishedWork,
              layoutEffectTraversalFlags
            );
            safelyAttachRef(finishedWork, finishedWork.return);
            break;
          case 30:
            recursivelyTraverseReappearLayoutEffects(
              finishedRoot,
              finishedWork,
              layoutEffectTraversalFlags
            );
            safelyAttachRef(finishedWork, finishedWork.return);
            break;
          case 7:
            safelyAttachRef(finishedWork, finishedWork.return);
          default:
            recursivelyTraverseReappearLayoutEffects(
              finishedRoot,
              finishedWork,
              layoutEffectTraversalFlags
            );
        }
        parentFiber = parentFiber.sibling;
      }
    }
    function commitOffscreenPassiveMountEffects(current, finishedWork) {
      var previousCache = null;
      null !== current && null !== current.memoizedState && null !== current.memoizedState.cachePool && (previousCache = current.memoizedState.cachePool.pool);
      current = null;
      null !== finishedWork.memoizedState && null !== finishedWork.memoizedState.cachePool && (current = finishedWork.memoizedState.cachePool.pool);
      current !== previousCache && (null != current && current.refCount++, null != previousCache && releaseCache(previousCache));
    }
    function commitCachePassiveMountEffect(current, finishedWork) {
      current = null;
      null !== finishedWork.alternate && (current = finishedWork.alternate.memoizedState.cache);
      finishedWork = finishedWork.memoizedState.cache;
      finishedWork !== current && (finishedWork.refCount++, null != current && releaseCache(current));
    }
    function recursivelyTraversePassiveMountEffects(root2, parentFiber, committedLanes, committedTransitions) {
      var isViewTransitionEligible = (committedLanes & 335544064) === committedLanes;
      if (parentFiber.subtreeFlags & (isViewTransitionEligible ? 10262 : 10256))
        for (parentFiber = parentFiber.child; null !== parentFiber; )
          commitPassiveMountOnFiber(
            root2,
            parentFiber,
            committedLanes,
            committedTransitions
          ), parentFiber = parentFiber.sibling;
      else isViewTransitionEligible && restoreNestedViewTransitions(parentFiber);
    }
    function commitPassiveMountOnFiber(finishedRoot, finishedWork, committedLanes, committedTransitions) {
      var isViewTransitionEligible = (committedLanes & 335544064) === committedLanes;
      isViewTransitionEligible && null === finishedWork.alternate && null !== finishedWork.return && null !== finishedWork.return.alternate && restoreEnterOrExitViewTransitions(finishedWork);
      var flags = finishedWork.flags;
      switch (finishedWork.tag) {
        case 0:
        case 11:
        case 15:
          recursivelyTraversePassiveMountEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions
          );
          flags & 2048 && commitHookEffectListMount(9, finishedWork);
          break;
        case 1:
          recursivelyTraversePassiveMountEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions
          );
          break;
        case 3:
          recursivelyTraversePassiveMountEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions
          );
          isViewTransitionEligible && rootViewTransitionNameCanceled && (finishedRoot = finishedRoot.containerInfo, finishedRoot = 9 === finishedRoot.nodeType ? finishedRoot.body : "HTML" === finishedRoot.nodeName ? finishedRoot.ownerDocument.body : finishedRoot, "root" === finishedRoot.style.viewTransitionName && (finishedRoot.style.viewTransitionName = ""), finishedRoot = finishedRoot.ownerDocument.
          documentElement, null !== finishedRoot && "none" === finishedRoot.style.viewTransitionName && (finishedRoot.style.viewTransitionName = ""));
          flags & 2048 && (flags = null, null !== finishedWork.alternate && (flags = finishedWork.alternate.memoizedState.cache), finishedWork = finishedWork.memoizedState.cache, finishedWork !== flags && (finishedWork.refCount++, null != flags && releaseCache(flags)));
          break;
        case 12:
          if (flags & 2048) {
            recursivelyTraversePassiveMountEffects(
              finishedRoot,
              finishedWork,
              committedLanes,
              committedTransitions
            );
            flags = finishedWork.stateNode;
            try {
              var _finishedWork$memoize2 = finishedWork.memoizedProps, id = _finishedWork$memoize2.id, onPostCommit = _finishedWork$memoize2.onPostCommit;
              "function" === typeof onPostCommit && onPostCommit(
                id,
                null === finishedWork.alternate ? "mount" : "update",
                flags.passiveEffectDuration,
                -0
              );
            } catch (error) {
              captureCommitPhaseError(finishedWork, finishedWork.return, error);
            }
          } else
            recursivelyTraversePassiveMountEffects(
              finishedRoot,
              finishedWork,
              committedLanes,
              committedTransitions
            );
          break;
        case 31:
          recursivelyTraversePassiveMountEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions
          );
          break;
        case 13:
          recursivelyTraversePassiveMountEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions
          );
          break;
        case 23:
          break;
        case 22:
          _finishedWork$memoize2 = finishedWork.stateNode;
          id = finishedWork.alternate;
          null !== finishedWork.memoizedState ? (isViewTransitionEligible && null !== id && null === id.memoizedState && restoreEnterOrExitViewTransitions(id), _finishedWork$memoize2._visibility & 2 ? recursivelyTraversePassiveMountEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions
          ) : recursivelyTraverseAtomicPassiveEffects(
            finishedRoot,
            finishedWork
          )) : (isViewTransitionEligible && null !== id && null !== id.memoizedState && restoreEnterOrExitViewTransitions(finishedWork), _finishedWork$memoize2._visibility & 2 ? recursivelyTraversePassiveMountEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions
          ) : (_finishedWork$memoize2._visibility |= 2, recursivelyTraverseReconnectPassiveEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions,
            0 !== (finishedWork.subtreeFlags & 10256) || false
          )));
          flags & 2048 && commitOffscreenPassiveMountEffects(id, finishedWork);
          break;
        case 24:
          recursivelyTraversePassiveMountEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions
          );
          flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
          break;
        case 30:
          isViewTransitionEligible && (flags = finishedWork.alternate, null !== flags && (restoreViewTransitionOnHostInstances(flags.child, true), restoreViewTransitionOnHostInstances(finishedWork.child, true)));
          recursivelyTraversePassiveMountEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions
          );
          break;
        default:
          recursivelyTraversePassiveMountEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions
          );
      }
    }
    function recursivelyTraverseReconnectPassiveEffects(finishedRoot$jscomp$0, parentFiber, committedLanes$jscomp$0, committedTransitions$jscomp$0, includeWorkInProgressEffects) {
      includeWorkInProgressEffects = includeWorkInProgressEffects && (0 !== (parentFiber.subtreeFlags & 10256) || false);
      for (parentFiber = parentFiber.child; null !== parentFiber; ) {
        var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, committedLanes = committedLanes$jscomp$0, committedTransitions = committedTransitions$jscomp$0, flags = finishedWork.flags;
        switch (finishedWork.tag) {
          case 0:
          case 11:
          case 15:
            recursivelyTraverseReconnectPassiveEffects(
              finishedRoot,
              finishedWork,
              committedLanes,
              committedTransitions,
              includeWorkInProgressEffects
            );
            commitHookEffectListMount(8, finishedWork);
            break;
          case 23:
            break;
          case 22:
            var instance = finishedWork.stateNode;
            null !== finishedWork.memoizedState ? instance._visibility & 2 ? recursivelyTraverseReconnectPassiveEffects(
              finishedRoot,
              finishedWork,
              committedLanes,
              committedTransitions,
              includeWorkInProgressEffects
            ) : recursivelyTraverseAtomicPassiveEffects(
              finishedRoot,
              finishedWork
            ) : (instance._visibility |= 2, recursivelyTraverseReconnectPassiveEffects(
              finishedRoot,
              finishedWork,
              committedLanes,
              committedTransitions,
              includeWorkInProgressEffects
            ));
            includeWorkInProgressEffects && flags & 2048 && commitOffscreenPassiveMountEffects(
              finishedWork.alternate,
              finishedWork
            );
            break;
          case 24:
            recursivelyTraverseReconnectPassiveEffects(
              finishedRoot,
              finishedWork,
              committedLanes,
              committedTransitions,
              includeWorkInProgressEffects
            );
            includeWorkInProgressEffects && flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
            break;
          default:
            recursivelyTraverseReconnectPassiveEffects(
              finishedRoot,
              finishedWork,
              committedLanes,
              committedTransitions,
              includeWorkInProgressEffects
            );
        }
        parentFiber = parentFiber.sibling;
      }
    }
    function recursivelyTraverseAtomicPassiveEffects(finishedRoot$jscomp$0, parentFiber) {
      if (parentFiber.subtreeFlags & 10256)
        for (parentFiber = parentFiber.child; null !== parentFiber; ) {
          var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags;
          switch (finishedWork.tag) {
            case 22:
              recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
              flags & 2048 && commitOffscreenPassiveMountEffects(
                finishedWork.alternate,
                finishedWork
              );
              break;
            case 24:
              recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
              flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
              break;
            default:
              recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
          }
          parentFiber = parentFiber.sibling;
        }
    }
    var suspenseyCommitFlag = 8192;
    function recursivelyAccumulateSuspenseyCommit(parentFiber, committedLanes, suspendedState) {
      if (parentFiber.subtreeFlags & suspenseyCommitFlag)
        for (parentFiber = parentFiber.child; null !== parentFiber; )
          accumulateSuspenseyCommitOnFiber(
            parentFiber,
            committedLanes,
            suspendedState
          ), parentFiber = parentFiber.sibling;
    }
    function accumulateSuspenseyCommitOnFiber(fiber, committedLanes, suspendedState) {
      switch (fiber.tag) {
        case 26:
          recursivelyAccumulateSuspenseyCommit(
            fiber,
            committedLanes,
            suspendedState
          );
          fiber.flags & suspenseyCommitFlag && (null !== fiber.memoizedState ? suspendResource(
            suspendedState,
            currentHoistableRoot,
            fiber.memoizedState,
            fiber.memoizedProps
          ) : (fiber = fiber.stateNode, (committedLanes & 335544128) === committedLanes && suspendInstance(suspendedState, fiber)));
          break;
        case 5:
          recursivelyAccumulateSuspenseyCommit(
            fiber,
            committedLanes,
            suspendedState
          );
          fiber.flags & suspenseyCommitFlag && (fiber = fiber.stateNode, (committedLanes & 335544128) === committedLanes && suspendInstance(suspendedState, fiber));
          break;
        case 3:
        case 4:
          var previousHoistableRoot = currentHoistableRoot;
          currentHoistableRoot = getHoistableRoot(fiber.stateNode.containerInfo);
          recursivelyAccumulateSuspenseyCommit(
            fiber,
            committedLanes,
            suspendedState
          );
          currentHoistableRoot = previousHoistableRoot;
          break;
        case 22:
          null === fiber.memoizedState && (previousHoistableRoot = fiber.alternate, null !== previousHoistableRoot && null !== previousHoistableRoot.memoizedState ? (previousHoistableRoot = suspenseyCommitFlag, suspenseyCommitFlag = 16777216, recursivelyAccumulateSuspenseyCommit(
            fiber,
            committedLanes,
            suspendedState
          ), suspenseyCommitFlag = previousHoistableRoot) : recursivelyAccumulateSuspenseyCommit(
            fiber,
            committedLanes,
            suspendedState
          ));
          break;
        case 30:
          if (0 !== (fiber.flags & suspenseyCommitFlag) && (previousHoistableRoot = fiber.memoizedProps.name, null != previousHoistableRoot && "auto" !== previousHoistableRoot)) {
            var state = fiber.stateNode;
            state.paired = null;
            null === appearingViewTransitions && (appearingViewTransitions = /* @__PURE__ */ new Map());
            appearingViewTransitions.set(previousHoistableRoot, state);
          }
          recursivelyAccumulateSuspenseyCommit(
            fiber,
            committedLanes,
            suspendedState
          );
          break;
        default:
          recursivelyAccumulateSuspenseyCommit(
            fiber,
            committedLanes,
            suspendedState
          );
      }
    }
    function detachAlternateSiblings(parentFiber) {
      var previousFiber = parentFiber.alternate;
      if (null !== previousFiber && (parentFiber = previousFiber.child, null !== parentFiber)) {
        previousFiber.child = null;
        do
          previousFiber = parentFiber.sibling, parentFiber.sibling = null, parentFiber = previousFiber;
        while (null !== parentFiber);
      }
    }
    function recursivelyTraversePassiveUnmountEffects(parentFiber) {
      var deletions = parentFiber.deletions;
      if (0 !== (parentFiber.flags & 16)) {
        if (null !== deletions)
          for (var i = 0; i < deletions.length; i++) {
            var childToDelete = deletions[i];
            nextEffect = childToDelete;
            commitPassiveUnmountEffectsInsideOfDeletedTree_begin(
              childToDelete,
              parentFiber
            );
          }
        detachAlternateSiblings(parentFiber);
      }
      if (parentFiber.subtreeFlags & 10256)
        for (parentFiber = parentFiber.child; null !== parentFiber; )
          commitPassiveUnmountOnFiber(parentFiber), parentFiber = parentFiber.sibling;
    }
    function commitPassiveUnmountOnFiber(finishedWork) {
      switch (finishedWork.tag) {
        case 0:
        case 11:
        case 15:
          recursivelyTraversePassiveUnmountEffects(finishedWork);
          finishedWork.flags & 2048 && commitHookEffectListUnmount(9, finishedWork, finishedWork.return);
          break;
        case 3:
          recursivelyTraversePassiveUnmountEffects(finishedWork);
          break;
        case 12:
          recursivelyTraversePassiveUnmountEffects(finishedWork);
          break;
        case 22:
          var instance = finishedWork.stateNode;
          null !== finishedWork.memoizedState && instance._visibility & 2 && (null === finishedWork.return || 13 !== finishedWork.return.tag) ? (instance._visibility &= -3, recursivelyTraverseDisconnectPassiveEffects(finishedWork)) : recursivelyTraversePassiveUnmountEffects(finishedWork);
          break;
        default:
          recursivelyTraversePassiveUnmountEffects(finishedWork);
      }
    }
    function recursivelyTraverseDisconnectPassiveEffects(parentFiber) {
      var deletions = parentFiber.deletions;
      if (0 !== (parentFiber.flags & 16)) {
        if (null !== deletions)
          for (var i = 0; i < deletions.length; i++) {
            var childToDelete = deletions[i];
            nextEffect = childToDelete;
            commitPassiveUnmountEffectsInsideOfDeletedTree_begin(
              childToDelete,
              parentFiber
            );
          }
        detachAlternateSiblings(parentFiber);
      }
      for (parentFiber = parentFiber.child; null !== parentFiber; ) {
        deletions = parentFiber;
        switch (deletions.tag) {
          case 0:
          case 11:
          case 15:
            commitHookEffectListUnmount(8, deletions, deletions.return);
            recursivelyTraverseDisconnectPassiveEffects(deletions);
            break;
          case 22:
            i = deletions.stateNode;
            i._visibility & 2 && (i._visibility &= -3, recursivelyTraverseDisconnectPassiveEffects(deletions));
            break;
          default:
            recursivelyTraverseDisconnectPassiveEffects(deletions);
        }
        parentFiber = parentFiber.sibling;
      }
    }
    function commitPassiveUnmountEffectsInsideOfDeletedTree_begin(deletedSubtreeRoot, nearestMountedAncestor) {
      for (; null !== nextEffect; ) {
        var fiber = nextEffect;
        switch (fiber.tag) {
          case 0:
          case 11:
          case 15:
            commitHookEffectListUnmount(8, fiber, nearestMountedAncestor);
            break;
          case 23:
          case 22:
            if (null !== fiber.memoizedState && null !== fiber.memoizedState.cachePool) {
              var cache = fiber.memoizedState.cachePool.pool;
              null != cache && cache.refCount++;
            }
            break;
          case 24:
            releaseCache(fiber.memoizedState.cache);
        }
        cache = fiber.child;
        if (null !== cache) cache.return = fiber, nextEffect = cache;
        else
          a: for (fiber = deletedSubtreeRoot; null !== nextEffect; ) {
            cache = nextEffect;
            var sibling = cache.sibling, returnFiber = cache.return;
            detachFiberAfterEffects(cache);
            if (cache === fiber) {
              nextEffect = null;
              break a;
            }
            if (null !== sibling) {
              sibling.return = returnFiber;
              nextEffect = sibling;
              break a;
            }
            nextEffect = returnFiber;
          }
      }
    }
    var DefaultAsyncDispatcher = {
      getCacheForType: function(resourceType) {
        var cache = readContext(CacheContext), cacheForType = cache.data.get(resourceType);
        void 0 === cacheForType && (cacheForType = resourceType(), cache.data.set(resourceType, cacheForType));
        return cacheForType;
      },
      cacheSignal: function() {
        return readContext(CacheContext).controller.signal;
      }
    };
    var PossiblyWeakMap = "function" === typeof WeakMap ? WeakMap : Map;
    var executionContext = 0;
    var workInProgressRoot = null;
    var workInProgress = null;
    var workInProgressRootRenderLanes = 0;
    var workInProgressSuspendedReason = 0;
    var workInProgressThrownValue = null;
    var workInProgressRootDidSkipSuspendedSiblings = false;
    var workInProgressRootIsPrerendering = false;
    var workInProgressRootDidAttachPingListener = false;
    var entangledRenderLanes = 0;
    var workInProgressRootExitStatus = 0;
    var workInProgressRootSkippedLanes = 0;
    var workInProgressRootInterleavedUpdatedLanes = 0;
    var workInProgressRootPingedLanes = 0;
    var workInProgressDeferredLane = 0;
    var workInProgressSuspendedRetryLanes = 0;
    var workInProgressRootConcurrentErrors = null;
    var workInProgressRootRecoverableErrors = null;
    var workInProgressRootDidIncludeRecursiveRenderUpdate = false;
    var globalMostRecentFallbackTime = 0;
    var globalMostRecentTransitionTime = 0;
    var workInProgressRootRenderTargetTime = Infinity;
    var workInProgressTransitions = null;
    var legacyErrorBoundariesThatAlreadyFailed = null;
    var pendingEffectsStatus = 0;
    var pendingEffectsRoot = null;
    var pendingFinishedWork = null;
    var pendingEffectsLanes = 0;
    var pendingEffectsRemainingLanes = 0;
    var pendingPassiveTransitions = null;
    var pendingRecoverableErrors = null;
    var pendingViewTransition = null;
    var pendingViewTransitionEvents = null;
    var pendingTransitionTypes = null;
    var nestedUpdateCount = 0;
    var rootWithNestedUpdates = null;
    function requestUpdateLane() {
      return 0 !== (executionContext & 2) && 0 !== workInProgressRootRenderLanes ? workInProgressRootRenderLanes & -workInProgressRootRenderLanes : null !== ReactSharedInternals.T ? requestTransitionLane() : resolveUpdatePriority();
    }
    function requestDeferredLane() {
      if (0 === workInProgressDeferredLane)
        if (0 === (workInProgressRootRenderLanes & 536870912) || isHydrating) {
          var lane = nextTransitionDeferredLane;
          nextTransitionDeferredLane <<= 1;
          0 === (nextTransitionDeferredLane & 3932160) && (nextTransitionDeferredLane = 262144);
          workInProgressDeferredLane = lane;
        } else workInProgressDeferredLane = 536870912;
      lane = suspenseHandlerStackCursor.current;
      null !== lane && (lane.flags |= 32);
      return workInProgressDeferredLane;
    }
    function scheduleViewTransitionEvent(fiber, callback) {
      if (null != callback) {
        var state = fiber.stateNode, instance = state.ref;
        null === instance && (instance = state.ref = createViewTransitionInstance(
          getViewTransitionName(fiber.memoizedProps, state)
        ));
        null === pendingViewTransitionEvents && (pendingViewTransitionEvents = []);
        pendingViewTransitionEvents.push(callback.bind(null, instance));
      }
    }
    function scheduleUpdateOnFiber(root2, fiber, lane) {
      if (root2 === workInProgressRoot && (2 === workInProgressSuspendedReason || 9 === workInProgressSuspendedReason) || null !== root2.cancelPendingCommit)
        prepareFreshStack(root2, 0), markRootSuspended(
          root2,
          workInProgressRootRenderLanes,
          workInProgressDeferredLane,
          false
        );
      markRootUpdated$1(root2, lane);
      if (0 === (executionContext & 2) || root2 !== workInProgressRoot)
        root2 === workInProgressRoot && (0 === (executionContext & 2) && (workInProgressRootInterleavedUpdatedLanes |= lane), 4 === workInProgressRootExitStatus && markRootSuspended(
          root2,
          workInProgressRootRenderLanes,
          workInProgressDeferredLane,
          false
        )), ensureRootIsScheduled(root2);
    }
    function performWorkOnRoot(root$jscomp$0, lanes, forceSync) {
      if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(327));
      var shouldTimeSlice = !forceSync && 0 === (lanes & 127) && 0 === (lanes & root$jscomp$0.expiredLanes) || checkIfRootIsPrerendering(root$jscomp$0, lanes), exitStatus = shouldTimeSlice ? renderRootConcurrent(root$jscomp$0, lanes) : renderRootSync(root$jscomp$0, lanes, true), renderWasConcurrent = shouldTimeSlice;
      do {
        if (0 === exitStatus) {
          workInProgressRootIsPrerendering && !shouldTimeSlice && markRootSuspended(root$jscomp$0, lanes, 0, false);
          break;
        } else {
          forceSync = root$jscomp$0.current.alternate;
          if (renderWasConcurrent && !isRenderConsistentWithExternalStores(forceSync)) {
            exitStatus = renderRootSync(root$jscomp$0, lanes, false);
            renderWasConcurrent = false;
            continue;
          }
          if (2 === exitStatus) {
            renderWasConcurrent = lanes;
            if (root$jscomp$0.errorRecoveryDisabledLanes & renderWasConcurrent)
              var JSCompiler_inline_result = 0;
            else
              JSCompiler_inline_result = root$jscomp$0.pendingLanes & -536870913, JSCompiler_inline_result = 0 !== JSCompiler_inline_result ? JSCompiler_inline_result : JSCompiler_inline_result & 536870912 ? 536870912 : 0;
            if (0 !== JSCompiler_inline_result) {
              lanes = JSCompiler_inline_result;
              a: {
                var root2 = root$jscomp$0;
                exitStatus = workInProgressRootConcurrentErrors;
                var wasRootDehydrated = root2.current.memoizedState.isDehydrated;
                wasRootDehydrated && (prepareFreshStack(root2, JSCompiler_inline_result).flags |= 256);
                JSCompiler_inline_result = renderRootSync(
                  root2,
                  JSCompiler_inline_result,
                  false
                );
                if (2 !== JSCompiler_inline_result && 6 !== JSCompiler_inline_result) {
                  if (workInProgressRootDidAttachPingListener && !wasRootDehydrated) {
                    root2.errorRecoveryDisabledLanes |= renderWasConcurrent;
                    workInProgressRootInterleavedUpdatedLanes |= renderWasConcurrent;
                    exitStatus = 4;
                    break a;
                  }
                  renderWasConcurrent = workInProgressRootRecoverableErrors;
                  workInProgressRootRecoverableErrors = exitStatus;
                  null !== renderWasConcurrent && (null === workInProgressRootRecoverableErrors ? workInProgressRootRecoverableErrors = renderWasConcurrent : workInProgressRootRecoverableErrors.push.apply(
                    workInProgressRootRecoverableErrors,
                    renderWasConcurrent
                  ));
                }
                exitStatus = JSCompiler_inline_result;
              }
              renderWasConcurrent = false;
              if (2 !== exitStatus) continue;
            }
          }
          if (1 === exitStatus) {
            prepareFreshStack(root$jscomp$0, 0);
            markRootSuspended(root$jscomp$0, lanes, 0, true);
            break;
          }
          a: {
            shouldTimeSlice = root$jscomp$0;
            renderWasConcurrent = exitStatus;
            switch (renderWasConcurrent) {
              case 0:
              case 1:
                throw Error(formatProdErrorMessage(345));
              case 4:
                if ((lanes & 4194048) !== lanes && (lanes & 62914560) !== lanes)
                  break;
              case 6:
                markRootSuspended(
                  shouldTimeSlice,
                  lanes,
                  workInProgressDeferredLane,
                  !workInProgressRootDidSkipSuspendedSiblings
                );
                break a;
              case 2:
                workInProgressRootRecoverableErrors = null;
                break;
              case 3:
              case 5:
                break;
              default:
                throw Error(formatProdErrorMessage(329));
            }
            if ((lanes & 62914560) === lanes && (exitStatus = globalMostRecentFallbackTime + 300 - now(), 10 < exitStatus)) {
              markRootSuspended(
                shouldTimeSlice,
                lanes,
                workInProgressDeferredLane,
                !workInProgressRootDidSkipSuspendedSiblings
              );
              if (0 !== getNextLanes(shouldTimeSlice, 0, true)) break a;
              pendingEffectsLanes = lanes;
              shouldTimeSlice.timeoutHandle = scheduleTimeout(
                completeRootWhenReady.bind(
                  null,
                  shouldTimeSlice,
                  forceSync,
                  workInProgressRootRecoverableErrors,
                  workInProgressTransitions,
                  workInProgressRootDidIncludeRecursiveRenderUpdate,
                  lanes,
                  workInProgressDeferredLane,
                  workInProgressRootInterleavedUpdatedLanes,
                  workInProgressSuspendedRetryLanes,
                  workInProgressRootDidSkipSuspendedSiblings,
                  renderWasConcurrent,
                  "Throttled",
                  -0,
                  0
                ),
                exitStatus
              );
              break a;
            }
            completeRootWhenReady(
              shouldTimeSlice,
              forceSync,
              workInProgressRootRecoverableErrors,
              workInProgressTransitions,
              workInProgressRootDidIncludeRecursiveRenderUpdate,
              lanes,
              workInProgressDeferredLane,
              workInProgressRootInterleavedUpdatedLanes,
              workInProgressSuspendedRetryLanes,
              workInProgressRootDidSkipSuspendedSiblings,
              renderWasConcurrent,
              null,
              -0,
              0
            );
          }
        }
        break;
      } while (1);
      ensureRootIsScheduled(root$jscomp$0);
    }
    function completeRootWhenReady(root2, finishedWork, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, lanes, spawnedLane, updatedLanes, suspendedRetryLanes, didSkipSuspendedSiblings, exitStatus, suspendedCommitReason, completedRenderStartTime, completedRenderEndTime) {
      root2.timeoutHandle = -1;
      var subtreeFlags = finishedWork.subtreeFlags, isViewTransitionEligible = (lanes & 335544064) === lanes;
      suspendedCommitReason = null;
      if (isViewTransitionEligible || subtreeFlags & 8192 || 16785408 === (subtreeFlags & 16785408)) {
        if (suspendedCommitReason = {
          stylesheets: null,
          count: 0,
          imgCount: 0,
          imgBytes: 0,
          suspenseyImages: [],
          waitingForImages: true,
          waitingForViewTransition: false,
          unsuspend: noop$1
        }, appearingViewTransitions = null, accumulateSuspenseyCommitOnFiber(
          finishedWork,
          lanes,
          suspendedCommitReason
        ), isViewTransitionEligible && (subtreeFlags = suspendedCommitReason, isViewTransitionEligible = root2.containerInfo, isViewTransitionEligible = (9 === isViewTransitionEligible.nodeType ? isViewTransitionEligible : isViewTransitionEligible.ownerDocument).__reactViewTransition, null != isViewTransitionEligible && (subtreeFlags.count++, subtreeFlags.waitingForViewTransition = true, subtreeFlags =
        onUnsuspend.bind(subtreeFlags), isViewTransitionEligible.finished.then(subtreeFlags, subtreeFlags))), subtreeFlags = (lanes & 62914560) === lanes ? globalMostRecentFallbackTime - now() : (lanes & 4194048) === lanes ? globalMostRecentTransitionTime - now() : 0, subtreeFlags = waitForCommitToBeReady(
          suspendedCommitReason,
          subtreeFlags
        ), null !== subtreeFlags) {
          pendingEffectsLanes = lanes;
          root2.cancelPendingCommit = subtreeFlags(
            completeRoot.bind(
              null,
              root2,
              finishedWork,
              lanes,
              recoverableErrors,
              transitions,
              didIncludeRenderPhaseUpdate,
              spawnedLane,
              updatedLanes,
              suspendedRetryLanes,
              didSkipSuspendedSiblings,
              exitStatus,
              suspendedCommitReason,
              null,
              completedRenderStartTime,
              completedRenderEndTime
            )
          );
          markRootSuspended(root2, lanes, spawnedLane, !didSkipSuspendedSiblings);
          return;
        }
      }
      completeRoot(
        root2,
        finishedWork,
        lanes,
        recoverableErrors,
        transitions,
        didIncludeRenderPhaseUpdate,
        spawnedLane,
        updatedLanes,
        suspendedRetryLanes,
        didSkipSuspendedSiblings,
        exitStatus,
        suspendedCommitReason
      );
    }
    function isRenderConsistentWithExternalStores(finishedWork) {
      for (var node = finishedWork; ; ) {
        var tag = node.tag;
        if ((0 === tag || 11 === tag || 15 === tag) && node.flags & 16384 && (tag = node.updateQueue, null !== tag && (tag = tag.stores, null !== tag)))
          for (var i = 0; i < tag.length; i++) {
            var check = tag[i], getSnapshot = check.getSnapshot;
            check = check.value;
            try {
              if (!objectIs(getSnapshot(), check)) return false;
            } catch (error) {
              return false;
            }
          }
        tag = node.child;
        if (node.subtreeFlags & 16384 && null !== tag)
          tag.return = node, node = tag;
        else {
          if (node === finishedWork) break;
          for (; null === node.sibling; ) {
            if (null === node.return || node.return === finishedWork) return true;
            node = node.return;
          }
          node.sibling.return = node.return;
          node = node.sibling;
        }
      }
      return true;
    }
    function markRootSuspended(root2, suspendedLanes, spawnedLane, didAttemptEntireTree) {
      suspendedLanes = getEntangledLanes(root2, suspendedLanes);
      suspendedLanes &= ~workInProgressRootPingedLanes;
      suspendedLanes &= ~workInProgressRootInterleavedUpdatedLanes;
      root2.suspendedLanes |= suspendedLanes;
      root2.pingedLanes &= ~suspendedLanes;
      didAttemptEntireTree && (root2.warmLanes |= suspendedLanes);
      didAttemptEntireTree = root2.expirationTimes;
      for (var lanes = suspendedLanes; 0 < lanes; ) {
        var index$6 = 31 - clz32(lanes), lane = 1 << index$6;
        didAttemptEntireTree[index$6] = -1;
        lanes &= ~lane;
      }
      0 !== spawnedLane && markSpawnedDeferredLane(root2, spawnedLane, suspendedLanes);
    }
    function flushSyncWork$1() {
      return 0 === (executionContext & 6) ? (flushSyncWorkAcrossRoots_impl(0, false), false) : true;
    }
    function resetWorkInProgressStack() {
      if (null !== workInProgress) {
        if (0 === workInProgressSuspendedReason)
          var interruptedWork = workInProgress.return;
        else
          interruptedWork = workInProgress, lastContextDependency = currentlyRenderingFiber$1 = null, resetHooksOnUnwind(interruptedWork), thenableState$1 = null, thenableIndexCounter$1 = 0, interruptedWork = workInProgress;
        for (; null !== interruptedWork; )
          unwindInterruptedWork(interruptedWork.alternate, interruptedWork), interruptedWork = interruptedWork.return;
        workInProgress = null;
      }
    }
    function prepareFreshStack(root2, lanes) {
      var timeoutHandle = root2.timeoutHandle;
      -1 !== timeoutHandle && (root2.timeoutHandle = -1, cancelTimeout(timeoutHandle));
      timeoutHandle = root2.cancelPendingCommit;
      null !== timeoutHandle && (root2.cancelPendingCommit = null, timeoutHandle());
      pendingEffectsLanes = 0;
      resetWorkInProgressStack();
      workInProgressRoot = root2;
      workInProgress = timeoutHandle = createWorkInProgress(root2.current, null);
      workInProgressRootRenderLanes = lanes;
      workInProgressSuspendedReason = 0;
      workInProgressThrownValue = null;
      workInProgressRootDidSkipSuspendedSiblings = false;
      workInProgressRootIsPrerendering = checkIfRootIsPrerendering(root2, lanes);
      workInProgressRootDidAttachPingListener = false;
      workInProgressSuspendedRetryLanes = workInProgressDeferredLane = workInProgressRootPingedLanes = workInProgressRootInterleavedUpdatedLanes = workInProgressRootSkippedLanes = workInProgressRootExitStatus = 0;
      workInProgressRootRecoverableErrors = workInProgressRootConcurrentErrors = null;
      workInProgressRootDidIncludeRecursiveRenderUpdate = false;
      entangledRenderLanes = getEntangledLanes(root2, lanes);
      finishQueueingConcurrentUpdates();
      return timeoutHandle;
    }
    function handleThrow(root2, thrownValue) {
      currentlyRenderingFiber = null;
      ReactSharedInternals.H = ContextOnlyDispatcher;
      thrownValue === SuspenseException || thrownValue === SuspenseActionException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 3) : thrownValue === SuspenseyCommitException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 4) : workInProgressSuspendedReason = thrownValue === SelectiveHydrationException ? 8 : null !== thrownValue && "object" === typeof thrownValue &&
      "function" === typeof thrownValue.then ? 6 : 1;
      workInProgressThrownValue = thrownValue;
      null === workInProgress && (workInProgressRootExitStatus = 1, logUncaughtError(
        root2,
        createCapturedValueAtFiber(thrownValue, root2.current)
      ));
    }
    function shouldRemainOnPreviousScreen() {
      var handler = suspenseHandlerStackCursor.current;
      return null === handler ? true : (workInProgressRootRenderLanes & 4194048) === workInProgressRootRenderLanes ? null === shellBoundary ? true : false : (workInProgressRootRenderLanes & 62914560) === workInProgressRootRenderLanes || 0 !== (workInProgressRootRenderLanes & 536870912) ? handler === shellBoundary : false;
    }
    function pushDispatcher() {
      var prevDispatcher = ReactSharedInternals.H;
      ReactSharedInternals.H = ContextOnlyDispatcher;
      return null === prevDispatcher ? ContextOnlyDispatcher : prevDispatcher;
    }
    function pushAsyncDispatcher() {
      var prevAsyncDispatcher = ReactSharedInternals.A;
      ReactSharedInternals.A = DefaultAsyncDispatcher;
      return prevAsyncDispatcher;
    }
    function renderDidSuspendDelayIfPossible() {
      workInProgressRootExitStatus = 4;
      workInProgressRootDidSkipSuspendedSiblings || (workInProgressRootRenderLanes & 4194048) !== workInProgressRootRenderLanes && null !== suspenseHandlerStackCursor.current || (workInProgressRootIsPrerendering = true);
      0 === (workInProgressRootSkippedLanes & 134217727) && 0 === (workInProgressRootInterleavedUpdatedLanes & 134217727) || null === workInProgressRoot || markRootSuspended(
        workInProgressRoot,
        workInProgressRootRenderLanes,
        workInProgressDeferredLane,
        false
      );
    }
    function renderRootSync(root2, lanes, shouldYieldForPrerendering) {
      var prevExecutionContext = executionContext;
      executionContext |= 2;
      var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
      if (workInProgressRoot !== root2 || workInProgressRootRenderLanes !== lanes)
        workInProgressTransitions = null, prepareFreshStack(root2, lanes);
      lanes = false;
      var exitStatus = workInProgressRootExitStatus;
      a: do
        try {
          if (0 !== workInProgressSuspendedReason && null !== workInProgress) {
            var unitOfWork = workInProgress, thrownValue = workInProgressThrownValue;
            switch (workInProgressSuspendedReason) {
              case 8:
                resetWorkInProgressStack();
                exitStatus = 6;
                break a;
              case 3:
              case 2:
              case 9:
              case 6:
                null === suspenseHandlerStackCursor.current && (lanes = true);
                var reason = workInProgressSuspendedReason;
                workInProgressSuspendedReason = 0;
                workInProgressThrownValue = null;
                throwAndUnwindWorkLoop(root2, unitOfWork, thrownValue, reason);
                if (shouldYieldForPrerendering && workInProgressRootIsPrerendering) {
                  exitStatus = 0;
                  break a;
                }
                break;
              default:
                reason = workInProgressSuspendedReason, workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root2, unitOfWork, thrownValue, reason);
            }
          }
          workLoopSync();
          exitStatus = workInProgressRootExitStatus;
          break;
        } catch (thrownValue$184) {
          handleThrow(root2, thrownValue$184);
        }
      while (1);
      lanes && root2.shellSuspendCounter++;
      lastContextDependency = currentlyRenderingFiber$1 = null;
      executionContext = prevExecutionContext;
      ReactSharedInternals.H = prevDispatcher;
      ReactSharedInternals.A = prevAsyncDispatcher;
      null === workInProgress && (workInProgressRoot = null, workInProgressRootRenderLanes = 0, finishQueueingConcurrentUpdates());
      return exitStatus;
    }
    function workLoopSync() {
      for (; null !== workInProgress; ) performUnitOfWork(workInProgress);
    }
    function renderRootConcurrent(root2, lanes) {
      var prevExecutionContext = executionContext;
      executionContext |= 2;
      var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
      workInProgressRoot !== root2 || workInProgressRootRenderLanes !== lanes ? (workInProgressTransitions = null, workInProgressRootRenderTargetTime = now() + 500, prepareFreshStack(root2, lanes)) : workInProgressRootIsPrerendering = checkIfRootIsPrerendering(
        root2,
        lanes
      );
      a: do
        try {
          if (0 !== workInProgressSuspendedReason && null !== workInProgress) {
            lanes = workInProgress;
            var thrownValue = workInProgressThrownValue;
            b: switch (workInProgressSuspendedReason) {
              case 1:
                workInProgressSuspendedReason = 0;
                workInProgressThrownValue = null;
                throwAndUnwindWorkLoop(root2, lanes, thrownValue, 1);
                break;
              case 2:
              case 9:
                if (isThenableResolved(thrownValue)) {
                  workInProgressSuspendedReason = 0;
                  workInProgressThrownValue = null;
                  replaySuspendedUnitOfWork(lanes);
                  break;
                }
                lanes = function() {
                  2 !== workInProgressSuspendedReason && 9 !== workInProgressSuspendedReason || workInProgressRoot !== root2 || (workInProgressSuspendedReason = 7);
                  ensureRootIsScheduled(root2);
                };
                thrownValue.then(lanes, lanes);
                break a;
              case 3:
                workInProgressSuspendedReason = 7;
                break a;
              case 4:
                workInProgressSuspendedReason = 5;
                break a;
              case 7:
                isThenableResolved(thrownValue) ? (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, replaySuspendedUnitOfWork(lanes)) : (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root2, lanes, thrownValue, 7));
                break;
              case 5:
                var resource = null;
                switch (workInProgress.tag) {
                  case 26:
                    resource = workInProgress.memoizedState;
                  case 5:
                  case 27:
                    var hostFiber = workInProgress;
                    if (resource ? preloadResource(resource) : hostFiber.stateNode.complete) {
                      workInProgressSuspendedReason = 0;
                      workInProgressThrownValue = null;
                      var sibling = hostFiber.sibling;
                      if (null !== sibling) workInProgress = sibling;
                      else {
                        var returnFiber = hostFiber.return;
                        null !== returnFiber ? (workInProgress = returnFiber, completeUnitOfWork(returnFiber)) : workInProgress = null;
                      }
                      break b;
                    }
                }
                workInProgressSuspendedReason = 0;
                workInProgressThrownValue = null;
                throwAndUnwindWorkLoop(root2, lanes, thrownValue, 5);
                break;
              case 6:
                workInProgressSuspendedReason = 0;
                workInProgressThrownValue = null;
                throwAndUnwindWorkLoop(root2, lanes, thrownValue, 6);
                break;
              case 8:
                resetWorkInProgressStack();
                workInProgressRootExitStatus = 6;
                break a;
              default:
                throw Error(formatProdErrorMessage(462));
            }
          }
          workLoopConcurrentByScheduler();
          break;
        } catch (thrownValue$186) {
          handleThrow(root2, thrownValue$186);
        }
      while (1);
      lastContextDependency = currentlyRenderingFiber$1 = null;
      ReactSharedInternals.H = prevDispatcher;
      ReactSharedInternals.A = prevAsyncDispatcher;
      executionContext = prevExecutionContext;
      if (null !== workInProgress) return 0;
      workInProgressRoot = null;
      workInProgressRootRenderLanes = 0;
      finishQueueingConcurrentUpdates();
      return workInProgressRootExitStatus;
    }
    function workLoopConcurrentByScheduler() {
      for (; null !== workInProgress && !shouldYield(); )
        performUnitOfWork(workInProgress);
    }
    function performUnitOfWork(unitOfWork) {
      var next = beginWork(unitOfWork.alternate, unitOfWork, entangledRenderLanes);
      unitOfWork.memoizedProps = unitOfWork.pendingProps;
      null === next ? completeUnitOfWork(unitOfWork) : workInProgress = next;
    }
    function replaySuspendedUnitOfWork(unitOfWork) {
      var next = unitOfWork;
      var current = next.alternate;
      switch (next.tag) {
        case 15:
        case 0:
          next = replayFunctionComponent(
            current,
            next,
            next.pendingProps,
            next.type,
            void 0,
            workInProgressRootRenderLanes
          );
          break;
        case 11:
          next = replayFunctionComponent(
            current,
            next,
            next.pendingProps,
            next.type.render,
            next.ref,
            workInProgressRootRenderLanes
          );
          break;
        case 5:
          resetHooksOnUnwind(next);
          var fiber = next;
          fiber === hydrationParentFiber && (isHydrating ? (popToNextHostParent(fiber), 5 === fiber.tag && null != fiber.stateNode && (nextHydratableInstance = fiber.stateNode)) : (popToNextHostParent(fiber), isHydrating = true));
        default:
          unwindInterruptedWork(current, next), next = workInProgress = resetWorkInProgress(next, entangledRenderLanes), next = beginWork(current, next, entangledRenderLanes);
      }
      unitOfWork.memoizedProps = unitOfWork.pendingProps;
      null === next ? completeUnitOfWork(unitOfWork) : workInProgress = next;
    }
    function throwAndUnwindWorkLoop(root2, unitOfWork, thrownValue, suspendedReason) {
      lastContextDependency = currentlyRenderingFiber$1 = null;
      resetHooksOnUnwind(unitOfWork);
      thenableState$1 = null;
      thenableIndexCounter$1 = 0;
      var returnFiber = unitOfWork.return;
      try {
        if (throwException(
          root2,
          returnFiber,
          unitOfWork,
          thrownValue,
          workInProgressRootRenderLanes
        )) {
          workInProgressRootExitStatus = 1;
          logUncaughtError(
            root2,
            createCapturedValueAtFiber(thrownValue, root2.current)
          );
          workInProgress = null;
          return;
        }
      } catch (error) {
        if (null !== returnFiber) throw workInProgress = returnFiber, error;
        workInProgressRootExitStatus = 1;
        logUncaughtError(
          root2,
          createCapturedValueAtFiber(thrownValue, root2.current)
        );
        workInProgress = null;
        return;
      }
      if (unitOfWork.flags & 32768) {
        if (isHydrating || 1 === suspendedReason) root2 = true;
        else if (workInProgressRootIsPrerendering || 0 !== (workInProgressRootRenderLanes & 536870912))
          root2 = false;
        else if (workInProgressRootDidSkipSuspendedSiblings = root2 = true, 2 === suspendedReason || 9 === suspendedReason || 3 === suspendedReason || 6 === suspendedReason)
          suspendedReason = suspenseHandlerStackCursor.current, null !== suspendedReason && 13 === suspendedReason.tag && (suspendedReason.flags |= 16384);
        unwindUnitOfWork(unitOfWork, root2);
      } else completeUnitOfWork(unitOfWork);
    }
    function completeUnitOfWork(unitOfWork) {
      var completedWork = unitOfWork;
      do {
        if (0 !== (completedWork.flags & 32768)) {
          unwindUnitOfWork(
            completedWork,
            workInProgressRootDidSkipSuspendedSiblings
          );
          return;
        }
        unitOfWork = completedWork.return;
        var next = completeWork(
          completedWork.alternate,
          completedWork,
          entangledRenderLanes
        );
        if (null !== next) {
          workInProgress = next;
          return;
        }
        completedWork = completedWork.sibling;
        if (null !== completedWork) {
          workInProgress = completedWork;
          return;
        }
        workInProgress = completedWork = unitOfWork;
      } while (null !== completedWork);
      0 === workInProgressRootExitStatus && (workInProgressRootExitStatus = 5);
    }
    function unwindUnitOfWork(unitOfWork, skipSiblings) {
      do {
        var next = unwindWork(unitOfWork.alternate, unitOfWork);
        if (null !== next) {
          next.flags &= 32767;
          workInProgress = next;
          return;
        }
        next = unitOfWork.return;
        null !== next && (next.flags |= 32768, next.subtreeFlags = 0, next.deletions = null);
        if (!skipSiblings && (unitOfWork = unitOfWork.sibling, null !== unitOfWork)) {
          workInProgress = unitOfWork;
          return;
        }
        workInProgress = unitOfWork = next;
      } while (null !== unitOfWork);
      workInProgressRootExitStatus = 6;
      workInProgress = null;
    }
    function completeRoot(root2, finishedWork, lanes, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes, didSkipSuspendedSiblings, exitStatus, suspendedState) {
      root2.cancelPendingCommit = null;
      do
        flushPendingEffects();
      while (0 !== pendingEffectsStatus);
      if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(327));
      if (null !== finishedWork) {
        if (finishedWork === root2.current) throw Error(formatProdErrorMessage(177));
        root2 === workInProgressRoot && (workInProgress = workInProgressRoot = null, workInProgressRootRenderLanes = 0);
        pendingFinishedWork = finishedWork;
        pendingEffectsRoot = root2;
        pendingEffectsLanes = lanes;
        pendingPassiveTransitions = transitions;
        pendingRecoverableErrors = recoverableErrors;
        commitRoot(
          root2,
          finishedWork,
          lanes,
          spawnedLane,
          updatedLanes,
          suspendedRetryLanes,
          suspendedState
        );
      }
    }
    function commitRoot(root2, finishedWork, lanes, spawnedLane, updatedLanes, suspendedRetryLanes, suspendedState) {
      var remainingLanes = finishedWork.lanes | finishedWork.childLanes;
      pendingEffectsRemainingLanes = remainingLanes;
      remainingLanes |= concurrentlyUpdatedLanes;
      markRootFinished(
        root2,
        lanes,
        remainingLanes,
        spawnedLane,
        updatedLanes,
        suspendedRetryLanes
      );
      pendingViewTransitionEvents = null;
      (lanes & 335544064) === lanes ? (pendingTransitionTypes = claimQueuedTransitionTypes(root2), spawnedLane = 10262) : (pendingTransitionTypes = null, spawnedLane = 10256);
      0 !== (finishedWork.subtreeFlags & spawnedLane) || 0 !== (finishedWork.flags & spawnedLane) ? (root2.callbackNode = null, root2.callbackPriority = 0, scheduleCallback$1(NormalPriority$1, function() {
        flushPassiveEffects();
        return null;
      })) : (root2.callbackNode = null, root2.callbackPriority = 0);
      shouldStartViewTransition = false;
      spawnedLane = 0 !== (finishedWork.flags & 13878);
      if (0 !== (finishedWork.subtreeFlags & 13878) || spawnedLane) {
        spawnedLane = ReactSharedInternals.T;
        ReactSharedInternals.T = null;
        updatedLanes = ReactDOMSharedInternals.p;
        ReactDOMSharedInternals.p = 2;
        suspendedRetryLanes = executionContext;
        executionContext |= 4;
        try {
          commitBeforeMutationEffects(root2, finishedWork, lanes);
        } finally {
          executionContext = suspendedRetryLanes, ReactDOMSharedInternals.p = updatedLanes, ReactSharedInternals.T = spawnedLane;
        }
      }
      pendingEffectsStatus = 1;
      shouldStartViewTransition ? pendingViewTransition = startViewTransition(
        suspendedState,
        root2.containerInfo,
        pendingTransitionTypes,
        flushMutationEffects,
        flushLayoutEffects,
        flushAfterMutationEffects,
        flushSpawnedWork,
        flushPassiveEffects,
        reportViewTransitionError,
        null,
        null
      ) : (flushMutationEffects(), flushLayoutEffects(), flushSpawnedWork());
    }
    function reportViewTransitionError(error) {
      if (0 !== pendingEffectsStatus) {
        var onRecoverableError = pendingEffectsRoot.onRecoverableError;
        onRecoverableError(error, { componentStack: null });
      }
    }
    function flushAfterMutationEffects() {
      3 === pendingEffectsStatus && (pendingEffectsStatus = 0, commitAfterMutationEffectsOnFiber(pendingFinishedWork, pendingEffectsRoot), pendingEffectsStatus = 4);
    }
    function flushMutationEffects() {
      if (1 === pendingEffectsStatus) {
        pendingEffectsStatus = 0;
        var root2 = pendingEffectsRoot, finishedWork = pendingFinishedWork, lanes = pendingEffectsLanes, rootMutationHasEffect = 0 !== (finishedWork.flags & 13878);
        if (0 !== (finishedWork.subtreeFlags & 13878) || rootMutationHasEffect) {
          rootMutationHasEffect = ReactSharedInternals.T;
          ReactSharedInternals.T = null;
          var previousPriority = ReactDOMSharedInternals.p;
          ReactDOMSharedInternals.p = 2;
          var prevExecutionContext = executionContext;
          executionContext |= 4;
          try {
            inUpdateViewTransition = rootViewTransitionAffected = false;
            commitMutationEffectsOnFiber(finishedWork, root2, lanes);
            lanes = selectionInformation;
            var curFocusedElem = getActiveElementDeep(root2.containerInfo), priorFocusedElem = lanes.focusedElem, priorSelectionRange = lanes.selectionRange;
            if (curFocusedElem !== priorFocusedElem && priorFocusedElem && priorFocusedElem.ownerDocument && containsNode(
              priorFocusedElem.ownerDocument.documentElement,
              priorFocusedElem
            )) {
              if (null !== priorSelectionRange && hasSelectionCapabilities(priorFocusedElem)) {
                var start = priorSelectionRange.start, end = priorSelectionRange.end;
                void 0 === end && (end = start);
                if ("selectionStart" in priorFocusedElem)
                  priorFocusedElem.selectionStart = start, priorFocusedElem.selectionEnd = Math.min(
                    end,
                    priorFocusedElem.value.length
                  );
                else {
                  var doc = priorFocusedElem.ownerDocument || document, win = doc && doc.defaultView || window;
                  if (win.getSelection) {
                    var selection = win.getSelection(), length = priorFocusedElem.textContent.length, start$jscomp$0 = Math.min(priorSelectionRange.start, length), end$jscomp$0 = void 0 === priorSelectionRange.end ? start$jscomp$0 : Math.min(priorSelectionRange.end, length);
                    !selection.extend && start$jscomp$0 > end$jscomp$0 && (curFocusedElem = end$jscomp$0, end$jscomp$0 = start$jscomp$0, start$jscomp$0 = curFocusedElem);
                    var startMarker = getNodeForCharacterOffset(
                      priorFocusedElem,
                      start$jscomp$0
                    ), endMarker = getNodeForCharacterOffset(
                      priorFocusedElem,
                      end$jscomp$0
                    );
                    if (startMarker && endMarker && (1 !== selection.rangeCount || selection.anchorNode !== startMarker.node || selection.anchorOffset !== startMarker.offset || selection.focusNode !== endMarker.node || selection.focusOffset !== endMarker.offset)) {
                      var range = doc.createRange();
                      range.setStart(startMarker.node, startMarker.offset);
                      selection.removeAllRanges();
                      start$jscomp$0 > end$jscomp$0 ? (selection.addRange(range), selection.extend(endMarker.node, endMarker.offset)) : (range.setEnd(endMarker.node, endMarker.offset), selection.addRange(range));
                    }
                  }
                }
              }
              doc = [];
              for (selection = priorFocusedElem; selection = selection.parentNode; )
                1 === selection.nodeType && doc.push({
                  element: selection,
                  left: selection.scrollLeft,
                  top: selection.scrollTop
                });
              "function" === typeof priorFocusedElem.focus && priorFocusedElem.focus();
              for (priorFocusedElem = 0; priorFocusedElem < doc.length; priorFocusedElem++) {
                var info = doc[priorFocusedElem];
                info.element.scrollLeft = info.left;
                info.element.scrollTop = info.top;
              }
            }
            _enabled = !!eventsEnabled;
            selectionInformation = eventsEnabled = null;
          } finally {
            executionContext = prevExecutionContext, ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = rootMutationHasEffect;
          }
        }
        root2.current = finishedWork;
        pendingEffectsStatus = 2;
      }
    }
    function flushLayoutEffects() {
      if (2 === pendingEffectsStatus) {
        pendingEffectsStatus = 0;
        var root2 = pendingEffectsRoot, finishedWork = pendingFinishedWork, rootHasLayoutEffect = 0 !== (finishedWork.flags & 8772);
        if (0 !== (finishedWork.subtreeFlags & 8772) || rootHasLayoutEffect) {
          rootHasLayoutEffect = ReactSharedInternals.T;
          ReactSharedInternals.T = null;
          var previousPriority = ReactDOMSharedInternals.p;
          ReactDOMSharedInternals.p = 2;
          var prevExecutionContext = executionContext;
          executionContext |= 4;
          try {
            commitLayoutEffectOnFiber(root2, finishedWork.alternate, finishedWork);
          } finally {
            executionContext = prevExecutionContext, ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = rootHasLayoutEffect;
          }
        }
        pendingEffectsStatus = 3;
      }
    }
    function flushSpawnedWork() {
      if (4 === pendingEffectsStatus || 3 === pendingEffectsStatus) {
        pendingEffectsStatus = 0;
        var committedViewTransition = pendingViewTransition;
        pendingViewTransition = null;
        requestPaint();
        var root2 = pendingEffectsRoot, finishedWork = pendingFinishedWork, lanes = pendingEffectsLanes, recoverableErrors = pendingRecoverableErrors, passiveSubtreeMask = (lanes & 335544064) === lanes ? 10262 : 10256;
        0 !== (finishedWork.subtreeFlags & passiveSubtreeMask) || 0 !== (finishedWork.flags & passiveSubtreeMask) ? pendingEffectsStatus = 5 : (pendingEffectsStatus = 0, pendingFinishedWork = pendingEffectsRoot = null, releaseRootPooledCache(root2, root2.pendingLanes));
        passiveSubtreeMask = root2.pendingLanes;
        0 === passiveSubtreeMask && (legacyErrorBoundariesThatAlreadyFailed = null);
        lanesToEventPriority(lanes);
        finishedWork = finishedWork.stateNode;
        if (injectedHook && "function" === typeof injectedHook.onCommitFiberRoot)
          try {
            injectedHook.onCommitFiberRoot(
              rendererID,
              finishedWork,
              void 0,
              128 === (finishedWork.current.flags & 128)
            );
          } catch (err) {
          }
        if (null !== recoverableErrors) {
          finishedWork = ReactSharedInternals.T;
          passiveSubtreeMask = ReactDOMSharedInternals.p;
          ReactDOMSharedInternals.p = 2;
          ReactSharedInternals.T = null;
          try {
            for (var onRecoverableError = root2.onRecoverableError, i = 0; i < recoverableErrors.length; i++) {
              var recoverableError = recoverableErrors[i];
              onRecoverableError(recoverableError.value, {
                componentStack: recoverableError.stack
              });
            }
          } finally {
            ReactSharedInternals.T = finishedWork, ReactDOMSharedInternals.p = passiveSubtreeMask;
          }
        }
        recoverableErrors = pendingViewTransitionEvents;
        onRecoverableError = pendingTransitionTypes;
        pendingTransitionTypes = null;
        if (null !== recoverableErrors && (pendingViewTransitionEvents = null, null === onRecoverableError && (onRecoverableError = []), null !== committedViewTransition))
          for (recoverableError = 0; recoverableError < recoverableErrors.length; recoverableError++)
            finishedWork = (0, recoverableErrors[recoverableError])(
              onRecoverableError
            ), void 0 !== finishedWork && committedViewTransition.finished.finally(finishedWork);
        0 !== (pendingEffectsLanes & 3) && flushPendingEffects();
        ensureRootIsScheduled(root2);
        passiveSubtreeMask = root2.pendingLanes;
        0 !== (lanes & 261930) && 0 !== (passiveSubtreeMask & 42) ? root2 === rootWithNestedUpdates ? nestedUpdateCount++ : (nestedUpdateCount = 0, rootWithNestedUpdates = root2) : (nestedUpdateCount = 0, rootWithNestedUpdates = null);
        flushSyncWorkAcrossRoots_impl(0, false);
      }
    }
    function releaseRootPooledCache(root2, remainingLanes) {
      0 === (root2.pooledCacheLanes &= remainingLanes) && (remainingLanes = root2.pooledCache, null != remainingLanes && (root2.pooledCache = null, releaseCache(remainingLanes)));
    }
    function flushPendingEffects() {
      null !== pendingViewTransition && (pendingViewTransition.skipTransition(), pendingViewTransition = null);
      flushMutationEffects();
      flushLayoutEffects();
      flushSpawnedWork();
      return flushPassiveEffects();
    }
    function flushPassiveEffects() {
      if (5 !== pendingEffectsStatus) return false;
      var root2 = pendingEffectsRoot, remainingLanes = pendingEffectsRemainingLanes;
      pendingEffectsRemainingLanes = 0;
      var renderPriority = lanesToEventPriority(pendingEffectsLanes), prevTransition = ReactSharedInternals.T, previousPriority = ReactDOMSharedInternals.p;
      try {
        ReactDOMSharedInternals.p = 32 > renderPriority ? 32 : renderPriority;
        ReactSharedInternals.T = null;
        renderPriority = pendingPassiveTransitions;
        pendingPassiveTransitions = null;
        var root$jscomp$0 = pendingEffectsRoot, lanes = pendingEffectsLanes;
        pendingEffectsStatus = 0;
        pendingFinishedWork = pendingEffectsRoot = null;
        pendingEffectsLanes = 0;
        if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(331));
        var prevExecutionContext = executionContext;
        executionContext |= 4;
        commitPassiveUnmountOnFiber(root$jscomp$0.current);
        commitPassiveMountOnFiber(
          root$jscomp$0,
          root$jscomp$0.current,
          lanes,
          renderPriority
        );
        executionContext = prevExecutionContext;
        flushSyncWorkAcrossRoots_impl(0, false);
        if (injectedHook && "function" === typeof injectedHook.onPostCommitFiberRoot)
          try {
            injectedHook.onPostCommitFiberRoot(rendererID, root$jscomp$0);
          } catch (err) {
          }
        return true;
      } finally {
        ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition, releaseRootPooledCache(root2, remainingLanes);
      }
    }
    function captureCommitPhaseErrorOnRoot(rootFiber, sourceFiber, error) {
      sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
      sourceFiber = createRootErrorUpdate(rootFiber.stateNode, sourceFiber, 2);
      rootFiber = enqueueUpdate(rootFiber, sourceFiber, 2);
      null !== rootFiber && (markRootUpdated$1(rootFiber, 2), ensureRootIsScheduled(rootFiber));
    }
    function captureCommitPhaseError(sourceFiber, nearestMountedAncestor, error) {
      if (3 === sourceFiber.tag)
        captureCommitPhaseErrorOnRoot(sourceFiber, sourceFiber, error);
      else
        for (; null !== nearestMountedAncestor; ) {
          if (3 === nearestMountedAncestor.tag) {
            captureCommitPhaseErrorOnRoot(
              nearestMountedAncestor,
              sourceFiber,
              error
            );
            break;
          } else if (1 === nearestMountedAncestor.tag) {
            var instance = nearestMountedAncestor.stateNode;
            if ("function" === typeof nearestMountedAncestor.type.getDerivedStateFromError || "function" === typeof instance.componentDidCatch && (null === legacyErrorBoundariesThatAlreadyFailed || !legacyErrorBoundariesThatAlreadyFailed.has(instance))) {
              sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
              error = createClassErrorUpdate(2);
              instance = enqueueUpdate(nearestMountedAncestor, error, 2);
              null !== instance && (initializeClassErrorUpdate(
                error,
                instance,
                nearestMountedAncestor,
                sourceFiber
              ), markRootUpdated$1(instance, 2), ensureRootIsScheduled(instance));
              break;
            }
          }
          nearestMountedAncestor = nearestMountedAncestor.return;
        }
    }
    function attachPingListener(root2, wakeable, lanes) {
      var pingCache = root2.pingCache;
      if (null === pingCache) {
        pingCache = root2.pingCache = new PossiblyWeakMap();
        var threadIDs = /* @__PURE__ */ new Set();
        pingCache.set(wakeable, threadIDs);
      } else
        threadIDs = pingCache.get(wakeable), void 0 === threadIDs && (threadIDs = /* @__PURE__ */ new Set(), pingCache.set(wakeable, threadIDs));
      threadIDs.has(lanes) || (workInProgressRootDidAttachPingListener = true, threadIDs.add(lanes), root2 = pingSuspendedRoot.bind(null, root2, wakeable, lanes), wakeable.then(root2, root2));
    }
    function pingSuspendedRoot(root2, wakeable, pingedLanes) {
      var pingCache = root2.pingCache;
      null !== pingCache && pingCache.delete(wakeable);
      root2.pingedLanes |= root2.suspendedLanes & pingedLanes;
      root2.warmLanes &= ~pingedLanes;
      workInProgressRoot === root2 && (workInProgressRootRenderLanes & pingedLanes) === pingedLanes && (4 === workInProgressRootExitStatus || 3 === workInProgressRootExitStatus && (workInProgressRootRenderLanes & 62914560) === workInProgressRootRenderLanes && 300 > now() - globalMostRecentFallbackTime ? 0 === (executionContext & 2) ? prepareFreshStack(root2, 0) : workInProgressRootPingedLanes |= pingedLanes :
      workInProgressRootPingedLanes |= pingedLanes, workInProgressSuspendedRetryLanes === workInProgressRootRenderLanes && (workInProgressSuspendedRetryLanes = 0));
      ensureRootIsScheduled(root2);
    }
    function retryTimedOutBoundary(boundaryFiber, retryLane) {
      0 === retryLane && (retryLane = claimNextRetryLane());
      boundaryFiber = enqueueConcurrentRenderForLane(boundaryFiber, retryLane);
      null !== boundaryFiber && (markRootUpdated$1(boundaryFiber, retryLane), ensureRootIsScheduled(boundaryFiber));
    }
    function retryDehydratedSuspenseBoundary(boundaryFiber) {
      var suspenseState = boundaryFiber.memoizedState, retryLane = 0;
      null !== suspenseState && (retryLane = suspenseState.retryLane);
      retryTimedOutBoundary(boundaryFiber, retryLane);
    }
    function resolveRetryWakeable(boundaryFiber, wakeable) {
      var retryLane = 0;
      switch (boundaryFiber.tag) {
        case 31:
        case 13:
          var retryCache = boundaryFiber.stateNode;
          var suspenseState = boundaryFiber.memoizedState;
          null !== suspenseState && (retryLane = suspenseState.retryLane);
          break;
        case 19:
          retryCache = boundaryFiber.stateNode;
          break;
        case 22:
          retryCache = boundaryFiber.stateNode._retryCache;
          break;
        default:
          throw Error(formatProdErrorMessage(314));
      }
      null !== retryCache && retryCache.delete(wakeable);
      retryTimedOutBoundary(boundaryFiber, retryLane);
    }
    function scheduleCallback$1(priorityLevel, callback) {
      return scheduleCallback$3(priorityLevel, callback);
    }
    var firstScheduledRoot = null;
    var lastScheduledRoot = null;
    var didScheduleMicrotask = false;
    var mightHavePendingSyncWork = false;
    var isFlushingWork = false;
    var currentEventTransitionLane = 0;
    function ensureRootIsScheduled(root2) {
      root2 !== lastScheduledRoot && null === root2.next && (null === lastScheduledRoot ? firstScheduledRoot = lastScheduledRoot = root2 : lastScheduledRoot = lastScheduledRoot.next = root2);
      mightHavePendingSyncWork = true;
      didScheduleMicrotask || (didScheduleMicrotask = true, scheduleImmediateRootScheduleTask());
    }
    function flushSyncWorkAcrossRoots_impl(syncTransitionLanes, onlyLegacy) {
      if (!isFlushingWork && mightHavePendingSyncWork) {
        isFlushingWork = true;
        do {
          var didPerformSomeWork = false;
          for (var root$190 = firstScheduledRoot; null !== root$190; ) {
            if (!onlyLegacy)
              if (0 !== syncTransitionLanes) {
                var pendingLanes = root$190.pendingLanes;
                if (0 === pendingLanes) var JSCompiler_inline_result = 0;
                else {
                  var suspendedLanes = root$190.suspendedLanes, pingedLanes = root$190.pingedLanes;
                  JSCompiler_inline_result = (1 << 31 - clz32(42 | syncTransitionLanes) + 1) - 1;
                  JSCompiler_inline_result &= pendingLanes & ~(suspendedLanes & ~pingedLanes);
                  JSCompiler_inline_result = JSCompiler_inline_result & 201326741 ? JSCompiler_inline_result & 201326741 | 1 : JSCompiler_inline_result ? JSCompiler_inline_result | 2 : 0;
                }
                0 !== JSCompiler_inline_result && (didPerformSomeWork = true, performSyncWorkOnRoot(root$190, JSCompiler_inline_result));
              } else
                JSCompiler_inline_result = workInProgressRootRenderLanes, JSCompiler_inline_result = getNextLanes(
                  root$190,
                  root$190 === workInProgressRoot ? JSCompiler_inline_result : 0,
                  null !== root$190.cancelPendingCommit || -1 !== root$190.timeoutHandle
                ), 0 === (JSCompiler_inline_result & 3) || checkIfRootIsPrerendering(root$190, JSCompiler_inline_result) || (didPerformSomeWork = true, performSyncWorkOnRoot(root$190, JSCompiler_inline_result));
            root$190 = root$190.next;
          }
        } while (didPerformSomeWork);
        isFlushingWork = false;
      }
    }
    function processRootScheduleInImmediateTask() {
      processRootScheduleInMicrotask();
    }
    function processRootScheduleInMicrotask() {
      mightHavePendingSyncWork = didScheduleMicrotask = false;
      var syncTransitionLanes = 0;
      0 !== currentEventTransitionLane && shouldAttemptEagerTransition() && (syncTransitionLanes = currentEventTransitionLane);
      for (var currentTime = now(), prev = null, root2 = firstScheduledRoot; null !== root2; ) {
        var next = root2.next, nextLanes = scheduleTaskForRootDuringMicrotask(root2, currentTime);
        if (0 === nextLanes)
          root2.next = null, null === prev ? firstScheduledRoot = next : prev.next = next, null === next && (lastScheduledRoot = prev);
        else if (prev = root2, 0 !== syncTransitionLanes || 0 !== (nextLanes & 3))
          mightHavePendingSyncWork = true;
        root2 = next;
      }
      0 !== pendingEffectsStatus && 5 !== pendingEffectsStatus || flushSyncWorkAcrossRoots_impl(syncTransitionLanes, false);
      0 !== currentEventTransitionLane && (currentEventTransitionLane = 0);
    }
    function scheduleTaskForRootDuringMicrotask(root2, currentTime) {
      for (var suspendedLanes = root2.suspendedLanes, pingedLanes = root2.pingedLanes, expirationTimes = root2.expirationTimes, lanes = root2.pendingLanes & -62914561; 0 < lanes; ) {
        var index$5 = 31 - clz32(lanes), lane = 1 << index$5, expirationTime = expirationTimes[index$5];
        if (-1 === expirationTime) {
          if (0 === (lane & suspendedLanes) || 0 !== (lane & pingedLanes))
            expirationTimes[index$5] = computeExpirationTime(lane, currentTime);
        } else expirationTime <= currentTime && (root2.expiredLanes |= lane);
        lanes &= ~lane;
      }
      currentTime = workInProgressRoot;
      suspendedLanes = workInProgressRootRenderLanes;
      suspendedLanes = getNextLanes(
        root2,
        root2 === currentTime ? suspendedLanes : 0,
        null !== root2.cancelPendingCommit || -1 !== root2.timeoutHandle
      );
      pingedLanes = root2.callbackNode;
      if (0 === suspendedLanes || root2 === currentTime && (2 === workInProgressSuspendedReason || 9 === workInProgressSuspendedReason) || null !== root2.cancelPendingCommit)
        return null !== pingedLanes && null !== pingedLanes && cancelCallback$1(pingedLanes), root2.callbackNode = null, root2.callbackPriority = 0;
      if (0 === (suspendedLanes & 3) || checkIfRootIsPrerendering(root2, suspendedLanes)) {
        currentTime = suspendedLanes & -suspendedLanes;
        if (currentTime === root2.callbackPriority) return currentTime;
        null !== pingedLanes && cancelCallback$1(pingedLanes);
        switch (lanesToEventPriority(suspendedLanes)) {
          case 2:
          case 8:
            suspendedLanes = UserBlockingPriority;
            break;
          case 32:
            suspendedLanes = NormalPriority$1;
            break;
          case 268435456:
            suspendedLanes = IdlePriority;
            break;
          default:
            suspendedLanes = NormalPriority$1;
        }
        pingedLanes = performWorkOnRootViaSchedulerTask.bind(null, root2);
        suspendedLanes = scheduleCallback$3(suspendedLanes, pingedLanes);
        root2.callbackPriority = currentTime;
        root2.callbackNode = suspendedLanes;
        return currentTime;
      }
      null !== pingedLanes && null !== pingedLanes && cancelCallback$1(pingedLanes);
      root2.callbackPriority = 2;
      root2.callbackNode = null;
      return 2;
    }
    function performWorkOnRootViaSchedulerTask(root2, didTimeout) {
      if (0 !== pendingEffectsStatus && 5 !== pendingEffectsStatus)
        return root2.callbackNode = null, root2.callbackPriority = 0, null;
      var originalCallbackNode = root2.callbackNode;
      if (flushPendingEffects() && root2.callbackNode !== originalCallbackNode)
        return null;
      var workInProgressRootRenderLanes$jscomp$0 = workInProgressRootRenderLanes;
      workInProgressRootRenderLanes$jscomp$0 = getNextLanes(
        root2,
        root2 === workInProgressRoot ? workInProgressRootRenderLanes$jscomp$0 : 0,
        null !== root2.cancelPendingCommit || -1 !== root2.timeoutHandle
      );
      if (0 === workInProgressRootRenderLanes$jscomp$0) return null;
      performWorkOnRoot(root2, workInProgressRootRenderLanes$jscomp$0, didTimeout);
      scheduleTaskForRootDuringMicrotask(root2, now());
      return null != root2.callbackNode && root2.callbackNode === originalCallbackNode ? performWorkOnRootViaSchedulerTask.bind(null, root2) : null;
    }
    function performSyncWorkOnRoot(root2, lanes) {
      if (flushPendingEffects()) return null;
      performWorkOnRoot(root2, lanes, true);
    }
    function scheduleImmediateRootScheduleTask() {
      scheduleMicrotask(function() {
        0 !== (executionContext & 6) ? scheduleCallback$3(
          ImmediatePriority,
          processRootScheduleInImmediateTask
        ) : processRootScheduleInMicrotask();
      });
    }
    function requestTransitionLane() {
      if (0 === currentEventTransitionLane) {
        var actionScopeLane = currentEntangledLane;
        0 === actionScopeLane && (actionScopeLane = nextTransitionUpdateLane, nextTransitionUpdateLane <<= 1, 0 === (nextTransitionUpdateLane & 261888) && (nextTransitionUpdateLane = 256));
        currentEventTransitionLane = actionScopeLane;
      }
      return currentEventTransitionLane;
    }
    function coerceFormActionProp(actionProp) {
      return null == actionProp || "symbol" === typeof actionProp || "boolean" === typeof actionProp ? null : "function" === typeof actionProp ? actionProp : sanitizeURL(actionProp);
    }
    function extractEvents$1(dispatchQueue, domEventName, maybeTargetInst, nativeEvent, nativeEventTarget) {
      if ("submit" === domEventName && maybeTargetInst && maybeTargetInst.stateNode === nativeEventTarget) {
        var action = coerceFormActionProp(
          (nativeEventTarget[internalPropsKey] || null).action
        ), submitter = nativeEvent.submitter;
        submitter && (domEventName = (domEventName = submitter[internalPropsKey] || null) ? coerceFormActionProp(domEventName.formAction) : submitter.getAttribute("formAction"), null !== domEventName && (action = domEventName, submitter = null));
        var event = new SyntheticEvent(
          "action",
          "action",
          null,
          nativeEvent,
          nativeEventTarget
        );
        dispatchQueue.push({
          event,
          listeners: [
            {
              instance: null,
              listener: function() {
                if (nativeEvent.defaultPrevented) {
                  if (0 !== currentEventTransitionLane) {
                    var formData = new FormData(nativeEventTarget, submitter);
                    startHostTransition(
                      maybeTargetInst,
                      {
                        pending: true,
                        data: formData,
                        method: nativeEventTarget.method,
                        action
                      },
                      null,
                      formData
                    );
                  }
                } else
                  "function" === typeof action && (event.preventDefault(), formData = new FormData(nativeEventTarget, submitter), startHostTransition(
                    maybeTargetInst,
                    {
                      pending: true,
                      data: formData,
                      method: nativeEventTarget.method,
                      action
                    },
                    action,
                    formData
                  ));
              },
              currentTarget: nativeEventTarget
            }
          ]
        });
      }
    }
    for (i$jscomp$inline_1667 = 0; i$jscomp$inline_1667 < simpleEventPluginEvents.length; i$jscomp$inline_1667++) {
      eventName$jscomp$inline_1668 = simpleEventPluginEvents[i$jscomp$inline_1667], domEventName$jscomp$inline_1669 = eventName$jscomp$inline_1668.toLowerCase(), capitalizedEvent$jscomp$inline_1670 = eventName$jscomp$inline_1668[0].toUpperCase() + eventName$jscomp$inline_1668.slice(1);
      registerSimpleEvent(
        domEventName$jscomp$inline_1669,
        "on" + capitalizedEvent$jscomp$inline_1670
      );
    }
    var eventName$jscomp$inline_1668;
    var domEventName$jscomp$inline_1669;
    var capitalizedEvent$jscomp$inline_1670;
    var i$jscomp$inline_1667;
    registerSimpleEvent(ANIMATION_END, "onAnimationEnd");
    registerSimpleEvent(ANIMATION_ITERATION, "onAnimationIteration");
    registerSimpleEvent(ANIMATION_START, "onAnimationStart");
    registerSimpleEvent("dblclick", "onDoubleClick");
    registerSimpleEvent("focusin", "onFocus");
    registerSimpleEvent("focusout", "onBlur");
    registerSimpleEvent(TRANSITION_RUN, "onTransitionRun");
    registerSimpleEvent(TRANSITION_START, "onTransitionStart");
    registerSimpleEvent(TRANSITION_CANCEL, "onTransitionCancel");
    registerSimpleEvent(TRANSITION_END, "onTransitionEnd");
    registerDirectEvent("onMouseEnter", ["mouseout", "mouseover"]);
    registerDirectEvent("onMouseLeave", ["mouseout", "mouseover"]);
    registerDirectEvent("onPointerEnter", ["pointerout", "pointerover"]);
    registerDirectEvent("onPointerLeave", ["pointerout", "pointerover"]);
    registerTwoPhaseEvent(
      "onChange",
      "change click focusin focusout input keydown keyup selectionchange".split(" ")
    );
    registerTwoPhaseEvent(
      "onSelect",
      "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
        " "
      )
    );
    registerTwoPhaseEvent("onBeforeInput", [
      "compositionend",
      "keypress",
      "textInput",
      "paste"
    ]);
    registerTwoPhaseEvent(
      "onCompositionEnd",
      "compositionend focusout keydown keypress keyup mousedown".split(" ")
    );
    registerTwoPhaseEvent(
      "onCompositionStart",
      "compositionstart focusout keydown keypress keyup mousedown".split(" ")
    );
    registerTwoPhaseEvent(
      "onCompositionUpdate",
      "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
    );
    var mediaEventTypes = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
      " "
    );
    var nonDelegatedEvents = new Set(
      "beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(mediaEventTypes)
    );
    function processDispatchQueue(dispatchQueue, eventSystemFlags) {
      eventSystemFlags = 0 !== (eventSystemFlags & 4);
      for (var i = 0; i < dispatchQueue.length; i++) {
        var _dispatchQueue$i = dispatchQueue[i], event = _dispatchQueue$i.event;
        _dispatchQueue$i = _dispatchQueue$i.listeners;
        a: {
          var previousInstance = void 0;
          if (eventSystemFlags)
            for (var i$jscomp$0 = _dispatchQueue$i.length - 1; 0 <= i$jscomp$0; i$jscomp$0--) {
              var _dispatchListeners$i = _dispatchQueue$i[i$jscomp$0], instance = _dispatchListeners$i.instance, currentTarget = _dispatchListeners$i.currentTarget;
              _dispatchListeners$i = _dispatchListeners$i.listener;
              if (instance !== previousInstance && event.isPropagationStopped())
                break a;
              previousInstance = _dispatchListeners$i;
              event.currentTarget = currentTarget;
              try {
                previousInstance(event);
              } catch (error) {
                reportGlobalError(error);
              }
              event.currentTarget = null;
              previousInstance = instance;
            }
          else
            for (i$jscomp$0 = 0; i$jscomp$0 < _dispatchQueue$i.length; i$jscomp$0++) {
              _dispatchListeners$i = _dispatchQueue$i[i$jscomp$0];
              instance = _dispatchListeners$i.instance;
              currentTarget = _dispatchListeners$i.currentTarget;
              _dispatchListeners$i = _dispatchListeners$i.listener;
              if (instance !== previousInstance && event.isPropagationStopped())
                break a;
              previousInstance = _dispatchListeners$i;
              event.currentTarget = currentTarget;
              try {
                previousInstance(event);
              } catch (error) {
                reportGlobalError(error);
              }
              event.currentTarget = null;
              previousInstance = instance;
            }
        }
      }
    }
    function listenToNonDelegatedEvent(domEventName, targetElement) {
      var JSCompiler_inline_result = targetElement[internalEventHandlersKey];
      void 0 === JSCompiler_inline_result && (JSCompiler_inline_result = targetElement[internalEventHandlersKey] = /* @__PURE__ */ new Set());
      var listenerSetKey = domEventName + "__bubble";
      JSCompiler_inline_result.has(listenerSetKey) || (addTrappedEventListener(targetElement, domEventName, 2, false), JSCompiler_inline_result.add(listenerSetKey));
    }
    function listenToNativeEvent(domEventName, isCapturePhaseListener, target) {
      var eventSystemFlags = 0;
      isCapturePhaseListener && (eventSystemFlags |= 4);
      addTrappedEventListener(
        target,
        domEventName,
        eventSystemFlags,
        isCapturePhaseListener
      );
    }
    var listeningMarker = "_reactListening" + Math.random().toString(36).slice(2);
    function listenToAllSupportedEvents(rootContainerElement) {
      if (!rootContainerElement[listeningMarker]) {
        rootContainerElement[listeningMarker] = true;
        allNativeEvents.forEach(function(domEventName) {
          "selectionchange" !== domEventName && (nonDelegatedEvents.has(domEventName) || listenToNativeEvent(domEventName, false, rootContainerElement), listenToNativeEvent(domEventName, true, rootContainerElement));
        });
        var ownerDocument = 9 === rootContainerElement.nodeType ? rootContainerElement : rootContainerElement.ownerDocument;
        null === ownerDocument || ownerDocument[listeningMarker] || (ownerDocument[listeningMarker] = true, listenToNativeEvent("selectionchange", false, ownerDocument));
      }
    }
    function addTrappedEventListener(targetContainer, domEventName, eventSystemFlags, isCapturePhaseListener) {
      switch (getEventPriority(domEventName)) {
        case 2:
          var listenerWrapper = dispatchDiscreteEvent;
          break;
        case 8:
          listenerWrapper = dispatchContinuousEvent;
          break;
        default:
          listenerWrapper = dispatchEvent;
      }
      eventSystemFlags = listenerWrapper.bind(
        null,
        domEventName,
        eventSystemFlags,
        targetContainer
      );
      listenerWrapper = void 0;
      !passiveBrowserEventsSupported || "touchstart" !== domEventName && "touchmove" !== domEventName && "wheel" !== domEventName || (listenerWrapper = true);
      isCapturePhaseListener ? void 0 !== listenerWrapper ? targetContainer.addEventListener(domEventName, eventSystemFlags, {
        capture: true,
        passive: listenerWrapper
      }) : targetContainer.addEventListener(domEventName, eventSystemFlags, true) : void 0 !== listenerWrapper ? targetContainer.addEventListener(domEventName, eventSystemFlags, {
        passive: listenerWrapper
      }) : targetContainer.addEventListener(domEventName, eventSystemFlags, false);
    }
    function dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, targetInst$jscomp$0, targetContainer) {
      var ancestorInst = targetInst$jscomp$0;
      if (0 === (eventSystemFlags & 1) && 0 === (eventSystemFlags & 2) && null !== targetInst$jscomp$0)
        a: for (; ; ) {
          if (null === targetInst$jscomp$0) return;
          var nodeTag = targetInst$jscomp$0.tag;
          if (3 === nodeTag || 4 === nodeTag) {
            var container = targetInst$jscomp$0.stateNode.containerInfo;
            if (container === targetContainer) break;
            if (4 === nodeTag)
              for (nodeTag = targetInst$jscomp$0.return; null !== nodeTag; ) {
                var grandTag = nodeTag.tag;
                if ((3 === grandTag || 4 === grandTag) && nodeTag.stateNode.containerInfo === targetContainer)
                  return;
                nodeTag = nodeTag.return;
              }
            for (; null !== container; ) {
              nodeTag = getClosestInstanceFromNode(container);
              if (null === nodeTag) return;
              grandTag = nodeTag.tag;
              if (5 === grandTag || 6 === grandTag || 26 === grandTag || 27 === grandTag) {
                targetInst$jscomp$0 = ancestorInst = nodeTag;
                continue a;
              }
              container = container.parentNode;
            }
          }
          targetInst$jscomp$0 = targetInst$jscomp$0.return;
        }
      batchedUpdates$1(function() {
        var targetInst = ancestorInst, nativeEventTarget = getEventTarget(nativeEvent), dispatchQueue = [];
        a: {
          var reactName = topLevelEventsToReactNames.get(domEventName);
          if (void 0 !== reactName) {
            var SyntheticEventCtor = SyntheticEvent, reactEventType = domEventName;
            switch (domEventName) {
              case "keypress":
                if (0 === getEventCharCode(nativeEvent)) break a;
              case "keydown":
              case "keyup":
                SyntheticEventCtor = SyntheticKeyboardEvent;
                break;
              case "focusin":
                reactEventType = "focus";
                SyntheticEventCtor = SyntheticFocusEvent;
                break;
              case "focusout":
                reactEventType = "blur";
                SyntheticEventCtor = SyntheticFocusEvent;
                break;
              case "beforeblur":
              case "afterblur":
                SyntheticEventCtor = SyntheticFocusEvent;
                break;
              case "click":
                if (2 === nativeEvent.button) break a;
              case "auxclick":
              case "dblclick":
              case "mousedown":
              case "mousemove":
              case "mouseup":
              case "mouseout":
              case "mouseover":
              case "contextmenu":
                SyntheticEventCtor = SyntheticMouseEvent;
                break;
              case "drag":
              case "dragend":
              case "dragenter":
              case "dragexit":
              case "dragleave":
              case "dragover":
              case "dragstart":
              case "drop":
                SyntheticEventCtor = SyntheticDragEvent;
                break;
              case "touchcancel":
              case "touchend":
              case "touchmove":
              case "touchstart":
                SyntheticEventCtor = SyntheticTouchEvent;
                break;
              case ANIMATION_END:
              case ANIMATION_ITERATION:
              case ANIMATION_START:
                SyntheticEventCtor = SyntheticAnimationEvent;
                break;
              case TRANSITION_END:
                SyntheticEventCtor = SyntheticTransitionEvent;
                break;
              case "scroll":
              case "scrollend":
                SyntheticEventCtor = SyntheticUIEvent;
                break;
              case "wheel":
                SyntheticEventCtor = SyntheticWheelEvent;
                break;
              case "copy":
              case "cut":
              case "paste":
                SyntheticEventCtor = SyntheticClipboardEvent;
                break;
              case "gotpointercapture":
              case "lostpointercapture":
              case "pointercancel":
              case "pointerdown":
              case "pointermove":
              case "pointerout":
              case "pointerover":
              case "pointerup":
                SyntheticEventCtor = SyntheticPointerEvent;
                break;
              case "submit":
                SyntheticEventCtor = SyntheticSubmitEvent;
                break;
              case "toggle":
              case "beforetoggle":
                SyntheticEventCtor = SyntheticToggleEvent;
            }
            var inCapturePhase = 0 !== (eventSystemFlags & 4), accumulateTargetOnly = !inCapturePhase && ("scroll" === domEventName || "scrollend" === domEventName), reactEventName = inCapturePhase ? null !== reactName ? reactName + "Capture" : null : reactName;
            inCapturePhase = [];
            for (var instance = targetInst, lastHostComponent; null !== instance; ) {
              var _instance = instance;
              lastHostComponent = _instance.stateNode;
              _instance = _instance.tag;
              5 !== _instance && 26 !== _instance && 27 !== _instance || null === lastHostComponent || null === reactEventName || (_instance = getListener(instance, reactEventName), null != _instance && inCapturePhase.push(
                createDispatchListener(instance, _instance, lastHostComponent)
              ));
              if (accumulateTargetOnly) break;
              instance = instance.return;
            }
            0 < inCapturePhase.length && (reactName = new SyntheticEventCtor(
              reactName,
              reactEventType,
              null,
              nativeEvent,
              nativeEventTarget
            ), dispatchQueue.push({ event: reactName, listeners: inCapturePhase }));
          }
        }
        if (0 === (eventSystemFlags & 7)) {
          a: {
            SyntheticEventCtor = "mouseover" === domEventName || "pointerover" === domEventName;
            reactName = "mouseout" === domEventName || "pointerout" === domEventName;
            if (SyntheticEventCtor && nativeEvent !== currentReplayingEvent && (reactEventType = nativeEvent.relatedTarget || nativeEvent.fromElement) && (getClosestInstanceFromNode(reactEventType) || reactEventType[internalContainerInstanceKey]))
              break a;
            if (reactName || SyntheticEventCtor) {
              reactEventType = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget : (SyntheticEventCtor = nativeEventTarget.ownerDocument) ? SyntheticEventCtor.defaultView || SyntheticEventCtor.parentWindow : window;
              if (reactName) {
                if (SyntheticEventCtor = nativeEvent.relatedTarget || nativeEvent.toElement, reactName = targetInst, SyntheticEventCtor = SyntheticEventCtor ? getClosestInstanceFromNode(SyntheticEventCtor) : null, null !== SyntheticEventCtor && (accumulateTargetOnly = getNearestMountedFiber(SyntheticEventCtor), inCapturePhase = SyntheticEventCtor.tag, SyntheticEventCtor !== accumulateTargetOnly ||
                5 !== inCapturePhase && 27 !== inCapturePhase && 6 !== inCapturePhase))
                  SyntheticEventCtor = null;
              } else reactName = null, SyntheticEventCtor = targetInst;
              if (reactName !== SyntheticEventCtor) {
                inCapturePhase = SyntheticMouseEvent;
                _instance = "onMouseLeave";
                reactEventName = "onMouseEnter";
                instance = "mouse";
                if ("pointerout" === domEventName || "pointerover" === domEventName)
                  inCapturePhase = SyntheticPointerEvent, _instance = "onPointerLeave", reactEventName = "onPointerEnter", instance = "pointer";
                accumulateTargetOnly = null == reactName ? reactEventType : getNodeFromInstance(reactName);
                lastHostComponent = null == SyntheticEventCtor ? reactEventType : getNodeFromInstance(SyntheticEventCtor);
                reactEventType = new inCapturePhase(
                  _instance,
                  instance + "leave",
                  reactName,
                  nativeEvent,
                  nativeEventTarget
                );
                reactEventType.target = accumulateTargetOnly;
                reactEventType.relatedTarget = lastHostComponent;
                _instance = null;
                getClosestInstanceFromNode(nativeEventTarget) === targetInst && (inCapturePhase = new inCapturePhase(
                  reactEventName,
                  instance + "enter",
                  SyntheticEventCtor,
                  nativeEvent,
                  nativeEventTarget
                ), inCapturePhase.target = lastHostComponent, inCapturePhase.relatedTarget = accumulateTargetOnly, _instance = inCapturePhase);
                accumulateTargetOnly = _instance;
                inCapturePhase = reactName && SyntheticEventCtor ? getLowestCommonAncestor(
                  reactName,
                  SyntheticEventCtor,
                  getParent
                ) : null;
                null !== reactName && accumulateEnterLeaveListenersForEvent(
                  dispatchQueue,
                  reactEventType,
                  reactName,
                  inCapturePhase,
                  false
                );
                null !== SyntheticEventCtor && null !== accumulateTargetOnly && accumulateEnterLeaveListenersForEvent(
                  dispatchQueue,
                  accumulateTargetOnly,
                  SyntheticEventCtor,
                  inCapturePhase,
                  true
                );
              }
            }
          }
          a: {
            reactName = targetInst ? getNodeFromInstance(targetInst) : window;
            SyntheticEventCtor = reactName.nodeName && reactName.nodeName.toLowerCase();
            if ("select" === SyntheticEventCtor || "input" === SyntheticEventCtor && "file" === reactName.type)
              var getTargetInstFunc = getTargetInstForChangeEvent;
            else if (isTextInputElement(reactName))
              if (isInputEventSupported)
                getTargetInstFunc = getTargetInstForInputOrChangeEvent;
              else {
                getTargetInstFunc = getTargetInstForInputEventPolyfill;
                var handleEventFunc = handleEventsForInputEventPolyfill;
              }
            else
              SyntheticEventCtor = reactName.nodeName, !SyntheticEventCtor || "input" !== SyntheticEventCtor.toLowerCase() || "checkbox" !== reactName.type && "radio" !== reactName.type ? targetInst && isCustomElement(targetInst.elementType) && (getTargetInstFunc = getTargetInstForChangeEvent) : getTargetInstFunc = getTargetInstForClickEvent;
            if (getTargetInstFunc && (getTargetInstFunc = getTargetInstFunc(domEventName, targetInst))) {
              createAndAccumulateChangeEvent(
                dispatchQueue,
                getTargetInstFunc,
                nativeEvent,
                nativeEventTarget
              );
              break a;
            }
            handleEventFunc && handleEventFunc(domEventName, reactName, targetInst);
          }
          handleEventFunc = targetInst ? getNodeFromInstance(targetInst) : window;
          switch (domEventName) {
            case "focusin":
              if (isTextInputElement(handleEventFunc) || "true" === handleEventFunc.contentEditable)
                activeElement = handleEventFunc, activeElementInst = targetInst, lastSelection = null;
              break;
            case "focusout":
              lastSelection = activeElementInst = activeElement = null;
              break;
            case "mousedown":
              mouseDown = true;
              break;
            case "contextmenu":
            case "mouseup":
            case "dragend":
              mouseDown = false;
              constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
              break;
            case "selectionchange":
              if (skipSelectionChangeEvent) break;
            case "keydown":
            case "keyup":
              constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
          }
          var fallbackData;
          if (canUseCompositionEvent)
            b: {
              switch (domEventName) {
                case "compositionstart":
                  var eventType = "onCompositionStart";
                  break b;
                case "compositionend":
                  eventType = "onCompositionEnd";
                  break b;
                case "compositionupdate":
                  eventType = "onCompositionUpdate";
                  break b;
              }
              eventType = void 0;
            }
          else
            isComposing ? isFallbackCompositionEnd(domEventName, nativeEvent) && (eventType = "onCompositionEnd") : "keydown" === domEventName && 229 === nativeEvent.keyCode && (eventType = "onCompositionStart");
          eventType && (useFallbackCompositionData && "ko" !== nativeEvent.locale && (isComposing || "onCompositionStart" !== eventType ? "onCompositionEnd" === eventType && isComposing && (fallbackData = getData()) : (root = nativeEventTarget, startText = "value" in root ? root.value : root.textContent, isComposing = true)), handleEventFunc = accumulateTwoPhaseListeners(targetInst, eventType), 0 <
          handleEventFunc.length && (eventType = new SyntheticCompositionEvent(
            eventType,
            domEventName,
            null,
            nativeEvent,
            nativeEventTarget
          ), dispatchQueue.push({ event: eventType, listeners: handleEventFunc }), fallbackData ? eventType.data = fallbackData : (fallbackData = getDataFromCustomEvent(nativeEvent), null !== fallbackData && (eventType.data = fallbackData))));
          if (fallbackData = canUseTextInputEvent ? getNativeBeforeInputChars(domEventName, nativeEvent) : getFallbackBeforeInputChars(domEventName, nativeEvent))
            eventType = accumulateTwoPhaseListeners(targetInst, "onBeforeInput"), 0 < eventType.length && (handleEventFunc = new SyntheticCompositionEvent(
              "onBeforeInput",
              "beforeinput",
              null,
              nativeEvent,
              nativeEventTarget
            ), dispatchQueue.push({
              event: handleEventFunc,
              listeners: eventType
            }), handleEventFunc.data = fallbackData);
          extractEvents$1(
            dispatchQueue,
            domEventName,
            targetInst,
            nativeEvent,
            nativeEventTarget
          );
        }
        processDispatchQueue(dispatchQueue, eventSystemFlags);
      });
    }
    function createDispatchListener(instance, listener, currentTarget) {
      return {
        instance,
        listener,
        currentTarget
      };
    }
    function accumulateTwoPhaseListeners(targetFiber, reactName) {
      for (var captureName = reactName + "Capture", listeners = []; null !== targetFiber; ) {
        var _instance2 = targetFiber, stateNode = _instance2.stateNode;
        _instance2 = _instance2.tag;
        5 !== _instance2 && 26 !== _instance2 && 27 !== _instance2 || null === stateNode || (_instance2 = getListener(targetFiber, captureName), null != _instance2 && listeners.unshift(
          createDispatchListener(targetFiber, _instance2, stateNode)
        ), _instance2 = getListener(targetFiber, reactName), null != _instance2 && listeners.push(
          createDispatchListener(targetFiber, _instance2, stateNode)
        ));
        if (3 === targetFiber.tag) return listeners;
        targetFiber = targetFiber.return;
      }
      return [];
    }
    function getParent(inst) {
      if (null === inst) return null;
      do
        inst = inst.return;
      while (inst && 5 !== inst.tag && 27 !== inst.tag);
      return inst ? inst : null;
    }
    function accumulateEnterLeaveListenersForEvent(dispatchQueue, event, target, common, inCapturePhase) {
      for (var registrationName = event._reactName, listeners = []; null !== target && target !== common; ) {
        var _instance3 = target, alternate = _instance3.alternate, stateNode = _instance3.stateNode;
        _instance3 = _instance3.tag;
        if (null !== alternate && alternate === common) break;
        5 !== _instance3 && 26 !== _instance3 && 27 !== _instance3 || null === stateNode || (alternate = stateNode, inCapturePhase ? (stateNode = getListener(target, registrationName), null != stateNode && listeners.unshift(
          createDispatchListener(target, stateNode, alternate)
        )) : inCapturePhase || (stateNode = getListener(target, registrationName), null != stateNode && listeners.push(
          createDispatchListener(target, stateNode, alternate)
        )));
        target = target.return;
      }
      0 !== listeners.length && dispatchQueue.push({ event, listeners });
    }
    var NORMALIZE_NEWLINES_REGEX = /\r\n?/g;
    var NORMALIZE_NULL_AND_REPLACEMENT_REGEX = /\u0000|\uFFFD/g;
    function normalizeMarkupForTextOrAttribute(markup) {
      return ("string" === typeof markup ? markup : "" + markup).replace(NORMALIZE_NEWLINES_REGEX, "\n").replace(NORMALIZE_NULL_AND_REPLACEMENT_REGEX, "");
    }
    function checkForUnmatchedText(serverText, clientText) {
      clientText = normalizeMarkupForTextOrAttribute(clientText);
      return normalizeMarkupForTextOrAttribute(serverText) === clientText ? true : false;
    }
    function setProp(domElement, tag, key, value, props, prevValue) {
      switch (key) {
        case "children":
          if ("string" === typeof value)
            "body" === tag || "textarea" === tag && "" === value || setTextContent(domElement, value);
          else if ("number" === typeof value || "bigint" === typeof value)
            "body" !== tag && setTextContent(domElement, "" + value);
          else return;
          break;
        case "className":
          setValueForKnownAttribute(domElement, "class", value);
          break;
        case "tabIndex":
          setValueForKnownAttribute(domElement, "tabindex", value);
          break;
        case "dir":
        case "role":
        case "viewBox":
        case "width":
        case "height":
          setValueForKnownAttribute(domElement, key, value);
          break;
        case "style":
          setValueForStyles(domElement, value, prevValue);
          return;
        case "data":
          if ("object" !== tag) {
            setValueForKnownAttribute(domElement, "data", value);
            break;
          }
        case "src":
        case "href":
          if ("" === value && ("a" !== tag || "href" !== key)) {
            domElement.removeAttribute(key);
            break;
          }
          if (null == value || "function" === typeof value || "symbol" === typeof value || "boolean" === typeof value) {
            domElement.removeAttribute(key);
            break;
          }
          value = sanitizeURL(value);
          domElement.setAttribute(key, value);
          break;
        case "action":
        case "formAction":
          if ("function" === typeof value) {
            domElement.setAttribute(
              key,
              "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')"
            );
            break;
          } else
            "function" === typeof prevValue && ("formAction" === key ? ("input" !== tag && setProp(domElement, tag, "name", props.name, props, null), setProp(
              domElement,
              tag,
              "formEncType",
              props.formEncType,
              props,
              null
            ), setProp(
              domElement,
              tag,
              "formMethod",
              props.formMethod,
              props,
              null
            ), setProp(
              domElement,
              tag,
              "formTarget",
              props.formTarget,
              props,
              null
            )) : (setProp(domElement, tag, "encType", props.encType, props, null), setProp(domElement, tag, "method", props.method, props, null), setProp(domElement, tag, "target", props.target, props, null)));
          if (null == value || "symbol" === typeof value || "boolean" === typeof value) {
            domElement.removeAttribute(key);
            break;
          }
          value = sanitizeURL(value);
          domElement.setAttribute(key, value);
          break;
        case "onClick":
          null != value && (domElement.onclick = noop$1);
          return;
        case "onScroll":
          null != value && listenToNonDelegatedEvent("scroll", domElement);
          return;
        case "onScrollEnd":
          null != value && listenToNonDelegatedEvent("scrollend", domElement);
          return;
        case "dangerouslySetInnerHTML":
          if (null != value) {
            if ("object" !== typeof value || !("__html" in value))
              throw Error(formatProdErrorMessage(61));
            key = value.__html;
            if (null != key) {
              if (null != props.children) throw Error(formatProdErrorMessage(60));
              (null != prevValue ? prevValue.__html : void 0) !== key && (domElement.innerHTML = key);
            }
          }
          break;
        case "multiple":
          domElement.multiple = value && "function" !== typeof value && "symbol" !== typeof value;
          break;
        case "muted":
          domElement.muted = value && "function" !== typeof value && "symbol" !== typeof value;
          break;
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
        case "defaultValue":
        case "defaultChecked":
        case "innerHTML":
        case "ref":
          break;
        case "autoFocus":
          break;
        case "xlinkHref":
          if (null == value || "function" === typeof value || "boolean" === typeof value || "symbol" === typeof value) {
            domElement.removeAttribute("xlink:href");
            break;
          }
          key = sanitizeURL(value);
          domElement.setAttributeNS(
            "http://www.w3.org/1999/xlink",
            "xlink:href",
            key
          );
          break;
        case "contentEditable":
        case "spellCheck":
        case "draggable":
        case "value":
        case "autoReverse":
        case "externalResourcesRequired":
        case "focusable":
        case "preserveAlpha":
          null != value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
          break;
        case "inert":
        case "allowFullScreen":
        case "async":
        case "autoPlay":
        case "controls":
        case "credentialless":
        case "default":
        case "defer":
        case "disabled":
        case "disablePictureInPicture":
        case "disableRemotePlayback":
        case "formNoValidate":
        case "hidden":
        case "loop":
        case "noModule":
        case "noValidate":
        case "open":
        case "playsInline":
        case "readOnly":
        case "required":
        case "reversed":
        case "scoped":
        case "seamless":
        case "itemScope":
          value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, "") : domElement.removeAttribute(key);
          break;
        case "capture":
        case "download":
          true === value ? domElement.setAttribute(key, "") : false !== value && null != value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
          break;
        case "cols":
        case "rows":
        case "size":
        case "span":
          null != value && "function" !== typeof value && "symbol" !== typeof value && !isNaN(value) && 1 <= value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
          break;
        case "rowSpan":
        case "start":
          null == value || "function" === typeof value || "symbol" === typeof value || isNaN(value) ? domElement.removeAttribute(key) : domElement.setAttribute(key, value);
          break;
        case "popover":
          listenToNonDelegatedEvent("beforetoggle", domElement);
          listenToNonDelegatedEvent("toggle", domElement);
          setValueForAttribute(domElement, "popover", value);
          break;
        case "xlinkActuate":
          setValueForNamespacedAttribute(
            domElement,
            "http://www.w3.org/1999/xlink",
            "xlink:actuate",
            value
          );
          break;
        case "xlinkArcrole":
          setValueForNamespacedAttribute(
            domElement,
            "http://www.w3.org/1999/xlink",
            "xlink:arcrole",
            value
          );
          break;
        case "xlinkRole":
          setValueForNamespacedAttribute(
            domElement,
            "http://www.w3.org/1999/xlink",
            "xlink:role",
            value
          );
          break;
        case "xlinkShow":
          setValueForNamespacedAttribute(
            domElement,
            "http://www.w3.org/1999/xlink",
            "xlink:show",
            value
          );
          break;
        case "xlinkTitle":
          setValueForNamespacedAttribute(
            domElement,
            "http://www.w3.org/1999/xlink",
            "xlink:title",
            value
          );
          break;
        case "xlinkType":
          setValueForNamespacedAttribute(
            domElement,
            "http://www.w3.org/1999/xlink",
            "xlink:type",
            value
          );
          break;
        case "xmlBase":
          setValueForNamespacedAttribute(
            domElement,
            "http://www.w3.org/XML/1998/namespace",
            "xml:base",
            value
          );
          break;
        case "xmlLang":
          setValueForNamespacedAttribute(
            domElement,
            "http://www.w3.org/XML/1998/namespace",
            "xml:lang",
            value
          );
          break;
        case "xmlSpace":
          setValueForNamespacedAttribute(
            domElement,
            "http://www.w3.org/XML/1998/namespace",
            "xml:space",
            value
          );
          break;
        case "is":
          setValueForAttribute(domElement, "is", value);
          break;
        case "innerText":
        case "textContent":
          return;
        default:
          if (!(2 < key.length) || "o" !== key[0] && "O" !== key[0] || "n" !== key[1] && "N" !== key[1])
            key = aliases.get(key) || key, setValueForAttribute(domElement, key, value);
          else return;
      }
      viewTransitionMutationContext = true;
    }
    function setPropOnCustomElement(domElement, tag, key, value, props, prevValue) {
      switch (key) {
        case "style":
          setValueForStyles(domElement, value, prevValue);
          return;
        case "dangerouslySetInnerHTML":
          if (null != value) {
            if ("object" !== typeof value || !("__html" in value))
              throw Error(formatProdErrorMessage(61));
            key = value.__html;
            if (null != key) {
              if (null != props.children) throw Error(formatProdErrorMessage(60));
              (null != prevValue ? prevValue.__html : void 0) !== key && (domElement.innerHTML = key);
            }
          }
          break;
        case "children":
          if ("string" === typeof value) setTextContent(domElement, value);
          else if ("number" === typeof value || "bigint" === typeof value)
            setTextContent(domElement, "" + value);
          else return;
          break;
        case "onScroll":
          null != value && listenToNonDelegatedEvent("scroll", domElement);
          return;
        case "onScrollEnd":
          null != value && listenToNonDelegatedEvent("scrollend", domElement);
          return;
        case "onClick":
          null != value && (domElement.onclick = noop$1);
          return;
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
        case "innerHTML":
        case "ref":
          return;
        case "innerText":
        case "textContent":
          return;
        default:
          if (!registrationNameDependencies.hasOwnProperty(key))
            a: {
              if ("o" === key[0] && "n" === key[1] && (props = key.endsWith("Capture"), prevValue = key.slice(2, props ? key.length - 7 : void 0), tag = domElement[internalPropsKey] || null, tag = null != tag ? tag[key] : null, "function" === typeof tag && domElement.removeEventListener(prevValue, tag, props), "function" === typeof value)) {
                "function" !== typeof tag && null !== tag && (key in domElement ? domElement[key] = null : domElement.hasAttribute(key) && domElement.removeAttribute(key));
                domElement.addEventListener(prevValue, value, props);
                break a;
              }
              viewTransitionMutationContext = true;
              key in domElement ? domElement[key] = value : true === value ? domElement.setAttribute(key, "") : setValueForAttribute(domElement, key, value);
            }
          return;
      }
      viewTransitionMutationContext = true;
    }
    function setInitialProperties(domElement, tag, props) {
      switch (tag) {
        case "div":
        case "span":
        case "svg":
        case "path":
        case "a":
        case "g":
        case "p":
        case "li":
          break;
        case "img":
          listenToNonDelegatedEvent("error", domElement);
          listenToNonDelegatedEvent("load", domElement);
          var hasSrc = false, hasSrcSet = false, propKey;
          for (propKey in props)
            if (props.hasOwnProperty(propKey)) {
              var propValue = props[propKey];
              if (null != propValue)
                switch (propKey) {
                  case "src":
                    hasSrc = true;
                    break;
                  case "srcSet":
                    hasSrcSet = true;
                    break;
                  case "children":
                  case "dangerouslySetInnerHTML":
                    throw Error(formatProdErrorMessage(137, tag));
                  default:
                    setProp(domElement, tag, propKey, propValue, props, null);
                }
            }
          hasSrcSet && setProp(domElement, tag, "srcSet", props.srcSet, props, null);
          hasSrc && setProp(domElement, tag, "src", props.src, props, null);
          return;
        case "input":
          listenToNonDelegatedEvent("invalid", domElement);
          var defaultValue = propKey = propValue = hasSrcSet = null, checked = null, defaultChecked = null;
          for (hasSrc in props)
            if (props.hasOwnProperty(hasSrc)) {
              var propValue$204 = props[hasSrc];
              if (null != propValue$204)
                switch (hasSrc) {
                  case "name":
                    hasSrcSet = propValue$204;
                    break;
                  case "type":
                    propValue = propValue$204;
                    break;
                  case "checked":
                    checked = propValue$204;
                    break;
                  case "defaultChecked":
                    defaultChecked = propValue$204;
                    break;
                  case "value":
                    propKey = propValue$204;
                    break;
                  case "defaultValue":
                    defaultValue = propValue$204;
                    break;
                  case "children":
                  case "dangerouslySetInnerHTML":
                    if (null != propValue$204)
                      throw Error(formatProdErrorMessage(137, tag));
                    break;
                  default:
                    setProp(domElement, tag, hasSrc, propValue$204, props, null);
                }
            }
          initInput(
            domElement,
            propKey,
            defaultValue,
            checked,
            defaultChecked,
            propValue,
            hasSrcSet,
            false
          );
          return;
        case "select":
          listenToNonDelegatedEvent("invalid", domElement);
          hasSrc = propValue = propKey = null;
          for (hasSrcSet in props)
            if (props.hasOwnProperty(hasSrcSet) && (defaultValue = props[hasSrcSet], null != defaultValue))
              switch (hasSrcSet) {
                case "value":
                  propKey = defaultValue;
                  break;
                case "defaultValue":
                  propValue = defaultValue;
                  break;
                case "multiple":
                  hasSrc = defaultValue;
                default:
                  setProp(domElement, tag, hasSrcSet, defaultValue, props, null);
              }
          tag = propKey;
          props = propValue;
          domElement.multiple = !!hasSrc;
          null != tag ? updateOptions(domElement, !!hasSrc, tag, false) : null != props && updateOptions(domElement, !!hasSrc, props, true);
          return;
        case "textarea":
          listenToNonDelegatedEvent("invalid", domElement);
          propKey = hasSrcSet = hasSrc = null;
          for (propValue in props)
            if (props.hasOwnProperty(propValue) && (defaultValue = props[propValue], null != defaultValue))
              switch (propValue) {
                case "value":
                  hasSrc = defaultValue;
                  break;
                case "defaultValue":
                  hasSrcSet = defaultValue;
                  break;
                case "children":
                  propKey = defaultValue;
                  break;
                case "dangerouslySetInnerHTML":
                  if (null != defaultValue) throw Error(formatProdErrorMessage(91));
                  break;
                default:
                  setProp(domElement, tag, propValue, defaultValue, props, null);
              }
          initTextarea(domElement, hasSrc, hasSrcSet, propKey);
          return;
        case "option":
          for (checked in props)
            if (props.hasOwnProperty(checked) && (hasSrc = props[checked], null != hasSrc))
              switch (checked) {
                case "selected":
                  domElement.selected = hasSrc && "function" !== typeof hasSrc && "symbol" !== typeof hasSrc;
                  break;
                default:
                  setProp(domElement, tag, checked, hasSrc, props, null);
              }
          return;
        case "dialog":
          listenToNonDelegatedEvent("beforetoggle", domElement);
          listenToNonDelegatedEvent("toggle", domElement);
          listenToNonDelegatedEvent("cancel", domElement);
          listenToNonDelegatedEvent("close", domElement);
          break;
        case "iframe":
        case "object":
          listenToNonDelegatedEvent("load", domElement);
          break;
        case "video":
        case "audio":
          for (hasSrc = 0; hasSrc < mediaEventTypes.length; hasSrc++)
            listenToNonDelegatedEvent(mediaEventTypes[hasSrc], domElement);
          break;
        case "image":
          listenToNonDelegatedEvent("error", domElement);
          listenToNonDelegatedEvent("load", domElement);
          break;
        case "details":
          listenToNonDelegatedEvent("toggle", domElement);
          break;
        case "embed":
        case "source":
        case "link":
          listenToNonDelegatedEvent("error", domElement), listenToNonDelegatedEvent("load", domElement);
        case "area":
        case "base":
        case "br":
        case "col":
        case "hr":
        case "keygen":
        case "meta":
        case "param":
        case "track":
        case "wbr":
        case "menuitem":
          for (defaultChecked in props)
            if (props.hasOwnProperty(defaultChecked) && (hasSrc = props[defaultChecked], null != hasSrc))
              switch (defaultChecked) {
                case "children":
                case "dangerouslySetInnerHTML":
                  throw Error(formatProdErrorMessage(137, tag));
                default:
                  setProp(domElement, tag, defaultChecked, hasSrc, props, null);
              }
          return;
        default:
          if (isCustomElement(tag)) {
            for (propValue$204 in props)
              props.hasOwnProperty(propValue$204) && (hasSrc = props[propValue$204], void 0 !== hasSrc && setPropOnCustomElement(
                domElement,
                tag,
                propValue$204,
                hasSrc,
                props,
                void 0
              ));
            return;
          }
      }
      for (defaultValue in props)
        props.hasOwnProperty(defaultValue) && (hasSrc = props[defaultValue], null != hasSrc && setProp(domElement, tag, defaultValue, hasSrc, props, null));
    }
    var emptyProps = {};
    function updateProperties(domElement, tag, lastProps, nextProps) {
      switch (tag) {
        case "div":
        case "span":
        case "svg":
        case "path":
        case "a":
        case "g":
        case "p":
        case "li":
          break;
        case "input":
          var name = null, type = null, value = null, defaultValue = null, lastDefaultValue = null, checked = null, defaultChecked = null;
          for (propKey in lastProps) {
            var lastProp = lastProps[propKey];
            if (lastProps.hasOwnProperty(propKey) && null != lastProp)
              switch (propKey) {
                case "checked":
                  break;
                case "value":
                  break;
                case "defaultValue":
                  lastDefaultValue = lastProp;
                default:
                  nextProps.hasOwnProperty(propKey) || setProp(domElement, tag, propKey, null, nextProps, lastProp);
              }
          }
          for (var propKey$221 in nextProps) {
            var propKey = nextProps[propKey$221];
            lastProp = lastProps[propKey$221];
            if (nextProps.hasOwnProperty(propKey$221) && (null != propKey || null != lastProp))
              switch (propKey$221) {
                case "type":
                  propKey !== lastProp && (viewTransitionMutationContext = true);
                  type = propKey;
                  break;
                case "name":
                  propKey !== lastProp && (viewTransitionMutationContext = true);
                  name = propKey;
                  break;
                case "checked":
                  propKey !== lastProp && (viewTransitionMutationContext = true);
                  checked = propKey;
                  break;
                case "defaultChecked":
                  propKey !== lastProp && (viewTransitionMutationContext = true);
                  defaultChecked = propKey;
                  break;
                case "value":
                  propKey !== lastProp && (viewTransitionMutationContext = true);
                  value = propKey;
                  break;
                case "defaultValue":
                  propKey !== lastProp && (viewTransitionMutationContext = true);
                  defaultValue = propKey;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  if (null != propKey)
                    throw Error(formatProdErrorMessage(137, tag));
                  break;
                default:
                  propKey !== lastProp && setProp(
                    domElement,
                    tag,
                    propKey$221,
                    propKey,
                    nextProps,
                    lastProp
                  );
              }
          }
          updateInput(
            domElement,
            value,
            defaultValue,
            lastDefaultValue,
            checked,
            defaultChecked,
            type,
            name
          );
          return;
        case "select":
          propKey = value = defaultValue = propKey$221 = null;
          for (type in lastProps)
            if (lastDefaultValue = lastProps[type], lastProps.hasOwnProperty(type) && null != lastDefaultValue)
              switch (type) {
                case "value":
                  break;
                case "multiple":
                  propKey = lastDefaultValue;
                default:
                  nextProps.hasOwnProperty(type) || setProp(
                    domElement,
                    tag,
                    type,
                    null,
                    nextProps,
                    lastDefaultValue
                  );
              }
          for (name in nextProps)
            if (type = nextProps[name], lastDefaultValue = lastProps[name], nextProps.hasOwnProperty(name) && (null != type || null != lastDefaultValue))
              switch (name) {
                case "value":
                  type !== lastDefaultValue && (viewTransitionMutationContext = true);
                  propKey$221 = type;
                  break;
                case "defaultValue":
                  type !== lastDefaultValue && (viewTransitionMutationContext = true);
                  defaultValue = type;
                  break;
                case "multiple":
                  type !== lastDefaultValue && (viewTransitionMutationContext = true), value = type;
                default:
                  type !== lastDefaultValue && setProp(
                    domElement,
                    tag,
                    name,
                    type,
                    nextProps,
                    lastDefaultValue
                  );
              }
          tag = defaultValue;
          lastProps = value;
          nextProps = propKey;
          null != propKey$221 ? updateOptions(domElement, !!lastProps, propKey$221, false) : !!nextProps !== !!lastProps && (null != tag ? updateOptions(domElement, !!lastProps, tag, true) : updateOptions(domElement, !!lastProps, lastProps ? [] : "", false));
          return;
        case "textarea":
          propKey = propKey$221 = null;
          for (defaultValue in lastProps)
            if (name = lastProps[defaultValue], lastProps.hasOwnProperty(defaultValue) && null != name && !nextProps.hasOwnProperty(defaultValue))
              switch (defaultValue) {
                case "value":
                  break;
                case "children":
                  break;
                default:
                  setProp(domElement, tag, defaultValue, null, nextProps, name);
              }
          for (value in nextProps)
            if (name = nextProps[value], type = lastProps[value], nextProps.hasOwnProperty(value) && (null != name || null != type))
              switch (value) {
                case "value":
                  name !== type && (viewTransitionMutationContext = true);
                  propKey$221 = name;
                  break;
                case "defaultValue":
                  name !== type && (viewTransitionMutationContext = true);
                  propKey = name;
                  break;
                case "children":
                  break;
                case "dangerouslySetInnerHTML":
                  if (null != name) throw Error(formatProdErrorMessage(91));
                  break;
                default:
                  name !== type && setProp(domElement, tag, value, name, nextProps, type);
              }
          updateTextarea(domElement, propKey$221, propKey);
          return;
        case "option":
          for (var propKey$237 in lastProps)
            if (propKey$221 = lastProps[propKey$237], lastProps.hasOwnProperty(propKey$237) && null != propKey$221 && !nextProps.hasOwnProperty(propKey$237))
              switch (propKey$237) {
                case "selected":
                  domElement.selected = false;
                  break;
                default:
                  setProp(
                    domElement,
                    tag,
                    propKey$237,
                    null,
                    nextProps,
                    propKey$221
                  );
              }
          for (lastDefaultValue in nextProps)
            if (propKey$221 = nextProps[lastDefaultValue], propKey = lastProps[lastDefaultValue], nextProps.hasOwnProperty(lastDefaultValue) && propKey$221 !== propKey && (null != propKey$221 || null != propKey))
              switch (lastDefaultValue) {
                case "selected":
                  propKey$221 !== propKey && (viewTransitionMutationContext = true);
                  domElement.selected = propKey$221 && "function" !== typeof propKey$221 && "symbol" !== typeof propKey$221;
                  break;
                default:
                  setProp(
                    domElement,
                    tag,
                    lastDefaultValue,
                    propKey$221,
                    nextProps,
                    propKey
                  );
              }
          return;
        case "img":
        case "link":
        case "area":
        case "base":
        case "br":
        case "col":
        case "embed":
        case "hr":
        case "keygen":
        case "meta":
        case "param":
        case "source":
        case "track":
        case "wbr":
        case "menuitem":
          for (var propKey$242 in lastProps)
            propKey$221 = lastProps[propKey$242], lastProps.hasOwnProperty(propKey$242) && null != propKey$221 && !nextProps.hasOwnProperty(propKey$242) && setProp(domElement, tag, propKey$242, null, nextProps, propKey$221);
          for (checked in nextProps)
            if (propKey$221 = nextProps[checked], propKey = lastProps[checked], nextProps.hasOwnProperty(checked) && propKey$221 !== propKey && (null != propKey$221 || null != propKey))
              switch (checked) {
                case "children":
                case "dangerouslySetInnerHTML":
                  if (null != propKey$221)
                    throw Error(formatProdErrorMessage(137, tag));
                  break;
                default:
                  setProp(
                    domElement,
                    tag,
                    checked,
                    propKey$221,
                    nextProps,
                    propKey
                  );
              }
          return;
        default:
          if (isCustomElement(tag)) {
            for (var propKey$247 in lastProps)
              propKey$221 = lastProps[propKey$247], lastProps.hasOwnProperty(propKey$247) && void 0 !== propKey$221 && !nextProps.hasOwnProperty(propKey$247) && setPropOnCustomElement(
                domElement,
                tag,
                propKey$247,
                void 0,
                nextProps,
                propKey$221
              );
            for (defaultChecked in nextProps)
              propKey$221 = nextProps[defaultChecked], propKey = lastProps[defaultChecked], !nextProps.hasOwnProperty(defaultChecked) || propKey$221 === propKey || void 0 === propKey$221 && void 0 === propKey || setPropOnCustomElement(
                domElement,
                tag,
                defaultChecked,
                propKey$221,
                nextProps,
                propKey
              );
            return;
          }
      }
      for (var propKey$252 in lastProps)
        propKey$221 = lastProps[propKey$252], lastProps.hasOwnProperty(propKey$252) && null != propKey$221 && !nextProps.hasOwnProperty(propKey$252) && setProp(domElement, tag, propKey$252, null, nextProps, propKey$221);
      for (lastProp in nextProps)
        propKey$221 = nextProps[lastProp], propKey = lastProps[lastProp], !nextProps.hasOwnProperty(lastProp) || propKey$221 === propKey || null == propKey$221 && null == propKey || setProp(domElement, tag, lastProp, propKey$221, nextProps, propKey);
    }
    function isLikelyStaticResource(initiatorType) {
      switch (initiatorType) {
        case "css":
        case "script":
        case "font":
        case "img":
        case "image":
        case "input":
        case "link":
          return true;
        default:
          return false;
      }
    }
    function estimateBandwidth() {
      if ("function" === typeof performance.getEntriesByType) {
        for (var count = 0, bits = 0, resourceEntries = performance.getEntriesByType("resource"), i = 0; i < resourceEntries.length; i++) {
          var entry = resourceEntries[i], transferSize = entry.transferSize, initiatorType = entry.initiatorType, duration = entry.duration;
          if (transferSize && duration && isLikelyStaticResource(initiatorType)) {
            initiatorType = 0;
            duration = entry.responseEnd;
            for (i += 1; i < resourceEntries.length; i++) {
              var overlapEntry = resourceEntries[i], overlapStartTime = overlapEntry.startTime;
              if (overlapStartTime > duration) break;
              var overlapTransferSize = overlapEntry.transferSize, overlapInitiatorType = overlapEntry.initiatorType;
              overlapTransferSize && isLikelyStaticResource(overlapInitiatorType) && (overlapEntry = overlapEntry.responseEnd, initiatorType += overlapTransferSize * (overlapEntry < duration ? 1 : (duration - overlapStartTime) / (overlapEntry - overlapStartTime)));
            }
            --i;
            bits += 8 * (transferSize + initiatorType) / (entry.duration / 1e3);
            count++;
            if (10 < count) break;
          }
        }
        if (0 < count) return bits / count / 1e6;
      }
      return navigator.connection && (count = navigator.connection.downlink, "number" === typeof count) ? count : 5;
    }
    var eventsEnabled = null;
    var selectionInformation = null;
    function getOwnerDocumentFromRootContainer(rootContainerElement) {
      return 9 === rootContainerElement.nodeType ? rootContainerElement : rootContainerElement.ownerDocument;
    }
    function getOwnHostContext(namespaceURI) {
      switch (namespaceURI) {
        case "http://www.w3.org/2000/svg":
          return 1;
        case "http://www.w3.org/1998/Math/MathML":
          return 2;
        default:
          return 0;
      }
    }
    function getChildHostContextProd(parentNamespace, type) {
      if (0 === parentNamespace)
        switch (type) {
          case "svg":
            return 1;
          case "math":
            return 2;
          default:
            return 0;
        }
      return 1 === parentNamespace && "foreignObject" === type ? 0 : parentNamespace;
    }
    function createHoistableInstance(type, props, rootContainerInstance, internalInstanceHandle) {
      rootContainerInstance = getOwnerDocumentFromRootContainer(
        rootContainerInstance
      ).createElement(type);
      rootContainerInstance[internalInstanceKey] = internalInstanceHandle;
      rootContainerInstance[internalPropsKey] = props;
      setInitialProperties(rootContainerInstance, type, props);
      markNodeAsHoistable(rootContainerInstance);
      return rootContainerInstance;
    }
    function shouldSetTextContent(type, props) {
      return "textarea" === type || "noscript" === type || "string" === typeof props.children || "number" === typeof props.children || "bigint" === typeof props.children || "object" === typeof props.dangerouslySetInnerHTML && null !== props.dangerouslySetInnerHTML && null != props.dangerouslySetInnerHTML.__html;
    }
    var currentPopstateTransitionEvent = null;
    function shouldAttemptEagerTransition() {
      var event = window.event;
      if (event && "popstate" === event.type) {
        if (event === currentPopstateTransitionEvent) return false;
        currentPopstateTransitionEvent = event;
        return true;
      }
      currentPopstateTransitionEvent = null;
      return false;
    }
    var scheduleTimeout = "function" === typeof setTimeout ? setTimeout : void 0;
    var cancelTimeout = "function" === typeof clearTimeout ? clearTimeout : void 0;
    var localPromise = "function" === typeof Promise ? Promise : void 0;
    var localRequestAnimationFrame = "function" === typeof requestAnimationFrame ? requestAnimationFrame : scheduleTimeout;
    var scheduleMicrotask = "function" === typeof queueMicrotask ? queueMicrotask : "undefined" !== typeof localPromise ? function(callback) {
      return localPromise.resolve(null).then(callback).catch(handleErrorInNextTick);
    } : scheduleTimeout;
    function handleErrorInNextTick(error) {
      setTimeout(function() {
        throw error;
      });
    }
    function isSingletonScope(type) {
      return "head" === type;
    }
    function clearHydrationBoundary(parentInstance, hydrationInstance) {
      var node = hydrationInstance, depth = 0;
      do {
        var nextNode = node.nextSibling;
        parentInstance.removeChild(node);
        if (nextNode && 8 === nextNode.nodeType)
          if (node = nextNode.data, "/$" === node || "/&" === node) {
            if (0 === depth) {
              parentInstance.removeChild(nextNode);
              retryIfBlockedOn(hydrationInstance);
              return;
            }
            depth--;
          } else if ("$" === node || "$?" === node || "$~" === node || "$!" === node || "&" === node)
            depth++;
          else if ("html" === node)
            clearSingletonPreambleContribution(
              parentInstance.ownerDocument.documentElement
            );
          else if ("head" === node) {
            node = parentInstance.ownerDocument.head;
            clearSingletonPreambleContribution(node);
            for (var node$jscomp$0 = node.firstChild; node$jscomp$0; ) {
              var nextNode$jscomp$0 = node$jscomp$0.nextSibling, nodeName = node$jscomp$0.nodeName;
              node$jscomp$0[internalHoistableMarker] || "SCRIPT" === nodeName || "STYLE" === nodeName || "LINK" === nodeName && "stylesheet" === node$jscomp$0.rel.toLowerCase() || node.removeChild(node$jscomp$0);
              node$jscomp$0 = nextNode$jscomp$0;
            }
          } else
            "body" === node && clearSingletonPreambleContribution(parentInstance.ownerDocument.body);
        node = nextNode;
      } while (node);
      retryIfBlockedOn(hydrationInstance);
    }
    function hideOrUnhideDehydratedBoundary(suspenseInstance, isHidden) {
      var node = suspenseInstance;
      suspenseInstance = 0;
      do {
        var nextNode = node.nextSibling;
        1 === node.nodeType ? isHidden ? (node._stashedDisplay = node.style.display, node.style.display = "none") : (node.style.display = node._stashedDisplay || "", "" === node.getAttribute("style") && node.removeAttribute("style")) : 3 === node.nodeType && (isHidden ? (node._stashedText = node.nodeValue, node.nodeValue = "") : node.nodeValue = node._stashedText || "");
        if (nextNode && 8 === nextNode.nodeType)
          if (node = nextNode.data, "/$" === node)
            if (0 === suspenseInstance) break;
            else suspenseInstance--;
          else
            "$" !== node && "$?" !== node && "$~" !== node && "$!" !== node || suspenseInstance++;
        node = nextNode;
      } while (node);
    }
    function applyViewTransitionName(instance, name, className) {
      name = CSS.escape(name) !== name ? "r-" + btoa(name).replace(/=/g, "") : name;
      instance.style.viewTransitionName = name;
      null != className && (instance.style.viewTransitionClass = className);
      className = getComputedStyle(instance);
      if ("inline" === className.display) {
        name = instance.getClientRects();
        if (1 === name.length) var JSCompiler_inline_result = 1;
        else
          for (var i = JSCompiler_inline_result = 0; i < name.length; i++) {
            var rect = name[i];
            0 < rect.width && 0 < rect.height && JSCompiler_inline_result++;
          }
        1 === JSCompiler_inline_result && (instance = instance.style, instance.display = 1 === name.length ? "inline-block" : "block", instance.marginTop = "-" + className.paddingTop, instance.marginBottom = "-" + className.paddingBottom);
      }
    }
    function restoreViewTransitionName(instance, props) {
      instance = instance.style;
      props = props.style;
      var viewTransitionName = null != props ? props.hasOwnProperty("viewTransitionName") ? props.viewTransitionName : props.hasOwnProperty("view-transition-name") ? props["view-transition-name"] : null : null;
      instance.viewTransitionName = null == viewTransitionName || "boolean" === typeof viewTransitionName ? "" : ("" + viewTransitionName).trim();
      viewTransitionName = null != props ? props.hasOwnProperty("viewTransitionClass") ? props.viewTransitionClass : props.hasOwnProperty("view-transition-class") ? props["view-transition-class"] : null : null;
      instance.viewTransitionClass = null == viewTransitionName || "boolean" === typeof viewTransitionName ? "" : ("" + viewTransitionName).trim();
      "inline-block" === instance.display && (null == props ? instance.display = instance.margin = "" : (viewTransitionName = props.display, instance.display = null == viewTransitionName || "boolean" === typeof viewTransitionName ? "" : viewTransitionName, viewTransitionName = props.margin, null != viewTransitionName ? instance.margin = viewTransitionName : (viewTransitionName = props.hasOwnProperty(
      "marginTop") ? props.marginTop : props["margin-top"], instance.marginTop = null == viewTransitionName || "boolean" === typeof viewTransitionName ? "" : viewTransitionName, props = props.hasOwnProperty("marginBottom") ? props.marginBottom : props["margin-bottom"], instance.marginBottom = null == props || "boolean" === typeof props ? "" : props)));
    }
    function createMeasurement(rect, computedStyle, element) {
      element = element.ownerDocument.defaultView;
      return {
        rect,
        abs: "absolute" === computedStyle.position || "fixed" === computedStyle.position,
        clip: "none" !== computedStyle.clipPath || "visible" !== computedStyle.overflow || "none" !== computedStyle.filter || "none" !== computedStyle.mask || "none" !== computedStyle.mask || "0px" !== computedStyle.borderRadius,
        view: 0 <= rect.bottom && 0 <= rect.right && rect.top <= element.innerHeight && rect.left <= element.innerWidth
      };
    }
    function measureInstance(instance) {
      var rect = instance.getBoundingClientRect(), computedStyle = getComputedStyle(instance);
      return createMeasurement(rect, computedStyle, instance);
    }
    function measureClonedInstance(instance) {
      var measuredRect = instance.getBoundingClientRect();
      measuredRect = new DOMRect(
        measuredRect.x + 2e4,
        measuredRect.y + 2e4,
        measuredRect.width,
        measuredRect.height
      );
      var computedStyle = getComputedStyle(instance);
      return createMeasurement(measuredRect, computedStyle, instance);
    }
    function forceLayout(ownerDocument) {
      return ownerDocument.documentElement.clientHeight;
    }
    function waitForImageToLoad(resolve) {
      this.addEventListener("load", resolve);
      this.addEventListener("error", resolve);
    }
    function startViewTransition(suspendedState, rootContainer, transitionTypes, mutationCallback, layoutCallback, afterMutationCallback, spawnedWorkCallback, passiveCallback, errorCallback) {
      var ownerDocument = 9 === rootContainer.nodeType ? rootContainer : rootContainer.ownerDocument;
      try {
        var transition = ownerDocument.startViewTransition({
          update: function() {
            var ownerWindow = ownerDocument.defaultView, pendingNavigation = ownerWindow.navigation && ownerWindow.navigation.transition, previousFontLoadingStatus = ownerDocument.fonts.status;
            mutationCallback();
            var blockingPromises = [];
            "loaded" === previousFontLoadingStatus && (forceLayout(ownerDocument), "loading" === ownerDocument.fonts.status && blockingPromises.push(ownerDocument.fonts.ready));
            previousFontLoadingStatus = blockingPromises.length;
            if (null !== suspendedState)
              for (var suspenseyImages = suspendedState.suspenseyImages, imgBytes = 0, i = 0; i < suspenseyImages.length; i++) {
                var suspenseyImage = suspenseyImages[i];
                if (!suspenseyImage.complete) {
                  var rect = suspenseyImage.getBoundingClientRect();
                  if (0 < rect.bottom && 0 < rect.right && rect.top < ownerWindow.innerHeight && rect.left < ownerWindow.innerWidth) {
                    imgBytes += estimateImageBytes(suspenseyImage);
                    if (imgBytes > estimatedBytesWithinLimit) {
                      blockingPromises.length = previousFontLoadingStatus;
                      break;
                    }
                    suspenseyImage = new Promise(
                      waitForImageToLoad.bind(suspenseyImage)
                    );
                    blockingPromises.push(suspenseyImage);
                  }
                }
              }
            if (0 < blockingPromises.length)
              return ownerWindow = Promise.race([
                Promise.all(blockingPromises),
                new Promise(function(resolve) {
                  return setTimeout(resolve, 500);
                })
              ]).then(layoutCallback, layoutCallback), (pendingNavigation ? Promise.allSettled([pendingNavigation.finished, ownerWindow]) : ownerWindow).then(afterMutationCallback, afterMutationCallback);
            layoutCallback();
            if (pendingNavigation)
              return pendingNavigation.finished.then(
                afterMutationCallback,
                afterMutationCallback
              );
            afterMutationCallback();
          },
          types: transitionTypes
        });
        ownerDocument.__reactViewTransition = transition;
        var viewTransitionAnimations = [];
        transition.ready.then(
          function() {
            for (var animations = ownerDocument.documentElement.getAnimations({
              subtree: true
            }), i = 0; i < animations.length; i++) {
              var animation = animations[i], effect = animation.effect, pseudoElement = effect.pseudoElement;
              if (null != pseudoElement && pseudoElement.startsWith("::view-transition")) {
                viewTransitionAnimations.push(animation);
                animation = effect.getKeyframes();
                for (var height = pseudoElement = void 0, unchangedDimensions = true, j = 0; j < animation.length; j++) {
                  var keyframe = animation[j], w = keyframe.width;
                  if (void 0 === pseudoElement) pseudoElement = w;
                  else if (pseudoElement !== w) {
                    unchangedDimensions = false;
                    break;
                  }
                  w = keyframe.height;
                  if (void 0 === height) height = w;
                  else if (height !== w) {
                    unchangedDimensions = false;
                    break;
                  }
                  delete keyframe.width;
                  delete keyframe.height;
                  "none" === keyframe.transform && delete keyframe.transform;
                }
                unchangedDimensions && void 0 !== pseudoElement && void 0 !== height && (effect.setKeyframes(animation), unchangedDimensions = getComputedStyle(
                  effect.target,
                  effect.pseudoElement
                ), unchangedDimensions.width !== pseudoElement || unchangedDimensions.height !== height) && (unchangedDimensions = animation[0], unchangedDimensions.width = pseudoElement, unchangedDimensions.height = height, unchangedDimensions = animation[animation.length - 1], unchangedDimensions.width = pseudoElement, unchangedDimensions.height = height, effect.setKeyframes(animation));
              }
            }
            spawnedWorkCallback();
          },
          function(error) {
            ownerDocument.__reactViewTransition === transition && (ownerDocument.__reactViewTransition = null);
            try {
              if ("object" === typeof error && null !== error)
                switch (error.name) {
                  case "InvalidStateError":
                    if ("View transition was skipped because document visibility state is hidden." === error.message || "Skipping view transition because document visibility state has become hidden." === error.message || "Skipping view transition because viewport size changed." === error.message || "Transition was aborted because of invalid state" === error.message)
                      error = null;
                }
              null !== error && errorCallback(error);
            } finally {
              mutationCallback(), layoutCallback(), spawnedWorkCallback();
            }
          }
        );
        transition.finished.finally(function() {
          for (var i = 0; i < viewTransitionAnimations.length; i++)
            viewTransitionAnimations[i].cancel();
          ownerDocument.__reactViewTransition === transition && (ownerDocument.__reactViewTransition = null);
          passiveCallback();
        });
        return transition;
      } catch (x) {
        return mutationCallback(), layoutCallback(), spawnedWorkCallback(), null;
      }
    }
    function ViewTransitionPseudoElement(pseudo, name) {
      this._scope = document.documentElement;
      this._selector = "::view-transition-" + pseudo + "(" + name + ")";
    }
    ViewTransitionPseudoElement.prototype.animate = function(keyframes, options2) {
      options2 = "number" === typeof options2 ? { duration: options2 } : assign({}, options2);
      options2.pseudoElement = this._selector;
      return this._scope.animate(keyframes, options2);
    };
    ViewTransitionPseudoElement.prototype.getAnimations = function() {
      for (var scope = this._scope, selector = this._selector, animations = scope.getAnimations({ subtree: true }), result = [], i = 0; i < animations.length; i++) {
        var effect = animations[i].effect;
        null !== effect && effect.target === scope && effect.pseudoElement === selector && result.push(animations[i]);
      }
      return result;
    };
    ViewTransitionPseudoElement.prototype.getComputedStyle = function() {
      return getComputedStyle(this._scope, this._selector);
    };
    function createViewTransitionInstance(name) {
      return {
        name,
        group: new ViewTransitionPseudoElement("group", name),
        imagePair: new ViewTransitionPseudoElement("image-pair", name),
        old: new ViewTransitionPseudoElement("old", name),
        new: new ViewTransitionPseudoElement("new", name)
      };
    }
    function FragmentInstance(fragmentFiber) {
      this._fragmentFiber = fragmentFiber;
      this._observers = this._eventListeners = null;
    }
    FragmentInstance.prototype.addEventListener = function(type, listener, optionsOrUseCapture) {
      var signal = null, cleanup = null;
      if (null != optionsOrUseCapture && "boolean" !== typeof optionsOrUseCapture && (signal = optionsOrUseCapture.signal || null, null !== signal && signal.aborted))
        return;
      null === this._eventListeners && (this._eventListeners = []);
      var listeners = this._eventListeners;
      if (-1 === indexOfEventListener(listeners, type, listener, optionsOrUseCapture)) {
        var fragmentInstance = this, attachedListener = listener;
        null != optionsOrUseCapture && "boolean" !== typeof optionsOrUseCapture && true === optionsOrUseCapture.once && (attachedListener = function(event) {
          fragmentInstance.removeEventListener(
            type,
            listener,
            optionsOrUseCapture
          );
          "function" === typeof listener ? listener.call(this, event) : listener.handleEvent(event);
        });
        null !== signal && (cleanup = fragmentInstance.removeEventListener.bind(
          fragmentInstance,
          type,
          listener,
          optionsOrUseCapture
        ), signal.addEventListener("abort", cleanup, { once: true }), cleanup = signal.removeEventListener.bind(signal, "abort", cleanup));
        signal = getAttachOptions(optionsOrUseCapture);
        listeners.push({
          type,
          listener,
          optionsOrUseCapture,
          attachedListener,
          cleanup
        });
        traverseVisibleInstancesAndTextInstances(
          this._fragmentFiber.child,
          false,
          addEventListenerToChild,
          type,
          attachedListener,
          signal
        );
      }
      this._eventListeners = listeners;
    };
    function addEventListenerToChild(child, type, listener, optionsOrUseCapture) {
      getInstanceFromHostFiber(child).addEventListener(
        type,
        listener,
        optionsOrUseCapture
      );
      return false;
    }
    FragmentInstance.prototype.removeEventListener = function(type, listener, optionsOrUseCapture) {
      var listeners = this._eventListeners;
      if (null !== listeners && (listener = indexOfEventListener(
        listeners,
        type,
        listener,
        optionsOrUseCapture
      ), -1 !== listener)) {
        var _listeners$index = listeners[listener];
        optionsOrUseCapture = _listeners$index.attachedListener;
        var cleanup = _listeners$index.cleanup;
        _listeners$index = getAttachOptions(_listeners$index.optionsOrUseCapture);
        traverseVisibleInstancesAndTextInstances(
          this._fragmentFiber.child,
          false,
          removeEventListenerFromChild,
          type,
          optionsOrUseCapture,
          _listeners$index
        );
        listeners.splice(listener, 1);
        null !== cleanup && cleanup();
      }
    };
    function removeEventListenerFromChild(child, type, listener, optionsOrUseCapture) {
      getInstanceFromHostFiber(child).removeEventListener(
        type,
        listener,
        optionsOrUseCapture
      );
      return false;
    }
    function getAttachOptions(opts) {
      return null != opts && "boolean" !== typeof opts && (true === opts.once || opts.signal instanceof AbortSignal) ? { capture: opts.capture, passive: opts.passive } : opts;
    }
    function normalizeListenerOptions(opts) {
      return null == opts ? "c=0" : "boolean" === typeof opts ? "c=" + (opts ? "1" : "0") : "c=" + (opts.capture ? "1" : "0");
    }
    function indexOfEventListener(eventListeners, type, listener, optionsOrUseCapture) {
      if (0 === eventListeners.length) return -1;
      optionsOrUseCapture = normalizeListenerOptions(optionsOrUseCapture);
      for (var i = 0; i < eventListeners.length; i++) {
        var item = eventListeners[i];
        if (item.type === type && item.listener === listener && normalizeListenerOptions(item.optionsOrUseCapture) === optionsOrUseCapture)
          return i;
      }
      return -1;
    }
    FragmentInstance.prototype.dispatchEvent = function(event) {
      var parentHostFiber = getFragmentParentInstanceOrContainerFiber(
        this._fragmentFiber
      );
      if (null === parentHostFiber) return true;
      parentHostFiber = getInstanceFromHostFiber(parentHostFiber);
      var eventListeners = this._eventListeners;
      if (null !== eventListeners && 0 < eventListeners.length || !event.bubbles) {
        var temp = 9 === parentHostFiber.nodeType ? parentHostFiber.createComment("") : document.createTextNode("");
        if (eventListeners)
          for (var i = 0; i < eventListeners.length; i++) {
            var _eventListeners$i = eventListeners[i];
            temp.addEventListener(
              _eventListeners$i.type,
              _eventListeners$i.attachedListener,
              getAttachOptions(_eventListeners$i.optionsOrUseCapture)
            );
          }
        parentHostFiber.appendChild(temp);
        event = temp.dispatchEvent(event);
        if (eventListeners)
          for (i = 0; i < eventListeners.length; i++)
            _eventListeners$i = eventListeners[i], temp.removeEventListener(
              _eventListeners$i.type,
              _eventListeners$i.attachedListener,
              getAttachOptions(_eventListeners$i.optionsOrUseCapture)
            );
        parentHostFiber.removeChild(temp);
        return event;
      }
      return parentHostFiber.dispatchEvent(event);
    };
    FragmentInstance.prototype.focus = function(focusOptions) {
      traverseVisibleInstancesAndTextInstances(
        this._fragmentFiber.child,
        true,
        setFocusOnFiberIfFocusable,
        focusOptions,
        void 0,
        void 0
      );
    };
    function setFocusOnFiberIfFocusable(fiber, focusOptions) {
      if (6 === fiber.tag) return false;
      fiber = getInstanceFromHostFiber(fiber);
      return setFocusIfFocusable(fiber, focusOptions);
    }
    FragmentInstance.prototype.focusLast = function(focusOptions) {
      var children = [];
      traverseVisibleInstancesAndTextInstances(
        this._fragmentFiber.child,
        true,
        collectChildren,
        children,
        void 0,
        void 0
      );
      for (var i = children.length - 1; 0 <= i && !setFocusOnFiberIfFocusable(children[i], focusOptions); i--) ;
    };
    function collectChildren(child, collection) {
      collection.push(child);
      return false;
    }
    FragmentInstance.prototype.blur = function() {
      var parentHostFiber = getFragmentParentInstanceOrContainerFiber(
        this._fragmentFiber
      );
      null !== parentHostFiber && (parentHostFiber = getInstanceFromHostFiber(parentHostFiber), parentHostFiber = getOwnerDocumentFromRootContainer(parentHostFiber).activeElement, null !== parentHostFiber && traverseVisibleInstancesAndTextInstances(
        this._fragmentFiber.child,
        false,
        blurActiveElementWithinFragment,
        parentHostFiber,
        void 0,
        void 0
      ));
    };
    function blurActiveElementWithinFragment(child, activeElement2) {
      if (6 === child.tag) return false;
      child = getInstanceFromHostFiber(child);
      return child === activeElement2 || child.contains(activeElement2) ? (activeElement2.blur(), true) : false;
    }
    FragmentInstance.prototype.observeUsing = function(observer) {
      null === this._observers && (this._observers = /* @__PURE__ */ new Set());
      this._observers.add(observer);
      traverseVisibleInstancesAndTextInstances(
        this._fragmentFiber.child,
        false,
        observeChild,
        observer,
        void 0,
        void 0
      );
    };
    function observeChild(child, observer) {
      if (6 === child.tag) return false;
      child = getInstanceFromHostFiber(child);
      observer.observe(child);
      return false;
    }
    FragmentInstance.prototype.unobserveUsing = function(observer) {
      var observers = this._observers;
      if (null !== observers && observers.has(observer)) {
        observers.delete(observer);
        traverseVisibleInstancesAndTextInstances(
          this._fragmentFiber.child,
          false,
          unobserveChild,
          observer,
          void 0,
          void 0
        );
        for (var i = observers = 0; i < pendingIntersectionUnobserves.length; i++) {
          var pending = pendingIntersectionUnobserves[i];
          pending.fragmentInstance === this && pending.observer === observer ? observer.unobserve(pending.instance) : pendingIntersectionUnobserves[observers++] = pending;
        }
        pendingIntersectionUnobserves.length = observers;
      }
    };
    function unobserveChild(child, observer) {
      if (6 === child.tag) return false;
      child = getInstanceFromHostFiber(child);
      observer.unobserve(child);
      return false;
    }
    var pendingIntersectionUnobserves = [];
    var intersectionUnobserveScheduled = false;
    function schedulePendingIntersectionUnobserve(fragmentInstance, observer, instance) {
      pendingIntersectionUnobserves.push({
        fragmentInstance,
        observer,
        instance
      });
      intersectionUnobserveScheduled || (intersectionUnobserveScheduled = true, requestPostPaintCallback(function() {
        intersectionUnobserveScheduled = false;
        var pending = pendingIntersectionUnobserves;
        pendingIntersectionUnobserves = [];
        for (var i = 0; i < pending.length; i++) {
          var item = pending[i];
          item.observer.unobserve(item.instance);
        }
      }));
    }
    FragmentInstance.prototype.getClientRects = function() {
      var rects = [];
      traverseVisibleInstancesAndTextInstances(
        this._fragmentFiber.child,
        false,
        collectClientRects,
        rects,
        void 0,
        void 0
      );
      return rects;
    };
    function collectClientRects(child, rects) {
      if (6 === child.tag) {
        child = child.stateNode;
        var range = child.ownerDocument.createRange();
        range.selectNodeContents(child);
        rects.push.apply(rects, range.getClientRects());
      } else
        child = getInstanceFromHostFiber(child), rects.push.apply(rects, child.getClientRects());
      return false;
    }
    FragmentInstance.prototype.getRootNode = function(getRootNodeOptions) {
      var parentHostFiber = getFragmentParentInstanceOrContainerFiber(
        this._fragmentFiber
      );
      return null === parentHostFiber ? this : getInstanceFromHostFiber(parentHostFiber).getRootNode(getRootNodeOptions);
    };
    FragmentInstance.prototype.compareDocumentPosition = function(otherNode) {
      var parentHostFiber = getFragmentParentInstanceOrContainerFiber(
        this._fragmentFiber
      );
      if (null === parentHostFiber) return Node.DOCUMENT_POSITION_DISCONNECTED;
      var children = [];
      traverseVisibleInstancesAndTextInstances(
        this._fragmentFiber.child,
        false,
        collectChildren,
        children,
        void 0,
        void 0
      );
      var parentHostInstance = getInstanceFromHostFiber(parentHostFiber);
      if (0 === children.length) {
        children = parentHostInstance;
        if (fiberIsPortaledIntoHost(this._fragmentFiber)) {
          a: {
            for (parentHostFiber = this._fragmentFiber.return; null !== parentHostFiber; ) {
              if (4 === parentHostFiber.tag) {
                parentHostFiber = parentHostFiber.stateNode.containerInfo;
                break a;
              }
              if (3 === parentHostFiber.tag || 5 === parentHostFiber.tag || 27 === parentHostFiber.tag)
                break;
              parentHostFiber = parentHostFiber.return;
            }
            parentHostFiber = null;
          }
          null != parentHostFiber && (children = parentHostFiber);
        }
        parentHostFiber = this._fragmentFiber;
        var result = parentHostInstance = children.compareDocumentPosition(otherNode);
        children === otherNode ? result = Node.DOCUMENT_POSITION_CONTAINS : parentHostInstance & Node.DOCUMENT_POSITION_CONTAINED_BY && (children = getFragmentInstanceOrTextInstanceSiblings(parentHostFiber)[1], null === children ? result = Node.DOCUMENT_POSITION_PRECEDING : (otherNode = getInstanceFromHostFiber(children).compareDocumentPosition(
          otherNode
        ), result = 0 === otherNode || otherNode & Node.DOCUMENT_POSITION_FOLLOWING ? Node.DOCUMENT_POSITION_FOLLOWING : Node.DOCUMENT_POSITION_PRECEDING));
        return result |= Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
      }
      parentHostFiber = getInstanceFromHostFiber(children[0]);
      result = getInstanceFromHostFiber(children[children.length - 1]);
      var parentHostInstanceFromDOM = fiberIsPortaledIntoHost(this._fragmentFiber) ? parentHostFiber.parentElement : parentHostInstance;
      if (null == parentHostInstanceFromDOM)
        return Node.DOCUMENT_POSITION_DISCONNECTED;
      parentHostInstance = parentHostInstanceFromDOM.compareDocumentPosition(parentHostFiber) & Node.DOCUMENT_POSITION_CONTAINED_BY;
      parentHostInstanceFromDOM = parentHostInstanceFromDOM.compareDocumentPosition(result) & Node.DOCUMENT_POSITION_CONTAINED_BY;
      var firstResult = parentHostFiber.compareDocumentPosition(otherNode), lastResult = result.compareDocumentPosition(otherNode), otherNodeIsWithinFirstOrLastChild = firstResult & Node.DOCUMENT_POSITION_CONTAINED_BY || lastResult & Node.DOCUMENT_POSITION_CONTAINED_BY;
      lastResult = parentHostInstance && parentHostInstanceFromDOM && firstResult & Node.DOCUMENT_POSITION_FOLLOWING && lastResult & Node.DOCUMENT_POSITION_PRECEDING;
      parentHostFiber = parentHostInstance && parentHostFiber === otherNode || parentHostInstanceFromDOM && result === otherNode || otherNodeIsWithinFirstOrLastChild || lastResult ? Node.DOCUMENT_POSITION_CONTAINED_BY : !parentHostInstance && parentHostFiber === otherNode || !parentHostInstanceFromDOM && result === otherNode ? Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC : firstResult;
      return parentHostFiber & Node.DOCUMENT_POSITION_DISCONNECTED || parentHostFiber & Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC || validateDocumentPositionWithFiberTree(
        parentHostFiber,
        this._fragmentFiber,
        children[0],
        children[children.length - 1],
        otherNode
      ) ? parentHostFiber : Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
    };
    function validateDocumentPositionWithFiberTree(documentPosition, fragmentFiber, precedingBoundaryFiber, followingBoundaryFiber, otherNode) {
      var otherFiber = getClosestInstanceFromNode(otherNode);
      if (documentPosition & Node.DOCUMENT_POSITION_CONTAINED_BY) {
        if (precedingBoundaryFiber = !!otherFiber)
          a: {
            for (; null !== otherFiber; ) {
              if (7 === otherFiber.tag && (otherFiber === fragmentFiber || otherFiber.alternate === fragmentFiber)) {
                precedingBoundaryFiber = true;
                break a;
              }
              otherFiber = otherFiber.return;
            }
            precedingBoundaryFiber = false;
          }
        return precedingBoundaryFiber;
      }
      if (documentPosition & Node.DOCUMENT_POSITION_CONTAINS) {
        if (null === otherFiber)
          return otherFiber = otherNode.ownerDocument, otherNode === otherFiber || otherNode === otherFiber.documentElement || otherNode === otherFiber.body;
        a: {
          otherFiber = fragmentFiber;
          for (fragmentFiber = getFragmentParentInstanceOrContainerFiber(fragmentFiber); null !== otherFiber; ) {
            if (!(5 !== otherFiber.tag && 3 !== otherFiber.tag && 27 !== otherFiber.tag || otherFiber !== fragmentFiber && otherFiber.alternate !== fragmentFiber)) {
              otherFiber = true;
              break a;
            }
            otherFiber = otherFiber.return;
          }
          otherFiber = false;
        }
        return otherFiber;
      }
      return documentPosition & Node.DOCUMENT_POSITION_PRECEDING ? ((fragmentFiber = !!otherFiber) && !(fragmentFiber = otherFiber === precedingBoundaryFiber) && (fragmentFiber = getLowestCommonAncestor(
        precedingBoundaryFiber,
        otherFiber,
        getParentForFragmentAncestors
      ), null === fragmentFiber ? fragmentFiber = false : (traverseVisibleInstancesAndTextInstances(
        fragmentFiber,
        true,
        isFiberPrecedingCheck,
        otherFiber,
        precedingBoundaryFiber
      ), otherFiber = searchTarget, searchTarget = null, fragmentFiber = null !== otherFiber)), fragmentFiber) : documentPosition & Node.DOCUMENT_POSITION_FOLLOWING ? ((fragmentFiber = !!otherFiber) && !(fragmentFiber = otherFiber === followingBoundaryFiber) && (fragmentFiber = getLowestCommonAncestor(
        followingBoundaryFiber,
        otherFiber,
        getParentForFragmentAncestors
      ), null === fragmentFiber ? fragmentFiber = false : (traverseVisibleInstancesAndTextInstances(
        fragmentFiber,
        true,
        isFiberFollowingCheck,
        otherFiber,
        followingBoundaryFiber
      ), otherFiber = searchTarget, searchBoundary = searchTarget = null, fragmentFiber = null !== otherFiber)), fragmentFiber) : false;
    }
    function scrollTextNodeIntoView(textNode, resolvedAlignToTop) {
      var range = textNode.ownerDocument.createRange();
      range.selectNodeContents(textNode);
      textNode = range.getBoundingClientRect();
      window.scrollTo(
        window.scrollX + textNode.left,
        resolvedAlignToTop ? window.scrollY + textNode.top : window.scrollY + textNode.bottom - window.innerHeight
      );
    }
    FragmentInstance.prototype.scrollIntoView = function(alignToTop) {
      if ("object" === typeof alignToTop) throw Error(formatProdErrorMessage(566));
      var children = [];
      traverseVisibleInstancesAndTextInstances(
        this._fragmentFiber.child,
        false,
        collectChildren,
        children,
        void 0,
        void 0
      );
      var resolvedAlignToTop = false !== alignToTop;
      if (0 === children.length) {
        var hostSiblings = getFragmentInstanceOrTextInstanceSiblings(
          this._fragmentFiber
        );
        hostSiblings = resolvedAlignToTop ? hostSiblings[1] || hostSiblings[0] || getFragmentParentInstanceOrContainerFiber(this._fragmentFiber) : hostSiblings[0] || hostSiblings[1];
        if (null === hostSiblings) return;
        if (6 === hostSiblings.tag) {
          alignToTop = getInstanceFromHostFiber(hostSiblings);
          scrollTextNodeIntoView(alignToTop, resolvedAlignToTop);
          return;
        }
        hostSiblings = getInstanceFromHostFiber(hostSiblings);
        if (9 !== hostSiblings.nodeType) {
          if (11 === hostSiblings.nodeType) {
            resolvedAlignToTop = "host" in hostSiblings ? hostSiblings.host : null;
            null !== resolvedAlignToTop && resolvedAlignToTop.scrollIntoView(alignToTop);
            return;
          }
          hostSiblings.scrollIntoView(alignToTop);
        }
      }
      for (hostSiblings = resolvedAlignToTop ? children.length - 1 : 0; hostSiblings !== (resolvedAlignToTop ? -1 : children.length); ) {
        var child = children[hostSiblings];
        6 === child.tag ? (child = getInstanceFromHostFiber(child), scrollTextNodeIntoView(child, resolvedAlignToTop)) : getInstanceFromHostFiber(child).scrollIntoView(alignToTop);
        hostSiblings += resolvedAlignToTop ? -1 : 1;
      }
    };
    function addFragmentHandleToFiber(child, fragmentInstance) {
      child = getInstanceFromHostFiber(child);
      addFragmentHandleToInstance(child, fragmentInstance);
      return false;
    }
    function addFragmentHandleToInstance(instance, fragmentInstance) {
      null == instance.reactFragments && (instance.reactFragments = /* @__PURE__ */ new Set());
      instance.reactFragments.add(fragmentInstance);
    }
    function commitNewChildToFragmentInstance(childInstance, fragmentInstance) {
      var eventListeners = fragmentInstance._eventListeners;
      if (null !== eventListeners)
        for (var i$jscomp$0 = 0; i$jscomp$0 < eventListeners.length; i$jscomp$0++) {
          var _eventListeners$i3 = eventListeners[i$jscomp$0];
          childInstance.addEventListener(
            _eventListeners$i3.type,
            _eventListeners$i3.attachedListener,
            getAttachOptions(_eventListeners$i3.optionsOrUseCapture)
          );
        }
      3 !== childInstance.nodeType && (eventListeners = fragmentInstance._observers, null !== eventListeners && eventListeners.forEach(function(observer) {
        for (var writeIdx = 0, i = 0; i < pendingIntersectionUnobserves.length; i++) {
          var pending = pendingIntersectionUnobserves[i];
          if (pending.fragmentInstance !== fragmentInstance || pending.observer !== observer || pending.instance !== childInstance)
            pendingIntersectionUnobserves[writeIdx++] = pending;
        }
        pendingIntersectionUnobserves.length = writeIdx;
        observer.observe(childInstance);
      }), addFragmentHandleToInstance(childInstance, fragmentInstance));
    }
    function deleteChildFromFragmentInstance(childInstance, fragmentInstance) {
      var eventListeners = fragmentInstance._eventListeners;
      if (null !== eventListeners)
        for (var i = 0; i < eventListeners.length; i++) {
          var _eventListeners$i4 = eventListeners[i];
          childInstance.removeEventListener(
            _eventListeners$i4.type,
            _eventListeners$i4.attachedListener,
            getAttachOptions(_eventListeners$i4.optionsOrUseCapture)
          );
        }
      3 !== childInstance.nodeType && (eventListeners = fragmentInstance._observers, null !== eventListeners && eventListeners.forEach(function(observer) {
        "string" === typeof observer.rootMargin ? schedulePendingIntersectionUnobserve(
          fragmentInstance,
          observer,
          childInstance
        ) : observer.unobserve(childInstance);
      }), null != childInstance.reactFragments && childInstance.reactFragments.delete(fragmentInstance));
    }
    function clearContainerSparingly(container) {
      var nextNode = container.firstChild;
      nextNode && 10 === nextNode.nodeType && (nextNode = nextNode.nextSibling);
      for (; nextNode; ) {
        var node = nextNode;
        nextNode = nextNode.nextSibling;
        switch (node.nodeName) {
          case "HTML":
          case "HEAD":
          case "BODY":
            clearContainerSparingly(node);
            detachDeletedInstance(node);
            continue;
          case "SCRIPT":
          case "STYLE":
            continue;
          case "LINK":
            if ("stylesheet" === node.rel.toLowerCase()) continue;
        }
        container.removeChild(node);
      }
    }
    function canHydrateInstance(instance, type, props, inRootOrSingleton) {
      for (; 1 === instance.nodeType; ) {
        var anyProps = props;
        if (instance.nodeName.toLowerCase() !== type.toLowerCase()) {
          if (!inRootOrSingleton && ("INPUT" !== instance.nodeName || "hidden" !== instance.type))
            break;
        } else if (!inRootOrSingleton)
          if ("input" === type && "hidden" === instance.type) {
            var name = null == anyProps.name ? null : "" + anyProps.name;
            if ("hidden" === anyProps.type && instance.getAttribute("name") === name)
              return instance;
          } else return instance;
        else if (!instance[internalHoistableMarker])
          switch (type) {
            case "meta":
              if (!instance.hasAttribute("itemprop")) break;
              return instance;
            case "link":
              name = instance.getAttribute("rel");
              if ("stylesheet" === name && instance.hasAttribute("data-precedence"))
                break;
              else if (name !== anyProps.rel || instance.getAttribute("href") !== (null == anyProps.href || "" === anyProps.href ? null : anyProps.href) || instance.getAttribute("crossorigin") !== (null == anyProps.crossOrigin ? null : anyProps.crossOrigin) || instance.getAttribute("title") !== (null == anyProps.title ? null : anyProps.title))
                break;
              return instance;
            case "style":
              if (instance.hasAttribute("data-precedence")) break;
              return instance;
            case "script":
              name = instance.getAttribute("src");
              if ((name !== (null == anyProps.src ? null : anyProps.src) || instance.getAttribute("type") !== (null == anyProps.type ? null : anyProps.type) || instance.getAttribute("crossorigin") !== (null == anyProps.crossOrigin ? null : anyProps.crossOrigin)) && name && instance.hasAttribute("async") && !instance.hasAttribute("itemprop"))
                break;
              return instance;
            default:
              return instance;
          }
        instance = getNextHydratable(instance.nextSibling);
        if (null === instance) break;
      }
      return null;
    }
    function canHydrateTextInstance(instance, text, inRootOrSingleton) {
      if ("" === text) return null;
      for (; 3 !== instance.nodeType; ) {
        if ((1 !== instance.nodeType || "INPUT" !== instance.nodeName || "hidden" !== instance.type) && !inRootOrSingleton)
          return null;
        instance = getNextHydratable(instance.nextSibling);
        if (null === instance) return null;
      }
      return instance;
    }
    function canHydrateHydrationBoundary(instance, inRootOrSingleton) {
      for (; 8 !== instance.nodeType; ) {
        if ((1 !== instance.nodeType || "INPUT" !== instance.nodeName || "hidden" !== instance.type) && !inRootOrSingleton)
          return null;
        instance = getNextHydratable(instance.nextSibling);
        if (null === instance) return null;
      }
      return instance;
    }
    function isSuspenseInstancePending(instance) {
      return "$?" === instance.data || "$~" === instance.data;
    }
    function isSuspenseInstanceFallback(instance) {
      return "$!" === instance.data || "$?" === instance.data && "loading" !== instance.ownerDocument.readyState;
    }
    function registerSuspenseInstanceRetry(instance, callback) {
      var ownerDocument = instance.ownerDocument;
      if ("$~" === instance.data) instance._reactRetry = callback;
      else if ("$?" !== instance.data || "loading" !== ownerDocument.readyState)
        callback();
      else {
        var listener = function() {
          callback();
          ownerDocument.removeEventListener("DOMContentLoaded", listener);
        };
        ownerDocument.addEventListener("DOMContentLoaded", listener);
        instance._reactRetry = listener;
      }
    }
    function getNextHydratable(node) {
      for (; null != node; node = node.nextSibling) {
        var nodeType = node.nodeType;
        if (1 === nodeType || 3 === nodeType) break;
        if (8 === nodeType) {
          nodeType = node.data;
          if ("$" === nodeType || "$!" === nodeType || "$?" === nodeType || "$~" === nodeType || "&" === nodeType || "F!" === nodeType || "F" === nodeType)
            break;
          if ("/$" === nodeType || "/&" === nodeType) return null;
        }
      }
      return node;
    }
    var previousHydratableOnEnteringScopedSingleton = null;
    function getNextHydratableInstanceAfterHydrationBoundary(hydrationInstance) {
      hydrationInstance = hydrationInstance.nextSibling;
      for (var depth = 0; hydrationInstance; ) {
        if (8 === hydrationInstance.nodeType) {
          var data = hydrationInstance.data;
          if ("/$" === data || "/&" === data) {
            if (0 === depth)
              return getNextHydratable(hydrationInstance.nextSibling);
            depth--;
          } else
            "$" !== data && "$!" !== data && "$?" !== data && "$~" !== data && "&" !== data || depth++;
        }
        hydrationInstance = hydrationInstance.nextSibling;
      }
      return null;
    }
    function getParentHydrationBoundary(targetInstance) {
      targetInstance = targetInstance.previousSibling;
      for (var depth = 0; targetInstance; ) {
        if (8 === targetInstance.nodeType) {
          var data = targetInstance.data;
          if ("$" === data || "$!" === data || "$?" === data || "$~" === data || "&" === data) {
            if (0 === depth) return targetInstance;
            depth--;
          } else "/$" !== data && "/&" !== data || depth++;
        }
        targetInstance = targetInstance.previousSibling;
      }
      return null;
    }
    function setFocusIfFocusable(node, focusOptions) {
      function handleFocus() {
        didFocus = true;
      }
      if (node.ownerDocument.activeElement === node) return true;
      var didFocus = false;
      try {
        node.ownerDocument.addEventListener("focus", handleFocus, true), (node.focus || HTMLElement.prototype.focus).call(node, focusOptions);
      } finally {
        node.ownerDocument.removeEventListener("focus", handleFocus, true);
      }
      return didFocus;
    }
    function requestPostPaintCallback(callback) {
      localRequestAnimationFrame(function() {
        localRequestAnimationFrame(function(time) {
          return callback(time);
        });
      });
    }
    function resolveSingletonInstance(type, props, rootContainerInstance) {
      props = getOwnerDocumentFromRootContainer(rootContainerInstance);
      switch (type) {
        case "html":
          type = props.documentElement;
          if (!type) throw Error(formatProdErrorMessage(452));
          return type;
        case "head":
          type = props.head;
          if (!type) throw Error(formatProdErrorMessage(453));
          return type;
        case "body":
          type = props.body;
          if (!type) throw Error(formatProdErrorMessage(454));
          return type;
        default:
          throw Error(formatProdErrorMessage(451));
      }
    }
    function releaseSingletonInstance(instance, type, props) {
      for (var propKey in props) {
        var propValue = props[propKey];
        props.hasOwnProperty(propKey) && null != propValue && setProp(instance, type, propKey, null, emptyProps, propValue);
      }
      null != props.dangerouslySetInnerHTML && (instance.textContent = "");
      instance.onclick === noop$1 && (instance.onclick = null);
      detachDeletedInstance(instance);
    }
    function clearSingletonPreambleContribution(instance) {
      for (var attributes = instance.attributes; attributes.length; )
        instance.removeAttributeNode(attributes[0]);
      detachDeletedInstance(instance);
    }
    var preloadPropsMap = /* @__PURE__ */ new Map();
    var preconnectsSet = /* @__PURE__ */ new Set();
    function getHoistableRoot(container) {
      if ("function" === typeof container.getRootNode) {
        var rootNode = container.getRootNode();
        if (9 === rootNode.nodeType || 11 === rootNode.nodeType) return rootNode;
      }
      return 9 === container.nodeType ? container : container.ownerDocument;
    }
    var previousDispatcher = ReactDOMSharedInternals.d;
    ReactDOMSharedInternals.d = {
      f: flushSyncWork,
      r: requestFormReset,
      D: prefetchDNS,
      C: preconnect,
      L: preload,
      m: preloadModule,
      X: preinitScript,
      S: preinitStyle,
      M: preinitModuleScript
    };
    function flushSyncWork() {
      var previousWasRendering = previousDispatcher.f(), wasRendering = flushSyncWork$1();
      return previousWasRendering || wasRendering;
    }
    function requestFormReset(form) {
      var formInst = getInstanceFromNode(form);
      null !== formInst && 5 === formInst.tag && "form" === formInst.type ? requestFormReset$1(formInst) : previousDispatcher.r(form);
    }
    var globalDocument = "undefined" === typeof document ? null : document;
    function preconnectAs(rel, href, crossOrigin) {
      var ownerDocument = globalDocument;
      if (ownerDocument && "string" === typeof href && href) {
        var limitedEscapedHref = escapeSelectorAttributeValueInsideDoubleQuotes(href);
        limitedEscapedHref = 'link[rel="' + rel + '"][href="' + limitedEscapedHref + '"]';
        "string" === typeof crossOrigin && (limitedEscapedHref += '[crossorigin="' + crossOrigin + '"]');
        preconnectsSet.has(limitedEscapedHref) || (preconnectsSet.add(limitedEscapedHref), rel = { rel, crossOrigin, href }, null === ownerDocument.querySelector(limitedEscapedHref) && (href = ownerDocument.createElement("link"), setInitialProperties(href, "link", rel), markNodeAsHoistable(href), ownerDocument.head.appendChild(href)));
      }
    }
    function prefetchDNS(href) {
      previousDispatcher.D(href);
      preconnectAs("dns-prefetch", href, null);
    }
    function preconnect(href, crossOrigin) {
      previousDispatcher.C(href, crossOrigin);
      preconnectAs("preconnect", href, crossOrigin);
    }
    function preload(href, as, options2) {
      previousDispatcher.L(href, as, options2);
      var ownerDocument = globalDocument;
      if (ownerDocument && href && as) {
        var preloadSelector = 'link[rel="preload"][as="' + escapeSelectorAttributeValueInsideDoubleQuotes(as) + '"]';
        "image" === as ? options2 && options2.imageSrcSet ? (preloadSelector += '[imagesrcset="' + escapeSelectorAttributeValueInsideDoubleQuotes(
          options2.imageSrcSet
        ) + '"]', "string" === typeof options2.imageSizes && (preloadSelector += '[imagesizes="' + escapeSelectorAttributeValueInsideDoubleQuotes(
          options2.imageSizes
        ) + '"]')) : preloadSelector += '[href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"]' : preloadSelector += '[href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"]';
        var key = preloadSelector;
        switch (as) {
          case "style":
            key = getStyleKey(href);
            break;
          case "script":
            key = getScriptKey(href);
        }
        if (!(preloadPropsMap.has(key) || (href = assign(
          {
            rel: "preload",
            href: "image" === as && options2 && options2.imageSrcSet ? void 0 : href,
            as
          },
          options2
        ), preloadPropsMap.set(key, href), null !== ownerDocument.querySelector(preloadSelector) || "style" === as && ownerDocument.querySelector(getStylesheetSelectorFromKey(key)) || "script" === as && ownerDocument.querySelector(getScriptSelectorFromKey(key))))) {
          var instance = ownerDocument.createElement("link");
          setInitialProperties(instance, "link", href);
          "style" === as && (instance[internalLoadPendingKey] = true, instance.onload = instance.onerror = function() {
            clearPendingLoadOnNode(instance);
          });
          markNodeAsHoistable(instance);
          ownerDocument.head.appendChild(instance);
        }
      }
    }
    function preloadModule(href, options2) {
      previousDispatcher.m(href, options2);
      var ownerDocument = globalDocument;
      if (ownerDocument && href) {
        var as = options2 && "string" === typeof options2.as ? options2.as : "script", preloadSelector = 'link[rel="modulepreload"][as="' + escapeSelectorAttributeValueInsideDoubleQuotes(as) + '"][href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"]', key = preloadSelector;
        switch (as) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            key = getScriptKey(href);
        }
        if (!preloadPropsMap.has(key) && (href = assign({ rel: "modulepreload", href }, options2), preloadPropsMap.set(key, href), null === ownerDocument.querySelector(preloadSelector))) {
          switch (as) {
            case "audioworklet":
            case "paintworklet":
            case "serviceworker":
            case "sharedworker":
            case "worker":
            case "script":
              if (ownerDocument.querySelector(getScriptSelectorFromKey(key)))
                return;
          }
          as = ownerDocument.createElement("link");
          setInitialProperties(as, "link", href);
          markNodeAsHoistable(as);
          ownerDocument.head.appendChild(as);
        }
      }
    }
    function preinitStyle(href, precedence, options2) {
      previousDispatcher.S(href, precedence, options2);
      var ownerDocument = globalDocument;
      if (ownerDocument && href) {
        var styles = getResourcesFromRoot(ownerDocument).hoistableStyles, key = getStyleKey(href);
        precedence = precedence || "default";
        var resource = styles.get(key);
        if (!resource) {
          var state = { loading: 0, preload: null };
          if (resource = ownerDocument.querySelector(
            getStylesheetSelectorFromKey(key)
          ))
            state.loading = 5;
          else {
            href = assign(
              { rel: "stylesheet", href, "data-precedence": precedence },
              options2
            );
            (options2 = preloadPropsMap.get(key)) && adoptPreloadPropsForStylesheet(href, options2);
            var link = resource = ownerDocument.createElement("link");
            markNodeAsHoistable(link);
            setInitialProperties(link, "link", href);
            link._p = new Promise(function(resolve, reject) {
              link.onload = resolve;
              link.onerror = reject;
            });
            link.addEventListener("load", function() {
              state.loading |= 1;
            });
            link.addEventListener("error", function() {
              state.loading |= 2;
            });
            state.loading |= 4;
            insertStylesheet(resource, precedence, ownerDocument);
          }
          resource = {
            type: "stylesheet",
            instance: resource,
            count: 1,
            state
          };
          styles.set(key, resource);
        }
      }
    }
    function preinitScript(src, options2) {
      previousDispatcher.X(src, options2);
      var ownerDocument = globalDocument;
      if (ownerDocument && src) {
        var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts, key = getScriptKey(src), resource = scripts.get(key);
        resource || (resource = ownerDocument.querySelector(getScriptSelectorFromKey(key)), resource || (src = assign({ src, async: true }, options2), (options2 = preloadPropsMap.get(key)) && adoptPreloadPropsForScript(src, options2), resource = ownerDocument.createElement("script"), markNodeAsHoistable(resource), setInitialProperties(resource, "link", src), ownerDocument.head.appendChild(resource)),
        resource = {
          type: "script",
          instance: resource,
          count: 1,
          state: null
        }, scripts.set(key, resource));
      }
    }
    function preinitModuleScript(src, options2) {
      previousDispatcher.M(src, options2);
      var ownerDocument = globalDocument;
      if (ownerDocument && src) {
        var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts, key = getScriptKey(src), resource = scripts.get(key);
        resource || (resource = ownerDocument.querySelector(getScriptSelectorFromKey(key)), resource || (src = assign({ src, async: true, type: "module" }, options2), (options2 = preloadPropsMap.get(key)) && adoptPreloadPropsForScript(src, options2), resource = ownerDocument.createElement("script"), markNodeAsHoistable(resource), setInitialProperties(resource, "link", src), ownerDocument.head.appendChild(
        resource)), resource = {
          type: "script",
          instance: resource,
          count: 1,
          state: null
        }, scripts.set(key, resource));
      }
    }
    function getResource(type, currentProps, pendingProps, currentResource) {
      var JSCompiler_inline_result = (JSCompiler_inline_result = rootInstanceStackCursor.current) ? getHoistableRoot(JSCompiler_inline_result) : null;
      if (!JSCompiler_inline_result) throw Error(formatProdErrorMessage(446));
      switch (type) {
        case "meta":
        case "title":
          return null;
        case "style":
          return "string" === typeof pendingProps.precedence && "string" === typeof pendingProps.href ? (pendingProps = getStyleKey(pendingProps.href), currentProps = getResourcesFromRoot(
            JSCompiler_inline_result
          ).hoistableStyles, currentResource = currentProps.get(pendingProps), currentResource || (currentResource = {
            type: "style",
            instance: null,
            count: 0,
            state: null
          }, currentProps.set(pendingProps, currentResource)), currentResource) : { type: "void", instance: null, count: 0, state: null };
        case "link":
          if ("stylesheet" === pendingProps.rel && "string" === typeof pendingProps.href && "string" === typeof pendingProps.precedence) {
            type = getStyleKey(pendingProps.href);
            var styles$268 = getResourcesFromRoot(
              JSCompiler_inline_result
            ).hoistableStyles, resource$269 = styles$268.get(type);
            resource$269 || (JSCompiler_inline_result = JSCompiler_inline_result.ownerDocument || JSCompiler_inline_result, resource$269 = {
              type: "stylesheet",
              instance: null,
              count: 0,
              state: { loading: 0, preload: null }
            }, styles$268.set(type, resource$269), (styles$268 = JSCompiler_inline_result.querySelector(
              getStylesheetSelectorFromKey(type)
            )) ? styles$268._p || (resource$269.instance = styles$268, resource$269.state.loading = 5) : (styles$268 = preloadPropsMap.get(type), styles$268 || (styles$268 = {
              rel: "preload",
              as: "style",
              href: pendingProps.href,
              crossOrigin: pendingProps.crossOrigin,
              integrity: pendingProps.integrity,
              media: pendingProps.media,
              hrefLang: pendingProps.hrefLang,
              referrerPolicy: pendingProps.referrerPolicy
            }, preloadPropsMap.set(type, styles$268)), preloadStylesheet(
              JSCompiler_inline_result,
              type,
              styles$268,
              resource$269.state
            )));
            if (currentProps && null === currentResource)
              throw Error(formatProdErrorMessage(528, ""));
            return resource$269;
          }
          if (currentProps && null !== currentResource)
            throw Error(formatProdErrorMessage(529, ""));
          return null;
        case "script":
          return currentProps = pendingProps.async, pendingProps = pendingProps.src, "string" === typeof pendingProps && currentProps && "function" !== typeof currentProps && "symbol" !== typeof currentProps ? (pendingProps = getScriptKey(pendingProps), currentProps = getResourcesFromRoot(
            JSCompiler_inline_result
          ).hoistableScripts, currentResource = currentProps.get(pendingProps), currentResource || (currentResource = {
            type: "script",
            instance: null,
            count: 0,
            state: null
          }, currentProps.set(pendingProps, currentResource)), currentResource) : { type: "void", instance: null, count: 0, state: null };
        default:
          throw Error(formatProdErrorMessage(444, type));
      }
    }
    function getStyleKey(href) {
      return 'href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"';
    }
    function getStylesheetSelectorFromKey(key) {
      return 'link[rel="stylesheet"][' + key + "]";
    }
    function stylesheetPropsFromRawProps(rawProps) {
      return assign({}, rawProps, {
        "data-precedence": rawProps.precedence,
        precedence: null
      });
    }
    function preloadStylesheet(ownerDocument, key, preloadProps, state) {
      if (key = ownerDocument.querySelector(
        'link[rel="preload"][as="style"][' + key + "]"
      )) {
        if (true !== key[internalLoadPendingKey]) {
          state.loading = 1;
          return;
        }
      } else
        key = ownerDocument.createElement("link"), key[internalLoadPendingKey] = true, key.onload = key.onerror = clearPendingLoadOnNode.bind(null, key), setInitialProperties(key, "link", preloadProps), markNodeAsHoistable(key), ownerDocument.head.appendChild(key);
      state.preload = key;
      key.addEventListener("load", function() {
        return state.loading |= 1;
      });
      key.addEventListener("error", function() {
        return state.loading |= 2;
      });
    }
    function getScriptKey(src) {
      return '[src="' + escapeSelectorAttributeValueInsideDoubleQuotes(src) + '"]';
    }
    function getScriptSelectorFromKey(key) {
      return "script[async]" + key;
    }
    function acquireResource(hoistableRoot, resource, props) {
      resource.count++;
      if (null === resource.instance)
        switch (resource.type) {
          case "style":
            var instance = hoistableRoot.querySelector(
              'style[data-href~="' + escapeSelectorAttributeValueInsideDoubleQuotes(props.href) + '"]'
            );
            if (instance)
              return resource.instance = instance, markNodeAsHoistable(instance), instance;
            var styleProps = assign({}, props, {
              "data-href": props.href,
              "data-precedence": props.precedence,
              href: null,
              precedence: null
            });
            instance = (hoistableRoot.ownerDocument || hoistableRoot).createElement(
              "style"
            );
            markNodeAsHoistable(instance);
            setInitialProperties(instance, "style", styleProps);
            insertStylesheet(instance, props.precedence, hoistableRoot);
            return resource.instance = instance;
          case "stylesheet":
            styleProps = getStyleKey(props.href);
            var instance$274 = hoistableRoot.querySelector(
              getStylesheetSelectorFromKey(styleProps)
            );
            if (instance$274)
              return resource.state.loading |= 4, resource.instance = instance$274, markNodeAsHoistable(instance$274), instance$274;
            instance = stylesheetPropsFromRawProps(props);
            (styleProps = preloadPropsMap.get(styleProps)) && adoptPreloadPropsForStylesheet(instance, styleProps);
            instance$274 = (hoistableRoot.ownerDocument || hoistableRoot).createElement("link");
            markNodeAsHoistable(instance$274);
            var linkInstance = instance$274;
            linkInstance._p = new Promise(function(resolve, reject) {
              linkInstance.onload = resolve;
              linkInstance.onerror = reject;
            });
            setInitialProperties(instance$274, "link", instance);
            resource.state.loading |= 4;
            insertStylesheet(instance$274, props.precedence, hoistableRoot);
            return resource.instance = instance$274;
          case "script":
            instance$274 = getScriptKey(props.src);
            if (styleProps = hoistableRoot.querySelector(
              getScriptSelectorFromKey(instance$274)
            ))
              return resource.instance = styleProps, markNodeAsHoistable(styleProps), styleProps;
            instance = props;
            if (styleProps = preloadPropsMap.get(instance$274))
              instance = assign({}, props), adoptPreloadPropsForScript(instance, styleProps);
            hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
            styleProps = hoistableRoot.createElement("script");
            markNodeAsHoistable(styleProps);
            setInitialProperties(styleProps, "link", instance);
            hoistableRoot.head.appendChild(styleProps);
            return resource.instance = styleProps;
          case "void":
            return null;
          default:
            throw Error(formatProdErrorMessage(443, resource.type));
        }
      else
        "stylesheet" === resource.type && 0 === (resource.state.loading & 4) && (instance = resource.instance, resource.state.loading |= 4, insertStylesheet(instance, props.precedence, hoistableRoot));
      return resource.instance;
    }
    function insertStylesheet(instance, precedence, root2) {
      for (var nodes = root2.querySelectorAll(
        'link[rel="stylesheet"][data-precedence],style[data-precedence]'
      ), last = nodes.length ? nodes[nodes.length - 1] : null, prior = last, i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (node.dataset.precedence === precedence) prior = node;
        else if (prior !== last) break;
      }
      prior ? prior.parentNode.insertBefore(instance, prior.nextSibling) : (precedence = 9 === root2.nodeType ? root2.head : root2, precedence.insertBefore(instance, precedence.firstChild));
    }
    function adoptPreloadPropsForStylesheet(stylesheetProps, preloadProps) {
      null == stylesheetProps.crossOrigin && (stylesheetProps.crossOrigin = preloadProps.crossOrigin);
      null == stylesheetProps.referrerPolicy && (stylesheetProps.referrerPolicy = preloadProps.referrerPolicy);
      null == stylesheetProps.title && (stylesheetProps.title = preloadProps.title);
    }
    function adoptPreloadPropsForScript(scriptProps, preloadProps) {
      null == scriptProps.crossOrigin && (scriptProps.crossOrigin = preloadProps.crossOrigin);
      null == scriptProps.referrerPolicy && (scriptProps.referrerPolicy = preloadProps.referrerPolicy);
      null == scriptProps.integrity && (scriptProps.integrity = preloadProps.integrity);
    }
    var tagCaches = null;
    function getHydratableHoistableCache(type, keyAttribute, ownerDocument) {
      if (null === tagCaches) {
        var cache = /* @__PURE__ */ new Map();
        var caches = tagCaches = /* @__PURE__ */ new Map();
        caches.set(ownerDocument, cache);
      } else
        caches = tagCaches, cache = caches.get(ownerDocument), cache || (cache = /* @__PURE__ */ new Map(), caches.set(ownerDocument, cache));
      if (cache.has(type)) return cache;
      cache.set(type, null);
      ownerDocument = ownerDocument.getElementsByTagName(type);
      for (caches = 0; caches < ownerDocument.length; caches++) {
        var node = ownerDocument[caches];
        if (!(node[internalHoistableMarker] || node[internalInstanceKey] || "link" === type && "stylesheet" === node.getAttribute("rel")) && "http://www.w3.org/2000/svg" !== node.namespaceURI) {
          var nodeKey = node.getAttribute(keyAttribute) || "";
          nodeKey = type + nodeKey;
          var existing = cache.get(nodeKey);
          existing ? existing.push(node) : cache.set(nodeKey, [node]);
        }
      }
      return cache;
    }
    function mountHoistable(hoistableRoot, type, instance) {
      hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
      hoistableRoot.head.insertBefore(
        instance,
        "title" === type ? hoistableRoot.querySelector("head > title") : null
      );
    }
    function isHostHoistableType(type, props, hostContext) {
      if (1 === hostContext || null != props.itemProp) return false;
      switch (type) {
        case "meta":
        case "title":
          return true;
        case "style":
          if ("string" !== typeof props.precedence || "string" !== typeof props.href || "" === props.href)
            break;
          return true;
        case "link":
          if ("string" !== typeof props.rel || "string" !== typeof props.href || "" === props.href || props.onLoad || props.onError)
            break;
          switch (props.rel) {
            case "stylesheet":
              return type = props.disabled, "string" === typeof props.precedence && null == type;
            default:
              return true;
          }
        case "script":
          if (props.async && "function" !== typeof props.async && "symbol" !== typeof props.async && !props.onLoad && !props.onError && props.src && "string" === typeof props.src)
            return true;
      }
      return false;
    }
    function maySuspendCommit(type, props) {
      return "img" === type && null != props.src && "" !== props.src && null == props.onLoad && "lazy" !== props.loading;
    }
    function preloadResource(resource) {
      return "stylesheet" === resource.type && 0 === (resource.state.loading & 3) ? false : true;
    }
    function estimateImageBytes(instance) {
      return (instance.width || 100) * (instance.height || 100) * ("number" === typeof devicePixelRatio ? devicePixelRatio : 1) * 0.25;
    }
    function suspendInstance(state, instance) {
      "function" === typeof instance.decode && (state.imgCount++, instance.complete || (state.imgBytes += estimateImageBytes(instance), state.suspenseyImages.push(instance)), state = onUnsuspendImg.bind(state), instance.decode().then(state, state));
    }
    function suspendResource(state, hoistableRoot, resource, props) {
      if ("stylesheet" === resource.type && ("string" !== typeof props.media || false !== matchMedia(props.media).matches) && 0 === (resource.state.loading & 4)) {
        if (null === resource.instance) {
          var key = getStyleKey(props.href), instance = hoistableRoot.querySelector(
            getStylesheetSelectorFromKey(key)
          );
          if (instance) {
            hoistableRoot = instance._p;
            null !== hoistableRoot && "object" === typeof hoistableRoot && "function" === typeof hoistableRoot.then && (state.count++, state = onUnsuspend.bind(state), hoistableRoot.then(state, state));
            resource.state.loading |= 4;
            resource.instance = instance;
            markNodeAsHoistable(instance);
            return;
          }
          instance = hoistableRoot.ownerDocument || hoistableRoot;
          props = stylesheetPropsFromRawProps(props);
          (key = preloadPropsMap.get(key)) && adoptPreloadPropsForStylesheet(props, key);
          instance = instance.createElement("link");
          markNodeAsHoistable(instance);
          var linkInstance = instance;
          linkInstance._p = new Promise(function(resolve, reject) {
            linkInstance.onload = resolve;
            linkInstance.onerror = reject;
          });
          setInitialProperties(instance, "link", props);
          resource.instance = instance;
        }
        null === state.stylesheets && (state.stylesheets = /* @__PURE__ */ new Map());
        state.stylesheets.set(resource, hoistableRoot);
        (hoistableRoot = resource.state.preload) && 0 === (resource.state.loading & 3) && (state.count++, resource = onUnsuspend.bind(state), hoistableRoot.addEventListener("load", resource), hoistableRoot.addEventListener("error", resource));
      }
    }
    var estimatedBytesWithinLimit = 0;
    function waitForCommitToBeReady(state, timeoutOffset) {
      state.stylesheets && 0 === state.count && insertSuspendedStylesheets(state, state.stylesheets);
      return 0 < state.count || 0 < state.imgCount ? function(commit) {
        var stylesheetTimer = setTimeout(function() {
          state.stylesheets && insertSuspendedStylesheets(state, state.stylesheets);
          if (state.unsuspend) {
            var unsuspend = state.unsuspend;
            state.unsuspend = null;
            unsuspend();
          }
        }, 6e4 + timeoutOffset);
        0 < state.imgBytes && 0 === estimatedBytesWithinLimit && (estimatedBytesWithinLimit = 62500 * estimateBandwidth());
        var imgTimer = setTimeout(
          function() {
            state.waitingForImages = false;
            if (0 === state.count && (state.stylesheets && insertSuspendedStylesheets(state, state.stylesheets), state.unsuspend)) {
              var unsuspend = state.unsuspend;
              state.unsuspend = null;
              unsuspend();
            }
          },
          (state.imgBytes > estimatedBytesWithinLimit ? 50 : 800) + timeoutOffset
        );
        state.unsuspend = commit;
        return function() {
          state.unsuspend = null;
          clearTimeout(stylesheetTimer);
          clearTimeout(imgTimer);
        };
      } : null;
    }
    function checkIfFullyUnsuspended(state) {
      if (0 === state.count && (0 === state.imgCount || !state.waitingForImages)) {
        if (state.stylesheets) insertSuspendedStylesheets(state, state.stylesheets);
        else if (state.unsuspend) {
          var unsuspend = state.unsuspend;
          state.unsuspend = null;
          unsuspend();
        }
      }
    }
    function onUnsuspend() {
      this.count--;
      checkIfFullyUnsuspended(this);
    }
    function onUnsuspendImg() {
      this.imgCount--;
      checkIfFullyUnsuspended(this);
    }
    var precedencesByRoot = null;
    function insertSuspendedStylesheets(state, resources) {
      state.stylesheets = null;
      null !== state.unsuspend && (state.count++, precedencesByRoot = /* @__PURE__ */ new Map(), resources.forEach(insertStylesheetIntoRoot, state), precedencesByRoot = null, onUnsuspend.call(state));
    }
    function insertStylesheetIntoRoot(root2, resource) {
      if (!(resource.state.loading & 4)) {
        var precedences = precedencesByRoot.get(root2);
        if (precedences) var last = precedences.get(null);
        else {
          precedences = /* @__PURE__ */ new Map();
          precedencesByRoot.set(root2, precedences);
          for (var nodes = root2.querySelectorAll(
            "link[data-precedence],style[data-precedence]"
          ), i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if ("LINK" === node.nodeName || "not all" !== node.getAttribute("media"))
              precedences.set(node.dataset.precedence, node), last = node;
          }
          last && precedences.set(null, last);
        }
        nodes = resource.instance;
        node = nodes.getAttribute("data-precedence");
        i = precedences.get(node) || last;
        i === last && precedences.set(null, nodes);
        precedences.set(node, nodes);
        this.count++;
        last = onUnsuspend.bind(this);
        nodes.addEventListener("load", last);
        nodes.addEventListener("error", last);
        i ? i.parentNode.insertBefore(nodes, i.nextSibling) : (root2 = 9 === root2.nodeType ? root2.head : root2, root2.insertBefore(nodes, root2.firstChild));
        resource.state.loading |= 4;
      }
    }
    var HostTransitionContext = {
      $$typeof: REACT_CONTEXT_TYPE,
      Provider: null,
      Consumer: null,
      _currentValue: sharedNotPendingObject,
      _currentValue2: sharedNotPendingObject,
      _threadCount: 0
    };
    function FiberRootNode(containerInfo, tag, hydrate, identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator, formState) {
      this.tag = 1;
      this.containerInfo = containerInfo;
      this.pingCache = this.current = this.pendingChildren = null;
      this.timeoutHandle = -1;
      this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null;
      this.callbackPriority = 0;
      this.expirationTimes = createLaneMap(-1);
      this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0;
      this.entanglements = createLaneMap(0);
      this.hiddenUpdates = createLaneMap(null);
      this.identifierPrefix = identifierPrefix;
      this.onUncaughtError = onUncaughtError;
      this.onCaughtError = onCaughtError;
      this.onRecoverableError = onRecoverableError;
      this.pooledCache = null;
      this.pooledCacheLanes = 0;
      this.formState = formState;
      this.transitionTypes = null;
      this.incompleteTransitions = /* @__PURE__ */ new Map();
    }
    function createFiberRoot(containerInfo, tag, hydrate, initialChildren, hydrationCallbacks, isStrictMode, identifierPrefix, formState, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator) {
      containerInfo = new FiberRootNode(
        containerInfo,
        tag,
        hydrate,
        identifierPrefix,
        onUncaughtError,
        onCaughtError,
        onRecoverableError,
        onDefaultTransitionIndicator,
        formState
      );
      tag = 1;
      true === isStrictMode && (tag |= 24);
      isStrictMode = createFiberImplClass(3, null, null, tag);
      containerInfo.current = isStrictMode;
      isStrictMode.stateNode = containerInfo;
      tag = createCache();
      tag.refCount++;
      containerInfo.pooledCache = tag;
      tag.refCount++;
      isStrictMode.memoizedState = {
        element: initialChildren,
        isDehydrated: hydrate,
        cache: tag
      };
      initializeUpdateQueue(isStrictMode);
      return containerInfo;
    }
    function getContextForSubtree(parentComponent) {
      if (!parentComponent) return emptyContextObject;
      parentComponent = emptyContextObject;
      return parentComponent;
    }
    function updateContainerImpl(rootFiber, lane, element, container, parentComponent, callback) {
      parentComponent = getContextForSubtree(parentComponent);
      null === container.context ? container.context = parentComponent : container.pendingContext = parentComponent;
      container = createUpdate(lane);
      container.payload = { element };
      callback = void 0 === callback ? null : callback;
      null !== callback && (container.callback = callback);
      element = enqueueUpdate(rootFiber, container, lane);
      null !== element && (scheduleUpdateOnFiber(element, rootFiber, lane), entangleTransitions(element, rootFiber, lane));
    }
    function markRetryLaneImpl(fiber, retryLane) {
      fiber = fiber.memoizedState;
      if (null !== fiber && null !== fiber.dehydrated) {
        var a = fiber.retryLane;
        fiber.retryLane = 0 !== a && a < retryLane ? a : retryLane;
      }
    }
    function markRetryLaneIfNotHydrated(fiber, retryLane) {
      markRetryLaneImpl(fiber, retryLane);
      (fiber = fiber.alternate) && markRetryLaneImpl(fiber, retryLane);
    }
    function attemptContinuousHydration(fiber) {
      if (13 === fiber.tag || 31 === fiber.tag) {
        var root2 = enqueueConcurrentRenderForLane(fiber, 67108864);
        null !== root2 && scheduleUpdateOnFiber(root2, fiber, 67108864);
        markRetryLaneIfNotHydrated(fiber, 67108864);
      }
    }
    function attemptHydrationAtCurrentPriority(fiber) {
      if (13 === fiber.tag || 31 === fiber.tag) {
        var lane = requestUpdateLane();
        lane = getBumpedLaneForHydrationByLane(lane);
        var root2 = enqueueConcurrentRenderForLane(fiber, lane);
        null !== root2 && scheduleUpdateOnFiber(root2, fiber, lane);
        markRetryLaneIfNotHydrated(fiber, lane);
      }
    }
    var _enabled = true;
    function dispatchDiscreteEvent(domEventName, eventSystemFlags, container, nativeEvent) {
      var prevTransition = ReactSharedInternals.T;
      ReactSharedInternals.T = null;
      var previousPriority = ReactDOMSharedInternals.p;
      try {
        ReactDOMSharedInternals.p = 2, dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
      } finally {
        ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition;
      }
    }
    function dispatchContinuousEvent(domEventName, eventSystemFlags, container, nativeEvent) {
      var prevTransition = ReactSharedInternals.T;
      ReactSharedInternals.T = null;
      var previousPriority = ReactDOMSharedInternals.p;
      try {
        ReactDOMSharedInternals.p = 8, dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
      } finally {
        ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition;
      }
    }
    function dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
      if (_enabled) {
        var blockedOn = findInstanceBlockingEvent(nativeEvent);
        if (null === blockedOn)
          dispatchEventForPluginEventSystem(
            domEventName,
            eventSystemFlags,
            nativeEvent,
            return_targetInst,
            targetContainer
          ), clearIfContinuousEvent(domEventName, nativeEvent);
        else if (queueIfContinuousEvent(
          blockedOn,
          domEventName,
          eventSystemFlags,
          targetContainer,
          nativeEvent
        ))
          nativeEvent.stopPropagation();
        else if (clearIfContinuousEvent(domEventName, nativeEvent), eventSystemFlags & 4 && -1 < discreteReplayableEvents.indexOf(domEventName)) {
          for (; null !== blockedOn; ) {
            var fiber = getInstanceFromNode(blockedOn);
            if (null !== fiber)
              switch (fiber.tag) {
                case 3:
                  fiber = fiber.stateNode;
                  if (fiber.current.memoizedState.isDehydrated) {
                    var lanes = getHighestPriorityLanes(fiber.pendingLanes);
                    if (0 !== lanes) {
                      var root2 = fiber;
                      root2.pendingLanes |= 2;
                      for (root2.entangledLanes |= 2; lanes; ) {
                        var lane = 1 << 31 - clz32(lanes);
                        root2.entanglements[1] |= lane;
                        lanes &= ~lane;
                      }
                      ensureRootIsScheduled(fiber);
                      0 === (executionContext & 6) && (workInProgressRootRenderTargetTime = now() + 500, flushSyncWorkAcrossRoots_impl(0, false));
                    }
                  }
                  break;
                case 31:
                case 13:
                  root2 = enqueueConcurrentRenderForLane(fiber, 2), null !== root2 && scheduleUpdateOnFiber(root2, fiber, 2), flushSyncWork$1(), markRetryLaneIfNotHydrated(fiber, 2);
              }
            fiber = findInstanceBlockingEvent(nativeEvent);
            null === fiber && dispatchEventForPluginEventSystem(
              domEventName,
              eventSystemFlags,
              nativeEvent,
              return_targetInst,
              targetContainer
            );
            if (fiber === blockedOn) break;
            blockedOn = fiber;
          }
          null !== blockedOn && nativeEvent.stopPropagation();
        } else
          dispatchEventForPluginEventSystem(
            domEventName,
            eventSystemFlags,
            nativeEvent,
            null,
            targetContainer
          );
      }
    }
    function findInstanceBlockingEvent(nativeEvent) {
      nativeEvent = getEventTarget(nativeEvent);
      return findInstanceBlockingTarget(nativeEvent);
    }
    var return_targetInst = null;
    function findInstanceBlockingTarget(targetNode) {
      return_targetInst = null;
      targetNode = getClosestInstanceFromNode(targetNode);
      if (null !== targetNode) {
        var nearestMounted = getNearestMountedFiber(targetNode);
        if (null === nearestMounted) targetNode = null;
        else {
          var tag = nearestMounted.tag;
          if (13 === tag) {
            targetNode = getSuspenseInstanceFromFiber(nearestMounted);
            if (null !== targetNode) return targetNode;
            targetNode = null;
          } else if (31 === tag) {
            targetNode = getActivityInstanceFromFiber(nearestMounted);
            if (null !== targetNode) return targetNode;
            targetNode = null;
          } else if (3 === tag) {
            if (nearestMounted.stateNode.current.memoizedState.isDehydrated)
              return 3 === nearestMounted.tag ? nearestMounted.stateNode.containerInfo : null;
            targetNode = null;
          } else nearestMounted !== targetNode && (targetNode = null);
        }
      }
      return_targetInst = targetNode;
      return null;
    }
    function getEventPriority(domEventName) {
      switch (domEventName) {
        case "beforetoggle":
        case "cancel":
        case "click":
        case "close":
        case "contextmenu":
        case "copy":
        case "cut":
        case "auxclick":
        case "dblclick":
        case "dragend":
        case "dragstart":
        case "drop":
        case "focusin":
        case "focusout":
        case "input":
        case "invalid":
        case "keydown":
        case "keypress":
        case "keyup":
        case "mousedown":
        case "mouseup":
        case "paste":
        case "pause":
        case "play":
        case "pointercancel":
        case "pointerdown":
        case "pointerup":
        case "ratechange":
        case "reset":
        case "seeked":
        case "submit":
        case "toggle":
        case "touchcancel":
        case "touchend":
        case "touchstart":
        case "volumechange":
        case "change":
        case "selectionchange":
        case "textInput":
        case "compositionstart":
        case "compositionend":
        case "compositionupdate":
        case "beforeblur":
        case "afterblur":
        case "beforeinput":
        case "blur":
        case "fullscreenchange":
        case "fullscreenerror":
        case "focus":
        case "hashchange":
        case "popstate":
        case "select":
        case "selectstart":
          return 2;
        case "drag":
        case "dragenter":
        case "dragexit":
        case "dragleave":
        case "dragover":
        case "mousemove":
        case "mouseout":
        case "mouseover":
        case "pointermove":
        case "pointerout":
        case "pointerover":
        case "resize":
        case "scroll":
        case "touchmove":
        case "wheel":
        case "mouseenter":
        case "mouseleave":
        case "pointerenter":
        case "pointerleave":
          return 8;
        case "message":
          switch (getCurrentPriorityLevel()) {
            case ImmediatePriority:
              return 2;
            case UserBlockingPriority:
              return 8;
            case NormalPriority$1:
            case LowPriority:
              return 32;
            case IdlePriority:
              return 268435456;
            default:
              return 32;
          }
        default:
          return 32;
      }
    }
    var hasScheduledReplayAttempt = false;
    var queuedFocus = null;
    var queuedDrag = null;
    var queuedMouse = null;
    var queuedPointers = /* @__PURE__ */ new Map();
    var queuedPointerCaptures = /* @__PURE__ */ new Map();
    var queuedExplicitHydrationTargets = [];
    var discreteReplayableEvents = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
      " "
    );
    function clearIfContinuousEvent(domEventName, nativeEvent) {
      switch (domEventName) {
        case "focusin":
        case "focusout":
          queuedFocus = null;
          break;
        case "dragenter":
        case "dragleave":
          queuedDrag = null;
          break;
        case "mouseover":
        case "mouseout":
          queuedMouse = null;
          break;
        case "pointerover":
        case "pointerout":
          queuedPointers.delete(nativeEvent.pointerId);
          break;
        case "gotpointercapture":
        case "lostpointercapture":
          queuedPointerCaptures.delete(nativeEvent.pointerId);
      }
    }
    function accumulateOrCreateContinuousQueuedReplayableEvent(existingQueuedEvent, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
      if (null === existingQueuedEvent || existingQueuedEvent.nativeEvent !== nativeEvent)
        return existingQueuedEvent = {
          blockedOn,
          domEventName,
          eventSystemFlags,
          nativeEvent,
          targetContainers: [targetContainer]
        }, null !== blockedOn && (blockedOn = getInstanceFromNode(blockedOn), null !== blockedOn && attemptContinuousHydration(blockedOn)), existingQueuedEvent;
      existingQueuedEvent.eventSystemFlags |= eventSystemFlags;
      blockedOn = existingQueuedEvent.targetContainers;
      null !== targetContainer && -1 === blockedOn.indexOf(targetContainer) && blockedOn.push(targetContainer);
      return existingQueuedEvent;
    }
    function queueIfContinuousEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
      switch (domEventName) {
        case "focusin":
          return queuedFocus = accumulateOrCreateContinuousQueuedReplayableEvent(
            queuedFocus,
            blockedOn,
            domEventName,
            eventSystemFlags,
            targetContainer,
            nativeEvent
          ), true;
        case "dragenter":
          return queuedDrag = accumulateOrCreateContinuousQueuedReplayableEvent(
            queuedDrag,
            blockedOn,
            domEventName,
            eventSystemFlags,
            targetContainer,
            nativeEvent
          ), true;
        case "mouseover":
          return queuedMouse = accumulateOrCreateContinuousQueuedReplayableEvent(
            queuedMouse,
            blockedOn,
            domEventName,
            eventSystemFlags,
            targetContainer,
            nativeEvent
          ), true;
        case "pointerover":
          var pointerId = nativeEvent.pointerId;
          queuedPointers.set(
            pointerId,
            accumulateOrCreateContinuousQueuedReplayableEvent(
              queuedPointers.get(pointerId) || null,
              blockedOn,
              domEventName,
              eventSystemFlags,
              targetContainer,
              nativeEvent
            )
          );
          return true;
        case "gotpointercapture":
          return pointerId = nativeEvent.pointerId, queuedPointerCaptures.set(
            pointerId,
            accumulateOrCreateContinuousQueuedReplayableEvent(
              queuedPointerCaptures.get(pointerId) || null,
              blockedOn,
              domEventName,
              eventSystemFlags,
              targetContainer,
              nativeEvent
            )
          ), true;
      }
      return false;
    }
    function attemptExplicitHydrationTarget(queuedTarget) {
      var targetInst = getClosestInstanceFromNode(queuedTarget.target);
      if (null !== targetInst) {
        var nearestMounted = getNearestMountedFiber(targetInst);
        if (null !== nearestMounted) {
          if (targetInst = nearestMounted.tag, 13 === targetInst) {
            if (targetInst = getSuspenseInstanceFromFiber(nearestMounted), null !== targetInst) {
              queuedTarget.blockedOn = targetInst;
              runWithPriority(queuedTarget.priority, function() {
                attemptHydrationAtCurrentPriority(nearestMounted);
              });
              return;
            }
          } else if (31 === targetInst) {
            if (targetInst = getActivityInstanceFromFiber(nearestMounted), null !== targetInst) {
              queuedTarget.blockedOn = targetInst;
              runWithPriority(queuedTarget.priority, function() {
                attemptHydrationAtCurrentPriority(nearestMounted);
              });
              return;
            }
          } else if (3 === targetInst && nearestMounted.stateNode.current.memoizedState.isDehydrated) {
            queuedTarget.blockedOn = 3 === nearestMounted.tag ? nearestMounted.stateNode.containerInfo : null;
            return;
          }
        }
      }
      queuedTarget.blockedOn = null;
    }
    function attemptReplayContinuousQueuedEvent(queuedEvent) {
      if (null !== queuedEvent.blockedOn) return false;
      for (var targetContainers = queuedEvent.targetContainers; 0 < targetContainers.length; ) {
        var nextBlockedOn = findInstanceBlockingEvent(queuedEvent.nativeEvent);
        if (null === nextBlockedOn) {
          nextBlockedOn = queuedEvent.nativeEvent;
          var nativeEventClone = new nextBlockedOn.constructor(
            nextBlockedOn.type,
            nextBlockedOn
          );
          currentReplayingEvent = nativeEventClone;
          nextBlockedOn.target.dispatchEvent(nativeEventClone);
          currentReplayingEvent = null;
        } else
          return targetContainers = getInstanceFromNode(nextBlockedOn), null !== targetContainers && attemptContinuousHydration(targetContainers), queuedEvent.blockedOn = nextBlockedOn, false;
        targetContainers.shift();
      }
      return true;
    }
    function attemptReplayContinuousQueuedEventInMap(queuedEvent, key, map) {
      attemptReplayContinuousQueuedEvent(queuedEvent) && map.delete(key);
    }
    function replayUnblockedEvents() {
      hasScheduledReplayAttempt = false;
      null !== queuedFocus && attemptReplayContinuousQueuedEvent(queuedFocus) && (queuedFocus = null);
      null !== queuedDrag && attemptReplayContinuousQueuedEvent(queuedDrag) && (queuedDrag = null);
      null !== queuedMouse && attemptReplayContinuousQueuedEvent(queuedMouse) && (queuedMouse = null);
      queuedPointers.forEach(attemptReplayContinuousQueuedEventInMap);
      queuedPointerCaptures.forEach(attemptReplayContinuousQueuedEventInMap);
    }
    function scheduleCallbackIfUnblocked(queuedEvent, unblocked) {
      queuedEvent.blockedOn === unblocked && (queuedEvent.blockedOn = null, hasScheduledReplayAttempt || (hasScheduledReplayAttempt = true, Scheduler.unstable_scheduleCallback(
        Scheduler.unstable_NormalPriority,
        replayUnblockedEvents
      )));
    }
    var lastScheduledReplayQueue = null;
    function scheduleReplayQueueIfNeeded(formReplayingQueue) {
      lastScheduledReplayQueue !== formReplayingQueue && (lastScheduledReplayQueue = formReplayingQueue, Scheduler.unstable_scheduleCallback(
        Scheduler.unstable_NormalPriority,
        function() {
          lastScheduledReplayQueue === formReplayingQueue && (lastScheduledReplayQueue = null);
          for (var i = 0; i < formReplayingQueue.length; i += 3) {
            var form = formReplayingQueue[i], submitterOrAction = formReplayingQueue[i + 1], formData = formReplayingQueue[i + 2];
            if ("function" !== typeof submitterOrAction)
              if (null === findInstanceBlockingTarget(submitterOrAction || form))
                continue;
              else break;
            var formInst = getInstanceFromNode(form);
            null !== formInst && (formReplayingQueue.splice(i, 3), i -= 3, startHostTransition(
              formInst,
              {
                pending: true,
                data: formData,
                method: form.method,
                action: submitterOrAction
              },
              submitterOrAction,
              formData
            ));
          }
        }
      ));
    }
    function retryIfBlockedOn(unblocked) {
      function unblock(queuedEvent) {
        return scheduleCallbackIfUnblocked(queuedEvent, unblocked);
      }
      null !== queuedFocus && scheduleCallbackIfUnblocked(queuedFocus, unblocked);
      null !== queuedDrag && scheduleCallbackIfUnblocked(queuedDrag, unblocked);
      null !== queuedMouse && scheduleCallbackIfUnblocked(queuedMouse, unblocked);
      queuedPointers.forEach(unblock);
      queuedPointerCaptures.forEach(unblock);
      for (var i = 0; i < queuedExplicitHydrationTargets.length; i++) {
        var queuedTarget = queuedExplicitHydrationTargets[i];
        queuedTarget.blockedOn === unblocked && (queuedTarget.blockedOn = null);
      }
      for (; 0 < queuedExplicitHydrationTargets.length && (i = queuedExplicitHydrationTargets[0], null === i.blockedOn); )
        attemptExplicitHydrationTarget(i), null === i.blockedOn && queuedExplicitHydrationTargets.shift();
      i = (unblocked.ownerDocument || unblocked).$$reactFormReplay;
      if (null != i)
        for (queuedTarget = 0; queuedTarget < i.length; queuedTarget += 3) {
          var form = i[queuedTarget], submitterOrAction = i[queuedTarget + 1], formProps = form[internalPropsKey] || null;
          if ("function" === typeof submitterOrAction)
            formProps || scheduleReplayQueueIfNeeded(i);
          else if (formProps) {
            var action = null;
            if (submitterOrAction && submitterOrAction.hasAttribute("formAction"))
              if (form = submitterOrAction, formProps = submitterOrAction[internalPropsKey] || null)
                action = formProps.formAction;
              else {
                if (null !== findInstanceBlockingTarget(form)) continue;
              }
            else action = formProps.action;
            "function" === typeof action ? i[queuedTarget + 1] = action : (i.splice(queuedTarget, 3), queuedTarget -= 3);
            scheduleReplayQueueIfNeeded(i);
          }
        }
    }
    function defaultOnDefaultTransitionIndicator() {
      function handleNavigate(event) {
        event.canIntercept && "react-transition" === event.info && event.intercept({
          handler: function() {
            return new Promise(function(resolve) {
              return pendingResolve = resolve;
            });
          },
          focusReset: "manual",
          scroll: "manual"
        });
      }
      function handleNavigateComplete() {
        null !== pendingResolve && (pendingResolve(), pendingResolve = null);
        isCancelled || setTimeout(startFakeNavigation, 20);
      }
      function startFakeNavigation() {
        if (!isCancelled && !navigation.transition) {
          var currentEntry = navigation.currentEntry;
          currentEntry && null != currentEntry.url && navigation.navigate(currentEntry.url, {
            state: currentEntry.getState(),
            info: "react-transition",
            history: "replace"
          });
        }
      }
      if ("object" === typeof navigation) {
        var isCancelled = false, pendingResolve = null;
        navigation.addEventListener("navigate", handleNavigate);
        navigation.addEventListener("navigatesuccess", handleNavigateComplete);
        navigation.addEventListener("navigateerror", handleNavigateComplete);
        setTimeout(startFakeNavigation, 100);
        return function() {
          isCancelled = true;
          navigation.removeEventListener("navigate", handleNavigate);
          navigation.removeEventListener("navigatesuccess", handleNavigateComplete);
          navigation.removeEventListener("navigateerror", handleNavigateComplete);
          null !== pendingResolve && (pendingResolve(), pendingResolve = null);
        };
      }
    }
    function ReactDOMRoot(internalRoot) {
      this._internalRoot = internalRoot;
    }
    ReactDOMHydrationRoot.prototype.render = ReactDOMRoot.prototype.render = function(children) {
      var root2 = this._internalRoot;
      if (null === root2) throw Error(formatProdErrorMessage(409));
      var current = root2.current, lane = requestUpdateLane();
      updateContainerImpl(current, lane, children, root2, null, null);
    };
    ReactDOMHydrationRoot.prototype.unmount = ReactDOMRoot.prototype.unmount = function() {
      var root2 = this._internalRoot;
      if (null !== root2) {
        this._internalRoot = null;
        var container = root2.containerInfo;
        updateContainerImpl(root2.current, 2, null, root2, null, null);
        flushSyncWork$1();
        container[internalContainerInstanceKey] = null;
      }
    };
    function ReactDOMHydrationRoot(internalRoot) {
      this._internalRoot = internalRoot;
    }
    ReactDOMHydrationRoot.prototype.unstable_scheduleHydration = function(target) {
      if (target) {
        var updatePriority = resolveUpdatePriority();
        target = { blockedOn: null, target, priority: updatePriority };
        for (var i = 0; i < queuedExplicitHydrationTargets.length && 0 !== updatePriority && updatePriority < queuedExplicitHydrationTargets[i].priority; i++) ;
        queuedExplicitHydrationTargets.splice(i, 0, target);
        0 === i && attemptExplicitHydrationTarget(target);
      }
    };
    var isomorphicReactPackageVersion$jscomp$inline_2043 = React.version;
    if ("19.3.0" !== isomorphicReactPackageVersion$jscomp$inline_2043)
      throw Error(
        formatProdErrorMessage(
          527,
          isomorphicReactPackageVersion$jscomp$inline_2043,
          "19.3.0"
        )
      );
    ReactDOMSharedInternals.findDOMNode = function(componentOrElement) {
      var fiber = componentOrElement._reactInternals;
      if (void 0 === fiber) {
        if ("function" === typeof componentOrElement.render)
          throw Error(formatProdErrorMessage(188));
        componentOrElement = Object.keys(componentOrElement).join(",");
        throw Error(formatProdErrorMessage(268, componentOrElement));
      }
      componentOrElement = findCurrentFiberUsingSlowPath(fiber);
      componentOrElement = null !== componentOrElement ? findCurrentHostFiberImpl(componentOrElement) : null;
      componentOrElement = null === componentOrElement ? null : componentOrElement.stateNode;
      return componentOrElement;
    };
    var internals$jscomp$inline_2586 = {
      bundleType: 0,
      version: "19.3.0",
      rendererPackageName: "react-dom",
      currentDispatcherRef: ReactSharedInternals,
      reconcilerVersion: "19.3.0"
    };
    if ("undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) {
      hook$jscomp$inline_2587 = __REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (!hook$jscomp$inline_2587.isDisabled && hook$jscomp$inline_2587.supportsFiber)
        try {
          rendererID = hook$jscomp$inline_2587.inject(
            internals$jscomp$inline_2586
          ), injectedHook = hook$jscomp$inline_2587;
        } catch (err) {
        }
    }
    var hook$jscomp$inline_2587;
    exports.createRoot = function(container, options2) {
      if (!isValidContainer(container)) throw Error(formatProdErrorMessage(299));
      var isStrictMode = false, identifierPrefix = "", onUncaughtError = defaultOnUncaughtError, onCaughtError = defaultOnCaughtError, onRecoverableError = defaultOnRecoverableError;
      null !== options2 && void 0 !== options2 && (true === options2.unstable_strictMode && (isStrictMode = true), void 0 !== options2.identifierPrefix && (identifierPrefix = options2.identifierPrefix), void 0 !== options2.onUncaughtError && (onUncaughtError = options2.onUncaughtError), void 0 !== options2.onCaughtError && (onCaughtError = options2.onCaughtError), void 0 !== options2.onRecoverableError &&
      (onRecoverableError = options2.onRecoverableError));
      options2 = createFiberRoot(
        container,
        1,
        false,
        null,
        null,
        isStrictMode,
        identifierPrefix,
        null,
        onUncaughtError,
        onCaughtError,
        onRecoverableError,
        defaultOnDefaultTransitionIndicator
      );
      container[internalContainerInstanceKey] = options2.current;
      listenToAllSupportedEvents(container);
      return new ReactDOMRoot(options2);
    };
    exports.hydrateRoot = function(container, initialChildren, options2) {
      if (!isValidContainer(container)) throw Error(formatProdErrorMessage(299));
      var isStrictMode = false, identifierPrefix = "", onUncaughtError = defaultOnUncaughtError, onCaughtError = defaultOnCaughtError, onRecoverableError = defaultOnRecoverableError, formState = null;
      null !== options2 && void 0 !== options2 && (true === options2.unstable_strictMode && (isStrictMode = true), void 0 !== options2.identifierPrefix && (identifierPrefix = options2.identifierPrefix), void 0 !== options2.onUncaughtError && (onUncaughtError = options2.onUncaughtError), void 0 !== options2.onCaughtError && (onCaughtError = options2.onCaughtError), void 0 !== options2.onRecoverableError &&
      (onRecoverableError = options2.onRecoverableError), void 0 !== options2.formState && (formState = options2.formState));
      initialChildren = createFiberRoot(
        container,
        1,
        true,
        initialChildren,
        null != options2 ? options2 : null,
        isStrictMode,
        identifierPrefix,
        formState,
        onUncaughtError,
        onCaughtError,
        onRecoverableError,
        defaultOnDefaultTransitionIndicator
      );
      initialChildren.context = getContextForSubtree(null);
      options2 = initialChildren.current;
      isStrictMode = requestUpdateLane();
      isStrictMode = getBumpedLaneForHydrationByLane(isStrictMode);
      identifierPrefix = createUpdate(isStrictMode);
      identifierPrefix.callback = null;
      enqueueUpdate(options2, identifierPrefix, isStrictMode);
      options2 = isStrictMode;
      initialChildren.current.lanes = options2;
      markRootUpdated$1(initialChildren, options2);
      ensureRootIsScheduled(initialChildren);
      container[internalContainerInstanceKey] = initialChildren.current;
      listenToAllSupportedEvents(container);
      return new ReactDOMHydrationRoot(initialChildren);
    };
    exports.version = "19.3.0";
  }
});

// node_modules/react-dom/client.js
var require_client = __commonJS({
  "node_modules/react-dom/client.js"(exports, module) {
    "use strict";
    function checkDCE() {
      if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") {
        return;
      }
      if (false) {
        throw new Error("^_^");
      }
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
      } catch (err) {
        console.error(err);
      }
    }
    if (true) {
      checkDCE();
      module.exports = require_react_dom_client_production();
    } else {
      module.exports = null;
    }
  }
});

// node_modules/react/cjs/react-jsx-runtime.production.js
var require_react_jsx_runtime_production = __commonJS({
  "node_modules/react/cjs/react-jsx-runtime.production.js"(exports) {
    "use strict";
    /**
     * @license React
     * react-jsx-runtime.production.js
     *
     * Copyright (c) Meta Platforms, Inc. and affiliates.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */
    var REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("react.transitional.element");
    var REACT_FRAGMENT_TYPE = /* @__PURE__ */ Symbol.for("react.fragment");
    function jsxProd(type, config, maybeKey) {
      var key = null;
      void 0 !== maybeKey && (key = "" + maybeKey);
      void 0 !== config.key && (key = "" + config.key);
      if ("key" in config) {
        maybeKey = {};
        for (var propName in config)
          "key" !== propName && (maybeKey[propName] = config[propName]);
      } else maybeKey = config;
      config = maybeKey.ref;
      return {
        $$typeof: REACT_ELEMENT_TYPE,
        type,
        key,
        ref: void 0 !== config ? config : null,
        props: maybeKey
      };
    }
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.jsx = jsxProd;
    exports.jsxs = jsxProd;
  }
});

// node_modules/react/jsx-runtime.js
var require_jsx_runtime = __commonJS({
  "node_modules/react/jsx-runtime.js"(exports, module) {
    "use strict";
    if (true) {
      module.exports = require_react_jsx_runtime_production();
    } else {
      module.exports = null;
    }
  }
});

// src/embed/styles.js
var CONSTRUCTABLE = typeof CSSStyleSheet === "function" && "replaceSync" in CSSStyleSheet.prototype;
function sheet(css) {
  const s = new CSSStyleSheet();
  s.replaceSync(css);
  return s;
}
function setShadowStyles(shadow, css, nonce) {
  if (CONSTRUCTABLE && "adoptedStyleSheets" in shadow) {
    shadow.adoptedStyleSheets = [sheet(css)];
    return;
  }
  const st = document.createElement("style");
  if (nonce) st.nonce = nonce;
  st.textContent = css;
  shadow.prepend(st);
}
function declareDocumentStyles(id, css, nonce) {
  if (CONSTRUCTABLE && "adoptedStyleSheets" in document) {
    const have = document.adoptedStyleSheets.find((s2) => s2.pwId === id);
    if (have) {
      have.replaceSync(css);
      return;
    }
    const s = sheet(css);
    s.pwId = id;
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, s];
    return;
  }
  let st = document.getElementById(id);
  if (!st) {
    st = document.createElement("style");
    st.id = id;
    if (nonce) st.nonce = nonce;
    document.head.appendChild(st);
  }
  st.textContent = css;
}
function deferStyleAttributes(html) {
  return html.replace(/<[a-zA-Z][^>]*>/g, (tag) => tag.replace(/ style="([^"]*)"/g, ' data-pw-style="$1"'));
}
function applyStyleAttributes(root) {
  for (const el of root.querySelectorAll("[data-pw-style]")) {
    const css = el.getAttribute("data-pw-style") || "";
    el.style.cssText = css;
    el.removeAttribute("data-pw-style");
  }
}

// src/i18n/en.js
var en_default = {
  /* ---- chart gallery (designer) ---- */
  cw_t_column: "Column",
  cw_w_column: "Compare a few categories",
  cw_t_bar: "Bar",
  cw_w_bar: "Rankings, long names",
  cw_t_line: "Line",
  cw_w_line: "A trend over time",
  cw_t_area: "Area",
  cw_w_area: "Volume over time",
  cw_t_pie: "Pie",
  cw_w_pie: "Share of a whole, ≤ 6 slices",
  cw_t_donut: "Donut",
  cw_w_donut: "Share, with the total",
  cw_t_scatter: "Scatter",
  cw_w_scatter: "Two numbers per row",
  cw_t_bubble: "Bubble",
  cw_w_bubble: "Three numbers per row",
  cw_t_radar: "Radar",
  cw_w_radar: "Several measures side by side",
  cw_t_funnel: "Funnel",
  cw_w_funnel: "Stages that narrow",
  cw_t_gauge: "Gauge",
  cw_w_gauge: "One number against a range",
  cw_t_treemap: "Treemap",
  cw_w_treemap: "Share of a whole, many parts",
  cw_t_histogram: "Histogram",
  cw_w_histogram: "How one number is spread",
  cw_t_boxplot: "Box plot",
  cw_w_boxplot: "Spread and outliers per category",
  cw_t_waterfall: "Waterfall",
  cw_w_waterfall: "How a total builds up",
  cw_t_gantt: "Gantt",
  cw_w_gantt: "Tasks from a start to an end date",
  cw_agg_Sum: "Sum",
  cw_agg_Avg: "Average",
  cw_agg_Count: "Count of rows",
  cw_agg_CountDistinct: "Count distinct",
  cw_agg_Min: "Minimum",
  cw_agg_Max: "Maximum",
  cw_titleEdit: "Chart gallery · {name}",
  cw_titleInsert: "Insert a chart",
  cw_empty: "Insert an empty chart",
  cw_cancel: "Cancel",
  cw_apply: "Apply to the chart",
  cw_insert: "Insert chart",
  cw_dataAria: "Data for the chart",
  cw_dataSet: "Data set",
  cw_source: "Source",
  cw_path: "path",
  cw_calling: "Calling the API…",
  cw_callAgain: "Call the API again",
  cw_xNumber: "X axis (a number field)",
  cw_task: "Task (one lane each)",
  cw_category: "Category (x axis or slices)",
  cw_start: "Start",
  cw_end: "End",
  cw_rowValue: "Value of each row",
  cw_value: "Value",
  cw_ofField: "of field",
  cw_bubbleSize: "Bubble size",
  cw_split: "Split into series by (optional)",
  cw_stack: "Stack the series",
  cw_showAtMost: "Show at most",
  cw_allCats: "All categories",
  cw_firstN: "First {n}",
  cw_format: "Number format",
  cw_currency: "Currency",
  cw_percent: "Percent",
  cw_title: "Title",
  cw_optional: "Optional",
  cw_custom: "This chart uses a custom value expression. Applying here replaces it with the choice above.",
  cw_typesAria: "Chart types",
  cw_typeAria: "Chart type",
  cw_noData: "No data yet",
  cw_pickNumber: "Pick a number field for the X axis",
  cw_drawing: "Drawing…",
  cw_suggested: "Suggested",
  cw_preview: "Preview · {type}",
  cw_apiData: "API data · {n} rows",
  cw_apiDataFiltered: "API data · {n} rows (after the data set filters)",
  cw_useValue: "Use {name} as the value",
  cw_useCategory: "Use {name} as the category",
  cw_clickHint: "Click a column name to chart it (numbers become the value, the rest the category).",
  cw_keyCategory: "category",
  cw_keyValue: "value",
  cw_raw: "Raw API response",
  /* ---- viewer ---- */
  parameters: "Parameters",
  documentMap: "Document map",
  run: "Run",
  running: "Running…",
  runningReport: "Running the report…",
  firstPage: "First page",
  previousPage: "Previous page",
  nextPage: "Next page",
  lastPage: "Last page",
  page: "Page",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  fitWidth: "Fit width",
  search: "Search",
  previousMatch: "Previous match",
  nextMatch: "Next match",
  exporting: "Exporting…",
  viewReport: "View report",
  didNotRun: "The report did not run.",
  fontsDidNotLoad: "Some fonts did not load ({fonts}). Text is drawn in a fallback font. Check that the fonts folder is served at fontsUrl.",
  true: "True",
  false: "False",
  commaSeparated: "Values, separated by commas",
  selectAll: "Select all",
  nullValue: "Null (no value)",
  pagesRows: "{pages} pages · {rows} rows · {ms} ms",
  warnings: "{n} warning(s)",
  back: "Back",
  drillDepth: "Drill level {n}",
  liveHint: "Changes apply as you pick them.",
  print: "Print",
  printing: "Preparing…",
  fullScreen: "Full screen",
  exitFullScreen: "Exit full screen",
  viewMode: "View mode",
  single: "Single page",
  continuous: "Continuous",
  galley: "Galley",
  matchCase: "Match case",
  wholeWord: "Whole word",
  allMatches: "List of matches",
  matches: "Matches",
  matchCount: "{n} matches",
  noMatches: "Nothing found.",
  pageShort: "p. {n}",
  more: "More",
  close: "Close",
  from: "from",
  to: "to",
  groupPaging: "Paging",
  groupZoom: "Zoom",
  groupView: "View",
  groupExport: "Export",
  stillRendering: "The rest of the report is still rendering",
  exportFailed: "{fmt} failed: {message}",
  accessSlow: "The server is busy and did not answer in time. Try again.",
  accessUnreadable: "The server's answer had no access list.",
  serverPdfNote: "A large report: the server makes this PDF (much faster than the browser). It opens in a new tab.",
  drillPath: "Drill-through path",
  wordHint: "Text and tables, to edit in Word",
  editInDesigner: "Edit in designer",
  /* ---- designer ---- */
  loadingDesigner: "Loading the designer…",
  reportName: "Report name",
  saving: "Saving…",
  saved: "Saved",
  unsaved: "Unsaved changes",
  undo: "Undo (⌘Z)",
  redo: "Redo (⇧⌘Z)",
  mode: "Mode",
  design: "Design",
  preview: "Preview",
  askAi: "Ask AI",
  askAiHint: "Describe a change and let AI draft it",
  history: "History",
  historyHint: "Saved versions",
  shortcutsHint: "Keyboard shortcuts (?)",
  shortcuts: "Keyboard shortcuts",
  openViewer: "Open viewer",
  openViewerHint: "Opens the saved version",
  save: "Save",
  insert: "Insert",
  toolHint: "Drag onto the page, or click to add it to the body",
  zoom: "Zoom",
  snapToGrid: "Snap to grid",
  units: "Units",
  canvasHint: "Shift+click to add to the selection · drag on empty space to select an area · arrows nudge",
  versionHistory: "Version history",
  versionHint: "Each save keeps the previous version (the last 50). Restoring makes the current version a version too, so you can undo a restore.",
  loading: "Loading…",
  noVersions: "No earlier versions yet. Save a change first.",
  restore: "Restore",
  sc_save: "Save",
  sc_undo: "Undo",
  sc_redo: "Redo",
  sc_copy: "Copy and paste items (works across reports)",
  sc_duplicate: "Duplicate",
  sc_delete: "Delete the selection",
  sc_nudge: "Nudge 1 pt",
  sc_nudge4: "Nudge 4 grid steps",
  sc_toggle: "Add to or remove from the selection",
  sc_marquee: "Select an area",
  sc_guides: "Ignore smart guides",
  sc_clear: "Clear the selection",
  sc_help: "Show this list",
  item_textbox: "Text box",
  item_table: "Table",
  item_image: "Image",
  item_line: "Line",
  item_shape: "Shape",
  item_list: "List",
  item_container: "Container",
  item_chart: "Chart",
  item_matrix: "Matrix",
  item_barcode: "Barcode",
  item_sparkline: "Sparkline",
  item_databar: "Data bar",
  item_bullet: "Bullet",
  item_subreport: "Subreport",
  item_toc: "Table of contents",
  item_field: "Form field",
  item_richtext: "Rich text",
  item_map: "Map",
  item_checkbox: "Check box",
  item_iconset: "Icon set",
  item_rangebar: "Range bar",
  /* ---- designer: parameter dialog ---- */
  paramNew: "New parameter",
  paramTitle: "Parameter {name}",
  name: "Name",
  paramType: "Type",
  prompt: "Prompt",
  defaultValue: "Default",
  defaultHint: "A value or =expression, e.g. =Today()",
  required: "Required",
  paramHidden: "Hidden (set only by URL, API or drill-through)",
  paramNullable: "Allow null",
  paramAllowBlank: "Allow blank text",
  multiHint: "Allow several values (use with the 'in' filter, or Join(Parameters.x))",
  fixedChoices: "Fixed choices (one per line: value or value=label)",
  choicesFrom: "Or choices from a data set",
  valueField: "Value field",
  cascadeHint: "The data set can filter on other parameters (=Parameters.x). The viewer then reloads the choices when those change (cascading).",
  paramNameRule: "The name must start with a letter and hold only letters, digits and _",
  paramNameTaken: "Another parameter has this name",
  useAsA: "Use it in expressions as",
  useAsB: "and in a REST URL as",
  delete: "Delete",
  cancel: "Cancel",
  editor: "Editor in the viewer",
  editor_slider: "Slider",
  editor_range: "Number range",
  editor_dateRange: "Date range",
  editor_radio: "Radio buttons",
  editor_list: "List box",
  editor_toggle: "Switch",
  editorHint_auto: "Standard: a box, a date picker or a drop-down list, from the type and the choices.",
  editorHint_slider: "For a number. Set the minimum, maximum and step.",
  editorHint_range: "Two numbers, from and to. The parameter holds both: Parameters.x[0] and Parameters.x[1].",
  editorHint_dateRange: "Two dates, from and to. The parameter holds both: Parameters.x[0] and Parameters.x[1].",
  editorHint_radio: "One of the choices, all visible at once.",
  editorHint_list: 'A list box. With "several values", the user can pick more than one.',
  editorHint_toggle: "On or off, for a true/false parameter.",
  editorNeedsChoices: "This editor needs choices: fixed choices or a data set.",
  minimum: "Minimum",
  maximum: "Maximum",
  step: "Step",
  panelColumns: "Parameter panel columns",
  panelColumnsHint: "For the whole report: more than one puts the panel above the pages, in a grid.",
  /* ---- home ---- */
  tagline: "Designer · Viewer · Automation API",
  reports: "Reports",
  lede: "Design a report, bind it to data, and get the same pages on screen and in the PDF.",
  itemOne: "1 item",
  itemMany: "{n} items",
  paramOne: "1 parameter",
  paramMany: "{n} parameters",
  savedAgo: "Saved {ago}",
  justNow: "just now",
  view: "View",
  serverPdf: "Server PDF ↗",
  serverPdfHint: "Rendered on the server",
  noReports: "No reports yet.",
  noReportsDesigner: "Name your first report above and press New report.",
  noReportsViewer: "Reports appear here when a designer saves one.",
  newReportName: "New report name",
  newReportPlaceholder: "Name a new report",
  newReport: "New report",
  creating: "Creating…",
  notCreated: "The report was not created: {message}",
  untitled: "Untitled report",
  newDashboard: "New dashboard",
  importHint: "Open an ActiveReportsJS (.rdlx-json), SSRS (.rdl, .rdlc), JasperReports (.jrxml) or BIRT (.rptdesign) file",
  importing: "Importing…",
  importFile: "Import a report file",
  importFileLabel: "Report file to import (ActiveReports, SSRS, JasperReports, BIRT)",
  describeAi: "Describe a report (AI)",
  aiPrompt: "What should the report show?",
  aiPromptPlaceholder: "Monthly sales by region, a column chart, and a table with totals",
  aiSample: "Sample rows as JSON (optional; sent to the AI service)",
  drafting: "Drafting… (up to a minute)",
  draftReport: "Draft the report",
  badSample: "The sample data is not valid JSON.",
  createdWithNotes: "The report was created with {n} note(s):",
  openInDesigner: "Open in the designer",
  firstPageOf: "First page of {name}",
  noPreview: "No preview",
  pageOne: "1 page",
  pageMany: "{n} pages",
  users: "Users",
  signOut: "Sign out",
  /* ---- admin: users ---- */
  signedInAs: "Signed in as {email} ({role})",
  rolesLede: "Viewers view and export reports. Designers also edit reports and preview SQL. Admins also manage users.",
  addUserForm: "Add a user",
  email: "Email",
  role: "Role",
  passwordMin: "Password (at least 10 characters)",
  addUser: "Add user",
  status: "Status",
  actions: "Actions",
  you: "(you)",
  roleOf: "Role of {email}",
  disabled: "Disabled",
  active: "Active",
  newPasswordFor: "New password for {email}",
  savePassword: "Save password",
  resetPassword: "Reset password",
  enable: "Enable",
  disable: "Disable",
  deleteUser: "Delete {email}",
  noUsers: "No users.",
  added: "Added {email} as {role}.",
  passwordSet: "New password set for {email}. Their other sessions are signed out.",
  confirmDelete: "Delete {email}? They can no longer sign in.",
  deleted: "Deleted {email}.",
  nowRole: "{email} is now {role}.",
  isEnabled: "{email} is enabled.",
  isDisabled: "{email} is disabled.",
  /* ---- sign in ---- */
  signIn: "Sign in",
  signingIn: "Signing in…",
  signInLede: "ReportWright reports",
  password: "Password",
  signInFailed: "Sign-in failed (HTTP {status}).",
  signedInAsLong: "You are signed in as",
  continue: "Continue",
  accountsOff: "Accounts are off on this server. Set {setting} to turn them on.",
  noUsersYet: "There are no users yet.",
  firstAdmin: "Create the first admin in one of two ways:",
  firstAdminEnv: "set {email} and {password} and restart the server, then sign in with them; or",
  firstAdminCli: "run {command} in the app folder.",
  /* ---- phase 4: pivot, groups, sections ---- */
  pivotRows: "Rows",
  pivotColumns: "Columns",
  pivotValues: "Values",
  pivotValue: "Value (aggregate)",
  pivotGroupBy: "Group by",
  pivotName: "Name (scope)",
  pivotSort: "Sort",
  pivotTotal: "Total",
  totalNone: "None",
  totalBefore: "Before",
  totalAfter: "After",
  pivotWidth: "Width (pt)",
  pivotLabel: "Label",
  pivotHeader: "Column title",
  pivotCollapsible: "Drill-down: show a toggle",
  pivotStartCollapsed: "Start collapsed",
  pivotFormat: "Format",
  pivotShow: "Show",
  showValue: "Value",
  showPctTotal: "% of total",
  showPctRow: "% of row",
  showPctColumn: "% of column",
  pivotAdd: "Add",
  pivotAddField: "Field to add",
  pivotRemove: "Remove",
  moveUp: "Move up",
  moveDown: "Move down",
  pivotHint: 'Several values sit side by side under each column. Totals use the same formulas. A group name is a scope: Sum(Fields.x, "Region").',
  groupParent: "Parent (recursive hierarchy)",
  groupParentHint: "The parent's id, e.g. =Fields.managerId. Rows then form a tree; Level() is the depth.",
  groupIndent: "Indent per level (pt)",
  groupExpandLevels: "Levels open at the start",
  groupNewSection: "New section: page numbers restart",
  mergeDown: "Merge down",
  splitRows: "Split rows",
  bodySections: "Body sections",
  sectionName: "Section name",
  sectionPageSize: "Page size of this section",
  sectionOrientation: "Orientation of this section",
  sectionPageHint: "Empty: the same as the report page.",
  addSection: "Add a body section",
  removeSection: "Remove this section",
  sectionHint: "Each body section starts on a new page with its own page size; page numbers continue.",
  /* ---- enterprise: folders and permissions ---- */
  allReports: "All reports",
  folders: "Folders",
  folder: "Folder",
  parentFolder: "Inside folder",
  topLevel: "Top level (no folder)",
  newFolder: "New folder",
  newFolderName: "New folder name",
  newFolderPlaceholder: "Name a new folder",
  searchReports: "Search reports",
  noReportMatches: "No report matches your search.",
  emptyFolder: "This folder is empty.",
  share: "Share",
  move: "Move",
  folderAccess: "Folder access",
  topAccess: "Top-level access",
  topAccessHint: 'Reports and folders that inherit get this access. "everyone" is every signed-in user; "public" also includes anonymous embedded viewers.',
  accessOf: "Access: {name}",
  inheritAccess: "Also give the access of the folder above (inherit)",
  peopleAndGroups: "People and groups",
  accessLevel: "Access",
  levelOf: "Access of {name}",
  level_view: "View",
  level_edit: "Edit",
  level_manage: "Manage",
  remove: "Remove",
  removeGrant: "Remove {name}",
  noGrants: "Nobody is listed here.",
  addGrant: "Add",
  grantType: "Who",
  grantUser: "User",
  grantGroup: "Group",
  groupName: "Group name",
  levelsHint: "View: open, run and export. Edit: also change and restore. Manage: also share, move and delete. A user's role still limits this: viewers only view; admins see everything.",
  everyoneGroup: "Everyone (signed in)",
  publicGroup: "Public (also anonymous embeds)",
  deleteReport: "Delete report",
  deleteFolder: "Delete folder",
  confirmDeleteReport: "Delete {name}? Its saved versions stay in the history.",
  confirmDeleteFolder: "Delete the folder {name}? Only an empty folder can be deleted.",
  groups: "Groups",
  groupsOf: "Groups of {email}",
  groupsHint: "finance, sales",
  groupsSaved: "Groups of {email} saved.",
  groupsFromSso: "Set by single sign-on at each sign-in",
  /* ---- enterprise: audit log ---- */
  auditLog: "Audit log",
  auditLede: "Sign-ins, changes, sharing, renders and exports, newest first. Events older than {days} days are removed (PW_AUDIT_RETENTION_DAYS). Parameter values are never stored, only a keyed hash.",
  auditFilters: "Filter the audit log",
  auditFrom: "From",
  auditTo: "To",
  eventType: "Event",
  allEvents: "All events",
  actor: "Who",
  reportId: "Report",
  applyFilters: "Apply",
  exportCsv: "Export CSV",
  when: "When",
  fromAddress: "From address",
  formatCol: "Format",
  paramsHashCol: "Parameters (hash)",
  details: "Details",
  noEvents: "No events match.",
  loadMore: "Load more",
  /* ---- enterprise: single sign-on ---- */
  ssoFailed: "Single sign-on did not work. Try again, or ask an admin (the audit log has the reason).",
  signInWith: "Sign in with {name}",
  orWithPassword: "or with a password",
  noSignInMethod: "No way to sign in is set up on this server.",
  /* ---- enterprise: SSO account linking ---- */
  allowSso: "Allow SSO",
  stopSso: "Cancel SSO link",
  allowSsoHint: "Lets the next single sign-on with this email take over this account (it keeps its password)",
  ssoAllowed: "{email} can now be linked to single sign-on at the next sign-in.",
  ssoNotAllowed: "{email} can no longer be linked to single sign-on.",
  dsTitle: "Data set {name}",
  dsNew: "New data set",
  dsNameRule: "The name must start with a letter and hold only letters, digits and _",
  dsNameTaken: "Another data set has this name",
  dsPickSource: "Pick a source",
  dsPickParent: "Pick the parent data set",
  dsNoSource: 'The source "{name}" does not exist',
  dsNothingAt: 'Nothing at the path "{path}"',
  dsRowsFrom: "Rows come from",
  dsFromSource: "A data source",
  dsFromParent: "Each row of another data set (nested)",
  dsParent: "Parent data set",
  dsParentHint: "Each row of the parent holds a list of these rows (an order's lines).",
  dsChildPath: "Path in each parent row",
  dsChildPathHint: "For example $.items or $.lines[*]",
  dsSource: "Source",
  dsPath: "Path to the rows",
  dsPathHint: "JSONPath subset: $, $.items, $.data[*].lines",
  dsReading: "Reading the source…",
  dsDetect: "Detect fields",
  dsExplore: "Explore the response",
  dsFound: "Found {n} rows.",
  dsLists: "Lists in the response",
  dsNoLists: "The response has no lists. Use the path $ for a single row.",
  dsRows: "{n} rows",
  dsSuggested: "suggested",
  dsNoPlainFields: "no plain fields",
  dsUseRows: "Use these rows",
  dsPlainList: "A list of plain values cannot be rows with fields",
  dsUse: "Use",
  dsFields: "Fields",
  dsFieldName: "Field name",
  dsCalcPlaceholder: "calculated: =Fields.a * 2",
  dsRemoveField: "Remove field",
  dsAddField: "Add field",
  dsFilters: "Filters (all must match)",
  dsFilterField: "Filter field",
  dsFilterValue: "Filter value",
  dsFilterValueHint: "value or =Parameters.x",
  dsAnd: "and",
  dsUpperValue: "Upper value",
  dsRemoveFilter: "Remove filter",
  dsAddFilter: "Add filter",
  dsSortKeys: "Sort by (first key first, then the next on ties)",
  dsSortBy: "Sort key {n}",
  dsSortDir: "Direction of sort key {n}",
  dsAsc: "Ascending",
  dsDesc: "Descending",
  dsRemoveSort: "Remove sort key",
  dsAddSort: "Add sort key",
  jsonHint: "The laid-out pages as JSON, the same as the API's json format",
  downloadDef: "Download",
  downloadDefHint: "Download the definition as a .pw.json file, unsaved changes included",
  labelField: "Label field",
  labelFieldHint: "What the reader sees for each choice (empty: the value)",
  liveParams: "Apply parameters as the reader changes them (live; off: a View report button)",
  chartMaxCategories: "Show at most N categories (a number or =Parameters.top)",
  sfTitle: "Sort and filter (this item only)",
  sfFilterTitle: "Filter (this item only)",
  sfSortBy: "Sort by",
  sfDirection: "Direction",
  sfOperator: "Operator",
  sfHint: "Value can be text, a number, =Parameters.x, or =Parent.x inside a list. TopN keeps the N highest values of the expression (ties too). Filters run in order.",
  outline: "Outline",
  outlineBackward: "Draw earlier (behind)",
  outlineForward: "Draw later (in front)",
  outlineMoveOut: "Move out of {name}",
  outlineEmpty: "No items",
  outlineHint: "Click a name to select it, also an item hidden under another. Items lower in a list are drawn on top.",
  useFixed: "Use a fixed value",
  useExpr: "Use an expression",
  chartPalette: "Palette",
  paletteCustom: "Custom colours…",
  paletteColours: "Colours, in series order",
  paletteColoursHint: "Hex colours separated by commas, e.g. #0f766e, #f59e0b",
  subreportTarget: "Report",
  drillReport: "Report",
  groupRepeatHeader: "Repeat the group header on each page it continues on",
  pivotTotalLabel: "Total label",
  pivotStyles: "Styles",
  pivotHeaderStyle: "Headers",
  pivotCellStyle: "Value cells",
  pivotTotalStyle: "Totals",
  seriesLine: "Line",
  lineStraight: "Straight",
  lineSmooth: "Smooth",
  lineStep: "Steps",
  overlayAxis: "Axis",
  axisPrimary: "Primary",
  axisSecondary: "Secondary",
  overlayShowValue: "Show the value next to the label",
  visValues: "Or values from a list field (one point each)",
  visBandColor: "Band colour",
  visNegColor: "Loss colour",
  visShowValue: "Show the value",
  visFormat: "Value format",
  actionToggleItem: "Show or hide another item",
  actionToggleTarget: "Item",
  actionToggleHint: "Its own Hidden setting is how it starts; each click flips it in the viewer.",
  rowTitle: "Row",
  rowCanGrow: "Grows to fit the text",
  rowHidden: "Hidden (true/false or =expression)",
  rowHiddenHint: "A hidden row takes no space. In detail rows the expression sees each record.",
  rowStyleHint: "Row styles apply to every cell of the row; a cell's own style wins.",
  images: "Images",
  imageUpload: "Upload an image…",
  imageRemove: "Remove {name}",
  imageType: "{name} is not a PNG, JPEG, GIF, WebP or SVG image",
  imageTooBig: "{name} is larger than 10 MB",
  imagesHint: "Kept in the report. Use one in an image (Embedded image) or as embedded:name in a background.",
  embeddedImage: "Embedded image",
  embeddedNone: "Upload images under Report → Images (click the empty page).",
  /* ---- Phase 8: reuse (masters, parts, layers, themes), cell mode, pivot wizard ---- */
  reuse: "Reuse",
  masterReport: "Master report",
  masterHint: "Its page setup, header, footer, styles, data and parameters wrap this report. The body goes in its content placeholder.",
  masterUsing: "Using the master “{name}”. Changes to it show on the next run.",
  open: "Open",
  reusedNotLoaded: "“{id}” did not load: {error}",
  masterIsMaster: "This report has a content placeholder: other reports can use it as their master.",
  masterMakeHint: "To make this a master, add a content placeholder from Insert.",
  styleSheet: "Stylesheet",
  styleSheetHint: "Another report whose named styles this report uses. Its own styles still win.",
  theme: "Theme",
  themeSource: "Theme from",
  themeOwn: "This report",
  themeReport: "A theme report",
  themeExpr: "An expression (chosen at run time)",
  themeReportPick: "Theme report",
  themeExprLabel: "Theme expression",
  themeExprHint: "Gives a report id, e.g. from a parameter.",
  themeOwnHint: "The colours and fonts below are this report’s theme. Another report can use this one as its theme.",
  themeFallbackHint: "The colours and fonts below are used when the theme report has none.",
  themeMajorFont: "Major font (headings)",
  themeMinorFont: "Minor font (body)",
  themeFontSize: "Size",
  themeFontWeight: "Weight",
  themeFontStyle: "Style",
  themeConstantName: "New constant name",
  themeConstantAdd: "Add constant",
  themeHint: "Use =Theme.Colors.Accent1, =Theme.Fonts.MajorFont.Family or =Theme.Constants.Name in any colour, font or value.",
  layers: "Layers",
  layerName: "Layer name",
  layerVisible: "Visible",
  layerLocked: "Locked",
  layerTarget: "Shows in",
  layerTarget_all: "Everywhere",
  layerTarget_screen: "Screen only",
  layerTarget_print: "Print only",
  layerTarget_export: "Export only",
  layerTarget_design: "Designer only",
  layerNew: "New layer name",
  layerAdd: "Add layer",
  layersHint: "Put an item on a layer in its Position section. A locked layer cannot be selected on the page.",
  layer: "Layer",
  parts: "Report parts",
  partsReloadHint: "Load the libraries again, with their latest changes",
  partsReload: "Reload",
  libraryPick: "A library report",
  libraryAdd: "Add library",
  partsHint: "Drag a part onto the page, or click Insert. A linked part follows its library; a copy is yours to change.",
  partDragHint: "Drag onto the page",
  partInsert: "Insert",
  partCopyHint: "Insert an independent copy",
  partCopy: "Copy",
  libraryNoParts: "No parts yet. In that report, select an item and tick “Publish as a report part”.",
  partInstance: "Report part (linked)",
  partMissing: "The library “{library}” has no part “{part}”.",
  partLinked: "“{part}” from “{library}”. Changes to the library show here.",
  partDetachHint: "Replace with a copy of its items that no longer follows the library",
  partDetach: "Detach (make a copy)",
  partOpenLibrary: "Open the library",
  partValues: "Part property values",
  partValuesHint: "A copy of a report part: its expressions read these as PartProperties.Name.",
  reportPart: "Report part",
  publishPart: "Publish as a report part",
  partName: "Part name",
  partLabel: "Label in the toolbox",
  partDescription: "Description",
  partPropName: "Property",
  partPropType: "Type",
  partPropLabel: "Label",
  partPropDefault: "Default",
  partPropNew: "New property name",
  partPropAdd: "Add property",
  publishPartHint: "Other reports insert this item from the Report parts panel. Its expressions read =PartProperties.Name.",
  masterBandLocked: "This band comes from the master report. Edit it there.",
  fromMaster: "from the master",
  cellTaken: "Those cells are taken: in cell mode items cannot overlap.",
  cellMode: "Cells",
  cellModeHint: "Cell-based design: items snap to whole cells and cannot overlap",
  cellSize: "Cell",
  item_placeholder: "Content placeholder",
  item_overflow: "Overflow placeholder",
  item_part: "Report part",
  styleParentOf: "{name} is based on",
  styleParent: "Based on",
  overflowTo: "Fixed frame: continue rows in",
  overflowThen: "Then continue in",
  pivotDropHere: "Drop fields here",
  pivotAggregate: "Aggregate",
  pivotShowAs: "Show as",
  pivotShow_value: "Value",
  pivotShow_percentOfTotal: "% of total",
  pivotShow_percentOfRow: "% of row",
  pivotShow_percentOfColumn: "% of column",
  pivotWizard: "Pivot wizard",
  pivotInsert: "Insert pivot",
  pivotFields: "Fields",
  dataSet: "Data set",
  pivotToRows: "Rows",
  pivotToColumns: "Cols",
  pivotToValues: "Values",
  pivotNoFields: "No fields. Edit the data set and detect them.",
  pivotTotals: "Totals",
  pivotPreviewHint: "Put a field in Rows or Columns to see the pivot.",
  instantVisuals: "Instant visuals",
  instantHint: "Tick fields: a chart, a table and a pivot are suggested, drawn with your data.",
  instant_chart: "Chart",
  instant_table: "Table",
  instant_pivot: "Pivot",
  instantPick: "Tick a text field and a number field.",
  fieldType: "Field type",
  fieldTypeList: "list (several values)",
  visListField: "Points from a list field",
  visListHint: "A list field (an array, or text such as 3,5,2) gives one point per value: set the field's type to list in the data set.",
  cornerRadius: "Corner radius",
  cellBookmark: "Bookmark (this cell)",
  jumpToBookmark: "Jump to bookmark",
  tableSize: "Size (from its columns and rows)",
  tableSizeHint: "Change column widths and row heights to resize the table.",
  rowClearCellStyles: "Use the row style for every cell",
  rowClearCellStylesHint: "Clears the cells' own styles in this row (keeping number formats and alignment), so the row style applies to all of them.",
  /* ---- gauges and overlays (batch 1) ---- */
  gaugeShape: "Gauge shape",
  gaugeIndicator: "Value shown by",
  gaugePointerColor: "Needle or pointer colour",
  gaugeTicks: "Tick marks and values",
  overlayInLegend: "Show in the legend",
  o_gaugeShape_half: "Half circle",
  o_gaugeShape_threeQuarter: "Three-quarter circle",
  o_gaugeShape_full: "Full circle",
  o_gaugeIndicator_needle: "Needle",
  o_gaugeIndicator_pointer: "Pointer on the scale",
  o_gaugeIndicator_bar: "Bar along the scale",
  /* ---- outline drag and drop (batch 1) ---- */
  outlineKeys: "Drag a row to move it: onto a row's edge to put it before or after, onto a container or list to put it inside. Keyboard: Alt+↑/↓ moves, Alt+→ puts it into the container above, Alt+← takes it out.",
  outlineMovedInto: "{name} moved into {parent}, position {n} of {of}.",
  outlineMovedBand: "{name} moved, position {n} of {of}.",
  outlineCannotMove: "It cannot go there.",
  outlineNoContainerAbove: "There is no container or list just above to move it into.",
  /* ---- designer polish (batch 1) ---- */
  emptyBodyHint: "Drag a tool or a field here, or click a tool under Insert.",
  zoomFit: "Fit width",
  i_findProperty: "Find a property",
  i_noPropMatch: "No property matches.",
  /* ---- Inspector labels, categories and options (batch 1) ---- */
  p_value: "Value",
  p_richtext_value: "HTML (p, b, i, u, s, sup, sub, br, ul/ol/li, a, h1–h6, span style; {Fields.x})",
  p_checkbox_value: "Checked (true/false)",
  p_field_value: "Starting value",
  p_map_value: "Colour by: value (aggregate)",
  p_sparkline_value: "Value (aggregate when a category is set)",
  p_dataSet: "Data set",
  p_container_dataSet: "Data set (for its hidden expression and style)",
  p_map_dataSet: "Shapes: data set of features (instead of the text)",
  p_styleName: "Named style",
  p_canGrow: "Can grow",
  p_canShrink: "Can shrink",
  p_shrinkToFit: "Shrink text to fit",
  p_minFontSize: "Shrink no smaller than (pt, default 4)",
  p_shrinkStep: "Shrink step (pt, default 0.5)",
  p_rotate: "Rotate (degrees clockwise)",
  p_barcode_rotate: "Rotate",
  p_headingLevel: "Heading level (1–6, for a table of contents)",
  p_pageBreakBefore: "Page break before",
  p_pageBreakAfter: "Page break after",
  p_hidden: "Hidden",
  p_bookmark: "Bookmark (document map)",
  p_action: "Action",
  p_tooltip: "Tooltip (hover text)",
  p_fontFamily: "Font",
  p_fontSize: "Size",
  p_chart_fontSize: "Text size",
  p_fontWeight: "Weight",
  p_fontStyle: "Style",
  p_color: "Color",
  p_textAlign: "Align",
  p_verticalAlign: "Vertical align",
  p_format: "Format (C2, N0, dd MMM yyyy)",
  p_lineHeight: "Line height",
  p_textDecoration: "Decoration",
  p_textDecorationColor: "Decoration colour",
  p_writingMode: "Writing mode (tb-rl = vertical)",
  p_backgroundColor: "Background",
  p_backgroundImage: "Background image (URL or =expression)",
  p_backgroundFit: "Background fit",
  p_padding: "Padding (t r b l)",
  p_border: "Border (1 solid #ccc)",
  p_borderTop: "Border top",
  p_borderBottom: "Border bottom",
  p_htmlFromData: "Field values are HTML (trusted data only)",
  p_listIndent: "List indent (pt, default 18)",
  p_paragraphSpacing: "Space after paragraphs (pt, default 4)",
  p_src: "Source (URL, data URI, embedded:name, or a field with base64 or bytes)",
  p_fit: "Fit",
  p_autoSize: "Size to the image (96 dpi)",
  p_direction: "Direction",
  p_stroke: "Stroke",
  p_strokeWidth: "Stroke width",
  p_strokeDash: "Dash",
  p_shape: "Shape",
  p_fill: "Fill",
  p_repeatHeader: "Repeat header on each page",
  p_fitColumns: "Column widths from the content",
  p_printAtBottom: "Footer at the bottom of the page",
  p_overflow: "Wider than the page",
  p_repeatColumns: "Columns repeated on each page set",
  p_pageOrder: "Page order",
  p_noRowsText: "Text when no rows",
  p_keepTogether: "Keep on one page",
  p_container_keepTogether: "Keep together on one page",
  p_list_keepTogether: "Keep each row on one page",
  p_groupBy: "Group by (one row per group)",
  p_pageBreakBetween: "Page break between rows",
  p_columns: "Records across (grid)",
  p_columnGap: "Gap between records across (pt)",
  p_newSection: "Each row starts a section (page numbers restart)",
  p_text: "Label",
  p_chartType: "Chart type",
  p_title: "Title",
  p_category: "Category (x axis / slices)",
  p_sparkline_category: "One point per (e.g. =Fields.month)",
  p_categorySort: "Sort categories",
  p_categoryFormat: "Category format",
  p_xValue: "X value (scatter, bubble) or angle in degrees (polar)",
  p_series: "Series",
  p_seriesGroup: "One series per value of",
  p_stacked: "Stacking",
  p_line: "Lines",
  p_upColor: "Rising colour",
  p_downColor: "Falling colour",
  p_axes: "Axes",
  p_xTitle: "X axis title",
  p_overlays: "Trend lines, reference lines and bands",
  p_showValues: "Show values",
  p_labelTemplate: "Label text: {value} {category} {series} {percent}, or =expression",
  p_labelPosition: "Label position",
  p_valueFormat: "Value format",
  p_legend: "Legend",
  p_animation: "Animation in the viewer",
  p_background: "Background",
  p_pointAction: "Click on a bar or slice",
  p_pointColor: "Bar or slice colour (expression, e.g. highlight the selected one)",
  p_map_pointColor: "Points: colour",
  p_tooltips: "Tooltips on hover",
  p_kind: "Kind",
  p_fieldName: "Field name (unique; {Fields.x} allowed)",
  p_options: "Choices (comma-separated or =expression)",
  p_required: "Required",
  p_readOnly: "Read only",
  p_geojson: "Shapes: GeoJSON text",
  p_geometry: "Shapes: geometry (data set)",
  p_shapeKey: "Shapes: key (e.g. =Fields.name)",
  p_valueDataSet: "Colour by: data set",
  p_valueKey: "Colour by: key that matches the shape key",
  p_colorLow: "Lowest value colour",
  p_colorHigh: "Highest value colour",
  p_pointDataSet: "Points: data set",
  p_lat: "Points: latitude",
  p_lon: "Points: longitude",
  p_pointSize: "Points: size by",
  p_pointLabel: "Points: label",
  p_style: "Style",
  p_bandLow: "Range band from",
  p_bandHigh: "Range band to",
  p_bandColor: "Range band colour",
  p_max: "Maximum",
  p_target: "Target",
  p_iconSet: "Icons",
  p_lower: "Low below",
  p_upper: "High from",
  p_low: "From",
  p_high: "To",
  p_min: "Scale minimum",
  p_symbology: "Symbology",
  p_showText: "Show the text",
  p_captionPosition: "Text position",
  p_quietZone: "Quiet zone (pt of white around the code)",
  p_qrErrorLevel: "Error correction",
  p_qrVersion: "Version (1–40, empty = smallest)",
  p_qrMask: "Mask (1–8)",
  p_dmShape: "Shape",
  p_dmSize: "Rows×columns (e.g. 24x24)",
  p_pdfColumns: "Columns (1–30)",
  p_pdfRows: "Rows (3–90)",
  p_pdfErrorLevel: "Error correction (0–8)",
  p_pdfCompact: "Compact (truncated)",
  p_aztecLayers: "Layers (1–32)",
  p_aztecErrorPercent: "Error correction % (5–95)",
  p_maxiMode: "Mode (2–6)",
  p_checkDigit: "Add a check digit",
  p_barRatio: "Wide-to-narrow ratio (2–3)",
  p_corner: "Corner text",
  p_rowHeaderWidth: "Row header width",
  p_columnWidth: "Column width",
  p_params: "Parameters",
  p_levels: "Levels to show",
  p_source: "Entries from",
  p_numbering: "Numbering (decimal, roman, alpha; one per level: roman,alpha)",
  cat_Data: "Data",
  cat_Text: "Text",
  cat_Layout: "Layout",
  cat_Interactivity: "Interactivity",
  cat_Visibility: "Visibility",
  cat_Box: "Box",
  cat_Shape: "Shape",
  cat_Chart: "Chart",
  cat_Axes: "Axes",
  cat_Overlays: "Overlays",
  cat_Labels: "Labels",
  cat_Look: "Look",
  cat_Field: "Field",
  cat_Shapes: "Shapes",
  cat_Colour: "Colour",
  cat_Points: "Points",
  cat_Barcode: "Barcode",
  "cat_Barcode options": "Barcode options",
  o_fontWeight_normal: "Normal",
  o_fontWeight_600: "Semibold",
  o_fontWeight_bold: "Bold",
  o_fontStyle_normal: "Normal",
  o_fontStyle_italic: "Italic",
  o_textAlign_auto: "Auto",
  o_textAlign_left: "Left",
  o_textAlign_center: "Center",
  o_textAlign_right: "Right",
  o_textAlign_justify: "Justify",
  o_verticalAlign_top: "Top",
  o_verticalAlign_middle: "Middle",
  o_verticalAlign_bottom: "Bottom",
  o_textDecoration_none: "None",
  o_textDecoration_underline: "Underline",
  "o_textDecoration_line-through": "Strikethrough",
  "o_textDecoration_underline line-through": "Underline and strikethrough",
  "o_writingMode_lr-tb": "Horizontal",
  "o_writingMode_tb-rl": "Vertical",
  o_backgroundFit_cover: "Cover",
  o_backgroundFit_contain: "Contain",
  o_backgroundFit_fill: "Fill",
  o_fit_contain: "Contain",
  o_fit_cover: "Cover",
  o_fit_fill: "Fill",
  o_fit_clip: "Clip",
  o_direction_down: "Down",
  o_direction_up: "Up",
  o_strokeDash_solid: "Solid",
  o_strokeDash_dashed: "Dashed",
  o_strokeDash_dotted: "Dotted",
  o_shape_rect: "Rectangle",
  o_shape_ellipse: "Ellipse",
  o_overflow_paginate: "Continue on the next pages",
  o_pageOrder_down: "Down, then across",
  o_pageOrder_across: "Across, then down",
  o_chartType_column: "Column",
  o_chartType_bar: "Bar",
  o_chartType_line: "Line",
  o_chartType_area: "Area",
  o_chartType_pie: "Pie",
  o_chartType_donut: "Donut",
  o_chartType_scatter: "Scatter",
  o_chartType_bubble: "Bubble",
  o_chartType_radar: "Radar",
  o_chartType_polar: "Polar",
  o_chartType_candlestick: "Candlestick",
  o_chartType_ohlc: "OHLC",
  o_chartType_gauge: "Gauge",
  o_chartType_funnel: "Funnel",
  o_categorySort_asc: "Ascending",
  o_categorySort_desc: "Descending",
  o_line_straight: "Straight",
  o_line_smooth: "Smooth",
  o_line_step: "Step",
  o_labelPosition_outside: "Outside",
  o_labelPosition_inside: "Inside",
  o_labelPosition_center: "Center",
  o_legend_bottom: "Bottom",
  o_legend_none: "None",
  o_animation_none: "None",
  o_animation_grow: "Grow",
  o_animation_fade: "Fade",
  o_kind_text: "Text",
  o_kind_multiline: "Multi-line text",
  o_kind_checkbox: "Check box",
  o_kind_choice: "Choice list",
  o_style_line: "Line",
  o_style_column: "Columns",
  o_style_area: "Area",
  o_style_winloss: "Win / loss",
  o_iconSet_trafficLights: "Traffic lights",
  o_iconSet_arrows: "Arrows",
  o_iconSet_symbols: "Symbols",
  o_iconSet_flags: "Flags",
  o_iconSet_ratings: "Ratings",
  o_captionPosition_below: "Below",
  o_captionPosition_above: "Above",
  o_dmShape_square: "Square",
  o_dmShape_rectangle: "Rectangle",
  o_overflow_shrink: "Narrow the columns",
  o_source_bookmarks: "Bookmarks",
  o_source_headings: "Headings",
  i_sideBySide: "Side by side",
  i_stacked: "Stacked",
  i_stacked100: "Stacked to 100%",
  i_nameChars: "Use letters, digits and _",
  i_nameTaken: "This name is in use",
  i_itemName: "Item name",
  i_chartGallery: "Chart gallery and data preview…",
  i_chartGalleryHint: "See every chart type drawn with your API data, then pick one.",
  i_position: "Position",
  i_width: "Width",
  i_height: "Height",
  i_where: "In the {band}.",
  i_whereParent: "In the {band}, inside {parent}.",
  i_nestHint: "Drag tools and fields into the {type}. Items inside a list repeat for each record. A table inside a list can filter with =Parent.field.",
  i_nestHintGrouped: "Drag tools and fields into the {type}. Items inside a list repeat for each record (one row per group). A table inside a list can filter with =Parent.field.",
  i_duplicate: "Duplicate",
  i_delete: "Delete",
  i_columns: "Columns",
  i_addColumn: "Add column",
  i_tableWidthHint: "Total width {w} pt. Drag a column edge on the canvas to resize.",
  i_rows: "Rows",
  i_partRows: "{part} rows:",
  i_add: "Add",
  i_clickCell: "Click a cell to edit its value and style.",
  i_total: "Total",
  i_groups: "Groups",
  i_remove: "Remove",
  i_groupName: "Name (scope)",
  i_sortGroups: "Sort groups",
  i_groupBy: "Group by",
  i_sortGroupsBy: "Sort groups by (empty: the group value)",
  i_sortGroupsByTitle: "Sort groups by, e.g. =Sum(Fields.amount)",
  i_pageBreak: "Page break",
  i_pbBetween: "Between groups",
  i_pbAfter: "After each group",
  i_keepGroup: "Keep the group on one page",
  i_drillToggle: "Drill-down: show a toggle",
  i_startCollapsed: "Start collapsed",
  i_fieldToGroupBy: "Field to group by",
  i_addGroup: "Add group",
  i_groupScopeHint: 'Use the group name as a scope: Sum(Fields.amount, "{name}").',
  i_seriesHint: "Series: one value per category, usually an aggregate such as =Sum(Fields.amount).",
  i_seriesHintFin: "A candlestick or OHLC series takes open, high, low and close.",
  i_seriesName: "Series name",
  i_name: "Name",
  i_seriesColor: "Series color",
  i_removeSeries: "Remove series",
  i_open: "Open",
  i_high: "High",
  i_low: "Low",
  i_close: "Close",
  i_fromLow: "From (low)",
  i_toHigh: "To (high)",
  i_bubbleSize: "Bubble size",
  i_drawAs: "Draw as",
  i_seriesType: "Series type",
  i_axis: "Axis",
  i_seriesAxis: "Series axis",
  i_range: "Range (from – to)",
  i_addSeries: "Add series",
  i_axScale: "Scale",
  i_axValues: "Values",
  i_axX: "X axis",
  i_axCategory: "Category axis (x)",
  i_axValue: "Value axis (y)",
  i_axSecondary: "Secondary value axis",
  i_title: "Title",
  i_axisTitleAria: "{axis} title",
  i_minimum: "Minimum",
  i_axisMinAria: "{axis} minimum",
  i_auto: "auto",
  i_maximum: "Maximum",
  i_axisMaxAria: "{axis} maximum",
  i_numberFormat: "Number format",
  i_axisFormatAria: "{axis} format",
  i_log: "Logarithmic",
  i_labelAngle: "Label angle (degrees, e.g. -45)",
  i_labelAngleAria: "Label angle",
  i_gridLines: "Grid lines",
  i_reversed: "Reversed",
  i_secondaryHint: "Set a series' axis to Secondary to get a second value axis.",
  i_ov_trend: "Trend line",
  i_ov_movingAverage: "Moving average",
  i_ov_line: "Reference line",
  i_ov_band: "Band",
  i_ov_range: "Range",
  i_ovValuePh: "=Avg(Fields.amount) or a number",
  i_overlayType: "Overlay type",
  i_removeOverlay: "Remove overlay",
  i_fit: "Fit",
  i_fitLinear: "Linear",
  i_fitExp: "Exponential",
  i_fitPoly: "Polynomial",
  i_order: "Order (2–6)",
  i_period: "Period",
  i_ofSeries: "Of series number",
  i_at: "At",
  i_from: "From",
  i_to: "To",
  i_label: "Label",
  i_overlayLabel: "Overlay label",
  i_addOverlay: "Add overlay",
  i_paramsOf: "{label} (name=expression, one per line)",
  i_cellShows: "Cell shows",
  i_onePointPer: "One point per",
  i_value: "Value",
  i_style: "Style",
  i_slLine: "Line",
  i_slColumns: "Columns",
  i_slArea: "Area",
  i_slWinLoss: "Win / loss",
  i_bandFrom: "Range band from",
  i_bandTo: "Range band to",
  i_icons: "Icons",
  i_lowBelow: "Low below",
  i_highFrom: "High from",
  i_scaleMin: "Scale minimum",
  i_target: "Target",
  i_colorOrExpr: "Color (or =expression)",
  i_actionOnClick: "Action on click",
  i_actNone: "None",
  i_actUrl: "Open a URL",
  i_actReport: "Open another report (drill-through)",
  i_actParams: "Filter this report (set parameters)",
  i_actBookmark: "Jump to a bookmark",
  i_url: "URL",
  i_setParams: "Set parameters (name=expression, one per line)",
  i_setParamsHint: "Example: categories==Fields.category (after the first =, an expression starts with =). The report runs again with the new values.",
  i_toggleClears: "A second click on the same value clears the filter",
  i_paramsLines: "Parameters (name=expression, one per line)",
  i_cellGone: "This cell no longer exists.",
  i_cellOf: "{name} · cell",
  i_cellPos: "{part} row {row}, col {col}",
  i_data: "Data",
  i_cellTitle: "{name} · {part} cell",
  i_cellHintDetail: "Detail rows repeat once for each record. Fields.x is the current record.",
  i_cellHintGroup: "Group rows repeat once for each group. Sum(Fields.x) adds up the group.",
  i_cellHintAll: "Aggregates such as Sum(Fields.x) use all the records of the table.",
  i_visual: "Visual",
  i_interactivity: "Interactivity",
  i_interactiveSort: "Interactive sort: sort by",
  i_interactiveSortHint: "Readers click the header to sort.",
  i_structure: "Structure",
  i_colLeft: "Column left",
  i_colRight: "Column right",
  i_delColumn: "Delete column",
  i_rowAbove: "Row above",
  i_rowBelow: "Row below",
  i_delRow: "Delete row",
  i_mergeRight: "Merge right",
  i_split: "Split",
  i_heightPt: "Height (pt)",
  i_nItems: "{n} items",
  i_align: "Align",
  i_left: "Left",
  i_right: "Right",
  i_top: "Top",
  i_bottom: "Bottom",
  i_centre: "Centre",
  i_sameWidth: "Same width",
  i_sameHeight: "Same height",
  i_distribute: "Distribute",
  i_horizontally: "Horizontally",
  i_vertically: "Vertically",
  i_section: "section",
  i_bodyHeightHint: "Design height only. The body grows with its data at run time.",
  i_bandHeightHint: "Fixed on every page. Use 0 to remove the band.",
  i_newspaperHint: "Newspaper columns: the body fills each column, then the next.",
  i_gapPt: "Gap (pt)",
  i_printFirst: "Print on the first page",
  i_printLast: "Print on the last page",
  i_portrait: "Portrait",
  i_landscape: "Landscape",
  i_report: "Report",
  i_page: "Page",
  i_size: "Size",
  i_pageless: "Pageless",
  i_orientation: "Orientation",
  i_pagelessHint: "One page that grows to fit the content (up to 200 inches). Good for dashboards and screen reports.",
  i_marginsHint: "Margins in points. Changing the page width does not move items.",
  i_regional: "Regional",
  i_locale: "Locale",
  i_currency: "Currency",
  i_nonFinite: "Division by zero (Infinity, NaN)",
  i_nonFiniteSsrs: "Infinity (as SSRS)",
  i_nonFiniteBlank: "Blank",
  i_defaultText: "Default text",
  i_font: "Font",
  i_color: "Color",
  i_uploadFont: "Upload a font…",
  i_reportHint: "Select an item, a cell or a band to edit it. Drag tools and fields from the left onto the page.",
  i_functions: "Functions",
  i_parameters: "Parameters",
  i_body: "Body",
  i_addFunction: "Add a function",
  i_functionsHint: "Call one as Code.Name(…) or Name(…) in any expression. Parameters are names inside the body.",
  i_namedStyles: "Named styles and themes",
  i_applyTheme: "Apply a theme (replaces the default text and named styles)",
  i_styleSizeOf: "{name} size",
  i_styleColourOf: "{name} colour",
  i_newStyleName: "New style name",
  i_namedStylesHint: "Items and cells pick a named style in their Text section. Their own style still wins.",
  i_pickColor: "Pick a color",
  i_notSet: "Not set (inherited)",
  i_colorPh: "none or =expression",
  i_exprPh: "Text, =expression or {expression}",
  i_openExprEditor: "Open the expression editor",
  band_pageHeader: "Page header",
  band_body: "Body",
  band_pageFooter: "Page footer",
  band_section: "Section {n}",
  p_colorScale: "Colour scale",
  o_colorScale_continuous: "Continuous (heat)",
  o_colorScale_classes: "Classes (graduated)",
  p_classes: "Number of classes (2–9)",
  p_lineColor: "Lines: colour (LineString shapes)",
  p_lineWidth: "Lines: width (pt)",
  p_regionAction: "Click on a region",
  o_chartType_treemap: "Treemap",
  o_chartType_histogram: "Histogram",
  o_chartType_boxplot: "Box plot",
  o_chartType_waterfall: "Waterfall",
  o_chartType_gantt: "Gantt",
  p_binCount: "Number of bins (empty: automatic)",
  p_binWidth: "Bin width (instead of a number of bins)",
  p_showMean: "Mark the mean",
  p_waterfallTotals: "Subtotal bar when (e.g. =Fields.isTotal)",
  p_showTotal: "Total bar at the end",
  p_totalLabel: "Total bar label",
  p_totalColor: "Total colour",
  p_ganttStart: "Bar start (date or number)",
  p_ganttEnd: "Bar end (date or number)",
  p_ganttToday: "Today line",
  p_todayColor: "Today line colour",
  band_placeholder: "Placeholder “{name}”",
  fillPlaceholder: "Fill “{name}”",
  placeholderHint: "These items go in the master's placeholder of this name. The body fills the master's first placeholder.",
  band_sectionHeader: "{section} · page header",
  band_sectionFooter: "{section} · page footer",
  secBandShared: "The report's (shared)",
  secBandOwn: "Its own",
  secBandNone: "None",
  secBandHint: "Its own header or footer starts as a copy of the report's and shows as a band above or below this section.",
  // exports, batch 2
  exportOptions: "Export options",
  optPdfUa: "Accessible PDF (PDF/UA)",
  optPdfUaHint: "Tagged for screen readers: headings, tables, reading order, alt text",
  optPdfA: "PDF/A (for archiving)",
  optFormulas: "Excel: live formulas for totals",
  optHtml: "HTML file",
  optHtmlInteractive: "Interactive viewer",
  optHtmlTables: "Pages and sortable tables",
  optHtmlStatic: "Static pages",
  pptxHint: "One slide per page, to edit in PowerPoint",
  htmlPages: "Pages",
  htmlTables: "Tables",
  htmlAll: "All",
  htmlFilter: "Filter",
  htmlToggle: "Show or hide the rows of this group",
  htmlSortAsc: "Sort ascending",
  htmlSortDesc: "Sort descending",
  p_alt: "Alternative text (screen readers: accessible PDF, Word)",
  cat_Accessibility: "Accessibility",
  // data sources, batch 3a (XML, SOAP, OData)
  srcTypeXml: "XML",
  srcTypeSoap: "SOAP web service",
  srcTypeOData: "OData service",
  srcGiveUrlOrXml: "Give a URL or paste XML",
  srcBadNamespaces: "Each namespace line is prefix=URI",
  srcGiveEnvelope: "Write the SOAP envelope",
  srcBadAction: "The SOAP action may not hold quotes or line breaks",
  srcBadEnvelope: "The envelope is not well-formed XML: {message}",
  srcXmlUrlHint: "Use {Parameters.x} for values. Leave it empty to paste the XML below.",
  srcSoapAction: "SOAP action",
  srcSoapVersion: "SOAP version",
  srcEnvelope: "Envelope",
  srcEnvelopeHint: "{Parameters.x} values are XML-escaped. The first element in the response Body becomes the data.",
  srcEnvelopeTemplate: "Insert a template",
  srcNamespaces: "Namespaces (one prefix=URI per line)",
  srcNamespacesHint: "Use the prefix in XPaths, as in /o:Orders/o:Order. A name without a prefix matches any namespace.",
  srcXmlData: "XML data",
  dsXPathHint: "An XPath to the row elements, e.g. //Order or /Orders/Order[@status='paid']. $ picks the most repeated element.",
  odPickSet: "Pick an entity set",
  odServiceHint: "The service root, e.g. https://host/odata/Service/. Read $metadata to pick the entity set.",
  odEntitySet: "Entity set",
  odReadMeta: "Read $metadata",
  odMetaFound: "{n} entity sets found",
  odFields: "Fields ($select; none means all)",
  odFilters: "Filters ($filter)",
  odField: "Field",
  odOperator: "Operator",
  odOp_contains: "contains",
  odOp_startswith: "starts with",
  odOp_endswith: "ends with",
  odValue: "Value",
  odValuePh: "Value or {Parameters.x}",
  odRemove: "Remove",
  odAddFilter: "+ Filter",
  odFilterHint: "An empty value (an unset parameter) leaves its filter out. A list parameter matches any of its values.",
  odOrderBy: "Sort ($orderby)",
  odAddSort: "+ Sort",
  odTop: "Top ($top)",
  odSkip: "Skip ($skip)",
  odMaxPages: "Pages at most",
  odMaxPagesHint: "Next links are followed up to this many pages (at most {n}).",
  odExpand: "Expand ($expand)"
};

// src/i18n/gov.js
var gov_default = {
  en: {
    stateOn: "On",
    stateOff: "Off",
    twoFactor: "Two-factor sign-in",
    twoFactorLede: "Sign in with your password and a 6-digit code from an authenticator app on your phone.",
    twoFactorSso: "You sign in with single sign-on: your identity provider asks for the second factor.",
    twoFactorSince: "since {date}",
    twoFactorRequired: "required for your role",
    recoveryLeft: "{n} recovery codes left",
    turnOn2fa: "Turn on two-factor sign-in",
    turnOff2fa: "Turn off two-factor sign-in",
    newRecoveryCodes: "New recovery codes",
    codeToConfirm: "A current code, or a recovery code, to confirm",
    confirmCode: "Confirm",
    twoFactorTurnedOn: "Two-factor sign-in is on. Your other sessions are signed out.",
    twoFactorTurnedOff: "Two-factor sign-in is off. Your other sessions are signed out.",
    qrAlt: "QR code for your authenticator app",
    scanQr: "Scan this QR code with an authenticator app (Google Authenticator, Microsoft Authenticator, 1Password…), then enter the 6-digit code it shows.",
    cantScan: "Cannot scan it? Type this key into the app:",
    authCode: "Code from your authenticator app",
    recoveryCodesTitle: "Your recovery codes",
    recoveryCodesHint: "Keep these somewhere safe. Each one signs you in once if you lose your phone. They are shown only now.",
    mustEnrol: "Your role must use two-factor sign-in. Set it up now to finish signing in.",
    enterCode: "Enter the 6-digit code from your authenticator app.",
    enterRecovery: "Enter one of your recovery codes.",
    recoveryCode: "Recovery code",
    useRecoveryCode: "Use a recovery code",
    useAuthCode: "Use a code from the app",
    verify: "Verify",
    verifying: "Checking…",
    accountTitle: "Your account",
    twoFactorCol: "Two-factor",
    reset2fa: "Reset two-factor",
    confirmReset2fa: "Reset the two-factor sign-in of {email}? Their authenticator and recovery codes stop working and they are signed out.",
    twoFactorReset: "Two-factor sign-in of {email} is reset. They are signed out.",
    serverSettings: "Settings",
    require2faFor: "Require two-factor sign-in for these roles",
    require2faHint: "Password accounts with these roles set it up at their next sign-in; sessions without it end. Single sign-on accounts are not asked: the identity provider owns their factors.",
    saveSettings: "Save",
    settingsSaved: "Settings saved.",
    settingsChanged: "Last changed {when} by {who}.",
    forgotPassword: "Forgot your password?",
    noMailReset: "Forgot your password? Ask an admin to reset it.",
    resetTitle: "Reset your password",
    resetLede: "Enter your email. If it has an account here, we send a link to set a new password. The link works once, for 30 minutes.",
    sendResetLink: "Send the link",
    resetSent: "If {email} has an account here, a link is on its way. Check your inbox.",
    newPassword: "New password (at least 10 characters)",
    setNewPassword: "Set the new password",
    passwordChanged: "Your password is changed and every session is signed out. Sign in with the new password.",
    resetLinkBad: "This link does not work any more. Ask for a new one.",
    backToSignIn: "Back to sign-in",
    resetNoMail: "Password reset by email is not set up on this server. Ask an admin to reset your password.",
    auditIntegrity: "Integrity (beta)",
    auditIntegrityLede: "Every event is chained to the one before it and signed checkpoints name every stream. A check finds events that were changed, removed or added since they were written.",
    verifyChain: "Check the whole log",
    verifyWindow: "Check the dates in the filter",
    checkpointNow: "Write a checkpoint now",
    checkpointWritten: "Checkpoint written ({n} streams).",
    checkpointNothing: "Nothing to checkpoint yet.",
    chainBroken: "The log does not check: {n} problems.",
    chainStats: "{events} events ({unchained} from before the chain) in {streams} streams, {checkpoints} checkpoints",
    lastCheckpoint: "last checkpoint {when}",
    auditPublicKey: "Public key {fp}",
    auditKeySource: "Signing key from {source}. Keep a copy of this public key elsewhere: pw audit verify --public-key checks against it.",
    statusTitle: "Set up on this server",
    statusMail: "Email (SMTP)",
    statusNoDomains: "no domains allowed for scheduled mail",
    statusSlo: "Single logout",
    statusSiem: "Audit shipping (SIEM)",
    siemQueue: "{queued} waiting, {sent} sent, {dropped} dropped",
    siemBad: "PW_AUDIT_SIEM is not a usable address",
    statusAuditKey: "Audit checkpoint key",
    notSet: "not set",
    statusHint: "These come from the server's environment (docs/GOVERNANCE.md).",
    chainOk: "Proven: no checkpointed event was changed, removed or added.",
    chainUnverified: "Unverified: nothing shows a change, but nothing proves the log either (see below).",
    chainError: "The check could not finish: treat the log as unproven.",
    chainPending: "{n} newer events are not yet checkpointed.",
    schedules: "Schedules",
    schedulesLede: "Run saved reports on a timetable. Each run renders as you, with your access at that moment, and is kept for download or emailed.",
    addSchedule: "Add schedule",
    scheduleAdded: "Schedule added.",
    scheduleReport: "Report",
    scheduleWhen: "When (cron)",
    scheduleCronOnly: "This server runs schedules only from a {when} cron: a schedule more often than daily runs at most once a day.",
    cronDaily: "Every day at 07:00",
    cronWeekly: "Mondays at 07:00",
    cronMonthly: "The 1st of each month at 07:00",
    cronHourly: "Every hour",
    timeZone: "Time zone",
    scheduleParams: "Parameters (one name=value per line)",
    delivery: "Delivery",
    deliverDownload: "Keep for download",
    deliverEmail: "Email",
    mailTo: "To (allowed domains: {domains})",
    mailSubject: "Subject (optional)",
    mailAttach: "Attach the file (a link when it is too large)",
    fromSnapshot: "Render from snapshot",
    fromSnapshotHint: "Reuse a fresh cached rendering of the same report, parameters and access when there is one.",
    cronHint: "Five fields: minute hour day-of-month month day-of-week, e.g. 0 7 * * 1 for Mondays at 07:00.",
    mailOffHint: "Email is not set up on this server.",
    nextRun: "Next run",
    lastRun: "Last run",
    mailLink: "link",
    mailSent: "emailed ({how})",
    mailFailed: "email failed: {error}",
    runNow: "Run now",
    scheduleStarted: "The run has started.",
    confirmDeleteSchedule: "Delete this schedule?",
    scheduleDeleted: "Schedule deleted.",
    noSchedules: "No schedules yet.",
    snapshotTitle: "Report snapshot cache",
    snapshotTtl: "Reuse a rendering for (seconds, 0 = off)",
    snapshotMax: "Cache size limit (MB)",
    snapshotHint: "A rendering is reused only for the same report version, parameters, format and viewer with the same access. Saving a report or changing access starts fresh.",
    snapshotStats: "{n} snapshots, {mb} MB",
    clearSnapshots: "Clear the cache",
    snapshotsCleared: "The snapshot cache is cleared.",
    passwordToConfirm: "Your password, to confirm it is you",
    enrolEmailed: "We emailed a code to your address: enter it to set up your authenticator.",
    emailCode: "Code from the email",
    devicesTitle: "Known browsers",
    devicesHint: "Browsers you signed in from. Sign-in limits never lock them out. Remove one you do not recognise.",
    devicesNone: "No known browsers.",
    deviceLastUsed: "last sign-in {at}",
    deviceRemove: "Remove",
    signOutEverywhere: "Sign out everywhere and forget every browser"
  },
  hi: {
    devicesTitle: "ज्ञात ब्राउज़र",
    devicesHint: "जिन ब्राउज़रों से आपने साइन इन किया। साइन-इन सीमाएँ उन्हें कभी लॉक नहीं करतीं। जिसे आप नहीं पहचानते, उसे हटाएँ।",
    devicesNone: "कोई ज्ञात ब्राउज़र नहीं।",
    deviceLastUsed: "अंतिम साइन-इन {at}",
    deviceRemove: "हटाएँ",
    signOutEverywhere: "हर जगह से साइन आउट करें और हर ब्राउज़र भूल जाएँ",
    stateOn: "चालू",
    stateOff: "बंद",
    twoFactor: "दो-चरणीय साइन-इन",
    twoFactorLede: "अपने पासवर्ड और फ़ोन के ऑथेंटिकेटर ऐप के 6 अंकों वाले कोड से साइन इन करें।",
    twoFactorSso: "आप सिंगल साइन-ऑन से साइन इन करते हैं: दूसरा चरण आपका पहचान प्रदाता माँगता है।",
    twoFactorSince: "{date} से",
    twoFactorRequired: "आपकी भूमिका के लिए ज़रूरी",
    recoveryLeft: "{n} रिकवरी कोड बचे हैं",
    turnOn2fa: "दो-चरणीय साइन-इन चालू करें",
    turnOff2fa: "दो-चरणीय साइन-इन बंद करें",
    newRecoveryCodes: "नए रिकवरी कोड",
    codeToConfirm: "पुष्टि के लिए अभी का कोड या कोई रिकवरी कोड",
    confirmCode: "पुष्टि करें",
    twoFactorTurnedOn: "दो-चरणीय साइन-इन चालू है। आपके बाकी सत्र साइन आउट हो गए।",
    twoFactorTurnedOff: "दो-चरणीय साइन-इन बंद है। आपके बाकी सत्र साइन आउट हो गए।",
    qrAlt: "आपके ऑथेंटिकेटर ऐप के लिए QR कोड",
    scanQr: "इस QR कोड को किसी ऑथेंटिकेटर ऐप (Google Authenticator, Microsoft Authenticator, 1Password…) से स्कैन करें, फिर उसमें दिखा 6 अंकों वाला कोड डालें।",
    cantScan: "स्कैन नहीं हो रहा? यह कुंजी ऐप में टाइप करें:",
    authCode: "ऑथेंटिकेटर ऐप का कोड",
    recoveryCodesTitle: "आपके रिकवरी कोड",
    recoveryCodesHint: "इन्हें सुरक्षित जगह रखें। फ़ोन खो जाने पर हर कोड एक बार साइन इन कराता है। ये सिर्फ़ अभी दिखाए जा रहे हैं।",
    mustEnrol: "आपकी भूमिका के लिए दो-चरणीय साइन-इन ज़रूरी है। साइन इन पूरा करने के लिए इसे अभी सेट करें।",
    enterCode: "ऑथेंटिकेटर ऐप का 6 अंकों वाला कोड डालें।",
    enterRecovery: "अपना कोई रिकवरी कोड डालें।",
    recoveryCode: "रिकवरी कोड",
    useRecoveryCode: "रिकवरी कोड इस्तेमाल करें",
    useAuthCode: "ऐप का कोड इस्तेमाल करें",
    verify: "जाँचें",
    verifying: "जाँच हो रही है…",
    accountTitle: "आपका खाता",
    twoFactorCol: "दो-चरणीय",
    reset2fa: "दो-चरणीय रीसेट करें",
    confirmReset2fa: "{email} का दो-चरणीय साइन-इन रीसेट करें? उनका ऑथेंटिकेटर और रिकवरी कोड काम करना बंद कर देंगे और वे साइन आउट हो जाएँगे।",
    twoFactorReset: "{email} का दो-चरणीय साइन-इन रीसेट हो गया। वे साइन आउट हो गए।",
    serverSettings: "सेटिंग्स",
    require2faFor: "इन भूमिकाओं के लिए दो-चरणीय साइन-इन ज़रूरी करें",
    require2faHint: "इन भूमिकाओं वाले पासवर्ड खाते अगले साइन-इन पर इसे सेट करते हैं; इसके बिना वाले सत्र ख़त्म हो जाते हैं। सिंगल साइन-ऑन खातों से नहीं पूछा जाता: उनके चरण पहचान प्रदाता सँभालता है।",
    saveSettings: "सहेजें",
    settingsSaved: "सेटिंग्स सहेजी गईं।",
    settingsChanged: "पिछला बदलाव {when}, {who} द्वारा।",
    forgotPassword: "पासवर्ड भूल गए?",
    noMailReset: "पासवर्ड भूल गए? किसी एडमिन से उसे रीसेट करवाएँ।",
    resetTitle: "अपना पासवर्ड रीसेट करें",
    resetLede: "अपना ईमेल डालें। अगर उसका यहाँ खाता है, तो हम नया पासवर्ड सेट करने का लिंक भेजेंगे। लिंक 30 मिनट तक, एक बार चलता है।",
    sendResetLink: "लिंक भेजें",
    resetSent: "अगर {email} का यहाँ खाता है, तो लिंक भेजा जा रहा है। अपना इनबॉक्स देखें।",
    newPassword: "नया पासवर्ड (कम से कम 10 अक्षर)",
    setNewPassword: "नया पासवर्ड सेट करें",
    passwordChanged: "आपका पासवर्ड बदल गया और हर सत्र साइन आउट हो गया। नए पासवर्ड से साइन इन करें।",
    resetLinkBad: "यह लिंक अब काम नहीं करता। नया लिंक माँगें।",
    backToSignIn: "साइन-इन पर लौटें",
    resetNoMail: "इस सर्वर पर ईमेल से पासवर्ड रीसेट सेट नहीं है। किसी एडमिन से पासवर्ड रीसेट करवाएँ।",
    auditIntegrity: "अखंडता (बीटा)",
    auditIntegrityLede: "हर घटना पिछली घटना से जुड़ी है और हस्ताक्षरित चेकपॉइंट हर स्ट्रीम का नाम लेते हैं। जाँच उन घटनाओं को पकड़ती है जो लिखे जाने के बाद बदली, हटाई या जोड़ी गईं।",
    verifyChain: "पूरा लॉग जाँचें",
    verifyWindow: "फ़िल्टर की तारीखें जाँचें",
    checkpointNow: "अभी चेकपॉइंट लिखें",
    checkpointWritten: "चेकपॉइंट लिखा गया ({n} स्ट्रीम)।",
    checkpointNothing: "अभी चेकपॉइंट के लिए कुछ नहीं है।",
    chainBroken: "लॉग सही नहीं है: {n} समस्याएँ।",
    chainStats: "{streams} स्ट्रीम में {events} घटनाएँ (श्रृंखला से पहले की {unchained}), {checkpoints} चेकपॉइंट",
    lastCheckpoint: "पिछला चेकपॉइंट {when}",
    auditPublicKey: "सार्वजनिक कुंजी {fp}",
    auditKeySource: "हस्ताक्षर कुंजी {source} से। इस सार्वजनिक कुंजी की एक प्रति कहीं और रखें: pw audit verify --public-key उससे जाँचता है।",
    statusTitle: "इस सर्वर पर सेट",
    statusMail: "ईमेल (SMTP)",
    statusNoDomains: "शेड्यूल्ड मेल के लिए कोई डोमेन अनुमत नहीं",
    statusSlo: "सिंगल लॉगआउट",
    statusSiem: "ऑडिट भेजना (SIEM)",
    siemQueue: "{queued} प्रतीक्षा में, {sent} भेजे, {dropped} छोड़े",
    siemBad: "PW_AUDIT_SIEM उपयोग योग्य पता नहीं है",
    statusAuditKey: "ऑडिट चेकपॉइंट कुंजी",
    notSet: "सेट नहीं",
    statusHint: "ये सर्वर के एनवायरनमेंट से आते हैं (docs/GOVERNANCE.md)।",
    chainOk: "प्रमाणित: चेकपॉइंट की गई कोई घटना बदली, हटाई या जोड़ी नहीं गई।",
    chainUnverified: "अप्रमाणित: कोई बदलाव नहीं दिखता, पर लॉग प्रमाणित भी नहीं है (नीचे देखें)।",
    chainError: "जाँच पूरी नहीं हो सकी: लॉग को अप्रमाणित मानें।",
    chainPending: "{n} नई घटनाएँ अभी चेकपॉइंट में नहीं हैं।",
    schedules: "शेड्यूल",
    schedulesLede: "सहेजी रिपोर्टें तय समय पर चलाएँ। हर रन आपके नाम से, उस समय की आपकी पहुँच के साथ बनता है, और डाउनलोड के लिए रखा या ईमेल किया जाता है।",
    addSchedule: "शेड्यूल जोड़ें",
    scheduleAdded: "शेड्यूल जोड़ा गया।",
    scheduleReport: "रिपोर्ट",
    scheduleWhen: "कब (cron)",
    scheduleCronOnly: "यह सर्वर शेड्यूल केवल {when} cron से चलाता है: दिन में एक से अधिक बार वाला शेड्यूल दिन में अधिकतम एक बार चलेगा।",
    cronDaily: "हर दिन 07:00 बजे",
    cronWeekly: "हर सोमवार 07:00 बजे",
    cronMonthly: "हर महीने की 1 तारीख़ 07:00 बजे",
    cronHourly: "हर घंटे",
    timeZone: "समय क्षेत्र",
    scheduleParams: "पैरामीटर (हर पंक्ति में एक name=value)",
    delivery: "डिलीवरी",
    deliverDownload: "डाउनलोड के लिए रखें",
    deliverEmail: "ईमेल",
    mailTo: "किसे (अनुमत डोमेन: {domains})",
    mailSubject: "विषय (वैकल्पिक)",
    mailAttach: "फ़ाइल संलग्न करें (बहुत बड़ी हो तो लिंक)",
    fromSnapshot: "स्नैपशॉट से बनाएँ",
    fromSnapshotHint: "उसी रिपोर्ट, पैरामीटर और पहुँच की ताज़ा कैश की गई रेंडरिंग हो तो उसे इस्तेमाल करें।",
    cronHint: "पाँच फ़ील्ड: मिनट घंटा महीने-का-दिन महीना सप्ताह-का-दिन, जैसे 0 7 * * 1 यानी सोमवार 07:00।",
    mailOffHint: "इस सर्वर पर ईमेल सेट नहीं है।",
    nextRun: "अगला रन",
    lastRun: "पिछला रन",
    mailLink: "लिंक",
    mailSent: "ईमेल किया ({how})",
    mailFailed: "ईमेल विफल: {error}",
    runNow: "अभी चलाएँ",
    scheduleStarted: "रन शुरू हो गया।",
    confirmDeleteSchedule: "यह शेड्यूल हटाएँ?",
    scheduleDeleted: "शेड्यूल हटाया गया।",
    noSchedules: "अभी कोई शेड्यूल नहीं।",
    snapshotTitle: "रिपोर्ट स्नैपशॉट कैश",
    snapshotTtl: "रेंडरिंग दोबारा इस्तेमाल करें (सेकंड, 0 = बंद)",
    snapshotMax: "कैश आकार सीमा (MB)",
    snapshotHint: "रेंडरिंग सिर्फ़ उसी रिपोर्ट संस्करण, पैरामीटर, फ़ॉर्मेट और समान पहुँच वाले दर्शक के लिए दोबारा इस्तेमाल होती है। रिपोर्ट सहेजने या पहुँच बदलने पर नए सिरे से शुरू होता है।",
    snapshotStats: "{n} स्नैपशॉट, {mb} MB",
    clearSnapshots: "कैश साफ़ करें",
    snapshotsCleared: "स्नैपशॉट कैश साफ़ हो गया।",
    passwordToConfirm: "पुष्टि के लिए आपका पासवर्ड",
    enrolEmailed: "हमने आपके पते पर एक कोड ईमेल किया है: ऑथेंटिकेटर सेट करने के लिए उसे डालें।",
    emailCode: "ईमेल वाला कोड"
  },
  es: {
    devicesTitle: "Navegadores conocidos",
    devicesHint: "Navegadores desde los que inició sesión. Los límites de inicio de sesión nunca los bloquean. Quite el que no reconozca.",
    devicesNone: "No hay navegadores conocidos.",
    deviceLastUsed: "último inicio de sesión {at}",
    deviceRemove: "Quitar",
    signOutEverywhere: "Cerrar sesión en todas partes y olvidar todos los navegadores",
    stateOn: "Activado",
    stateOff: "Desactivado",
    twoFactor: "Inicio de sesión en dos pasos",
    twoFactorLede: "Inicia sesión con tu contraseña y un código de 6 dígitos de una app de autenticación en tu teléfono.",
    twoFactorSso: "Inicias sesión con inicio de sesión único: tu proveedor de identidad pide el segundo factor.",
    twoFactorSince: "desde {date}",
    twoFactorRequired: "obligatorio para tu rol",
    recoveryLeft: "quedan {n} códigos de recuperación",
    turnOn2fa: "Activar el inicio de sesión en dos pasos",
    turnOff2fa: "Desactivar el inicio de sesión en dos pasos",
    newRecoveryCodes: "Nuevos códigos de recuperación",
    codeToConfirm: "Un código actual, o uno de recuperación, para confirmar",
    confirmCode: "Confirmar",
    twoFactorTurnedOn: "El inicio de sesión en dos pasos está activado. Se cerraron tus otras sesiones.",
    twoFactorTurnedOff: "El inicio de sesión en dos pasos está desactivado. Se cerraron tus otras sesiones.",
    qrAlt: "Código QR para tu app de autenticación",
    scanQr: "Escanea este código QR con una app de autenticación (Google Authenticator, Microsoft Authenticator, 1Password…) y escribe el código de 6 dígitos que muestra.",
    cantScan: "¿No puedes escanearlo? Escribe esta clave en la app:",
    authCode: "Código de tu app de autenticación",
    recoveryCodesTitle: "Tus códigos de recuperación",
    recoveryCodesHint: "Guárdalos en un lugar seguro. Cada uno te deja entrar una vez si pierdes el teléfono. Solo se muestran ahora.",
    mustEnrol: "Tu rol debe usar el inicio de sesión en dos pasos. Configúralo ahora para terminar de entrar.",
    enterCode: "Escribe el código de 6 dígitos de tu app de autenticación.",
    enterRecovery: "Escribe uno de tus códigos de recuperación.",
    recoveryCode: "Código de recuperación",
    useRecoveryCode: "Usar un código de recuperación",
    useAuthCode: "Usar un código de la app",
    verify: "Verificar",
    verifying: "Comprobando…",
    accountTitle: "Tu cuenta",
    twoFactorCol: "Dos pasos",
    reset2fa: "Restablecer dos pasos",
    confirmReset2fa: "¿Restablecer el inicio de sesión en dos pasos de {email}? Su autenticador y sus códigos de recuperación dejan de funcionar y se cierra su sesión.",
    twoFactorReset: "Se restableció el inicio de sesión en dos pasos de {email}. Se cerró su sesión.",
    serverSettings: "Configuración",
    require2faFor: "Exigir el inicio de sesión en dos pasos a estos roles",
    require2faHint: "Las cuentas con contraseña de estos roles lo configuran en su próximo inicio de sesión; las sesiones sin él terminan. A las cuentas de inicio de sesión único no se les pide: su proveedor de identidad gestiona los factores.",
    saveSettings: "Guardar",
    settingsSaved: "Configuración guardada.",
    settingsChanged: "Último cambio {when}, por {who}.",
    forgotPassword: "¿Olvidaste tu contraseña?",
    noMailReset: "¿Olvidaste tu contraseña? Pide a un administrador que la restablezca.",
    resetTitle: "Restablecer la contraseña",
    resetLede: "Escribe tu correo. Si tiene una cuenta aquí, te enviamos un enlace para poner una contraseña nueva. El enlace sirve una vez, durante 30 minutos.",
    sendResetLink: "Enviar el enlace",
    resetSent: "Si {email} tiene una cuenta aquí, el enlace va en camino. Revisa tu bandeja de entrada.",
    newPassword: "Contraseña nueva (al menos 10 caracteres)",
    setNewPassword: "Guardar la contraseña nueva",
    passwordChanged: "Tu contraseña cambió y se cerraron todas las sesiones. Inicia sesión con la contraseña nueva.",
    resetLinkBad: "Este enlace ya no funciona. Pide uno nuevo.",
    backToSignIn: "Volver a iniciar sesión",
    resetNoMail: "Este servidor no tiene configurado el restablecimiento por correo. Pide a un administrador que restablezca tu contraseña.",
    auditIntegrity: "Integridad (beta)",
    auditIntegrityLede: "Cada evento está encadenado al anterior y los puntos de control firmados nombran cada flujo. La comprobación encuentra eventos cambiados, borrados o añadidos después de escribirse.",
    verifyChain: "Comprobar todo el registro",
    verifyWindow: "Comprobar las fechas del filtro",
    checkpointNow: "Escribir un punto de control ahora",
    checkpointWritten: "Punto de control escrito ({n} flujos).",
    checkpointNothing: "Aún no hay nada que registrar.",
    chainBroken: "El registro no es íntegro: {n} problemas.",
    chainStats: "{events} eventos ({unchained} de antes de la cadena) en {streams} flujos, {checkpoints} puntos de control",
    lastCheckpoint: "último punto de control {when}",
    auditPublicKey: "Clave pública {fp}",
    auditKeySource: "Clave de firma de {source}. Guarda una copia de esta clave pública en otro lugar: pw audit verify --public-key comprueba con ella.",
    statusTitle: "Configurado en este servidor",
    statusMail: "Correo (SMTP)",
    statusNoDomains: "ningún dominio permitido para el correo programado",
    statusSlo: "Cierre de sesión único",
    statusSiem: "Envío de auditoría (SIEM)",
    siemQueue: "{queued} en espera, {sent} enviados, {dropped} descartados",
    siemBad: "PW_AUDIT_SIEM no es una dirección utilizable",
    statusAuditKey: "Clave de los puntos de control",
    notSet: "sin configurar",
    statusHint: "Vienen del entorno del servidor (docs/GOVERNANCE.md).",
    chainOk: "Probado: ningún evento con punto de control se cambió, borró ni añadió.",
    chainUnverified: "Sin verificar: nada indica un cambio, pero nada prueba el registro (ver abajo).",
    chainError: "La comprobación no pudo terminar: considera el registro sin probar.",
    chainPending: "{n} eventos más nuevos aún no tienen punto de control.",
    schedules: "Programaciones",
    schedulesLede: "Ejecuta informes guardados según un horario. Cada ejecución se genera como tú, con tu acceso en ese momento, y se guarda para descargar o se envía por correo.",
    addSchedule: "Añadir programación",
    scheduleAdded: "Programación añadida.",
    scheduleReport: "Informe",
    scheduleWhen: "Cuándo (cron)",
    scheduleCronOnly: "Este servidor ejecuta las programaciones solo con un cron {when}: una más frecuente que diaria se ejecuta como mucho una vez al día.",
    cronDaily: "Cada día a las 07:00",
    cronWeekly: "Los lunes a las 07:00",
    cronMonthly: "El día 1 de cada mes a las 07:00",
    cronHourly: "Cada hora",
    timeZone: "Zona horaria",
    scheduleParams: "Parámetros (un nombre=valor por línea)",
    delivery: "Entrega",
    deliverDownload: "Guardar para descargar",
    deliverEmail: "Correo",
    mailTo: "Para (dominios permitidos: {domains})",
    mailSubject: "Asunto (opcional)",
    mailAttach: "Adjuntar el archivo (un enlace si es demasiado grande)",
    fromSnapshot: "Generar desde instantánea",
    fromSnapshotHint: "Reutiliza una generación reciente en caché del mismo informe, parámetros y acceso si existe.",
    cronHint: "Cinco campos: minuto hora día-del-mes mes día-de-la-semana, p. ej. 0 7 * * 1 para los lunes a las 07:00.",
    mailOffHint: "El correo no está configurado en este servidor.",
    nextRun: "Próxima ejecución",
    lastRun: "Última ejecución",
    mailLink: "enlace",
    mailSent: "enviado ({how})",
    mailFailed: "falló el correo: {error}",
    runNow: "Ejecutar ahora",
    scheduleStarted: "La ejecución ha comenzado.",
    confirmDeleteSchedule: "¿Eliminar esta programación?",
    scheduleDeleted: "Programación eliminada.",
    noSchedules: "Aún no hay programaciones.",
    snapshotTitle: "Caché de instantáneas de informes",
    snapshotTtl: "Reutilizar una generación durante (segundos, 0 = desactivado)",
    snapshotMax: "Límite de tamaño de la caché (MB)",
    snapshotHint: "Una generación solo se reutiliza para la misma versión del informe, parámetros, formato y lector con el mismo acceso. Guardar un informe o cambiar accesos empieza de cero.",
    snapshotStats: "{n} instantáneas, {mb} MB",
    clearSnapshots: "Vaciar la caché",
    snapshotsCleared: "La caché de instantáneas está vacía.",
    passwordToConfirm: "Tu contraseña, para confirmar que eres tú",
    enrolEmailed: "Te enviamos un código por correo: escríbelo para configurar tu autenticador.",
    emailCode: "Código del correo"
  },
  fr: {
    devicesTitle: "Navigateurs connus",
    devicesHint: "Les navigateurs depuis lesquels vous vous êtes connecté. Les limites de connexion ne les bloquent jamais. Retirez celui que vous ne reconnaissez pas.",
    devicesNone: "Aucun navigateur connu.",
    deviceLastUsed: "dernière connexion {at}",
    deviceRemove: "Retirer",
    signOutEverywhere: "Se déconnecter partout et oublier tous les navigateurs",
    stateOn: "Activée",
    stateOff: "Désactivée",
    twoFactor: "Connexion en deux étapes",
    twoFactorLede: "Connectez-vous avec votre mot de passe et un code à 6 chiffres d’une application d’authentification sur votre téléphone.",
    twoFactorSso: "Vous vous connectez par authentification unique : votre fournisseur d’identité demande le second facteur.",
    twoFactorSince: "depuis le {date}",
    twoFactorRequired: "obligatoire pour votre rôle",
    recoveryLeft: "il reste {n} codes de secours",
    turnOn2fa: "Activer la connexion en deux étapes",
    turnOff2fa: "Désactiver la connexion en deux étapes",
    newRecoveryCodes: "Nouveaux codes de secours",
    codeToConfirm: "Un code actuel, ou un code de secours, pour confirmer",
    confirmCode: "Confirmer",
    twoFactorTurnedOn: "La connexion en deux étapes est activée. Vos autres sessions sont fermées.",
    twoFactorTurnedOff: "La connexion en deux étapes est désactivée. Vos autres sessions sont fermées.",
    qrAlt: "Code QR pour votre application d’authentification",
    scanQr: "Scannez ce code QR avec une application d’authentification (Google Authenticator, Microsoft Authenticator, 1Password…), puis saisissez le code à 6 chiffres affiché.",
    cantScan: "Impossible de le scanner ? Saisissez cette clé dans l’application :",
    authCode: "Code de votre application d’authentification",
    recoveryCodesTitle: "Vos codes de secours",
    recoveryCodesHint: "Conservez-les en lieu sûr. Chacun permet une connexion si vous perdez votre téléphone. Ils ne sont affichés que maintenant.",
    mustEnrol: "Votre rôle impose la connexion en deux étapes. Configurez-la maintenant pour terminer la connexion.",
    enterCode: "Saisissez le code à 6 chiffres de votre application d’authentification.",
    enterRecovery: "Saisissez l’un de vos codes de secours.",
    recoveryCode: "Code de secours",
    useRecoveryCode: "Utiliser un code de secours",
    useAuthCode: "Utiliser un code de l’application",
    verify: "Vérifier",
    verifying: "Vérification…",
    accountTitle: "Votre compte",
    twoFactorCol: "Deux étapes",
    reset2fa: "Réinitialiser les deux étapes",
    confirmReset2fa: "Réinitialiser la connexion en deux étapes de {email} ? Son authentificateur et ses codes de secours cessent de fonctionner et sa session est fermée.",
    twoFactorReset: "La connexion en deux étapes de {email} est réinitialisée. Sa session est fermée.",
    serverSettings: "Paramètres",
    require2faFor: "Imposer la connexion en deux étapes à ces rôles",
    require2faHint: "Les comptes à mot de passe de ces rôles la configurent à leur prochaine connexion ; les sessions sans elle se terminent. Les comptes à authentification unique ne sont pas concernés : leur fournisseur d’identité gère les facteurs.",
    saveSettings: "Enregistrer",
    settingsSaved: "Paramètres enregistrés.",
    settingsChanged: "Dernière modification {when}, par {who}.",
    forgotPassword: "Mot de passe oublié ?",
    noMailReset: "Mot de passe oublié ? Demandez à un administrateur de le réinitialiser.",
    resetTitle: "Réinitialiser le mot de passe",
    resetLede: "Saisissez votre e-mail. S’il correspond à un compte ici, nous envoyons un lien pour choisir un nouveau mot de passe. Le lien sert une fois, pendant 30 minutes.",
    sendResetLink: "Envoyer le lien",
    resetSent: "Si {email} a un compte ici, un lien est en route. Consultez votre boîte de réception.",
    newPassword: "Nouveau mot de passe (10 caractères au moins)",
    setNewPassword: "Enregistrer le nouveau mot de passe",
    passwordChanged: "Votre mot de passe est changé et toutes les sessions sont fermées. Connectez-vous avec le nouveau mot de passe.",
    resetLinkBad: "Ce lien ne fonctionne plus. Demandez-en un nouveau.",
    backToSignIn: "Retour à la connexion",
    resetNoMail: "La réinitialisation par e-mail n’est pas configurée sur ce serveur. Demandez à un administrateur de réinitialiser votre mot de passe.",
    auditIntegrity: "Intégrité (bêta)",
    auditIntegrityLede: "Chaque événement est chaîné au précédent et des points de contrôle signés nomment chaque flux. La vérification trouve les événements modifiés, supprimés ou ajoutés après leur écriture.",
    verifyChain: "Vérifier tout le journal",
    verifyWindow: "Vérifier les dates du filtre",
    checkpointNow: "Écrire un point de contrôle maintenant",
    checkpointWritten: "Point de contrôle écrit ({n} flux).",
    checkpointNothing: "Rien à consigner pour l’instant.",
    chainBroken: "Le journal n’est pas intègre : {n} problèmes.",
    chainStats: "{events} événements ({unchained} d’avant la chaîne) dans {streams} flux, {checkpoints} points de contrôle",
    lastCheckpoint: "dernier point de contrôle {when}",
    auditPublicKey: "Clé publique {fp}",
    auditKeySource: "Clé de signature issue de {source}. Gardez une copie de cette clé publique ailleurs : pw audit verify --public-key vérifie avec elle.",
    statusTitle: "Configuré sur ce serveur",
    statusMail: "E-mail (SMTP)",
    statusNoDomains: "aucun domaine autorisé pour l’envoi planifié",
    statusSlo: "Déconnexion unique",
    statusSiem: "Envoi de l’audit (SIEM)",
    siemQueue: "{queued} en attente, {sent} envoyés, {dropped} abandonnés",
    siemBad: "PW_AUDIT_SIEM n’est pas une adresse utilisable",
    statusAuditKey: "Clé des points de contrôle",
    notSet: "non défini",
    statusHint: "Ces valeurs viennent de l’environnement du serveur (docs/GOVERNANCE.md).",
    chainOk: "Prouvé : aucun événement couvert par un point de contrôle n’a été modifié, supprimé ou ajouté.",
    chainUnverified: "Non vérifié : rien n’indique de modification, mais rien ne prouve le journal (voir ci-dessous).",
    chainError: "La vérification n’a pas pu aboutir : considérez le journal comme non prouvé.",
    chainPending: "{n} événements plus récents ne sont pas encore couverts par un point de contrôle.",
    schedules: "Planifications",
    schedulesLede: "Exécutez des rapports enregistrés selon un calendrier. Chaque exécution est produite en votre nom, avec vos droits du moment, puis conservée pour téléchargement ou envoyée par e-mail.",
    addSchedule: "Ajouter une planification",
    scheduleAdded: "Planification ajoutée.",
    scheduleReport: "Rapport",
    scheduleWhen: "Quand (cron)",
    scheduleCronOnly: "Ce serveur exécute les planifications uniquement via un cron {when} : une planification plus fréquente que quotidienne s’exécute au plus une fois par jour.",
    cronDaily: "Chaque jour à 07:00",
    cronWeekly: "Le lundi à 07:00",
    cronMonthly: "Le 1er de chaque mois à 07:00",
    cronHourly: "Toutes les heures",
    timeZone: "Fuseau horaire",
    scheduleParams: "Paramètres (un nom=valeur par ligne)",
    delivery: "Livraison",
    deliverDownload: "Conserver pour téléchargement",
    deliverEmail: "E-mail",
    mailTo: "À (domaines autorisés : {domains})",
    mailSubject: "Objet (facultatif)",
    mailAttach: "Joindre le fichier (un lien s’il est trop gros)",
    fromSnapshot: "Produire depuis l’instantané",
    fromSnapshotHint: "Réutilise un rendu récent en cache du même rapport, des mêmes paramètres et droits, s’il existe.",
    cronHint: "Cinq champs : minute heure jour-du-mois mois jour-de-la-semaine, p. ex. 0 7 * * 1 pour le lundi à 07:00.",
    mailOffHint: "L’e-mail n’est pas configuré sur ce serveur.",
    nextRun: "Prochaine exécution",
    lastRun: "Dernière exécution",
    mailLink: "lien",
    mailSent: "envoyé ({how})",
    mailFailed: "échec de l’e-mail : {error}",
    runNow: "Exécuter maintenant",
    scheduleStarted: "L’exécution a démarré.",
    confirmDeleteSchedule: "Supprimer cette planification ?",
    scheduleDeleted: "Planification supprimée.",
    noSchedules: "Aucune planification pour l’instant.",
    snapshotTitle: "Cache des instantanés de rapports",
    snapshotTtl: "Réutiliser un rendu pendant (secondes, 0 = désactivé)",
    snapshotMax: "Taille maximale du cache (Mo)",
    snapshotHint: "Un rendu n’est réutilisé que pour la même version du rapport, les mêmes paramètres, format et lecteur aux mêmes droits. Enregistrer un rapport ou changer les droits repart de zéro.",
    snapshotStats: "{n} instantanés, {mb} Mo",
    clearSnapshots: "Vider le cache",
    snapshotsCleared: "Le cache des instantanés est vidé.",
    passwordToConfirm: "Votre mot de passe, pour confirmer que c’est vous",
    enrolEmailed: "Nous avons envoyé un code à votre adresse : saisissez-le pour configurer votre authentificateur.",
    emailCode: "Code reçu par e-mail"
  },
  de: {
    devicesTitle: "Bekannte Browser",
    devicesHint: "Browser, mit denen Sie sich angemeldet haben. Anmeldelimits sperren sie nie. Entfernen Sie einen, den Sie nicht kennen.",
    devicesNone: "Keine bekannten Browser.",
    deviceLastUsed: "letzte Anmeldung {at}",
    deviceRemove: "Entfernen",
    signOutEverywhere: "Überall abmelden und alle Browser vergessen",
    stateOn: "Ein",
    stateOff: "Aus",
    twoFactor: "Zwei-Faktor-Anmeldung",
    twoFactorLede: "Melden Sie sich mit Ihrem Passwort und einem 6-stelligen Code aus einer Authenticator-App auf Ihrem Telefon an.",
    twoFactorSso: "Sie melden sich per Single Sign-on an: Ihr Identitätsanbieter fragt den zweiten Faktor ab.",
    twoFactorSince: "seit {date}",
    twoFactorRequired: "für Ihre Rolle vorgeschrieben",
    recoveryLeft: "noch {n} Wiederherstellungscodes",
    turnOn2fa: "Zwei-Faktor-Anmeldung einschalten",
    turnOff2fa: "Zwei-Faktor-Anmeldung ausschalten",
    newRecoveryCodes: "Neue Wiederherstellungscodes",
    codeToConfirm: "Ein aktueller Code oder ein Wiederherstellungscode zur Bestätigung",
    confirmCode: "Bestätigen",
    twoFactorTurnedOn: "Die Zwei-Faktor-Anmeldung ist eingeschaltet. Ihre anderen Sitzungen wurden abgemeldet.",
    twoFactorTurnedOff: "Die Zwei-Faktor-Anmeldung ist ausgeschaltet. Ihre anderen Sitzungen wurden abgemeldet.",
    qrAlt: "QR-Code für Ihre Authenticator-App",
    scanQr: "Scannen Sie diesen QR-Code mit einer Authenticator-App (Google Authenticator, Microsoft Authenticator, 1Password…) und geben Sie dann den angezeigten 6-stelligen Code ein.",
    cantScan: "Scannen klappt nicht? Geben Sie diesen Schlüssel in der App ein:",
    authCode: "Code aus Ihrer Authenticator-App",
    recoveryCodesTitle: "Ihre Wiederherstellungscodes",
    recoveryCodesHint: "Bewahren Sie sie sicher auf. Jeder meldet Sie einmal an, falls Sie Ihr Telefon verlieren. Sie werden nur jetzt angezeigt.",
    mustEnrol: "Ihre Rolle verlangt die Zwei-Faktor-Anmeldung. Richten Sie sie jetzt ein, um die Anmeldung abzuschließen.",
    enterCode: "Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein.",
    enterRecovery: "Geben Sie einen Ihrer Wiederherstellungscodes ein.",
    recoveryCode: "Wiederherstellungscode",
    useRecoveryCode: "Wiederherstellungscode verwenden",
    useAuthCode: "Code aus der App verwenden",
    verify: "Prüfen",
    verifying: "Wird geprüft…",
    accountTitle: "Ihr Konto",
    twoFactorCol: "Zwei-Faktor",
    reset2fa: "Zwei-Faktor zurücksetzen",
    confirmReset2fa: "Die Zwei-Faktor-Anmeldung von {email} zurücksetzen? Authenticator und Wiederherstellungscodes funktionieren dann nicht mehr, und die Person wird abgemeldet.",
    twoFactorReset: "Die Zwei-Faktor-Anmeldung von {email} ist zurückgesetzt. Die Person wurde abgemeldet.",
    serverSettings: "Einstellungen",
    require2faFor: "Zwei-Faktor-Anmeldung für diese Rollen vorschreiben",
    require2faHint: "Passwortkonten mit diesen Rollen richten sie bei der nächsten Anmeldung ein; Sitzungen ohne sie enden. Single-Sign-on-Konten werden nicht gefragt: Ihre Faktoren verwaltet der Identitätsanbieter.",
    saveSettings: "Speichern",
    settingsSaved: "Einstellungen gespeichert.",
    settingsChanged: "Zuletzt geändert {when} von {who}.",
    forgotPassword: "Passwort vergessen?",
    noMailReset: "Passwort vergessen? Bitten Sie einen Admin, es zurückzusetzen.",
    resetTitle: "Passwort zurücksetzen",
    resetLede: "Geben Sie Ihre E-Mail-Adresse ein. Gibt es dazu ein Konto, senden wir einen Link für ein neues Passwort. Der Link gilt einmal, 30 Minuten lang.",
    sendResetLink: "Link senden",
    resetSent: "Falls {email} hier ein Konto hat, ist ein Link unterwegs. Sehen Sie in Ihrem Posteingang nach.",
    newPassword: "Neues Passwort (mindestens 10 Zeichen)",
    setNewPassword: "Neues Passwort speichern",
    passwordChanged: "Ihr Passwort ist geändert und alle Sitzungen sind abgemeldet. Melden Sie sich mit dem neuen Passwort an.",
    resetLinkBad: "Dieser Link funktioniert nicht mehr. Fordern Sie einen neuen an.",
    backToSignIn: "Zurück zur Anmeldung",
    resetNoMail: "Das Zurücksetzen per E-Mail ist auf diesem Server nicht eingerichtet. Bitten Sie einen Admin, Ihr Passwort zurückzusetzen.",
    auditIntegrity: "Integrität (Beta)",
    auditIntegrityLede: "Jedes Ereignis ist mit dem vorigen verkettet, und signierte Prüfpunkte nennen jeden Strom. Die Prüfung findet Ereignisse, die nach dem Schreiben geändert, entfernt oder eingefügt wurden.",
    verifyChain: "Ganzes Protokoll prüfen",
    verifyWindow: "Daten aus dem Filter prüfen",
    checkpointNow: "Jetzt einen Prüfpunkt schreiben",
    checkpointWritten: "Prüfpunkt geschrieben ({n} Ströme).",
    checkpointNothing: "Noch nichts für einen Prüfpunkt.",
    chainBroken: "Das Protokoll ist nicht intakt: {n} Probleme.",
    chainStats: "{events} Ereignisse ({unchained} von vor der Kette) in {streams} Strömen, {checkpoints} Prüfpunkte",
    lastCheckpoint: "letzter Prüfpunkt {when}",
    auditPublicKey: "Öffentlicher Schlüssel {fp}",
    auditKeySource: "Signaturschlüssel aus {source}. Bewahren Sie eine Kopie dieses öffentlichen Schlüssels anderswo auf: pw audit verify --public-key prüft damit.",
    statusTitle: "Auf diesem Server eingerichtet",
    statusMail: "E-Mail (SMTP)",
    statusNoDomains: "keine Domains für geplante Mails erlaubt",
    statusSlo: "Single Logout",
    statusSiem: "Audit-Versand (SIEM)",
    siemQueue: "{queued} wartend, {sent} gesendet, {dropped} verworfen",
    siemBad: "PW_AUDIT_SIEM ist keine brauchbare Adresse",
    statusAuditKey: "Schlüssel der Prüfpunkte",
    notSet: "nicht gesetzt",
    statusHint: "Diese Werte kommen aus der Serverumgebung (docs/GOVERNANCE.md).",
    chainOk: "Bewiesen: kein Ereignis mit Prüfpunkt wurde geändert, entfernt oder eingefügt.",
    chainUnverified: "Nicht bestätigt: nichts deutet auf eine Änderung hin, aber nichts beweist das Protokoll (siehe unten).",
    chainError: "Die Prüfung konnte nicht abgeschlossen werden: behandeln Sie das Protokoll als unbewiesen.",
    chainPending: "{n} neuere Ereignisse haben noch keinen Prüfpunkt.",
    schedules: "Zeitpläne",
    schedulesLede: "Gespeicherte Berichte nach Zeitplan ausführen. Jeder Lauf wird in Ihrem Namen mit Ihren aktuellen Rechten erstellt und zum Herunterladen aufbewahrt oder per E-Mail versandt.",
    addSchedule: "Zeitplan hinzufügen",
    scheduleAdded: "Zeitplan hinzugefügt.",
    scheduleReport: "Bericht",
    scheduleWhen: "Wann (cron)",
    scheduleCronOnly: "Dieser Server führt Zeitpläne nur über einen Cron ({when}) aus: Ein Zeitplan, der öfter als täglich läuft, läuft höchstens einmal am Tag.",
    cronDaily: "Täglich um 07:00",
    cronWeekly: "Montags um 07:00",
    cronMonthly: "Am 1. jedes Monats um 07:00",
    cronHourly: "Stündlich",
    timeZone: "Zeitzone",
    scheduleParams: "Parameter (ein name=wert pro Zeile)",
    delivery: "Zustellung",
    deliverDownload: "Zum Herunterladen aufbewahren",
    deliverEmail: "E-Mail",
    mailTo: "An (erlaubte Domains: {domains})",
    mailSubject: "Betreff (optional)",
    mailAttach: "Datei anhängen (ein Link, wenn sie zu groß ist)",
    fromSnapshot: "Aus Snapshot erstellen",
    fromSnapshotHint: "Verwendet eine frische, zwischengespeicherte Ausgabe desselben Berichts mit denselben Parametern und Rechten, wenn vorhanden.",
    cronHint: "Fünf Felder: Minute Stunde Tag-des-Monats Monat Wochentag, z. B. 0 7 * * 1 für montags um 07:00.",
    mailOffHint: "E-Mail ist auf diesem Server nicht eingerichtet.",
    nextRun: "Nächster Lauf",
    lastRun: "Letzter Lauf",
    mailLink: "Link",
    mailSent: "gemailt ({how})",
    mailFailed: "E-Mail fehlgeschlagen: {error}",
    runNow: "Jetzt ausführen",
    scheduleStarted: "Der Lauf hat begonnen.",
    confirmDeleteSchedule: "Diesen Zeitplan löschen?",
    scheduleDeleted: "Zeitplan gelöscht.",
    noSchedules: "Noch keine Zeitpläne.",
    snapshotTitle: "Snapshot-Cache für Berichte",
    snapshotTtl: "Ausgabe wiederverwenden für (Sekunden, 0 = aus)",
    snapshotMax: "Größenlimit des Caches (MB)",
    snapshotHint: "Eine Ausgabe wird nur für dieselbe Berichtsversion, dieselben Parameter, dasselbe Format und einen Leser mit denselben Rechten wiederverwendet. Speichern oder geänderte Rechte beginnen neu.",
    snapshotStats: "{n} Snapshots, {mb} MB",
    clearSnapshots: "Cache leeren",
    snapshotsCleared: "Der Snapshot-Cache ist geleert.",
    passwordToConfirm: "Ihr Passwort, zur Bestätigung",
    enrolEmailed: "Wir haben einen Code an Ihre Adresse gesendet: Geben Sie ihn ein, um Ihren Authenticator einzurichten.",
    emailCode: "Code aus der E-Mail"
  },
  ja: {
    devicesTitle: "既知のブラウザー",
    devicesHint: "サインインに使ったブラウザーです。サインイン制限でロックされることはありません。心当たりのないものは削除してください。",
    devicesNone: "既知のブラウザーはありません。",
    deviceLastUsed: "最終サインイン {at}",
    deviceRemove: "削除",
    signOutEverywhere: "すべての場所でサインアウトし、すべてのブラウザーを削除",
    stateOn: "オン",
    stateOff: "オフ",
    twoFactor: "2 段階サインイン",
    twoFactorLede: "パスワードと、スマートフォンの認証アプリに表示される 6 桁のコードでサインインします。",
    twoFactorSso: "シングルサインオンでサインインしています。2 つ目の要素は ID プロバイダーが確認します。",
    twoFactorSince: "{date} から",
    twoFactorRequired: "あなたのロールでは必須",
    recoveryLeft: "回復コードの残り {n} 個",
    turnOn2fa: "2 段階サインインをオンにする",
    turnOff2fa: "2 段階サインインをオフにする",
    newRecoveryCodes: "回復コードを再発行",
    codeToConfirm: "確認のため、現在のコードか回復コードを入力",
    confirmCode: "確認",
    twoFactorTurnedOn: "2 段階サインインがオンになりました。ほかのセッションはサインアウトされました。",
    twoFactorTurnedOff: "2 段階サインインがオフになりました。ほかのセッションはサインアウトされました。",
    qrAlt: "認証アプリ用の QR コード",
    scanQr: "この QR コードを認証アプリ（Google Authenticator、Microsoft Authenticator、1Password など）で読み取り、表示された 6 桁のコードを入力してください。",
    cantScan: "読み取れない場合は、このキーをアプリに入力してください:",
    authCode: "認証アプリのコード",
    recoveryCodesTitle: "回復コード",
    recoveryCodesHint: "安全な場所に保管してください。スマートフォンをなくしたとき、各コードで 1 回サインインできます。表示されるのは今だけです。",
    mustEnrol: "あなたのロールでは 2 段階サインインが必須です。サインインを完了するには今すぐ設定してください。",
    enterCode: "認証アプリの 6 桁のコードを入力してください。",
    enterRecovery: "回復コードを 1 つ入力してください。",
    recoveryCode: "回復コード",
    useRecoveryCode: "回復コードを使う",
    useAuthCode: "アプリのコードを使う",
    verify: "確認",
    verifying: "確認中…",
    accountTitle: "アカウント",
    twoFactorCol: "2 段階",
    reset2fa: "2 段階をリセット",
    confirmReset2fa: "{email} の 2 段階サインインをリセットしますか？認証アプリと回復コードは使えなくなり、サインアウトされます。",
    twoFactorReset: "{email} の 2 段階サインインをリセットしました。サインアウトされました。",
    serverSettings: "設定",
    require2faFor: "次のロールに 2 段階サインインを必須にする",
    require2faHint: "これらのロールのパスワードアカウントは次回サインイン時に設定します。設定していないセッションは終了します。シングルサインオンのアカウントは対象外です（要素は ID プロバイダーが管理します）。",
    saveSettings: "保存",
    settingsSaved: "設定を保存しました。",
    settingsChanged: "最終変更: {when}、{who}。",
    forgotPassword: "パスワードを忘れた場合",
    noMailReset: "パスワードを忘れた場合は、管理者にリセットを依頼してください。",
    resetTitle: "パスワードのリセット",
    resetLede: "メールアドレスを入力してください。ここにアカウントがあれば、新しいパスワードを設定するリンクを送ります。リンクは 30 分間、1 回だけ使えます。",
    sendResetLink: "リンクを送信",
    resetSent: "{email} のアカウントがあれば、リンクを送信しました。受信トレイを確認してください。",
    newPassword: "新しいパスワード（10 文字以上）",
    setNewPassword: "新しいパスワードを設定",
    passwordChanged: "パスワードを変更し、すべてのセッションをサインアウトしました。新しいパスワードでサインインしてください。",
    resetLinkBad: "このリンクはもう使えません。新しいリンクを依頼してください。",
    backToSignIn: "サインインに戻る",
    resetNoMail: "このサーバーではメールによるパスワードリセットが設定されていません。管理者にリセットを依頼してください。",
    auditIntegrity: "完全性（ベータ）",
    auditIntegrityLede: "各イベントは直前のイベントと連鎖し、署名付きチェックポイントがすべてのストリームを記録します。書き込み後に変更・削除・追加されたイベントを検出します。",
    verifyChain: "ログ全体を検証",
    verifyWindow: "フィルターの日付を検証",
    checkpointNow: "今すぐチェックポイントを書く",
    checkpointWritten: "チェックポイントを書きました（{n} ストリーム）。",
    checkpointNothing: "まだ記録するものがありません。",
    chainBroken: "ログに問題があります: {n} 件。",
    chainStats: "{streams} ストリームに {events} 件のイベント（連鎖以前のもの {unchained} 件）、チェックポイント {checkpoints} 件",
    lastCheckpoint: "最後のチェックポイント {when}",
    auditPublicKey: "公開鍵 {fp}",
    auditKeySource: "署名鍵の出所: {source}。この公開鍵の写しを別の場所に保管してください。pw audit verify --public-key で検証できます。",
    statusTitle: "このサーバーの設定",
    statusMail: "メール（SMTP）",
    statusNoDomains: "予定メールで許可されたドメインなし",
    statusSlo: "シングルログアウト",
    statusSiem: "監査ログ送信（SIEM）",
    siemQueue: "待機 {queued}、送信 {sent}、破棄 {dropped}",
    siemBad: "PW_AUDIT_SIEM は使えるアドレスではありません",
    statusAuditKey: "チェックポイントの鍵",
    notSet: "未設定",
    statusHint: "サーバーの環境変数から読み込まれます（docs/GOVERNANCE.md）。",
    chainOk: "証明済み: チェックポイント済みのイベントに変更・削除・追加はありません。",
    chainUnverified: "未検証: 変更の形跡はありませんが、ログを証明するものもありません（下記参照）。",
    chainError: "検証を完了できませんでした。ログは未証明として扱ってください。",
    chainPending: "新しいイベント {n} 件はまだチェックポイントにありません。",
    schedules: "スケジュール",
    schedulesLede: "保存したレポートを決まった時刻に実行します。各実行はその時点のあなたの権限で作成され、ダウンロード用に保管されるかメールで送られます。",
    addSchedule: "スケジュールを追加",
    scheduleAdded: "スケジュールを追加しました。",
    scheduleReport: "レポート",
    scheduleWhen: "実行時刻（cron）",
    scheduleCronOnly: "このサーバーは {when} の cron でのみスケジュールを実行します。1日に複数回のスケジュールは最大1日1回しか実行されません。",
    cronDaily: "毎日 07:00",
    cronWeekly: "毎週月曜 07:00",
    cronMonthly: "毎月 1 日 07:00",
    cronHourly: "毎時",
    timeZone: "タイムゾーン",
    scheduleParams: "パラメーター（1 行に name=value を 1 つ）",
    delivery: "配信",
    deliverDownload: "ダウンロード用に保管",
    deliverEmail: "メール",
    mailTo: "宛先（許可ドメイン: {domains}）",
    mailSubject: "件名（任意）",
    mailAttach: "ファイルを添付（大きすぎる場合はリンク）",
    fromSnapshot: "スナップショットから作成",
    fromSnapshotHint: "同じレポート・パラメーター・権限の新しいキャッシュがあれば再利用します。",
    cronHint: "5 つのフィールド: 分 時 日 月 曜日。例: 0 7 * * 1 は毎週月曜 07:00。",
    mailOffHint: "このサーバーではメールが設定されていません。",
    nextRun: "次回実行",
    lastRun: "前回実行",
    mailLink: "リンク",
    mailSent: "送信済み（{how}）",
    mailFailed: "メール失敗: {error}",
    runNow: "今すぐ実行",
    scheduleStarted: "実行を開始しました。",
    confirmDeleteSchedule: "このスケジュールを削除しますか？",
    scheduleDeleted: "スケジュールを削除しました。",
    noSchedules: "スケジュールはまだありません。",
    snapshotTitle: "レポートのスナップショットキャッシュ",
    snapshotTtl: "出力を再利用する時間（秒、0 = オフ）",
    snapshotMax: "キャッシュの上限（MB）",
    snapshotHint: "同じレポート版・パラメーター・形式・同じ権限の閲覧者に限って再利用します。レポートの保存や権限の変更で新しくなります。",
    snapshotStats: "スナップショット {n} 件、{mb} MB",
    clearSnapshots: "キャッシュを消去",
    snapshotsCleared: "スナップショットキャッシュを消去しました。",
    passwordToConfirm: "本人確認のためのパスワード",
    enrolEmailed: "あなたのアドレスにコードを送りました。認証アプリを設定するには入力してください。",
    emailCode: "メールのコード"
  },
  zh: {
    devicesTitle: "已知浏览器",
    devicesHint: "您登录过的浏览器。登录限制不会锁定它们。请移除您不认识的浏览器。",
    devicesNone: "没有已知浏览器。",
    deviceLastUsed: "上次登录 {at}",
    deviceRemove: "移除",
    signOutEverywhere: "在所有位置退出并忘记所有浏览器",
    stateOn: "已开启",
    stateOff: "已关闭",
    twoFactor: "两步登录",
    twoFactorLede: "使用密码和手机身份验证器应用中的 6 位代码登录。",
    twoFactorSso: "你通过单点登录登录：第二个因素由你的身份提供商验证。",
    twoFactorSince: "自 {date} 起",
    twoFactorRequired: "你的角色必须使用",
    recoveryLeft: "还剩 {n} 个恢复代码",
    turnOn2fa: "开启两步登录",
    turnOff2fa: "关闭两步登录",
    newRecoveryCodes: "生成新的恢复代码",
    codeToConfirm: "输入当前代码或恢复代码以确认",
    confirmCode: "确认",
    twoFactorTurnedOn: "两步登录已开启。你的其他会话已退出。",
    twoFactorTurnedOff: "两步登录已关闭。你的其他会话已退出。",
    qrAlt: "用于身份验证器应用的二维码",
    scanQr: "用身份验证器应用（Google Authenticator、Microsoft Authenticator、1Password 等）扫描此二维码，然后输入它显示的 6 位代码。",
    cantScan: "无法扫描？请在应用中输入此密钥：",
    authCode: "身份验证器应用中的代码",
    recoveryCodesTitle: "你的恢复代码",
    recoveryCodesHint: "请妥善保存。手机丢失时，每个代码可登录一次。它们只在此时显示。",
    mustEnrol: "你的角色必须使用两步登录。请现在设置以完成登录。",
    enterCode: "输入身份验证器应用中的 6 位代码。",
    enterRecovery: "输入一个恢复代码。",
    recoveryCode: "恢复代码",
    useRecoveryCode: "使用恢复代码",
    useAuthCode: "使用应用中的代码",
    verify: "验证",
    verifying: "正在验证…",
    accountTitle: "你的账户",
    twoFactorCol: "两步登录",
    reset2fa: "重置两步登录",
    confirmReset2fa: "要重置 {email} 的两步登录吗？其身份验证器和恢复代码将失效，并会被退出登录。",
    twoFactorReset: "已重置 {email} 的两步登录，并已将其退出登录。",
    serverSettings: "设置",
    require2faFor: "要求以下角色使用两步登录",
    require2faHint: "这些角色的密码账户会在下次登录时设置；未设置的会话将结束。单点登录账户不受影响：其验证因素由身份提供商管理。",
    saveSettings: "保存",
    settingsSaved: "设置已保存。",
    settingsChanged: "最近一次由 {who} 于 {when} 更改。",
    forgotPassword: "忘记密码？",
    noMailReset: "忘记密码？请让管理员重置。",
    resetTitle: "重置密码",
    resetLede: "输入你的邮箱。如果它在这里有账户，我们会发送设置新密码的链接。链接在 30 分钟内有效，只能使用一次。",
    sendResetLink: "发送链接",
    resetSent: "如果 {email} 在这里有账户，链接正在发送。请查看收件箱。",
    newPassword: "新密码（至少 10 个字符）",
    setNewPassword: "设置新密码",
    passwordChanged: "密码已更改，所有会话均已退出。请用新密码登录。",
    resetLinkBad: "此链接已失效。请重新申请。",
    backToSignIn: "返回登录",
    resetNoMail: "此服务器未设置邮件重置密码。请让管理员重置你的密码。",
    auditIntegrity: "完整性（测试版）",
    auditIntegrityLede: "每个事件都链接到前一个事件，签名检查点记录每个流。检查可发现写入后被修改、删除或插入的事件。",
    verifyChain: "检查整个日志",
    verifyWindow: "检查筛选中的日期",
    checkpointNow: "立即写入检查点",
    checkpointWritten: "已写入检查点（{n} 个流）。",
    checkpointNothing: "暂无可记录的内容。",
    chainBroken: "日志不完整：{n} 个问题。",
    chainStats: "{streams} 个流中共 {events} 个事件（链之前的 {unchained} 个），{checkpoints} 个检查点",
    lastCheckpoint: "最近检查点 {when}",
    auditPublicKey: "公钥 {fp}",
    auditKeySource: "签名密钥来自 {source}。请在别处保留此公钥的副本：pw audit verify --public-key 用它检查。",
    statusTitle: "本服务器已设置",
    statusMail: "邮件（SMTP）",
    statusNoDomains: "定时邮件未允许任何域名",
    statusSlo: "单点登出",
    statusSiem: "审计发送（SIEM）",
    siemQueue: "等待 {queued}，已发送 {sent}，已丢弃 {dropped}",
    siemBad: "PW_AUDIT_SIEM 不是可用的地址",
    statusAuditKey: "审计检查点密钥",
    notSet: "未设置",
    statusHint: "这些来自服务器的环境变量（docs/GOVERNANCE.md）。",
    chainOk: "已证明：已记录检查点的事件均未被修改、删除或插入。",
    chainUnverified: "未验证：没有迹象表明被改动，但也无法证明日志（见下文）。",
    chainError: "检查未能完成：请将日志视为未证明。",
    chainPending: "{n} 个较新的事件尚未记入检查点。",
    schedules: "计划任务",
    schedulesLede: "按时间表运行已保存的报表。每次运行都以你的身份、按当时的权限生成，并保留供下载或通过邮件发送。",
    addSchedule: "添加计划",
    scheduleAdded: "计划已添加。",
    scheduleReport: "报表",
    scheduleWhen: "时间（cron）",
    scheduleCronOnly: "此服务器仅通过 {when} cron 运行计划：比每天更频繁的计划每天最多运行一次。",
    cronDaily: "每天 07:00",
    cronWeekly: "每周一 07:00",
    cronMonthly: "每月 1 日 07:00",
    cronHourly: "每小时",
    timeZone: "时区",
    scheduleParams: "参数（每行一个 name=value）",
    delivery: "交付方式",
    deliverDownload: "保留供下载",
    deliverEmail: "邮件",
    mailTo: "收件人（允许的域名：{domains}）",
    mailSubject: "主题（可选）",
    mailAttach: "附加文件（过大时发送链接）",
    fromSnapshot: "从快照生成",
    fromSnapshotHint: "如有相同报表、参数和权限的新近缓存，则复用。",
    cronHint: "五个字段：分 时 日 月 星期，例如 0 7 * * 1 表示每周一 07:00。",
    mailOffHint: "此服务器未设置邮件。",
    nextRun: "下次运行",
    lastRun: "上次运行",
    mailLink: "链接",
    mailSent: "已发送（{how}）",
    mailFailed: "邮件失败：{error}",
    runNow: "立即运行",
    scheduleStarted: "运行已开始。",
    confirmDeleteSchedule: "删除此计划？",
    scheduleDeleted: "计划已删除。",
    noSchedules: "还没有计划。",
    snapshotTitle: "报表快照缓存",
    snapshotTtl: "复用生成结果的时长（秒，0 = 关闭）",
    snapshotMax: "缓存大小上限（MB）",
    snapshotHint: "仅对相同报表版本、参数、格式且权限相同的查看者复用。保存报表或更改权限后重新开始。",
    snapshotStats: "{n} 个快照，{mb} MB",
    clearSnapshots: "清空缓存",
    snapshotsCleared: "快照缓存已清空。",
    passwordToConfirm: "请输入密码以确认是你本人",
    enrolEmailed: "我们已向你的邮箱发送验证码：输入它来设置身份验证器。",
    emailCode: "邮件中的验证码"
  },
  "pt-BR": {
    devicesTitle: "Navegadores conhecidos",
    devicesHint: "Navegadores em que você entrou. Os limites de login nunca os bloqueiam. Remova o que você não reconhecer.",
    devicesNone: "Nenhum navegador conhecido.",
    deviceLastUsed: "último login {at}",
    deviceRemove: "Remover",
    signOutEverywhere: "Sair em todos os lugares e esquecer todos os navegadores",
    stateOn: "Ativado",
    stateOff: "Desativado",
    twoFactor: "Login em duas etapas",
    twoFactorLede: "Entre com sua senha e um código de 6 dígitos de um app autenticador no seu celular.",
    twoFactorSso: "Você entra com login único: seu provedor de identidade pede o segundo fator.",
    twoFactorSince: "desde {date}",
    twoFactorRequired: "obrigatório para o seu papel",
    recoveryLeft: "restam {n} códigos de recuperação",
    turnOn2fa: "Ativar o login em duas etapas",
    turnOff2fa: "Desativar o login em duas etapas",
    newRecoveryCodes: "Novos códigos de recuperação",
    codeToConfirm: "Um código atual, ou de recuperação, para confirmar",
    confirmCode: "Confirmar",
    twoFactorTurnedOn: "O login em duas etapas está ativado. Suas outras sessões foram encerradas.",
    twoFactorTurnedOff: "O login em duas etapas está desativado. Suas outras sessões foram encerradas.",
    qrAlt: "Código QR para o seu app autenticador",
    scanQr: "Leia este código QR com um app autenticador (Google Authenticator, Microsoft Authenticator, 1Password…) e digite o código de 6 dígitos que ele mostra.",
    cantScan: "Não consegue ler? Digite esta chave no app:",
    authCode: "Código do seu app autenticador",
    recoveryCodesTitle: "Seus códigos de recuperação",
    recoveryCodesHint: "Guarde-os em local seguro. Cada um permite entrar uma vez se você perder o celular. Eles só aparecem agora.",
    mustEnrol: "Seu papel exige o login em duas etapas. Configure agora para terminar de entrar.",
    enterCode: "Digite o código de 6 dígitos do seu app autenticador.",
    enterRecovery: "Digite um dos seus códigos de recuperação.",
    recoveryCode: "Código de recuperação",
    useRecoveryCode: "Usar um código de recuperação",
    useAuthCode: "Usar um código do app",
    verify: "Verificar",
    verifying: "Verificando…",
    accountTitle: "Sua conta",
    twoFactorCol: "Duas etapas",
    reset2fa: "Redefinir duas etapas",
    confirmReset2fa: "Redefinir o login em duas etapas de {email}? O autenticador e os códigos de recuperação deixam de funcionar e a sessão é encerrada.",
    twoFactorReset: "O login em duas etapas de {email} foi redefinido. A sessão foi encerrada.",
    serverSettings: "Configurações",
    require2faFor: "Exigir login em duas etapas destes papéis",
    require2faHint: "Contas com senha destes papéis configuram no próximo login; sessões sem ele são encerradas. Contas de login único não são afetadas: o provedor de identidade cuida dos fatores.",
    saveSettings: "Salvar",
    settingsSaved: "Configurações salvas.",
    settingsChanged: "Última alteração {when}, por {who}.",
    forgotPassword: "Esqueceu a senha?",
    noMailReset: "Esqueceu a senha? Peça a um administrador para redefini-la.",
    resetTitle: "Redefinir a senha",
    resetLede: "Digite seu e-mail. Se ele tiver uma conta aqui, enviamos um link para criar uma senha nova. O link funciona uma vez, por 30 minutos.",
    sendResetLink: "Enviar o link",
    resetSent: "Se {email} tiver uma conta aqui, o link está a caminho. Confira sua caixa de entrada.",
    newPassword: "Senha nova (pelo menos 10 caracteres)",
    setNewPassword: "Salvar a senha nova",
    passwordChanged: "Sua senha foi alterada e todas as sessões foram encerradas. Entre com a senha nova.",
    resetLinkBad: "Este link não funciona mais. Peça um novo.",
    backToSignIn: "Voltar ao login",
    resetNoMail: "Este servidor não tem redefinição de senha por e-mail. Peça a um administrador para redefinir sua senha.",
    auditIntegrity: "Integridade (beta)",
    auditIntegrityLede: "Cada evento é encadeado ao anterior e pontos de verificação assinados nomeiam cada fluxo. A verificação encontra eventos alterados, removidos ou incluídos depois de gravados.",
    verifyChain: "Verificar o registro todo",
    verifyWindow: "Verificar as datas do filtro",
    checkpointNow: "Gravar um ponto de verificação agora",
    checkpointWritten: "Ponto de verificação gravado ({n} fluxos).",
    checkpointNothing: "Ainda não há o que registrar.",
    chainBroken: "O registro não está íntegro: {n} problemas.",
    chainStats: "{events} eventos ({unchained} de antes da cadeia) em {streams} fluxos, {checkpoints} pontos de verificação",
    lastCheckpoint: "último ponto de verificação {when}",
    auditPublicKey: "Chave pública {fp}",
    auditKeySource: "Chave de assinatura vinda de {source}. Guarde uma cópia desta chave pública em outro lugar: pw audit verify --public-key verifica com ela.",
    statusTitle: "Configurado neste servidor",
    statusMail: "E-mail (SMTP)",
    statusNoDomains: "nenhum domínio permitido para e-mail agendado",
    statusSlo: "Logout único",
    statusSiem: "Envio da auditoria (SIEM)",
    siemQueue: "{queued} aguardando, {sent} enviados, {dropped} descartados",
    siemBad: "PW_AUDIT_SIEM não é um endereço utilizável",
    statusAuditKey: "Chave dos pontos de verificação",
    notSet: "não definido",
    statusHint: "Vêm do ambiente do servidor (docs/GOVERNANCE.md).",
    chainOk: "Comprovado: nenhum evento com ponto de verificação foi alterado, removido ou incluído.",
    chainUnverified: "Não verificado: nada indica alteração, mas nada comprova o registro (veja abaixo).",
    chainError: "A verificação não terminou: trate o registro como não comprovado.",
    chainPending: "{n} eventos mais novos ainda não têm ponto de verificação.",
    schedules: "Agendamentos",
    schedulesLede: "Execute relatórios salvos em um horário. Cada execução é gerada como você, com seu acesso naquele momento, e fica para download ou é enviada por e-mail.",
    addSchedule: "Adicionar agendamento",
    scheduleAdded: "Agendamento adicionado.",
    scheduleReport: "Relatório",
    scheduleWhen: "Quando (cron)",
    scheduleCronOnly: "Este servidor só executa agendamentos por um cron {when}: um agendamento mais frequente que diário roda no máximo uma vez por dia.",
    cronDaily: "Todo dia às 07:00",
    cronWeekly: "Às segundas às 07:00",
    cronMonthly: "No dia 1 de cada mês às 07:00",
    cronHourly: "A cada hora",
    timeZone: "Fuso horário",
    scheduleParams: "Parâmetros (um nome=valor por linha)",
    delivery: "Entrega",
    deliverDownload: "Guardar para download",
    deliverEmail: "E-mail",
    mailTo: "Para (domínios permitidos: {domains})",
    mailSubject: "Assunto (opcional)",
    mailAttach: "Anexar o arquivo (um link quando for grande demais)",
    fromSnapshot: "Gerar a partir do instantâneo",
    fromSnapshotHint: "Reutiliza uma geração recente em cache do mesmo relatório, parâmetros e acesso, se houver.",
    cronHint: "Cinco campos: minuto hora dia-do-mês mês dia-da-semana, ex.: 0 7 * * 1 para segundas às 07:00.",
    mailOffHint: "O e-mail não está configurado neste servidor.",
    nextRun: "Próxima execução",
    lastRun: "Última execução",
    mailLink: "link",
    mailSent: "enviado ({how})",
    mailFailed: "falha no e-mail: {error}",
    runNow: "Executar agora",
    scheduleStarted: "A execução começou.",
    confirmDeleteSchedule: "Excluir este agendamento?",
    scheduleDeleted: "Agendamento excluído.",
    noSchedules: "Nenhum agendamento ainda.",
    snapshotTitle: "Cache de instantâneos de relatórios",
    snapshotTtl: "Reutilizar uma geração por (segundos, 0 = desligado)",
    snapshotMax: "Limite do cache (MB)",
    snapshotHint: "Uma geração só é reutilizada para a mesma versão do relatório, parâmetros, formato e leitor com o mesmo acesso. Salvar um relatório ou mudar acessos começa do zero.",
    snapshotStats: "{n} instantâneos, {mb} MB",
    clearSnapshots: "Limpar o cache",
    snapshotsCleared: "O cache de instantâneos foi limpo.",
    passwordToConfirm: "Sua senha, para confirmar que é você",
    enrolEmailed: "Enviamos um código para seu e-mail: digite-o para configurar o autenticador.",
    emailCode: "Código do e-mail"
  },
  ar: {
    devicesTitle: "المتصفحات المعروفة",
    devicesHint: "المتصفحات التي سجّلت الدخول منها. لا تحظرها حدود تسجيل الدخول أبدًا. أزل أي متصفح لا تعرفه.",
    devicesNone: "لا توجد متصفحات معروفة.",
    deviceLastUsed: "آخر تسجيل دخول {at}",
    deviceRemove: "إزالة",
    signOutEverywhere: "تسجيل الخروج من كل مكان ونسيان كل المتصفحات",
    stateOn: "مفعّل",
    stateOff: "معطّل",
    twoFactor: "تسجيل الدخول بخطوتين",
    twoFactorLede: "سجّل الدخول بكلمة المرور ورمز من 6 أرقام من تطبيق مصادقة على هاتفك.",
    twoFactorSso: "تسجّل الدخول بالدخول الموحّد: مزوّد الهوية هو من يطلب العامل الثاني.",
    twoFactorSince: "منذ {date}",
    twoFactorRequired: "إلزامي لدورك",
    recoveryLeft: "تبقّى {n} من رموز الاسترداد",
    turnOn2fa: "تفعيل تسجيل الدخول بخطوتين",
    turnOff2fa: "تعطيل تسجيل الدخول بخطوتين",
    newRecoveryCodes: "رموز استرداد جديدة",
    codeToConfirm: "رمز حالي، أو رمز استرداد، للتأكيد",
    confirmCode: "تأكيد",
    twoFactorTurnedOn: "تم تفعيل تسجيل الدخول بخطوتين. أُنهيت جلساتك الأخرى.",
    twoFactorTurnedOff: "تم تعطيل تسجيل الدخول بخطوتين. أُنهيت جلساتك الأخرى.",
    qrAlt: "رمز QR لتطبيق المصادقة",
    scanQr: "امسح رمز QR هذا بتطبيق مصادقة (Google Authenticator أو Microsoft Authenticator أو 1Password…) ثم أدخل الرمز المكوّن من 6 أرقام الذي يظهره.",
    cantScan: "تعذّر المسح؟ اكتب هذا المفتاح في التطبيق:",
    authCode: "الرمز من تطبيق المصادقة",
    recoveryCodesTitle: "رموز الاسترداد الخاصة بك",
    recoveryCodesHint: "احفظها في مكان آمن. كل رمز يتيح لك الدخول مرة واحدة إذا فقدت هاتفك. لا تُعرض إلا الآن.",
    mustEnrol: "دورك يتطلب تسجيل الدخول بخطوتين. اضبطه الآن لإكمال تسجيل الدخول.",
    enterCode: "أدخل الرمز المكوّن من 6 أرقام من تطبيق المصادقة.",
    enterRecovery: "أدخل أحد رموز الاسترداد.",
    recoveryCode: "رمز الاسترداد",
    useRecoveryCode: "استخدام رمز استرداد",
    useAuthCode: "استخدام رمز من التطبيق",
    verify: "تحقّق",
    verifying: "جارٍ التحقق…",
    accountTitle: "حسابك",
    twoFactorCol: "الخطوتان",
    reset2fa: "إعادة ضبط الخطوتين",
    confirmReset2fa: "إعادة ضبط تسجيل الدخول بخطوتين لـ {email}؟ سيتوقف تطبيق المصادقة ورموز الاسترداد عن العمل ويُسجَّل خروجه.",
    twoFactorReset: "أُعيد ضبط تسجيل الدخول بخطوتين لـ {email} وسُجّل خروجه.",
    serverSettings: "الإعدادات",
    require2faFor: "فرض تسجيل الدخول بخطوتين على هذه الأدوار",
    require2faHint: "تضبطه حسابات كلمات المرور بهذه الأدوار عند تسجيل دخولها التالي؛ وتنتهي الجلسات التي لا تستخدمه. لا يُطلب من حسابات الدخول الموحّد: مزوّد الهوية يدير عواملها.",
    saveSettings: "حفظ",
    settingsSaved: "تم حفظ الإعدادات.",
    settingsChanged: "آخر تغيير {when} بواسطة {who}.",
    forgotPassword: "نسيت كلمة المرور؟",
    noMailReset: "نسيت كلمة المرور؟ اطلب من مسؤول إعادة ضبطها.",
    resetTitle: "إعادة ضبط كلمة المرور",
    resetLede: "أدخل بريدك الإلكتروني. إن كان له حساب هنا، نرسل رابطًا لتعيين كلمة مرور جديدة. يعمل الرابط مرة واحدة لمدة 30 دقيقة.",
    sendResetLink: "إرسال الرابط",
    resetSent: "إن كان لـ {email} حساب هنا، فالرابط في الطريق. تحقّق من بريدك الوارد.",
    newPassword: "كلمة مرور جديدة (10 أحرف على الأقل)",
    setNewPassword: "تعيين كلمة المرور الجديدة",
    passwordChanged: "تم تغيير كلمة المرور وإنهاء كل الجلسات. سجّل الدخول بكلمة المرور الجديدة.",
    resetLinkBad: "هذا الرابط لم يعد يعمل. اطلب رابطًا جديدًا.",
    backToSignIn: "العودة إلى تسجيل الدخول",
    resetNoMail: "إعادة ضبط كلمة المرور بالبريد غير مُعدّة على هذا الخادم. اطلب من مسؤول إعادة ضبط كلمة مرورك.",
    auditIntegrity: "السلامة (تجريبي)",
    auditIntegrityLede: "كل حدث مرتبط بالحدث الذي قبله، ونقاط تحقق موقّعة تذكر كل تدفق. يكشف الفحص الأحداث التي غُيّرت أو حُذفت أو أُضيفت بعد كتابتها.",
    verifyChain: "فحص السجل كله",
    verifyWindow: "فحص تواريخ عامل التصفية",
    checkpointNow: "كتابة نقطة تحقق الآن",
    checkpointWritten: "كُتبت نقطة التحقق ({n} تدفقات).",
    checkpointNothing: "لا شيء لتسجيله بعد.",
    chainBroken: "السجل غير سليم: {n} مشكلات.",
    chainStats: "{events} حدثًا ({unchained} من قبل السلسلة) في {streams} تدفقات، {checkpoints} نقاط تحقق",
    lastCheckpoint: "آخر نقطة تحقق {when}",
    auditPublicKey: "المفتاح العام {fp}",
    auditKeySource: "مفتاح التوقيع من {source}. احتفظ بنسخة من هذا المفتاح العام في مكان آخر: يفحص به pw audit verify --public-key.",
    statusTitle: "المُعدّ على هذا الخادم",
    statusMail: "البريد (SMTP)",
    statusNoDomains: "لا نطاقات مسموحة للبريد المجدول",
    statusSlo: "تسجيل الخروج الموحّد",
    statusSiem: "إرسال التدقيق (SIEM)",
    siemQueue: "{queued} بانتظار، {sent} أُرسلت، {dropped} أُسقطت",
    siemBad: "PW_AUDIT_SIEM ليس عنوانًا صالحًا",
    statusAuditKey: "مفتاح نقاط التحقق",
    notSet: "غير مُعدّ",
    statusHint: "تأتي من بيئة الخادم (docs/GOVERNANCE.md).",
    chainOk: "مُثبت: لم يُغيَّر أو يُحذف أو يُضَف أي حدث مشمول بنقطة تحقق.",
    chainUnverified: "غير مُتحقَّق: لا شيء يدل على تغيير، لكن لا شيء يثبت السجل أيضًا (انظر أدناه).",
    chainError: "تعذّر إكمال الفحص: اعتبر السجل غير مُثبت.",
    chainPending: "{n} من الأحداث الأحدث لم تُشمل بنقطة تحقق بعد.",
    schedules: "الجداول الزمنية",
    schedulesLede: "شغّل التقارير المحفوظة وفق جدول. كل تشغيل يُنشأ باسمك وبصلاحياتك في تلك اللحظة، ويُحفظ للتنزيل أو يُرسل بالبريد.",
    addSchedule: "إضافة جدول",
    scheduleAdded: "أُضيف الجدول.",
    scheduleReport: "التقرير",
    scheduleWhen: "متى (cron)",
    scheduleCronOnly: "يشغّل هذا الخادم الجداول عبر cron {when} فقط: الجدول الأكثر تكرارًا من يومي يعمل مرة واحدة يوميًا على الأكثر.",
    cronDaily: "كل يوم الساعة 07:00",
    cronWeekly: "أيام الاثنين الساعة 07:00",
    cronMonthly: "أول كل شهر الساعة 07:00",
    cronHourly: "كل ساعة",
    timeZone: "المنطقة الزمنية",
    scheduleParams: "المعاملات (name=value واحد في كل سطر)",
    delivery: "التسليم",
    deliverDownload: "حفظ للتنزيل",
    deliverEmail: "البريد الإلكتروني",
    mailTo: "إلى (النطاقات المسموحة: {domains})",
    mailSubject: "الموضوع (اختياري)",
    mailAttach: "إرفاق الملف (رابط إذا كان كبيرًا جدًا)",
    fromSnapshot: "الإنشاء من لقطة",
    fromSnapshotHint: "يعيد استخدام نسخة حديثة مخزّنة للتقرير نفسه والمعاملات والصلاحيات نفسها إن وُجدت.",
    cronHint: "خمسة حقول: الدقيقة الساعة يوم-الشهر الشهر يوم-الأسبوع، مثل 0 7 * * 1 لأيام الاثنين 07:00.",
    mailOffHint: "البريد غير مُعدّ على هذا الخادم.",
    nextRun: "التشغيل التالي",
    lastRun: "آخر تشغيل",
    mailLink: "رابط",
    mailSent: "أُرسل بالبريد ({how})",
    mailFailed: "فشل البريد: {error}",
    runNow: "تشغيل الآن",
    scheduleStarted: "بدأ التشغيل.",
    confirmDeleteSchedule: "حذف هذا الجدول؟",
    scheduleDeleted: "حُذف الجدول.",
    noSchedules: "لا جداول بعد.",
    snapshotTitle: "ذاكرة لقطات التقارير",
    snapshotTtl: "إعادة استخدام النسخة لمدة (ثوانٍ، 0 = إيقاف)",
    snapshotMax: "حد حجم الذاكرة (MB)",
    snapshotHint: "لا تُعاد النسخة إلا لنفس إصدار التقرير والمعاملات والصيغة وقارئ بالصلاحيات نفسها. حفظ تقرير أو تغيير الصلاحيات يبدأ من جديد.",
    snapshotStats: "{n} لقطة، {mb} MB",
    clearSnapshots: "مسح الذاكرة",
    snapshotsCleared: "مُسحت ذاكرة اللقطات.",
    passwordToConfirm: "كلمة مرورك، للتأكد من أنك أنت",
    enrolEmailed: "أرسلنا رمزًا إلى بريدك: أدخله لإعداد تطبيق المصادقة.",
    emailCode: "الرمز من البريد"
  }
};

// src/i18n/ux.js
var ux_default = {
  en: {
    ux_choose: "— choose —",
    ux_designersGroup: "Designers (everyone who can design)",
    ux_edit: "Edit",
    ux_paramPickValueField: "Pick the value field for the choices from the data set.",
    ux_paramNoValueField: "The choices from a data set have no value field: the reader sees an empty list.",
    ux_choicePreview: "{n} choices: {list}",
    ux_defaultHintMulti: "Several values: separate them with commas, e.g. North, South. Or an =expression.",
    ux_setParams: "Set these parameters",
    ux_pmapTitle: "Parameters of the target report",
    ux_pmapNoParams: "This report has no parameters.",
    ux_pmapUnknown: "Pick a report to list its parameters, or add a parameter by name.",
    ux_pmapNotAParam: "The target report has no parameter with this name.",
    ux_pmapRequired: "Required by the target report.",
    ux_pmapNotPassed: "not passed",
    ux_pmapRemove: "Remove {name}",
    ux_pmapOther: "Another parameter by name",
    ux_headerAction: "Action on a header click",
    ux_totalAction: "Action on a total click",
    ux_cellAction: "Action on a cell click",
    ux_pivotActionHint: "A click is evaluated in the cell's scope: =Fields.region is that row's region, =Fields.year that column's year.",
    ux_a11yOpenReport: "{text}: open the report {report}",
    ux_a11yDetails: "Show or hide details",
    ux_a11ySortAsc: "Sort by {text}, ascending",
    ux_a11ySortDesc: "Sort by {text}, descending",
    ux_a11yFilterBy: "Filter by {text}",
    ux_a11yGoTo: "Go to {text}",
    ux_a11yPage: "{n} of {total}",
    ux_a11yReport: "Report",
    ux_draftFound: "Unsaved changes from {when} were kept in this browser.",
    ux_draftRestore: "Restore them",
    ux_draftDiscard: "Discard",
    ux_draftStale: "Unsaved changes from {when} were kept in this browser, but the report was saved again after them. Restoring them and saving replaces that newer save.",
    ux_draftRestoreAnyway: "Restore mine anyway",
    ux_conflict: "Someone else saved this report after you opened it. Nothing was overwritten.",
    ux_conflictMine: "Save mine over theirs",
    ux_conflictTheirs: "Take theirs (drop my changes)",
    ux_saveDialogInvalid: "Not saved: the open dialog has an error. Fix it or cancel it, then save.",
    ux_columns: "Columns",
    ux_selectColumn: "Select column {n}",
    ux_selectRow: "Select this row (Shift or Cmd/Ctrl: add to the selection)",
    ux_groupByField: "Group by {field}",
    ux_clearCells: "Clear contents",
    ux_clearCellStyles: "Clear formatting",
    ux_formatCells: "Number format…",
    ux_nCells: "{n} cells of {name}",
    ux_cellsHint: "A change applies to every selected cell. A blank field: the cells differ. Shift-click for a range, Cmd/Ctrl-click to add or remove a cell, the bar above a column or the tag beside a row to select it all.",
    ux_monthNames: "Show month numbers as names (Jan, Feb…)",
    ux_compactAxis: "Large values: the value axis is compact (300M, 50K). Change it under Axes in the Inspector.",
    ux_unknownField: 'The data set has no field "{name}".',
    ux_unknownFieldSuggest: 'The data set has no field "{name}". Did you mean "{suggest}"?',
    ux_fieldTypeObject: "object (nested fields)",
    ux_dsPickedPath: "Rows from {path}, the list that looks like the rows (type $ in the path for the top object).",
    ux_addGroupDrill: "Drill-down: the group starts collapsed behind a ▶ toggle",
    ux_imageCat: "Image",
    ux_imageUploadHere: "Upload an image…",
    ux_imageHint: "Upload here, drop an image file on the page, or pick one of the report's images. They are kept in the report (Report → Images: press Esc or click the desk around the page).",
    ux_issues: "⚠ {n} to check",
    ux_noIssues: "No layout problems",
    ux_issueOverlap: "{name} overlaps {other}.",
    ux_issueWide: "{name} is {width} pt wide where the page has {room} pt: its last columns move to another page.",
    ux_issueField: '{name} reads the field "{field}", which its data set does not have.',
    ux_issueFieldSuggest: '{name} reads the field "{field}", which its data set does not have. Did you mean "{suggest}"?',
    ux_wholePage: "Whole page",
    ux_liveHint: "Changes apply as you pick them. View report runs it again from the start (groups closed, first page).",
    ux_alignBar: "Align and size",
    ux_alignLeft: "Align left edges",
    ux_alignHCenter: "Centre horizontally",
    ux_alignRight: "Align right edges",
    ux_alignTop: "Align top edges",
    ux_alignVMiddle: "Centre vertically",
    ux_alignBottom: "Align bottom edges",
    ux_distH: "Distribute horizontally",
    ux_distV: "Distribute vertically",
    ux_sameWidth: "Same width",
    ux_sameHeight: "Same height",
    ux_toPage: "To page",
    ux_toPageHint: "Align to the band or container instead of to each other (one item always aligns to the page)",
    ux_narrowDesigner: "Designing needs a wider screen (900 px or more): here you can look at the page and preview it.",
    ux_nameFirst: "Give the report a name first.",
    cf_title: "Conditional formatting",
    cf_button: "Conditional formatting…",
    cf_rowButton: "Format the row by rule…",
    cf_points: "Colour the points by rule…",
    cf_nRules: "{n} rules",
    cf_titleOf: "Conditional formatting: {name}",
    cf_titleCell: "Conditional formatting: a cell of {name}",
    cf_titleRow: "Conditional formatting: a row of {name}",
    cf_apply: "Apply",
    cf_when: "When several rules match",
    cf_first: "The first match wins",
    cf_stack: "Combine them (in order)",
    cf_databar: "Data bar in the cell",
    cf_subject: "Field",
    cf_condition: "Condition",
    cf_value: "Value",
    cf_value2: "Upper value",
    cf_valuePh: "100, text or =Parameters.x",
    cf_thisValue: "This value",
    cf_p_color: "Text colour",
    cf_p_backgroundColor: "Background",
    cf_p_fontWeight: "Bold",
    cf_p_fontStyle: "Italic",
    cf_pointColor: "Point colour",
    cf_icon: "Icon",
    cf_icon_good: "Green",
    cf_icon_warn: "Amber",
    cf_icon_bad: "Red",
    cf_addRule: "+ Add a rule",
    cf_custom: "Written by hand (kept unless a rule sets it): {props}.",
    cf_hint: "The rules become style expressions; reopen this to change them.",
    cf_hintCell: "The rules become style expressions; reopen this to change them. An icon or a data bar fills the cell: give it a column of its own.",
    cf_op_eq: "is equal to",
    cf_op_ne: "is not equal to",
    cf_op_lt: "is less than",
    cf_op_le: "is at most",
    cf_op_gt: "is greater than",
    cf_op_ge: "is at least",
    cf_op_between: "is between",
    cf_op_top: "is in the top N",
    cf_op_bottom: "is in the bottom N",
    cf_op_aboveAvg: "is above average",
    cf_op_belowAvg: "is below average",
    cf_op_contains: "contains",
    cf_op_startsWith: "starts with",
    cf_op_empty: "is empty",
    cf_op_notEmpty: "is not empty",
    qb_mode: "Build visually or write SQL",
    qb_build: "Build visually",
    qb_sql: "SQL",
    qb_replaceSql: "The visual builder starts empty and replaces the query written here. Continue?",
    qb_pickConnection: "Pick a connection to see its tables.",
    qb_loading: "Reading the tables…",
    qb_noSchema: "The tables of this connection could not be read ({message}).",
    qb_tables: "Tables",
    qb_findTable: "Find a table",
    qb_addTable: "Add this table",
    qb_noTables: "No tables.",
    qb_start: "Add a table from the list, then tick its columns.",
    qb_removeTable: "Remove {name}",
    qb_joins: "Joins",
    qb_inner: "Matching rows only",
    qb_left: "All rows of the first table",
    qb_joinType: "Join type",
    qb_suggested: "Suggested:",
    qb_addJoin: "Add join",
    qb_joinFrom: "Column of one table",
    qb_joinTo: "Column of the other table",
    qb_joinHint: "Drag a column onto a column of another table to join them, or pick both here.",
    qb_filters: "Filters",
    qb_column: "Column",
    qb_value: "A value",
    qb_valueFrom: "Compare with",
    qb_filterHint: "A report parameter (@name) is bound when the query runs, never pasted into the SQL.",
    qb_sortLimit: "Sort and limit",
    qb_limit: "At most (rows)",
    qb_preview: "Preview rows",
    qb_editSql: "Edit as SQL",
    qb_rows: "{n} rows (the first 20 shown)",
    ux_a11yPageRole: "page"
  },
  hi: {
    ux_draftStale: "{when} के बिना सहेजे बदलाव इस ब्राउज़र में रखे गए थे, लेकिन उसके बाद रिपोर्ट फिर से सहेजी गई। इन्हें बहाल करके सहेजने से वह नया संस्करण बदल जाएगा।",
    ux_draftRestoreAnyway: "फिर भी मेरे बदलाव बहाल करें",
    ux_conflict: "आपके खोलने के बाद किसी और ने यह रिपोर्ट सहेजी। कुछ भी अधिलेखित नहीं हुआ।",
    ux_conflictMine: "उनके ऊपर मेरा सहेजें",
    ux_conflictTheirs: "उनका लें (मेरे बदलाव छोड़ें)",
    ux_choose: "— चुनें —",
    ux_designersGroup: "डिज़ाइनर (डिज़ाइन कर सकने वाले सभी)",
    ux_edit: "संपादित करें",
    ux_paramPickValueField: "डेटा सेट से विकल्पों के लिए मान फ़ील्ड चुनें।",
    ux_paramNoValueField: "डेटा सेट के विकल्पों में कोई मान फ़ील्ड नहीं है: पाठक को खाली सूची दिखेगी।",
    ux_choicePreview: "{n} विकल्प: {list}",
    ux_defaultHintMulti: "कई मान: उन्हें अल्पविराम से अलग करें, जैसे North, South। या एक =expression।",
    ux_setParams: "ये पैरामीटर सेट करें",
    ux_pmapTitle: "लक्ष्य रिपोर्ट के पैरामीटर",
    ux_pmapNoParams: "इस रिपोर्ट में कोई पैरामीटर नहीं है।",
    ux_pmapUnknown: "पैरामीटर देखने के लिए रिपोर्ट चुनें, या नाम से पैरामीटर जोड़ें।",
    ux_pmapNotAParam: "लक्ष्य रिपोर्ट में इस नाम का कोई पैरामीटर नहीं है।",
    ux_pmapRequired: "लक्ष्य रिपोर्ट के लिए आवश्यक।",
    ux_pmapNotPassed: "नहीं भेजा गया",
    ux_pmapRemove: "{name} हटाएँ",
    ux_pmapOther: "नाम से अन्य पैरामीटर",
    ux_headerAction: "हेडर पर क्लिक की क्रिया",
    ux_totalAction: "कुल पर क्लिक की क्रिया",
    ux_cellAction: "सेल पर क्लिक की क्रिया",
    ux_pivotActionHint: "क्लिक सेल के दायरे में चलता है: =Fields.region उस पंक्ति का क्षेत्र है, =Fields.year उस कॉलम का वर्ष।",
    ux_a11yOpenReport: "{text}: रिपोर्ट {report} खोलें",
    ux_a11yDetails: "विवरण दिखाएँ या छिपाएँ",
    ux_a11ySortAsc: "{text} के अनुसार आरोही क्रम में लगाएँ",
    ux_a11ySortDesc: "{text} के अनुसार अवरोही क्रम में लगाएँ",
    ux_a11yFilterBy: "{text} से फ़िल्टर करें",
    ux_a11yGoTo: "{text} पर जाएँ",
    ux_a11yPage: "{n} / {total}",
    ux_a11yReport: "रिपोर्ट",
    ux_draftFound: "{when} के बिना सहेजे बदलाव इस ब्राउज़र में रखे गए थे।",
    ux_draftRestore: "उन्हें वापस लाएँ",
    ux_draftDiscard: "छोड़ें",
    ux_saveDialogInvalid: "सहेजा नहीं गया: खुले संवाद में त्रुटि है। उसे ठीक करें या रद्द करें, फिर सहेजें।",
    ux_columns: "कॉलम",
    ux_selectColumn: "कॉलम {n} चुनें",
    ux_selectRow: "यह पंक्ति चुनें (Shift या Cmd/Ctrl: चयन में जोड़ें)",
    ux_groupByField: "{field} के अनुसार समूह बनाएँ",
    ux_clearCells: "सामग्री साफ़ करें",
    ux_clearCellStyles: "स्वरूपण साफ़ करें",
    ux_formatCells: "संख्या प्रारूप…",
    ux_nCells: "{name} के {n} सेल",
    ux_cellsHint: "बदलाव हर चुने सेल पर लागू होता है। खाली फ़ील्ड: सेल अलग-अलग हैं। श्रेणी के लिए Shift-क्लिक, सेल जोड़ने/हटाने के लिए Cmd/Ctrl-क्लिक, पूरा कॉलम या पंक्ति चुनने के लिए उसके ऊपर की पट्टी या बगल का टैग।",
    ux_monthNames: "महीने की संख्याएँ नाम के रूप में दिखाएँ (Jan, Feb…)",
    ux_compactAxis: "बड़े मान: मान अक्ष संक्षिप्त है (300M, 50K)। इंस्पेक्टर में Axes के अंतर्गत बदलें।",
    ux_unknownField: 'डेटा सेट में "{name}" नाम का कोई फ़ील्ड नहीं है।',
    ux_unknownFieldSuggest: 'डेटा सेट में "{name}" फ़ील्ड नहीं है। क्या आपका मतलब "{suggest}" था?',
    ux_fieldTypeObject: "ऑब्जेक्ट (नेस्टेड फ़ील्ड)",
    ux_dsPickedPath: "{path} से पंक्तियाँ, जो पंक्तियों जैसी सूची है (शीर्ष ऑब्जेक्ट के लिए पथ में $ लिखें)।",
    ux_addGroupDrill: "ड्रिल-डाउन: समूह ▶ टॉगल के पीछे बंद शुरू होता है",
    ux_imageCat: "छवि",
    ux_imageUploadHere: "छवि अपलोड करें…",
    ux_imageHint: "यहाँ अपलोड करें, पृष्ठ पर छवि फ़ाइल छोड़ें, या रिपोर्ट की छवियों में से चुनें। वे रिपोर्ट में रखी जाती हैं (रिपोर्ट → छवियाँ: Esc दबाएँ या पृष्ठ के आसपास क्लिक करें)।",
    ux_issues: "⚠ {n} जाँचें",
    ux_noIssues: "कोई लेआउट समस्या नहीं",
    ux_issueOverlap: "{name}, {other} पर चढ़ा है।",
    ux_issueWide: "{name} {width} pt चौड़ा है जबकि पृष्ठ में {room} pt है: उसके अंतिम कॉलम दूसरे पृष्ठ पर जाते हैं।",
    ux_issueField: '{name} "{field}" फ़ील्ड पढ़ता है, जो उसके डेटा सेट में नहीं है।',
    ux_issueFieldSuggest: '{name} "{field}" फ़ील्ड पढ़ता है, जो उसके डेटा सेट में नहीं है। क्या आपका मतलब "{suggest}" था?',
    ux_wholePage: "पूरा पृष्ठ",
    ux_liveHint: "आपके चुनते ही बदलाव लागू होते हैं। View report इसे शुरू से फिर चलाता है (समूह बंद, पहला पृष्ठ)।",
    ux_alignBar: "संरेखण और आकार",
    ux_alignLeft: "बाएँ किनारे संरेखित करें",
    ux_alignHCenter: "क्षैतिज रूप से बीच में",
    ux_alignRight: "दाएँ किनारे संरेखित करें",
    ux_alignTop: "ऊपरी किनारे संरेखित करें",
    ux_alignVMiddle: "लंबवत रूप से बीच में",
    ux_alignBottom: "निचले किनारे संरेखित करें",
    ux_distH: "क्षैतिज रूप से बाँटें",
    ux_distV: "लंबवत रूप से बाँटें",
    ux_sameWidth: "समान चौड़ाई",
    ux_sameHeight: "समान ऊँचाई",
    ux_toPage: "पृष्ठ के अनुसार",
    ux_toPageHint: "एक-दूसरे के बजाय बैंड या कंटेनर के अनुसार संरेखित करें (एक आइटम हमेशा पृष्ठ के अनुसार)",
    ux_narrowDesigner: "डिज़ाइन करने के लिए चौड़ी स्क्रीन चाहिए (900 px या अधिक): यहाँ आप पृष्ठ देख और पूर्वावलोकन कर सकते हैं।",
    ux_nameFirst: "पहले रिपोर्ट को नाम दें।",
    cf_title: "सशर्त स्वरूपण",
    cf_button: "सशर्त स्वरूपण…",
    cf_rowButton: "नियम से पंक्ति स्वरूपित करें…",
    cf_points: "नियम से बिंदुओं का रंग…",
    cf_nRules: "{n} नियम",
    cf_titleOf: "सशर्त स्वरूपण: {name}",
    cf_titleCell: "सशर्त स्वरूपण: {name} का एक सेल",
    cf_titleRow: "सशर्त स्वरूपण: {name} की एक पंक्ति",
    cf_apply: "लागू करें",
    cf_when: "जब कई नियम मेल खाएँ",
    cf_first: "पहला मेल जीतता है",
    cf_stack: "उन्हें मिलाएँ (क्रम से)",
    cf_databar: "सेल में डेटा बार",
    cf_subject: "फ़ील्ड",
    cf_condition: "शर्त",
    cf_value: "मान",
    cf_value2: "ऊपरी मान",
    cf_valuePh: "100, पाठ या =Parameters.x",
    cf_thisValue: "यह मान",
    cf_p_color: "पाठ रंग",
    cf_p_backgroundColor: "पृष्ठभूमि",
    cf_p_fontWeight: "बोल्ड",
    cf_p_fontStyle: "इटैलिक",
    cf_pointColor: "बिंदु रंग",
    cf_icon: "आइकन",
    cf_icon_good: "हरा",
    cf_icon_warn: "पीला",
    cf_icon_bad: "लाल",
    cf_addRule: "+ नियम जोड़ें",
    cf_custom: "हाथ से लिखा (जब तक कोई नियम न बदले, रहेगा): {props}।",
    cf_hint: "नियम शैली अभिव्यक्तियाँ बन जाते हैं; बदलने के लिए इसे फिर खोलें।",
    cf_hintCell: "नियम शैली अभिव्यक्तियाँ बनते हैं; बदलने के लिए फिर खोलें। आइकन या डेटा बार पूरा सेल लेता है: उसे अलग कॉलम दें।",
    cf_op_eq: "के बराबर",
    cf_op_ne: "के बराबर नहीं",
    cf_op_lt: "से कम",
    cf_op_le: "अधिकतम",
    cf_op_gt: "से अधिक",
    cf_op_ge: "कम से कम",
    cf_op_between: "के बीच",
    cf_op_top: "शीर्ष N में",
    cf_op_bottom: "निचले N में",
    cf_op_aboveAvg: "औसत से ऊपर",
    cf_op_belowAvg: "औसत से नीचे",
    cf_op_contains: "में शामिल है",
    cf_op_startsWith: "से शुरू होता है",
    cf_op_empty: "खाली है",
    cf_op_notEmpty: "खाली नहीं है",
    qb_mode: "दृश्य रूप से बनाएँ या SQL लिखें",
    qb_build: "दृश्य रूप से बनाएँ",
    qb_sql: "SQL",
    qb_replaceSql: "दृश्य बिल्डर खाली शुरू होता है और यहाँ लिखी क्वेरी बदल देता है। जारी रखें?",
    qb_pickConnection: "इसकी तालिकाएँ देखने के लिए कनेक्शन चुनें।",
    qb_loading: "तालिकाएँ पढ़ी जा रही हैं…",
    qb_noSchema: "इस कनेक्शन की तालिकाएँ पढ़ी नहीं जा सकीं ({message})।",
    qb_tables: "तालिकाएँ",
    qb_findTable: "तालिका खोजें",
    qb_addTable: "यह तालिका जोड़ें",
    qb_noTables: "कोई तालिका नहीं।",
    qb_start: "सूची से तालिका जोड़ें, फिर उसके कॉलम चुनें।",
    qb_removeTable: "{name} हटाएँ",
    qb_joins: "जोड़",
    qb_inner: "केवल मेल खाती पंक्तियाँ",
    qb_left: "पहली तालिका की सभी पंक्तियाँ",
    qb_joinType: "जोड़ का प्रकार",
    qb_suggested: "सुझाव:",
    qb_addJoin: "जोड़ जोड़ें",
    qb_joinFrom: "एक तालिका का कॉलम",
    qb_joinTo: "दूसरी तालिका का कॉलम",
    qb_joinHint: "जोड़ने के लिए एक कॉलम को दूसरी तालिका के कॉलम पर खींचें, या यहाँ दोनों चुनें।",
    qb_filters: "फ़िल्टर",
    qb_column: "कॉलम",
    qb_value: "एक मान",
    qb_valueFrom: "से तुलना करें",
    qb_filterHint: "रिपोर्ट पैरामीटर (@name) क्वेरी चलने पर बाँधा जाता है, SQL में चिपकाया नहीं जाता।",
    qb_sortLimit: "क्रम और सीमा",
    qb_limit: "अधिकतम (पंक्तियाँ)",
    qb_preview: "पंक्तियों का पूर्वावलोकन",
    qb_editSql: "SQL के रूप में संपादित करें",
    qb_rows: "{n} पंक्तियाँ (पहली 20 दिखाई गईं)",
    ux_a11yPageRole: "पृष्ठ"
  },
  es: {
    ux_draftStale: "Se guardaron en este navegador cambios sin guardar de {when}, pero el informe se volvió a guardar después. Restaurarlos y guardar reemplaza ese guardado más reciente.",
    ux_draftRestoreAnyway: "Restaurar los míos de todos modos",
    ux_conflict: "Otra persona guardó este informe después de que usted lo abriera. No se sobrescribió nada.",
    ux_conflictMine: "Guardar el mío sobre el suyo",
    ux_conflictTheirs: "Quedarse con el suyo (descartar mis cambios)",
    ux_choose: "— elegir —",
    ux_designersGroup: "Diseñadores (todos los que pueden diseñar)",
    ux_edit: "Editar",
    ux_paramPickValueField: "Elija el campo de valor para las opciones del conjunto de datos.",
    ux_paramNoValueField: "Las opciones del conjunto de datos no tienen campo de valor: el lector ve una lista vacía.",
    ux_choicePreview: "{n} opciones: {list}",
    ux_defaultHintMulti: "Varios valores: sepárelos con comas, p. ej. North, South. O una =expresión.",
    ux_setParams: "Establecer estos parámetros",
    ux_pmapTitle: "Parámetros del informe de destino",
    ux_pmapNoParams: "Este informe no tiene parámetros.",
    ux_pmapUnknown: "Elija un informe para ver sus parámetros, o añada uno por nombre.",
    ux_pmapNotAParam: "El informe de destino no tiene un parámetro con este nombre.",
    ux_pmapRequired: "Obligatorio en el informe de destino.",
    ux_pmapNotPassed: "no se pasa",
    ux_pmapRemove: "Quitar {name}",
    ux_pmapOther: "Otro parámetro por nombre",
    ux_headerAction: "Acción al hacer clic en el encabezado",
    ux_totalAction: "Acción al hacer clic en el total",
    ux_cellAction: "Acción al hacer clic en la celda",
    ux_pivotActionHint: "El clic se evalúa en el ámbito de la celda: =Fields.region es la región de esa fila, =Fields.year el año de esa columna.",
    ux_a11yOpenReport: "{text}: abrir el informe {report}",
    ux_a11yDetails: "Mostrar u ocultar detalles",
    ux_a11ySortAsc: "Ordenar por {text}, ascendente",
    ux_a11ySortDesc: "Ordenar por {text}, descendente",
    ux_a11yFilterBy: "Filtrar por {text}",
    ux_a11yGoTo: "Ir a {text}",
    ux_a11yPage: "{n} de {total}",
    ux_a11yReport: "Informe",
    ux_draftFound: "Se guardaron en este navegador cambios sin guardar de {when}.",
    ux_draftRestore: "Restaurarlos",
    ux_draftDiscard: "Descartar",
    ux_saveDialogInvalid: "No se guardó: el diálogo abierto tiene un error. Corríjalo o cancélelo y guarde.",
    ux_columns: "Columnas",
    ux_selectColumn: "Seleccionar la columna {n}",
    ux_selectRow: "Seleccionar esta fila (Mayús o Cmd/Ctrl: añadir a la selección)",
    ux_groupByField: "Agrupar por {field}",
    ux_clearCells: "Borrar el contenido",
    ux_clearCellStyles: "Borrar el formato",
    ux_formatCells: "Formato de número…",
    ux_nCells: "{n} celdas de {name}",
    ux_cellsHint: "Un cambio se aplica a todas las celdas seleccionadas. Un campo vacío: las celdas difieren. Mayús+clic para un rango, Cmd/Ctrl+clic para añadir o quitar una celda, la barra sobre una columna o la etiqueta junto a una fila para seleccionarla entera.",
    ux_monthNames: "Mostrar los números de mes como nombres (ene, feb…)",
    ux_compactAxis: "Valores grandes: el eje de valores es compacto (300M, 50K). Cámbielo en Ejes en el Inspector.",
    ux_unknownField: 'El conjunto de datos no tiene el campo "{name}".',
    ux_unknownFieldSuggest: 'El conjunto de datos no tiene el campo "{name}". ¿Quiso decir "{suggest}"?',
    ux_fieldTypeObject: "objeto (campos anidados)",
    ux_dsPickedPath: "Filas de {path}, la lista que parece las filas (escriba $ en la ruta para el objeto superior).",
    ux_addGroupDrill: "Desglose: el grupo empieza contraído tras un botón ▶",
    ux_imageCat: "Imagen",
    ux_imageUploadHere: "Subir una imagen…",
    ux_imageHint: "Súbala aquí, suelte un archivo de imagen en la página o elija una de las imágenes del informe. Se guardan en el informe (Informe → Imágenes: pulse Esc o haga clic alrededor de la página).",
    ux_issues: "⚠ {n} por revisar",
    ux_noIssues: "Sin problemas de diseño",
    ux_issueOverlap: "{name} se superpone a {other}.",
    ux_issueWide: "{name} mide {width} pt donde la página tiene {room} pt: sus últimas columnas pasan a otra página.",
    ux_issueField: '{name} lee el campo "{field}", que su conjunto de datos no tiene.',
    ux_issueFieldSuggest: '{name} lee el campo "{field}", que su conjunto de datos no tiene. ¿Quiso decir "{suggest}"?',
    ux_wholePage: "Página completa",
    ux_liveHint: "Los cambios se aplican al elegirlos. Ver informe lo ejecuta de nuevo desde el principio (grupos cerrados, primera página).",
    ux_alignBar: "Alinear y tamaño",
    ux_alignLeft: "Alinear a la izquierda",
    ux_alignHCenter: "Centrar horizontalmente",
    ux_alignRight: "Alinear a la derecha",
    ux_alignTop: "Alinear arriba",
    ux_alignVMiddle: "Centrar verticalmente",
    ux_alignBottom: "Alinear abajo",
    ux_distH: "Distribuir horizontalmente",
    ux_distV: "Distribuir verticalmente",
    ux_sameWidth: "Mismo ancho",
    ux_sameHeight: "Misma altura",
    ux_toPage: "A la página",
    ux_toPageHint: "Alinear a la banda o al contenedor en lugar de entre sí (un elemento solo siempre se alinea a la página)",
    ux_narrowDesigner: "Diseñar requiere una pantalla más ancha (900 px o más): aquí puede ver la página y su vista previa.",
    ux_nameFirst: "Primero dé un nombre al informe.",
    cf_title: "Formato condicional",
    cf_button: "Formato condicional…",
    cf_rowButton: "Dar formato a la fila con reglas…",
    cf_points: "Colorear los puntos con reglas…",
    cf_nRules: "{n} reglas",
    cf_titleOf: "Formato condicional: {name}",
    cf_titleCell: "Formato condicional: una celda de {name}",
    cf_titleRow: "Formato condicional: una fila de {name}",
    cf_apply: "Aplicar",
    cf_when: "Cuando coinciden varias reglas",
    cf_first: "Gana la primera coincidencia",
    cf_stack: "Combinarlas (en orden)",
    cf_databar: "Barra de datos en la celda",
    cf_subject: "Campo",
    cf_condition: "Condición",
    cf_value: "Valor",
    cf_value2: "Valor superior",
    cf_valuePh: "100, texto o =Parameters.x",
    cf_thisValue: "Este valor",
    cf_p_color: "Color del texto",
    cf_p_backgroundColor: "Fondo",
    cf_p_fontWeight: "Negrita",
    cf_p_fontStyle: "Cursiva",
    cf_pointColor: "Color del punto",
    cf_icon: "Icono",
    cf_icon_good: "Verde",
    cf_icon_warn: "Ámbar",
    cf_icon_bad: "Rojo",
    cf_addRule: "+ Añadir una regla",
    cf_custom: "Escrito a mano (se conserva salvo que una regla lo cambie): {props}.",
    cf_hint: "Las reglas se convierten en expresiones de estilo; vuelva a abrir esto para cambiarlas.",
    cf_hintCell: "Las reglas se convierten en expresiones de estilo; vuelva a abrir esto para cambiarlas. Un icono o una barra ocupan la celda: deles una columna propia.",
    cf_op_eq: "es igual a",
    cf_op_ne: "no es igual a",
    cf_op_lt: "es menor que",
    cf_op_le: "es como máximo",
    cf_op_gt: "es mayor que",
    cf_op_ge: "es como mínimo",
    cf_op_between: "está entre",
    cf_op_top: "está entre los N mayores",
    cf_op_bottom: "está entre los N menores",
    cf_op_aboveAvg: "está por encima de la media",
    cf_op_belowAvg: "está por debajo de la media",
    cf_op_contains: "contiene",
    cf_op_startsWith: "empieza por",
    cf_op_empty: "está vacío",
    cf_op_notEmpty: "no está vacío",
    qb_mode: "Construir visualmente o escribir SQL",
    qb_build: "Construir visualmente",
    qb_sql: "SQL",
    qb_replaceSql: "El constructor visual empieza vacío y sustituye la consulta escrita aquí. ¿Continuar?",
    qb_pickConnection: "Elija una conexión para ver sus tablas.",
    qb_loading: "Leyendo las tablas…",
    qb_noSchema: "No se pudieron leer las tablas de esta conexión ({message}).",
    qb_tables: "Tablas",
    qb_findTable: "Buscar una tabla",
    qb_addTable: "Añadir esta tabla",
    qb_noTables: "Sin tablas.",
    qb_start: "Añada una tabla de la lista y marque sus columnas.",
    qb_removeTable: "Quitar {name}",
    qb_joins: "Combinaciones",
    qb_inner: "Solo filas coincidentes",
    qb_left: "Todas las filas de la primera tabla",
    qb_joinType: "Tipo de combinación",
    qb_suggested: "Sugerida:",
    qb_addJoin: "Añadir combinación",
    qb_joinFrom: "Columna de una tabla",
    qb_joinTo: "Columna de la otra tabla",
    qb_joinHint: "Arrastre una columna sobre una columna de otra tabla para combinarlas, o elija ambas aquí.",
    qb_filters: "Filtros",
    qb_column: "Columna",
    qb_value: "Un valor",
    qb_valueFrom: "Comparar con",
    qb_filterHint: "Un parámetro del informe (@name) se vincula al ejecutar la consulta; nunca se pega en el SQL.",
    qb_sortLimit: "Orden y límite",
    qb_limit: "Como máximo (filas)",
    qb_preview: "Vista previa de filas",
    qb_editSql: "Editar como SQL",
    qb_rows: "{n} filas (se muestran las primeras 20)",
    ux_a11yPageRole: "página"
  },
  fr: {
    ux_draftStale: "Des modifications non enregistrées du {when} ont été gardées dans ce navigateur, mais le rapport a été enregistré depuis. Les restaurer puis enregistrer remplace cet enregistrement plus récent.",
    ux_draftRestoreAnyway: "Restaurer les miennes quand même",
    ux_conflict: "Quelqu’un d’autre a enregistré ce rapport après que vous l’avez ouvert. Rien n’a été écrasé.",
    ux_conflictMine: "Enregistrer le mien par-dessus",
    ux_conflictTheirs: "Prendre le leur (abandonner mes modifications)",
    ux_choose: "— choisir —",
    ux_designersGroup: "Concepteurs (tous ceux qui peuvent concevoir)",
    ux_edit: "Modifier",
    ux_paramPickValueField: "Choisissez le champ de valeur des choix du jeu de données.",
    ux_paramNoValueField: "Les choix du jeu de données n'ont pas de champ de valeur : le lecteur voit une liste vide.",
    ux_choicePreview: "{n} choix : {list}",
    ux_defaultHintMulti: "Plusieurs valeurs : séparez-les par des virgules, p. ex. North, South. Ou une =expression.",
    ux_setParams: "Définir ces paramètres",
    ux_pmapTitle: "Paramètres du rapport cible",
    ux_pmapNoParams: "Ce rapport n'a pas de paramètres.",
    ux_pmapUnknown: "Choisissez un rapport pour voir ses paramètres, ou ajoutez-en un par son nom.",
    ux_pmapNotAParam: "Le rapport cible n'a pas de paramètre de ce nom.",
    ux_pmapRequired: "Obligatoire pour le rapport cible.",
    ux_pmapNotPassed: "non transmis",
    ux_pmapRemove: "Retirer {name}",
    ux_pmapOther: "Autre paramètre par son nom",
    ux_headerAction: "Action au clic sur l'en-tête",
    ux_totalAction: "Action au clic sur le total",
    ux_cellAction: "Action au clic sur la cellule",
    ux_pivotActionHint: "Le clic est évalué dans la portée de la cellule : =Fields.region est la région de cette ligne, =Fields.year l'année de cette colonne.",
    ux_a11yOpenReport: "{text} : ouvrir le rapport {report}",
    ux_a11yDetails: "Afficher ou masquer les détails",
    ux_a11ySortAsc: "Trier par {text}, croissant",
    ux_a11ySortDesc: "Trier par {text}, décroissant",
    ux_a11yFilterBy: "Filtrer sur {text}",
    ux_a11yGoTo: "Aller à {text}",
    ux_a11yPage: "{n} sur {total}",
    ux_a11yReport: "Rapport",
    ux_draftFound: "Des modifications non enregistrées du {when} ont été gardées dans ce navigateur.",
    ux_draftRestore: "Les restaurer",
    ux_draftDiscard: "Ignorer",
    ux_saveDialogInvalid: "Non enregistré : la boîte de dialogue ouverte contient une erreur. Corrigez-la ou annulez-la, puis enregistrez.",
    ux_columns: "Colonnes",
    ux_selectColumn: "Sélectionner la colonne {n}",
    ux_selectRow: "Sélectionner cette ligne (Maj ou Cmd/Ctrl : ajouter à la sélection)",
    ux_groupByField: "Grouper par {field}",
    ux_clearCells: "Effacer le contenu",
    ux_clearCellStyles: "Effacer la mise en forme",
    ux_formatCells: "Format de nombre…",
    ux_nCells: "{n} cellules de {name}",
    ux_cellsHint: "Une modification s'applique à chaque cellule sélectionnée. Un champ vide : les cellules diffèrent. Maj+clic pour une plage, Cmd/Ctrl+clic pour ajouter ou retirer une cellule, la barre au-dessus d'une colonne ou l'étiquette à côté d'une ligne pour la sélectionner entière.",
    ux_monthNames: "Afficher les numéros de mois en noms (janv., févr.…)",
    ux_compactAxis: "Grandes valeurs : l'axe des valeurs est compact (300M, 50K). Modifiez-le sous Axes dans l'inspecteur.",
    ux_unknownField: "Le jeu de données n'a pas de champ « {name} ».",
    ux_unknownFieldSuggest: "Le jeu de données n'a pas de champ « {name} ». Vouliez-vous dire « {suggest} » ?",
    ux_fieldTypeObject: "objet (champs imbriqués)",
    ux_dsPickedPath: "Lignes de {path}, la liste qui ressemble aux lignes (tapez $ dans le chemin pour l'objet racine).",
    ux_addGroupDrill: "Exploration : le groupe démarre replié derrière un bouton ▶",
    ux_imageCat: "Image",
    ux_imageUploadHere: "Téléverser une image…",
    ux_imageHint: "Téléversez ici, déposez un fichier image sur la page ou choisissez une image du rapport. Elles sont gardées dans le rapport (Rapport → Images : Échap ou clic autour de la page).",
    ux_issues: "⚠ {n} à vérifier",
    ux_noIssues: "Aucun problème de mise en page",
    ux_issueOverlap: "{name} chevauche {other}.",
    ux_issueWide: "{name} fait {width} pt de large pour {room} pt de page : ses dernières colonnes passent sur une autre page.",
    ux_issueField: "{name} lit le champ « {field} », absent de son jeu de données.",
    ux_issueFieldSuggest: "{name} lit le champ « {field} », absent de son jeu de données. Vouliez-vous dire « {suggest} » ?",
    ux_wholePage: "Page entière",
    ux_liveHint: "Les modifications s'appliquent dès que vous choisissez. Afficher le rapport le relance depuis le début (groupes fermés, première page).",
    ux_alignBar: "Aligner et dimensionner",
    ux_alignLeft: "Aligner à gauche",
    ux_alignHCenter: "Centrer horizontalement",
    ux_alignRight: "Aligner à droite",
    ux_alignTop: "Aligner en haut",
    ux_alignVMiddle: "Centrer verticalement",
    ux_alignBottom: "Aligner en bas",
    ux_distH: "Répartir horizontalement",
    ux_distV: "Répartir verticalement",
    ux_sameWidth: "Même largeur",
    ux_sameHeight: "Même hauteur",
    ux_toPage: "À la page",
    ux_toPageHint: "Aligner sur la bande ou le conteneur plutôt qu'entre eux (un seul élément s'aligne toujours sur la page)",
    ux_narrowDesigner: "Concevoir demande un écran plus large (900 px ou plus) : ici vous pouvez regarder la page et l'aperçu.",
    ux_nameFirst: "Donnez d'abord un nom au rapport.",
    cf_title: "Mise en forme conditionnelle",
    cf_button: "Mise en forme conditionnelle…",
    cf_rowButton: "Mettre en forme la ligne par règle…",
    cf_points: "Colorer les points par règle…",
    cf_nRules: "{n} règles",
    cf_titleOf: "Mise en forme conditionnelle : {name}",
    cf_titleCell: "Mise en forme conditionnelle : une cellule de {name}",
    cf_titleRow: "Mise en forme conditionnelle : une ligne de {name}",
    cf_apply: "Appliquer",
    cf_when: "Quand plusieurs règles correspondent",
    cf_first: "La première correspondance l'emporte",
    cf_stack: "Les combiner (dans l'ordre)",
    cf_databar: "Barre de données dans la cellule",
    cf_subject: "Champ",
    cf_condition: "Condition",
    cf_value: "Valeur",
    cf_value2: "Valeur haute",
    cf_valuePh: "100, texte ou =Parameters.x",
    cf_thisValue: "Cette valeur",
    cf_p_color: "Couleur du texte",
    cf_p_backgroundColor: "Arrière-plan",
    cf_p_fontWeight: "Gras",
    cf_p_fontStyle: "Italique",
    cf_pointColor: "Couleur du point",
    cf_icon: "Icône",
    cf_icon_good: "Vert",
    cf_icon_warn: "Orange",
    cf_icon_bad: "Rouge",
    cf_addRule: "+ Ajouter une règle",
    cf_custom: "Écrit à la main (conservé sauf si une règle le définit) : {props}.",
    cf_hint: "Les règles deviennent des expressions de style ; rouvrez ceci pour les modifier.",
    cf_hintCell: "Les règles deviennent des expressions de style ; rouvrez ceci pour les modifier. Une icône ou une barre remplit la cellule : donnez-lui sa propre colonne.",
    cf_op_eq: "est égal à",
    cf_op_ne: "est différent de",
    cf_op_lt: "est inférieur à",
    cf_op_le: "est au plus",
    cf_op_gt: "est supérieur à",
    cf_op_ge: "est au moins",
    cf_op_between: "est entre",
    cf_op_top: "est dans les N premiers",
    cf_op_bottom: "est dans les N derniers",
    cf_op_aboveAvg: "est au-dessus de la moyenne",
    cf_op_belowAvg: "est en dessous de la moyenne",
    cf_op_contains: "contient",
    cf_op_startsWith: "commence par",
    cf_op_empty: "est vide",
    cf_op_notEmpty: "n'est pas vide",
    qb_mode: "Construire visuellement ou écrire du SQL",
    qb_build: "Construire visuellement",
    qb_sql: "SQL",
    qb_replaceSql: "Le générateur visuel démarre vide et remplace la requête écrite ici. Continuer ?",
    qb_pickConnection: "Choisissez une connexion pour voir ses tables.",
    qb_loading: "Lecture des tables…",
    qb_noSchema: "Impossible de lire les tables de cette connexion ({message}).",
    qb_tables: "Tables",
    qb_findTable: "Chercher une table",
    qb_addTable: "Ajouter cette table",
    qb_noTables: "Aucune table.",
    qb_start: "Ajoutez une table de la liste, puis cochez ses colonnes.",
    qb_removeTable: "Retirer {name}",
    qb_joins: "Jointures",
    qb_inner: "Lignes correspondantes seulement",
    qb_left: "Toutes les lignes de la première table",
    qb_joinType: "Type de jointure",
    qb_suggested: "Suggérée :",
    qb_addJoin: "Ajouter la jointure",
    qb_joinFrom: "Colonne d'une table",
    qb_joinTo: "Colonne de l'autre table",
    qb_joinHint: "Faites glisser une colonne sur une colonne d'une autre table pour les joindre, ou choisissez-les ici.",
    qb_filters: "Filtres",
    qb_column: "Colonne",
    qb_value: "Une valeur",
    qb_valueFrom: "Comparer à",
    qb_filterHint: "Un paramètre du rapport (@name) est lié à l'exécution, jamais collé dans le SQL.",
    qb_sortLimit: "Tri et limite",
    qb_limit: "Au plus (lignes)",
    qb_preview: "Aperçu des lignes",
    qb_editSql: "Modifier en SQL",
    qb_rows: "{n} lignes (les 20 premières affichées)",
    ux_a11yPageRole: "page"
  },
  de: {
    ux_draftStale: "Nicht gespeicherte Änderungen vom {when} wurden in diesem Browser behalten, aber der Bericht wurde danach erneut gespeichert. Wiederherstellen und Speichern ersetzt diese neuere Fassung.",
    ux_draftRestoreAnyway: "Meine trotzdem wiederherstellen",
    ux_conflict: "Jemand anderes hat diesen Bericht gespeichert, nachdem Sie ihn geöffnet haben. Nichts wurde überschrieben.",
    ux_conflictMine: "Meine über ihre speichern",
    ux_conflictTheirs: "Ihre übernehmen (meine Änderungen verwerfen)",
    ux_choose: "— auswählen —",
    ux_designersGroup: "Designer (alle, die entwerfen dürfen)",
    ux_edit: "Bearbeiten",
    ux_paramPickValueField: "Wählen Sie das Wertfeld für die Auswahl aus dem Datensatz.",
    ux_paramNoValueField: "Die Auswahl aus dem Datensatz hat kein Wertfeld: der Leser sieht eine leere Liste.",
    ux_choicePreview: "{n} Optionen: {list}",
    ux_defaultHintMulti: "Mehrere Werte: mit Kommas trennen, z. B. North, South. Oder ein =Ausdruck.",
    ux_setParams: "Diese Parameter setzen",
    ux_pmapTitle: "Parameter des Zielberichts",
    ux_pmapNoParams: "Dieser Bericht hat keine Parameter.",
    ux_pmapUnknown: "Wählen Sie einen Bericht, um seine Parameter zu sehen, oder fügen Sie einen per Name hinzu.",
    ux_pmapNotAParam: "Der Zielbericht hat keinen Parameter mit diesem Namen.",
    ux_pmapRequired: "Vom Zielbericht verlangt.",
    ux_pmapNotPassed: "nicht übergeben",
    ux_pmapRemove: "{name} entfernen",
    ux_pmapOther: "Weiterer Parameter per Name",
    ux_headerAction: "Aktion beim Klick auf die Kopfzelle",
    ux_totalAction: "Aktion beim Klick auf die Summe",
    ux_cellAction: "Aktion beim Klick auf die Zelle",
    ux_pivotActionHint: "Ein Klick wird im Bereich der Zelle ausgewertet: =Fields.region ist die Region dieser Zeile, =Fields.year das Jahr dieser Spalte.",
    ux_a11yOpenReport: "{text}: Bericht {report} öffnen",
    ux_a11yDetails: "Details ein- oder ausblenden",
    ux_a11ySortAsc: "Nach {text} sortieren, aufsteigend",
    ux_a11ySortDesc: "Nach {text} sortieren, absteigend",
    ux_a11yFilterBy: "Nach {text} filtern",
    ux_a11yGoTo: "Zu {text} springen",
    ux_a11yPage: "{n} von {total}",
    ux_a11yReport: "Bericht",
    ux_draftFound: "Nicht gespeicherte Änderungen vom {when} wurden in diesem Browser aufbewahrt.",
    ux_draftRestore: "Wiederherstellen",
    ux_draftDiscard: "Verwerfen",
    ux_saveDialogInvalid: "Nicht gespeichert: der offene Dialog hat einen Fehler. Beheben oder abbrechen, dann speichern.",
    ux_columns: "Spalten",
    ux_selectColumn: "Spalte {n} auswählen",
    ux_selectRow: "Diese Zeile auswählen (Umschalt oder Cmd/Strg: zur Auswahl hinzufügen)",
    ux_groupByField: "Nach {field} gruppieren",
    ux_clearCells: "Inhalt löschen",
    ux_clearCellStyles: "Formatierung löschen",
    ux_formatCells: "Zahlenformat…",
    ux_nCells: "{n} Zellen von {name}",
    ux_cellsHint: "Eine Änderung gilt für jede ausgewählte Zelle. Ein leeres Feld: die Zellen unterscheiden sich. Umschalt+Klick für einen Bereich, Cmd/Strg+Klick zum Hinzufügen oder Entfernen, die Leiste über einer Spalte oder das Kennzeichen neben einer Zeile wählt sie ganz aus.",
    ux_monthNames: "Monatszahlen als Namen zeigen (Jan, Feb…)",
    ux_compactAxis: "Große Werte: die Werteachse ist kompakt (300M, 50K). Unter Achsen im Inspektor änderbar.",
    ux_unknownField: "Der Datensatz hat kein Feld „{name}“.",
    ux_unknownFieldSuggest: "Der Datensatz hat kein Feld „{name}“. Meinten Sie „{suggest}“?",
    ux_fieldTypeObject: "Objekt (verschachtelte Felder)",
    ux_dsPickedPath: "Zeilen aus {path}, der Liste, die nach den Zeilen aussieht (für das oberste Objekt $ als Pfad eingeben).",
    ux_addGroupDrill: "Drilldown: die Gruppe beginnt eingeklappt hinter einem ▶",
    ux_imageCat: "Bild",
    ux_imageUploadHere: "Bild hochladen…",
    ux_imageHint: "Hier hochladen, eine Bilddatei auf die Seite ziehen oder ein Bild des Berichts wählen. Sie bleiben im Bericht (Bericht → Bilder: Esc oder neben die Seite klicken).",
    ux_issues: "⚠ {n} prüfen",
    ux_noIssues: "Keine Layoutprobleme",
    ux_issueOverlap: "{name} überlappt {other}.",
    ux_issueWide: "{name} ist {width} pt breit, die Seite hat {room} pt: die letzten Spalten wandern auf eine andere Seite.",
    ux_issueField: "{name} liest das Feld „{field}“, das sein Datensatz nicht hat.",
    ux_issueFieldSuggest: "{name} liest das Feld „{field}“, das sein Datensatz nicht hat. Meinten Sie „{suggest}“?",
    ux_wholePage: "Ganze Seite",
    ux_liveHint: "Änderungen gelten sofort. Bericht anzeigen führt ihn neu von vorn aus (Gruppen zu, erste Seite).",
    ux_alignBar: "Ausrichten und Größe",
    ux_alignLeft: "Links ausrichten",
    ux_alignHCenter: "Horizontal zentrieren",
    ux_alignRight: "Rechts ausrichten",
    ux_alignTop: "Oben ausrichten",
    ux_alignVMiddle: "Vertikal zentrieren",
    ux_alignBottom: "Unten ausrichten",
    ux_distH: "Horizontal verteilen",
    ux_distV: "Vertikal verteilen",
    ux_sameWidth: "Gleiche Breite",
    ux_sameHeight: "Gleiche Höhe",
    ux_toPage: "An Seite",
    ux_toPageHint: "An Band oder Container statt aneinander ausrichten (ein einzelnes Element richtet sich immer an der Seite aus)",
    ux_narrowDesigner: "Zum Gestalten braucht es einen breiteren Bildschirm (ab 900 px): hier sehen Sie die Seite und die Vorschau.",
    ux_nameFirst: "Geben Sie dem Bericht zuerst einen Namen.",
    cf_title: "Bedingte Formatierung",
    cf_button: "Bedingte Formatierung…",
    cf_rowButton: "Zeile per Regel formatieren…",
    cf_points: "Punkte per Regel einfärben…",
    cf_nRules: "{n} Regeln",
    cf_titleOf: "Bedingte Formatierung: {name}",
    cf_titleCell: "Bedingte Formatierung: eine Zelle von {name}",
    cf_titleRow: "Bedingte Formatierung: eine Zeile von {name}",
    cf_apply: "Anwenden",
    cf_when: "Wenn mehrere Regeln zutreffen",
    cf_first: "Die erste Übereinstimmung gilt",
    cf_stack: "Kombinieren (der Reihe nach)",
    cf_databar: "Datenbalken in der Zelle",
    cf_subject: "Feld",
    cf_condition: "Bedingung",
    cf_value: "Wert",
    cf_value2: "Oberer Wert",
    cf_valuePh: "100, Text oder =Parameters.x",
    cf_thisValue: "Dieser Wert",
    cf_p_color: "Textfarbe",
    cf_p_backgroundColor: "Hintergrund",
    cf_p_fontWeight: "Fett",
    cf_p_fontStyle: "Kursiv",
    cf_pointColor: "Punktfarbe",
    cf_icon: "Symbol",
    cf_icon_good: "Grün",
    cf_icon_warn: "Gelb",
    cf_icon_bad: "Rot",
    cf_addRule: "+ Regel hinzufügen",
    cf_custom: "Von Hand geschrieben (bleibt, außer eine Regel setzt es): {props}.",
    cf_hint: "Die Regeln werden zu Stilausdrücken; zum Ändern hier wieder öffnen.",
    cf_hintCell: "Die Regeln werden zu Stilausdrücken; zum Ändern wieder öffnen. Ein Symbol oder Datenbalken füllt die Zelle: eine eigene Spalte verwenden.",
    cf_op_eq: "ist gleich",
    cf_op_ne: "ist ungleich",
    cf_op_lt: "ist kleiner als",
    cf_op_le: "ist höchstens",
    cf_op_gt: "ist größer als",
    cf_op_ge: "ist mindestens",
    cf_op_between: "liegt zwischen",
    cf_op_top: "gehört zu den oberen N",
    cf_op_bottom: "gehört zu den unteren N",
    cf_op_aboveAvg: "liegt über dem Durchschnitt",
    cf_op_belowAvg: "liegt unter dem Durchschnitt",
    cf_op_contains: "enthält",
    cf_op_startsWith: "beginnt mit",
    cf_op_empty: "ist leer",
    cf_op_notEmpty: "ist nicht leer",
    qb_mode: "Visuell erstellen oder SQL schreiben",
    qb_build: "Visuell erstellen",
    qb_sql: "SQL",
    qb_replaceSql: "Der visuelle Editor beginnt leer und ersetzt die hier geschriebene Abfrage. Fortfahren?",
    qb_pickConnection: "Wählen Sie eine Verbindung, um ihre Tabellen zu sehen.",
    qb_loading: "Tabellen werden gelesen…",
    qb_noSchema: "Die Tabellen dieser Verbindung ließen sich nicht lesen ({message}).",
    qb_tables: "Tabellen",
    qb_findTable: "Tabelle suchen",
    qb_addTable: "Diese Tabelle hinzufügen",
    qb_noTables: "Keine Tabellen.",
    qb_start: "Fügen Sie eine Tabelle aus der Liste hinzu und haken Sie ihre Spalten an.",
    qb_removeTable: "{name} entfernen",
    qb_joins: "Verknüpfungen",
    qb_inner: "Nur passende Zeilen",
    qb_left: "Alle Zeilen der ersten Tabelle",
    qb_joinType: "Art der Verknüpfung",
    qb_suggested: "Vorschlag:",
    qb_addJoin: "Verknüpfen",
    qb_joinFrom: "Spalte der einen Tabelle",
    qb_joinTo: "Spalte der anderen Tabelle",
    qb_joinHint: "Ziehen Sie eine Spalte auf eine Spalte einer anderen Tabelle, oder wählen Sie beide hier.",
    qb_filters: "Filter",
    qb_column: "Spalte",
    qb_value: "Ein Wert",
    qb_valueFrom: "Vergleichen mit",
    qb_filterHint: "Ein Berichtsparameter (@name) wird beim Ausführen gebunden, nie in das SQL eingefügt.",
    qb_sortLimit: "Sortierung und Limit",
    qb_limit: "Höchstens (Zeilen)",
    qb_preview: "Zeilen ansehen",
    qb_editSql: "Als SQL bearbeiten",
    qb_rows: "{n} Zeilen (die ersten 20 gezeigt)",
    ux_a11yPageRole: "Seite"
  },
  ja: {
    ux_draftStale: "{when} の未保存の変更がこのブラウザーに保存されていましたが、その後レポートが再度保存されました。復元して保存すると、その新しい保存が置き換えられます。",
    ux_draftRestoreAnyway: "それでも自分の変更を復元",
    ux_conflict: "あなたが開いた後に別のユーザーがこのレポートを保存しました。何も上書きされていません。",
    ux_conflictMine: "自分の変更で上書き保存",
    ux_conflictTheirs: "相手の変更を使う（自分の変更を破棄）",
    ux_choose: "— 選択 —",
    ux_designersGroup: "デザイナー（デザインできる全員）",
    ux_edit: "編集",
    ux_paramPickValueField: "データセットの選択肢に使う値フィールドを選んでください。",
    ux_paramNoValueField: "データセットの選択肢に値フィールドがありません。閲覧者には空の一覧が表示されます。",
    ux_choicePreview: "{n} 件の選択肢: {list}",
    ux_defaultHintMulti: "複数の値はカンマで区切ります (例: North, South)。=式 も使えます。",
    ux_setParams: "設定するパラメーター",
    ux_pmapTitle: "移動先レポートのパラメーター",
    ux_pmapNoParams: "このレポートにはパラメーターがありません。",
    ux_pmapUnknown: "レポートを選ぶとパラメーターが一覧表示されます。名前で追加することもできます。",
    ux_pmapNotAParam: "移動先レポートにこの名前のパラメーターはありません。",
    ux_pmapRequired: "移動先レポートで必須です。",
    ux_pmapNotPassed: "渡さない",
    ux_pmapRemove: "{name} を削除",
    ux_pmapOther: "名前で別のパラメーター",
    ux_headerAction: "見出しクリック時の動作",
    ux_totalAction: "合計クリック時の動作",
    ux_cellAction: "セルクリック時の動作",
    ux_pivotActionHint: "クリックはセルの範囲で評価されます。=Fields.region はその行の地域、=Fields.year はその列の年です。",
    ux_a11yOpenReport: "{text}: レポート {report} を開く",
    ux_a11yDetails: "詳細の表示/非表示",
    ux_a11ySortAsc: "{text} で昇順に並べ替え",
    ux_a11ySortDesc: "{text} で降順に並べ替え",
    ux_a11yFilterBy: "{text} で絞り込む",
    ux_a11yGoTo: "{text} へ移動",
    ux_a11yPage: "{n} / {total}",
    ux_a11yReport: "レポート",
    ux_draftFound: "{when} の未保存の変更がこのブラウザーに保持されています。",
    ux_draftRestore: "復元する",
    ux_draftDiscard: "破棄",
    ux_saveDialogInvalid: "保存されていません: 開いているダイアログにエラーがあります。修正するかキャンセルしてから保存してください。",
    ux_columns: "列",
    ux_selectColumn: "列 {n} を選択",
    ux_selectRow: "この行を選択 (Shift または Cmd/Ctrl で追加)",
    ux_groupByField: "{field} でグループ化",
    ux_clearCells: "内容をクリア",
    ux_clearCellStyles: "書式をクリア",
    ux_formatCells: "数値の書式…",
    ux_nCells: "{name} の {n} 個のセル",
    ux_cellsHint: "変更は選択したすべてのセルに適用されます。空欄はセルごとに値が異なることを示します。Shift+クリックで範囲、Cmd/Ctrl+クリックで追加・削除、列の上のバーや行の横のタグで列・行全体を選択します。",
    ux_monthNames: "月番号を月名で表示 (1月、2月…)",
    ux_compactAxis: "大きな値: 値軸はコンパクト表示です (300M, 50K)。インスペクターの「軸」で変更できます。",
    ux_unknownField: "データセットにフィールド「{name}」はありません。",
    ux_unknownFieldSuggest: "データセットにフィールド「{name}」はありません。「{suggest}」ですか?",
    ux_fieldTypeObject: "オブジェクト (入れ子のフィールド)",
    ux_dsPickedPath: "{path} の行を使います (行らしい一覧)。最上位のオブジェクトにはパスに $ と入力します。",
    ux_addGroupDrill: "ドリルダウン: グループは ▶ で折りたたんだ状態で始まります",
    ux_imageCat: "画像",
    ux_imageUploadHere: "画像をアップロード…",
    ux_imageHint: "ここでアップロードするか、画像ファイルをページにドロップするか、レポートの画像を選びます。画像はレポート内に保存されます (レポート → 画像: Esc キーかページの外側をクリック)。",
    ux_issues: "⚠ 確認 {n} 件",
    ux_noIssues: "レイアウトの問題はありません",
    ux_issueOverlap: "{name} が {other} と重なっています。",
    ux_issueWide: "{name} の幅は {width} pt で、ページは {room} pt です。最後の列は別のページに移ります。",
    ux_issueField: "{name} はデータセットにないフィールド「{field}」を読んでいます。",
    ux_issueFieldSuggest: "{name} はデータセットにないフィールド「{field}」を読んでいます。「{suggest}」ですか?",
    ux_wholePage: "ページ全体",
    ux_liveHint: "選ぶとすぐに反映されます。「レポートを表示」は最初から実行し直します (グループを閉じ、1 ページ目)。",
    ux_alignBar: "整列とサイズ",
    ux_alignLeft: "左端を揃える",
    ux_alignHCenter: "左右中央に揃える",
    ux_alignRight: "右端を揃える",
    ux_alignTop: "上端を揃える",
    ux_alignVMiddle: "上下中央に揃える",
    ux_alignBottom: "下端を揃える",
    ux_distH: "左右に均等配置",
    ux_distV: "上下に均等配置",
    ux_sameWidth: "幅を揃える",
    ux_sameHeight: "高さを揃える",
    ux_toPage: "ページ基準",
    ux_toPageHint: "互いではなくバンドやコンテナーに揃えます (1 つだけのときは常にページ基準)",
    ux_narrowDesigner: "デザインには広い画面 (900 px 以上) が必要です。ここではページを見てプレビューできます。",
    ux_nameFirst: "先にレポート名を入力してください。",
    cf_title: "条件付き書式",
    cf_button: "条件付き書式…",
    cf_rowButton: "ルールで行を書式設定…",
    cf_points: "ルールで点を色分け…",
    cf_nRules: "ルール {n} 件",
    cf_titleOf: "条件付き書式: {name}",
    cf_titleCell: "条件付き書式: {name} のセル",
    cf_titleRow: "条件付き書式: {name} の行",
    cf_apply: "適用",
    cf_when: "複数のルールが一致したとき",
    cf_first: "最初に一致したルールのみ",
    cf_stack: "順に組み合わせる",
    cf_databar: "セル内にデータバー",
    cf_subject: "フィールド",
    cf_condition: "条件",
    cf_value: "値",
    cf_value2: "上限値",
    cf_valuePh: "100、文字列、=Parameters.x",
    cf_thisValue: "この値",
    cf_p_color: "文字の色",
    cf_p_backgroundColor: "背景",
    cf_p_fontWeight: "太字",
    cf_p_fontStyle: "斜体",
    cf_pointColor: "点の色",
    cf_icon: "アイコン",
    cf_icon_good: "緑",
    cf_icon_warn: "黄",
    cf_icon_bad: "赤",
    cf_addRule: "+ ルールを追加",
    cf_custom: "手書きの式 (ルールで設定しない限り残ります): {props}。",
    cf_hint: "ルールはスタイル式になります。変更するにはここを開き直します。",
    cf_hintCell: "ルールはスタイル式になります。アイコンやデータバーはセル全体を使うので、専用の列にしてください。",
    cf_op_eq: "と等しい",
    cf_op_ne: "と等しくない",
    cf_op_lt: "より小さい",
    cf_op_le: "以下",
    cf_op_gt: "より大きい",
    cf_op_ge: "以上",
    cf_op_between: "の範囲内",
    cf_op_top: "上位 N 件",
    cf_op_bottom: "下位 N 件",
    cf_op_aboveAvg: "平均より上",
    cf_op_belowAvg: "平均より下",
    cf_op_contains: "を含む",
    cf_op_startsWith: "で始まる",
    cf_op_empty: "が空",
    cf_op_notEmpty: "が空でない",
    qb_mode: "ビジュアルで作成または SQL を記述",
    qb_build: "ビジュアルで作成",
    qb_sql: "SQL",
    qb_replaceSql: "ビジュアル ビルダーは空から始まり、ここに書いたクエリを置き換えます。続けますか?",
    qb_pickConnection: "接続を選ぶとテーブルが表示されます。",
    qb_loading: "テーブルを読み込み中…",
    qb_noSchema: "この接続のテーブルを読み込めませんでした ({message})。",
    qb_tables: "テーブル",
    qb_findTable: "テーブルを検索",
    qb_addTable: "このテーブルを追加",
    qb_noTables: "テーブルがありません。",
    qb_start: "一覧からテーブルを追加し、列にチェックを入れます。",
    qb_removeTable: "{name} を削除",
    qb_joins: "結合",
    qb_inner: "一致する行のみ",
    qb_left: "最初のテーブルの全行",
    qb_joinType: "結合の種類",
    qb_suggested: "候補:",
    qb_addJoin: "結合を追加",
    qb_joinFrom: "一方のテーブルの列",
    qb_joinTo: "もう一方のテーブルの列",
    qb_joinHint: "列を別のテーブルの列にドラッグして結合するか、ここで両方を選びます。",
    qb_filters: "フィルター",
    qb_column: "列",
    qb_value: "値",
    qb_valueFrom: "比較対象",
    qb_filterHint: "レポートのパラメーター (@name) は実行時にバインドされ、SQL に貼り込まれることはありません。",
    qb_sortLimit: "並べ替えと件数",
    qb_limit: "最大 (行)",
    qb_preview: "行をプレビュー",
    qb_editSql: "SQL として編集",
    qb_rows: "{n} 行 (先頭 20 行を表示)",
    ux_a11yPageRole: "ページ"
  },
  zh: {
    ux_draftStale: "此浏览器中保留了 {when} 的未保存更改，但报表在那之后又被保存过。恢复并保存将替换那次较新的保存。",
    ux_draftRestoreAnyway: "仍然恢复我的更改",
    ux_conflict: "在您打开之后，其他人保存了此报表。没有任何内容被覆盖。",
    ux_conflictMine: "用我的覆盖他们的",
    ux_conflictTheirs: "采用他们的（放弃我的更改）",
    ux_choose: "— 选择 —",
    ux_designersGroup: "设计者（所有可设计的用户）",
    ux_edit: "编辑",
    ux_paramPickValueField: "请为数据集中的选项选择值字段。",
    ux_paramNoValueField: "数据集中的选项没有值字段：读者将看到空列表。",
    ux_choicePreview: "{n} 个选项：{list}",
    ux_defaultHintMulti: "多个值用逗号分隔，例如 North, South。也可以是 =表达式。",
    ux_setParams: "设置这些参数",
    ux_pmapTitle: "目标报表的参数",
    ux_pmapNoParams: "此报表没有参数。",
    ux_pmapUnknown: "选择报表以列出其参数，或按名称添加参数。",
    ux_pmapNotAParam: "目标报表没有此名称的参数。",
    ux_pmapRequired: "目标报表要求此参数。",
    ux_pmapNotPassed: "不传递",
    ux_pmapRemove: "移除 {name}",
    ux_pmapOther: "按名称添加其他参数",
    ux_headerAction: "单击标题时的操作",
    ux_totalAction: "单击合计时的操作",
    ux_cellAction: "单击单元格时的操作",
    ux_pivotActionHint: "单击在单元格范围内求值：=Fields.region 是该行的区域，=Fields.year 是该列的年份。",
    ux_a11yOpenReport: "{text}：打开报表 {report}",
    ux_a11yDetails: "显示或隐藏详细信息",
    ux_a11ySortAsc: "按 {text} 升序排序",
    ux_a11ySortDesc: "按 {text} 降序排序",
    ux_a11yFilterBy: "按 {text} 筛选",
    ux_a11yGoTo: "转到 {text}",
    ux_a11yPage: "{n} / {total}",
    ux_a11yReport: "报表",
    ux_draftFound: "此浏览器保留了 {when} 未保存的更改。",
    ux_draftRestore: "恢复",
    ux_draftDiscard: "放弃",
    ux_saveDialogInvalid: "未保存：打开的对话框有错误。请修正或取消后再保存。",
    ux_columns: "列",
    ux_selectColumn: "选择第 {n} 列",
    ux_selectRow: "选择此行（Shift 或 Cmd/Ctrl：加入选择）",
    ux_groupByField: "按 {field} 分组",
    ux_clearCells: "清除内容",
    ux_clearCellStyles: "清除格式",
    ux_formatCells: "数字格式…",
    ux_nCells: "{name} 的 {n} 个单元格",
    ux_cellsHint: "更改将应用于每个选中的单元格。空白字段表示各单元格不同。Shift+单击选择范围，Cmd/Ctrl+单击添加或移除单元格，单击列上方的条或行旁的标签可选中整列或整行。",
    ux_monthNames: "将月份数字显示为名称（1月、2月…）",
    ux_compactAxis: "数值较大：数值轴使用紧凑格式（300M、50K）。可在检查器的“坐标轴”中更改。",
    ux_unknownField: "数据集中没有字段“{name}”。",
    ux_unknownFieldSuggest: "数据集中没有字段“{name}”。您是指“{suggest}”吗？",
    ux_fieldTypeObject: "对象（嵌套字段）",
    ux_dsPickedPath: "来自 {path} 的行，即看起来像行的列表（要用顶层对象，请在路径中输入 $）。",
    ux_addGroupDrill: "向下钻取：分组以 ▶ 折叠状态开始",
    ux_imageCat: "图片",
    ux_imageUploadHere: "上传图片…",
    ux_imageHint: "在此上传、将图片文件拖到页面上，或从报表的图片中选择。图片保存在报表中（报表 → 图片：按 Esc 或单击页面外侧）。",
    ux_issues: "⚠ {n} 项待检查",
    ux_noIssues: "没有布局问题",
    ux_issueOverlap: "{name} 与 {other} 重叠。",
    ux_issueWide: "{name} 宽 {width} pt，而页面只有 {room} pt：最后几列会移到另一页。",
    ux_issueField: "{name} 读取字段“{field}”，但其数据集中没有该字段。",
    ux_issueFieldSuggest: "{name} 读取字段“{field}”，但其数据集中没有该字段。您是指“{suggest}”吗？",
    ux_wholePage: "整页",
    ux_liveHint: "选择后立即生效。“查看报表”会从头重新运行（分组收起，回到第一页）。",
    ux_alignBar: "对齐和大小",
    ux_alignLeft: "左对齐",
    ux_alignHCenter: "水平居中",
    ux_alignRight: "右对齐",
    ux_alignTop: "顶端对齐",
    ux_alignVMiddle: "垂直居中",
    ux_alignBottom: "底端对齐",
    ux_distH: "水平分布",
    ux_distV: "垂直分布",
    ux_sameWidth: "相同宽度",
    ux_sameHeight: "相同高度",
    ux_toPage: "相对页面",
    ux_toPageHint: "相对带区或容器对齐，而非彼此对齐（单个项目始终相对页面）",
    ux_narrowDesigner: "设计需要更宽的屏幕（900 px 或以上）：此处可查看页面和预览。",
    ux_nameFirst: "请先为报表命名。",
    cf_title: "条件格式",
    cf_button: "条件格式…",
    cf_rowButton: "按规则设置行格式…",
    cf_points: "按规则为数据点着色…",
    cf_nRules: "{n} 条规则",
    cf_titleOf: "条件格式：{name}",
    cf_titleCell: "条件格式：{name} 的单元格",
    cf_titleRow: "条件格式：{name} 的行",
    cf_apply: "应用",
    cf_when: "多条规则匹配时",
    cf_first: "第一条匹配的规则生效",
    cf_stack: "按顺序叠加",
    cf_databar: "单元格内数据条",
    cf_subject: "字段",
    cf_condition: "条件",
    cf_value: "值",
    cf_value2: "上限值",
    cf_valuePh: "100、文本或 =Parameters.x",
    cf_thisValue: "此值",
    cf_p_color: "文字颜色",
    cf_p_backgroundColor: "背景",
    cf_p_fontWeight: "粗体",
    cf_p_fontStyle: "斜体",
    cf_pointColor: "数据点颜色",
    cf_icon: "图标",
    cf_icon_good: "绿",
    cf_icon_warn: "黄",
    cf_icon_bad: "红",
    cf_addRule: "+ 添加规则",
    cf_custom: "手写表达式（除非规则设置，否则保留）：{props}。",
    cf_hint: "规则会写成样式表达式；重新打开此处即可修改。",
    cf_hintCell: "规则会写成样式表达式；重新打开可修改。图标或数据条会占满单元格：请给它单独一列。",
    cf_op_eq: "等于",
    cf_op_ne: "不等于",
    cf_op_lt: "小于",
    cf_op_le: "不大于",
    cf_op_gt: "大于",
    cf_op_ge: "不小于",
    cf_op_between: "介于",
    cf_op_top: "前 N 名",
    cf_op_bottom: "后 N 名",
    cf_op_aboveAvg: "高于平均值",
    cf_op_belowAvg: "低于平均值",
    cf_op_contains: "包含",
    cf_op_startsWith: "开头为",
    cf_op_empty: "为空",
    cf_op_notEmpty: "不为空",
    qb_mode: "可视化构建或编写 SQL",
    qb_build: "可视化构建",
    qb_sql: "SQL",
    qb_replaceSql: "可视化构建器从空白开始，并替换此处编写的查询。继续？",
    qb_pickConnection: "选择连接以查看其表。",
    qb_loading: "正在读取表…",
    qb_noSchema: "无法读取此连接的表（{message}）。",
    qb_tables: "表",
    qb_findTable: "查找表",
    qb_addTable: "添加此表",
    qb_noTables: "没有表。",
    qb_start: "从列表中添加表，然后勾选其列。",
    qb_removeTable: "移除 {name}",
    qb_joins: "连接",
    qb_inner: "仅匹配的行",
    qb_left: "第一个表的所有行",
    qb_joinType: "连接类型",
    qb_suggested: "建议：",
    qb_addJoin: "添加连接",
    qb_joinFrom: "一个表的列",
    qb_joinTo: "另一个表的列",
    qb_joinHint: "将一列拖到另一个表的列上即可连接，或在此选择两列。",
    qb_filters: "筛选",
    qb_column: "列",
    qb_value: "一个值",
    qb_valueFrom: "比较对象",
    qb_filterHint: "报表参数（@name）在执行查询时绑定，绝不会拼接进 SQL。",
    qb_sortLimit: "排序和限制",
    qb_limit: "最多（行）",
    qb_preview: "预览行",
    qb_editSql: "以 SQL 编辑",
    qb_rows: "{n} 行（显示前 20 行）",
    ux_a11yPageRole: "页"
  },
  "pt-BR": {
    ux_draftStale: "Alterações não salvas de {when} foram mantidas neste navegador, mas o relatório foi salvo novamente depois. Restaurá-las e salvar substitui esse salvamento mais recente.",
    ux_draftRestoreAnyway: "Restaurar as minhas mesmo assim",
    ux_conflict: "Outra pessoa salvou este relatório depois que você o abriu. Nada foi sobrescrito.",
    ux_conflictMine: "Salvar o meu por cima do deles",
    ux_conflictTheirs: "Ficar com o deles (descartar minhas alterações)",
    ux_choose: "— escolher —",
    ux_designersGroup: "Designers (todos que podem criar relatórios)",
    ux_edit: "Editar",
    ux_paramPickValueField: "Escolha o campo de valor para as opções do conjunto de dados.",
    ux_paramNoValueField: "As opções do conjunto de dados não têm campo de valor: o leitor vê uma lista vazia.",
    ux_choicePreview: "{n} opções: {list}",
    ux_defaultHintMulti: "Vários valores: separe-os com vírgulas, p. ex. North, South. Ou uma =expressão.",
    ux_setParams: "Definir estes parâmetros",
    ux_pmapTitle: "Parâmetros do relatório de destino",
    ux_pmapNoParams: "Este relatório não tem parâmetros.",
    ux_pmapUnknown: "Escolha um relatório para ver seus parâmetros, ou adicione um pelo nome.",
    ux_pmapNotAParam: "O relatório de destino não tem parâmetro com este nome.",
    ux_pmapRequired: "Obrigatório no relatório de destino.",
    ux_pmapNotPassed: "não enviado",
    ux_pmapRemove: "Remover {name}",
    ux_pmapOther: "Outro parâmetro pelo nome",
    ux_headerAction: "Ação ao clicar no cabeçalho",
    ux_totalAction: "Ação ao clicar no total",
    ux_cellAction: "Ação ao clicar na célula",
    ux_pivotActionHint: "O clique é avaliado no escopo da célula: =Fields.region é a região dessa linha, =Fields.year o ano dessa coluna.",
    ux_a11yOpenReport: "{text}: abrir o relatório {report}",
    ux_a11yDetails: "Mostrar ou ocultar detalhes",
    ux_a11ySortAsc: "Ordenar por {text}, crescente",
    ux_a11ySortDesc: "Ordenar por {text}, decrescente",
    ux_a11yFilterBy: "Filtrar por {text}",
    ux_a11yGoTo: "Ir para {text}",
    ux_a11yPage: "{n} de {total}",
    ux_a11yReport: "Relatório",
    ux_draftFound: "Alterações não salvas de {when} foram guardadas neste navegador.",
    ux_draftRestore: "Restaurar",
    ux_draftDiscard: "Descartar",
    ux_saveDialogInvalid: "Não salvo: a caixa de diálogo aberta tem um erro. Corrija-a ou cancele-a e salve.",
    ux_columns: "Colunas",
    ux_selectColumn: "Selecionar a coluna {n}",
    ux_selectRow: "Selecionar esta linha (Shift ou Cmd/Ctrl: adicionar à seleção)",
    ux_groupByField: "Agrupar por {field}",
    ux_clearCells: "Limpar conteúdo",
    ux_clearCellStyles: "Limpar formatação",
    ux_formatCells: "Formato de número…",
    ux_nCells: "{n} células de {name}",
    ux_cellsHint: "Uma alteração vale para todas as células selecionadas. Um campo vazio: as células diferem. Shift+clique para um intervalo, Cmd/Ctrl+clique para adicionar ou remover uma célula, a barra acima de uma coluna ou a etiqueta ao lado de uma linha para selecioná-la inteira.",
    ux_monthNames: "Mostrar números do mês como nomes (jan, fev…)",
    ux_compactAxis: "Valores grandes: o eixo de valores é compacto (300M, 50K). Altere em Eixos no Inspetor.",
    ux_unknownField: 'O conjunto de dados não tem o campo "{name}".',
    ux_unknownFieldSuggest: 'O conjunto de dados não tem o campo "{name}". Você quis dizer "{suggest}"?',
    ux_fieldTypeObject: "objeto (campos aninhados)",
    ux_dsPickedPath: "Linhas de {path}, a lista que parece as linhas (digite $ no caminho para o objeto de topo).",
    ux_addGroupDrill: "Detalhamento: o grupo começa recolhido atrás de um ▶",
    ux_imageCat: "Imagem",
    ux_imageUploadHere: "Enviar uma imagem…",
    ux_imageHint: "Envie aqui, solte um arquivo de imagem na página ou escolha uma imagem do relatório. Elas ficam no relatório (Relatório → Imagens: Esc ou clique ao redor da página).",
    ux_issues: "⚠ {n} para verificar",
    ux_noIssues: "Sem problemas de layout",
    ux_issueOverlap: "{name} sobrepõe {other}.",
    ux_issueWide: "{name} tem {width} pt de largura onde a página tem {room} pt: as últimas colunas vão para outra página.",
    ux_issueField: '{name} lê o campo "{field}", que seu conjunto de dados não tem.',
    ux_issueFieldSuggest: '{name} lê o campo "{field}", que seu conjunto de dados não tem. Você quis dizer "{suggest}"?',
    ux_wholePage: "Página inteira",
    ux_liveHint: "As alterações valem assim que você escolhe. Ver relatório executa de novo desde o início (grupos fechados, primeira página).",
    ux_alignBar: "Alinhar e dimensionar",
    ux_alignLeft: "Alinhar à esquerda",
    ux_alignHCenter: "Centralizar na horizontal",
    ux_alignRight: "Alinhar à direita",
    ux_alignTop: "Alinhar no topo",
    ux_alignVMiddle: "Centralizar na vertical",
    ux_alignBottom: "Alinhar embaixo",
    ux_distH: "Distribuir na horizontal",
    ux_distV: "Distribuir na vertical",
    ux_sameWidth: "Mesma largura",
    ux_sameHeight: "Mesma altura",
    ux_toPage: "À página",
    ux_toPageHint: "Alinhar à faixa ou ao contêiner em vez de entre si (um item sozinho sempre se alinha à página)",
    ux_narrowDesigner: "Desenhar exige uma tela mais larga (900 px ou mais): aqui você pode ver a página e a pré-visualização.",
    ux_nameFirst: "Dê um nome ao relatório primeiro.",
    cf_title: "Formatação condicional",
    cf_button: "Formatação condicional…",
    cf_rowButton: "Formatar a linha por regra…",
    cf_points: "Colorir os pontos por regra…",
    cf_nRules: "{n} regras",
    cf_titleOf: "Formatação condicional: {name}",
    cf_titleCell: "Formatação condicional: uma célula de {name}",
    cf_titleRow: "Formatação condicional: uma linha de {name}",
    cf_apply: "Aplicar",
    cf_when: "Quando várias regras coincidem",
    cf_first: "Vale a primeira correspondência",
    cf_stack: "Combiná-las (em ordem)",
    cf_databar: "Barra de dados na célula",
    cf_subject: "Campo",
    cf_condition: "Condição",
    cf_value: "Valor",
    cf_value2: "Valor superior",
    cf_valuePh: "100, texto ou =Parameters.x",
    cf_thisValue: "Este valor",
    cf_p_color: "Cor do texto",
    cf_p_backgroundColor: "Fundo",
    cf_p_fontWeight: "Negrito",
    cf_p_fontStyle: "Itálico",
    cf_pointColor: "Cor do ponto",
    cf_icon: "Ícone",
    cf_icon_good: "Verde",
    cf_icon_warn: "Âmbar",
    cf_icon_bad: "Vermelho",
    cf_addRule: "+ Adicionar regra",
    cf_custom: "Escrito à mão (mantido, salvo se uma regra o definir): {props}.",
    cf_hint: "As regras viram expressões de estilo; reabra isto para alterá-las.",
    cf_hintCell: "As regras viram expressões de estilo; reabra para alterá-las. Um ícone ou barra ocupa a célula: dê-lhe uma coluna própria.",
    cf_op_eq: "é igual a",
    cf_op_ne: "é diferente de",
    cf_op_lt: "é menor que",
    cf_op_le: "é no máximo",
    cf_op_gt: "é maior que",
    cf_op_ge: "é no mínimo",
    cf_op_between: "está entre",
    cf_op_top: "está entre os N maiores",
    cf_op_bottom: "está entre os N menores",
    cf_op_aboveAvg: "está acima da média",
    cf_op_belowAvg: "está abaixo da média",
    cf_op_contains: "contém",
    cf_op_startsWith: "começa com",
    cf_op_empty: "está vazio",
    cf_op_notEmpty: "não está vazio",
    qb_mode: "Construir visualmente ou escrever SQL",
    qb_build: "Construir visualmente",
    qb_sql: "SQL",
    qb_replaceSql: "O construtor visual começa vazio e substitui a consulta escrita aqui. Continuar?",
    qb_pickConnection: "Escolha uma conexão para ver suas tabelas.",
    qb_loading: "Lendo as tabelas…",
    qb_noSchema: "Não foi possível ler as tabelas desta conexão ({message}).",
    qb_tables: "Tabelas",
    qb_findTable: "Procurar uma tabela",
    qb_addTable: "Adicionar esta tabela",
    qb_noTables: "Sem tabelas.",
    qb_start: "Adicione uma tabela da lista e marque suas colunas.",
    qb_removeTable: "Remover {name}",
    qb_joins: "Junções",
    qb_inner: "Só linhas correspondentes",
    qb_left: "Todas as linhas da primeira tabela",
    qb_joinType: "Tipo de junção",
    qb_suggested: "Sugerida:",
    qb_addJoin: "Adicionar junção",
    qb_joinFrom: "Coluna de uma tabela",
    qb_joinTo: "Coluna da outra tabela",
    qb_joinHint: "Arraste uma coluna sobre uma coluna de outra tabela para juntá-las, ou escolha as duas aqui.",
    qb_filters: "Filtros",
    qb_column: "Coluna",
    qb_value: "Um valor",
    qb_valueFrom: "Comparar com",
    qb_filterHint: "Um parâmetro do relatório (@name) é vinculado na execução, nunca colado no SQL.",
    qb_sortLimit: "Ordem e limite",
    qb_limit: "No máximo (linhas)",
    qb_preview: "Pré-visualizar linhas",
    qb_editSql: "Editar como SQL",
    qb_rows: "{n} linhas (as primeiras 20 mostradas)",
    ux_a11yPageRole: "página"
  },
  ar: {
    ux_draftStale: "احتُفظ في هذا المتصفح بتغييرات غير محفوظة من {when}، لكن التقرير حُفظ مرة أخرى بعدها. استعادتها ثم الحفظ يستبدل ذلك الحفظ الأحدث.",
    ux_draftRestoreAnyway: "استعادة تغييراتي على أي حال",
    ux_conflict: "حفظ شخص آخر هذا التقرير بعد أن فتحته. لم يُستبدل شيء.",
    ux_conflictMine: "حفظ نسختي فوق نسختهم",
    ux_conflictTheirs: "أخذ نسختهم (تجاهل تغييراتي)",
    ux_choose: "— اختر —",
    ux_designersGroup: "المصممون (كل من يمكنه التصميم)",
    ux_edit: "تحرير",
    ux_paramPickValueField: "اختر حقل القيمة للخيارات من مجموعة البيانات.",
    ux_paramNoValueField: "خيارات مجموعة البيانات بلا حقل قيمة: سيرى القارئ قائمة فارغة.",
    ux_choicePreview: "{n} خيارات: {list}",
    ux_defaultHintMulti: "عدة قيم: افصل بينها بفواصل، مثل North, South. أو =تعبير.",
    ux_setParams: "تعيين هذه المعاملات",
    ux_pmapTitle: "معاملات التقرير الهدف",
    ux_pmapNoParams: "لا يحتوي هذا التقرير على معاملات.",
    ux_pmapUnknown: "اختر تقريرًا لعرض معاملاته، أو أضف معاملًا بالاسم.",
    ux_pmapNotAParam: "لا يحتوي التقرير الهدف على معامل بهذا الاسم.",
    ux_pmapRequired: "مطلوب في التقرير الهدف.",
    ux_pmapNotPassed: "لا يُمرَّر",
    ux_pmapRemove: "إزالة {name}",
    ux_pmapOther: "معامل آخر بالاسم",
    ux_headerAction: "الإجراء عند النقر على العنوان",
    ux_totalAction: "الإجراء عند النقر على الإجمالي",
    ux_cellAction: "الإجراء عند النقر على الخلية",
    ux_pivotActionHint: "يُقيَّم النقر في نطاق الخلية: =Fields.region هي منطقة ذلك الصف، و=Fields.year سنة ذلك العمود.",
    ux_a11yOpenReport: "{text}: فتح التقرير {report}",
    ux_a11yDetails: "إظهار التفاصيل أو إخفاؤها",
    ux_a11ySortAsc: "الفرز حسب {text}، تصاعديًا",
    ux_a11ySortDesc: "الفرز حسب {text}، تنازليًا",
    ux_a11yFilterBy: "التصفية حسب {text}",
    ux_a11yGoTo: "الانتقال إلى {text}",
    ux_a11yPage: "{n} من {total}",
    ux_a11yReport: "تقرير",
    ux_draftFound: "احتُفظ في هذا المتصفح بتغييرات غير محفوظة من {when}.",
    ux_draftRestore: "استعادتها",
    ux_draftDiscard: "تجاهل",
    ux_saveDialogInvalid: "لم يُحفظ: في مربع الحوار المفتوح خطأ. أصلحه أو ألغه ثم احفظ.",
    ux_columns: "الأعمدة",
    ux_selectColumn: "تحديد العمود {n}",
    ux_selectRow: "تحديد هذا الصف (Shift أو Cmd/Ctrl: الإضافة إلى التحديد)",
    ux_groupByField: "التجميع حسب {field}",
    ux_clearCells: "مسح المحتوى",
    ux_clearCellStyles: "مسح التنسيق",
    ux_formatCells: "تنسيق الأرقام…",
    ux_nCells: "{n} خلايا من {name}",
    ux_cellsHint: "ينطبق التغيير على كل خلية محددة. الحقل الفارغ: الخلايا مختلفة. Shift+نقر لنطاق، وCmd/Ctrl+نقر لإضافة خلية أو إزالتها، والشريط فوق العمود أو الوسم بجانب الصف لتحديده كاملًا.",
    ux_monthNames: "عرض أرقام الأشهر كأسماء (يناير، فبراير…)",
    ux_compactAxis: "قيم كبيرة: محور القيم مختصر (300M, 50K). غيّره من المحاور في المفتش.",
    ux_unknownField: 'لا يحتوي مجموعة البيانات على الحقل "{name}".',
    ux_unknownFieldSuggest: 'لا يحتوي مجموعة البيانات على الحقل "{name}". هل تقصد "{suggest}"؟',
    ux_fieldTypeObject: "كائن (حقول متداخلة)",
    ux_dsPickedPath: "صفوف من {path}، القائمة التي تبدو كالصفوف (اكتب $ في المسار للكائن الأعلى).",
    ux_addGroupDrill: "تفصيل: تبدأ المجموعة مطوية خلف زر ▶",
    ux_imageCat: "صورة",
    ux_imageUploadHere: "رفع صورة…",
    ux_imageHint: "ارفع هنا، أو أسقط ملف صورة على الصفحة، أو اختر إحدى صور التقرير. تُحفظ في التقرير (التقرير ← الصور: اضغط Esc أو انقر حول الصفحة).",
    ux_issues: "⚠ {n} للمراجعة",
    ux_noIssues: "لا مشكلات في التخطيط",
    ux_issueOverlap: "{name} يتداخل مع {other}.",
    ux_issueWide: "عرض {name} هو {width} pt بينما للصفحة {room} pt: تنتقل أعمدته الأخيرة إلى صفحة أخرى.",
    ux_issueField: '{name} يقرأ الحقل "{field}" غير الموجود في مجموعة بياناته.',
    ux_issueFieldSuggest: '{name} يقرأ الحقل "{field}" غير الموجود في مجموعة بياناته. هل تقصد "{suggest}"؟',
    ux_wholePage: "الصفحة كاملة",
    ux_liveHint: "تُطبَّق التغييرات فور اختيارها. «عرض التقرير» يشغّله من البداية (المجموعات مطوية، الصفحة الأولى).",
    ux_alignBar: "المحاذاة والحجم",
    ux_alignLeft: "محاذاة الحواف اليسرى",
    ux_alignHCenter: "توسيط أفقي",
    ux_alignRight: "محاذاة الحواف اليمنى",
    ux_alignTop: "محاذاة الحواف العليا",
    ux_alignVMiddle: "توسيط رأسي",
    ux_alignBottom: "محاذاة الحواف السفلى",
    ux_distH: "توزيع أفقي",
    ux_distV: "توزيع رأسي",
    ux_sameWidth: "العرض نفسه",
    ux_sameHeight: "الارتفاع نفسه",
    ux_toPage: "بالنسبة للصفحة",
    ux_toPageHint: "المحاذاة إلى الشريط أو الحاوية بدلًا من بعضها (العنصر الواحد يُحاذى دائمًا إلى الصفحة)",
    ux_narrowDesigner: "يحتاج التصميم إلى شاشة أعرض (900 بكسل أو أكثر): يمكنك هنا عرض الصفحة ومعاينتها.",
    ux_nameFirst: "أعطِ التقرير اسمًا أولًا.",
    cf_title: "التنسيق الشرطي",
    cf_button: "التنسيق الشرطي…",
    cf_rowButton: "تنسيق الصف حسب قاعدة…",
    cf_points: "تلوين النقاط حسب قاعدة…",
    cf_nRules: "{n} قواعد",
    cf_titleOf: "التنسيق الشرطي: {name}",
    cf_titleCell: "التنسيق الشرطي: خلية من {name}",
    cf_titleRow: "التنسيق الشرطي: صف من {name}",
    cf_apply: "تطبيق",
    cf_when: "عند تطابق عدة قواعد",
    cf_first: "تفوز المطابقة الأولى",
    cf_stack: "دمجها (بالترتيب)",
    cf_databar: "شريط بيانات في الخلية",
    cf_subject: "الحقل",
    cf_condition: "الشرط",
    cf_value: "القيمة",
    cf_value2: "القيمة العليا",
    cf_valuePh: "100 أو نص أو ‎=Parameters.x",
    cf_thisValue: "هذه القيمة",
    cf_p_color: "لون النص",
    cf_p_backgroundColor: "الخلفية",
    cf_p_fontWeight: "غامق",
    cf_p_fontStyle: "مائل",
    cf_pointColor: "لون النقطة",
    cf_icon: "أيقونة",
    cf_icon_good: "أخضر",
    cf_icon_warn: "كهرماني",
    cf_icon_bad: "أحمر",
    cf_addRule: "+ إضافة قاعدة",
    cf_custom: "مكتوب يدويًا (يبقى ما لم تحدده قاعدة): {props}.",
    cf_hint: "تصبح القواعد تعبيرات نمط؛ أعد فتح هذا لتغييرها.",
    cf_hintCell: "تصبح القواعد تعبيرات نمط؛ أعد الفتح لتغييرها. الأيقونة أو الشريط يملأ الخلية: خصّص لها عمودًا.",
    cf_op_eq: "يساوي",
    cf_op_ne: "لا يساوي",
    cf_op_lt: "أقل من",
    cf_op_le: "على الأكثر",
    cf_op_gt: "أكبر من",
    cf_op_ge: "على الأقل",
    cf_op_between: "بين",
    cf_op_top: "ضمن أعلى N",
    cf_op_bottom: "ضمن أدنى N",
    cf_op_aboveAvg: "أعلى من المتوسط",
    cf_op_belowAvg: "أقل من المتوسط",
    cf_op_contains: "يحتوي على",
    cf_op_startsWith: "يبدأ بـ",
    cf_op_empty: "فارغ",
    cf_op_notEmpty: "غير فارغ",
    qb_mode: "البناء مرئيًا أو كتابة SQL",
    qb_build: "البناء مرئيًا",
    qb_sql: "SQL",
    qb_replaceSql: "يبدأ المنشئ المرئي فارغًا ويستبدل الاستعلام المكتوب هنا. متابعة؟",
    qb_pickConnection: "اختر اتصالًا لعرض جداوله.",
    qb_loading: "جارٍ قراءة الجداول…",
    qb_noSchema: "تعذّرت قراءة جداول هذا الاتصال ({message}).",
    qb_tables: "الجداول",
    qb_findTable: "ابحث عن جدول",
    qb_addTable: "إضافة هذا الجدول",
    qb_noTables: "لا توجد جداول.",
    qb_start: "أضف جدولًا من القائمة، ثم حدد أعمدته.",
    qb_removeTable: "إزالة {name}",
    qb_joins: "الربط",
    qb_inner: "الصفوف المتطابقة فقط",
    qb_left: "كل صفوف الجدول الأول",
    qb_joinType: "نوع الربط",
    qb_suggested: "مقترح:",
    qb_addJoin: "إضافة ربط",
    qb_joinFrom: "عمود من جدول",
    qb_joinTo: "عمود من الجدول الآخر",
    qb_joinHint: "اسحب عمودًا إلى عمود في جدول آخر لربطهما، أو اختر كليهما هنا.",
    qb_filters: "عوامل التصفية",
    qb_column: "العمود",
    qb_value: "قيمة",
    qb_valueFrom: "المقارنة مع",
    qb_filterHint: "يُربط معامل التقرير (@name) عند تشغيل الاستعلام ولا يُلصق في SQL أبدًا.",
    qb_sortLimit: "الفرز والحد",
    qb_limit: "بحد أقصى (صفوف)",
    qb_preview: "معاينة الصفوف",
    qb_editSql: "التحرير كـ SQL",
    qb_rows: "{n} صفوف (تُعرض أول 20)",
    ux_a11yPageRole: "صفحة"
  }
};

// src/i18n/home.js
var home_default = {
  en: {
    hm_overview: "Overview",
    hm_overviewLede: "Monitor your report generation, performance and system health",
    hm_nav: "Main",
    hm_searchAll: "Search all reports",
    hm_searchPh: "Search reports…",
    hm_createReport: "Create report",
    hm_range: "Date range",
    hm_lastDays: "Last {n} days",
    hm_menu: "Account menu",
    hm_scopeAll: "Everyone's activity",
    hm_scopeMine: "Your activity",
    hm_kpiGenerated: "Reports generated",
    hm_kpiGeneratedHint: "Server renders and browser exports",
    hm_kpiPages: "PDF pages",
    hm_kpiPagesHint: "Pages of server-rendered PDFs",
    hm_kpiAvg: "Avg render time",
    hm_kpiAvgHint: "Since the server started · {n} renders",
    hm_kpiSched: "Scheduled jobs",
    hm_kpiSchedHint: "{on} active · {off} paused",
    hm_vsPrev: "vs previous {n} days",
    hm_newPeriod: "none in the previous {n} days",
    hm_noData: "No data yet",
    hm_chartGenerated: "Report generation",
    hm_chartPages: "Pages generated",
    hm_daily: "Daily",
    hm_weekly: "Weekly",
    hm_noneInPeriod: "Nothing was generated in this period.",
    hm_dist: "Render times by duration",
    hm_health: "System health",
    hm_engine: "Render engine",
    hm_queue: "Render queue",
    hm_storage: "Storage",
    hm_scheduler: "Scheduler",
    hm_worker: "Batch worker",
    hm_ok: "Healthy",
    hm_down: "Down",
    hm_warn: "Busy",
    hm_off: "Off",
    hm_workers: "{ready} of {size} workers ready",
    hm_inlineWorker: "Inline renders (no worker pool)",
    hm_waiting: "{n} waiting",
    hm_inlineState: "Inline",
    hm_viaCron: "Off — runs via {when} cron",
    hm_succeeded: "Successful",
    hm_failed: "Failed",
    hm_sinceStart: "Renders since the server started",
    hm_recent: "Recent reports",
    hm_viewAll: "View all",
    hm_more: "More actions",
    hm_colName: "Name",
    hm_colFormat: "Format",
    hm_colPages: "Pages",
    hm_colVia: "Source",
    hm_colAt: "Generated at",
    hm_completed: "Completed",
    hm_denied: "Denied",
    hm_viaApi: "API",
    hm_viaSchedule: "Schedule",
    hm_viaBatch: "Batch",
    hm_viaLink: "Server link",
    hm_viaExport: "Browser export",
    hm_inline: "Inline definition",
    hm_gone: "Deleted report",
    hm_noRecent: "No reports generated in this period.",
    hm_paused: "Paused",
    hm_nextAt: "Next {when}",
    hm_toggle: "Run on schedule: {name}",
    hm_storageUse: "{size} in {n} files",
    hm_storageHint: "Batch and schedule outputs",
    hm_truncated: "Counts stop at 10,000 events of each kind."
  },
  hi: {
    hm_overview: "अवलोकन",
    hm_overviewLede: "रिपोर्ट बनने, प्रदर्शन और सिस्टम की सेहत पर नज़र रखें",
    hm_nav: "मुख्य",
    hm_searchAll: "सभी रिपोर्ट खोजें",
    hm_searchPh: "रिपोर्ट खोजें…",
    hm_createReport: "रिपोर्ट बनाएँ",
    hm_range: "तारीख़ की अवधि",
    hm_lastDays: "पिछले {n} दिन",
    hm_menu: "खाता मेनू",
    hm_scopeAll: "सभी की गतिविधि",
    hm_scopeMine: "आपकी गतिविधि",
    hm_kpiGenerated: "बनी रिपोर्टें",
    hm_kpiGeneratedHint: "सर्वर रेंडर और ब्राउज़र एक्सपोर्ट",
    hm_kpiPages: "PDF पेज",
    hm_kpiPagesHint: "सर्वर पर बने PDF के पेज",
    hm_kpiAvg: "औसत रेंडर समय",
    hm_kpiAvgHint: "सर्वर शुरू होने से · {n} रेंडर",
    hm_kpiSched: "शेड्यूल किए काम",
    hm_kpiSchedHint: "{on} सक्रिय · {off} रुके",
    hm_vsPrev: "पिछले {n} दिनों की तुलना में",
    hm_newPeriod: "पिछले {n} दिनों में कोई नहीं",
    hm_noData: "अभी कोई डेटा नहीं",
    hm_chartGenerated: "रिपोर्ट बनना",
    hm_chartPages: "बने पेज",
    hm_daily: "रोज़",
    hm_weekly: "साप्ताहिक",
    hm_noneInPeriod: "इस अवधि में कुछ नहीं बना।",
    hm_dist: "अवधि के अनुसार रेंडर समय",
    hm_health: "सिस्टम की सेहत",
    hm_engine: "रेंडर इंजन",
    hm_queue: "रेंडर कतार",
    hm_storage: "स्टोरेज",
    hm_scheduler: "शेड्यूलर",
    hm_worker: "बैच वर्कर",
    hm_ok: "ठीक",
    hm_down: "बंद पड़ा",
    hm_warn: "व्यस्त",
    hm_off: "बंद",
    hm_workers: "{size} में से {ready} वर्कर तैयार",
    hm_inlineWorker: "इनलाइन रेंडर (कोई वर्कर पूल नहीं)",
    hm_waiting: "{n} प्रतीक्षा में",
    hm_inlineState: "इनलाइन",
    hm_viaCron: "बंद — {when} cron से चलता है",
    hm_succeeded: "सफल",
    hm_failed: "विफल",
    hm_sinceStart: "सर्वर शुरू होने से रेंडर",
    hm_recent: "हाल की रिपोर्टें",
    hm_viewAll: "सब देखें",
    hm_more: "और विकल्प",
    hm_colName: "नाम",
    hm_colFormat: "फ़ॉर्मेट",
    hm_colPages: "पेज",
    hm_colVia: "स्रोत",
    hm_colAt: "बनने का समय",
    hm_completed: "पूरा",
    hm_denied: "अस्वीकृत",
    hm_viaApi: "एपीआई",
    hm_viaSchedule: "शेड्यूल",
    hm_viaBatch: "बैच",
    hm_viaLink: "सर्वर लिंक",
    hm_viaExport: "ब्राउज़र एक्सपोर्ट",
    hm_inline: "इनलाइन परिभाषा",
    hm_gone: "हटाई गई रिपोर्ट",
    hm_noRecent: "इस अवधि में कोई रिपोर्ट नहीं बनी।",
    hm_paused: "रुका",
    hm_nextAt: "अगला {when}",
    hm_toggle: "शेड्यूल पर चलाएँ: {name}",
    hm_storageUse: "{n} फ़ाइलों में {size}",
    hm_storageHint: "बैच और शेड्यूल के आउटपुट",
    hm_truncated: "हर तरह की 10,000 घटनाओं पर गिनती रुकती है।"
  },
  es: {
    hm_overview: "Resumen",
    hm_overviewLede: "Supervise la generación de informes, el rendimiento y el estado del sistema",
    hm_nav: "Principal",
    hm_searchAll: "Buscar en todos los informes",
    hm_searchPh: "Buscar informes…",
    hm_createReport: "Crear informe",
    hm_range: "Periodo",
    hm_lastDays: "Últimos {n} días",
    hm_menu: "Menú de la cuenta",
    hm_scopeAll: "Actividad de todos",
    hm_scopeMine: "Su actividad",
    hm_kpiGenerated: "Informes generados",
    hm_kpiGeneratedHint: "Renderizados en el servidor y exportaciones del navegador",
    hm_kpiPages: "Páginas PDF",
    hm_kpiPagesHint: "Páginas de PDF renderizados en el servidor",
    hm_kpiAvg: "Tiempo medio de renderizado",
    hm_kpiAvgHint: "Desde que arrancó el servidor · {n} renderizados",
    hm_kpiSched: "Tareas programadas",
    hm_kpiSchedHint: "{on} activas · {off} en pausa",
    hm_vsPrev: "frente a los {n} días anteriores",
    hm_newPeriod: "ninguno en los {n} días anteriores",
    hm_noData: "Aún no hay datos",
    hm_chartGenerated: "Generación de informes",
    hm_chartPages: "Páginas generadas",
    hm_daily: "Diario",
    hm_weekly: "Semanal",
    hm_noneInPeriod: "No se generó nada en este periodo.",
    hm_dist: "Tiempos de renderizado por duración",
    hm_health: "Estado del sistema",
    hm_engine: "Motor de renderizado",
    hm_queue: "Cola de renderizado",
    hm_storage: "Almacenamiento",
    hm_scheduler: "Programador",
    hm_worker: "Proceso de lotes",
    hm_ok: "Correcto",
    hm_down: "Caído",
    hm_warn: "Ocupado",
    hm_off: "Apagado",
    hm_workers: "{ready} de {size} procesos listos",
    hm_inlineWorker: "Renderizado en línea (sin procesos)",
    hm_waiting: "{n} en espera",
    hm_inlineState: "En línea",
    hm_viaCron: "Apagado: se ejecuta con el cron {when}",
    hm_succeeded: "Correctos",
    hm_failed: "Fallidos",
    hm_sinceStart: "Renderizados desde que arrancó el servidor",
    hm_recent: "Informes recientes",
    hm_viewAll: "Ver todo",
    hm_more: "Más acciones",
    hm_colName: "Nombre",
    hm_colFormat: "Formato",
    hm_colPages: "Páginas",
    hm_colVia: "Origen",
    hm_colAt: "Generado el",
    hm_completed: "Completado",
    hm_denied: "Denegado",
    hm_viaApi: "API REST",
    hm_viaSchedule: "Programación",
    hm_viaBatch: "Lote",
    hm_viaLink: "Enlace del servidor",
    hm_viaExport: "Exportación del navegador",
    hm_inline: "Definición en línea",
    hm_gone: "Informe eliminado",
    hm_noRecent: "No se generaron informes en este periodo.",
    hm_paused: "En pausa",
    hm_nextAt: "Próxima {when}",
    hm_toggle: "Ejecutar según programación: {name}",
    hm_storageUse: "{size} en {n} archivos",
    hm_storageHint: "Salidas de lotes y programaciones",
    hm_truncated: "Los recuentos se detienen en 10.000 eventos de cada tipo."
  },
  fr: {
    hm_overview: "Vue d'ensemble",
    hm_overviewLede: "Suivez la génération des rapports, les performances et la santé du système",
    hm_nav: "Principal",
    hm_searchAll: "Rechercher dans tous les rapports",
    hm_searchPh: "Rechercher des rapports…",
    hm_createReport: "Créer un rapport",
    hm_range: "Période",
    hm_lastDays: "{n} derniers jours",
    hm_menu: "Menu du compte",
    hm_scopeAll: "Activité de tous",
    hm_scopeMine: "Votre activité",
    hm_kpiGenerated: "Rapports générés",
    hm_kpiGeneratedHint: "Rendus serveur et exports du navigateur",
    hm_kpiPages: "Pages PDF",
    hm_kpiPagesHint: "Pages des PDF rendus sur le serveur",
    hm_kpiAvg: "Temps de rendu moyen",
    hm_kpiAvgHint: "Depuis le démarrage du serveur · {n} rendus",
    hm_kpiSched: "Tâches planifiées",
    hm_kpiSchedHint: "{on} actives · {off} en pause",
    hm_vsPrev: "par rapport aux {n} jours précédents",
    hm_newPeriod: "aucun les {n} jours précédents",
    hm_noData: "Pas encore de données",
    hm_chartGenerated: "Génération de rapports",
    hm_chartPages: "Pages générées",
    hm_daily: "Par jour",
    hm_weekly: "Par semaine",
    hm_noneInPeriod: "Rien n'a été généré sur cette période.",
    hm_dist: "Temps de rendu par durée",
    hm_health: "Santé du système",
    hm_engine: "Moteur de rendu",
    hm_queue: "File d'attente de rendu",
    hm_storage: "Stockage",
    hm_scheduler: "Planificateur",
    hm_worker: "Traitement par lots",
    hm_ok: "Opérationnel",
    hm_down: "En panne",
    hm_warn: "Chargé",
    hm_off: "Désactivé",
    hm_workers: "{ready} processus prêts sur {size}",
    hm_inlineWorker: "Rendu en ligne (sans processus)",
    hm_waiting: "{n} en attente",
    hm_inlineState: "En ligne",
    hm_viaCron: "Désactivé — exécuté par le cron {when}",
    hm_succeeded: "Réussis",
    hm_failed: "Échoués",
    hm_sinceStart: "Rendus depuis le démarrage du serveur",
    hm_recent: "Rapports récents",
    hm_viewAll: "Tout voir",
    hm_more: "Plus d'actions",
    hm_colName: "Nom",
    hm_colFormat: "Format de sortie",
    hm_colPages: "Pages",
    hm_colVia: "Origine",
    hm_colAt: "Généré le",
    hm_completed: "Terminé",
    hm_denied: "Refusé",
    hm_viaApi: "API REST",
    hm_viaSchedule: "Planification",
    hm_viaBatch: "Lot",
    hm_viaLink: "Lien serveur",
    hm_viaExport: "Export du navigateur",
    hm_inline: "Définition en ligne",
    hm_gone: "Rapport supprimé",
    hm_noRecent: "Aucun rapport généré sur cette période.",
    hm_paused: "En pause",
    hm_nextAt: "Prochaine {when}",
    hm_toggle: "Exécuter selon la planification : {name}",
    hm_storageUse: "{size} dans {n} fichiers",
    hm_storageHint: "Sorties des lots et planifications",
    hm_truncated: "Les décomptes s'arrêtent à 10 000 événements de chaque type."
  },
  de: {
    hm_overview: "Übersicht",
    hm_overviewLede: "Berichtserstellung, Leistung und Systemzustand im Blick behalten",
    hm_nav: "Hauptmenü",
    hm_searchAll: "Alle Berichte durchsuchen",
    hm_searchPh: "Berichte suchen…",
    hm_createReport: "Bericht erstellen",
    hm_range: "Zeitraum",
    hm_lastDays: "Letzte {n} Tage",
    hm_menu: "Kontomenü",
    hm_scopeAll: "Aktivität aller",
    hm_scopeMine: "Ihre Aktivität",
    hm_kpiGenerated: "Erstellte Berichte",
    hm_kpiGeneratedHint: "Server-Renderings und Browser-Exporte",
    hm_kpiPages: "PDF-Seiten",
    hm_kpiPagesHint: "Seiten serverseitig erzeugter PDFs",
    hm_kpiAvg: "Mittlere Renderzeit",
    hm_kpiAvgHint: "Seit dem Serverstart · {n} Renderings",
    hm_kpiSched: "Geplante Aufträge",
    hm_kpiSchedHint: "{on} aktiv · {off} pausiert",
    hm_vsPrev: "ggü. den vorigen {n} Tagen",
    hm_newPeriod: "keine in den vorigen {n} Tagen",
    hm_noData: "Noch keine Daten",
    hm_chartGenerated: "Berichtserstellung",
    hm_chartPages: "Erzeugte Seiten",
    hm_daily: "Täglich",
    hm_weekly: "Wöchentlich",
    hm_noneInPeriod: "In diesem Zeitraum wurde nichts erstellt.",
    hm_dist: "Renderzeiten nach Dauer",
    hm_health: "Systemzustand",
    hm_engine: "Render-Engine",
    hm_queue: "Render-Warteschlange",
    hm_storage: "Speicher",
    hm_scheduler: "Zeitplaner",
    hm_worker: "Stapelverarbeitung",
    hm_ok: "Funktionsfähig",
    hm_down: "Ausgefallen",
    hm_warn: "Ausgelastet",
    hm_off: "Aus",
    hm_workers: "{ready} von {size} Workern bereit",
    hm_inlineWorker: "Inline-Rendering (kein Worker-Pool)",
    hm_waiting: "{n} wartend",
    hm_inlineState: "Inline",
    hm_viaCron: "Aus — läuft über den Cron ({when})",
    hm_succeeded: "Erfolgreich",
    hm_failed: "Fehlgeschlagen",
    hm_sinceStart: "Renderings seit dem Serverstart",
    hm_recent: "Letzte Berichte",
    hm_viewAll: "Alle anzeigen",
    hm_more: "Weitere Aktionen",
    hm_colName: "Bezeichnung",
    hm_colFormat: "Ausgabeformat",
    hm_colPages: "Seiten",
    hm_colVia: "Quelle",
    hm_colAt: "Erstellt am",
    hm_completed: "Abgeschlossen",
    hm_denied: "Abgelehnt",
    hm_viaApi: "REST-API",
    hm_viaSchedule: "Zeitplan",
    hm_viaBatch: "Stapel",
    hm_viaLink: "Server-Link",
    hm_viaExport: "Browser-Export",
    hm_inline: "Eingebettete Definition",
    hm_gone: "Gelöschter Bericht",
    hm_noRecent: "In diesem Zeitraum wurden keine Berichte erstellt.",
    hm_paused: "Pausiert",
    hm_nextAt: "Nächster Lauf {when}",
    hm_toggle: "Nach Zeitplan ausführen: {name}",
    hm_storageUse: "{size} in {n} Dateien",
    hm_storageHint: "Ausgaben von Stapeln und Zeitplänen",
    hm_truncated: "Die Zählung endet bei 10.000 Ereignissen je Art."
  },
  ja: {
    hm_overview: "概要",
    hm_overviewLede: "レポート生成、パフォーマンス、システムの状態を監視します",
    hm_nav: "メイン",
    hm_searchAll: "すべてのレポートを検索",
    hm_searchPh: "レポートを検索…",
    hm_createReport: "レポートを作成",
    hm_range: "期間",
    hm_lastDays: "過去 {n} 日間",
    hm_menu: "アカウントメニュー",
    hm_scopeAll: "全員のアクティビティ",
    hm_scopeMine: "あなたのアクティビティ",
    hm_kpiGenerated: "生成されたレポート",
    hm_kpiGeneratedHint: "サーバーでのレンダリングとブラウザーでのエクスポート",
    hm_kpiPages: "PDF ページ",
    hm_kpiPagesHint: "サーバーで生成した PDF のページ",
    hm_kpiAvg: "平均レンダリング時間",
    hm_kpiAvgHint: "サーバー起動以降 · {n} 回",
    hm_kpiSched: "スケジュール済みジョブ",
    hm_kpiSchedHint: "有効 {on} · 一時停止 {off}",
    hm_vsPrev: "前の {n} 日間との比較",
    hm_newPeriod: "前の {n} 日間はなし",
    hm_noData: "まだデータがありません",
    hm_chartGenerated: "レポート生成",
    hm_chartPages: "生成されたページ",
    hm_daily: "日別",
    hm_weekly: "週別",
    hm_noneInPeriod: "この期間に生成されたものはありません。",
    hm_dist: "所要時間別のレンダリング時間",
    hm_health: "システムの状態",
    hm_engine: "レンダリングエンジン",
    hm_queue: "レンダリングキュー",
    hm_storage: "ストレージ",
    hm_scheduler: "スケジューラー",
    hm_worker: "バッチワーカー",
    hm_ok: "正常",
    hm_down: "停止中",
    hm_warn: "混雑",
    hm_off: "オフ",
    hm_workers: "{size} 個中 {ready} 個のワーカーが準備完了",
    hm_inlineWorker: "インラインでレンダリング（ワーカープールなし）",
    hm_waiting: "{n} 件待機中",
    hm_inlineState: "インライン",
    hm_viaCron: "オフ — {when} の cron で実行",
    hm_succeeded: "成功",
    hm_failed: "失敗",
    hm_sinceStart: "サーバー起動以降のレンダリング",
    hm_recent: "最近のレポート",
    hm_viewAll: "すべて表示",
    hm_more: "その他の操作",
    hm_colName: "名前",
    hm_colFormat: "形式",
    hm_colPages: "ページ",
    hm_colVia: "ソース",
    hm_colAt: "生成日時",
    hm_completed: "完了",
    hm_denied: "拒否",
    hm_viaApi: "API 経由",
    hm_viaSchedule: "スケジュール",
    hm_viaBatch: "バッチ",
    hm_viaLink: "サーバーリンク",
    hm_viaExport: "ブラウザーでのエクスポート",
    hm_inline: "インライン定義",
    hm_gone: "削除されたレポート",
    hm_noRecent: "この期間に生成されたレポートはありません。",
    hm_paused: "一時停止",
    hm_nextAt: "次回 {when}",
    hm_toggle: "スケジュールで実行: {name}",
    hm_storageUse: "{n} 個のファイルで {size}",
    hm_storageHint: "バッチとスケジュールの出力",
    hm_truncated: "件数は種類ごとに 10,000 件までです。"
  },
  zh: {
    hm_overview: "概览",
    hm_overviewLede: "监控报表生成、性能和系统健康状况",
    hm_nav: "主菜单",
    hm_searchAll: "搜索所有报表",
    hm_searchPh: "搜索报表…",
    hm_createReport: "创建报表",
    hm_range: "日期范围",
    hm_lastDays: "最近 {n} 天",
    hm_menu: "账户菜单",
    hm_scopeAll: "所有人的活动",
    hm_scopeMine: "您的活动",
    hm_kpiGenerated: "已生成报表",
    hm_kpiGeneratedHint: "服务器渲染和浏览器导出",
    hm_kpiPages: "PDF 页数",
    hm_kpiPagesHint: "服务器渲染的 PDF 页数",
    hm_kpiAvg: "平均渲染时间",
    hm_kpiAvgHint: "自服务器启动以来 · {n} 次渲染",
    hm_kpiSched: "计划任务",
    hm_kpiSchedHint: "{on} 个启用 · {off} 个暂停",
    hm_vsPrev: "与前 {n} 天相比",
    hm_newPeriod: "前 {n} 天没有",
    hm_noData: "暂无数据",
    hm_chartGenerated: "报表生成",
    hm_chartPages: "已生成页数",
    hm_daily: "按天",
    hm_weekly: "按周",
    hm_noneInPeriod: "此期间没有生成任何内容。",
    hm_dist: "按时长分布的渲染时间",
    hm_health: "系统健康",
    hm_engine: "渲染引擎",
    hm_queue: "渲染队列",
    hm_storage: "存储",
    hm_scheduler: "调度器",
    hm_worker: "批处理进程",
    hm_ok: "正常",
    hm_down: "故障",
    hm_warn: "繁忙",
    hm_off: "关闭",
    hm_workers: "{size} 个中 {ready} 个进程就绪",
    hm_inlineWorker: "内联渲染（无进程池）",
    hm_waiting: "{n} 个等待中",
    hm_inlineState: "内联",
    hm_viaCron: "关闭 — 由 {when} cron 运行",
    hm_succeeded: "成功",
    hm_failed: "失败",
    hm_sinceStart: "自服务器启动以来的渲染",
    hm_recent: "最近的报表",
    hm_viewAll: "查看全部",
    hm_more: "更多操作",
    hm_colName: "名称",
    hm_colFormat: "格式",
    hm_colPages: "页数",
    hm_colVia: "来源",
    hm_colAt: "生成时间",
    hm_completed: "已完成",
    hm_denied: "已拒绝",
    hm_viaApi: "API 接口",
    hm_viaSchedule: "计划",
    hm_viaBatch: "批处理",
    hm_viaLink: "服务器链接",
    hm_viaExport: "浏览器导出",
    hm_inline: "内联定义",
    hm_gone: "已删除的报表",
    hm_noRecent: "此期间没有生成报表。",
    hm_paused: "已暂停",
    hm_nextAt: "下次 {when}",
    hm_toggle: "按计划运行：{name}",
    hm_storageUse: "{n} 个文件，共 {size}",
    hm_storageHint: "批处理和计划的输出",
    hm_truncated: "每种事件最多统计 10,000 个。"
  },
  "pt-BR": {
    hm_overview: "Visão geral",
    hm_overviewLede: "Acompanhe a geração de relatórios, o desempenho e a saúde do sistema",
    hm_nav: "Principal",
    hm_searchAll: "Pesquisar em todos os relatórios",
    hm_searchPh: "Pesquisar relatórios…",
    hm_createReport: "Criar relatório",
    hm_range: "Período",
    hm_lastDays: "Últimos {n} dias",
    hm_menu: "Menu da conta",
    hm_scopeAll: "Atividade de todos",
    hm_scopeMine: "Sua atividade",
    hm_kpiGenerated: "Relatórios gerados",
    hm_kpiGeneratedHint: "Renderizações no servidor e exportações do navegador",
    hm_kpiPages: "Páginas de PDF",
    hm_kpiPagesHint: "Páginas de PDFs renderizados no servidor",
    hm_kpiAvg: "Tempo médio de renderização",
    hm_kpiAvgHint: "Desde o início do servidor · {n} renderizações",
    hm_kpiSched: "Tarefas agendadas",
    hm_kpiSchedHint: "{on} ativas · {off} pausadas",
    hm_vsPrev: "em relação aos {n} dias anteriores",
    hm_newPeriod: "nenhum nos {n} dias anteriores",
    hm_noData: "Ainda sem dados",
    hm_chartGenerated: "Geração de relatórios",
    hm_chartPages: "Páginas geradas",
    hm_daily: "Diário",
    hm_weekly: "Semanal",
    hm_noneInPeriod: "Nada foi gerado neste período.",
    hm_dist: "Tempos de renderização por duração",
    hm_health: "Saúde do sistema",
    hm_engine: "Motor de renderização",
    hm_queue: "Fila de renderização",
    hm_storage: "Armazenamento",
    hm_scheduler: "Agendador",
    hm_worker: "Processador de lotes",
    hm_ok: "Saudável",
    hm_down: "Fora do ar",
    hm_warn: "Ocupado",
    hm_off: "Desligado",
    hm_workers: "{ready} de {size} processos prontos",
    hm_inlineWorker: "Renderização em linha (sem processos)",
    hm_waiting: "{n} aguardando",
    hm_inlineState: "Em linha",
    hm_viaCron: "Desligado — roda pelo cron {when}",
    hm_succeeded: "Bem-sucedidas",
    hm_failed: "Com falha",
    hm_sinceStart: "Renderizações desde o início do servidor",
    hm_recent: "Relatórios recentes",
    hm_viewAll: "Ver tudo",
    hm_more: "Mais ações",
    hm_colName: "Nome",
    hm_colFormat: "Formato",
    hm_colPages: "Páginas",
    hm_colVia: "Origem",
    hm_colAt: "Gerado em",
    hm_completed: "Concluído",
    hm_denied: "Negado",
    hm_viaApi: "API REST",
    hm_viaSchedule: "Agendamento",
    hm_viaBatch: "Lote",
    hm_viaLink: "Link do servidor",
    hm_viaExport: "Exportação do navegador",
    hm_inline: "Definição embutida",
    hm_gone: "Relatório excluído",
    hm_noRecent: "Nenhum relatório gerado neste período.",
    hm_paused: "Pausado",
    hm_nextAt: "Próxima {when}",
    hm_toggle: "Executar no agendamento: {name}",
    hm_storageUse: "{size} em {n} arquivos",
    hm_storageHint: "Saídas de lotes e agendamentos",
    hm_truncated: "As contagens param em 10.000 eventos de cada tipo."
  },
  ar: {
    hm_overview: "نظرة عامة",
    hm_overviewLede: "راقب إنشاء التقارير والأداء وسلامة النظام",
    hm_nav: "الرئيسية",
    hm_searchAll: "البحث في كل التقارير",
    hm_searchPh: "ابحث عن تقارير…",
    hm_createReport: "إنشاء تقرير",
    hm_range: "النطاق الزمني",
    hm_lastDays: "آخر {n} يومًا",
    hm_menu: "قائمة الحساب",
    hm_scopeAll: "نشاط الجميع",
    hm_scopeMine: "نشاطك",
    hm_kpiGenerated: "التقارير المُنشأة",
    hm_kpiGeneratedHint: "عمليات العرض على الخادم والتصدير من المتصفح",
    hm_kpiPages: "صفحات PDF",
    hm_kpiPagesHint: "صفحات ملفات PDF المعروضة على الخادم",
    hm_kpiAvg: "متوسط وقت العرض",
    hm_kpiAvgHint: "منذ بدء الخادم · {n} عملية عرض",
    hm_kpiSched: "المهام المجدولة",
    hm_kpiSchedHint: "{on} نشطة · {off} متوقفة",
    hm_vsPrev: "مقارنة بالأيام الـ{n} السابقة",
    hm_newPeriod: "لا شيء في الأيام الـ{n} السابقة",
    hm_noData: "لا توجد بيانات بعد",
    hm_chartGenerated: "إنشاء التقارير",
    hm_chartPages: "الصفحات المُنشأة",
    hm_daily: "يومي",
    hm_weekly: "أسبوعي",
    hm_noneInPeriod: "لم يُنشأ شيء في هذه الفترة.",
    hm_dist: "أوقات العرض حسب المدة",
    hm_health: "سلامة النظام",
    hm_engine: "محرك العرض",
    hm_queue: "طابور العرض",
    hm_storage: "التخزين",
    hm_scheduler: "المُجدول",
    hm_worker: "معالج الدفعات",
    hm_ok: "سليم",
    hm_down: "متوقف",
    hm_warn: "مشغول",
    hm_off: "مُطفأ",
    hm_workers: "{ready} من {size} عمليات جاهزة",
    hm_inlineWorker: "عرض مضمّن (بلا عمليات)",
    hm_waiting: "{n} في الانتظار",
    hm_inlineState: "مضمّن",
    hm_viaCron: "مُطفأ — يعمل عبر cron {when}",
    hm_succeeded: "ناجحة",
    hm_failed: "فاشلة",
    hm_sinceStart: "عمليات العرض منذ بدء الخادم",
    hm_recent: "أحدث التقارير",
    hm_viewAll: "عرض الكل",
    hm_more: "إجراءات أخرى",
    hm_colName: "الاسم",
    hm_colFormat: "الصيغة",
    hm_colPages: "الصفحات",
    hm_colVia: "المصدر",
    hm_colAt: "وقت الإنشاء",
    hm_completed: "مكتمل",
    hm_denied: "مرفوض",
    hm_viaApi: "واجهة API",
    hm_viaSchedule: "جدولة",
    hm_viaBatch: "دفعة",
    hm_viaLink: "رابط الخادم",
    hm_viaExport: "تصدير من المتصفح",
    hm_inline: "تعريف مضمّن",
    hm_gone: "تقرير محذوف",
    hm_noRecent: "لم يُنشأ أي تقرير في هذه الفترة.",
    hm_paused: "متوقف مؤقتًا",
    hm_nextAt: "التالي {when}",
    hm_toggle: "التشغيل حسب الجدول: {name}",
    hm_storageUse: "{size} في {n} ملفات",
    hm_storageHint: "مخرجات الدفعات والجداول",
    hm_truncated: "يتوقف العد عند 10,000 حدث من كل نوع."
  }
};

// src/i18n/r4.js
var r4_default = {
  en: {
    r4_queued: "Queued…",
    r4_iconReverse: "Reverse order (higher is worse)",
    r4_aiOff: "Ask AI is off: the server has no ANTHROPIC_API_KEY. An admin sets it to turn AI drafting on.",
    r4_busyRetry: "Server busy — retrying ({n}/{max})…",
    r4_retry: "Retry",
    r4_clipped: "something is cut off ({n}): see below",
    r4_noDataSource: "This report has no data source — add one in Data sources."
  },
  hi: {
    r4_queued: "कतार में…",
    r4_iconReverse: "उल्टा क्रम (अधिक मान बुरा है)",
    r4_aiOff: "Ask AI बंद है: सर्वर पर ANTHROPIC_API_KEY नहीं है। AI ड्राफ़्टिंग चालू करने के लिए कोई एडमिन इसे सेट करे।",
    r4_busyRetry: "सर्वर व्यस्त है — फिर से कोशिश ({n}/{max})…",
    r4_retry: "फिर से चलाएँ",
    r4_clipped: "कुछ सामग्री कट गई है ({n}): नीचे देखें",
    r4_noDataSource: "इस रिपोर्ट में कोई डेटा स्रोत नहीं है — Data sources में एक जोड़ें।"
  },
  es: {
    r4_queued: "En cola…",
    r4_iconReverse: "Orden inverso (más alto es peor)",
    r4_aiOff: "Ask AI está desactivado: el servidor no tiene ANTHROPIC_API_KEY. Un administrador debe configurarla para activar la IA.",
    r4_busyRetry: "Servidor ocupado: reintentando ({n}/{max})…",
    r4_retry: "Reintentar",
    r4_clipped: "hay contenido recortado ({n}): vea abajo",
    r4_noDataSource: "Este informe no tiene origen de datos: agregue uno en Data sources."
  },
  fr: {
    r4_queued: "En attente…",
    r4_iconReverse: "Ordre inversé (plus haut est pire)",
    r4_aiOff: "Ask AI est désactivé : le serveur n’a pas de ANTHROPIC_API_KEY. Un administrateur doit la définir pour activer l’IA.",
    r4_busyRetry: "Serveur occupé — nouvel essai ({n}/{max})…",
    r4_retry: "Réessayer",
    r4_clipped: "du contenu est coupé ({n}) : voir ci-dessous",
    r4_noDataSource: "Ce rapport n’a pas de source de données : ajoutez-en une dans Data sources."
  },
  de: {
    r4_queued: "In Warteschlange…",
    r4_iconReverse: "Umgekehrte Reihenfolge (höher ist schlechter)",
    r4_aiOff: "Ask AI ist aus: Der Server hat keinen ANTHROPIC_API_KEY. Ein Admin setzt ihn, um KI-Entwürfe einzuschalten.",
    r4_busyRetry: "Server ausgelastet – neuer Versuch ({n}/{max})…",
    r4_retry: "Erneut versuchen",
    r4_clipped: "Inhalt wird abgeschnitten ({n}): siehe unten",
    r4_noDataSource: "Dieser Bericht hat keine Datenquelle – fügen Sie eine unter Data sources hinzu."
  },
  ja: {
    r4_queued: "待機中…",
    r4_iconReverse: "逆順（高いほど悪い）",
    r4_aiOff: "Ask AI はオフです：サーバーに ANTHROPIC_API_KEY がありません。管理者が設定すると AI 下書きが使えます。",
    r4_busyRetry: "サーバーが混雑しています — 再試行中 ({n}/{max})…",
    r4_retry: "再試行",
    r4_clipped: "切り取られた内容があります ({n})：下記を参照",
    r4_noDataSource: "このレポートにはデータソースがありません。Data sources で追加してください。"
  },
  zh: {
    r4_queued: "排队中…",
    r4_iconReverse: "反向顺序（越高越差）",
    r4_aiOff: "Ask AI 已关闭：服务器没有 ANTHROPIC_API_KEY。管理员设置后即可开启 AI 草拟。",
    r4_busyRetry: "服务器繁忙 — 正在重试 ({n}/{max})…",
    r4_retry: "重试",
    r4_clipped: "有内容被截断 ({n})：见下文",
    r4_noDataSource: "此报表没有数据源 — 请在 Data sources 中添加一个。"
  },
  "pt-BR": {
    r4_queued: "Na fila…",
    r4_iconReverse: "Ordem inversa (mais alto é pior)",
    r4_aiOff: "Ask AI está desligado: o servidor não tem ANTHROPIC_API_KEY. Um administrador a define para ligar a IA.",
    r4_busyRetry: "Servidor ocupado — tentando de novo ({n}/{max})…",
    r4_retry: "Tentar de novo",
    r4_clipped: "há conteúdo cortado ({n}): veja abaixo",
    r4_noDataSource: "Este relatório não tem fonte de dados — adicione uma em Data sources."
  },
  ar: {
    r4_queued: "في الانتظار…",
    r4_iconReverse: "ترتيب معكوس (الأعلى أسوأ)",
    r4_aiOff: "Ask AI معطّل: لا يحتوي الخادم على ANTHROPIC_API_KEY. يضبطه المسؤول لتشغيل الصياغة بالذكاء الاصطناعي.",
    r4_busyRetry: "الخادم مشغول — إعادة المحاولة ({n}/{max})…",
    r4_retry: "إعادة المحاولة",
    r4_clipped: "تم قص بعض المحتوى ({n}): انظر أدناه",
    r4_noDataSource: "لا يحتوي هذا التقرير على مصدر بيانات — أضف مصدرًا في Data sources."
  }
};

// src/i18n/b2.js
var LANGS = ["en", "hi", "es", "fr", "de", "ja", "zh", "pt-BR", "ar"];
var ROWS = {
  b2_skipBlank: ["Skip when the parameter is blank", "पैरामीटर खाली हो तो छोड़ें", "Omitir si el parámetro está vacío", "Ignorer si le paramètre est vide", "Überspringen, wenn der Parameter leer ist", "パラメーターが空のときはスキップ", "参数为空时跳过", "Ignorar quando o parâmetro estiver vazio", "تخطَّ عندما تكون المعلمة فا\
رغة"],
  // viewer
  b2_pageOf: ["Page {n} of {total}", "पृष्ठ {n} / {total}", "Página {n} de {total}", "Page {n} sur {total}", "Seite {n} von {total}", "{total} ページ中 {n} ページ", "第 {n} 页，共 {total} 页", "Página {n} de {total}", "الصفحة {n} من {total}"],
  b2_pageN: ["Page {n}", "पृष्ठ {n}", "Página {n}", "Page {n}", "Seite {n}", "{n} ページ", "第 {n} 页", "Página {n}", "الصفحة {n}"],
  b2_pages: ["Pages", "पृष्ठ", "Páginas", "Pages", "Seiten", "ページ", "页面", "Páginas", "الصفحات"],
  b2_contents: ["Contents", "विषय-सूची", "Contenido", "Sommaire", "Inhalt", "目次", "目录", "Sumário", "المحتويات"],
  b2_sidebar: ["Pages and contents", "पृष्ठ और विषय-सूची", "Páginas y contenido", "Pages et sommaire", "Seiten und Inhalt", "ページと目次", "页面和目录", "Páginas e sumário", "الصفحات والمحتويات"],
  b2_export: ["Export", "निर्यात", "Exportar", "Exporter", "Exportieren", "エクスポート", "导出", "Exportar", "تصدير"],
  b2_fmt_pdf: ["PDF document", "PDF दस्तावेज़", "Documento PDF", "Document PDF", "PDF-Dokument", "PDF ドキュメント", "PDF 文档", "Documento PDF", "مستند PDF"],
  b2_fmt_xlsx: ["Excel workbook", "Excel वर्कबुक", "Libro de Excel", "Classeur Excel", "Excel-Arbeitsmappe", "Excel ブック", "Excel 工作簿", "Pasta de trabalho do Excel", "مصنف Excel"],
  b2_fmt_docx: ["Word document", "Word दस्तावेज़", "Documento de Word", "Document Word", "Word-Dokument", "Word 文書", "Word 文档", "Documento do Word", "مستند Word"],
  b2_fmt_pptx: ["PowerPoint slides", "PowerPoint स्लाइड", "Diapositivas de PowerPoint", "Diapositives PowerPoint", "PowerPoint-Folien", "PowerPoint スライド", "PowerPoint 幻灯片", "Slides do PowerPoint", "شرائح PowerPoint"],
  b2_fmt_html: ["Web page", "वेब पेज", "Página web", "Page web", "Webseite", "Web ページ", "网页", "Página da web", "صفحة ويب"],
  b2_fmt_csv: ["Table data (CSV)", "तालिका डेटा (CSV)", "Datos de tabla (CSV)", "Données du tableau (CSV)", "Tabellendaten (CSV)", "表データ (CSV)", "表格数据 (CSV)", "Dados da tabela (CSV)", "بيانات الجدول (CSV)"],
  b2_fmt_json: ["Rendered report (JSON)", "रेंडर की गई रिपोर्ट (JSON)", "Informe generado (JSON)", "Rapport rendu (JSON)", "Gerenderter Bericht (JSON)", "レンダリング済みレポート (JSON)", "渲染后的报表 (JSON)", "Relatório gerado (JSON)", "التقرير المعروض (JSON)"],
  // designer
  b2_file: ["File", "फ़ाइल", "Archivo", "Fichier", "Datei", "ファイル", "文件", "Arquivo", "ملف"],
  b2_insert: ["Insert", "डालें", "Insertar", "Insérer", "Einfügen", "挿入", "插入", "Inserir", "إدراج"],
  b2_arrange: ["Arrange", "व्यवस्थित करें", "Organizar", "Organiser", "Anordnen", "配置", "排列", "Organizar", "ترتيب"],
  b2_view: ["View", "दृश्य", "Vista", "Affichage", "Ansicht", "表示", "视图", "Exibir", "عرض"],
  b2_previewGroup: ["Preview", "पूर्वावलोकन", "Vista previa", "Aperçu", "Vorschau", "プレビュー", "预览", "Visualização", "معاينة"],
  b2_insertItem: ["Insert: {item}", "डालें: {item}", "Insertar: {item}", "Insérer : {item}", "Einfügen: {item}", "挿入: {item}", "插入：{item}", "Inserir: {item}", "إدراج: {item}"],
  b2_insertHint: ["Goes inside the selected list or container, else below the body", "चुनी गई सूची या कंटेनर के अंदर, वरना बॉडी के नीचे जाता है", "Va dentro de la lista o el contenedor seleccionado; si no, debajo del cuerpo", "Va dans la liste ou le conteneur sélectionné, sinon sous le corps", "Kommt in die a\
usgewählte Liste oder den Container, sonst unter den Hauptteil", "選択したリストやコンテナーの中に、なければ本文の下に入ります", "放入所选列表或容器中，否则放在正文下方", "Vai dentro da lista ou do contêiner selecionado; senão, abaixo do corpo", "يُدرج داخل القائمة أو الحاوية المحددة، وإلا أسفل المتن"],
  b2_toolbox: ["Toolbox", "टूलबॉक्स", "Herramientas", "Boîte à outils", "Werkzeuge", "ツールボックス", "工具箱", "Ferramentas", "الأدوات"],
  b2_data: ["Data", "डेटा", "Datos", "Données", "Daten", "データ", "数据", "Dados", "البيانات"],
  b2_outline: ["Outline", "रूपरेखा", "Esquema", "Structure", "Gliederung", "アウトライン", "大纲", "Estrutura", "المخطط"],
  b2_panels: ["Designer panels", "डिज़ाइनर पैनल", "Paneles del diseñador", "Panneaux du concepteur", "Designer-Bereiche", "デザイナーのパネル", "设计器面板", "Painéis do designer", "لوحات المصمم"],
  b2_leftPanel: ["Show or hide the side panel", "साइड पैनल दिखाएँ या छिपाएँ", "Mostrar u ocultar el panel lateral", "Afficher ou masquer le panneau latéral", "Seitenbereich ein- oder ausblenden", "サイドパネルの表示/非表示", "显示或隐藏侧面板", "Mostrar ou ocultar o painel lateral", "إظهار اللوحة الجانبية أو إخفاؤها"],
  b2_rightPanel: ["Show or hide the Inspector", "इंस्पेक्टर दिखाएँ या छिपाएँ", "Mostrar u ocultar el Inspector", "Afficher ou masquer l'inspecteur", "Inspektor ein- oder ausblenden", "インスペクターの表示/非表示", "显示或隐藏检查器", "Mostrar ou ocultar o Inspetor", "إظهار المراقب أو إخفاؤه"],
  b2_inspector: ["Inspector", "इंस्पेक्टर", "Inspector", "Inspecteur", "Inspektor", "インスペクター", "检查器", "Inspetor", "المراقب"],
  b2_status: ["Status", "स्थिति", "Estado", "État", "Zustand", "ステータス", "状态", "Situação", "الحالة"],
  b2_selReport: ["Report", "रिपोर्ट", "Informe", "Rapport", "Bericht", "レポート", "报表", "Relatório", "التقرير"],
  b2_selItems: ["{n} items selected", "{n} आइटम चुने गए", "{n} elementos seleccionados", "{n} éléments sélectionnés", "{n} Elemente ausgewählt", "{n} 個の項目を選択", "已选择 {n} 个项目", "{n} itens selecionados", "تم تحديد {n} عناصر"],
  b2_selBand: ["Band: {band}", "बैंड: {band}", "Banda: {band}", "Bande : {band}", "Bereich: {band}", "バンド: {band}", "区域：{band}", "Faixa: {band}", "النطاق: {band}"],
  b2_selCell: ["Cell in {name}", "{name} में सेल", "Celda de {name}", "Cellule de {name}", "Zelle in {name}", "{name} のセル", "{name} 中的单元格", "Célula em {name}", "خلية في {name}"],
  b2_pageInfo: ["Page {size} · {w} × {h} {unit}", "पृष्ठ {size} · {w} × {h} {unit}", "Página {size} · {w} × {h} {unit}", "Page {size} · {w} × {h} {unit}", "Seite {size} · {w} × {h} {unit}", "ページ {size} · {w} × {h} {unit}", "页面 {size} · {w} × {h} {unit}", "Página {size} · {w} × {h} {unit}", "الصفحة {size} · {w} × {h} {unit}"],
  // batch 9 (designer bugs)
  b9_nothingToPaste: ["Nothing to paste: copy items in a designer first (Ctrl+C)", "चिपकाने को कुछ नहीं: पहले डिज़ाइनर में आइटम कॉपी करें (Ctrl+C)", "Nada que pegar: copie primero elementos en un diseñador (Ctrl+C)", "Rien à coller : copiez d’abord des éléments dans un concepteur (Ctrl+C)", "Nichts zum Einf\
ügen: zuerst Elemente in einem Designer kopieren (Strg+C)", "貼り付けるものがありません。先にデザイナーで項目をコピーしてください (Ctrl+C)", "没有可粘贴的内容：请先在设计器中复制项目 (Ctrl+C)", "Nada para colar: copie primeiro itens em um designer (Ctrl+C)", "لا شيء للصق: انسخ عناصر في مصمم أولاً (Ctrl+C)"],
  b9_itemLabel: ["{type} {name}, x {x}, y {y}", "{type} {name}, x {x}, y {y}", "{type} {name}, x {x}, y {y}", "{type} {name}, x {x}, y {y}", "{type} {name}, x {x}, y {y}", "{type} {name}、x {x}、y {y}", "{type} {name}，x {x}，y {y}", "{type} {name}, x {x}, y {y}", "{type} {name}، x {x}، y {y}"],
  b9_outlineKeys: ["Up and Down move between rows; Enter or Space selects (Shift adds); then Delete removes and the arrows move the selection on the page", "ऊपर और नीचे पंक्तियों के बीच जाते हैं; Enter या Space चुनता है (Shift जोड़ता है); फिर Delete हटाता है और तीर पेज पर चयन को खिसकाते हैं",
  "Arriba y Abajo cambian de fila; Intro o Espacio selecciona (Mayús añade); luego Supr elimina y las flechas mueven la selección en la página", "Haut et Bas passent d’une ligne à l’autre ; Entrée ou Espace sélectionne (Maj ajoute) ; ensuite Suppr supprime et les flèches déplacent la sélection sur la page", "Auf und Ab wechseln die Zeile; Eingabe oder Leertaste wählt aus (Umschalt fü\
gt hinzu); dann löscht Entf und die Pfeile verschieben die Auswahl auf der Seite", "上下で行を移動、Enter または Space で選択 (Shift で追加)。その後 Delete で削除、矢印でページ上の選択を移動", "上下键在行间移动；Enter 或空格选择（Shift 添加）；然后 Delete 删除，方向键在页面上移动所选项", "Cima e Baixo mudam de linha; Enter \
ou Espaço seleciona (Shift adiciona); depois Delete remove e as setas movem a seleção na página", "السهمان لأعلى ولأسفل للتنقل بين الصفوف؛ Enter أو المسافة للتحديد (Shift للإضافة)؛ ثم Delete للحذف والأسهم لتحريك التحديد في الصفحة"],
  p_field_label: ["Label (the name a screen reader says)", "लेबल (स्क्रीन रीडर जो नाम बोलता है)", "Etiqueta (el nombre que dice un lector de pantalla)", "Libellé (le nom que lit un lecteur d’écran)", "Beschriftung (der Name, den ein Screenreader vorliest)", "ラベル (スクリーンリーダーが読み上げる名前)", "标签（屏幕阅读器读出的名称）",
  "Rótulo (o nome que um leitor de tela diz)", "التسمية (الاسم الذي يقرؤه قارئ الشاشة)"]
};
var b2_default = Object.fromEntries(LANGS.map((l, i) => [l, Object.fromEntries(Object.entries(ROWS).map(([k, v]) => [k, v[i]]))]));

// src/i18n/core.js
function lookups(STRINGS2, LANGUAGES2) {
  const RTL = /* @__PURE__ */ new Set(["ar"]);
  const table = (lang) => STRINGS2[pickLang2(lang)] || STRINGS2.en;
  function pickLang2(v) {
    const s = String(v || "").trim().toLowerCase();
    return LANGUAGES2.find((l) => l.toLowerCase() === s) || LANGUAGES2.find((l) => l === s.split("-")[0]) || "en";
  }
  const dirOf2 = (lang) => RTL.has(pickLang2(lang)) ? "rtl" : "ltr";
  function tParts2(lang, key) {
    return (table(lang)[key] ?? STRINGS2.en[key] ?? key).split(/\{(\w+)\}/);
  }
  function t2(lang, key, vars) {
    const s = table(lang)[key] ?? STRINGS2.en[key] ?? key;
    return vars ? s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? "")) : s;
  }
  return { pickLang: pickLang2, dirOf: dirOf2, tParts: tParts2, t: t2 };
}

// src/i18n/embed.js
var LOADERS = {
  hi: () => import("./chunk-RKGIVPK5.js"),
  es: () => import("./chunk-2NAW3MAP.js"),
  fr: () => import("./chunk-PXXMOP4N.js"),
  de: () => import("./chunk-FGEFSGJT.js"),
  ja: () => import("./chunk-J56FRCFU.js"),
  zh: () => import("./chunk-BXKUE45K.js"),
  "pt-BR": () => import("./chunk-NJWQT6VB.js"),
  ar: () => import("./chunk-E7INJHTL.js")
};
var merge = (k, v) => ({ ...v, ...gov_default[k], ...ux_default[k], ...home_default[k], ...r4_default[k], ...b2_default[k] });
var STRINGS = { en: merge("en", en_default) };
var LANGUAGES = ["en", ...Object.keys(LOADERS)];
var { pickLang, dirOf, tParts, t } = lookups(STRINGS, LANGUAGES);
async function loadLanguage(lang) {
  const l = pickLang(lang);
  if (!STRINGS[l] && LOADERS[l]) STRINGS[l] = merge(l, (await LOADERS[l]()).default);
  return l;
}

// src/viewer/ReportViewer.jsx
var import_react = __toESM(require_react(), 1);

// src/viewer/exports.js
async function loadedFonts(model) {
  const store = await loadFontStore();
  await store.load(fontKeysOf(model));
  return store;
}
var fetchImage = async (src) => {
  try {
    const r = await reportFetch(origin())(src);
    return r.ok ? new Uint8Array(await r.arrayBuffer()) : null;
  } catch {
    return null;
  }
};
async function exportBlob(fmt, model, def, opt = {}) {
  const o = { ...EXPORT_DEFAULTS, ...opt.options || {} };
  const lang = def.locale || opt.lang || "en";
  if (fmt === "json") return new Blob([JSON.stringify(model)], { type: "application/json" });
  if (fmt === "csv") return new Blob([(await import("./chunk-47ZAKRVN.js")).exportCsv(model, { locale: def.locale, currency: def.currency })], { type: "text/csv;charset=utf-8" });
  if (fmt === "html" && opt.interactive !== false && o.html === "interactive") {
    try {
      const { exportInteractiveHtml } = await import("./chunk-42XYU4MS.js");
      const { html } = await exportInteractiveHtml(def, { params: opt.params, reportId: opt.reportId, lang: opt.lang, model });
      return new Blob([html], { type: "text/html;charset=utf-8" });
    } catch (e) {
      if (e.code !== "NO_BUNDLE") throw e;
      console.warn(`${e.message} Exporting static HTML instead.`);
    }
  }
  if (fmt === "html") {
    const store = await loadedFonts(model);
    const { exportHtml } = await import("./chunk-PQSR34QQ.js");
    return new Blob([await exportHtml(model, { fonts: store, title: def.name, subset: subsetter, drillBase: origin(), static: o.html === "static", locale: def.locale, currency: def.currency, lang: opt.lang, strings: opt.strings })], { type: "text/html;charset=utf-8" });
  }
  if (fmt === "docx") {
    const { exportDocx } = await import("./chunk-G6SX2C3O.js");
    return new Blob([await exportDocx(model, { title: def.name, lang, fontStore: await loadedFonts(model), fetchImage })], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  }
  if (fmt === "pptx") {
    const { exportPptx } = await import("./chunk-4EU2FJ3V.js");
    return new Blob([await exportPptx(model, { title: def.name, lang, fontStore: await loadedFonts(model), fetchImage })], { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" });
  }
  if (fmt === "xlsx") {
    const { exportXlsx } = await import("./chunk-3XL5BO5P.js");
    const bytes = await exportXlsx(model, { currency: def.currency, title: def.name, formulas: o.formulas, fontStore: await loadedFonts(model), fetchImage });
    return new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  }
  throw new Error(`Unknown format "${fmt}"`);
}

// src/viewer/timeZone.js
function viewerTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || void 0;
  } catch {
    return void 0;
  }
}

// src/viewer/ParamInput.jsx
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var num = (v) => v === "" || v == null || Number.isNaN(Number(v)) ? void 0 : Number(v);
function ParamInput(props) {
  const { p, value, options, onChange, T } = props;
  const control = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Control, { ...props, value: value ?? "" });
  if (p.nullable && !p.multi) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pnull", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("fieldset", { disabled: value === null, style: { border: 0, padding: 0, margin: 0, minWidth: 0 }, children: control }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: value === null, onChange: (e) => onChange(e.target.checked ? null : "") }),
        T("nullValue")
      ] })
    ] });
  }
  if (p.multi && options?.length && p.editor !== "range" && p.editor !== "dateRange" && p.selectAll !== false) {
    const all = options.map((o) => String(o.value));
    const cur = new Set(String(value ?? "").split(",").filter(Boolean));
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pmulti", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: all.every((v) => cur.has(v)), onChange: (e) => onChange(e.target.checked ? all.join(",") : "") }),
        T("selectAll")
      ] }),
      control
    ] });
  }
  return control;
}
function Control({ p, value: val, options: opts, onChange: set, invalid, T, name }) {
  const label = `${p.prompt || p.name}${p.required ? " *" : ""}`;
  const min = num(p.min), max = num(p.max), step = num(p.step);
  switch (p.editor) {
    case "slider": {
      const lo = min ?? 0, hi = max ?? 100;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pslider", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "range", "aria-label": label, min: lo, max: hi, step: step ?? 1, value: val === "" ? lo : val, onChange: (e) => set(e.target.value) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("output", { children: val === "" ? "—" : val })
      ] });
    }
    case "range":
    case "dateRange": {
      const [a = "", b = ""] = String(val).split(",");
      const date = p.editor === "dateRange";
      const limits = date ? { min: p.min, max: p.max } : { min, max, step };
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "prange", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "input", type: date ? "date" : "number", "aria-label": `${label} ${T("from")}`, value: a, ...limits, onChange: (e) => set(rangeValue(e.target.value, b, p)) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "aria-hidden": "true", children: "–" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "input", type: date ? "date" : "number", "aria-label": `${label} ${T("to")}`, value: b, ...limits, onChange: (e) => set(rangeValue(a, e.target.value, p)) })
      ] });
    }
    case "toggle":
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check pswitch", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", role: "switch", "aria-label": label, checked: String(val) === "true", onChange: (e) => set(e.target.checked ? "true" : "false") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: String(val) === "true" ? T("true") : T("false") })
      ] });
    case "radio":
      if (!opts) break;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pradio", role: "radiogroup", "aria-label": label, children: opts.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "radio", name, checked: String(o.value) === String(val), onChange: () => set(String(o.value)) }),
        o.label
      ] }, String(o.value))) });
    case "list":
      if (!opts) break;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "select",
        {
          className: "select plist",
          "aria-label": label,
          size: Math.min(6, Math.max(2, opts.length)),
          multiple: !!p.multi,
          value: p.multi ? String(val).split(",").filter(Boolean) : String(val),
          onChange: (e) => set(p.multi ? [...e.target.selectedOptions].map((o) => o.value).join(",") : e.target.value),
          children: opts.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: String(o.value), children: o.label }, String(o.value)))
        }
      );
    default:
  }
  if (opts && p.multi) {
    const cur = new Set(String(val).split(",").filter(Boolean));
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "grid", gap: 2, maxHeight: 160, overflow: "auto" }, children: opts.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: cur.has(String(o.value)), onChange: (e) => {
        const n = new Set(cur);
        e.target.checked ? n.add(String(o.value)) : n.delete(String(o.value));
        set([...n].join(","));
      } }),
      o.label
    ] }, String(o.value))) });
  }
  if (opts) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { className: "select", "aria-label": p.prompt || p.name, value: val, onChange: (e) => set(e.target.value), children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "", children: "—" }),
    opts.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: String(o.value), children: o.label }, String(o.value)))
  ] });
  if (p.type === "boolean") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { className: "select", "aria-label": p.prompt || p.name, value: val, onChange: (e) => set(e.target.value), children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "", children: "—" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "true", children: T("true") }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "false", children: T("false") })
  ] });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "input",
    {
      className: `input${invalid ? " invalid" : ""}`,
      "aria-label": label,
      type: p.type === "number" && !p.multi ? "number" : p.type === "date" && !p.multi ? "date" : "text",
      placeholder: p.multi ? T("commaSeparated") : void 0,
      value: val,
      onChange: (e) => set(e.target.value)
    }
  );
}

// src/viewer/icons.jsx
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
var P = {
  first: "M4 3.5v9M12 3.5L7 8l5 4.5",
  prev: "M10 3.5L5.5 8l4.5 4.5",
  next: "M6 3.5L10.5 8 6 12.5",
  last: "M12 3.5v9M4 3.5L9 8l-5 4.5",
  zoomIn: "M7 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM14 14l-3.5-3.5M5 7h4M7 5v4",
  zoomOut: "M7 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM14 14l-3.5-3.5M5 7h4",
  fitPage: "M4 1.5h8v13H4zM6.5 5.5L8 4l1.5 1.5M6.5 10.5L8 12l1.5-1.5",
  fitWidth: "M1.5 4h13v8h-13zM5 6.5L3.5 8 5 9.5M11 6.5L12.5 8 11 9.5",
  full: "M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4",
  search: "M7 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM14 14l-3.5-3.5",
  print: "M4.5 6V1.5h7V6M4.5 11.5h-2.5v-5.5h12v5.5h-2.5M4.5 9.5h7v5h-7z",
  download: "M8 2v8.5M4.5 7L8 10.5 11.5 7M2.5 13.5h11",
  gear: "M8 10.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4zM8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4",
  sidebar: "M2 2.5h12v11H2zM6 2.5v11",
  pages: "M3 1.5h7l3 3v10H3zM10 1.5v3h3M5.5 8h5M5.5 10.5h5",
  toc: "M2.5 4h1M6 4h7.5M2.5 8h1M6 8h7.5M2.5 12h1M6 12h7.5",
  filter: "M2 3h12l-4.5 5.5v4.5l-3 1.5V8.5z",
  run: "M4.5 2.5v11l9-5.5z",
  chevron: "M4 6l4 4 4-4",
  more: "M3.5 8h.01M8 8h.01M12.5 8h.01",
  close: "M4 4l8 8M12 4l-8 8",
  up: "M4 10l4-4 4 4",
  down: "M4 6l4 4 4-4",
  list: "M2.5 4h11M2.5 8h11M2.5 12h11",
  save: "M2.5 2.5h9l2 2v9h-11zM5 2.5v3.5h5.5V2.5M4.5 13.5V9h7v4.5",
  history: "M2.5 8a5.5 5.5 0 1 0 1.6-3.9M2 2.5v2.5h2.5M8 5v3l2 1.5",
  viewer: "M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8zM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  pencil: "M10.5 2.5l3 3-8 8h-3v-3zM9 4l3 3",
  undo: "M4.5 3L1.8 5.7l2.7 2.7M2.2 5.7h6.3a3.3 3.3 0 0 1 0 6.6H6",
  redo: "M11.5 3l2.7 2.7-2.7 2.7M13.8 5.7H7.5a3.3 3.3 0 0 0 0 6.6H10",
  duplicate: "M5.5 5.5h8v8h-8zM10.5 5.5v-3h-8v8h3",
  trash: "M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4M6.8 6.5v4.5M9.2 6.5v4.5",
  text: "M3 3.5h10M8 3.5v9",
  table: "M2 3h12v10H2zM2 6.5h12M2 9.8h12M6 3v10",
  chart: "M2.5 13.5h11M4 13V8.5M7 13V4M10 13V7M13 13v-3",
  image: "M2 3h12v10H2zM2.5 12l3.5-4 3 3 1.5-1.5 3 2.5M10.5 6.5h.01",
  keys: "M1.5 4h13v8h-13zM4 7h.01M6.5 7h.01M9 7h.01M11.5 7h.01M5 9.5h6",
  ai: "M8 1.5l1.4 3.6L13 6.5 9.4 7.9 8 11.5 6.6 7.9 3 6.5l3.6-1.4zM12.5 11l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z",
  panelLeft: "M2 2.5h12v11H2zM6 2.5v11M3.5 5h1M3.5 7h1",
  panelRight: "M2 2.5h12v11H2zM10 2.5v11M11.5 5h1M11.5 7h1",
  tools: "M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z",
  data: "M8 5.5c3 0 5.5-.9 5.5-2S11 1.5 8 1.5 2.5 2.4 2.5 3.5 5 5.5 8 5.5zM2.5 3.5v9c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2v-9M2.5 8c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2",
  outline: "M2.5 3h4M5 6h4M5 9h4M2.5 12h4M3.5 3v9M3.5 6H5M3.5 9H5",
  open: "M2 4.5V13h11.5V6.5H7.5L6 4.5zM2 4.5V3h4l1.5 1.5",
  layers: "M8 2l6 3-6 3-6-3zM2 8l6 3 6-3M2 11l6 3 6-3"
};
var Icon = ({ name, size = 16 }) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("svg", { "aria-hidden": "true", focusable: "false", width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", className: "ico", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: P[name] }) });

// src/viewer/ReportViewer.jsx
var import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
var PX = 96 / 72;
var GAP = 18;
var COMPACT = 640;
function initialParams(def, given) {
  const out = {};
  for (const p of def.parameters || []) {
    let v = given?.[p.name] ?? (typeof p.default === "string" && p.default.startsWith("=") ? "" : p.default) ?? "";
    if (Array.isArray(v)) v = v.join(",");
    out[p.name] = v === null ? "" : String(v);
  }
  return out;
}
var WINDOW = 3;
var A11yLayer = ({ page, scale, T }) => {
  const links = (0, import_react.useMemo)(() => pageLinks(page), [page]);
  const lines = (0, import_react.useMemo)(() => readingText(page), [page]);
  const seen = /* @__PURE__ */ new Map();
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "sr-only", children: lines.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { children: l }, i)) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "vlinks", children: links.map((l, i) => {
      const a = l.action;
      const txt = l.text || l.tip;
      let key = a.type === "toggle" ? `t:${a.key}` : a.type === "sort" ? `s:${a.table}:${a.by}` : `${a.type}:${txt}`;
      const n = (seen.get(key) || 0) + 1;
      seen.set(key, n);
      if (n > 1) key += `#${n}`;
      const style = { left: l.x * scale, top: l.y * scale, width: l.w * scale, height: l.h * scale };
      const common = { className: `vlink pw-link${l.path ? "" : " hit"}`, style, "data-action": JSON.stringify(a), title: l.tip || linkTitle(a) || void 0 };
      if (a.type === "url") return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("a", { ...common, href: a.href, target: "_blank", rel: "noopener noreferrer", children: txt || a.href }, key);
      if (a.type === "drill") {
        const qs = new URLSearchParams(Object.entries(a.params || {}).map(([k, v]) => [k, v == null ? "" : String(v)]));
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("a", { ...common, href: `${origin()}/viewer/${encodeURIComponent(a.report)}?${qs}`, children: T("ux_a11yOpenReport", { text: txt || a.report, report: a.report }) }, key);
      }
      const label = a.type === "toggle" ? txt || T("ux_a11yDetails") : a.type === "sort" ? T(a.dir === "desc" ? "ux_a11ySortDesc" : "ux_a11ySortAsc", { text: txt }) : a.type === "params" ? T("ux_a11yFilterBy", { text: txt }) : a.type === "bookmark" ? T("ux_a11yGoTo", { text: txt || a.target }) : txt;
      return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", ...common, "aria-expanded": a.type === "toggle" ? !!a.open : void 0, children: label }, key);
    }) })
  ] });
};
var SvgHtml = ({ html, as: Tag = "div", ...rest }) => {
  const ref = (0, import_react.useRef)(null);
  const markup = (0, import_react.useMemo)(() => deferStyleAttributes(html), [html]);
  (0, import_react.useLayoutEffect)(() => {
    if (ref.current) applyStyleAttributes(ref.current);
  }, [markup]);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Tag, { ref, ...rest, dangerouslySetInnerHTML: { __html: markup } });
};
var Page = ({ page, w, h, scale, index, total, hits, near, T }) => {
  const html = (0, import_react.useMemo)(() => near ? pageToSvg(page, w, h, { animate: true }) : "", [page, w, h, near]);
  return (
    // a page is a document of its own for screen readers ("Page 3 of 12"), with its text and links in reading order below
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "vpage", "data-page": index + 1, style: { width: w * scale, height: h * scale }, ...near ? { role: "document", "aria-roledescription": T("ux_a11yPageRole"), "aria-label": T("b2_pageOf", { n: index + 1, total }) } : {}, children: [
      near && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(SvgHtml, { html, style: { width: "100%", height: "100%" }, "aria-hidden": "true" }),
      near && hits?.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: `hl${r.cur ? " cur" : ""}`, style: { left: r.x * scale, top: r.y * scale, width: r.w * scale, height: r.h * scale } }, i)),
      near && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(A11yLayer, { page, scale, T })
    ] })
  );
};
var Frozen = ({ page, region, w, h, scale }) => {
  const html = (0, import_react.useMemo)(() => pageToSvg({ items: page.items.filter((i) => i.t !== "link") }, w, h).replace(/viewBox="[^"]*" width="[^"]*" height="[^"]*"/, `viewBox="${region.x} ${region.y} ${region.w} ${region.h}" width="${region.w}" height="${region.h}"`), [page, region, w, h]);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(SvgHtml, { html, className: "vfrozen-head", "data-testid": "frozen-header", "aria-hidden": "true", style: { left: region.x * scale, width: region.w * scale, height: region.h * scale } });
};
var Thumb = ({ page, w, h, n, current, near, onGo, T }) => {
  const html = (0, import_react.useMemo)(() => near ? pageToSvg({ items: page.items.filter((i) => i.t !== "link") }, w, h) : "", [page, w, h, near]);
  const ref = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    if (current) ref.current?.scrollIntoView?.({ block: "nearest" });
  }, [current]);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { ref, type: "button", className: "vthumb", "aria-current": current ? "page" : void 0, onClick: () => onGo(n), children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "vthumb-sheet", style: { aspectRatio: `${w} / ${h}` }, children: near && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(SvgHtml, { as: "span", html, "aria-hidden": "true" }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "sr-only", children: T("b2_pageN", { n }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "vthumb-n", "aria-hidden": "true", children: n })
  ] });
};
var Skeleton = ({ def, scale, T }) => {
  const sz = { A4: [595, 842], Letter: [612, 792], Legal: [612, 1008], A3: [842, 1191], A5: [420, 595] }[def?.page?.size] || [595, 842];
  const [w, h] = def?.page?.orientation === "landscape" ? [sz[1], sz[0]] : sz;
  const k = Math.max(0.3, Math.min(scale, 1.4));
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "vskel-wrap", role: "status", "data-testid": "viewer-loading", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "sr-only", children: T("runningReport") }),
    [0, 1].map((i) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "vskel", "aria-hidden": "true", style: { width: w * k, height: h * k }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("i", { style: { width: "42%", height: 18 } }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("i", { style: { width: "64%" } }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("i", { style: { width: "30%", marginBottom: 22 } }),
      Array.from({ length: 9 }, (_, j) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("i", { style: { width: `${88 - j * 17 % 30}%` } }, j)),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("i", { className: "blk" })
    ] }, i))
  ] });
};
var MODES = ["single", "continuous", "galley"];
var DRILL_KEY = "_drill";
var drillOfUrl = () => {
  try {
    const v = new URL(window.location.href).searchParams.get(DRILL_KEY);
    const a = v ? JSON.parse(v) : [];
    return Array.isArray(a) ? a.filter((x) => x && typeof x.id === "string").slice(0, 50) : [];
  } catch {
    return [];
  }
};
var urlWithDrill = (list) => {
  const u = new URL(window.location.href);
  if (list.length) u.searchParams.set(DRILL_KEY, JSON.stringify(list));
  else u.searchParams.delete(DRILL_KEY);
  return u.toString();
};
function ReportViewer({ definition: rootDef, reportId: rootReportId, params: rootParams, title, compact = false, autoRun = true, lang: langIn = "en", onDrill, exportHtmlOptions, toolbar, viewMode = "continuous", onExported, urlState = false, onReady, control, onEvent }) {
  const lang = pickLang(langIn);
  const dir = dirOf(lang);
  const T = (k, v) => t(lang, k, v);
  const uid = (0, import_react.useId)();
  const [levels, setLevels] = (0, import_react.useState)(() => [{ def: rootDef, params: rootParams, id: rootReportId }]);
  (0, import_react.useEffect)(() => {
    setLevels([{ def: rootDef, params: rootParams, id: rootReportId }]);
  }, [rootDef]);
  const level = levels[levels.length - 1];
  const definition = level.def;
  const given = level.params;
  const reportId = level.id;
  const [params, setParams] = (0, import_react.useState)(() => initialParams(definition, given));
  const [state, setState] = (0, import_react.useState)({ toggles: {}, sort: {} });
  const [model, setModel] = (0, import_react.useState)(null);
  const [status, setStatus] = (0, import_react.useState)({ state: "idle" });
  const readied = (0, import_react.useRef)(false);
  const ready = (error) => {
    if (!readied.current) {
      readied.current = true;
      onReady?.(error);
    }
  };
  const [note, setNote] = (0, import_react.useState)(null);
  const [zoom, setZoom] = (0, import_react.useState)(() => rootDef?.page?.size === "Pageless" ? "fit" : "page");
  const [current, setCurrent] = (0, import_react.useState)(1);
  const hasParams = (definition.parameters || []).some((p) => !p.hidden);
  const [panel, setPanel] = (0, import_react.useState)((definition.parameters || []).some((p) => !p.hidden && p.required && !p.default && !p.nullable) ? "params" : null);
  const [exporting, setExporting] = (0, import_react.useState)(null);
  const [queued, setQueued] = (0, import_react.useState)([]);
  const exportQueue = (0, import_react.useRef)([]);
  const [options, setOptions] = (0, import_react.useState)({});
  const [query, setQuery] = (0, import_react.useState)("");
  const [matchCase, setMatchCase] = (0, import_react.useState)(false);
  const [wholeWord, setWholeWord] = (0, import_react.useState)(false);
  const [hitIdx, setHitIdx] = (0, import_react.useState)(0);
  const [mode, setMode] = (0, import_react.useState)(MODES.includes(viewMode) ? viewMode : "continuous");
  const [fullScreen, setFullScreen] = (0, import_react.useState)(false);
  const [canFullScreen, setCanFullScreen] = (0, import_react.useState)(false);
  const [narrow, setNarrow] = (0, import_react.useState)(false);
  const [menu, setMenu] = (0, import_react.useState)(false);
  const [xopt, setXopt] = (0, import_react.useState)(() => {
    try {
      return exportOptionsFrom(JSON.parse(localStorage.getItem("pw-export-options") || "{}"));
    } catch {
      return { ...EXPORT_DEFAULTS };
    }
  });
  const [xmenu, setXmenu] = (0, import_react.useState)(false);
  const [emenu, setEmenu] = (0, import_react.useState)(false);
  const setX = (k, v) => setXopt((o) => {
    const n = { ...o, [k]: v };
    try {
      localStorage.setItem("pw-export-options", JSON.stringify({ ...n, v: 2 }));
    } catch {
    }
    return n;
  });
  const [frozen, setFrozen] = (0, import_react.useState)(null);
  const root = (0, import_react.useRef)(null);
  const scroller = (0, import_react.useRef)(null);
  const [fitW, setFitW] = (0, import_react.useState)(800);
  const [fitH, setFitH] = (0, import_react.useState)(700);
  const runId = (0, import_react.useRef)(0);
  const pendingY = (0, import_react.useRef)(null);
  const single = mode === "single";
  const galley = mode === "galley";
  const renderDef = (0, import_react.useMemo)(() => galley ? galleyDefinition(definition) : definition, [definition, galley]);
  const lastRun = (0, import_react.useRef)("");
  const run = (0, import_react.useCallback)(async (p = params, st = state, keepScroll = false) => {
    const id = ++runId.current;
    lastRun.current = JSON.stringify(p);
    setStatus({ state: "running" });
    const top = scroller.current?.scrollTop || 0;
    try {
      const onPartial = keepScroll ? void 0 : (pm) => {
        if (id === runId.current) {
          loadModelFonts(pm).then(() => {
            if (id === runId.current) {
              setModel(pm);
              setCurrent(1);
            }
          });
        }
      };
      const onRetry = (r) => {
        if (id === runId.current) setStatus({ state: "running", retry: r });
      };
      const [m, defaultFailed] = await Promise.all([renderReport(renderDef, p, { ...st, target: "screen" }, reportId, { onPartial, onRetry }), loadReportFonts([CORE_FONT_KEY])]);
      const failed = [...defaultFailed, ...await loadModelFonts(m)];
      if (id !== runId.current) return;
      setModel(m);
      const fonts = failed.length ? T("fontsDidNotLoad", { fonts: [...new Set(failed.map((f) => f.key))].join(", ") }) : null;
      setStatus({ state: "done", fonts });
      ready(failed[0]?.error || null);
      onEvent?.("ready", { pages: m.pages.length });
      if (keepScroll) requestAnimationFrame(() => scroller.current?.scrollTo({ top }));
      else {
        setCurrent(1);
        setFrozen(null);
        scroller.current?.scrollTo({ top: 0 });
      }
    } catch (e) {
      if (id !== runId.current) return;
      setModel(null);
      setStatus({ state: "error", message: e.message, missing: e.missingParameters });
      if (e.missingParameters) setPanel("params");
      ready(e);
      onEvent?.("error", { message: e.message });
    }
  }, [renderDef, params, state, reportId]);
  (0, import_react.useEffect)(() => {
    const p0 = level.saved || initialParams(definition, given);
    const st0 = level.state || { toggles: {}, sort: {} };
    setParams(p0);
    setState(st0);
    setModel(null);
    if (autoRun) run(p0, st0);
  }, [definition, levels.length]);
  const wasGalley = (0, import_react.useRef)(galley);
  (0, import_react.useEffect)(() => {
    if (wasGalley.current === galley) return;
    wasGalley.current = galley;
    if (model || status.state === "error") run(params, state);
  }, [galley]);
  const live = definition.liveParameters !== false;
  (0, import_react.useEffect)(() => {
    if (!live || !model) return;
    const key = JSON.stringify(params);
    if (key === lastRun.current) return;
    const t2 = setTimeout(() => {
      const st = { toggles: {}, sort: state.sort };
      setState(st);
      run(params, st, true);
    }, 450);
    return () => clearTimeout(t2);
  }, [params, live]);
  const drillTo = async (report, p, newTab) => {
    const qs = new URLSearchParams(Object.entries(p || {}).map(([k, v]) => [k, v == null ? "" : String(v)]));
    if (newTab) {
      window.open(`${origin()}/viewer/${encodeURIComponent(report)}?${qs}`, "_blank", "noopener");
      return;
    }
    setStatus({ state: "running" });
    try {
      const def = await fetchReport(report);
      const strParams = Object.fromEntries(Object.entries(p || {}).map(([k, v]) => [k, v == null ? "" : String(v)]));
      setLevels((ls) => [...ls.slice(0, -1), { ...ls[ls.length - 1], saved: params, state }, { def, params: strParams, id: report }]);
      if (urlState) pushed.current++;
      if (urlState) window.history.pushState({ pwDrill: levels.length }, "", urlWithDrill([...levels.slice(1).map((l) => ({ id: l.id, params: l.params || {} })), { id: report, params: strParams }]));
    } catch (e) {
      setStatus({ state: "error", message: e.message });
    }
  };
  const back = (to = levels.length - 2) => {
    if (to < 0) return;
    const steps = levels.length - 1 - to;
    if (urlState && pushed.current >= steps) {
      pushed.current -= steps;
      window.history.go(-steps);
      return;
    }
    if (urlState) window.history.replaceState(window.history.state, "", urlWithDrill(levels.slice(1, to + 1).map((l) => ({ id: l.id, params: l.params || {} }))));
    setLevels((ls) => ls.slice(0, to + 1));
  };
  const pushed = (0, import_react.useRef)(0);
  const levelsRef = (0, import_react.useRef)(levels);
  levelsRef.current = levels;
  (0, import_react.useEffect)(() => {
    if (!urlState) return void 0;
    let alive = true;
    const restore = async () => {
      const want = drillOfUrl();
      pushed.current = Math.min(pushed.current, want.length);
      const cur = levelsRef.current;
      const same = (lv, w) => lv && lv.id === w.id && JSON.stringify(lv.params || {}) === JSON.stringify(w.params || {});
      const next = [cur[0]];
      for (let i = 0; i < want.length; i++) {
        if (same(cur[i + 1], want[i]) && next.length === i + 1) {
          next.push(cur[i + 1]);
          continue;
        }
        try {
          next.push({ def: await fetchReport(want[i].id), params: want[i].params || {}, id: want[i].id });
        } catch {
          break;
        }
      }
      if (alive && (next.length !== cur.length || next.some((x, i) => x !== cur[i]))) setLevels(next);
    };
    if (drillOfUrl().length) restore();
    window.addEventListener("popstate", restore);
    return () => {
      alive = false;
      window.removeEventListener("popstate", restore);
    };
  }, [urlState]);
  const crumb = (lv) => {
    const first = (lv.def.parameters || []).find((pp) => lv.params?.[pp.name] != null && lv.params[pp.name] !== "");
    return first && lv !== levels[0] ? `${lv.def.name || lv.id} · ${lv.params[first.name]}` : lv.def.name || lv.id || "Report";
  };
  const optKey = JSON.stringify(params);
  (0, import_react.useEffect)(() => {
    if (!(definition.parameters || []).some((p) => p.options || p.optionsFrom)) return;
    let stale = false;
    const t2 = setTimeout(() => {
      parameterOptions(definition, params, { baseUrl: origin(), reportId, fetch: reportFetch(origin()) }).then((o) => {
        if (stale) return;
        const choices = paramChoices(definition, o);
        setOptions(choices);
        setParams((s) => clearStaleParams(definition, s, choices));
      }).catch(() => {
      });
    }, 250);
    return () => {
      stale = true;
      clearTimeout(t2);
    };
  }, [definition, optKey]);
  (0, import_react.useEffect)(() => {
    const el = scroller.current, rt = root.current;
    if (!el || !rt) return;
    const ro = new ResizeObserver(() => {
      setFitW(el.clientWidth - 40);
      setFitH(el.clientHeight - 48);
      setNarrow(rt.clientWidth < COMPACT);
    });
    ro.observe(el);
    ro.observe(rt);
    return () => ro.disconnect();
  }, []);
  (0, import_react.useEffect)(() => {
    if (!narrow) setMenu(false);
  }, [narrow]);
  (0, import_react.useEffect)(() => {
    setCanFullScreen(!!document.fullscreenEnabled);
    const on = () => setFullScreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);
  const toggleFullScreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
      return;
    }
    root.current?.requestFullscreen?.()?.catch?.(() => {
    });
  };
  const maxW = model ? model.pages.reduce((m, p) => Math.max(m, p.width || 0), model.width) : 0;
  const maxH = model ? model.pages.reduce((m, p) => Math.max(m, p.height || 0), model.height || 0) : 0;
  const fitWidth = Math.min(2.5, Math.max(0.3, fitW / (maxW * PX)));
  const scale = model ? zoom === "fit" || zoom === "page" && narrow ? fitWidth * PX : zoom === "page" ? Math.min(fitWidth, Math.max(0.2, fitH / ((maxH || 1) * PX))) * PX : zoom * PX : PX;
  const total = model?.pages.length || 0;
  const hits = (0, import_react.useMemo)(() => findText(model, query, { matchCase, wholeWord }), [model, query, matchCase, wholeWord]);
  const hasErrorCells = (0, import_react.useMemo)(() => !!model?.warnings?.length && (findText(model, "#Error").length > 0 || model.warnings.some((w) => w.startsWith(NO_CJK_FONTS))), [model]);
  const hitsByPage = (0, import_react.useMemo)(() => {
    const m = /* @__PURE__ */ new Map();
    hits.forEach((h, i) => {
      if (!m.has(h.page)) m.set(h.page, []);
      m.get(h.page).push({ ...h, cur: i === hitIdx });
    });
    return m;
  }, [hits, hitIdx]);
  const topOf = (node) => node.getBoundingClientRect().top - scroller.current.getBoundingClientRect().top + scroller.current.scrollTop;
  const onScroll = () => {
    const el = scroller.current;
    if (!el || !model || single) return;
    const tops = [0];
    for (const p of model.pages) tops.push(tops[tops.length - 1] + (p.height ?? model.height) * scale + GAP);
    const at = (y2) => {
      let lo = 0, hi = total - 1;
      while (lo < hi) {
        const mid = lo + hi + 1 >> 1;
        if (tops[mid] <= y2) lo = mid;
        else hi = mid - 1;
      }
      return lo;
    };
    setCurrent(Math.min(total, Math.max(1, at(el.scrollTop + el.clientHeight * 0.35) + 1)));
    const first = el.querySelector(".vpage");
    if (!first) return;
    const y = el.scrollTop - topOf(first);
    const i = Math.min(total - 1, Math.max(0, at(y)));
    const region = frozenAt(model.pages[i], (y - tops[i]) / scale);
    setFrozen((f) => region ? f?.region === region ? f : { page: i, region } : null);
  };
  const scrollToPoint = (page, y = 0) => {
    if (single) {
      pendingY.current = y;
      setCurrent(page);
      return;
    }
    const el = scroller.current?.querySelector(`[data-page="${page}"]`);
    if (!el) return;
    scroller.current.scrollTo({ top: topOf(el) + Math.max(0, y * scale - 40) });
    setCurrent(page);
  };
  (0, import_react.useLayoutEffect)(() => {
    const sc = scroller.current;
    if (!single || !sc) return;
    const el = sc.querySelector(".vpage");
    const y = pendingY.current;
    pendingY.current = null;
    sc.scrollTo({ top: el && y ? topOf(el) + Math.max(0, y * scale - 40) : 0 });
  }, [current, single]);
  (0, import_react.useLayoutEffect)(() => {
    const el = !single && current > 1 && scroller.current?.querySelector(`[data-page="${current}"]`);
    if (el) scroller.current.scrollTo({ top: topOf(el) });
  }, [single]);
  const go = (n) => scrollToPoint(Math.min(total, Math.max(1, n)));
  const goHit = (i) => {
    if (!hits.length) return;
    const k = (i + hits.length) % hits.length;
    setHitIdx(k);
    scrollToPoint(hits[k].page + 1, hits[k].y);
  };
  const zoomBy = (f) => setZoom((z) => Math.min(3, Math.max(0.25, Math.round((typeof z === "string" ? scale / PX : z) * f * 100) / 100)));
  const touch = (0, import_react.useRef)(null);
  const onTouchStart = (e) => {
    const p = e.touches[0];
    touch.current = e.touches.length === 1 ? { x: p.clientX, y: p.clientY } : null;
  };
  const onTouchEnd = (e) => {
    const s = touch.current, el = scroller.current;
    touch.current = null;
    if (!s || !el || el.scrollWidth > el.clientWidth + 1) return;
    const p = e.changedTouches[0];
    const dx = p.clientX - s.x, dy = p.clientY - s.y;
    if (Math.abs(dx) < 50 || Math.abs(dx) < 1.5 * Math.abs(dy)) return;
    go(current + (dx < 0 === (dir === "ltr") ? 1 : -1));
  };
  const onClick = (e) => {
    const el = e.target.closest?.(".pw-link");
    if (!el) return;
    if (el.tagName === "A") e.preventDefault();
    let a;
    try {
      a = JSON.parse(el.getAttribute("data-action"));
    } catch {
      return;
    }
    if (a.type === "toggle") {
      const st = { ...state, toggles: { ...state.toggles, [a.key]: !a.open } };
      setState(st);
      run(params, st, true);
    } else if (a.type === "sort") {
      const st = { ...state, sort: { ...state.sort, [a.table]: [{ by: a.by, dir: a.dir }] } };
      setState(st);
      run(params, st, true);
    } else if (a.type === "url") {
      if (safeUrl(a.href)) window.open(a.href, "_blank", "noopener");
    } else if (a.type === "drill") {
      if (onDrill) onDrill(a.report, a.params);
      else drillTo(a.report, a.params, e.metaKey || e.ctrlKey);
    } else if (a.type === "params") {
      const next = { ...params };
      for (const [k, v] of Object.entries(a.params || {})) {
        const val = v == null ? "" : String(v);
        const pdef = (definition.parameters || []).find((pp) => pp.name === k);
        const fallback = pdef && pdef.default != null && !(typeof pdef.default === "string" && pdef.default.startsWith("=")) ? String(pdef.default) : "";
        next[k] = a.toggle && String(params[k] ?? "") === val ? fallback : val;
      }
      const st = { toggles: {}, sort: state.sort };
      setParams(next);
      setState(st);
      run(next, st, true);
    } else if (a.type === "bookmark") {
      const b = a.page ? a : model?.bookmarks?.find((x) => x.label === a.target);
      if (b) scrollToPoint(b.page, b.y);
    }
  };
  const pagedModel = (target, exportData = false) => galley || definition.layers?.length || definition.master || exportData && model?.regions == null ? renderReport(definition, params, { ...state, target }, reportId, { exportData }) : model;
  const csvModel = async () => {
    if (model?.regions != null && !galley && !definition.layers?.length && !definition.master) return model;
    const m = await renderReport(definition, params, { ...state, target: "export" }, reportId, { dataOnly: true });
    return m.regions?.length ? m : pagedModel("export", true);
  };
  const buildBlob = async (fmt) => {
    const m = fmt === "csv" ? await csvModel() : await pagedModel("export", needsExportData(fmt, xopt));
    const strings = { pages: T("htmlPages"), tables: T("htmlTables"), all: T("htmlAll"), filter: T("htmlFilter"), toggle: T("htmlToggle"), sortAsc: T("htmlSortAsc"), sortDesc: T("htmlSortDesc") };
    return fmt === "pdf" ? pdfBlob(m, definition.name, { tagged: xopt.pdfua ? { lang: definition.locale || lang } : void 0, pdfa: xopt.pdfa }) : exportBlob(fmt, m, definition, { params, state, lang, options: xopt, strings, ...exportHtmlOptions || {}, ...level.id ? { reportId: level.id } : {} });
  };
  const doExport = async (fmt) => {
    if (!model) return;
    if (exportQueue.current.busy) {
      if (fmt !== exportQueue.current.busy && !exportQueue.current.includes(fmt)) {
        exportQueue.current.push(fmt);
        setQueued([...exportQueue.current]);
      }
      return;
    }
    const server = fmt === "pdf" && !galley && serverPdfUrl(model, { reportId: level.id, params, origin: origin(), timeZone: viewerTimeZone(), dirty: compact });
    if (server) {
      const u = new URL(server);
      if (xopt.pdfa) u.searchParams.set("pdfa", "1");
      if (xopt.pdfua) u.searchParams.set("ua", "1");
      setNote(T("serverPdfNote"));
      const a = document.createElement("a");
      a.href = u.toString();
      a.target = "_blank";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }
    exportQueue.current.busy = fmt;
    setExporting(fmt);
    try {
      const blob = await buildBlob(fmt);
      const ext = { pdf: "pdf", xlsx: "xlsx", docx: "docx", pptx: "pptx", html: "html", csv: "csv", json: "json" }[fmt];
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(definition.name || "report").replace(/[^\w-]+/g, "-")}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1e4);
      onExported?.(fmt, level.id, params);
    } catch (e) {
      setStatus({ state: "error", message: T("exportFailed", { fmt: fmt.toUpperCase(), message: e.message }) });
    } finally {
      exportQueue.current.busy = null;
      setExporting(null);
      const next = exportQueue.current.shift();
      setQueued([...exportQueue.current]);
      if (next) doExport(next);
    }
  };
  const print = async () => {
    if (!model) return;
    setExporting("print");
    try {
      const blob = await pdfBlob(await pagedModel("print"), definition.name);
      onExported?.("print", level.id, params);
      const url = URL.createObjectURL(blob);
      document.querySelector("iframe[data-pw-print]")?.remove();
      const f = document.createElement("iframe");
      f.dataset.pwPrint = "1";
      f.title = T("print");
      f.setAttribute("aria-hidden", "true");
      f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
      f.onload = () => {
        try {
          f.contentWindow.focus();
          f.contentWindow.print();
        } catch {
          window.open(url, "_blank", "noopener");
        }
      };
      f.src = url;
      document.body.appendChild(f);
      setTimeout(() => URL.revokeObjectURL(url), 12e4);
    } catch (e) {
      setStatus({ state: "error", message: T("exportFailed", { fmt: T("print"), message: e.message }) });
    } finally {
      setExporting(null);
    }
  };
  const bookmarks = model?.bookmarks || [];
  const side = panel === "params" && hasParams ? "params" : panel === "map" && bookmarks.length ? "map" : panel === "pages" && total > 0 ? "pages" : panel === "matches" && query ? "matches" : null;
  const columns = Math.max(1, Math.min(6, Math.floor(Number(definition.parameterLayout?.columns) || 1)));
  const paramsOnTop = side === "params" && columns > 1 && !narrow;
  const api = { page: current, pages: total, goTo: go, run: () => run(), print, exportAs: doExport };
  (0, import_react.useEffect)(() => {
    if (!control) return void 0;
    control.current = {
      pages: total,
      goTo: go,
      print,
      setParameters: (p) => {
        const next = { ...params, ...p };
        setParams(next);
        run(next, state);
      },
      setDefinition: (def) => setLevels([{ def, params: rootParams, id: rootReportId }]),
      exportBlob: (fmt) => {
        if (!model) return Promise.reject(new Error("the report has not run yet"));
        return buildBlob(fmt);
      }
    };
  });
  (0, import_react.useEffect)(() => () => {
    if (control) control.current = null;
  }, [control]);
  const lastEvent = (0, import_react.useRef)({ page: current, params: JSON.stringify(params) });
  (0, import_react.useEffect)(() => {
    if (lastEvent.current.page !== current) {
      lastEvent.current.page = current;
      onEvent?.("page", current);
    }
  }, [current]);
  (0, import_react.useEffect)(() => {
    const key = JSON.stringify(params);
    if (lastEvent.current.params !== key) {
      lastEvent.current.params = key;
      onEvent?.("parameters", params);
    }
  }, [params]);
  const exportItem = (id, fmt, label, extra = {}) => {
    const name = exporting === fmt ? T("exporting") : queued.includes(fmt) ? T("r4_queued") : label;
    const hint = T(`b2_fmt_${fmt}`);
    return {
      id,
      group: "export",
      format: true,
      node: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { type: "button", role: "menuitem", className: "vdrop-item", onClick: () => {
        setEmenu(false);
        doExport(fmt);
      }, disabled: !model || exporting === "print", "data-testid": `export-${fmt}`, ...extra, children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: `fmt-badge ${fmt}`, "aria-hidden": "true", children: fmt === "xlsx" ? "XLS" : fmt === "docx" ? "DOC" : fmt === "pptx" ? "PPT" : fmt.toUpperCase() }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "vdrop-txt", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("b", { "aria-hidden": name === label && hint.includes(label) || void 0, children: name }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "hint", children: hint })
        ] })
      ] })
    };
  };
  const builtIns = [
    { id: "thumbnails", group: "panels", node: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { className: "btn sm icon", "aria-pressed": side === "pages" || side === "map", title: T("b2_sidebar"), onClick: () => setPanel((s) => s === "pages" || s === "map" ? null : "pages"), "data-testid": "viewer-sidebar", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "sidebar" }) }) },
    hasParams && { id: "parameters", group: "panels", primary: true, node: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { className: "btn sm", "aria-pressed": side === "params", onClick: () => setPanel((s) => s === "params" ? null : "params"), children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "filter" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "lbl", children: T("parameters") })
    ] }) },
    bookmarks.length > 0 && { id: "documentMap", group: "panels", node: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { className: "btn sm", "aria-pressed": side === "map", onClick: () => setPanel((s) => s === "map" ? null : "map"), title: T("documentMap"), "aria-label": T("documentMap"), children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "toc" }) }) },
    { id: "run", group: "panels", node: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { className: "btn sm", onClick: () => run(), disabled: status.state === "running", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "run" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "lbl", children: status.state === "running" ? status.retry ? T("r4_busyRetry", { n: status.retry.attempt, max: status.retry.max }) : T("running") : T("run") })
    ] }) },
    { id: "firstPage", group: "paging", node: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { className: "btn sm icon", title: T("firstPage"), onClick: () => go(1), disabled: !total || current === 1, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "flip", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "first" }) }) }) },
    { id: "previousPage", group: "paging", primary: true, node: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { className: "btn sm icon", title: T("previousPage"), onClick: () => go(current - 1), disabled: !total || current === 1, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "flip", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "prev" }) }) }) },
    {
      id: "pageNumber",
      group: "paging",
      primary: true,
      node: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("input", { className: "input pageno", "aria-label": T("page"), value: total ? current : "", onChange: (e) => {
          const n = parseInt(e.target.value, 10);
          if (n) go(n);
        } }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "stat", title: model?.partial ? T("stillRendering") : void 0, children: [
          "/ ",
          total ? model?.partial ? `${total}+` : total : "–"
        ] })
      ] })
    },
    { id: "nextPage", group: "paging", primary: true, node: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { className: "btn sm icon", title: T("nextPage"), onClick: () => go(current + 1), disabled: !total || current === total, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "flip", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "next" }) }) }) },
    { id: "lastPage", group: "paging", node: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { className: "btn sm icon", title: T("lastPage"), onClick: () => go(total), disabled: !total || current === total, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "flip", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "last" }) }) }) },
    { id: "zoomOut", group: "zoom", node: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { className: "btn sm icon", title: T("zoomOut"), "aria-label": T("zoomOut"), onClick: () => zoomBy(1 / 1.2), children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "zoomOut" }) }) },
    { id: "zoomValue", group: "zoom", node: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "stat zoomval", children: [
      Math.round(scale / PX * 100),
      "%"
    ] }) },
    { id: "zoomIn", group: "zoom", node: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { className: "btn sm icon", title: T("zoomIn"), "aria-label": T("zoomIn"), onClick: () => zoomBy(1.2), children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "zoomIn" }) }) },
    { id: "fitPage", group: "zoom", node: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { className: "btn sm", "aria-pressed": zoom === "page", onClick: () => setZoom("page"), "data-testid": "fit-page", title: T("ux_wholePage"), children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "fitPage" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "lbl", children: T("ux_wholePage") })
    ] }) },
    { id: "fitWidth", group: "zoom", node: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { className: "btn sm", "aria-pressed": zoom === "fit", onClick: () => setZoom("fit"), title: T("fitWidth"), "aria-label": T("fitWidth"), children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "fitWidth" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "lbl", children: T("fitWidth") })
    ] }) },
    {
      id: "viewMode",
      group: "view",
      node: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("select", { className: "select vmode", "aria-label": T("viewMode"), value: mode, onChange: (e) => {
        setMode(e.target.value);
        setFrozen(null);
      }, children: MODES.map((m) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: m, children: T(m) }, m)) })
    },
    canFullScreen && { id: "fullScreen", group: "view", node: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { className: "btn sm icon", "aria-pressed": fullScreen, title: fullScreen ? T("exitFullScreen") : T("fullScreen"), "aria-label": T("fullScreen"), onClick: toggleFullScreen, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "full" }) }) },
    model && {
      id: "stats",
      group: "stats",
      node: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "stat vstats", title: usingWorker() ? "Rendered in a Web Worker" : "Rendered on the main thread", children: [
        T("pagesRows", { pages: total, rows: Object.values(model.stats.rows).reduce((a, b) => a + b, 0), ms: model.stats.ms }),
        usingWorker() ? " · worker" : ""
      ] })
    },
    {
      id: "search",
      group: "search",
      primary: true,
      node: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("form", { className: "search", role: "search", onSubmit: (e) => {
        e.preventDefault();
        goHit(hitIdx + 1);
      }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "search-ico", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "search" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("input", { className: "input", type: "search", placeholder: T("search"), "aria-label": T("search"), value: query, onChange: (e) => {
          setQuery(e.target.value);
          setHitIdx(0);
        } }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "btn sm icon opt", "aria-pressed": matchCase, "aria-label": T("matchCase"), title: T("matchCase"), onClick: () => {
          setMatchCase((v) => !v);
          setHitIdx(0);
        }, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { "aria-hidden": "true", children: "Aa" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "btn sm icon opt", "aria-pressed": wholeWord, "aria-label": T("wholeWord"), title: T("wholeWord"), onClick: () => {
          setWholeWord((v) => !v);
          setHitIdx(0);
        }, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "ww", "aria-hidden": "true" }) }),
        query && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "stat", "aria-live": "polite", children: hits.length ? `${hitIdx + 1}/${hits.length}` : "0" }),
        query && hits.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "btn sm icon", onClick: () => goHit(hitIdx - 1), "aria-label": T("previousMatch"), title: T("previousMatch"), children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "up" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "submit", className: "btn sm icon", "aria-label": T("nextMatch"), title: T("nextMatch"), children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "down" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "btn sm icon", "aria-pressed": side === "matches", "aria-label": T("allMatches"), title: T("allMatches"), onClick: () => setPanel((s) => s === "matches" ? null : "matches"), children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "list" }) })
        ] })
      ] })
    },
    { id: "print", group: "export", node: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { className: "btn sm", onClick: print, disabled: !model || !!exporting, "data-testid": "print", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "print" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "lbl", children: exporting === "print" ? T("printing") : T("print") })
    ] }) },
    exportItem("pdf", "pdf", "PDF"),
    exportItem("excel", "xlsx", "Excel"),
    exportItem("word", "docx", "Word", { title: T("wordHint") }),
    exportItem("powerpoint", "pptx", "PowerPoint", { title: T("pptxHint") }),
    exportItem("html", "html", "HTML"),
    exportItem("csv", "csv", "CSV"),
    exportItem("json", "json", "JSON", { title: T("jsonHint") }),
    {
      id: "exportOptions",
      group: "export",
      node: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "vexp", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "btn sm icon", "aria-label": T("exportOptions"), title: T("exportOptions"), "aria-expanded": xmenu, "aria-haspopup": "true", "data-testid": "export-options", onClick: () => setXmenu((v) => !v), children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      Icon, { name: "gear" }) }) })
    }
  ].filter(Boolean);
  const items = arrangeToolbar(builtIns, toolbar || {});
  const GROUPS = { paging: T("groupPaging"), zoom: T("groupZoom"), view: T("groupView"), export: T("groupExport") };
  const renderItems = (list) => {
    const out = [];
    for (let i = 0; i < list.length; ) {
      const g = list[i].group;
      const chunk = [];
      while (i < list.length && list[i].group === g) chunk.push(list[i++]);
      const node = (it) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "titem", "data-toolbar-id": it.id, children: it.custom ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "btn sm", title: it.title, onClick: () => it.onClick?.(api), children: it.label }) : it.node }, it.id);
      let nodes = chunk.map(node);
      if (g === "export" && chunk.some((it) => it.format)) {
        const fmts = chunk.filter((it) => it.format), rest = chunk.filter((it) => !it.format);
        const at = rest.findIndex((it) => it.id === "exportOptions");
        const menu2 = /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "vdrop-wrap", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
            "button",
            {
              type: "button",
              className: "btn sm",
              "aria-haspopup": "menu",
              "aria-expanded": emenu,
              disabled: !model,
              "data-testid": "export-menu",
              onClick: () => setEmenu((v) => !v),
              onKeyDown: (e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setEmenu(true);
                  requestAnimationFrame(() => root.current?.querySelector(".vdrop [role=menuitem]:not(:disabled)")?.focus());
                }
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "download" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "lbl", children: exporting && exporting !== "print" ? T("exporting") : T("b2_export") }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "chevron", size: 12 })
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "vdrop", role: "menu", "aria-label": T("b2_export"), hidden: !emenu, onKeyDown: (e) => {
            const list2 = [...e.currentTarget.querySelectorAll("[role=menuitem]:not(:disabled), .titem > button:not(:disabled)")];
            const k = list2.indexOf(document.activeElement);
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              list2[(k + (e.key === "ArrowDown" ? 1 : -1) + list2.length) % list2.length]?.focus();
            }
            if (e.key === "Escape") {
              e.stopPropagation();
              setEmenu(false);
              e.currentTarget.previousSibling?.focus();
            }
          }, children: fmts.map(node) })
        ] }, "export-menu");
        nodes = rest.map(node);
        nodes.splice(at < 0 ? nodes.length : at, 0, menu2);
      }
      if (g === "search") out.push(/* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "vbar-gap" }, "gap"));
      out.push(GROUPS[g] ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: `tgroup ${g}`, role: "group", "aria-label": GROUPS[g], children: nodes }, `g${i}`) : nodes);
      if (g === "panels") out.push(/* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "sep" }, "sep"));
    }
    return out;
  };
  const inBar = narrow ? items.filter((i) => i.primary) : items;
  const inMenu = narrow ? items.filter((i) => !i.primary) : [];
  const onRootPointerDown = (e) => {
    if (menu && !e.target.closest?.(".vmenu, .vmore")) setMenu(false);
    if (xmenu && !e.target.closest?.(".vexp")) setXmenu(false);
    if (emenu && !e.target.closest?.(".vdrop-wrap")) setEmenu(false);
  };
  const onRootKeyDown = (e) => {
    if (e.key !== "Escape") return;
    if (xmenu) setXmenu(false);
    if (emenu) setEmenu(false);
    if (menu) setMenu(false);
    else if (narrow && side) setPanel(null);
  };
  const sheet2 = (name, content) => !narrow ? content : /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "vsheet-wrap", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "vscrim", onClick: () => setPanel(null) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "vsheet", role: "dialog", "aria-modal": "true", "aria-label": name, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "btn sm icon vsheet-close", "aria-label": T("close"), onClick: () => setPanel(null), children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { "aria-hidden": "true", children: "✕" }) }),
      content
    ] })
  ] });
  const shown = !model ? [] : single ? [current - 1].filter((i) => model.pages[i]) : model.pages.map((_, i) => i);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "div",
    {
      ref: root,
      className: `viewer${narrow ? " narrow" : ""}`,
      "data-testid": "viewer",
      "data-view-mode": mode,
      dir,
      lang,
      onPointerDown: onRootPointerDown,
      onKeyDown: onRootKeyDown,
      children: [
        levels.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("nav", { className: "vcrumbs", "aria-label": T("drillPath"), children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { type: "button", className: "btn sm", onClick: () => back(), "data-testid": "drill-back", children: [
            dir === "rtl" ? "→" : "←",
            " ",
            T("back")
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("ol", { children: levels.map((lv, i) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("li", { children: i < levels.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "linklike", onClick: () => back(i), children: crumb(lv) }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("b", { "aria-current": "page",
          children: crumb(lv) }) }, i)) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "hint", children: T("drillDepth", { n: levels.length - 1 }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "vbar", children: [
          title && !compact && !narrow && levels.length === 1 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("b", { style: { marginInlineEnd: 6 }, children: title }),
          renderItems(inBar),
          inMenu.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "vmore-wrap", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "btn sm icon vmore", "aria-label": T("more"), title: T("more"), "aria-expanded": menu, onClick: () => setMenu((v) => !v), children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { "aria-hidden": "true", children: "⋯" }) }),
            menu && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "vmenu", role: "group", "aria-label": T("more"), children: renderItems(inMenu) })
          ] }),
          xmenu && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "vmore-wrap vexp", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "vmenu", role: "group", "aria-label": T("exportOptions"), style: { flexDirection: "column", alignItems: "flex-start" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("label", { title: T("optPdfUaHint"), children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("input", { type: "checkbox", checked: xopt.pdfua, onChange: (e) => setX("pdfua", e.target.checked), "data-testid": "opt-pdfua" }),
              " ",
              T("optPdfUa")
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("label", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("input", { type: "checkbox", checked: xopt.pdfa, onChange: (e) => setX("pdfa", e.target.checked), "data-testid": "opt-pdfa" }),
              " ",
              T("optPdfA")
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("label", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("input", { type: "checkbox", checked: xopt.formulas, onChange: (e) => setX("formulas", e.target.checked), "data-testid": "opt-formulas" }),
              " ",
              T("optFormulas")
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("label", { children: [
              T("optHtml"),
              " ",
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("select", { className: "select", value: xopt.html, onChange: (e) => setX("html", e.target.value), "data-testid": "opt-html", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "interactive", children: T("optHtmlInteractive") }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "tables", children: T("optHtmlTables") }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "static", children: T("optHtmlStatic") })
              ] })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "vbody", style: paramsOnTop ? { gridTemplateColumns: "1fr", gridTemplateRows: "auto 1fr" } : { gridTemplateColumns: side && !narrow ? `${side === "pages" ? 200 : 260}px minmax(0, 1fr)` : "minmax(0, 1fr)" }, children: [
          side === "params" && sheet2(T("parameters"), /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
            "form",
            {
              className: `vparams${paramsOnTop ? " top" : ""}`,
              style: paramsOnTop ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : void 0,
              onSubmit: (e) => {
                e.preventDefault();
                const st = { toggles: {}, sort: {} };
                setState(st);
                run(params, st);
                if (narrow) setPanel(null);
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("h3", { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "filter" }),
                  T("parameters")
                ] }),
                (definition.parameters || []).filter((p) => !p.hidden).map((p) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "field", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { children: [
                    p.prompt || p.name,
                    p.required ? " *" : ""
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                    ParamInput,
                    {
                      p,
                      value: params[p.name],
                      options: options[p.name],
                      invalid: status.missing?.includes(p.name),
                      T,
                      name: `${uid}-${p.name}`,
                      onChange: (v) => setParams((s) => ({ ...s, [p.name]: v }))
                    }
                  )
                ] }, p.name)),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "vparams-go", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { className: "btn primary", type: "submit", children: T("viewReport") }),
                  live && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "hint", children: T("ux_liveHint") })
                ] })
              ]
            }
          )),
          (side === "map" || side === "pages") && sheet2(T(side === "map" ? "documentMap" : "b2_pages"), /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("nav", { className: `vside vnav${side === "pages" ? " thumbs" : ""}`, "aria-label": T(side === "map" ? "documentMap" : "b2_pages"), children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "vtabs", role: "tablist", "aria-label": T("b2_sidebar"), children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { type: "button", role: "tab", "aria-selected": side === "pages", onClick: () => setPanel("pages"), "data-testid": "side-pages", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "pages" }),
                T("b2_pages")
              ] }),
              bookmarks.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { type: "button", role: "tab", "aria-selected": side === "map", onClick: () => setPanel("map"), "data-testid": "side-contents", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "toc" }),
                T("b2_contents")
              ] })
            ] }),
            side === "map" && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h3", { className: "sr-only", children: T("documentMap") }),
              bookmarks.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { className: "vtoc", "aria-current": b.page === current ? "location" : void 0, style: { paddingInlineStart: 10 + (b.level || 0) * 14 }, onClick: () => {
                scrollToPoint(b.page, b.y);
                if (narrow) setPanel(null);
              }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "vtoc-l", children: b.label }),
                " ",
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "hint", children: [
                  "p.",
                  b.page
                ] })
              ] }, i))
            ] }),
            side === "pages" && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "vthumbs", children: model.pages.map((pg, i) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Thumb, { page: pg, w: pg.width ?? model.width, h: pg.height ?? model.height, n: i + 1, current: i + 1 === current, near: Math.abs(i + 1 - current) <= 12, T, onGo: (n) => {
              go(n);
              if (narrow) setPanel(null);
            } }, i)) })
          ] })),
          side === "matches" && sheet2(T("matches"), /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("nav", { className: "vside vmatches", "aria-label": T("matches"), children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h3", { children: T("matchCount", { n: hits.length }) }),
            !hits.length && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "hint", children: T("noMatches") }),
            hits.slice(0, 500).map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { "aria-current": i === hitIdx ? "true" : void 0, onClick: () => {
              setHitIdx(i);
              scrollToPoint(h.page + 1, h.y);
              if (narrow) setPanel(null);
            }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "hint", children: T("pageShort", { n: h.page + 1 }) }),
              " ",
              h.text
            ] }, i))
          ] })),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "vpages", ref: scroller, role: "document", "aria-label": definition.name || T("ux_a11yReport"), onScroll, onClick, onTouchStart, onTouchEnd, children: [
            status.state === "error" && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "vmsg error", role: "alert", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("b", { children: T("didNotRun") }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("br", {}),
              status.message,
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: { marginTop: 10 }, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "btn sm", onClick: () => run(), "data-testid": "viewer-retry", children: T("r4_retry") }) })
            ] }),
            status.state === "done" && status.fonts && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "vmsg error", role: "alert", "data-testid": "viewer-fonts", children: status.fonts }),
            note && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "vmsg", role: "status", "data-testid": "viewer-note", children: [
              note,
              " ",
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { className: "btn sm ghost", onClick: () => setNote(null), "aria-label": T("close"), children: "×" })
            ] }),
            status.state === "running" && status.retry && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "vmsg", role: "status", "data-testid": "viewer-busy", children: T("r4_busyRetry", { n: status.retry.attempt, max: status.retry.max }) }),
            !model && status.state === "running" && !status.retry && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Skeleton, { def: renderDef, scale: zoom === "fit" || narrow ? fitW / 600 : Math.min(fitW / 600, fitH / 850), T }),
            model?.warnings?.length > 0 && // content cut off (past the page edge or bottom): the warnings open by themselves and the summary says so
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("details", { className: "warnings", open: hasErrorCells || model.clipped?.length > 0 || void 0, "data-testid": "viewer-warnings", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("summary", { children: [
                T("warnings", { n: model.warnings.length }),
                model.clipped?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("b", { "data-testid": "viewer-clipped", children: [
                  " · ",
                  T("r4_clipped", { n: model.clipped.length })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("ul", { children: model.warnings.map((w, i) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("li", { children: w }, i)) })
            ] }),
            model && !single && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "vfrozen", style: { width: (model.pages[frozen?.page]?.width ?? model.width) * scale }, children: frozen && model.pages[frozen.page] && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Frozen, { page: model.pages[frozen.page], region: frozen.region, w: model.pages[frozen.page].width ?? model.width, h: model.
            pages[frozen.page].height ?? model.height, scale }) }),
            shown.map((i) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Page, { index: i, total, T, page: model.pages[i], w: model.pages[i].width ?? model.width, h: model.pages[i].height ?? model.height, scale, hits: hitsByPage.get(i), near: single || Math.abs(i - (current - 1)) <= WINDOW }, i))
          ] })
        ] })
      ]
    }
  );
}

// src/viewer/uiFonts.js
var LATIN = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
var LATIN_EXT = "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF";
var DEVANAGARI = "U+0900-097F,U+1CD0-1CF9,U+200C-200D,U+20A8,U+20B9,U+20F0,U+25CC,U+A830-A839,U+A8E0-A8FF";
var face = (family, file, weight, range, base) => `@font-face{font-family:"${family}";src:url("${base}/fonts/ui/${file}.woff2") format("woff2");font-weight:${weight};font-style:normal;font-display:swap;unicode-range:${range}}`;
function uiFontCss(base = "") {
  const out = [];
  for (const w of [400, 500, 600]) {
    out.push(face("PW UI", `ibm-plex-sans-latin-${w}-normal`, w, LATIN, base));
    out.push(face("PW UI", `ibm-plex-sans-latin-ext-${w}-normal`, w, LATIN_EXT, base));
  }
  for (const w of [400, 600]) {
    out.push(face("PW UI", `ibm-plex-sans-devanagari-devanagari-${w}-normal`, w, DEVANAGARI, base));
    out.push(face("PW Mono", `ibm-plex-mono-latin-${w}-normal`, w, LATIN, base));
    out.push(face("PW Mono", `ibm-plex-mono-latin-ext-${w}-normal`, w, LATIN_EXT, base));
  }
  return out.join("\n");
}

export {
  require_react,
  require_client,
  setShadowStyles,
  declareDocumentStyles,
  deferStyleAttributes,
  applyStyleAttributes,
  pickLang,
  dirOf,
  t,
  loadLanguage,
  require_jsx_runtime,
  Icon,
  ReportViewer,
  uiFontCss
};
