"""add profile_picture_url

Revision ID: 36c06bca2447
Revises: 1d10ea55fe9e
Create Date: 2026-08-27 18:06:33.432

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '36c06bca2447'
down_revision: Union[str, None] = '1d10ea55fe9e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('profile_picture_url', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'profile_picture_url')
