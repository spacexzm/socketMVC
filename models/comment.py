from models import Model
from models.user import User
# from models.weibo import Weibo


class Comment(Model):
    """
    评论类
    """
    def __init__(self, form, user_id=-1):
        super().__init__(form)
        self.content = form.get('content', '')
        # 和别的数据关联的方式, 用 user_id 表明拥有它的 user 实例
        self.user_id = form.get('user_id', user_id)
        self.weibo_id = int(form.get('weibo_id', -1))

    def user(self):
        u = User.find_by(id=self.user_id)
        return u

    # def weibo(self):
    #     from models.weibo import Weibo
    #     w = Weibo.find_by(id=self.weibo_id)
    # return w
