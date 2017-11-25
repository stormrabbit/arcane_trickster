const applyMyMiddlware = (store) => {
  // 1. 新建一个变量指向 store.dispatch

  const oldDispatch = store.dispatch;
  // 2. 新建 dispach，接收参数为 action

  const dispatch = (action) => {
    // 3. 编写额外逻辑
    /* 
      ........
    */
    // 3.1 可以拦截参数 action
    // 3.2 可以添加新功能
    // 3.3 注意对象中 this（如果有） 的指向问题

    // 4. 在 dispach 内部执行 oldDispatch，并返回。
    // 4.1 dispatch 是有返回值的，返回的为当前的 action
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