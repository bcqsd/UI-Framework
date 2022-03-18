# 1

Dep数组添加watcher的时候，会不会因为watcher执行了两次get就把watcher重复添加？

不过重复添加也没问题，后续应该有清空依赖的操作，比如cb执行之后。

