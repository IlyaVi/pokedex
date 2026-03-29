import threading

captured_ids: set[int] = set()
_lock = threading.Lock()
