from utils import log
from routes import json_response, current_user
from models.weibo import Weibo
from models.user import User
from models.comment import Comment

# 本文件只返回 json 格式的数据
# 而不是 html 格式的数据
def all(request):
    user = current_user(request)
    # log('user is',u, 'user type is', type(u))
    u = dict(
        id=user.id,
        username=user.username,
    )
    weibos = Weibo.all_json()
    for weibo in weibos:
        weibo['username'] = User.find_by(id=weibo['user_id']).username
        comments = Comment.find_all(weibo_id=weibo['id'])
        cms = []
        for m in comments:
            m.username = m.user().username
            cms.append(m.json())
        weibo['comments'] = cms
    weibos.insert(0, u)
    log('weibo with comments', weibos)
    return json_response(weibos)


def add(request):
    # 得到浏览器发送的表单, 浏览器用 ajax 发送 json 格式的数据过来
    # 所以这里我们用新增加的 json 函数来获取格式化后的 json 数据
    form = request.json()
    # 创建一个 todo
    user = current_user(request)
    u = dict(
        id=user.id,
        username=user.username,
    )
    w = Weibo.add(form, user.id)
    log('whats w in json', w.json())
    weibo = [u, w.json()]
    # 把创建好的 todo 返回给浏览器
    return json_response(weibo)


def delete(request):
    weibo_id = int(request.query['id'])
    Weibo.delete(weibo_id)
    comments = Comment.find_all(weibo_id = weibo_id)
    for comment in comments:
        Comment.delete(comment.id)
    d = dict(
        status=210,
        message="成功删除 weibo"
    )
    return json_response(d)


def update(request):
    form = request.json()
    weibo_id = int(form['id'])
    content = form['content']
    w = Weibo.update(weibo_id, content=content)
    return json_response(w.json())


def comment_add(request):
    form = request.json()
    user = current_user(request)
    c = Comment(form)
    c.user_id = user.id
    c.save()
    u = dict(
        id = user.id,
        username = user.username,
    )
    weibo = [u, c.json()]
    return json_response(weibo)


def comment_delete(request):
    comment_id = int(request.query['weibo_id'])
    Comment.delete(comment_id)
    d = dict(
        status=210,
        message="成功删除 weiboComment",
    )
    return json_response(d)

def comment_update(request):
    form = request.json()
    comment_id = int(form['id'])
    content = form['content']
    w = Comment.update(comment_id, content=content)
    return json_response(w.json())


def weibo_owner_required(api_function):

    def f(request):
        if 'id' in request.query:
            weibo_id = int(request.query['id'])
        else:
            form = request.json()
            weibo_id = int(form['id'])
        weibo = Weibo.find_by(id=weibo_id)
        u = current_user(request)

        if u.id == weibo.user_id:
            return api_function(request)
        else:
            d = dict(
                status=410,
                message="权限不足，请求无法执行",
            )
            return json_response(d)
    return f


def comment_owner_required(api_function):

    def f(request):
        if 'id' in request.query:
            comment_id = int(request.query['id'])
        else:
            form = request.json()
            comment_id = int(form['id'])
        comment = Comment.find_by(id=comment_id)
        u = current_user(request)

        if u.id == comment.user_id:
            return api_function(request)
        else:
            d = dict(
                status=410,
                message="权限不足，请求无法执行"
            )
            return json_response(d)
    return f


def route_dict():
    d = {
        '/api/weibo/all': all,
        '/api/weibo/add': add,
        '/api/weibo/delete': weibo_owner_required(delete),
        '/api/weibo/update': weibo_owner_required(update),
        '/api/weibo/comment/add': comment_add,
        '/api/weibo/comment/delete': comment_owner_required(comment_delete),
        '/api/weibo/comment/update': comment_owner_required(comment_update),
    }
    return d
