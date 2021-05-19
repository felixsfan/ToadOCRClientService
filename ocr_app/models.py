from django.db import models


# Create your models here.

class UserInfo(models.Model):
    usertel = models.CharField(max_length=32, primary_key=True)
    password = models.CharField(max_length=32)
    date = models.CharField(max_length=128)


class AppInfo(models.Model):
    usertel = models.CharField(max_length=32, primary_key=True)
    AppName = models.CharField(max_length=128)
    appid = models.CharField(max_length=128)
    appsecret = models.CharField(max_length=128)
