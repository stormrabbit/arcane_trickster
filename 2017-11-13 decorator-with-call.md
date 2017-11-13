# 使用 call 实现装饰模式

>装饰模式：增加一个修饰类包裹原来的类，包裹的方式一般是通过在将原来的对象作为修饰类的构造函数的参数。

在看 dva 的源码时，一直很不理解为什么作者会各种调用 call、apply 以及 bind，尤其是对一段代码懵逼又懵逼。

```
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
```