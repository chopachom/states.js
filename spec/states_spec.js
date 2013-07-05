describe("A States suite", function(){
    var State = States.State,
        StateManager = States.StateManager,
        Router = States.Router,
        Route  = States.Route;

    it("should have a States in window", function(){
        expect(typeof window.States === "object").toBe(true);
    });

    it("should contain State and StateManager", function(){
        expect(typeof States.State === "function").toBe(true);
        expect(typeof States.StateManager === "function").toBe(true);
    });


    describe('State', function(){
        it("should be an instance of State", function(){
            var state = new States.State({
                enter: function(){},
                leave: function(){}
            });
            expect(state instanceof States.State).toBe(true);
        });
        it("should have a list of special actions", function(){
            expect((new States.State)._specialActionsNames).toEqual(['enter', 'leave', 'serialize', 'deserialize'])
        });
        it("should correctly add specialActions", function(){
            var state = new States.State({
                enter: function(){},
                leave: function(){}
            });
            expect(Object.keys(state._specialActions).length).toBe(2);
        });
        it("should correctly add actions", function(){
            var state = new State({
                doSmth: function(){},
                enter: function(){},
                leave: function(){}
            });
            expect(Object.keys(state._specialActions).length).toBe(2);
            expect(Object.keys(state._actions).length).toBe(1);
        });
        it("should correctly add options", function(){
            var state = new State({
                initialState: 'someState',
                doSmth: function(){},
                doSmthOther: function(){},
                enter: function(){},
                leave: function(){}
            });
            expect(Object.keys(state._specialActions).length).toBe(2);
            expect(Object.keys(state._actions).length).toBe(2);
            expect(Object.keys(state._options).length).toBe(1);
        });
        it("should work with one child state", function(){
            var manager = new StateManager({
                initialState: 'index',
                index: new State({
                    enter: function(){},
                    doSmth: function(){}
                })
            });
            manager.initialize();
            expect(Object.keys(manager.states).length).toBe(2);
            expect(manager.initialStateName).toBe('index');
            expect(manager.initialState.name).toBe('index');
            expect(manager.initialState.path).toBe('index');
            expect(Object.keys(manager.initialState.children).length).toBe(0);
            expect(manager.initialState.hasChildren).toBe(false);
        });
        it("should work with two inner states", function(){
            var manager = new StateManager({
                initialState: 'index',
                index: new State({
                    enter: function(){},
                    doSmth: function(){},
                    login: new State({
                        leave: function(){}
                    })
                })
            });
            manager.initialize();
            expect(Object.keys(manager.states).length).toBe(3);
            expect(manager.initialStateName).toBe('index');
            expect(manager.initialState.name).toBe('index');
            expect(manager.initialState.path).toBe('index');
            expect(Object.keys(manager.initialState.children).length).toBe(1);
            expect(manager.initialState.hasChildren).toBe(true);
            expect(manager.initialState.children['login'].name).toBe('login');
            expect(manager.initialState.children['login'].path).toBe('index.login');
        });
        it("should work with three inner states", function(){
            var manager = new StateManager({
                initialState: 'index',
                index: new State({
                    enter: function(){},
                    doSmth: function(){},
                    users: new State({
                        leave: function(){},
                        login: new State({
                            serialize: function(){}
                        })
                    })
                })
            });
            manager.initialize();
            expect(Object.keys(manager.states).length).toBe(4);
            expect(manager.initialStateName).toBe('index');
            expect(manager.initialState.name).toBe('index');
            expect(manager.initialState.path).toBe('index');
            expect(Object.keys(manager.initialState.children).length).toBe(2);
            expect(manager.initialState.hasChildren).toBe(true);
            expect(manager.initialState.children['users'].name).toBe('users');
            expect(manager.initialState.children['users'].path).toBe('index.users');
            expect(manager.initialState.children['users.login'].name).toBe('login');
            expect(manager.initialState.children['users.login'].path).toBe('index.users.login');
            console.log()
        });
        it("should work with four inner states", function(){
            var manager = new StateManager({
                initialState: 'index',
                index: new State({
                    enter: function(){},
                    doSmth: function(){},
                    users: new State({
                        leave: function(){},
                        profile: new State({
                            deserialize: function(){},
                            login: new State({
                                serialize: function(){}
                            })
                        })
                    })
                })
            });
            manager.initialize();
            expect(Object.keys(manager.states).length).toBe(5);
            expect(manager.initialStateName).toBe('index');
            expect(manager.initialState.name).toBe('index');
            expect(manager.initialState.path).toBe('index');
            expect(Object.keys(manager.initialState.children).length).toBe(3);
            expect(manager.initialState.hasChildren).toBe(true);
            expect(manager.initialState.children['users'].name).toBe('users');
            expect(manager.initialState.children['users'].path).toBe('index.users');
            expect(manager.initialState.children['users.profile'].name).toBe('profile');
            expect(manager.initialState.children['users.profile'].path).toBe('index.users.profile');
            expect(manager.initialState.children['users.profile'].hasChildren).toBe(true);
            expect(Object.keys(manager.initialState.children['users.profile'].children).length).toBe(1);
            expect(manager.initialState.children['users.profile.login'].name).toBe('login');
            expect(manager.initialState.children['users.profile.login'].path).toBe('index.users.profile.login');
            expect(manager.initialState.children['users.profile.login'].hasChildren).toBe(false);
            expect(Object.keys(manager.initialState.children['users'].children).length).toBe(2);
            expect(manager.initialState.children['users'].children['profile']).toBeDefined();
            expect(manager.initialState.children['users'].children['profile.login']).toBeDefined();
            console.log()
        });
        it("should work with many inner states", function(){
            var manager = new StateManager({
                initialState: 'index',
                index: new State({
                    enter: function(){},
                    doSmth: function(){},
                    users: new State({
                        leave: function(){},
                        profile: new State({
                            deserialize: function(){},
                            login: new State({
                                serialize: function(){}
                            })
                        })
                    })
                }),
                settings: new State({
                    profile: new State({
                        password: new State({})
                    })
                })
            });
            manager.initialize();
            expect(Object.keys(manager.states).length).toBe(8);
            expect(manager.initialStateName).toBe('index');
            expect(manager.initialState.name).toBe('index');
            expect(manager.initialState.path).toBe('index');
            expect(Object.keys(manager.initialState.children).length).toBe(3);
            expect(manager.initialState.hasChildren).toBe(true);
            expect(manager.initialState.children['users'].name).toBe('users');
            expect(manager.initialState.children['users'].path).toBe('index.users');
            expect(manager.initialState.children['users.profile'].name).toBe('profile');
            expect(manager.initialState.children['users.profile'].path).toBe('index.users.profile');
            expect(manager.initialState.children['users.profile'].hasChildren).toBe(true);
            expect(Object.keys(manager.initialState.children['users.profile'].children).length).toBe(1);
            expect(manager.initialState.children['users.profile.login'].name).toBe('login');
            expect(manager.initialState.children['users.profile.login'].path).toBe('index.users.profile.login');
            expect(manager.initialState.children['users.profile.login'].hasChildren).toBe(false);
            expect(Object.keys(manager.initialState.children['users'].children).length).toBe(2);
            expect(manager.initialState.children['users'].children['profile']).toBeDefined();
            expect(manager.initialState.children['users'].children['profile.login']).toBeDefined();
            console.log()
        });
    });
    describe("Transitions", function(){
        //TODO: really test transitions with spies
        it("should transition", function(){
            var manager = new StateManager({
                initialState: 'index',
                index: new State({
                    enter: function(){console.log('index enter called')},
                    leave: function(){console.log('index leave called')},
                    users: new State({
                        enter: function(){console.log('index.users enter called')},
                        leave: function(){console.log('index.users leave called')},
                        profile: new State({
                            enter: function(){console.log('index.users.profile enter called')},
                            leave: function(){console.log('index.users.profile leave called')},
                            login: new State({
                                enter: function(){console.log('index.users.profile.login enter called')},
                                leave: function(){console.log('index.users.profile.login leave called')}
                            }),
                            edit: new State({
                                enter: function(){console.log('index.users.profile.edit enter called')},
                                leave: function(){console.log('index.users.profile.edit leave called')}
                            })
                        }),
                        activity:  new State({
                            enter: function(){console.log('index.users.activity enter called')},
                            leave: function(){console.log('index.users.activity leave called')}
                        })
                    })
                })
            });
            manager.initialize();
            manager.transitionTo('index.users.profile.login');
            manager.transitionTo('index.users.profile.edit');
            manager.transitionTo('index.users.activity');
        })
    });

    describe("Router", function(){
        var router;

        beforeEach(function(){
            router = new Router({
                initialState: 'index',
                index: new Route({
                    route: '/'
                }),
                users: new Route({
                    route: '/users',
                    profile: new Route({
                        route: '/profile',
                        edit: new Route({
                            route: '/edit/yes',
                            enter: function(){}
                        })
                    })
                }),
                blog: new Route({
                    route: '/blog',
                    show: new Route({
                        route: '/'
                    }),
                    post: new Route({
                        route: '/:post_id',
                        serialize: function(router, context){
                            return {post_id:context.post_id}
                        },
                        show: new Route({
                            route: '/'
                        }),
                        comment: new Route({
                            route: '/comments/:comment_id',
                            serialize: function(router, context){
                                return {comment_id:context.comment_id}
                            },
                            enter: function(router, context){
                                console.log("HERRR");
                                console.log('entering '+this.path, context);
                            }
                        })
                    })
                })
            });
        });

        describe("routeFor", function () {
            it("should give a static route for static states", function () {
                router.initialize();
                expect(router.routeFor('index')).toBe('/');
                expect(router.routeFor('users')).toBe('/users');
                expect(router.routeFor('users.profile')).toBe('/users/profile');
                expect(router.routeFor('users.profile.edit')).toBe('/users/profile/edit/yes');
            });
            it("should give a dynamic route for dynamic states", function(){
                router.initialize();
                expect(router.routeFor('index')).toBe('/');
                expect(router.routeFor('users')).toBe('/users');
                expect(router.routeFor('users.profile')).toBe('/users/profile');
                expect(router.routeFor('users.profile.edit')).toBe('/users/profile/edit/yes');
                expect(router.routeFor('blog.show')).toBe('/blog');
                expect(router.routeFor('blog.post.show', {post_id:1})).toBe('/blog/1');
                expect(router.routeFor('blog.post.comment', {post_id:1, comment_id:42})).toBe('/blog/1/comments/42');
            })
        });
        describe("needsReenter", function(){
            it("should be false for the same contexts", function(){
                router.initialize();
                expect(router._needsReenter('blog.post.comment', {post_id:1, comment_id:42}, {post_id:1, comment_id:42})).toBe(false);
                expect(router._needsReenter('blog.post.comment', {post_id:'1', comment_id:42}, {post_id:1, comment_id:42})).toBe(false);
            });
            it("should be true for the different contexts", function(){
                router.initialize();
                expect(router._needsReenter('blog.post.comment', {post_id:2, comment_id:42}, {post_id:1, comment_id:42})).toBe(true);
                expect(router._needsReenter('blog.post.comment', {post_id:1, comment_id:42}, {post_id:1, comment_id:44})).toBe(true);
            });
        });
        describe("getDivergentState", function(){
            it("should give a lowest common ancestor which given two contexts serializes to a different route", function(){
                router.initialize();
                console.log(router._getDivergentState('blog.post.comment', {post_id:2, comment_id:42}, {post_id:1, comment_id:42}));
            })
        });

        describe("transitionTo", function(){
            it("should not reenter to the same static state", function(){
                router.initialize();
                spyOn(router.states['users.profile.edit']._specialActions, 'enter');
                router.transitionTo('users.profile.edit', {someContext:1});
                router.transitionTo('users.profile.edit', {someContext:1});
                expect(router.states['users.profile.edit']._specialActions.enter).toHaveBeenCalled();
                expect(router.states['users.profile.edit']._specialActions.enter.calls.length).toEqual(1);
            });
            it("should not reenter to the dynamic state if contexts are equal", function(){
                router.initialize();
                spyOn(router.states['blog.post.comment']._specialActions, 'enter');
                router.transitionTo('blog.post.comment', {post_id:1, comment_id:42});
                router.transitionTo('blog.post.comment', {post_id:1, comment_id:42});
                expect(router.states['blog.post.comment']._specialActions.enter).toHaveBeenCalled();
                expect(router.states['blog.post.comment']._specialActions.enter.calls.length).toEqual(1);
            });
            it("should reenter to the dynamic state given new context", function(){
                router.initialize();
                spyOn(router.states['blog.post.comment']._specialActions, 'enter');
                router.transitionTo('blog.post.comment', {post_id:1, comment_id:42});
                router.transitionTo('blog.post.comment', {post_id:1, comment_id:43});
                expect(router.states['blog.post.comment']._specialActions.enter).toHaveBeenCalled();
                expect(router.states['blog.post.comment']._specialActions.enter.calls.length).toEqual(2);
            });
        });
    })
});

//todo: spec for _getStateByPath _getStatePathTree