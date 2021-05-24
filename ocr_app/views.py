import time

import requests
from django.core import serializers
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
import json

# Create your views here.
from ocr_app import models
from ocr_app.models import UserInfo, AppInfo


def hello(request):
    return render(request, "index.html")


def userregister(request):
    return render(request, "userregister.html")


def userlogin(request):
    if request.session.get('tel'):
        return render(request, "usershow.html")
    else:
        return render(request, "userlogin.html")


def register(request):
    # 反序列化
    params = json.loads(request.body)
    # 手机号
    p_num = params['p_num']
    # 密码
    password = params["password"]
    # 客户端生成的验证码
    client_vcode = params["client_vcode"]
    # client_vcode = '12345'
    # 用户填写的验证码
    user_verify_code = params["user_verify_code"]
    # 请求OCR http服务端
    url = "http://de.suvvm.work:18889/toad_ocr/application"
    data = {"p_num": p_num, "user_verify_code": user_verify_code, "client_verify_code": client_vcode}

    headers = {
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
    }
    r = requests.post(url=url, data=json.dumps(data), headers=headers)

    code = json.loads(r.text)['code']
    msg = json.loads(r.text)['msg']
    app_info = json.loads(r.text)['app_info']
    appid = app_info['id']
    appsecret = app_info['secret']
    # print(app_info)
    # print(code)
    # print(msg)
    # print(app_info)
    # 持久化到数据库
    if code == 0:

        try:
            login_date = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
            models.UserInfo.objects.create(usertel=p_num, password=password, date=login_date)
            models.AppInfo.objects.create(usertel=p_num, AppName='文字识别', appid=appid, appsecret=appsecret)
            # 设置session会话
            request.session['tel'] = p_num
            # 设置存活时间200s
            request.session.set_expiry(200)

        except ValueError as e:
            code = 1
            msg = str(e)
    res = {
        'code': code,
        'message': msg,
    }

    return HttpResponse(json.dumps(res))


def login(request):
    tel = request.POST.get('usertel')
    password = request.POST.get('password')
    UserSet = UserInfo.objects.filter(usertel=tel)

    if len(UserSet) == 0:
        # 未注册
        return render(request, "render_1.html", {"msg": "用户未注册", "code": 1})
    elif password == UserSet[0].password:
        # 认证通过
        # # 记录上次登录时间
        # models.UserInfo.objects.filter(usertel=tel).update(date=UserSet[0].date)

        # 设置session会话
        request.session['tel'] = tel
        # 设置存活时间60s
        request.session.set_expiry(60)

        return render(request, "usershow.html")
    else:
        # 密码错误
        return render(request, "render_1.html", {"msg": "密码错误", "code": 1})


def get_info(request):

    tel = request.session.get('tel')
    userset = serializers.serialize("json", UserInfo.objects.filter(usertel=tel))
    appset = serializers.serialize("json", AppInfo.objects.filter(usertel=tel))
    data = {
        'userset': userset,
        'appset': appset
    }
    login_date = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    models.UserInfo.objects.filter(usertel=tel).update(date=login_date)
    # print(login_date)
    return JsonResponse(data)
