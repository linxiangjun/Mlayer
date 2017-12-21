# Mlayer

基于layer mobile二次开发，极简的弹层插件，适用于移动端

## 使用方法

初始化对象

`var layer = new Slayer;`

信息框

`layer.info(content, callback);`

提示（prompt）

`layer.msg(content);`

确认框

`layer.confirm(content, array, callback);`

E.G.

`layer.confirm('确定确认消息？' , [确认, 取消], callback);`

宣传弹层

`layer.adv(img, link);`

加载层

`layer.loading(content);`
