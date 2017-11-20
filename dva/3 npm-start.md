# dva 爱你哟

用 dva 差不多有 3 个月了。

写了许多的模块，技术又上了一个新台阶。总的来说，算是出了新手村。虽然前路多舛，但多少是摸到门了。

工作之余，开始研究 dva 的源码。

最开始看 dva 的源码完全懵逼，看上一小段，就得自己手写实现一遍。我的 js 基础比较薄，很多东西都是会用说不清。看 dva 源码的过程也是一个重新学习的过程，提升还蛮大的。如此折腾来折腾去差不多有半个月，总算是完整的看完了一遍。

说起来 dva 真是我的福将，刚接触的时候看了一篇文章走顺了前端的任督二脉；写了一半以后又点出了代码重构的天赋，顺带搞出了一堆稀奇古怪但是颇有成效的辅助开发工具；现在为了看懂源码，又补上 js 的熟练度。

dva 真的爱你哟~

# 从 npm run start 说开去

随便哪个 dva 的项目，只要敲入 npm start 就可以运行启动。之前敲了无数次我都没有在意，直到我准备研究源码的时候才意识到：**在敲下这行命令的时候，到底发生了什么呢？**

答案要去 package.json 里去寻找。

>有位技术大牛曾经告诉过我：看源码之前，先去看 package.son 。看看项目的入口文件，翻翻它用了哪些依赖，对项目便有了大致的概念。

package.json 里 script 是这么写的：

```
 "scripts": {
    "start": "roadhog server",
    "build": "roadhog build",
    "lint": "eslint --ext .js src test"
  },
```

`roadhog` ？这是咩啊？

翻翻依赖，`"roadhog": "^0.5.2"`。


既然能在 devDependencies 找到，那么肯定也能在 [npm](https://www.npmjs.com/package/roadhog) 上找到。

原来是个和 webpack 相似的库，而且作者看着有点眼熟...

如果说 dva 是 sorrycc 的亲女儿，那 [roadhog](https://github.com/sorrycc/roadhog.git) 无疑是 dva 的亲哥哥，起的是一个模拟服务器的作用。

在 roadhog 的默认配置里有这么一条信息：

```
{
  "entry": "src/index.js",
}
```

哼哼，npm start 的命令敲下后转了一圈，启动的入口回到了 `src/index.js`。

# 寻找 “dva”

在 `index.js` 里，dva 一共做了这么几件事：

0. 从 'dva' 依赖中引入 dva ：import dva from 'dva'; 
1. 通过函数生成一个 app 对象：const app = dva(); 
2. 加载插件：app.use({});
3. 注入 model：app.model(require('./models/example'));
4. 添加路由：app.router(require('./routes/indexAnother'));
5. 启动：app.start('#root');

那么问题来了，~~挖掘技术哪家强~~这个 dva 究竟是什么呢？

答案就可以去 dva 的[源码](https://github.com/dvajs/dva)中寻找了。

> 剧透：dva 是个函数，返回一个 app 的对象。

dva 的 package.json 的 script 没有给我们太多信息，因为 `ruban build` 中的 `ruban` 显然是个私人库。不过根据惯例，`from 'dva'` 的一般都是包下的 `index.js` 文件：
```
Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = require('./lib');
exports.connect = require('react-redux').connect;
```

显然这个 `exports.default` 就是我们要找的 dva，但是源码中没有 `./lib` 文件夹。还是只能依循惯例，一般都是使用 babel 的命令是 `babel src -d libs` 进行编译，所以导出的东西应该在 `src/index.js` 文件中。

```
//src/index.js
import React from 'react';
import invariant from 'invariant';
import createHashHistory from 'history/createHashHistory';
import {
  routerMiddleware,
  routerReducer as routing,
} from 'react-router-redux';
import document from 'global/document';
import { Provider } from 'react-redux';
import * as core from 'dva-core';
import { isFunction } from 'dva-core/lib/utils';

export default function (opts = {}) {
  const history = opts.history || createHashHistory();
  const createOpts = {
    initialReducer: {
      routing,
    },
    setupMiddlewares(middlewares) {
      return [
        routerMiddleware(history),
        ...middlewares,
      ];
    },
    setupApp(app) {
      app._history = patchHistory(history);
    },
  };

  const app = core.create(opts, createOpts);
  const oldAppStart = app.start;
  app.router = router;
  app.start = start;
  return app;

  function router(router) {
    invariant(
      isFunction(router),
      `[app.router] router should be function, but got ${typeof router}`,
    );
    app._router = router;
  }

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

function isHTMLElement(node) {
  return typeof node === 'object' && node !== null && node.nodeType && node.nodeName;
}

function isString(str) {
  return typeof str === 'string';
}

function getProvider(store, app, router) {
  return extraProps => (
    <Provider store={store}>
      { router({ app, history: app._history, ...extraProps }) }
    </Provider>
  );
}

function render(container, store, app, router) {
  const ReactDOM = require('react-dom');  // eslint-disable-line
  ReactDOM.render(React.createElement(getProvider(store, app, router)), container);
}

function patchHistory(history) {
  const oldListen = history.listen;
  history.listen = (callback) => {
    callback(history.location);
    return oldListen.call(history, callback);
  };
  return history;
}
```

这边是我便用了三个月但是认识不到俩星期的 dva 了。