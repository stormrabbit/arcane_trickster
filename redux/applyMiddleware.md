# redux 源码挖矿记：中间件的写法与排列顺序研究

## 设计模式与 redux 中间件

中间件是代理/装饰模式的一种的表现形式，通过改造 store.dispatch 方法，可以拦截 action（代理）或添加额外功能（装饰）。

> 突然发现 Javascript 里的代理/装饰模式的写法蛮通用的....

对于创建的 store 对象，如果希望代理/装饰 dispatch 函数，写法遵循如下格式：

```
const applyMyMiddlware = (store) => {
  // 1. 新建一个变量指向 store.dispatch

  const oldDispatch = store.dispatch;
  // 2. 新建 dispach，接收参数为 action

  const dispatch = (action) => {
    // 3. 编写额外逻辑
    /* 
      ........
    */
    // 3.1 所谓的代理就是拦截参数 action，根据 action 来进行自己的操作
    // 3.2 所谓的装饰就是不拦截 action，但是在这之前进行自己的逻辑处理
    // 3.3 注意对象中 this（如果有） 的指向问题

    // 4. 在 dispach 内部执行 oldDispatch，并返回。
    // 4.1 dispatch 是有返回值的，返回值类型是 action
    return oldDispatch(action);
  };
  //5 令 store.dispatch 指向新的 dispatch ，返回新的 store

  store.dispatch = dispatch;

  return store
  // 或者也可以这样写
  //  returen {
  //    ...store,
  //    dispatch
  //  } 
}

```

执行 `store = applyMyMiddlware(store)` 后， 调用 store.dispatch(action) 的结果便为代理/装饰后的结果。

## applyMiddleware 源码研究

当然，正常添加中间件的时候不会这么写。redux 提供了 applyMiddleware，同时规定了中间件的写法必须是：

```
({dispatch, getState}) => next => action => {
  // .... 中间件自己的逻辑

  return next(action);
}
```

> 直到看源码之前，我只是单纯的记住了这么一长串的多重调用，并不理解为什么。

```
import compose from './compose'

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

分析一下 applyMiddleware 的源码的：

1. 首先用传入的 createStore 方法创建了 store 对象。此时 store 中有 store.dispatch 以及 store.getState 方法（subscribe 暂时不考虑）。

2. 初始化了一个 dispatch，但是中间塞了一个断言。如果直接调用，就会报错。

3. 定义了一个 chain 数组和

```
  const middlewareAPI = {
    getState: store.getState,
    dispatch: (...args) => dispatch(...args)
  }
```
将 store 原本的 getState 方法和 dispatch 方法传入

4. 通过 map 函数，把每个中间件执行了一遍，传入的参数就是 middlewareAPI。

```
 chain = middlewares.map(middleware => middleware(middlewareAPI))
```

4.1 对于一个中间件：

```
const middleware = ({dispatch, getState}) => next => action => {
  // .... 中间件自己的逻辑

  return next(action);
}
```
第一个参数 {dispatch, getState} 显然是 (middlewareAPI)，返回值为 

```
 next => action => {
  // .... 中间件自己的逻辑

  return next(action);
} 
```

这么调用的好处是，在返回值（也是个函数）内部依然可以调用到 store.getState 方法（暂时没理解一个单纯的断言 dispatch 的作用）~~~闭包~~~。


4.2

根据 4.1 的理论，chain 数组里面是
```
[
  next => action => {
    // .... 中间件自己的逻辑

    return next(action);
  },
  next => action => {
    // .... 中间件自己的逻辑

    return next(action);
  } 
  // ...其他中间件
]
```
这么一种形式。

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

对于 `dispatch = compose(...chain)(store.dispatch)`，如果 chian 的长度是 0（也就是未传入中间件），等价于 dispatch = (args=> args)(store.dispatch) ，即 dispatch = store.dispatch (args => args 的函数执行结果为参数自身)


记作 dispatch = store.dispatch  
dispatch(action) === store.dispatch(action)

如果 chian 的长度为 1，也就是说为 [
  next => action => {
  console.log('1号中间件')
  next(action)
  }];

令 temp0 = next => action => next(action);

compose(...chain)(store.dispatch) 等同于 temp0(next = store.disptach)，因为参数 next 的地址指向了 store.dispatch 的地址，next(action) 便等同于 store.dispatch(action)。此时新声明的 disptach 

dispatch =  action => {
  console.log('1号中间件')
   store.dispatch(action);
}



即对 action 做一些操作后，继续把这个 action 交给 store.dispatch 去处理，进而改变 store 的值。

那么当 chian 的长度 > 1 的时候，就要好好分析了。

令 chian = [next => action => {
    console.log('0 号中间件');
    next(action);
  }
  , next=> actionB => {
    console.log('1 号中间件')
    next(actionB);
  }] 只有 2 个元素的情况下

查看 compose 的执行。

`funcs.reduce((a, b) => (...args) => a(b(...args)))`

因为没有初始值，所以 a b 为最开始的两个元素，即 compose(...chian) = (...args) => a(b(...args)));

因为 b 为

```
next=> action => {
    console.log('1 号中间件')
    next(action);
  }
```

所以 b(...args) 的执行结果为
```
action => {
    console.log('1 号中间件')
    (...args)(action);
  }
```



因为 b = next => actionB  => next(actionB)，所以 b(...args) 就等同于 actionB => ...args(actionB)

<!-- 令 tempb = b(...args); -->

又因为 a 的值为 
```
next => action => {
    console.log('0 号中间件');
    next(action);
  }
```

 a(b(...args)) 就等同于

```
action => {
  console.log('0 号中间件');
  (action => {
    console.log('1 号中间件')
    (...args)(action);
  })(action)
}

```

即 compose(...chian) 的返回值为

```  
...args =>
  action => {
    console.log('0 号中间件');
    temp = action => {
      console.log('1 号中间件')
      (...args)(action);
    };
    
    temp = (action);
  }

```

dispatch 等价于 compose(...chian)(store.dispatch) 等价于 
```
  action => {
    console.log('0 号中间件');
    (action => {
      console.log('1 号中间件')
      (store.dispatch)(action);
    })(action);
    
```

那么 dispatch(action) 的执行顺序是








 actionA => b(...args)(actionA)，即 actionA => (actionB => (...args)(actionB))(actionA)

 因此 compose(...chian) 等价于 (...args) => (actionA=> (actionB => (...args)(actionB))(actionA))


 compose(...chian)(store.dispatch) 等价于
(actionA=> (actionB => (store.dispatch)(actionB))(actionA))

令 dispatch = (actionA=> (actionB => (store.dispatch)(actionB))(actionA))

所以 dispatch(action) 等价于 

(actionB => (store.dispatch)(actionB))(action))

将 actionB => dispatch(action) 是做一个函数

(actionB => (store.dispatch)(actionB))(action)) 的执行结果为

store.dispatch(action)

即 最终 action 从 a b 两个元素的函数体内走了一遍之后，最后一步走到了 store.dispatch 

因此 中间件的执行顺序是数组的顺序（这也是为什么中间件的添加顺序有讲究，如果我 logger 的中间件放在最前面，那么什么日志也记录不下。

