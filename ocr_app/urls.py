"""ocr_server URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from ocr_app import views
from django.conf.urls import url

urlpatterns = [
    url(r'^hello/', views.hello),
    # url(r'^admin/', admin.site.urls),
    url(r'^userregister/', views.userregister),
    url(r'^userlogin/', views.userlogin),
    url(r'^register/', views.register),
    url(r'^login/', views.login),
    url(r'^get_info/', views.get_info),
]
