// WEIBO API
// 获取所有 WEIBO
var apiWeiboAll = function(callback) {
    var path = '/api/weibo/all'
    ajax('GET', path, '', callback)
}

// weibo-add
var apiWeiboAdd = function(form, callback) {
    var path = '/api/weibo/add'
    ajax('POST', path, form, callback)
}

// weibo-delete
var apiWeiboDelete = function(weibo_id, callback) {
    var path = `/api/weibo/delete?id=${weibo_id}`
    ajax('GET', path, '', callback)
}

// weibo-update
var apiWeiboUpdate = function(form, callback) {
    var path = '/api/weibo/update'
    ajax('POST', path, form, callback)
}

// weibo-comment-add
var apiWeiboCommentAdd = function(form, callback) {
    var path = '/api/weibo/comment/add'
    ajax('POST', path, form, callback)
}

// weibo-comment-delete
var apiWeiboCommentDelete = function(comment_id, callback) {
    var path = `/api/weibo/comment/delete?id=${comment_id}`
    ajax('GET', path, '', callback)
}

// weibo-comment-update
var apiWeiboCommentUpdate = function(form, callback) {
    var path = '/api/weibo/comment/update'
    ajax('POST', path, form, callback)
}

// weibo数据模版
var weiboTemplate = function(user, weibo, weiboComments='') {
    if (weibo.username) {
        weiboUserName = weibo.username
    } else {
        weiboUserName = user.username
    }
    var t = `
    <div class="weibo-cell" data-id="${weibo.id}">
        <span class="weibo-content">${weibo.content}</span> from ${weiboUserName}
        <button class="weibo-delete">删除</button>
        <button class="weibo-edit">修改</button>
        <br><br>
        ${weiboComments}
        <div id="id-comment-form">
            <input id="id-input-comment">
            <br>
            <button class="button-addComment">添加评论</button>
        </div>
        <br>
    </div>
    `
    return t
}

// weibo update 模版
var weiboUpdateTemplate = function(content) {
    var t = `
        <div class="weibo-update-form">
            <input class="weibo-update-content" value="${content}">
            <button class="weibo-update">更新</button>
        </div>
    `
    return t
}

// weibo comment update 模版
var weiboCommentUpdateTemplate = function(content) {
    var t = `
        <div class="comment-update-form">
            <input class="comment-update-content" value="${content}">
            <button class="comment-update">更新</button>
        </div>
    `
    return t
}

// weibo comment 模版
var weiboCommentTemplate = function(user, comment) {
    if (comment.username) {
        commentName = comment.username
    } else {
        commentName = user.username
    }
    var t = `
    <div class="comment-cell" data-id="${comment.id}">
        ${commentName} : <span class="comment-content">${comment.content}</span>
        <button class="comment-delete">删除</button>
        <button class="comment-edit">修改</button>        
    </div>
    `
    return t
}

//微博数据渲染
var insertWeibo = function(user, weibo) {
    var comments = weibo.comments
    var weiboComments = insertWeiboComment(user, comments)
    var weiboCell = weiboTemplate(user, weibo, weiboComments)
    var weiboList = e('#id-weibo-list')
    weiboList.insertAdjacentHTML('beforeend', weiboCell)
}

//微博评论渲染
var insertWeiboComment = function(user, comments) {
    var weiboComments = ''
    if (comments) {
        for(var i = 0; i < comments.length; i++) {
            var comment = comments[i]
            weiboComments += weiboCommentTemplate(user, comment)
        }
        return weiboComments
    } else {
        return ''
    }
}


var insertUpdateForm = function(content, weiboCell) {
    var weiboUpdateForm = weiboUpdateTemplate(content)
    weiboCell.insertAdjacentHTML('beforeend', weiboUpdateForm)
}


var insertUpdateCommentForm = function(content, commentCell) {
    var commentUpdateForm = weiboCommentUpdateTemplate(content)
    commentCell.insertAdjacentHTML('beforeend', commentUpdateForm)
}


var loadWeibos = function() {
    apiWeiboAll(function(weibos) {
        log('load all weibos', weibos)
        user = weibos[0]
        for(var i = 1; i < weibos.length; i++) {
            var weibo = weibos[i]
            log('weibo is:', weibo)
            insertWeibo(user, weibo)
        }
    })
}


var bindEventWeiboAdd = function() {
    var b = e('#id-button-add')
    b.addEventListener('click', function(){
        var input = e('#id-input-weibo')
        var content = input.value
        log('click add', content)
        var form = {
            content: content,
        }
        apiWeiboAdd(form, function(weibo) {
            user = weibo[0]
            w = weibo[1]
            insertWeibo(user, w)
        })
    })
}


var bindEventWeiboDelete = function() {
    var weiboList = e('#id-weibo-list')
    weiboList.addEventListener('click', function(event) {
        log(event)
        var self = event.target
        log('被点击的元素', self)
        log(self.classList)
        if (self.classList.contains('weibo-delete')) {
            var weiboId = self.parentElement.dataset['id']
            log(weiboId)
            apiWeiboDelete(weiboId, function(r) {
                log('apiWeiboDelete', r.message)
                // 删除 self 的父节点
                if (r.status == 210) {
                    self.parentElement.remove()
                }
                alert(r.message)
            })
        } else {
            log('点到了 weibo cell')
        }
    })
}


var bindEventWeiboEdit = function() {
    var weiboList = e('#id-weibo-list')
    weiboList.addEventListener('click', function(event) {
        log(event)
        var self = event.target
        log('被点击的元素', self)
        log(self.classList)
        if (self.classList.contains('weibo-edit')) {
            log('点到了编辑按钮')
            var weiboCell = self.closest('.weibo-cell')
            var weiboId = weiboCell.dataset['id']
            var weiboSpan = e('.weibo-content', weiboCell)
            var content = weiboSpan.innerText
            log('weibo edit', weiboId, content)
            insertUpdateForm(content, weiboCell)
        } else {
            log('点到了 weibo cell')
        }
    })
}


var bindEventWeiboUpdate = function() {
    var weiboList = e('#id-weibo-list')
    weiboList.addEventListener('click', function(event) {
        log(event)
        var self = event.target
        log('被点击的元素', self)
        log(self.classList)
        if (self.classList.contains('weibo-update')) {
            log('点到了更新按钮')
            var weiboCell = self.closest('.weibo-cell')
            var weiboId = weiboCell.dataset['id']
            var weiboInput = e('.weibo-update-content', weiboCell)
            var content = weiboInput.value
            log('weibo update', weiboId, content)
            var form = {
                id: weiboId,
                content: content,
            }

            apiWeiboUpdate(form, function(weibo) {
                log('apiWeiboUpdate', weibo)
                if (weibo.status != 410) {
                    var weiboSpan = e('.weibo-content', weiboCell)
                    weiboSpan.innerText = weibo.content
                }
                var updateForm = e('.weibo-update-form', weiboCell)
                updateForm.remove()
                alert(weibo.message)
            })
        } else {
            log('点到了 weibo cell')
        }
    })
}


var bindEventWeiboCommentAdd = function() {
    var weiboList = e('#id-weibo-list')
    weiboList.addEventListener('click', function(event) {
        log(event)
        var self = event.target
        log('被点击的元素', self)
        log(self.classList)
        if(self.classList.contains('button-addComment')) {
            log('点到了添加评论按钮')
            var weiboCell = self.closest('.weibo-cell')
            var weiboId = weiboCell.dataset['id']
            var weiboCommentAdd = e('#id-input-comment', weiboCell)
            var content = weiboCommentAdd.value
            var form = {
                weibo_id: weiboId,
                content: content,
            }
            apiWeiboCommentAdd(form, function(weibo) {
                user = weibo[0]
                w = [weibo[1]]
                var t = insertWeiboComment(user, w)
                var commentFrom = self.parentElement
                commentFrom.insertAdjacentHTML('beforeBegin', t)
            })

        }
    })
}


var bindEventWeiboCommentDelete = function() {
    var weiboList = e('#id-weibo-list')
    weiboList.addEventListener('click', function(event) {
        log(event)
        var self = event.target
        log('被点击的元素', self)
        log(self.classList)
        if(self.classList.contains('comment-delete')) {
            log('点到了添加评论按钮')
            var commentCell = self.closest('.comment-cell')
            var commentId = commentCell.dataset['id']
            apiWeiboCommentDelete(commentId, function(r) {
                log('apiWeiboCommentDelete', r.message)
                // 删除 self 的父节点
                if (r.status == 210) {
                    commentCell.remove()
                }
                alert(r.message)
            })
        }
    })
}


var bindEventWeiboCommentEdit = function() {
    var weiboList = e('#id-weibo-list')
    weiboList.addEventListener('click', function(event) {
        log(event)
        var self = event.target
        log('被点击的元素', self)
        log(self.classList)
        if (self.classList.contains('comment-edit')) {
            log('点到了编辑按钮')
            var commentCell = self.closest('.comment-cell')
            var commentId = commentCell.dataset['id']
            var commentSpan = e('.comment-content', commentCell)
            var content = commentSpan.innerText
            log('weibo edit', commentId, content)
            insertUpdateCommentForm(content, commentCell)
        } else {
            log('点到了 weibo cell')
        }
    })
}


var bindEventWeiboCommentUpdate = function() {
    var weiboList = e('#id-weibo-list')
    weiboList.addEventListener('click', function(event) {
        log(event)
        var self = event.target
        log('被点击的元素', self)
        log(self.classList)
        if (self.classList.contains('comment-update')) {
            log('点到了更新按钮')
            var commentCell = self.closest('.comment-cell')
            var commentId = commentCell.dataset['id']
            var commentInput = e('.comment-update-content', commentCell)
            var content = commentInput.value
            log('comment update', commentId, content)
            var form = {
                id: commentId,
                content: content,
            }

            apiWeiboCommentUpdate(form, function(comment) {
                log('apiWeiboUpdate', comment)
                if (comment.status != 410) {
                    var commentSpan = e('.comment-content', commentCell)
                    commentSpan.innerText = comment.content
                }
                var updateForm = e('.comment-update-form', commentCell)
                updateForm.remove()
                alert(comment.message)

            })
        } else {
            log('点到了 weibo cell')
        }
    })
}


var bindEvents = function() {
    bindEventWeiboAdd()
    bindEventWeiboDelete()
    bindEventWeiboEdit()
    bindEventWeiboUpdate()
    bindEventWeiboCommentAdd()
    bindEventWeiboCommentEdit()
    bindEventWeiboCommentDelete()
    bindEventWeiboCommentUpdate()

}


var __main = function() {
    bindEvents()
    loadWeibos()
}


__main()