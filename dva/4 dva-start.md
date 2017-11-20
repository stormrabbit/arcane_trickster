# dva.start

在我看来 dva 的 index.js 里做了三件事：

1. 使用 call 给 dva-core 实例化的 app 的 start 方法增加了一些新功能（或者说，实现了代理模式）。
2. 使用 react-redux 完成了 react 到 redux 的连接。
3. 添加了 router 的中间件。

翻翻 dva 的 package.json ，确实也证明了这一点：

```
"dependencies": {
    "babel-runtime": "^6.26.0",
    "dva-core": "^1.1.0",
    "global": "^4.3.2",
    "history": "^4.6.3",
    "invariant": "^2.2.2",
    "isomorphic-fetch": "^2.2.1",
    "react-async-component": "^1.0.0-beta.3",
    "react-redux": "^5.0.5",
    "react-router-dom": "^4.1.2",
    "react-router-redux": "5.0.0-alpha.8",
    "redux": "^3.7.2"
  },
```

### 使用 call 给实现代理模式

dva 里实现 start 代理模式的步骤如下：

1. 新建 function ，函数内实例化一个 app 对象。
2. 新建变量指向该对象希望代理的方法， `oldStart = app.start`。
3. 新建同名方法 start，在其中使用 call，指定 oldStart 的调用者为 app。
4. 令 app.start = start。

这么做的好处是，在正确调用 app.start() 的同时，又增加了新的功能。 

不管 dva-core 的 start 做了什么（其实是实例化了 store 和 saga 对象)，先看看增加了什么功能。

```
 function start(container) {
    // 允许 container 是字符串，然后用 querySelector 找元素
    if (isString(container)) {
      container = document.querySelector(container);
      invariant(
        container,
        `[app.start] container ${container} not found`,
      );
    }

    // 并且是 HTMLElement
    invariant(
      !container || isHTMLElement(container),
      `[app.start] container should be HTMLElement`,
    );

    // 路由必须提前注册
    invariant(
      app._router,
      `[app.start] router must be registered before app.start()`,
    );

    oldAppStart.call(app);
    const store = app._store;

    // export _getProvider for HMR
    // ref: https://github.com/dvajs/dva/issues/469
    app._getProvider = getProvider.bind(null, store, app);

    // If has container, render; else, return react component
    if (container) {
      render(container, store, app, app._router);
      app._plugin.apply('onHmr')(render.bind(null, container, store, app));
    } else {
      return getProvider(store, this, this._router);
    }
  }
}
```

dva 项目的 index 里写到 : app.start('#root')。

为什么是 '#root' ？

因为 start 方法拿取字符串去查询了网页的 dom 元素，查到 root 的时候就获得此 dom 作为容器。

然后实例化并拿到 redux 的 store 对象：

    oldAppStart.call(app);
    const store = app._store;

如果成功拿到 container，那么以 container 所在的元素为容器，创建一个 redux-react 的**高阶对象**
如果没传值，则直接返回一个 redux-react 的**高阶对象**


