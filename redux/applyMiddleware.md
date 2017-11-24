今天和同事聊天的时候研究了以下 redux 的中间件写法以及调用方式，在捋到最后的时候遇到了一个大坑。

主要是函数的多重调用，类似于 `({dispatch, getState}) => next => action => next(action)` 的这种形式，以及为什么要这样写。

还是从代码说吧。

```
export default function applyMiddleware(...middlewares) {
  return (createStore) => (...args) => {
    const store = createStore(...args)
    let dispatch = () => {
      throw new Error(
        `Dispatching while constructing your middleware is not allowed. ` +
        `Other middleware would not be applied to this dispatch.`
      )
    }
    let chain = []

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }
    chain = middlewares.map(middleware => middleware(middlewareAPI))
    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}

``` 

首先用传入的 createStore 方法创建了 store 对象。此时 store 中有 store.dispatch 以及 store.getState 方法（subscribe 暂时不考虑）。初始化了一个 dispatch，但是中间塞了一个断言的错误。如果直接调用，就会报错。

然后定义了一个 chain 数组。
```
  const middlewareAPI = {
    getState: store.getState,
    dispatch: (...args) => dispatch(...args)
  }
```

然后通过 map 函数，把每个中间件执行了一遍，传入的参数就是 middlewareAPI。

对于一个中间件，({dispatch, getState}) => next => action => next(action)

令 const middleware = ({dispatch, getState}) => next => action => next(action)

显然， middleware(middlewareAPI) 便是  next => action => next(action)

所以 chain 里面就是 [ next => action => next(action),  next => action => next(action),  next => action => next(action)...] 这么一种形式。

然后是 compose，说实话真的挺蒙圈的。虽然我比较简单的理解了数组的 reduce 方法，但是对返回值为函数的函数还是一无所知。

贴以下 compose 函数：

```
export default function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
```
对于 `dispatch = compose(...chain)(store.dispatch)`，如果 chian 的长度是 0（也就是未传入中间件），那么返回的就是 arg => arg ，又是一个函数。

令 temp = arg => arg，那么compose(...chain)(store.dispatch) 就等同于 temp(store.dispatch)，显然此时的 dispatch 的引用指向 store.dispatch，dispatch(action) 便等同于 store.dispatch()。

记作 dispatch = store.dispatch  
dispatch(action) === store.dispatch(action)

> 通过查看源码得知，dispatch(action) 的返回值也是同一个 action。

如果 chian 的长度为 1，也就是说为 [next => action => next(action)];

令 temp0 = next => action => next(action);

compose(...chain)(store.dispatch) 等同于 temp(next = store.disptach)，此时 next 的地址指向了 store.dispatch 的地址，next(action) 便等同于 store.dispatch(action)。此时新声明的 disptach 为 (action) => store.dispatch (action)，这显然是一个新函数，dispatch 也指向一个新地址

记作 dispatch !== store.dispatch

dispatch = action => store.dispatch(action); 

即对 action 做一些操作后，继续把这个 action 交给 store.dispatch 去处理，进而改变 store 的值。

那么当 chian 的长度 > 1 的时候，就要好好分析了。

令 chian = [next=> action => next(action), next=> action => next(action)] 只有 2 个元素的情况下

查看 compose 的执行。

`funcs.reduce((a, b) => (...args) => a(b(...args)))`

因为没有初始值，所以 a b 为最开始的两个元素


因为 b = next => action  => next(action)，所以 b(...args) 就等同于 action => ...args(action)

<!-- 令 tempb = b(...args); -->

又因为 a = next => action => next(action)，所以 a(b(...args)) 就等同于

 action => b(...args)(action)

 令 comp = (...args) =>( action => (action => ...args(action)) );

 comp(store.dispath) = action => (action => store.dispath)

 令 dispatch = action => (action => store.dispatch(action))

 dispatch(action) => action=> store.dispatch(action)

(...args) =>( action => (action => ...args(action)) )

令 temp = (...args) =>( action => b(...args)(action);
compose(...chian)(store.dispatch) 等同于 temp(store.dispatch)

因此，b.

[next=> action => next(action), next=> action => next(action)]   



