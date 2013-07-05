//noinspection ThisExpressionReferencesGlobalObjectJS
(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory()
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory)
    } else {
        // Browser globals
        root.States = factory();
    }
})(this, function () {

    var joinPath = function (path1, path2) {
        return path1 ? path1 + '.' + path2 : path2;
    };

    var routeStripper = /^[#\/]+|[\/\s]+$/g;
    var namedParam = /:\w+/;
    var finalRouteStripper = /(\/?)(\/*)([^\/.]*)\/*$/g;

    var joinRoute = function (url1, url2) {
        return ('/' + url1.replace(routeStripper, '') + '/' + (url2).replace(routeStripper, '')).replace(finalRouteStripper, '$1$3')
    };

    var State = Object.augment(function () {
        this.constructor = function State(options) {
            this.hasChildren = false;
            this.name = null;
            this.path = null;
            this.children = {};
            this._actions = {};
            //todo: find a better name
            this._specialActions = {};
            this._options = {};
            this._specialActionsNames = ['enter', 'leave', 'serialize', 'deserialize'];
            this._optionsNames = ['initialState'];

            this._parseOptions(options)
        };
        this.initialize = function (manager, name, parent) {
            this.name = name;
            this.parent = parent;
            this.path = joinPath(parent && parent.path, name);
            for (var s in this.children) {
                this.children[s].initialize(manager, s, this);
            }
            manager.registerNode(this, parent);
//            if(!this.hasChildren){
            // Leaf reached, init. breadth first bottom up children registration to properly constructs paths
            // e.g. we are in leaf with name 'trololo', we traverse upwards to the state 'gsome', because gsome
            // already have a child with name trololo, we skip registration and traverse upwards to the state foobar
            // at this moment foobar only have gsome in its children and so we add gsome.trololo as its children too
//                manager.registerLeaf(this, parent);
//            }
        };
        this._parseOptions = function (options) {
            var option;
            // intentionally do not filter with hasOwnProperty
            for (var o in options) {
                option = options[o];
                //child states
                if (option instanceof State) {
                    this.addChild(o, option);
                }
                // actions
                else if (typeof option == 'function') {
                    if (this._specialActionsNames.indexOf(o) >= 0) {
                        this._specialActions[o] = option
                    } else {
                        this._actions[o] = option;
                    }
                }
                else if (this._optionsNames.indexOf(o) >= 0) {
                    this._options[o] = option;
                }
            }
            if (Object.keys(this.children).length) {
                this.hasChildren = true
            }
        };
        this.addChild = function (name, state) {
            this.hasChildren || (this.hasChildren = true);
            this.children[name] = state;
        };
        this.enter = function () {
            this._specialActions['enter'] && this._specialActions['enter'].apply(this, arguments);
        };
        this.leave = function () {
            this._specialActions['leave'] && this._specialActions['leave'].apply(this, arguments);
        };
        this.serialize = function () {};
        this.deserialize = function () {};
    });


    var StateManager = Object.augment(function () {
        this.constructor = function StateManager(statesOrRootState) {
            var states = statesOrRootState;
            if (statesOrRootState instanceof State) {
                states = {root: statesOrRootState, initialState: 'root'}
            }
            this.states = states;
            this.initialStateName = this.states['initialState'];
            this.initialState = this.states[this.initialStateName]
        };
        this.initialize = function () {
            var rootState = this.initialState;
            // if root isn't specified try to get an initialState
            if (!rootState && !this.states['initialState'] && !(rootState = this.states[this.states['initialState']])) {
                throw Error('You must specify an initialState')
            }
            for (var s in this.states) {
                var state = this.states[s];
                if (state instanceof State) {
                    state.initialize(this, s);
                }
                // copy all children of the top states
                for (var cs in state.children) {
                    this.states[joinPath(s, cs)] = state.children[cs]
                }
            }
            this.transitionTo(rootState);
        };
        this.transitionTo = function (stateOrPath, args) {
            var state = this._getState(stateOrPath);
            if (state === this.currentState) {
                return
            }
            var transitionTree = this._getStateTransitionTree(state, this.currentState);
            // current state could be null only when initializing for the first time
            var enteringTree = transitionTree[state.path];
            var leavingTree = this.currentState && transitionTree[this.currentState.path].reverse();
            this._doTransition(enteringTree, leavingTree, args);
        };
        this._doTransition = function (enteringTree, leavingTree, args) {
            if (this.currentState) {
                leavingTree.forEach(function (path) {
                    this._leave(this._getStateByPath(path), args);
                }, this);
            }

            enteringTree.forEach(function (path) {
                this._enter(this._getStateByPath(path), args);
            }, this);
        };
        this.registerNode = function (leaf, parent) {
            // parent already have all children states registered, including leafs, what we need to do is to register
            // leaf's parent, and its leaf states in leaf's parent parent =)
            if (!parent) {
                return
            }
            var path = joinPath(parent.name, leaf.name);
            this._copyChildStates(path, leaf, parent.parent)
        };
        this._copyChildStates = function (path, state, parent) {
            if (!parent) {
                return
            }
            parent.addChild(path, state);
            if (parent.parent) {
                this._copyChildStates(joinPath(parent.name, path), state, parent.parent)
            }
        };
        this._getState = function (stateOrPath) {
            // if state is not an object then it should be a path to a state
            if (!(stateOrPath instanceof State)) {
                stateOrPath = this._getStateByPath(stateOrPath);
            }
            return stateOrPath
        };
        this._getStateByPath = function (path) {
            return this.currentState && this.currentState.children[path] || this.states[path]
        };
        /**
         * Returns a map containing two submaps: list of states paths required for the current state to reach a
         * lowest common ancestor and a list of states path required to reach a target state from lowest common ancestor
         * e.g, having the following states structure:
         * - foo
         * - foo.bar
         * - foo.bar.baz
         * - foo.bar.baz.qux
         * - foo.bar.fred.quux
         * if the current state foo.bar.baz.qux and we transitioning to foo.bar.fred.quux then this function should
         * return
         * {
         * 'foo.bar.baz.qux' : {
         *  'foo.bar.baz': <state>,
         *  'foo.bar.baz.qux': <state> }
         * 'foo.bar.fred.quux': {
         *  'foo.bar.fred': <state>,
         *  'foo.bar.fred.quux': <state> }
         * }
         */
        this._getStateTransitionTree = function (state1, state2) {
            var res = {};
            if (!state2) {
                res[state1.path] = this._getStatePathTree(state1)
            } else {
                var tree1 = this._getStatePathTree(state1),
                    tree2 = this._getStatePathTree(state2);
                var i = 0, done = false;
                while (!done) {
                    if ((tree1[i] != tree2[i]) || (tree1[i] == null || tree2[i] == null)) {
                        done = true
                    } else {
                        i++;
                    }
                }
                res[state1.path] = tree1.slice(i);
                res[state2.path] = tree2.slice(i);
            }
            return res
        };
        /**
         * Returns a list of paths of states that are we need to enter/leave in order to enter/leave the given state
         * e.g given a state with path foo.bar.baz the tree would look like:
         * - foo
         * - foo.bar
         * - foo.bar.baz
         */
        this._getStatePathTree = function (state) {
            var i, paths = [], fullPath = state.path;
            paths.push(fullPath);
            while ((i = fullPath.lastIndexOf('.')) > -1) {
                fullPath = fullPath.substr(0, i);
                paths.push(fullPath);
            }
            return paths.reverse()
        };
        this._enter = function (state, args) {
            state.enter.apply(state, [this].concat(args));
            console.log('entering ' + state.path);
            // if state have no chilndren that means we reached a leaf, and this is was tha last state, so we make it current
            if (!state.hasChildren) {
                this.currentState = state;
            }
        };
        this._leave = function (state, args) {
            state.leave.apply(state, [this].concat(args));
            console.log('leaving ' + state.path);
        }
    });


    // Stateful Router and Routes

    var Route = State.augment(function (State, supr) {
        this.constructor = function Route() {
            this.route = null;
            this.dynamic = false;
            State.apply(this, arguments);
        };
        this._parseOptions = function (options) {
            supr._parseOptions.apply(this, arguments);
            this.route = options['route'];
            if (!this.route) {
                throw Error('You should specify a route')
            }
            if (namedParam.test(this.route)) {
                this.dynamic = true;
            }
        };
        this.serialize = function (router, context) {
            if (!this.dynamic) {
                return this.route
            }
            if (!this._specialActions.serialize) {
                throw Error(this.path + ' is dynamic and therefore should define a `serialize` method')
            }
            var serialized = this._specialActions.serialize(router, context);
            return this.route.replace(namedParam, function (match) {
                return "" + serialized[match.substr(1)]
            });
        };
    });

    var Router = StateManager.augment(function (StateManager, supr) {
        this.constructor = function Router() {
            StateManager.apply(this, arguments);
            this.lastContext = null;
        };
        this.initialize = function (historyManager) {
            this.historyManager = historyManager;
            supr.initialize.apply(this, arguments);
        };
        this.transitionTo = function (stateOrPath, context) {
            var state = this._getState(stateOrPath);
            var divergentState = this.currentState;
            if (state === this.currentState && this._needsReenter(state, this.lastContext, context)) {
                divergentState = this._getDivergentState(state, context, this.lastContext);
            }
            var transitionTree = this._getStateTransitionTree(state, divergentState);
            var enteringTree = transitionTree[state.path];
            var leavingTree = this.currentState && transitionTree[this.currentState.path].reverse();
            this._doTransition(enteringTree, leavingTree, [context]);
            this.lastContext = context
        };
        this._needsReenter = function (state, lastContext, newContext) {
            var lastRoute = this.routeFor(state, lastContext);
            var newRoute = this.routeFor(state, newContext);
            return lastRoute !== newRoute;
        };
        this._getDivergentState = function (stateOrPath, context1, context2) {
            var state = this._getState(stateOrPath),
                pathTree = this._getStatePathTree(state),
                s;
            for (var p in pathTree) {
                s = this._getStateByPath(pathTree[p]);
                if (s.serialize(this, context1) != s.serialize(this, context2)) {
                    return s.parent
                }
            }
        };
        this.routeFor = function (stateOrPath, context) {
            var state = this._getState(stateOrPath),
                pathTree = this._getStatePathTree(state),
                route = '',
                s;
            for (var p in pathTree) {
                s = this._getStateByPath(pathTree[p]);
                route = joinRoute(route, s.serialize(this, context));
            }
            return route;
        }
    });

    return {
        State       : State,
        StateManager: StateManager,
        Route       : Route,
        Router      : Router
    }
});