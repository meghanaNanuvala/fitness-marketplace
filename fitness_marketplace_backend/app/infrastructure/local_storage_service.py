from app.domain.services import StorageService
from typing import Sequence
from pathlib import Path
import os, uuid
from app.config import settings

class LocalStorageService(StorageService):
    def __init__(self):
        self.base = Path(settings.UPLOAD_DIR)
        self.base.mkdir(parents=True, exist_ok=True)
        self.public_prefix = settings.PUBLIC_PREFIX

    async def save_files(self, files: Sequence[bytes], names: Sequence[str]) -> list[str]:
        urls: list[str] = []
        for raw, name in zip(files, names):
            ext = os.path.splitext(name or "")[1].lower()
            out_name = f"{uuid.uuid4().hex}{ext}"
            (self.base / out_name).write_bytes(raw)
            urls.append(f"{self.public_prefix}/{out_name}")
        return urls
