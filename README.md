States.js
=========

An event library for your web applications.

States.js is a library that helps you manage state in your web applications. It's based on a concept of Hierarchical State Machines and heavily inspired by the old Ember.js Router.

The goal of the library is to provide you with the stateful router that you will use to declaratively describe the states which your application can be in and transitions between them.


Documentation
-------------

This is an example of how the routerl will look like

```javascript
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
```

Transitioning to a state

```javascript
// transition to a dynamic state and provide some context which will be used to build urls
router.transitionTo('blog.post.comment', {post_id:1, comment_id:42});
```
