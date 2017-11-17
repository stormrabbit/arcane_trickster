# 使用 reduce 对数组进行递归调用

dva 中有这么一类代码：

```
function prefix(obj, namespace, type) {
  return Object.keys(obj).reduce((memo, key) => {
    warning(
      key.indexOf(`${namespace}${NAMESPACE_SEP}`) !== 0,
      `[prefixNamespace]: ${type} ${key} should not be prefixed with namespace ${namespace}`,
    );
    const newKey = `${namespace}${NAMESPACE_SEP}${key}`;
    memo[newKey] = obj[key];
    return memo;
  }, {});
}

```

一开始对 reduce 方法完全不理解，总觉得用起来怪怪的。

首先说，能用 reduce 方法写的逻辑一定能用 map 或 every 方法重写，这是毫无争议的。唯一的区别就是单循环把起始变量定义在了数组外，而 reduce 把其实变量的作用域搁在了数组里。就作用域和闭包而言，后者可能更优秀。

数组的 .reduce 方法主要接收 2 个参数：一个回调，一个起始值。

reduce ( fun(), startValue)

回调函数也有 4 个参数，分别是 preValue curValue curIndex arr

其中 preValue 是上一个回调函数的执行结果，curValue 为当前数组元素，curIndex 为当前数组下角标，arr 为当前数组。

reduce 函数的逻辑比较符合递归的思路，因为每个 preValue 都是上一个函数的运行值。处理此种逻辑的时候，使用 reduce 函数要比使用 map 要来的容易理解。

比如最简单的数组阶乘，如果用 map 或者 every 函数要使用一个额外的循环外变量记录当前值:

```
  let s = 1;
  arr.map( item => {
      s = s*item;
    })
  return s;
```

使用 reduce 一个return 就可以解决：

```
return arr.reduce((pre, cur) => pre * cur, 1);
```

回到开头的代码，主要逻辑就是拿到 model 里的 reducer 和 effects，转换成了 namespace/effect 或者 namespace/reducer 的键值对保存在对象里。这样在 dispatch({type: 'namespace/reduce', payload}) 的时候，model 里的 effects 就接到了 action 来执行后面的逻辑。


