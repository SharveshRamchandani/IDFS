from .crud_user import create, authenticate, get_by_email, get_password_hash
# We are currently using direct function imports in crud_user.py, 
# but the auth module expects crud.crud_user to be an object/module.
# We will expose the crud_user module itself.

from . import crud_user
from . import crud_sales
