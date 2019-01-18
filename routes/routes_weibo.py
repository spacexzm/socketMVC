from models.comment import Comment
from models.weibo import Weibo
from routes import (
    redirect,
    XiaoTemplate,
    current_user,
    html_response,
    login_required,
)
from utils import log


def index(request):
    body = XiaoTemplate.render('weibo_index.html')
    return html_response(body)


def add(request):
    """
    用于增加新 weibo 的路由函数
    """
    u = current_user(request)
    form = request.form()
    Weibo.add(form, u.id)
    # 浏览器发送数据过来被处理后, 重定向到首页
    # 浏览器在请求新首页的时候, 就能看到新增的数据了
    return redirect('/weibo/index')


def delete(request):
    weibo_id = int(request.query['id'])
    Weibo.delete(weibo_id)
    return redirect('/weibo/index')


def edit(request):
    weibo_id = int(request.query['id'])
    w = Weibo.find_by(id=weibo_id)
    body = XiaoTemplate.render('weibo_edit.html', weibo=w)
    return html_response(body)


def update(request):
    """
    用于增加新 weibo 的路由函数
    """
    form = request.form()
    weibo_id = int(form['id'])
    content = form['content']
    Weibo.update(weibo_id, content=content)
    # 浏览器发送数据过来被处理后, 重定向到首页
    # 浏览器在请求新首页的时候, 就能看到新增的数据了
    return redirect('/weibo/index')


def same_user_required(route_function):
    """
    这个函数看起来非常绕，所以你不懂也没关系
    就直接拿来复制粘贴就好了
    """

    def f(request):
        log('same_user_required')
        u = current_user(request)
        if 'id' in request.query:
            weibo_id = request.query['id']
        else:
            weibo_id = request.form()['id']
        w = Weibo.find_by(id=int(weibo_id))

        if w.user_id == u.id:
            return route_function(request)
        else:
            return redirect('/weibo/index')

    return f


def comment_add(request):
    u = current_user(request)
    form = request.form()
    weibo = Weibo.find_by(id=int(form['weibo_id']))

    c = Comment(form)
    c.user_id = u.id
    c.weibo_id = weibo.id
    c.save()
    log('comment add', c, u, form)

    return redirect('/weibo/index')


def route_dict():
    """
    路由字典
    key 是路由(路由就是 path)
    value 是路由处理函数(就是响应)
    """
    d = {
        '/weibo/add': login_required(add),
        '/weibo/delete': login_required(same_user_required(delete)),
        '/weibo/edit': login_required(same_user_required(edit)),
        '/weibo/update': login_required(same_user_required(update)),
        '/weibo/index': login_required(index),
        '/comment/add': login_required(comment_add),
    }
    return d
