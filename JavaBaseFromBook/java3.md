### 集合

![java集合框架.png](https://s2.loli.net/2022/01/28/U1RTVd9QocEGwik.png)

![java集合框架2.png](https://s2.loli.net/2022/01/28/Jr5yedLiz2Yvw1R.png)

```java
1. 含义
    我理解的Java集合就是针对我们传统的"数据结构"进行的实现，是一个数据结构类库。
    Java集合类库也将"接口"（interface）与"实现"（implementtaion）分离

2. Collection接口
    集合类的基本接口是Collection接口。
    public interface Collection<E>{
    	boolean add(E element);
    	Iterator<E> iterator();
    	...
	}
	其中add方法用于向集合中添加元素，若改变了集合就返回true，若没改变就返回false。
    再其中iterator方法返回了一个实现Iterator接口的对象，使用这个迭代器对象一次访问集合中的元素。
        
	2.1 迭代器（iterator）
        public interface Iterator<E>{
        	E next();
        	boolean hasNext();
        	void remove();
        	default void forEachRemaining(Consumer<? super E> action);
    	}
        如何使用？
            反复调用next方法，可以逐个访问集合中的每个元素，若到达了集合的末尾，next方法会抛出一个"NoSuchEelementException"，因此，我们常常在调用next()方法之前，先调用hashNext()，查看是否还存在值。
        迭代方式？
            2.1.1 "while"
            	while(iter.hashNext()){
                    String current = iter.next();
                    // do something
                }
			2.1.2 "for each"
                for(String current : x){
                    // do somethiing
                }
				"for each"循环可以与任何实现了Iterable接口的对象一起工作。
            2.1.3 Java8后："forEachRemaining+lambda"
                iter.forEachRemaining(item -> // do something);
       Iterator接口的next和hashNext方法与"Enumeration接口的nextElement和hasMoreElements"方法的作用一样，但嫌弃命名太长，因此引入了Iterator                
       remove()方法将会删除上一次调用next()返回的元素（通俗来理解就是从底层集合中移除迭代器返回的最后一个元素）如：需要删除字符串集合中的第一个元素方法：
       Iterator<String> it = c.iterator();
       it.next();
       it.remove();
       其中需要注意：
          "remove()方法不能直接将调用，必须先调用next()方法；不能多次调用，必须配合每次调用next()后，才能调用remove()一次"

3. AbstractCollection类
   由于接口类Collection有很多方法，若我们手动要实现Collection接口的每一个类会是一件很烦人的事情，为了让实现者更好的实现这个接口，因此Java类库提供了一个类AbstractCollection，它将基础方法size和iterator抽象化，但是提供了很多默认的方法。
   public abstract class AbstractCollection<E> implements Collection<E>{
       // ...
   }
   因此其余的类就可以(extends)扩展AbstractCollection类，其中部分方法由AbstractCollection超类提供了，若扩展子类有更好的实现，就由子类提供。 
                                      
4. 补充
    Java中的迭代器，查找操作与位置变更是紧密相连的，查找一个元素的唯一方法就是"调用next",而在执行查找操作的同时，迭代器位置随之向前移动。
    "因此，应该将Java迭代器认为是位于两个元素之间，当调用next时，迭代器就越过下一个元素，并返回刚刚越过的那个元素的引用"                                  
```

![迭代器示意.png](https://s2.loli.net/2022/03/02/zREL1skYASjgBby.png)

![Java具体集合描述.png](https://s2.loli.net/2022/03/02/UgkuYfVHI7prsRi.png)

#### 集合框架

```java
1、所有集合类都位于java.util包下。Java的集合类主要由两个接口派生而出：Collection和Map，Collection和Map是Java集合框架的根接口，这两个接口又包含了一些子接口或实现类。

2、集合接口：6个接口（短虚线表示），表示不同集合类型，是集合框架的基础。

3、抽象类：5个抽象类（长虚线表示），对集合接口的部分实现。可扩展为自定义集合类。

4、实现类：8个实现类（实线表示），对接口的具体实现。

5、Collection 接口是一组允许重复的对象。

6、Set 接口继承 Collection，集合元素不重复。

7、List 接口继承 Collection，允许重复，维护元素插入顺序。

8、Map接口是键－值对象，与Collection接口没有什么关系。
```

![UML图例说明.png](https://s2.loli.net/2022/01/17/3BdUVtbphJYCqDy.png)

#### 迭代器 - Iterator - interface

```java
public interface Iterator<E>
    {
        E next();
        boolean hasNextO;
        void remove0;
        default void forEachRemaining(Consumer<? super E> action);
    }

迭代器，是"遍历集合"的工具，即通常我们通过Iterator来遍历结合，其中Collection依赖于Iterator，是因为Collection的实现类都要实现iterator()函数，返回一个Iterator对象。
```

#### Collection - interface - 依赖迭代器（Iterator）

```java
public interface Collection<E>
    {
        boolean add(E element);
        Iterator<E> iterator();
        ...
    }
Collection是一个接口，它包含了集合的基本操作和属性，其中下面主要有List和Set两大分支
```

##### List - interface - 继承&扩展自Collection（extends）

```java
1. List是一个有序的队列，每一个元素都有它的索引。第一个元素的索引值是0。List的实现类有LinkedList, ArrayList, Vector, Stack。
2. List有序集合中每个元素的位置十分重要，其中访问元素有2种方式：
    2.1 迭代器
    	iterator()
    	listIterator()
    2.2 使用get()和set()随机访问每个元素（但不适用于链表，却对数组很有用）
```

###### 链表 - LinkedList - 实现类

```java
1. 在Java中，所有链表都是"双向链表（doubly linked）"

2. 传统数据结构中，链表的优点就是处理“添加”“删除”时很便捷，比如数组一旦添加或者删除都是将剩余的进行移位。但缺点就是链表的取值就必须一个一个遍历去查询，而数组有下标就能快速定位。      "链表与泛型集合之间有个重要的区别，链表是一个有序集合，每个对象的位置十分重要，其中LinkedList提供的add方法是将对象添加到链表的尾部"，但常常我们需要将元素添加到链表的中间或指定位置，因此，"由于迭代器是描述集合中位置，所以这种依赖于位置的add方法将由迭代器负责，即ListIterator"
    LinkedList.add() - 添加到尾部
    listlterator.add() - 迭代位置添加

3. LinkedList.iterator()
    "iterator迭代器，提供next()一步一步遍历链表，提供hasNext()判断是否已到表尾，提供remove()来删除元素，但只能正向遍历"
   LinkedList.listIterator() 
    "listIterator迭代器，同样提供next()、remove()、hasNext()的同时，还支持previous()，hasPrevious()倒序遍历并且可以set()修改上一次遍历值"
```

###### 数组列表 - ArrayList - 实现类

```java
1. ArrayList 类， 这个类也实现了 List 接口。ArrayList 封装了一个动态再分配的对象数组。

2. 建议在不需要同步时使用 ArrayList, 而不要使用 Vector
```

##### Set - interface - 继承&扩展自Collection（extends）

```java
1. "Set是一个不允许有重复元素的集合"。Set的实现类有HastSet和TreeSet。HashSet依赖于HashMap，它实际上是通过HashMap实现的；TreeSet依赖于TreeMap，它实际上是通过TreeMap实现的。

2. Set接口有三个具体实现类，分别是散列集HashSet、链式散列集LinkedHashSet和树形集TreeSet。    
```

###### 散列集 - HashSet - 实现类

![散列表.png](https://s2.loli.net/2022/03/04/3gpSac7xyV29qNZ.png)

```java
Set<String> words = new HashSet(); // HashSet implements Set

1. 优点：可以快速查找所需对象
   缺点：无法控制元素出现的次序

2. 散列表为每个对象计算一个"整数"，称为"散列码"(hashCode)，散列码是由对象的实例域产生的一个整数，根据不通数据域的对象将产生不同的散列码。    

3. 在Java中，散列表用链表数组实现，每个列表称为"桶"(bucket), 要想查找表中对象的位置，就要计算它的散列码，然后与桶的总数取余，所得到的结果就似乎这个元素的桶的索引。比如散列码为76268，并且有128个桶（76268除以128余108）则表示对象保存可以保存在第108号桶中
 
4. 若上述的108号桶被占据了，这种现象称为"散列冲突"  
    
5. Java中提供了一个HashSet类，它实现了基于散列表的集，
    使用add添加元素；
    使用contains查看是否某个元素已经出现在集中；
    使用散列表迭代器(iterator())依次迭代访问所有桶，由于散列表分散在表的各个位置上，所以访问他们的顺序几乎是随机的；
    因此，在不关心集合中元素的顺序时才应该使用"HashSet"
```

###### 树集 - TreeSet - 实现类

```java
SortedSet<String> sorter = new TreeSet(); // TreeSet implements SortedSet

1. 树集是一个有序集合(sorted collection)，可以以任意顺序将元素插入到集合中，在对集合遍历时，每个值将自动地按照排序后的顺序呈现。

2. 将一个元素添加到树种要比添加到散列表中慢，但添加的元素是自动排序的
```

###### 队列 - Queue - interface

###### 双端队列 - Deque - interface

###### ArrayDeque - 实现类

###### 优先级队列 - PriorityQueue - 实现类

```java
1. 队列：有效的从尾部添加一个元素，在头部删除一个元素。
    
2. 双端队列：有两个端头的队列，可以有效的在头部和尾部同时添加或删除元素。
    
3. ArrayDeque<String> ad = new ArrayDeque<>();  

4. 优先级队列中的元素可以按照任意的顺序插入，却总是按照排序的顺序进行检索。内部使用了"堆"(heap)
     PriorityQueue<LocalDate> pq = new PriorityQueue<>();
```

##### Map - interface

```java
Map是一个映射接口，即key-value键值对。Map中的每一个元素包含“一个key”和“key对应的value”。AbstractMap是个抽象类，它实现了Map接口中的大部分API。而HashMap，TreeMap，WeakHashMap都是继承于AbstractMap。Hashtable虽然继承于Dictionary，但它实现了Map接口。
```

![Map实现类.png](https://s2.loli.net/2022/03/04/c1nz2bdi79HJl4S.png)

###### 散列映射 - HashMap - 实现类

```java
1. 对键进行散列

2. Map<String, String> mp = new HashMap<String, String>();
```

###### 树映射 - TreeMap - 实现类

```java
1. 对键得整体顺序对元素进行排序，并将其组织成搜索树。

2. 如何选择散列映射还是树映射，与集一样，散列稍微快一些，如果不需要按照排列顺序访问键，就最好选择散列。    
```

###### 链接映射 - LinkedHashMap - 实现类

```java
1. LinkedHashMap是HashMap的一个子类，它保留插入的顺序，如果需要输出的顺序和输入时的相同，那么就选LinkedHashMap。
    
2. 这样就可以避免在散列表中得项从表面上看是随机排列的，实际当元素插入时，就会并入到双向链表中。    
```

## 