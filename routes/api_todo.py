from utils import log
from routes import json_response, current_user
from models.todo import Todo


# 本文件只返回 json 格式的数据
# 而不是 html 格式的数据
def all(request):
    todos = Todo.all_json()
    log('show the type of todos', type(todos))
    return json_response(todos)


def add(request):
    # 得到浏览器发送的表单, 浏览器用 ajax 发送 json 格式的数据过来
    # 所以这里我们用新增加的 json 函数来获取格式化后的 json 数据
    form = request.json()
    # 创建一个 todo
    u = current_user(request)
    t = Todo.add(form, u.id)
    # 把创建好的 todo 返回给浏览器
    return json_response(t.json())


def delete(request):
    todo_id = int(request.query['id'])
    Todo.delete(todo_id)
    d = dict(
        message="成功删除 todo"
    )
    return json_response(d)


def update(request):
    form = request.json()
    todo_id = int(form['id'])
    title = form['title']
    t = Todo.update(todo_id, title=title)
    return json_response(t.json())


def route_dict():
    d = {
        '/api/todo/all': all,
        '/api/todo/add': add,
        '/api/todo/delete': delete,
        '/api/todo/update': update,
    }
    return d
