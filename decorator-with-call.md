# 使用 call 实现装饰模式

>装饰模式：增加一个修饰类包裹原来的类，包裹的方式一般是通过在将原来的对象作为修饰类的构造函数的参数。

在看 dva 的源码时，很不理解为什么要用 call、apply 以及 bind，尤其是对一段代码懵逼又懵逼。

```
 const oldAppStart = app.start;
  // ... 其他代码
  app.start = start;
  return app;

  function start(container) {
    // ...其他业务代码
    oldAppStart.call(app);
    // ...其他业务代码
    }
```

懵了好几天，不知道要干嘛。

自己写了一段代码实现了一下，明白了。

```
const app = {
  start: function () {
    console.log('start');
    this.end();
  },
  end: function () {
    console.log('end')
  }
}

const app2 = {

}
const oldAppStart = app.start;

const start = () => {
  console.log('start2');
  oldAppStart.call(app);
}

app.start = start;


// oldAppStart.call(app2)

app.start()
```

运行以后结果:

```
start
end
start2
```

通过这种写法保证原始 app 的 start 方法之余也给其添加了新的功能。

但是 es6 中可以通过继承的方法来扩展原始类，实现装饰器模式：

```
class Test {

  constructor() {
    this.temp = 'hello, world';
  }

  say() {
    console.log(this.temp);
  }

}

export {
  Test
};
```
```
import Test from './classTest';
class Test2 extends Test {
  constructor() {
    super()
  }

  say() {
    super.say();
    console.log('fuck you, world!');
  }

}

export default Test2;
```
```
import {Test2} from '../src/classTest2';

const t2 = new Test2();

t2.say();
```
