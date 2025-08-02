

/*复制图片*/
function saveImageToAnotherDirectory(sourcePath, targetDirectory) {
    // 读取原始图片
    let img = images.read(sourcePath);
    // 图片文件名
    let fileName = "1.jpg";
    // MediaStore初始化
    let MediaStore = android.provider.MediaStore;
    let ContentValues = android.content.ContentValues;
    let Environment = android.os.Environment;
    // 设置目标目录路径
    let relativePath = Environment.DIRECTORY_PICTURES + "/" + targetDirectory;
    // 创建内容值
    let values = new ContentValues();
    values.put(MediaStore.Images.Media.DISPLAY_NAME, fileName);
    values.put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg");
    values.put(MediaStore.Images.Media.RELATIVE_PATH, relativePath);
    // 设置 IS_PENDING 标志（Android 10+ 需要）
    values.put(MediaStore.Images.Media.IS_PENDING, new java.lang.Integer(1));
    // 获取内容解析器
    let resolver = context.getContentResolver();
    // 插入记录
    let uri = null;
    try {
        uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
    } catch (e) {
        console.error("创建 MediaStore 记录失败: " + e);
        return null;
    }
    // 写入图片数据
    try {
        let outputStream = resolver.openOutputStream(uri)
        // 直接使用 Bitmap 的 compress 方法写入
        let bitmap = img.getBitmap();
        bitmap.compress(android.graphics.Bitmap.CompressFormat.JPEG, 95, outputStream);
        outputStream.flush();
        outputStream.close();
        // 更新 IS_PENDING 标志（Android 10+ 需要）
        values.clear();
        values.put(MediaStore.Images.Media.IS_PENDING, new java.lang.Integer(0));
        resolver.update(uri, values, null, null);
        // 通知媒体库更新
        let intent = new android.content.Intent(android.content.Intent.ACTION_MEDIA_SCANNER_SCAN_FILE);
        intent.setData(uri);
        context.sendBroadcast(intent);

        return uri;
    } catch (e) {
        console.error("写入图片数据失败: " + e);
        // 删除失败的记录
        resolver.delete(uri, null, null);
        return null;
    }

}

/*模拟屏幕操作更换微信头像*/
function profileChange() {
    let sleepTime = 800;
    /*启动微信*/
    if (app.launchPackage("com.tencent.mm")) {
        console.log("启动成功");
    }
    else {
        console.log("启动失败");
    }
    sleep(sleepTime);
    // 取设备宽高
    let width = device.width;
    let height = device.height;
    console.log(width, height);

    /*进入"我的"页面*/
    click(width * 0.8, height * 0.96);
    sleep(sleepTime)

    /*进入个人资料页面*/
    click(width * 0.25, height * 0.15);
    sleep(sleepTime)
    /*进入头像选择界面*/
    click(width * 0.5, height * 0.1);
    sleep(sleepTime)
    /*进入相册选择界面*/
    click(width * 0.5, height * 0.06);
    sleep(sleepTime)

    /*选择相册*/
    // 相册在选择界面的行数,"所有图片"为0
    let numAlbum = 1
    click(width * 0.075, height * (0.0875 + (2 * numAlbum + 1) * 0.03125));
    sleep(sleepTime)

    /*选择照片*/
    // 新复制过来的图片,直接取第一张就行
    click(width * 0.125, height * 0.1);
    sleep(sleepTime)
    /*点击'确定'*/
    click(width * 0.9, height * 0.95);
    sleep(sleepTime)

    // 返回桌面
    home();

    console.log("头像更换完成")
}

/*删除图片*/
function deleteImageByUri(uri) {
    // 获取ContentResolver实例
    let resolver = context.getContentResolver();

    try {
        // 调用删除方法，返回受影响的行数
        let rows = resolver.delete(uri, null, null);
        if (rows > 0) {
            console.log("图片已删除");
        } else {
            console.log("删除失败,未找到对应图片");
        }
    } catch (e) {
        console.log("删除出错: " + e.message);
        console.error("删除异常:", e);
    }
}

/*功能实现函数*/
function mainWork(weekDay) {

    /*复制图片*/
    let sourcePath = files.join("/sdcard/Pictures/Gallery/owner/profile", weekDay + '.jpg');
    let targetDirectory = "Gallery/owner/A";
    let resultUri = saveImageToAnotherDirectory(sourcePath, targetDirectory);

    /*更换头像*/
    profileChange();

    /*删除图片*/
    sleep(800);
    deleteImageByUri(resultUri);
}



txtDir = "/sdcard/Pictures/Gallery/owner/A";

const fileName = files.listDir(txtDir)[0];
txtPath = files.join(txtDir, fileName);
fileDay = Number(fileName.split('.')[0]);

let now = new Date();
weekDay = now.getDay();

if (fileDay != weekDay) {
    mainWork(weekDay);
    files.renameWithoutExtension(txtPath, weekDay.toString());
}
else {
    console.log("头像已修改");
}



console.log("程序执行完毕");










