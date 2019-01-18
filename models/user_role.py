import json
from enum import (
    Enum,
    auto,
)


class UserRole(Enum):
    guest = auto()
    normal = auto()


class XiaoEncoder(json.JSONEncoder):
    prefix = "__enum__"

    def default(self, o):
        if isinstance(o, UserRole):
            return {self.prefix: o.name}
        else:
            return super().default(o)


def xiao_decode(d):
    if XiaoEncoder.prefix in d:
        name = d[XiaoEncoder.prefix]
        return UserRole[name]
    else:
        return d
