## 2022.05.05

#### 文件下载-Servlet版

```java
1. 基于Apache的commons.io包
    
2. 步骤
    1.1 获取指定文件的MIME类型
    1.2 设置响应头告诉客户端(浏览器)Content-Type为MIME
    // 这步是否编写的基础在于若想要浏览器下载 则需要设置，若不需要下载 比如图片可以只返回流直接打开,若是excel，word等则需要设置
    1.3 设置响应头中内容处理Content-Disposition 其中
    	attachment表示"附件"
    	filename表示"附件名称"
    		其中在文件名称这里需要注意若是中文，则浏览器响应头中会出现乱码，因此需要对中文名称进行编码
    		// ie/chrome(URLEncoder解决)
    			URLEncoder.encode("中文下载名称.xls", StandardCharsets.UTF_8))
    		// firefox(需要以base64编码及固定格式解决)
    			"=?utf-8?B?"
+ new BASE64Encoder().encode("中文下载名称.xls".getBytes("utf-8")) + "?=";
             =?charset?B?xxxxx?= 现在我们对这段内容进行一下说明。
    		=? 表示编码内容的开始
    		charset 表示字符集
    		B 表示 BASE64 编码
    		xxxx 表示文件名 BASE64 编码后的内容
    		?= 表示编码内容的结束
                 
    1.4 指定文件输入流读入
    1.5 输入流赋值给输出流
                 
3. 源码
    // 1. 获取要下载的文件名及文件磁盘路径
        String downloadFileName = "中文下载名称.xls";
        String downloadFilePath = "/WEB-INF/upload/" + downloadFileName;

	// 2. 获取文件Mime及设置响应头
ServletContext servletContext = getServletContext();
	// 2.1 获取要下载的文件类型 （通过servletContext读取）
String mimeType = servletContext.getMimeType(downloadFilePath);
	// 2.2 需要设置响应头中的Content-Type告诉客户端返回的数据类型
resp.setContentType(mimeType + "charset=utf-8");
	// 2.3 设置内容描述：这步比较重要：就是为了区分到底是"直接浏览器打开显示" 还是说需要下载
	// 若是下载则需要设置Content-Disposition,其中attachment表示"附件"的意思，后面跟filename"文件名称"
resp.setHeader("Content-Disposition", "attachment; filename=" + URLEncoder.encode(downloadFileName, StandardCharsets.UTF_8));

	// 3. 读取文件输入流
InputStream resourceAsStream = servletContext.getResourceAsStream(downloadFilePath);
ServletOutputStream outputStream = resp.getOutputStream(); // 输出流
	// 使用Apache上传jar包中的方法来复制输入流到输出流
IOUtils.copy(resourceAsStream, outputStream);
```

