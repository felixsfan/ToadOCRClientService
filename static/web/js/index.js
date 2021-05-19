var ocrserverip = '';//定义文字地址
var sessionid = '';//定义识别服务器sessionid
var codestate = 0;
$(function() {
	$.get('../webapi/CheckLogin.php?callback=?',function(msg) {
		if(msg.status == 1) {
			$('.login-register').hide()
			$('.useracount').css({"display":"block"})
			$('#useracount1 span').html(msg.result)
		} else {
			$('.login-register').css({"display":"block"})
			$('.useracount').css({"display":"none"})
		}
	},'json');

	getSumtimes()

	$.get('../webapi/Geturl.php?callback=?',function(msg) {
		if(msg.status == 1) {
			ocrserverip = msg.result
		}
	},'json')
});

//禁用识别
function Forbiden() {
    $('.convert-button').find('div').css({"background-color":"#c7c7c7"}).unbind('click')
}

//禁用选择文件
function ForbidenChoseFile() {
    $('#file-btn').css({"background-color":"#c7c7c7"}).unbind('click',ChoseFile)
}

//启用选择文件
function UnForbidenChoseFile() {
    $('#file-btn').css({"background-color":"#0bb995"}).bind('click',ChoseFile)
}

//启用识别
function UnForbiden() {
    $('.convert-button').find('div').css({"background-color":"#0bb995"}).on('click',Fileupload)
}

//选择文件
function ChoseFile() {
	$('#fileupload').click();
}

//文件改变触发的事件
function changfile(obj) {
	if(obj != null && obj.files.length >0) {
        // console.log(obj.files[0]);
        var type=obj.files[0].type;
        var size=obj.files[0].size;
        //判断文件是否大于2M=
        if(size > 2*1048576) {
            $('.form-error').show().find('p').html('上传图片请小于2MB');
            return;
        }
        if(type != "image/jpeg" && type != "image/png" && type != "image/gif" && type != "image/bmp") {
            $('.form-error').show().find('p').html('上传图片格式暂不支持');
            return;
        }
        $('.verifycode').show();
        $('.progress').hide();
        $('.cancel').hide();
        $('.ocr-text').hide();
        getVerifyCode();
        //判断文件类型
        var filename=obj.files[0].name;
        if(filename.length <= 14) {
            $(obj).parent().find('.filename').html(filename);
        }else{
            filename=filename.substring(0,6)+'……'+filename.substring(filename.length-10,filename.length-4)+filename.substring(filename.length-4)
            $(obj).parent().find('.filename').html(filename);
        }
    }
}

//获取验证码
function getVerifyCode() {
	$('#verify-logo').hide();
	// alert(ocrserverip)
    /*$('#verifycode').attr('src',serverip+'/web1_validatecode.php?'+Math.random());*/
    $.get(ocrserverip+'ValidateCode.php?callback=?',function(msg) {
        $('#verifycode').attr('src','data:image/png;base64,'+msg.imagecode)
        sessionid = msg.sessionid;
    },'json')
}

//校验验证码
function CheckVerify(obj) {
	var code=$(obj).val();
    if(code.length ==6) {
        $.post(ocrserverip+'/VerifyCode.php?callback=?',{verifycode:code,sessionid:sessionid},function(msg) {
            if(msg.status==1) {
                $('#verify-logo').attr('src',"./images/home-icon5.png").show()
                codestate=1;
                $(obj).one("keypress",function(event){
                    if(event.keyCode == "13") {
                         Fileupload()
                    }
                })
                UnForbiden();
            }else{
                // alert(msg.status)
                $('#verify-logo').attr('src',"./images/home-icon4.png").show()
                Forbiden();
            }
        },'json')
    }else{
        if(codestate==1) {
            codestate=0;
            $('#verify-logo').attr('src',"./images/home-icon4.png").show()
            Forbiden();
        }
    }
}

//选择文件类型
$('.selected').click(function(){
    $('.chose').toggle();
}).mouseover(function(){
    $('.selected').find('i').css({"background-position":"0 100%"})
}).mouseout(function(){
    $('.selected').find('i').css({"background-position":"0 0"})
})
$('.chose').click(function(){
    $('.selected').html($(this).html()+'<i></i>');
    $('.chose').hide();
    var options=$('#downType').find('option');
    $(options).attr('selected',false);
    for(var i=0;i<options.length;i++) {
        if($(options[i]).val()==$(this).attr('title')) {
            $(options[i]).attr('selected',true);
            $("#downType").val($(options[i]).val())
        }
    }
})

//文件上传
function Fileupload() {
	var code = $('#verifyvalue').val();
    var fileObj = document.getElementById("fileupload").files; // 获取文件对象
    fileObj=fileObj[0];
    $.get('../webapi/OcrCount.php?callback=?',function(msg){
		if(msg.status == 1) {
			$('.ocrtimes').html(msg.result);
			OCRFileUpload(code);
		}
	},'json')
}

//文件开始上传
function OCRFileUpload(code) {
	$('.bar').css({width:0+'%'})
    $('.progress h3').html(0+"<span>%</span>")
    $('.cancel').show();
    $('.progress').show();
    var fileObj = document.getElementById("fileupload").files[0]; // 获取文件对象
   /* if(fileObj == undefined) {
        showError('请选择文件');return;
    }*/
    $('.verifycode').hide();
    Forbiden();
    ForbidenChoseFile();
    filename=fileObj.name;
    $('.progress').find('p').html('状态:'+filename+' - 正在上传');

    var downType=document.getElementById("downType").value

    //修改
    var downloadlogo=$('#downType option:selected').attr('title')
  	var accessid = $('#useracount1 span').html()
    var form = new FormData();
    form.append("downType", downType);
    form.append("verifycode", code);
    form.append("session_id", sessionid);
    form.append("accessid", accessid);
    form.append("image", fileObj);                           // 文件对象
    $.ajax({
        url:ocrserverip+'/WebOcr.php',
        type:'POST',
        data:form,
        dataType:'json',
        processData:false,
        contentType:false,
        crossDomain:true,
        // timeout:20000,
        //监听文件上传进度 修改进度条
        xhr:xhrOnProgress(function(evt) {
            var loaded = evt.loaded;
            var tot = evt.total;
            var per = Math.floor(100 * loaded / tot); //已经上传的百分比
            if(per == 100) {
                $('.progress').find('p').html('状态:'+filename+' - 分析中(请等待...)');
                time=setInterval("keepprogress()",1000);
            }
            
            progress_per=per/4;
            $('.bar').css({width:progress_per+'%'})
            $('.progress h3').html(progress_per+"<span>%</span>")
        }),
        success:function(msg) {
            
            progress_per=0;clearInterval(time)
            if(msg.status==1) {
                $('.progress').find('p').html('状态:'+filename+' - 已完成');
                $('.bar').css({width:'100%'})
                $('.progress h3').html("100<span>%</span>")
                $('.ocr-text').show()
                $('.ocr-text').find('img').attr('src',downloadlogo);
                $('.ocr-text').find('a').attr('href',ocrserverip+'/'+msg.downloadurl);
                $('.ocr-text').find('textarea').val(msg.result);
            }else if(msg.status==8){
                $('.progress h3').html("100<span>%</span>")
                $('.progress').find('p').html('状态:'+msg.msg);
                $('.bar').css({width:'100%'})
                $('.ocr-text').find('a').attr('href','javascript:void(0)')
            }else{
                $('.progress').find('p').html('状态:<span style="color:#fd4d4b;">'+msg.msg+'<span>-<a href="javascript:void(0)" style="color:blue" onclick="Fileupload()">点击重试<a>');
                $('.ocr-text').find('a').attr('href','javascript:void(0)')
            }
        },
        complete:function(XMLHttpRequest,status) {
            isfileupload=false;
            codestate=0;
            clearInterval(time)
            getSumtimes()
            $('.cancel').hide();
            // $('.progress').find('p').html('状态:<span style="color:#fd4d4b;">服务器暂忙,请稍后再试<span>');
        },
        error:function() {
            isfileupload=false;
            codestate=0;
            clearInterval(time)
            getSumtimes()
            $('.cancel').hide();
            $('.progress').find('p').html('状态:<span style="color:#fd4d4b;">服务器暂忙,请稍后再试</span>-<a href="javascript:void(0)" style="color:blue" onclick="Fileupload()">点击重试<a>');
        }
    })
}
//监听上传进度
var xhrOnProgress=function(fun) {
    xhrOnProgress.onprogress = fun; //绑定监听
    //使用闭包实现监听绑
    return function() {
        //通过$.ajaxSettings.xhr();获得XMLHttpRequest对象
        var xhr = $.ajaxSettings.xhr();
        //判断监听函数是否为函数
        if (typeof xhrOnProgress.onprogress !== 'function')
            return xhr;
        //如果有监听函数并且xhr对象支持绑定时就把监听函数绑定上去
        if (xhrOnProgress.onprogress && xhr.upload) {
            xhr.upload.onprogress = xhrOnProgress.onprogress;
        }
        return xhr;
    }
}
//定时任务，保持进度条继续走动直到90%
function keepprogress() {
    if(progress_per>=90) {
        $('.bar').css({width:progress_per+'%'})
        $('.progress h3').html(progress_per+"<span>%</span>")
    }else{
        var addprogress=(Math.random()*10)
        progress_per=parseInt(progress_per)+parseInt(addprogress);
        $('.bar').css({width:progress_per+'%'})
        $('.progress h3').html(progress_per+"<span>%</span>")
    }
}

function getSumtimes() {
    $.get('../webapi/OcrCount.php?callback=?',function(msg) {
        if(msg.status == 1) {
            $('.ocrtimes').html(msg.result);
            UnForbidenChoseFile();
        } else {
            // alert('sda')
            Forbiden();
            ForbidenChoseFile();
        }
    },'json')
}