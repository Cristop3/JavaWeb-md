## 2022.05.11

#### JSON

```java
1. 
json 是一种轻量级的数据交换格式。
轻量级指的是跟 xml 做比较。
数据交换指的是客户端和服务器之间业务数据的传递格式。
    
2. 定义
    json 是由键值对组成，并且由花括号（大括号）包围。每个键由引号引起来，键和值之间使用冒号进行分隔，多组键值对之间进行逗号进行分隔。
    
3. 访问
    json 本身是一个对象。
	json 中的 key 我们可以理解为是对象中的一个属性。
	json 中的 key 访问就跟访问对象的属性一样： json 对象.key
 
4. 两个常用方法
    json 的存在有两种形式。
    一种是：对象的形式存在，我们叫它 json 对象。
    一种是：字符串的形式存在，我们叫它 json 字符串。
    一般我们要操作 json 中的数据的时候，需要 json 对象的格式。
    一般我们要在客户端和服务器之间进行数据交换的时候，使用 json 字符串。
    JSON.stringify() 把 json 对象转换成为 json 字符串
    JSON.parse() 把 json 字符串转换成为 json 对象
    
5. 常用转换 (使用Gson依赖包)
    5.1 Json2Bean & Bean2Json
   	    JsonBeanTest jsonBeanTest = new JsonBeanTest(1, "javabean2Json");
        Gson gson = new Gson();
        // 转换为JSON字符串
        String s = gson.toJson(jsonBeanTest);
        System.out.println("bean2JSONString: " + s);

        // JSON字符串转换为bean对象
        JsonBeanTest json2bean = gson.fromJson(s, jsonBeanTest.getClass()); // 参数2是Class Type 针对JavaBean使用
        System.out.println("JSONString2bean: " + json2bean); 
   
	5.2 Json2List & List2Json
        // 1. 创建List对象
        List<JsonBeanTest> beanList = new ArrayList<>();
        beanList.add(new JsonBeanTest(1, "root"));
        beanList.add(new JsonBeanTest(2, "admin"));

        Gson gson = new Gson();

        // 2. 转为JSON字符串
        String s = gson.toJson(beanList);
        System.out.println("list2JsonString: " + s);

        // 3. JSON转List
        List<JsonBeanTest> beanList2 = gson.fromJson(s, new TypeToken<ArrayList<JsonBeanTest>>() {
        }.getType()); // 匿名内部类
        System.out.println("JsonString2List: " + beanList2);
        System.out.println("ListOneOf: " + beanList2.get(1));
	
	5.3 Json2Map & Map2Json
        // 1. 创建Map对象
        Map<String, JsonBeanTest> stringObjectHashMap = new HashMap<>();
        stringObjectHashMap.put("1", new JsonBeanTest(1, "li"));
        stringObjectHashMap.put("2", new JsonBeanTest(2, "da"));
        stringObjectHashMap.put("3", new JsonBeanTest(3, "ye"));

        Gson gson = new Gson();
        // map2json
        String s = gson.toJson(stringObjectHashMap);
        System.out.println("map2json: " + s);

        // json2map
        Map<String, Object> o = gson.fromJson(s, new
                TypeToken<HashMap<Integer, JsonBeanTest>>() {
                }.getType()); // 匿名内部类
        System.out.println("json2map: " + o);
        System.out.println(o.get(1));
```

#### i18n

![i18n.png](https://s2.loli.net/2022/05/11/JMO8xRlyI6XbV2P.png)
